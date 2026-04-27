"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";

/**
 * /forgot-password — request a reset link.
 *
 * Always returns ok visually so the allowlist isn't enumerable. If
 * the email exists, Supabase sends a recovery link that lands at
 * /auth/callback?next=/reset-password and signs the user in with a
 * recovery session. The /reset-password page then lets them set a
 * new password.
 */
export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await requestPasswordReset(form);
    setPending(false);

    if (result.ok) {
      setSentEmail(result.email);
      setSent(true);
    } else {
      setError(result.error);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50">
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

        <div className="card p-6 sm:p-7">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">
            {sent ? "Check your email" : "Reset your password"}
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            {sent
              ? (
                  <>
                    If <strong className="text-slate-700">{sentEmail}</strong>{" "}
                    has an account, a reset link is on its way. The link
                    expires in 1 hour.
                  </>
                )
              : "Enter your email and we'll send a one-time link to set a new password."}
          </p>

          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-3">
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
                  defaultValue=""
                  placeholder="you@example.com"
                  className="input"
                />
              </label>
              <button
                type="submit"
                disabled={pending}
                className="btn btn-lg btn-primary w-full"
              >
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          {error && (
            <p
              className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="mt-5 text-center text-xs text-slate-500">
            <Link
              href="/login"
              className="text-slate-500 hover:text-indigo-600 transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
