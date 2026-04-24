import "server-only";

import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  bookingRowSchema,
  bookingCreateInputSchema,
  bookingUpdateInputSchema,
  type BookingRow,
  type BookingCreateInput,
  type BookingUpdateInput,
} from "@/modules/bookings";
import type { WorkspaceRow } from "@/modules/auth";

/**
 * Booking service layer.
 *
 * Phase 24C — manual booking CRUD on top of the Phase 24A data layer.
 * All functions take a WorkspaceRow so the caller has already proven
 * (via requireWorkspace()) that the signed-in user is a member. The
 * server client is used for reads/writes, so RLS policies from 0002
 * enforce membership-scoped access even if a caller forgets to pass
 * the workspace.
 *
 * Intake Drafts (Phase 24+) will wrap createBooking, not replace it.
 */

/**
 * Anchor a start timestamp to a service_day per the workspace's
 * service_day_mode.
 *
 * Phase 24C implementation: treats start_at as if it were already in
 * the workspace's local time. Returns the UTC date of start_at, shifted
 * back one day if nightlife mode and hour < cutoff. Full local-timezone
 * anchoring lands in 24D along with workspace timezone support.
 *
 * Returns null when start_at is null — bookings without a time are in
 * the "Time TBD" alert state per docs/source-of-truth.md.
 */
export function anchorServiceDay(
  startAtIso: string | null,
  workspace: Pick<WorkspaceRow, "service_day_mode" | "nightlife_cutoff_hour">,
): string | null {
  if (!startAtIso) return null;
  const d = new Date(startAtIso);
  if (Number.isNaN(d.getTime())) return null;

  // UTC components — Phase 24C simplification, replace in 24D.
  let year = d.getUTCFullYear();
  let month = d.getUTCMonth();
  let day = d.getUTCDate();
  const hour = d.getUTCHours();

  if (
    workspace.service_day_mode === "nightlife" &&
    hour < workspace.nightlife_cutoff_hour
  ) {
    const shifted = new Date(Date.UTC(year, month, day - 1));
    year = shifted.getUTCFullYear();
    month = shifted.getUTCMonth();
    day = shifted.getUTCDate();
  }

  const yyyy = String(year).padStart(4, "0");
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * List bookings for a workspace. Returns newest-first by service_day
 * with Time TBD bookings (service_day is null) surfaced at the top.
 */
export async function listBookings(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<BookingRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("service_day", { ascending: false, nullsFirst: true })
    .order("start_at", { ascending: true, nullsFirst: true });

  if (error) {
    throw new Error(`Failed to list bookings: ${error.message}`);
  }

  return (data ?? []).map((row) => bookingRowSchema.parse(row));
}

/**
 * Fetch a single booking by id, scoped to the given workspace. Returns
 * null if not found — either the id doesn't exist, the booking is in a
 * different workspace, or RLS blocked the read.
 */
export async function getBookingById(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
): Promise<BookingRow | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .maybeSingle();

  return data ? bookingRowSchema.parse(data) : null;
}

/**
 * Insert a booking into the given workspace. Computes service_day from
 * start_at + workspace.service_day_mode. created_by is filled from the
 * authenticated user server-side.
 */
export async function createBooking(
  workspace: Pick<
    WorkspaceRow,
    "id" | "service_day_mode" | "nightlife_cutoff_hour"
  >,
  input: BookingCreateInput,
): Promise<BookingRow> {
  const parsed = bookingCreateInputSchema.parse(input);
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const serviceDay = anchorServiceDay(parsed.start_at ?? null, workspace);

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      workspace_id: workspace.id,
      title: parsed.title,
      status: parsed.status ?? "inquiry",
      start_at: parsed.start_at ?? null,
      end_at: parsed.end_at ?? null,
      all_day: parsed.all_day ?? false,
      service_day: serviceDay,
      location: parsed.location ?? null,
      pay: parsed.pay ?? null,
      notes: parsed.notes ?? null,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to create booking: ${error?.message ?? "no row returned"}`,
    );
  }

  return bookingRowSchema.parse(data);
}

/**
 * Update a booking. If start_at changes, service_day is recomputed from
 * the workspace's service_day_mode.
 */
export async function updateBooking(
  workspace: Pick<
    WorkspaceRow,
    "id" | "service_day_mode" | "nightlife_cutoff_hour"
  >,
  id: string,
  input: BookingUpdateInput,
): Promise<BookingRow> {
  const parsed = bookingUpdateInputSchema.parse(input);
  const supabase = await createServerClient();

  const patch: Record<string, unknown> = { ...parsed };
  // Re-anchor service_day when start_at is part of the patch.
  if (Object.prototype.hasOwnProperty.call(parsed, "start_at")) {
    patch.service_day = anchorServiceDay(parsed.start_at ?? null, workspace);
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(patch)
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to update booking: ${error?.message ?? "no row returned"}`,
    );
  }

  return bookingRowSchema.parse(data);
}

/**
 * Delete a booking. Hard delete in Phase 24C — cancelled/completed
 * bookings still live until explicitly removed. Soft-delete pattern
 * (deleted_at column) can be added later if audit needs it.
 */
export async function deleteBooking(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete booking: ${error.message}`);
  }
}
