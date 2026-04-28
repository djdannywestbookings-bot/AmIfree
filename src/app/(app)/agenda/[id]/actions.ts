"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  requireWorkspace,
  updateBooking,
  deleteBooking,
  detectConflicts,
  summarizeBooking,
  createVenue,
} from "@/server/services";
import { BOOKING_STATUSES } from "@/modules/bookings";

async function resolveVenueIdFromForm(
  workspace: { id: string },
  venueId: string | undefined,
  newVenueName: string | undefined,
  newVenueAddress: string | undefined,
): Promise<string | null> {
  if (venueId && venueId.length > 0) return venueId;
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

export type EditResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      conflicts?: { hard: string[]; possible: string[] };
    };

const editSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Title is required").max(200),
  status: z.enum(BOOKING_STATUSES).default("inquiry"),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  all_day: z.string().optional(),
  venue_id: z.string().optional(),
  new_venue_name: z.string().optional(),
  new_venue_address: z.string().optional(),
  assigned_employee_id: z.string().optional(),
  location: z.string().optional(),
  pay: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateBookingAction(
  formData: FormData,
): Promise<EditResult> {
  const workspace = await requireWorkspace();

  const getOrUndef = (k: string) => formData.get(k) ?? undefined;
  const parsed = editSchema.safeParse({
    id: getOrUndef("id"),
    title: getOrUndef("title"),
    status: getOrUndef("status") ?? "inquiry",
    start_at: getOrUndef("start_at"),
    end_at: getOrUndef("end_at"),
    all_day: getOrUndef("all_day"),
    venue_id: getOrUndef("venue_id"),
    new_venue_name: getOrUndef("new_venue_name"),
    new_venue_address: getOrUndef("new_venue_address"),
    assigned_employee_id: getOrUndef("assigned_employee_id"),
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

  const start = parsed.data.start_at ? new Date(parsed.data.start_at) : null;
  const end = parsed.data.end_at ? new Date(parsed.data.end_at) : null;
  if (start && end && end <= start) {
    return { ok: false, error: "End time must be after start time." };
  }

  // Conflict pre-check, excluding the booking being edited from the
  // overlap candidates (so editing a booking's time doesn't conflict
  // with its own pre-edit row).
  const conflicts = await detectConflicts(workspace, {
    id: parsed.data.id,
    status: parsed.data.status,
    start_at: parsed.data.start_at || null,
    end_at: parsed.data.end_at || null,
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

  const venueId = await resolveVenueIdFromForm(
    workspace,
    parsed.data.venue_id,
    parsed.data.new_venue_name,
    parsed.data.new_venue_address,
  );

  try {
    await updateBooking(workspace, parsed.data.id, {
      venue_id: venueId,
      assigned_employee_id:
        parsed.data.assigned_employee_id && parsed.data.assigned_employee_id.length > 0
          ? parsed.data.assigned_employee_id
          : null,
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
  revalidatePath(`/agenda/${parsed.data.id}`);
  // Land on the read-only detail view so the user sees the saved
  // changes immediately. They can hit Edit again or go back to the
  // schedule list from there.
  redirect(`/agenda/${parsed.data.id}`);
}

const deleteSchema = z.object({ id: z.string().uuid() });

export async function deleteFromEditAction(
  formData: FormData,
): Promise<void> {
  const workspace = await requireWorkspace();
  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    throw new Error("Invalid booking id.");
  }
  await deleteBooking(workspace, parsed.data.id);
  revalidatePath("/agenda");
  redirect("/agenda");
}
