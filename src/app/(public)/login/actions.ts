"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { allowedEmails } from "@/lib/config/env.server";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.");

// Supabase's default OTP length varies by project setting (6 or 8 digits
// commonly; 10 is the upper bound). Accept the full supported range rather
// than hard-coding a single length.
const otpSchema = z
  .string()
  .regex(/^\d{6,10}$/, "The code must be 6–10 digits.");

export type ActionResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

/**
 * Server action: send a one-time code to the email, if the email is on the
 * owner allowlist. Returns a generic success message either way so the
 * allowlist itself is not enumerable.
 */
export async function sendOtp(formData: FormData): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const email = parsed.data;

  // Pretend-success for non-allowlisted emails so the allowlist is not leaked.
  if (!allowedEmails.includes(email)) {
    return { ok: true, email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    return { ok: false, error: "Could not send sign-in code. Try again." };
  }
  return { ok: true, email };
}

/**
 * Server action: verify the sign-in code from the email. On success,
 * redirects to /agenda (the default authenticated landing route).
 */
export async function verifyOtp(formData: FormData): Promise<ActionResult> {
  const parsedEmail = emailSchema.safeParse(formData.get("email"));
  const parsedToken = otpSchema.safeParse(formData.get("token"));
  if (!parsedEmail.success || !parsedToken.success) {
    return { ok: false, error: "Check your email address and the code." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsedEmail.data,
    token: parsedToken.data,
    type: "email",
  });

  if (error) {
    return { ok: false, error: "That code was invalid or expired." };
  }

  // redirect() throws a framework-handled error; the client never sees a return.
  // Calendar is the primary surface as of Phase 29.
  redirect("/calendar");
}
