"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { sendOtp, verifyOtp } from "./actions";

type Stage = "email" | "otp";

/**
 * Login surface — front door for amifreescheduler.com.
 *
 * Pass 1 polish: branded wordmark, soft gradient background, a single
 * elevated card centered on the page, and the new `.btn` / `.input`
 * component classes from globals.css. Two-step flow (email → OTP)
 * unchanged.
 */
export default function LoginPage() {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await sendOtp(form);
    setPending(false);

    if (result.ok) {
      setEmail(result.email);
      setStage("otp");
    } else {
      setError(result.error);
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    form.set("email", email);
    const result = await verifyOtp(form);
    // On success, verifyOtp redirects and this line never runs.
    setPending(false);
    if (result && !result.ok) {
      setError(result.error);
    }
  }

  return (
    <main
      className="min-h-dvh flex items-center justify-center p-6 sm:p-10
                 bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50"
    >
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight"
            aria-label="AmIFree home"
          >
            <span className="text-indigo-700">AmI</span>
            <span className="text-teal-500">Free</span>
          </Link>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="h-section text-lg mb-1">
            {stage === "email" ? "Sign in" : "Check your email"}
          </h1>
          <p className="text-sm text-muted mb-6">
            {stage === "email"
              ? "We'll email a one-time code — no password required."
              : (
                  <>
                    Code sent to <strong className="text-slate-700">{email}</strong>
                  </>
                )}
          </p>

          {stage === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="btn btn-lg btn-primary w-full"
              >
                {pending ? "Sending…" : "Send sign-in code"}
              </button>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 mb-1.5">
                  Verification code
                </span>
                <input
                  type="text"
                  name="token"
                  required
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6,10}"
                  maxLength={10}
                  placeholder="123456"
                  className="input font-mono tracking-[0.3em] text-center text-base"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="btn btn-lg btn-primary w-full"
              >
                {pending ? "Verifying…" : "Verify and sign in"}
              </button>
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setStage("email");
                  setEmail("");
                  setError(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Scheduling for service providers who book gigs.
        </p>
      </div>
    </main>
  );
}
