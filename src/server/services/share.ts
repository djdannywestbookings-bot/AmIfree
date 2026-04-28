import "server-only";

import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  workspaceMemberRowSchema,
  type WorkspaceMemberRow,
  workspaceRowSchema,
  type WorkspaceRow,
} from "@/modules/auth";
import { bookingRowSchema, type BookingRow } from "@/modules/bookings";

/**
 * Public-share lookups for the /share/[token] route.
 *
 * No auth required — the route validates by token alone. Use the
 * admin client so RLS policies don't get in the way (the token is
 * the access control).
 */

function newAvailabilityToken(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Generate (or rotate) the availability token for the calling
 * member's row. Returns the new token. Caller must be authenticated
 * — pass in the member id via the standard server-action flow.
 */
export async function setMemberAvailabilityToken(
  memberId: string,
): Promise<string> {
  const admin = createAdminClient();
  const token = newAvailabilityToken();
  const { error } = await admin
    .from("workspace_members")
    .update({ availability_token: token })
    .eq("id", memberId);
  if (error) throw new Error(`Couldn't rotate share token: ${error.message}`);
  return token;
}

/**
 * Public lookup: resolve a share token into the member + their
 * workspace. Returns null on miss (route should 404).
 */
export async function getShareTargetByToken(
  token: string,
): Promise<{ member: WorkspaceMemberRow; workspace: WorkspaceRow } | null> {
  const admin = createAdminClient();
  const { data: memRow } = await admin
    .from("workspace_members")
    .select("*")
    .eq("availability_token", token)
    .neq("status", "disabled")
    .maybeSingle();
  if (!memRow) return null;
  const member = workspaceMemberRowSchema.parse(memRow);

  const { data: wsRow } = await admin
    .from("workspaces")
    .select("*")
    .eq("id", member.workspace_id)
    .maybeSingle();
  if (!wsRow) return null;
  const workspace = workspaceRowSchema.parse(wsRow);
  return { member, workspace };
}

/**
 * Bookings that count as "busy" for this member on the share page.
 *
 * Rules:
 *   - assigned_employee_id = member.id  → always busy
 *   - assigned is null AND member is the workspace owner →
 *     treat as busy too (solo workers commonly leave assignee blank)
 *   - status of "cancelled" is excluded
 *
 * Returns ONLY the time fields needed to render busy blocks. No
 * titles, venues, pay, or notes ever leave the server through this
 * function.
 */
export async function listBusyBlocksForMember(
  workspace: WorkspaceRow,
  member: WorkspaceMemberRow,
): Promise<
  Array<
    Pick<
      BookingRow,
      "id" | "start_at" | "end_at" | "all_day" | "service_day"
    >
  >
> {
  const admin = createAdminClient();
  const isOwner = workspace.owner_user_id === member.user_id;

  // Base filter: this member's workspace, non-cancelled rows.
  let query = admin
    .from("bookings")
    .select("id, start_at, end_at, all_day, service_day, assigned_employee_id, status")
    .eq("workspace_id", workspace.id)
    .neq("status", "cancelled");

  if (isOwner) {
    // Owner sees everything assigned to them OR unassigned.
    query = query.or(
      `assigned_employee_id.eq.${member.id},assigned_employee_id.is.null`,
    );
  } else {
    query = query.eq("assigned_employee_id", member.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) =>
    bookingRowSchema.pick({
      id: true,
      start_at: true,
      end_at: true,
      all_day: true,
      service_day: true,
    }).parse(row),
  );
}
