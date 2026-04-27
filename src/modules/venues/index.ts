import { z } from "zod";

/**
 * Venue domain types for AmIFree.
 *
 * Phase 28 introduced venues with name + address + color.
 * Phase 37 added contact_name + contact_phone + notes (per migration
 * 0008). The map preview on the edit page reads address only — no
 * lat/lng yet, since Google's embed URL accepts the raw address.
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
  // Phase 37 contact + notes
  contact_name: z.string().nullable().default(null),
  contact_phone: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
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
  contact_name: z.string().trim().max(200).nullable().optional(),
  contact_phone: z.string().trim().max(60).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
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
  contact_name: z.string().trim().max(200).nullable().optional(),
  contact_phone: z.string().trim().max(60).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export type VenueUpdateInput = z.infer<typeof venueUpdateInputSchema>;
