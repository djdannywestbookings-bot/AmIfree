import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  positionRowSchema,
  positionCreateInputSchema,
  positionUpdateInputSchema,
  type PositionRow,
  type PositionCreateInput,
  type PositionUpdateInput,
} from "@/modules/positions";
import type { WorkspaceRow } from "@/modules/auth";

/**
 * Positions service — Phase 39.
 *
 * Workspace-scoped CRUD plus the m2m linkage between employees and
 * positions. We use the admin client because RLS on
 * employee_positions joins through positions.workspace_id and is
 * gnarly to debug; the page-level requireOwner() gate keeps writes
 * locked to the right user.
 */

export async function listPositions(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<PositionRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("positions")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("name", { ascending: true });
  if (error) {
    throw new Error(`Failed to list positions: ${error.message}`);
  }
  return (data ?? []).map((row) => positionRowSchema.parse(row));
}

export async function getPositionById(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
): Promise<PositionRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("positions")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .maybeSingle();
  return data ? positionRowSchema.parse(data) : null;
}

export async function createPosition(
  workspace: Pick<WorkspaceRow, "id">,
  input: PositionCreateInput,
): Promise<PositionRow> {
  const parsed = positionCreateInputSchema.parse(input);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("positions")
    .insert({
      workspace_id: workspace.id,
      name: parsed.name,
      color: parsed.color ?? null,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Failed to create position: ${error?.message ?? "no row"}`);
  }
  return positionRowSchema.parse(data);
}

export async function updatePosition(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
  input: PositionUpdateInput,
): Promise<PositionRow> {
  const parsed = positionUpdateInputSchema.parse(input);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("positions")
    .update(parsed)
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`Failed to update position: ${error?.message ?? "no row"}`);
  }
  return positionRowSchema.parse(data);
}

export async function deletePosition(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("positions")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", id);
  if (error) {
    throw new Error(`Failed to delete position: ${error.message}`);
  }
}

// ---------------------------------------------------------------------
// Employee ↔ Position assignment
// ---------------------------------------------------------------------

/**
 * Returns a Map<workspace_member_id, PositionRow[]> for all employees
 * in the workspace. One round-trip; the page composer joins it with
 * the employee list.
 */
export async function listEmployeePositionsByEmployee(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<Map<string, PositionRow[]>> {
  const admin = createAdminClient();
  // Inner-join via positions.workspace_id so we never leak across
  // workspaces.
  const { data } = await admin
    .from("employee_positions")
    .select("workspace_member_id, positions(*)")
    .eq("positions.workspace_id", workspace.id);

  const out = new Map<string, PositionRow[]>();
  type Row = {
    workspace_member_id: string;
    positions: PositionRow | PositionRow[] | null;
  };
  for (const row of (data ?? []) as unknown as Row[]) {
    if (!row.positions) continue;
    // Supabase returns array shape sometimes; normalize.
    const arr = Array.isArray(row.positions) ? row.positions : [row.positions];
    for (const p of arr) {
      const parsed = positionRowSchema.safeParse(p);
      if (!parsed.success) continue;
      const list = out.get(row.workspace_member_id) ?? [];
      list.push(parsed.data);
      out.set(row.workspace_member_id, list);
    }
  }
  return out;
}

/**
 * Replace the full set of positions for one employee. Idempotent —
 * computes the diff and only inserts/deletes the changed rows.
 */
export async function setEmployeePositions(
  workspaceMemberId: string,
  positionIds: string[],
): Promise<void> {
  const admin = createAdminClient();
  // Read current set
  const { data: existingRows } = await admin
    .from("employee_positions")
    .select("position_id")
    .eq("workspace_member_id", workspaceMemberId);
  const existing = new Set(
    (existingRows ?? []).map(
      (r) => (r as { position_id: string }).position_id,
    ),
  );
  const desired = new Set(positionIds);

  const toAdd = [...desired].filter((id) => !existing.has(id));
  const toRemove = [...existing].filter((id) => !desired.has(id));

  if (toAdd.length > 0) {
    const { error } = await admin
      .from("employee_positions")
      .insert(toAdd.map((position_id) => ({
        workspace_member_id: workspaceMemberId,
        position_id,
      })));
    if (error) {
      throw new Error(`Failed to add positions: ${error.message}`);
    }
  }

  if (toRemove.length > 0) {
    const { error } = await admin
      .from("employee_positions")
      .delete()
      .eq("workspace_member_id", workspaceMemberId)
      .in("position_id", toRemove);
    if (error) {
      throw new Error(`Failed to remove positions: ${error.message}`);
    }
  }
}

/**
 * Get the positions for one employee. Used by the employee edit page
 * to pre-fill the multi-select.
 */
export async function listPositionsForEmployee(
  workspaceMemberId: string,
): Promise<PositionRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("employee_positions")
    .select("positions(*)")
    .eq("workspace_member_id", workspaceMemberId);
  type Row = { positions: PositionRow | PositionRow[] | null };
  const out: PositionRow[] = [];
  for (const row of (data ?? []) as unknown as Row[]) {
    if (!row.positions) continue;
    const arr = Array.isArray(row.positions) ? row.positions : [row.positions];
    for (const p of arr) {
      const parsed = positionRowSchema.safeParse(p);
      if (parsed.success) out.push(parsed.data);
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}
