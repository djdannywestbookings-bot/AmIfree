"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowedEmails } from "@/lib/config/env.server";
import { loginAttachPendingInvites } from "@/server/services/employees";

/**
 * Email + password sign-in.
 *
 * Sits alongside the existing OAuth + magic-link flows. Same allowlist
 * guard as those: only owner emails or pending-invite emails get in.
 *
 * "Stay signed in for 90 days" writes a `staySignedIn` cookie that
 * future middleware can use to short-circuit sessions older than
 * 7 days when the box was unchecked. Today the default Supabase
 * session lifetime is set in the dashboard (Auth → Sessions); the
 * cookie just records the user's preference for follow-up enforcement.
 */

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  staySignedIn: z.boolean().optional().default(true),
});

export type SignInResult =
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

export async function signInWithPassword(
  formData: FormData,
): Promise<SignInResult> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    staySignedIn: formData.get("stay_signed_in") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { email, password, staySignedIn } = parsed.data;

  if (!(await emailIsAllowed(email))) {
    // Generic error so the allowlist isn't enumerable.
    return { ok: false, error: "Email or password is incorrect." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.user) {
    return { ok: false, error: "Email or password is incorrect." };
  }

  // Record the "stay signed in" preference. 30-day cookie either way —
  // the actual short-session enforcement is a middleware follow-up.
  const cookieStore = await cookies();
  cookieStore.set("staySignedIn", staySignedIn ? "1" : "0", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days — the preference, not the session
  });

  // Attach pending invites if any. Best-effort.
  try {
    await loginAttachPendingInvites(data.user.id, email);
  } catch (err) {
    console.error("loginAttachPendingInvites failed", err);
  }

  redirect("/calendar");
}
