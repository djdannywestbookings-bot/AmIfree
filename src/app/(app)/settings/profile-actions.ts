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
  // When email changes, the current password is required as a
  // security check. Empty/missing for non-email updates.
  current_password: z.string().optional(),
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
    current_password: formData.get("current_password") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const { name, email, phone, home_address, current_password } = parsed.data;

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

  // Email change is a security-sensitive operation. We require the
  // user's current password to confirm it's actually them at the
  // keyboard, then hand off to Supabase Auth which sends a
  // confirmation link to the new address (and to the old one if
  // "Secure email change" is enabled in the dashboard). The change
  // activates only after the user clicks the link.
  let emailChange: { sentTo: string } | undefined;
  const currentEmail = (member.email ?? "").toLowerCase();
  if (email && email !== currentEmail) {
    if (!current_password || current_password.length < 1) {
      return {
        ok: false,
        error: "Enter your current password to change your email.",
      };
    }

    // Verify the password by attempting a fresh sign-in. The
    // resulting session is the same user, so it cleanly replaces the
    // existing cookie. OAuth-only users (no password set) will fail
    // here — surface a helpful pointer.
    const supabase = await createServerClient();
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: current_password,
    });
    if (verifyErr) {
      return {
        ok: false,
        error:
          "Current password didn't match. If you signed in with Apple/Google and haven't set a password yet, use Forgot password first.",
      };
    }

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
