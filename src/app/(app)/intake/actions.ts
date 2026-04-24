"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  requireWorkspace,
  createBooking,
} from "@/server/services";
import { extractBookingFromText, type ExtractionResult } from "@/server/services/extraction";
import { BOOKING_STATUSES } from "@/modules/bookings";

export type ExtractResponse =
  | { ok: true; extraction: ExtractionResult; rawText: string }
  | { ok: false; error: string };

/**
 * Server action: run booking extraction on pasted text. Never saves a
 * booking — that happens only after the user reviews and clicks Save.
 */
export async function extractFromTextAction(
  formData: FormData,
): Promise<ExtractResponse> {
  const workspace = await requireWorkspace();

  const text = String(formData.get("text") ?? "").trim();
  if (text.length === 0) {
    return { ok: false, error: "Paste some text first." };
  }
  if (text.length > 20_000) {
    return { ok: false, error: "Text is too long. Trim to < 20,000 characters." };
  }

  try {
    const extraction = await extractBookingFromText(text, workspace);
    return { ok: true, extraction, rawText: text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: `Extraction failed: ${message}` };
  }
}

// ---------------------------------------------------------------------
// Save the reviewed extraction as a real booking
// ---------------------------------------------------------------------

const saveSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  status: z.enum(BOOKING_STATUSES).default("inquiry"),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  all_day: z.string().optional(),
  location: z.string().optional(),
  pay: z.string().optional(),
  notes: z.string().optional(),
});

export async function saveExtractedBookingAction(
  formData: FormData,
): Promise<{ ok: false; error: string }> {
  const workspace = await requireWorkspace();

  const getOrUndef = (k: string) => formData.get(k) ?? undefined;
  const parsed = saveSchema.safeParse({
    title: getOrUndef("title"),
    status: getOrUndef("status") ?? "inquiry",
    start_at: getOrUndef("start_at"),
    end_at: getOrUndef("end_at"),
    all_day: getOrUndef("all_day"),
    location: getOrUndef("location"),
    pay: getOrUndef("pay"),
    notes: getOrUndef("notes"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        "Please check the form values and try again.",
    };
  }

  // Extra sanity: end must be after start if both set.
  const start = parsed.data.start_at ? new Date(parsed.data.start_at) : null;
  const end = parsed.data.end_at ? new Date(parsed.data.end_at) : null;
  if (start && end && end <= start) {
    return { ok: false, error: "End time must be after start time." };
  }

  try {
    await createBooking(workspace, {
      title: parsed.data.title,
      status: parsed.data.status,
      start_at: parsed.data.start_at || null,
      end_at: parsed.data.end_at || null,
      all_day: parsed.data.all_day === "on" || parsed.data.all_day === "true",
      location: parsed.data.location && parsed.data.location.length > 0 ? parsed.data.location : null,
      pay: parsed.data.pay && parsed.data.pay.length > 0 ? parsed.data.pay : null,
      notes: parsed.data.notes && parsed.data.notes.length > 0 ? parsed.data.notes : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }

  revalidatePath("/agenda");
  revalidatePath("/intake");
  // On success, redirect to /agenda where the new booking shows.
  redirect("/agenda");
}
