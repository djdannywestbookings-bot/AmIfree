"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { updatePassword } from "./actions";

/**
 * /reset-password — set a new password.
 *
 * Lands here after the user clicks a Supabase recovery email link;
 * /auth/callback exchanges the recovery code into a temporary
 * authenticated session. If the user hits this URL without a session
 * the form posts and the server action returns an explanatory error.
 */
export default function ResetPasswordPage() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await updatePassword(form);
    setPending(false);
    if (result && !result.ok) setError(result.error);
    // On success, the action redirects to /calendar.
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
            Set a new password
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            8 characters minimum. We&rsquo;ll sign you in once it&rsquo;s set.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                New password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={8}
                  autoFocus
                  autoComplete="new-password"
                  placeholder="8 characters minimum"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm password
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="confirm"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Type it again"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`input ${confirm && confirm !== password ? "border-red-400 focus:ring-red-500/25 focus:border-red-500" : ""}`}
              />
              {confirm && confirm !== password && (
                <p className="mt-1 text-xs text-red-600">
                  Passwords don&rsquo;t match.
                </p>
              )}
            </label>
            <button
              type="submit"
              disabled={
                pending ||
                password.length < 8 ||
                password !== confirm
              }
              className="btn btn-lg btn-primary w-full"
            >
              {pending ? "Updating…" : "Update password & sign in"}
            </button>
          </form>

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

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
