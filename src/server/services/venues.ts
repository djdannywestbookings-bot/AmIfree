import "server-only";

import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  venueRowSchema,
  venueCreateInputSchema,
  venueUpdateInputSchema,
  type VenueRow,
  type VenueCreateInput,
  type VenueUpdateInput,
} from "@/modules/venues";
import type { WorkspaceRow } from "@/modules/auth";

/**
 * Venue service layer.
 *
 * Phase 28 — workspace-scoped venue records that bookings link to via
 * bookings.venue_id. All functions take a Workspace so the caller has
 * already resolved membership; RLS still enforces it on the server.
 */

export async function listVenues(
  workspace: Pick<WorkspaceRow, "id">,
): Promise<VenueRow[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to list venues: ${error.message}`);
  }
  return (data ?? []).map((row) => venueRowSchema.parse(row));
}

export async function getVenueById(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
): Promise<VenueRow | null> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("venues")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .maybeSingle();

  return data ? venueRowSchema.parse(data) : null;
}

export async function createVenue(
  workspace: Pick<WorkspaceRow, "id">,
  input: VenueCreateInput,
): Promise<VenueRow> {
  const parsed = venueCreateInputSchema.parse(input);
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("venues")
    .insert({
      workspace_id: workspace.id,
      name: parsed.name,
      address: parsed.address ?? null,
      color: parsed.color ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to create venue: ${error?.message ?? "no row returned"}`,
    );
  }

  return venueRowSchema.parse(data);
}

export async function updateVenue(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
  input: VenueUpdateInput,
): Promise<VenueRow> {
  const parsed = venueUpdateInputSchema.parse(input);
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("venues")
    .update(parsed)
    .eq("workspace_id", workspace.id)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to update venue: ${error?.message ?? "no row returned"}`,
    );
  }

  return venueRowSchema.parse(data);
}

/**
 * Delete a venue. Bookings linked to it have venue_id set to null
 * (via the FK's ON DELETE SET NULL in migration 0005), so the
 * historical booking rows survive without dangling references.
 */
export async function deleteVenue(
  workspace: Pick<WorkspaceRow, "id">,
  id: string,
): Promise<void> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("venues")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete venue: ${error.message}`);
  }
}
