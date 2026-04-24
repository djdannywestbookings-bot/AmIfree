import { z } from "zod";
import { APP_ROLES } from "@/server/policies/roles";

/**
 * Workspace + membership types for AmIFree.
 *
 * Workspace is the tenant boundary; workspace_members grants access.
 * Mirrors the public.workspaces and public.workspace_members tables in
 * 0002_workspace_booking_foundation.sql.
 *
 * service_day_mode is a workspace-level setting, not per-booking. See
 * docs/source-of-truth.md §Locked technical, data, and platform truths.
 */

export const SERVICE_DAY_MODES = ["standard", "nightlife"] as const;
export type ServiceDayMode = (typeof SERVICE_DAY_MODES)[number];

export const workspaceRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  service_day_mode: z.enum(SERVICE_DAY_MODES),
  // When service_day_mode = 'nightlife', service day ends at this hour.
  // 0..12 allowed per migration constraint.
  nightlife_cutoff_hour: z.number().int().min(0).max(12),
  owner_user_id: z.string().uuid(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type WorkspaceRow = z.infer<typeof workspaceRowSchema>;

export const workspaceMemberRowSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(APP_ROLES),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type WorkspaceMemberRow = z.infer<typeof workspaceMemberRowSchema>;

/**
 * Fields accepted when creating a workspace. owner_user_id is taken from
 * the authenticated actor server-side; nightlife_cutoff_hour is only
 * honored when service_day_mode === 'nightlife'.
 */
export const workspaceCreateInputSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(120),
  service_day_mode: z.enum(SERVICE_DAY_MODES).default("standard"),
  nightlife_cutoff_hour: z.number().int().min(0).max(12).default(6),
});

export type WorkspaceCreateInput = z.infer<typeof workspaceCreateInputSchema>;

// Re-export AppRole from the policies layer so app code can import it
// from one domain-ish location.
export type { AppRole } from "@/server/policies/roles";
