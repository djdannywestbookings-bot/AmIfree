import { z } from "zod";

/**
 * Venue domain types for AmIFree.
 *
 * Phase 28 introduces venues as a structured first-class concept.
 * Mirrors the public.venues table from migration 0005. Bookings link
 * to venues via bookings.venue_id; one-off bookings can still use the
 * legacy bookings.location text field.
 */

export const venueRowSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().nullable(),
  // 7-char hex string (e.g., '#3b82f6') or null.
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a 7-char hex like #3b82f6")
    .nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type VenueRow = z.infer<typeof venueRowSchema>;

export const venueCreateInputSchema = z.object({
  name: z.string().trim().min(1, "Venue name is required").max(200),
  address: z.string().max(500).nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a 7-char hex like #3b82f6")
    .nullable()
    .optional(),
});

export type VenueCreateInput = z.infer<typeof venueCreateInputSchema>;

export const venueUpdateInputSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  address: z.string().max(500).nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
});

export type VenueUpdateInput = z.infer<typeof venueUpdateInputSchema>;
