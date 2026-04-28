"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspace } from "@/server/services";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Update the workspace's service_day_mode + nightlife_cutoff_hour.
 *
 * service_day_mode is a workspace-level setting per
 * docs/source-of-truth.md — it changes how a "day" is defined for
 * scheduling purposes (standard = midnight cutoff; nightlife = the
 * day rolls over at e.g. 6:00am so a Saturday-1am gig still counts as
 * Friday's calendar day).
 */

const schema = z.object({
  service_day_mode: z.enum(["standard", "nightlife"]),
  nightlife_cutoff_hour: z.number().int().min(0).max(12),
});

export type ServiceDayResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateServiceDayAction(
  formData: FormData,
): Promise<ServiceDayResult> {
  const workspace = await requireWorkspace();

  const parsed = schema.safeParse({
    service_day_mode: formData.get("service_day_mode"),
    nightlife_cutoff_hour: Number(formData.get("nightlife_cutoff_hour") ?? 6),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("workspaces")
    .update({
      service_day_mode: parsed.data.service_day_mode,
      nightlife_cutoff_hour: parsed.data.nightlife_cutoff_hour,
    })
    .eq("id", workspace.id);
  if (error) {
    return { ok: false, error: `Couldn't save: ${error.message}` };
  }

  revalidatePath("/settings");
  revalidatePath("/agenda");
  return { ok: true };
}
