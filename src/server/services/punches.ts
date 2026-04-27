import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  timePunchRowSchema,
  type TimePunchRow,
} from "@/modules/punches";
import type { WorkspaceRow } from "@/modules/auth";

/**
 * Time punches service — Phase 42.
 *
 * Clock-in / clock-out + listing helpers. Uses the admin client so
 * the action layer can enforce its own authz (current user can only
 * touch their own punches; owners can touch any).
 */

export async function getOpenPunchForMember(
  workspace: Pick<WorkspaceRow, "id">,
  workspaceMemberId: string,
): Promise<TimePunchRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("time_punches")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("workspace_member_id", workspaceMemberId)
    .is("clocked_out_at", null)
    .maybeSingle();
  return data ? timePunchRowSchema.parse(data) : null;
}

export async function clockIn(
  workspace: Pick<WorkspaceRow, "id">,
  workspaceMemberId: string,
  bookingId: string | null = null,
  notes: string | null = null,
): Promise<TimePunchRow> {
  // Reject if there's already an open punch — DB will also enforce
  // via the partial unique index, but this gives a friendlier error.
  const existing = await getOpenPunchForMember(workspace, workspaceMemberId);
  if (existing) {
    throw new Error(
      "You're already clocked in. Clock out from the open shift first.",
    );
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("time_punches")
    .insert({
      workspace_id: workspace.id,
      workspace_member_id: workspaceMemberId,
      booking_id: bookingId,
      clocked_in_at: new Date().toISOString(),
      notes,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Failed to clock in: ${error?.message ?? "no row"}`);
  }
  return timePunchRowSchema.parse(data);
}

export async function clockOut(
  workspace: Pick<WorkspaceRow, "id">,
  punchId: string,
): Promise<TimePunchRow> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("time_punches")
    .update({ clocked_out_at: new Date().toISOString() })
    .eq("workspace_id", workspace.id)
    .eq("id", punchId)
    .is("clocked_out_at", null) // only close if still open
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Failed to clock out: ${error?.message ?? "no row"}`);
  }
  return timePunchRowSchema.parse(data);
}

export async function listPunchesForMember(
  workspace: Pick<WorkspaceRow, "id">,
  workspaceMemberId: string,
  sinceIso?: string,
): Promise<TimePunchRow[]> {
  const admin = createAdminClient();
  let q = admin
    .from("time_punches")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("workspace_member_id", workspaceMemberId)
    .order("clocked_in_at", { ascending: false });
  if (sinceIso) {
    q = q.gte("clocked_in_at", sinceIso);
  }
  const { data } = await q;
  return (data ?? []).map((row) => timePunchRowSchema.parse(row));
}

export async function listAllPunches(
  workspace: Pick<WorkspaceRow, "id">,
  sinceIso?: string,
): Promise<TimePunchRow[]> {
  const admin = createAdminClient();
  let q = admin
    .from("time_punches")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("clocked_in_at", { ascending: false });
  if (sinceIso) {
    q = q.gte("clocked_in_at", sinceIso);
  }
  const { data } = await q;
  return (data ?? []).map((row) => timePunchRowSchema.parse(row));
}
