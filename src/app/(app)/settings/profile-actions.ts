"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  requireWorkspace,
  getCurrentMember,
} from "@/server/services";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Profile section server actions.
 *
 * The "profile" is the current user's workspace_members row (name,
 * email, phone, home_address) plus a small mirror of name → workspace
 * name so the rest of the app no longer surfaces a separate workspace
 * label that's distinct from the user.
 *
 * Email change calls supabase.auth.updateUser({ email }) which sends a
 * confirmation email to the new address; the change doesn't take
 * effect until the user clicks that link.
 */

const profileSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email.").optional(),
  phone: z.string().trim().max(40).optional(),
  home_address: z.string().trim().max(500).optional(),
});

export type UpdateProfileResult =
  | { ok: true; emailChange?: { sentTo: string } }
  | { ok: false; error: string };

export async function updateProfileAction(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const workspace = await requireWorkspace();
  const member = await getCurrentMember(workspace);
  if (!member) {
    return {
      ok: false,
      error: "You're not a member of this workspace.",
    };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    home_address: formData.get("home_address") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const { name, email, phone, home_address } = parsed.data;

  const admin = createAdminClient();

  // Update the workspace_members row. Empty strings collapse to null
  // so we don't store " " for missing fields.
  const memberPatch: Record<string, string | null> = {};
  if (name !== undefined) memberPatch.name = name || null;
  if (phone !== undefined) memberPatch.phone = phone || null;
  if (home_address !== undefined) memberPatch.home_address = home_address || null;

  if (Object.keys(memberPatch).length > 0) {
    const { error: memErr } = await admin
      .from("workspace_members")
      .update(memberPatch)
      .eq("id", member.id);
    if (memErr) {
      return { ok: false, error: `Couldn't save profile: ${memErr.message}` };
    }
  }

  // Mirror the profile name into workspace.name so the rest of the
  // app (calendar headers, agenda subhead, etc.) reads the user's
  // name instead of a separate workspace label.
  if (name && name.length > 0 && name !== workspace.name) {
    const { error: wsErr } = await admin
      .from("workspaces")
      .update({ name })
      .eq("id", workspace.id);
    if (wsErr) {
      return { ok: false, error: `Couldn't sync workspace name: ${wsErr.message}` };
    }
  }

  // Email change goes through Supabase Auth — they send a confirm
  // link, the change activates after the user clicks it. We DON'T
  // pre-update workspace_members.email; that's mirrored from auth
  // once confirmation lands.
  let emailChange: { sentTo: string } | undefined;
  if (email && email !== (member.email ?? "").toLowerCase()) {
    const supabase = await createServerClient();
    const { error: emErr } = await supabase.auth.updateUser({ email });
    if (emErr) {
      return {
        ok: false,
        error: `Email change failed: ${emErr.message}`,
      };
    }
    emailChange = { sentTo: email };
  }

  revalidatePath("/settings");
  revalidatePath("/calendar");
  return emailChange ? { ok: true, emailChange } : { ok: true };
}
