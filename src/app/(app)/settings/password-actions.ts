"use server";

import { z } from "zod";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { requireWorkspace, getCurrentMember } from "@/server/services";

/**
 * Change password from the settings surface.
 *
 * Verification flow:
 *   1. User must already be signed in (server cookie session).
 *   2. User submits current_password + new_password + confirm.
 *   3. We verify current_password by attempting a fresh
 *      signInWithPassword on the user's email. If it succeeds, the
 *      password matches; the resulting session is the same user, so
 *      the cookie is harmlessly refreshed.
 *   4. We then call supabase.auth.updateUser({ password }) to set the
 *      new one.
 *
 * Users who signed in via Apple/Google and have never set a password
 * will fail step 3 with "Invalid login credentials." We surface a
 * helpful message pointing them at /forgot-password to set a first
 * password via the recovery email flow.
 */

const schema = z
  .object({
    current_password: z.string().min(1, "Enter your current password."),
    new_password: z.string().min(8, "New password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: "New passwords don't match.",
    path: ["confirm"],
  });

export type UpdatePasswordResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updatePasswordAction(
  formData: FormData,
): Promise<UpdatePasswordResult> {
  const workspace = await requireWorkspace();
  const member = await getCurrentMember(workspace);
  if (!member?.email) {
    return {
      ok: false,
      error: "Couldn't read your account email. Sign out and back in, then try again.",
    };
  }

  const parsed = schema.safeParse({
    current_password: formData.get("current_password"),
    new_password: formData.get("new_password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const supabase = await createServerClient();

  // Step 1 — verify current password.
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: member.email,
    password: parsed.data.current_password,
  });
  if (verifyErr) {
    return {
      ok: false,
      error:
        "Current password didn't match. If you signed in with Apple/Google and haven't set a password yet, use Forgot password to set one.",
    };
  }

  // Step 2 — set the new password.
  const { error: updErr } = await supabase.auth.updateUser({
    password: parsed.data.new_password,
  });
  if (updErr) {
    return {
      ok: false,
      error: `Couldn't update password: ${updErr.message}`,
    };
  }

  return { ok: true };
}
