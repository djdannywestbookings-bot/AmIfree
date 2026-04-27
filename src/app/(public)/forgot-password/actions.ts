"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Request a password reset email.
 *
 * Always returns ok regardless of whether the email exists, so the
 * allowlist isn't enumerable. If the email IS on the allowlist or
 * has a pending invite, Supabase sends a magic recovery link that
 * lands the user back on /reset-password via /auth/callback.
 */
const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export type ForgotResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

async function originUrl(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function requestPasswordReset(
  formData: FormData,
): Promise<ForgotResult> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const email = parsed.data.email;

  const supabase = await createClient();
  const origin = await originUrl();

  // Pretend success either way. Supabase silently no-ops on unknown
  // emails (which is the right behavior here — we don't reveal whether
  // an email is registered).
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return { ok: true, email };
}
