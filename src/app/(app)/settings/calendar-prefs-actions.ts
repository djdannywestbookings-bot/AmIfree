"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspace, getCurrentMember } from "@/server/services";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Per-user calendar preferences. Today only one knob: the default
 * /calendar view (1, 3, 6, or 12 months). The calendar surface uses
 * this when the URL has no ?view=… param (i.e. a fresh visit).
 */

const schema = z.object({
  default_calendar_view: z.union([
    z.literal(1),
    z.literal(3),
    z.literal(6),
    z.literal(12),
  ]),
});

export type CalendarPrefsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateDefaultCalendarViewAction(
  formData: FormData,
): Promise<CalendarPrefsResult> {
  const workspace = await requireWorkspace();
  const member = await getCurrentMember(workspace);
  if (!member) {
    return { ok: false, error: "You're not a member of this workspace." };
  }

  const parsed = schema.safeParse({
    default_calendar_view: Number(formData.get("default_calendar_view")),
  });
  if (!parsed.success) {
    return { ok: false, error: "Pick 1, 3, 6, or 12 months." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("workspace_members")
    .update({ default_calendar_view: parsed.data.default_calendar_view })
    .eq("id", member.id);
  if (error) {
    return { ok: false, error: `Couldn't save: ${error.message}` };
  }

  revalidatePath("/settings");
  revalidatePath("/calendar");
  return { ok: true };
}
