import "server-only";

import { createClient } from "@/lib/supabase/server";
import { allowedEmails } from "@/lib/config/env.server";
import type { AppRole } from "./roles";

export type Actor = {
  userId: string;
  email: string;
  role: AppRole;
};

/**
 * Resolve the current actor (authenticated user plus application role)
 * from the request context.
 *
 * Returns null if:
 * - there is no signed-in user, or
 * - the signed-in user's email is not on the owner allowlist.
 *
 * Callers at protected routes should treat a null return as "not
 * allowed" and redirect to /login. All role-based authorization must
 * happen on the server; the client must never make authorization
 * decisions from this value.
 *
 * Phase 22 resolution is simple: every allowlisted owner is assigned
 * `owner` (renamed from `dj_owner` in Phase 23 positioning rewrite).
 * Later phases will replace this with a workspace_members lookup keyed
 * off the authenticated user id.
 */
export async function getCurrentActor(): Promise<Actor | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const email = (user.email ?? "").toLowerCase();
  if (!email || !allowedEmails.includes(email)) return null;

  return {
    userId: user.id,
    email,
    role: "owner",
  };
}
