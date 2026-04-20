import "server-only";

/**
 * Application-level roles for AmIFree.
 *
 * Phase 22 is owner-only:
 * - `dj_owner` is the active role assigned to every owner on
 *   APP_ALLOWED_EMAILS.
 * - `manager_lite` is reserved scaffolding; no user is assigned this role
 *   in Phase 22. Including it now keeps later auth migrations additive so
 *   Manager Lite flows can land without an auth redesign.
 *
 * Application roles are distinct from Supabase auth identity. The role is
 * an authoritative server-side policy input; never trust a role claim
 * carried by the client.
 */
export const APP_ROLES = ["dj_owner", "manager_lite"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ACTIVE_ROLES: readonly AppRole[] = ["dj_owner"];
export const RESERVED_ROLES: readonly AppRole[] = ["manager_lite"];

export function isActiveRole(role: AppRole): boolean {
  return ACTIVE_ROLES.includes(role);
}

export function isReservedRole(role: AppRole): boolean {
  return RESERVED_ROLES.includes(role);
}
