import "server-only";

import { listBookings } from "./bookings";
import {
  HARD_BLOCKING_STATUSES,
  type BookingRow,
  type BookingStatus,
} from "@/modules/bookings";
import type { WorkspaceRow } from "@/modules/auth";

/**
 * Conflict detection.
 *
 * Per docs/source-of-truth.md §Locked technical, data, and platform truths:
 *   - Hard assignment-blocking comes only from Assigned bookings, Booked
 *     bookings, and active Manual Availability Blocks.
 *   - Soft-state bookings (Inquiry, Hold, Requested) participate in
 *     possible-conflict / review logic but do not hard-block.
 *
 * Phase 27 implements bookings-vs-bookings detection only. Manual
 * Availability Blocks are not yet implemented; they'll fold into the
 * same hard-block path when they exist.
 */

export type ConflictReport = {
  /**
   * Hard conflicts: candidate AND existing booking both have status in
   * HARD_BLOCKING_STATUSES (assigned/booked) AND time ranges overlap.
   * The action layer rejects the save when this list is non-empty.
   */
  hard: BookingRow[];

  /**
   * Possible conflicts: time ranges overlap, but at least one side is
   * in a soft state (inquiry/hold/requested) so the save proceeds. The
   * UI surfaces these as warnings so the owner can review and resolve.
   */
  possible: BookingRow[];
};

export type ConflictCandidate = {
  id?: string; // present when editing — exclude this row from the check
  status: BookingStatus;
  start_at: string | null;
  end_at: string | null;
};

/**
 * Pure interval overlap. Two bookings overlap when each side's start
 * is strictly before the other side's end. Bookings with a null
 * start_at are treated as Time TBD and never overlap (until the
 * owner provides a time, the booking is in the alert state but doesn't
 * block anyone).
 *
 * When end_at is null, we treat the booking as a 60-minute placeholder
 * — long enough that touching-but-not-overlapping bookings still get
 * flagged for review without false-positive on every same-time entry.
 */
export function bookingsOverlap(
  a: ConflictCandidate | BookingRow,
  b: ConflictCandidate | BookingRow,
): boolean {
  if (!a.start_at || !b.start_at) return false;
  const aStart = new Date(a.start_at).getTime();
  const bStart = new Date(b.start_at).getTime();
  if (!Number.isFinite(aStart) || !Number.isFinite(bStart)) return false;
  const aEnd = a.end_at
    ? new Date(a.end_at).getTime()
    : aStart + 60 * 60_000;
  const bEnd = b.end_at
    ? new Date(b.end_at).getTime()
    : bStart + 60 * 60_000;
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Pure categorizer. Given a candidate and the set of existing bookings
 * in its workspace, return hard + possible conflict lists. The caller
 * passes the existing list (so the same function can serve a server
 * action that already loaded them or a future client-side preview).
 */
export function categorizeConflicts(
  candidate: ConflictCandidate,
  existing: BookingRow[],
): ConflictReport {
  // Cancelled bookings never conflict — they're inert history.
  // Completed bookings are typically in the past and don't block, but
  // we still surface them as possible conflicts if they overlap (the
  // owner may want to know if a "completed" record was wrong).
  const candidateIsHardCandidate = HARD_BLOCKING_STATUSES.includes(
    candidate.status,
  );

  const hard: BookingRow[] = [];
  const possible: BookingRow[] = [];

  for (const b of existing) {
    if (candidate.id && b.id === candidate.id) continue;
    if (b.status === "cancelled") continue;
    if (!bookingsOverlap(candidate, b)) continue;

    const otherIsHard = HARD_BLOCKING_STATUSES.includes(b.status);
    if (candidateIsHardCandidate && otherIsHard) {
      hard.push(b);
    } else {
      possible.push(b);
    }
  }

  return { hard, possible };
}

/**
 * Server-side conflict detection. Loads the workspace's bookings via
 * the regular RLS-scoped client and categorizes them against the
 * candidate.
 */
export async function detectConflicts(
  workspace: Pick<WorkspaceRow, "id">,
  candidate: ConflictCandidate,
): Promise<ConflictReport> {
  const existing = await listBookings(workspace);
  return categorizeConflicts(candidate, existing);
}

/**
 * Format a single booking into a one-line "Title · Sat 10pm–2am"
 * string for display in conflict warnings. Mirrors the formatWhen()
 * helper in /agenda/page.tsx but stays inside the server bundle.
 */
export function summarizeBooking(b: BookingRow): string {
  if (!b.start_at) return `${b.title} (Time TBD)`;
  const start = new Date(b.start_at);
  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (!b.end_at) return `${b.title} · ${dateStr} ${startTime}`;
  const end = new Date(b.end_at);
  const endTime = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${b.title} · ${dateStr} ${startTime}–${endTime} (${b.status})`;
}
