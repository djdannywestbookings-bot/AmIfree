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
  // Phase 34 — bearer token for the public iCal feed. Hex string,
  // present after migration 0006. Treat as secret.
  calendar_token: z.string().min(16),
  // Phase 36.5 — workspace IANA timezone. Anchors AI-extracted times,
  // and used for display when the viewer's browser TZ differs.
  timezone: z.string().min(1).default("America/Chicago"),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
});

export type WorkspaceRow = z.infer<typeof workspaceRowSchema>;

export const MEMBER_STATUSES = ["pending", "joined", "disabled"] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const workspaceMemberRowSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  // Phase 38 — pending invites have email but no user_id yet.
  user_id: z.string().uuid().nullable(),
  role: z.enum(APP_ROLES),
  // Phase 38 profile + lifecycle fields
  email: z.string().email().nullable().default(null),
  name: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  // Phase added with migration 0014 — free-form home/mailing address.
  home_address: z.string().nullable().default(null),
  // Migration 0015 — preferred /calendar default view: 1, 3, 6, or 12.
  default_calendar_view: z
    .union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)])
    .nullable()
    .default(null),
  // Migration 0016 — public share token for /share/[token]. Treat as
  // a secret. Null until the user generates one.
  availability_token: z.string().nullable().default(null),
  status: z.enum(MEMBER_STATUSES).default("joined"),
  invited_at: z.string().datetime({ offset: true }).nullable().default(null),
  joined_at: z.string().datetime({ offset: true }).nullable().default(null),
  // Phase 41 — pay rate per scheduled hour, USD cents.
  default_pay_rate_cents: z.number().int().min(0).default(0),
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
