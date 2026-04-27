import "server-only";

/**
 * Application-level roles for AmIFree.
 *
 * Phase 22 foundation landed with `dj_owner` / `manager_lite`. Phase 23
 * renamed `dj_owner` → `owner` to reflect the broadened positioning
 * locked in `docs/source-of-truth.md` — the product serves any service
 * provider, not only DJs. The role semantics are unchanged; only the
 * name is neutral now.
 *
 * Phase 22+ state:
 * - `owner` is the active role assigned to every owner on
 *   APP_ALLOWED_EMAILS. Full workspace authority.
 * - `manager_lite` is reserved scaffolding; no user is assigned this role
 *   in Phase 22. Including it now keeps later auth migrations additive so
 *   Manager Lite flows can land without an auth redesign.
 *
 * Application roles are distinct from Supabase auth identity. The role is
 * an authoritative server-side policy input; never trust a role claim
 * carried by the client.
 */
/**
 * Phase 38 added "employee" — owners can now invite team members
 * who can view / be assigned shifts but can't manage workspace
 * settings.
 */
export const APP_ROLES = ["owner", "manager_lite", "employee"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ACTIVE_ROLES: readonly AppRole[] = ["owner", "manager_lite", "employee"];
export const RESERVED_ROLES: readonly AppRole[] = [];

export function isActiveRole(role: AppRole): boolean {
  return ACTIVE_ROLES.includes(role);
}

export function isReservedRole(role: AppRole): boolean {
  return RESERVED_ROLES.includes(role);
}
