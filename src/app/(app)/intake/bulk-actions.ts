"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  requireWorkspace,
  createBooking,
} from "@/server/services";
import {
  extractMultipleBookingsFromText,
  type BulkExtractionResult,
} from "@/server/services/extraction";
import { BOOKING_STATUSES } from "@/modules/bookings";

// ---------------------------------------------------------------------
// Bulk extract — pull MANY drafts out of one paste
// ---------------------------------------------------------------------

export type BulkExtractResponse =
  | { ok: true; result: BulkExtractionResult; rawText: string }
  | { ok: false; error: string };

const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 7 * 1024 * 1024; // 7 MB after base64 (~5 MB raw)

export async function bulkExtractAction(
  formData: FormData,
): Promise<BulkExtractResponse> {
  const workspace = await requireWorkspace();

  const text = String(formData.get("text") ?? "").trim();

  // Images come in as fields image_0, image_1, ... each holding a
  // data: URL string (base64). Capped at MAX_IMAGES to keep the
  // OpenAI request size sane.
  const images: string[] = [];
  for (let i = 0; i < MAX_IMAGES; i++) {
    const url = formData.get(`image_${i}`);
    if (typeof url !== "string" || url.length === 0) break;
    if (!url.startsWith("data:image/")) {
      return {
        ok: false,
        error: `Image ${i + 1} is not a valid image data URL.`,
      };
    }
    if (url.length > MAX_IMAGE_BYTES) {
      return {
        ok: false,
        error: `Image ${i + 1} is too large. Trim to under 5 MB.`,
      };
    }
    images.push(url);
  }

  if (text.length === 0 && images.length === 0) {
    return { ok: false, error: "Paste some text or upload at least one image." };
  }
  if (text.length > 50_000) {
    return {
      ok: false,
      error: "Text is too long. Trim to under 50,000 characters.",
    };
  }

  try {
    const result = await extractMultipleBookingsFromText(
      text,
      workspace,
      images,
    );
    return { ok: true, result, rawText: text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Bulk extraction failed: ${message}` };
  }
}

// ---------------------------------------------------------------------
// Bulk save — create N bookings, one per row
// ---------------------------------------------------------------------

const bulkRowSchema = z.object({
  title: z.string().trim().min(1).max(200),
  status: z.enum(BOOKING_STATUSES).default("inquiry"),
  start_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
  all_day: z.boolean().optional().default(false),
  location: z.string().nullable().optional(),
  pay: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const bulkSaveSchema = z.object({
  rows: z.array(bulkRowSchema).min(1, "Nothing to save."),
});

export type BulkSaveResponse = {
  ok: boolean;
  created: number;
  errors: { index: number; title: string; message: string }[];
};

export async function bulkSaveBookingsAction(
  payloadJson: string,
): Promise<BulkSaveResponse> {
  const workspace = await requireWorkspace();

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(payloadJson);
  } catch {
    return {
      ok: false,
      created: 0,
      errors: [{ index: -1, title: "(payload)", message: "Invalid JSON." }],
    };
  }

  const parsed = bulkSaveSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return {
      ok: false,
      created: 0,
      errors: [
        {
          index: -1,
          title: "(payload)",
          message:
            parsed.error.issues[0]?.message ??
            "Invalid bulk save payload.",
        },
      ],
    };
  }

  const errors: BulkSaveResponse["errors"] = [];
  let created = 0;

  // Sequential — keeps errors per-row and avoids hammering the DB.
  for (let i = 0; i < parsed.data.rows.length; i++) {
    const row = parsed.data.rows[i];

    // End must be after start when both set.
    if (row.start_at && row.end_at) {
      const start = new Date(row.start_at);
      const end = new Date(row.end_at);
      if (end <= start) {
        errors.push({
          index: i,
          title: row.title,
          message: "End time must be after start time.",
        });
        continue;
      }
    }

    try {
      await createBooking(workspace, {
        title: row.title,
        status: row.status,
        start_at: row.start_at ?? null,
        end_at: row.end_at ?? null,
        all_day: row.all_day ?? false,
        location: row.location && row.location.length > 0 ? row.location : null,
        pay: row.pay && row.pay.length > 0 ? row.pay : null,
        notes: row.notes && row.notes.length > 0 ? row.notes : null,
      });
      created++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push({ index: i, title: row.title, message });
    }
  }

  revalidatePath("/agenda");
  revalidatePath("/calendar");
  revalidatePath("/my-calendar");
  revalidatePath("/intake");
  revalidatePath("/intake/bulk");

  return {
    ok: errors.length === 0,
    created,
    errors,
  };
}
