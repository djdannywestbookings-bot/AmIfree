import "server-only";

import type { BookingRow, BookingStatus } from "@/modules/bookings";
import type { WorkspaceMemberRow } from "@/modules/auth";

/**
 * Workspace stats — Phase 41.
 *
 * Computes the Sling-style metrics bar: estimated wages, scheduled
 * hours, shift count, etc. for a given booking set.
 *
 * Inputs are already loaded by the caller, so there's no DB hit
 * here. The /agenda and /calendar pages can reuse the bookings
 * + employees they already fetched.
 *
 * Money math is done in cents to avoid floating-point drift.
 */

export type ScheduleStats = {
  totalShifts: number;
  scheduledShifts: number; // shifts with both start_at and end_at
  unscheduledShifts: number; // Time TBD bookings
  cancelledShifts: number;
  totalScheduledMinutes: number;
  totalEstimatedWageCents: number;
  // # of shifts with an assignee whose default_pay_rate_cents > 0
  paidAssignedShifts: number;
  // # of shifts with no assignee at all
  unassignedShifts: number;
};

const COUNT_AS_SCHEDULED: readonly BookingStatus[] = [
  "inquiry",
  "hold",
  "requested",
  "assigned",
  "booked",
  "completed",
];

export function computeScheduleStats(
  bookings: BookingRow[],
  employees: WorkspaceMemberRow[],
): ScheduleStats {
  const empById = new Map(employees.map((e) => [e.id, e] as const));

  let totalShifts = 0;
  let scheduledShifts = 0;
  let unscheduledShifts = 0;
  let cancelledShifts = 0;
  let totalScheduledMinutes = 0;
  let totalEstimatedWageCents = 0;
  let paidAssignedShifts = 0;
  let unassignedShifts = 0;

  for (const b of bookings) {
    if (b.status === "cancelled") {
      cancelledShifts++;
      continue;
    }
    if (!COUNT_AS_SCHEDULED.includes(b.status)) continue;

    totalShifts++;

    if (!b.assigned_employee_id) {
      unassignedShifts++;
    }

    if (b.start_at && b.end_at) {
      const startMs = new Date(b.start_at).getTime();
      const endMs = new Date(b.end_at).getTime();
      if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs) {
        const minutes = Math.round((endMs - startMs) / 60_000);
        totalScheduledMinutes += minutes;
        scheduledShifts++;

        if (b.assigned_employee_id) {
          const emp = empById.get(b.assigned_employee_id);
          if (emp && emp.default_pay_rate_cents > 0) {
            // wage = rate (cents/hour) × minutes / 60
            const cents = Math.round((emp.default_pay_rate_cents * minutes) / 60);
            totalEstimatedWageCents += cents;
            paidAssignedShifts++;
          }
        }
      }
    } else {
      unscheduledShifts++;
    }
  }

  return {
    totalShifts,
    scheduledShifts,
    unscheduledShifts,
    cancelledShifts,
    totalScheduledMinutes,
    totalEstimatedWageCents,
    paidAssignedShifts,
    unassignedShifts,
  };
}

/**
 * Format helpers — kept here so the UI doesn't need to know about
 * cent math or minute math.
 */
export function formatHours(minutes: number): string {
  if (minutes <= 0) return "0h";
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours}h`;
  // 1 decimal for fractional hours
  return `${hours.toFixed(1)}h`;
}

export function formatUsdFromCents(cents: number): string {
  if (!Number.isFinite(cents) || cents <= 0) return "$0";
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: dollars >= 1000 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
