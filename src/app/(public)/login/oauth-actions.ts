"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth sign-in actions — Apple and Google.
 *
 * The flow:
 *   1. User clicks "Continue with Apple/Google" on /login.
 *   2. This action calls supabase.auth.signInWithOAuth, which returns
 *      a provider URL (Apple's authorize endpoint, etc).
 *   3. We redirect the browser to that URL.
 *   4. After the user approves on the provider, the provider redirects
 *      back to /auth/callback?code=xxx (configured in Supabase).
 *   5. /auth/callback exchanges the code for a session and lands the
 *      user on /calendar (or /login with an error if not allowed).
 *
 * The redirectTo URL must match a redirect URL registered in the
 * Supabase Auth dashboard. See docs/AUTH_SETUP.md.
 */

type Provider = "google" | "apple";

async function originUrl(): Promise<string> {
  // In production this is amifreescheduler.com via the Vercel header.
  // Locally next-dev sets host to localhost:3000.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function startOAuth(provider: Provider) {
  const supabase = await createClient();
  const origin = await originUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
      // Long-lived session — Supabase issues refresh tokens with the
      // session lifetime configured in the dashboard (Auth → Sessions).
      // Set that to 30 days for owners + invitees so a working DJ
      // doesn't get bounced mid-week.
    },
  });

  if (error || !data?.url) {
    redirect(
      `/login?error=${encodeURIComponent("Sign-in unavailable. Try email instead.")}`,
    );
  }

  redirect(data.url);
}

export async function signInWithGoogle() {
  return startOAuth("google");
}

export async function signInWithApple() {
  return startOAuth("apple");
}
