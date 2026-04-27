import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { allowedEmails } from "@/lib/config/env.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginAttachPendingInvites } from "@/server/services/employees";

/**
 * OAuth callback — completes Apple/Google sign-in.
 *
 * Supabase appends ?code=... to the redirect URL. We exchange that
 * code for a session, then enforce the same allowlist guard the email
 * OTP path uses (owner allowlist OR pending workspace_members invite).
 *
 * Magic link click-through also lands here when the email contains a
 * Supabase confirmation URL — same exchange + same guard apply.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/calendar";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Sign-in link is missing or expired.")}`,
    );
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Could not complete sign-in. Try again.")}`,
    );
  }

  // Read the user we just signed in.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("No email returned by provider.")}`,
    );
  }

  const email = user.email.toLowerCase();
  const isOwner = allowedEmails.includes(email);

  // Check for a pending invite — same logic as the OTP flow.
  let isInvited = false;
  if (!isOwner) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("workspace_members")
      .select("id")
      .eq("status", "pending")
      .ilike("email", email)
      .limit(1);
    isInvited = Boolean(data && data.length > 0);
  }

  if (!isOwner && !isInvited) {
    // Sign them out so the session doesn't linger, then bounce.
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("This email isn't on the owner allowlist or invite list yet.")}`,
    );
  }

  // Attach any pending invites — fail soft, the user is still in.
  try {
    await loginAttachPendingInvites(user.id, email);
  } catch (err) {
    console.error("loginAttachPendingInvites failed", err);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
