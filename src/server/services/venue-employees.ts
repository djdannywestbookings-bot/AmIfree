import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { WorkspaceRow } from "@/modules/auth";

/**
 * Venue ↔ employee eligibility service.
 *
 * The booking form's Assigned-to dropdown filters to employees who
 * are linked to the booking's venue when a venue is selected.
 */

/** All venue ids the given employee is eligible at. */
export async function listVenueIdsForEmployee(
  employeeId: string,
): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("venue_employees")
    .select("venue_id")
    .eq("employee_id", employeeId);
  return (data ?? []).map((row) => (row as { venue_id: string }).venue_id);
}

/** All employee ids eligible at the given venue. */
export async function listEmployeeIdsForVenue(
  venueId: string,
): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("venue_employees")
    .select("employee_id")
    .eq("venue_id", venueId);
  return (data ?? []).map(
    (row) => (row as { employee_id: string }).employee_id,
  );
}

/**
 * Bulk: every venue → array of eligible employee ids in this workspace.
 * Used by the booking forms so the assignee dropdown can re-filter
 * client-side as the venue selection changes.
 */
export async function listVenueEmployeeMap(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<Record<string, string[]>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("venue_employees")
    .select("venue_id, employee_id")
    .eq("workspace_id", workspace.id);
  if (error) throw new Error(error.message);
  const out: Record<string, string[]> = {};
  for (const row of (data ?? []) as Array<{ venue_id: string; employee_id: string }>) {
    if (!out[row.venue_id]) out[row.venue_id] = [];
    out[row.venue_id].push(row.employee_id);
  }
  return out;
}

/**
 * Diff-based replacement of an employee's venue links. Adds rows
 * for new venue ids, removes rows for venues no longer in the list.
 * No-op when the desired set equals the current set.
 */
export async function setEmployeeVenues(
  workspace: Pick<WorkspaceRow, "id">,
  employeeId: string,
  venueIds: string[],
): Promise<void> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("venue_employees")
    .select("venue_id")
    .eq("employee_id", employeeId);
  const current = new Set(
    (existing ?? []).map((row) => (row as { venue_id: string }).venue_id),
  );
  const desired = new Set(venueIds);

  const toAdd = [...desired].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !desired.has(id));

  if (toAdd.length > 0) {
    const { error } = await admin.from("venue_employees").insert(
      toAdd.map((venue_id) => ({
        workspace_id: workspace.id,
        venue_id,
        employee_id: employeeId,
      })),
    );
    if (error) throw new Error(error.message);
  }

  if (toRemove.length > 0) {
    const { error } = await admin
      .from("venue_employees")
      .delete()
      .eq("employee_id", employeeId)
      .in("venue_id", toRemove);
    if (error) throw new Error(error.message);
  }
}
