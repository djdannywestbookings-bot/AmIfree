"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspace } from "@/server/services";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Phase 36.5 — workspace timezone management.
 *
 * Update workspace timezone. Validated against the IANA db via
 * Intl.supportedValuesOf when available, otherwise just non-empty.
 */
export async function updateWorkspaceTimezoneAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const workspace = await requireWorkspace();

  const tz = String(formData.get("timezone") ?? "").trim();
  if (!tz) {
    return { ok: false, error: "Pick a timezone." };
  }

  // Best-effort validation: accept anything Intl.DateTimeFormat doesn't
  // throw on. Browsers/Node ship the IANA timezone db.
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
  } catch {
    return {
      ok: false,
      error: `"${tz}" isn't a recognized IANA timezone. Try America/Chicago, America/New_York, etc.`,
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("workspaces")
    .update({ timezone: tz })
    .eq("id", workspace.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/agenda");
  revalidatePath("/calendar");
  return { ok: true };
}

/**
 * One-shot fix for bookings imported via AI extraction before the
 * timezone-aware prompt change shipped. Shifts every booking's
 * start_at and end_at by `hours`, clamping nulls.
 *
 * Used when the user imported a batch of bookings whose times all
 * landed N hours off (e.g. UTC-stored when they meant Central).
 */
const shiftSchema = z.object({
  hours: z.coerce.number().int().min(-23).max(23),
});

export async function shiftAllBookingTimesAction(
  formData: FormData,
): Promise<
  | { ok: true; updated: number }
  | { ok: false; error: string }
> {
  const workspace = await requireWorkspace();

  const parsed = shiftSchema.safeParse({ hours: formData.get("hours") });
  if (!parsed.success) {
    return { ok: false, error: "Hours must be an integer between -23 and 23." };
  }
  if (parsed.data.hours === 0) {
    return { ok: false, error: "0-hour shift would do nothing." };
  }

  const admin = createAdminClient();
  const { data: bookings, error: readErr } = await admin
    .from("bookings")
    .select("id, start_at, end_at")
    .eq("workspace_id", workspace.id);

  if (readErr) {
    return { ok: false, error: `Read failed: ${readErr.message}` };
  }

  const ms = parsed.data.hours * 60 * 60 * 1000;
  let updated = 0;

  for (const b of bookings ?? []) {
    const row = b as { id: string; start_at: string | null; end_at: string | null };
    const patch: Record<string, string | null> = {};
    if (row.start_at) {
      const t = new Date(row.start_at).getTime();
      if (Number.isFinite(t)) patch.start_at = new Date(t + ms).toISOString();
    }
    if (row.end_at) {
      const t = new Date(row.end_at).getTime();
      if (Number.isFinite(t)) patch.end_at = new Date(t + ms).toISOString();
    }
    if (Object.keys(patch).length === 0) continue;

    const { error: updErr } = await admin
      .from("bookings")
      .update(patch)
      .eq("id", row.id)
      .eq("workspace_id", workspace.id);

    if (!updErr) updated++;
  }

  revalidatePath("/agenda");
  revalidatePath("/calendar");
  revalidatePath("/my-calendar");
  return { ok: true, updated };
}
