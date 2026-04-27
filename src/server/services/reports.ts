import "server-only";

import type { BookingRow, BookingStatus } from "@/modules/bookings";
import type { VenueRow } from "@/modules/venues";
import type { WorkspaceMemberRow } from "@/modules/auth";

/**
 * Reports — Phase 45.
 *
 * Pure aggregations over a pre-loaded booking set. No DB calls here;
 * the page composer hands us the bookings + venues + employees so
 * we can compute everything in one pass.
 *
 * Money math is in cents (matches stats.ts). Dates use the booking's
 * service_day when available, falling back to start_at's local date.
 */

export type StatusCounts = Record<BookingStatus, number>;

export type MonthlyBucket = {
  // YYYY-MM
  monthKey: string;
  // Display label like "Apr 2026"
  label: string;
  bookingCount: number;
  estimatedWageCents: number;
};

export type VenueLeaderboardEntry = {
  venueId: string | null;
  venueName: string;
  bookingCount: number;
  totalScheduledMinutes: number;
};

export type DayOfWeekBucket = {
  // 0=Sun, 1=Mon, ... 6=Sat
  weekday: number;
  label: string;
  bookingCount: number;
};

export type WorkspaceReports = {
  totalBookings: number;
  statusCounts: StatusCounts;
  monthly: MonthlyBucket[];
  topVenues: VenueLeaderboardEntry[];
  byDayOfWeek: DayOfWeekBucket[];
  conversion: {
    inquiry: number;
    holdOrRequested: number;
    assignedOrBooked: number;
    completed: number;
    cancelled: number;
  };
  oldestBookingDate: string | null;
  newestBookingDate: string | null;
};

const ALL_STATUSES: readonly BookingStatus[] = [
  "inquiry",
  "hold",
  "requested",
  "assigned",
  "booked",
  "completed",
  "cancelled",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function bookingDate(b: BookingRow): Date | null {
  if (b.service_day) {
    const m = b.service_day.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    }
  }
  if (b.start_at) {
    const d = new Date(b.start_at);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function computeReports(
  bookings: BookingRow[],
  venues: VenueRow[],
  employees: WorkspaceMemberRow[],
): WorkspaceReports {
  const venuesById = new Map(venues.map((v) => [v.id, v] as const));
  const empById = new Map(employees.map((e) => [e.id, e] as const));

  const statusCounts: StatusCounts = {} as StatusCounts;
  for (const s of ALL_STATUSES) statusCounts[s] = 0;

  const monthly = new Map<string, MonthlyBucket>();
  const venueAgg = new Map<string, VenueLeaderboardEntry>();
  const dayCounts = new Array(7).fill(0) as number[];

  let oldest: Date | null = null;
  let newest: Date | null = null;

  for (const b of bookings) {
    statusCounts[b.status] = (statusCounts[b.status] ?? 0) + 1;

    const d = bookingDate(b);
    if (d) {
      if (!oldest || d < oldest) oldest = d;
      if (!newest || d > newest) newest = d;

      const mKey = monthKey(d);
      const bucket = monthly.get(mKey) ?? {
        monthKey: mKey,
        label: monthLabel(d),
        bookingCount: 0,
        estimatedWageCents: 0,
      };
      bucket.bookingCount += 1;

      // Wage estimate: assignee rate × duration. Mirrors stats.ts.
      if (b.start_at && b.end_at && b.assigned_employee_id) {
        const startMs = new Date(b.start_at).getTime();
        const endMs = new Date(b.end_at).getTime();
        if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs) {
          const minutes = Math.round((endMs - startMs) / 60_000);
          const emp = empById.get(b.assigned_employee_id);
          if (emp && emp.default_pay_rate_cents > 0) {
            bucket.estimatedWageCents += Math.round(
              (emp.default_pay_rate_cents * minutes) / 60,
            );
          }
        }
      }

      monthly.set(mKey, bucket);

      dayCounts[d.getDay()] += 1;
    }

    // Venue leaderboard. Bookings without venue_id roll up under
    // the literal "(no venue)" slot so they're still counted.
    const venueKey = b.venue_id ?? "__no_venue__";
    const venueName = b.venue_id
      ? venuesById.get(b.venue_id)?.name ?? "(deleted venue)"
      : b.location && b.location.length > 0
        ? b.location
        : "(no venue)";
    const v = venueAgg.get(venueKey) ?? {
      venueId: b.venue_id,
      venueName,
      bookingCount: 0,
      totalScheduledMinutes: 0,
    };
    v.bookingCount += 1;
    if (b.start_at && b.end_at) {
      const startMs = new Date(b.start_at).getTime();
      const endMs = new Date(b.end_at).getTime();
      if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs) {
        v.totalScheduledMinutes += Math.round((endMs - startMs) / 60_000);
      }
    }
    venueAgg.set(venueKey, v);
  }

  // Sort monthly oldest → newest
  const monthlySorted = Array.from(monthly.values()).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );

  // Top 8 venues by booking count
  const topVenues = Array.from(venueAgg.values())
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 8);

  const byDayOfWeek: DayOfWeekBucket[] = WEEKDAY_LABELS.map((label, i) => ({
    weekday: i,
    label,
    bookingCount: dayCounts[i],
  }));

  return {
    totalBookings: bookings.length,
    statusCounts,
    monthly: monthlySorted,
    topVenues,
    byDayOfWeek,
    conversion: {
      inquiry: statusCounts.inquiry,
      holdOrRequested: statusCounts.hold + statusCounts.requested,
      assignedOrBooked: statusCounts.assigned + statusCounts.booked,
      completed: statusCounts.completed,
      cancelled: statusCounts.cancelled,
    },
    oldestBookingDate: oldest ? oldest.toISOString().slice(0, 10) : null,
    newestBookingDate: newest ? newest.toISOString().slice(0, 10) : null,
  };
}
