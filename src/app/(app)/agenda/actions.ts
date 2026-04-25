"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  requireWorkspace,
  createBooking,
  updateBooking,
  deleteBooking,
  detectConflicts,
  summarizeBooking,
  createVenue,
} from "@/server/services";
import { BOOKING_STATUSES } from "@/modules/bookings";

/**
 * Resolve a venue selection from a form. Returns the venue_id to use
 * on the booking, creating a new venue inline if the user picked
 * "+ Add a new venue" and filled in the name field. Returns null if
 * no venue was selected at all.
 */
async function resolveVenueIdFromForm(
  workspace: { id: string },
  venueId: string | undefined,
  newVenueName: string | undefined,
  newVenueAddress: string | undefined,
): Promise<string | null> {
  // Existing venue picked from the dropdown.
  if (venueId && venueId.length > 0) {
    return venueId;
  }
  // Inline create requested.
  const name = (newVenueName ?? "").trim();
  if (name.length > 0) {
    const created = await createVenue(workspace, {
      name,
      address: newVenueAddress && newVenueAddress.trim().length > 0
        ? newVenueAddress.trim()
        : null,
    });
    return created.id;
  }
  return null;
}

export type AgendaResult =
  | { ok: true; warnings?: string[] }
  | { ok: false; error: string; conflicts?: { hard: string[]; possible: string[] } };

// Form-input parser: coerces empty strings to nulls and combines the
// browser's datetime-local format into proper ISO strings.
const createFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  status: z.enum(BOOKING_STATUSES).default("inquiry"),
  start_at: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? new Date(v).toISOString() : null)),
  end_at: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? new Date(v).toISOString() : null)),
  all_day: z
    .string()
    .optional()
    .transform((v) => v === "on" || v === "true"),
  venue_id: z.string().optional(),
  new_venue_name: z.string().optional(),
  new_venue_address: z.string().optional(),
  location: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  pay: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : null)),
  notes: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export async function createBookingAction(
  formData: FormData,
): Promise<AgendaResult> {
  const workspace = await requireWorkspace();

  // FormData.get returns null for fields not in the form (e.g., the
  // expanded section fields if the user submitted before expanding).
  // Coerce null → undefined so the Zod schema treats them as missing
  // rather than as the wrong type.
  const getOrUndef = (k: string) => formData.get(k) ?? undefined;

  const parsed = createFormSchema.safeParse({
    title: getOrUndef("title"),
    status: getOrUndef("status") ?? "inquiry",
    start_at: getOrUndef("start_at"),
    end_at: getOrUndef("end_at"),
    all_day: getOrUndef("all_day"),
    venue_id: getOrUndef("venue_id"),
    new_venue_name: getOrUndef("new_venue_name"),
    new_venue_address: getOrUndef("new_venue_address"),
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

  // Extra sanity: if end is set and start isn't, or end <= start, reject.
  if (
    parsed.data.end_at &&
    parsed.data.start_at &&
    new Date(parsed.data.end_at) <= new Date(parsed.data.start_at)
  ) {
    return { ok: false, error: "End time must be after start time." };
  }

  // Conflict pre-check. Hard conflicts block the save and return the
  // list of conflicting bookings; possible conflicts proceed and are
  // surfaced as warnings on the success result.
  const conflicts = await detectConflicts(workspace, {
    status: parsed.data.status,
    start_at: parsed.data.start_at,
    end_at: parsed.data.end_at,
  });

  if (conflicts.hard.length > 0) {
    return {
      ok: false,
      error: `Hard conflict with ${conflicts.hard.length} existing booking${
        conflicts.hard.length === 1 ? "" : "s"
      }. Resolve before saving.`,
      conflicts: {
        hard: conflicts.hard.map(summarizeBooking),
        possible: conflicts.possible.map(summarizeBooking),
      },
    };
  }

  try {
    const venueId = await resolveVenueIdFromForm(
      workspace,
      parsed.data.venue_id,
      parsed.data.new_venue_name,
      parsed.data.new_venue_address,
    );

    await createBooking(workspace, {
      title: parsed.data.title,
      status: parsed.data.status,
      start_at: parsed.data.start_at,
      end_at: parsed.data.end_at,
      all_day: parsed.data.all_day ?? false,
      venue_id: venueId,
      location: parsed.data.location,
      pay: parsed.data.pay,
      notes: parsed.data.notes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }

  revalidatePath("/agenda");

  if (conflicts.possible.length > 0) {
    return {
      ok: true,
      warnings: [
        `Possible conflict with: ${conflicts.possible
          .map(summarizeBooking)
          .join("; ")}`,
      ],
    };
  }
  return { ok: true };
}

const statusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(BOOKING_STATUSES),
});

/**
 * Void-returning action — used as <form action={...}> directly. Throws
 * on validation or update error, which triggers the (app)/error.tsx
 * boundary. Phase 24C accepts this ergonomics trade-off to keep the
 * status-change control as a plain HTML form; richer inline error
 * surfacing can come when bookings need drag-to-reschedule or similar.
 */
export async function updateBookingStatusAction(
  formData: FormData,
): Promise<void> {
  const workspace = await requireWorkspace();
  const parsed = statusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    throw new Error("Invalid status change.");
  }

  await updateBooking(workspace, parsed.data.id, { status: parsed.data.status });
  revalidatePath("/agenda");
}

const deleteSchema = z.object({ id: z.string().uuid() });

export async function deleteBookingAction(formData: FormData): Promise<void> {
  const workspace = await requireWorkspace();
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    throw new Error("Invalid booking id.");
  }

  await deleteBooking(workspace, parsed.data.id);
  revalidatePath("/agenda");
}
