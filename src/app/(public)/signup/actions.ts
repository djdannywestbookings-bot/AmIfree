"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedEmails } from "@/lib/config/env.server";
import { loginAttachPendingInvites } from "@/server/services/employees";

/**
 * Email + password signup.
 *
 * Allowlist-gated like the rest of the auth surface during beta:
 * unknown emails get a generic friendly response (no account is
 * created, no email is sent) so the allowlist isn't enumerable.
 *
 * Password rule: 8 characters minimum. No symbol/number/uppercase
 * requirement on purpose — this audience resents complexity rules.
 */

const schema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match.",
    path: ["confirm"],
  });

export type SignUpResult =
  | { ok: true }
  | { ok: false; error: string };

async function emailIsAllowed(email: string): Promise<boolean> {
  if (allowedEmails.includes(email)) return true;
  const admin = createAdminClient();
  const { data } = await admin
    .from("workspace_members")
    .select("id")
    .eq("status", "pending")
    .ilike("email", email)
    .limit(1);
  return Boolean(data && data.length > 0);
}

export async function signUpWithPassword(
  formData: FormData,
): Promise<SignUpResult> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const { email, password } = parsed.data;

  if (!(await emailIsAllowed(email))) {
    // Don't create the account, don't reveal allowlist state.
    return {
      ok: true,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    // Most common error here is "User already registered" — surface
    // a helpful prompt rather than a generic failure.
    const msg = error.message.toLowerCase();
    if (msg.includes("registered") || msg.includes("already")) {
      return {
        ok: false,
        error: "An account with this email already exists. Sign in instead.",
      };
    }
    return { ok: false, error: error.message };
  }

  // Default cookie: stay signed in.
  const cookieStore = await cookies();
  cookieStore.set("staySignedIn", "1", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  // If Supabase is configured WITHOUT email confirmation, the signUp
  // call returns a session and the user is immediately authed. If
  // email confirmation is required, data.user exists but data.session
  // is null — the user has to click the confirmation email first.
  if (data.session && data.user) {
    try {
      await loginAttachPendingInvites(data.user.id, email);
    } catch (err) {
      console.error("loginAttachPendingInvites failed", err);
    }
    redirect("/calendar");
  }

  // Email confirmation flow — the page will show a "check your email"
  // state when this returns ok.
  return { ok: true };
}
