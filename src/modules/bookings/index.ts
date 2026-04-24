import { z } from "zod";

/**
 * Booking domain types for AmIFree.
 *
 * Booking is the only calendar-truth object
 * (docs/source-of-truth.md §Locked core product truths). These types
 * mirror the public.bookings table in 0002_workspace_booking_foundation.sql.
 *
 * Alert states (Hard Conflict, Possible Conflict, Missing Info, Time TBD)
 * are NOT stored in the database — they are computed at read time and
 * derived from the booking set plus manual availability blocks. The
 * AlertState type is declared here so that app-layer conflict detection
 * can share the shape.
 */

// Lifecycle states per docs/source-of-truth.md §Booking lifecycle states.
export const BOOKING_STATUSES = [
  "inquiry",
  "hold",
  "requested",
  "assigned",
  "booked",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// Alert states per docs/source-of-truth.md §Alert states.
// Computed, not stored.
export const ALERT_STATES = [
  "hard_conflict",
  "possible_conflict",
  "missing_info",
  "time_tbd",
] as const;

export type AlertState = (typeof ALERT_STATES)[number];

// Hard assignment-blocking comes only from assigned / booked bookings
// plus active manual availability blocks (Phase 24D+).
export const HARD_BLOCKING_STATUSES: readonly BookingStatus[] = [
  "assigned",
  "booked",
];

// Soft-state bookings participate in possible-conflict logic but do not
// hard-block assignment.
export const SOFT_STATE_STATUSES: readonly BookingStatus[] = [
  "inquiry",
  "hold",
  "requested",
];

/**
 * Booking row as stored in the database. Timestamps are UTC; rendering
 * should go through workspace.service_day_mode at the app layer.
 */
export const bookingRowSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  title: z.string().min(1),
  status: z.enum(BOOKING_STATUSES),
  start_at: z.string().datetime({ offset: true }).nullable(),
  end_at: z.string().datetime({ offset: true }).nullable(),
  all_day: z.boolean(),
  // Stored as YYYY-MM-DD (date, not timestamp). Null until the booking
  // has a start_at the app has anchored.
  service_day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  location: z.string().nullable(),
  pay: z.string().nullable(),
  notes: z.string().nullable(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type BookingRow = z.infer<typeof bookingRowSchema>;

/**
 * Fields accepted on create. Server fills id, workspace_id (from actor),
 * created_by (from actor), service_day (anchored), created_at, updated_at.
 */
export const bookingCreateInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  status: z.enum(BOOKING_STATUSES).default("inquiry"),
  start_at: z.string().datetime({ offset: true }).nullable().optional(),
  end_at: z.string().datetime({ offset: true }).nullable().optional(),
  all_day: z.boolean().default(false),
  location: z.string().max(500).nullable().optional(),
  pay: z.string().max(200).nullable().optional(),
  notes: z.string().max(10_000).nullable().optional(),
}).refine(
  (v) =>
    v.start_at == null ||
    v.end_at == null ||
    new Date(v.end_at) > new Date(v.start_at),
  { message: "end_at must be after start_at", path: ["end_at"] },
);

export type BookingCreateInput = z.infer<typeof bookingCreateInputSchema>;

/**
 * Fields accepted on update. All optional so callers can PATCH.
 */
export const bookingUpdateInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(BOOKING_STATUSES).optional(),
  start_at: z.string().datetime({ offset: true }).nullable().optional(),
  end_at: z.string().datetime({ offset: true }).nullable().optional(),
  all_day: z.boolean().optional(),
  location: z.string().max(500).nullable().optional(),
  pay: z.string().max(200).nullable().optional(),
  notes: z.string().max(10_000).nullable().optional(),
}).refine(
  (v) =>
    v.start_at == null ||
    v.end_at == null ||
    v.start_at === undefined ||
    v.end_at === undefined ||
    new Date(v.end_at) > new Date(v.start_at),
  { message: "end_at must be after start_at", path: ["end_at"] },
);

export type BookingUpdateInput = z.infer<typeof bookingUpdateInputSchema>;
