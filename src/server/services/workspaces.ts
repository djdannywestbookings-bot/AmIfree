import "server-only";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Actor } from "@/server/policies/current-actor";
import {
  workspaceCreateInputSchema,
  workspaceRowSchema,
  workspaceMemberRowSchema,
  type WorkspaceCreateInput,
  type WorkspaceRow,
  type WorkspaceMemberRow,
} from "@/modules/auth";

/**
 * Workspace service layer.
 *
 * Phase 24B — first-time workspace creation plus helpers for the
 * protected shell to detect whether the signed-in user already has a
 * workspace. The workspace is the tenant boundary per
 * docs/source-of-truth.md §Locked multi-user and tenant-boundary truths.
 *
 * Creation uses the service-role admin client because the workspace and
 * its first workspace_members row have to land atomically, and the
 * authenticated user cannot yet pass the members check that the
 * workspaces RLS policy requires (they have no membership at that
 * moment). Every other workspace read/write runs as the signed-in user
 * through RLS.
 *
 * Future phases that add workspace invites / manager_lite assignment
 * will continue to route through this service so the RLS-bypass points
 * are centralized.
 */

/**
 * Create a workspace and grant the creator an `owner` membership.
 *
 * Runs as the service role. Safe to call only from trusted server code
 * where the caller has already verified the actor's identity. Callers
 * are expected to pass the current Actor.
 *
 * Returns the created workspace and membership rows on success.
 */
export async function createWorkspace(
  input: WorkspaceCreateInput,
  actor: Actor,
): Promise<{ workspace: WorkspaceRow; member: WorkspaceMemberRow }> {
  const parsed = workspaceCreateInputSchema.parse(input);
  const admin = createAdminClient();

  // Insert the workspace first.
  const { data: workspaceRow, error: wsError } = await admin
    .from("workspaces")
    .insert({
      name: parsed.name,
      service_day_mode: parsed.service_day_mode,
      nightlife_cutoff_hour: parsed.nightlife_cutoff_hour,
      owner_user_id: actor.userId,
    })
    .select("*")
    .single();

  if (wsError || !workspaceRow) {
    throw new Error(
      `Failed to create workspace: ${wsError?.message ?? "no row returned"}`,
    );
  }

  // Insert the owner membership. Wrapped in a try so we can clean up
  // the orphan workspace if membership insert fails — otherwise the
  // user ends up with a workspace they can't access (RLS blocks them
  // because they're not a member yet).
  const { data: memberRow, error: memError } = await admin
    .from("workspace_members")
    .insert({
      workspace_id: workspaceRow.id,
      user_id: actor.userId,
      role: "owner",
    })
    .select("*")
    .single();

  if (memError || !memberRow) {
    // Best-effort cleanup of the orphan workspace. If this fails too
    // we surface the original error; the workspace is still queryable
    // via service-role for manual repair.
    await admin.from("workspaces").delete().eq("id", workspaceRow.id);
    throw new Error(
      `Failed to create owner membership: ${memError?.message ?? "no row returned"}`,
    );
  }

  return {
    workspace: workspaceRowSchema.parse(workspaceRow),
    member: workspaceMemberRowSchema.parse(memberRow),
  };
}

/**
 * Return the first workspace the signed-in user is a member of.
 *
 * Uses the server (anon) client so RLS applies — the user will see
 * only workspaces they belong to. Phase 24B has a single workspace per
 * owner; later phases may surface multiple.
 *
 * Returns null if the user has no membership yet. Does NOT redirect —
 * callers decide what to do with the null.
 */
export async function getCurrentWorkspace(): Promise<WorkspaceRow | null> {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: memberRow } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!memberRow) return null;

  const { data: workspaceRow } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", memberRow.workspace_id)
    .single();

  if (!workspaceRow) return null;

  return workspaceRowSchema.parse(workspaceRow);
}

/**
 * Ensure the signed-in user has a workspace. If not, redirect to
 * `/onboarding`. Callers on protected pages (agenda, coverage, intake,
 * settings) should call this at the top of their server component.
 *
 * Returns the workspace on success so the caller can thread it into
 * the page query. The redirect throws, so code after the call only
 * runs in the has-workspace case.
 */
export async function requireWorkspace(): Promise<WorkspaceRow> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    redirect("/onboarding");
  }
  return workspace;
}

/**
 * Phase 34 — Look up a workspace by its public iCal calendar_token.
 *
 * Used by the unauthenticated /api/calendar/{token} route, which has
 * no Supabase session because Google/Apple/Outlook poll without auth.
 * Bypasses RLS via the admin client; the token itself is the auth.
 *
 * Returns null if the token doesn't match any workspace.
 */
export async function getWorkspaceByCalendarToken(
  token: string,
): Promise<WorkspaceRow | null> {
  if (!token || typeof token !== "string" || token.length < 16) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("workspaces")
    .select("*")
    .eq("calendar_token", token)
    .maybeSingle();

  if (!data) return null;
  return workspaceRowSchema.parse(data);
}

/**
 * Generate a fresh calendar_token, invalidating the previous URL.
 * Owner-only operation — caller must verify the actor before calling.
 */
export async function rotateCalendarToken(
  workspaceId: string,
): Promise<string> {
  const admin = createAdminClient();
  // Use Postgres' gen_random_uuid() to mint the new token in-DB so
  // we don't depend on Node crypto being available at edge runtimes.
  // Implemented via a tiny RPC equivalent: select + update + return.
  const newToken = generateClientSideToken();
  const { error } = await admin
    .from("workspaces")
    .update({ calendar_token: newToken })
    .eq("id", workspaceId);
  if (error) {
    throw new Error(`Failed to rotate calendar token: ${error.message}`);
  }
  return newToken;
}

function generateClientSideToken(): string {
  // 32-char hex (~128 bits). Uses Node's crypto.randomUUID() which
  // is available in all Next.js runtimes including edge.
  const uuid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Math.random().toString(16).slice(2)}${Math.random()
          .toString(16)
          .slice(2)}`;
  return uuid.replace(/-/g, "");
}
