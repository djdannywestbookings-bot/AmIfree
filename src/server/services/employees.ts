import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  workspaceMemberRowSchema,
  type WorkspaceMemberRow,
  type WorkspaceRow,
} from "@/modules/auth";
import {
  employeeCreateInputSchema,
  employeeUpdateInputSchema,
  type EmployeeCreateInput,
  type EmployeeUpdateInput,
} from "@/modules/employees";

/**
 * Employees service — Phase 38.
 *
 * "Employees" in the UI map to workspace_members rows in the DB. The
 * Phase 38 migration extended workspace_members with email / name /
 * phone / status so the same row holds both the access grant and the
 * profile.
 *
 * Lifecycle:
 *   - Owner adds employee → row with status=pending, email set,
 *     user_id null, invited_at = now().
 *   - Employee signs in via OTP login → loginAttachPendingInvites()
 *     fills user_id and flips status to joined.
 *   - Owner can change role / disable / delete at any time.
 */

export async function listEmployees(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<WorkspaceMemberRow[]> {
  // Use admin client because RLS policies on workspace_members were
  // written for the simpler Phase 24A schema and don't yet account for
  // the new pending-invite rows. The /employees route is owner-only,
  // gated by the page's requireWorkspace() + role check, so admin
  // access here is appropriate.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("status", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(`Failed to list employees: ${error.message}`);
  }
  return (data ?? []).map((row) => workspaceMemberRowSchema.parse(row));
}

export async function getEmployeeById(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
): Promise<WorkspaceMemberRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .maybeSingle();
  return data ? workspaceMemberRowSchema.parse(data) : null;
}

/**
 * Invite a new employee. Creates a workspace_members row with
 * status=pending and email set; user_id is null until the person
 * signs in for the first time.
 *
 * Owner does the invite verbally / by sending the sign-in URL — we
 * don't send email yet.
 */
export async function createEmployee(
  workspace: Pick<WorkspaceRow, "id">,
  input: EmployeeCreateInput,
): Promise<WorkspaceMemberRow> {
  const parsed = employeeCreateInputSchema.parse(input);
  const admin = createAdminClient();

  // Check if a user with this email already has an auth account; if
  // so, attach the row directly (skip pending state).
  let existingUserId: string | null = null;
  const { data: usersResp } = await admin.auth.admin.listUsers({
    perPage: 200,
  });
  for (const u of usersResp?.users ?? []) {
    if (u.email && u.email.toLowerCase() === parsed.email.toLowerCase()) {
      existingUserId = u.id;
      break;
    }
  }

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: existingUserId,
      role: parsed.role,
      email: parsed.email,
      name: parsed.name,
      phone: parsed.phone ?? null,
      status: existingUserId ? "joined" : "pending",
      invited_at: now,
      joined_at: existingUserId ? now : null,
      default_pay_rate_cents: parsed.default_pay_rate_cents ?? 0,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Failed to create employee: ${error?.message ?? "no row"}`);
  }
  return workspaceMemberRowSchema.parse(data);
}

export async function updateEmployee(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
  input: EmployeeUpdateInput,
): Promise<WorkspaceMemberRow> {
  const parsed = employeeUpdateInputSchema.parse(input);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspace_members")
    .update(parsed)
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Failed to update employee: ${error?.message ?? "no row"}`);
  }
  return workspaceMemberRowSchema.parse(data);
}

export async function deleteEmployee(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
): Promise<void> {
  const admin = createAdminClient();
  // Don't let owners delete themselves out of their own workspace.
  const { data: row } = await admin
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .maybeSingle();
  if (row && (row as { role: string }).role === "owner") {
    throw new Error(
      "Can't remove the workspace owner. Demote first or contact support.",
    );
  }
  const { error } = await admin
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", id);
  if (error) {
    throw new Error(`Failed to delete employee: ${error.message}`);
  }
}

/**
 * After a user signs in, attach any pending workspace_members rows
 * matching their email. Called from the OTP-verify path.
 *
 * Returns the number of invites attached (0 = no pending invites).
 */
export async function loginAttachPendingInvites(
  userId: string,
  email: string,
): Promise<number> {
  const admin = createAdminClient();
  const lower = email.trim().toLowerCase();
  const now = new Date().toISOString();

  const { data: pending } = await admin
    .from("workspace_members")
    .select("id")
    .is("user_id", null)
    .eq("status", "pending")
    .ilike("email", lower);

  if (!pending || pending.length === 0) return 0;

  const ids = (pending as { id: string }[]).map((r) => r.id);
  const { error } = await admin
    .from("workspace_members")
    .update({
      user_id: userId,
      status: "joined",
      joined_at: now,
    })
    .in("id", ids);

  if (error) {
    throw new Error(`Failed to attach pending invites: ${error.message}`);
  }
  return ids.length;
}

/**
 * Helper to get the current actor's role in a workspace, used to gate
 * the /employees admin pages so non-owners can't manage other people.
 */
export async function getCurrentMemberRole(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<"owner" | "manager_lite" | "employee" | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as { role: "owner" | "manager_lite" | "employee" } | null)?.role ?? null;
}

/**
 * Phase 40 — Get the current user's workspace_members row id. Used by
 * /my-calendar to filter bookings to "assigned to me".
 *
 * Returns null if the user isn't a member.
 */
export async function getCurrentMemberId(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

/**
 * Phase 40 — list employees that can be assigned to a shift.
 * Excludes disabled members. Pending invites can be assigned (so an
 * owner can pre-fill the schedule before the team has signed in).
 */
export async function listAssignableEmployees(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<WorkspaceMemberRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspace.id)
    .neq("status", "disabled")
    .order("name", { ascending: true, nullsFirst: false });
  return (data ?? []).map((row) => workspaceMemberRowSchema.parse(row));
}
