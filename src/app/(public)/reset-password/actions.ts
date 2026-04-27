"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Update password for the currently-authenticated user.
 *
 * The user must have an active recovery session (granted by the
 * Supabase recovery email link → /auth/callback). If they hit this
 * action without a session, Supabase returns an error and we surface
 * it.
 */
const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

export type ResetResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updatePassword(
  formData: FormData,
): Promise<ResetResult> {
  const parsed = schema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error:
        "Your reset link expired. Request a new one from the sign-in page.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  redirect("/calendar");
}
