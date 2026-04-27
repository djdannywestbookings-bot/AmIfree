import { z } from "zod";

/**
 * Time punches domain types — Phase 42.
 *
 * One row per clock-in / clock-out pair. clocked_out_at is null while
 * the punch is open (employee is currently on the clock).
 */

export const timePunchRowSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  workspace_member_id: z.string().uuid(),
  booking_id: z.string().uuid().nullable(),
  clocked_in_at: z.string().datetime({ offset: true }),
  clocked_out_at: z.string().datetime({ offset: true }).nullable(),
  notes: z.string().nullable(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type TimePunchRow = z.infer<typeof timePunchRowSchema>;

export function isOpen(p: TimePunchRow): boolean {
  return p.clocked_out_at === null;
}

export function durationMinutes(p: TimePunchRow): number {
  const start = new Date(p.clocked_in_at).getTime();
  const end = p.clocked_out_at
    ? new Date(p.clocked_out_at).getTime()
    : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }
  return Math.round((end - start) / 60_000);
}
