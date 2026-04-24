"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspace, createBooking, updateBooking, deleteBooking } from "@/server/services";
import { BOOKING_STATUSES } from "@/modules/bookings";

export type AgendaResult = { ok: true } | { ok: false; error: string };

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

  try {
    await createBooking(workspace, {
      title: parsed.data.title,
      status: parsed.data.status,
      start_at: parsed.data.start_at,
      end_at: parsed.data.end_at,
      all_day: parsed.data.all_day ?? false,
      location: parsed.data.location,
      pay: parsed.data.pay,
      notes: parsed.data.notes,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }

  revalidatePath("/agenda");
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
