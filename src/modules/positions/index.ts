import { z } from "zod";

/**
 * Positions domain types — Phase 39.
 *
 * A position is a job title an employee can hold (DJ, Bartender,
 * Sound Tech, MC, etc.). Workspace-scoped. Many-to-many with
 * employees via the employee_positions join table.
 *
 * Mirrors the public.positions table from migration 0012.
 */

export const positionRowSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  name: z.string().min(1),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a 7-char hex like #3b82f6")
    .nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type PositionRow = z.infer<typeof positionRowSchema>;

export const positionCreateInputSchema = z.object({
  name: z.string().trim().min(1, "Position name is required").max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
});

export type PositionCreateInput = z.infer<typeof positionCreateInputSchema>;

export const positionUpdateInputSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .nullable()
    .optional(),
});

export type PositionUpdateInput = z.infer<typeof positionUpdateInputSchema>;
