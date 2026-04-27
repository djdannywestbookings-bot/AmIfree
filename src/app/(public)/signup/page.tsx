"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signInWithApple, signInWithGoogle } from "../login/oauth-actions";
import { signUpWithPassword } from "./actions";

/**
 * /signup — create-an-account surface.
 *
 * Mirrors /login layout: dark product panel left, auth card right.
 * Apple/Google buttons at the top, divider, then email + password +
 * confirm with a strength meter. Minimum 8 characters, no symbol
 * complexity rules.
 */
export default function SignupPage() {
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "apple" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await signUpWithPassword(form);
    setPending(false);

    if (result?.ok) {
      // If Supabase's email-confirmation flow is enabled, the action
      // returned ok without redirecting. Show a "check your email"
      // confirmation state here. (If confirmation is disabled, the
      // action redirected to /calendar and we never reach this code.)
      const submittedEmail = String(form.get("email") ?? "");
      setSuccessEmail(submittedEmail);
      setDone(true);
    } else {
      setError(result?.error ?? "Could not create account. Try again.");
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setOauthPending(provider);
    setError(null);
    try {
      if (provider === "google") await signInWithGoogle();
      else await signInWithApple();
    } catch (err) {
      if (err instanceof Error && err.message === "NEXT_REDIRECT") return;
      setOauthPending(null);
      setError("Sign-in unavailable. Try email instead.");
    }
  }

  return (
    <main className="min-h-dvh grid md:grid-cols-2 bg-slate-950">
      {/* LEFT — product panel. Hidden on mobile. */}
      <aside className="relative hidden md:flex flex-col justify-between p-10 lg:p-14 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,229,0.18),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(20,184,166,0.12),transparent_55%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
        />

        <div className="relative">
          <Link
            href="/"
            className="inline-block font-bold tracking-tight text-xl"
          >
            <span className="text-indigo-400">AmI</span>
            <span className="text-teal-400">Free</span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-tight">
            One paste away from a
            <br />
            <span className="text-slate-400">calendar that stays current.</span>
          </h2>
          <p className="mt-5 text-slate-400 text-sm leading-relaxed">
            AmIFree pulls the gig out of any client message and warns you
            before you double-book. Free forever for solo bookers.
          </p>
        </div>

        <div className="relative text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-teal-400" />
            <span>Built for working gig pros</span>
          </div>
          <p>© {new Date().getFullYear()} AmIFree</p>
        </div>
      </aside>

      {/* RIGHT — auth card. */}
      <section className="flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50 md:bg-slate-50 md:bg-none">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex md:hidden items-center justify-center mb-6">
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
              {done ? "Check your email" : "Create your account"}
            </h1>
            <p className="text-sm text-slate-500 mb-5">
              {done
                ? <>We sent a confirmation link to <strong className="text-slate-700">{successEmail}</strong>. Click it to finish setting up.</>
                : "30 seconds. No credit card. No password rules."}
            </p>

            {!done && (
              <>
                {/* OAuth buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleOAuth("apple")}
                    disabled={oauthPending !== null || pending}
                    className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-md bg-black text-white text-sm font-medium hover:bg-neutral-800 active:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
                  >
                    <AppleLogo />
                    {oauthPending === "apple"
                      ? "Continuing…"
                      : "Continue with Apple"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuth("google")}
                    disabled={oauthPending !== null || pending}
                    className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-md bg-white text-slate-900 text-sm font-medium border border-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                  >
                    <GoogleLogo />
                    {oauthPending === "google"
                      ? "Continuing…"
                      : "Continue with Google"}
                  </button>
                </div>

                <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
                  <span className="flex-1 h-px bg-slate-200" />
                  or sign up with email
                  <span className="flex-1 h-px bg-slate-200" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <label className="block">
                    <span className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      defaultValue=""
                      placeholder="you@example.com"
                      className="input"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-slate-700 mb-1.5">
                      Password
                    </span>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        minLength={8}
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
                    <PasswordStrength password={password} />
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
                      oauthPending !== null ||
                      password.length < 8 ||
                      password !== confirm
                    }
                    className="btn btn-lg btn-primary w-full"
                  >
                    {pending ? "Creating account…" : "Create account"}
                  </button>
                </form>
              </>
            )}

            {error && (
              <p
                className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          <div className="text-center text-xs text-slate-500 mt-5 leading-relaxed space-y-1">
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
            <p className="text-slate-400">We never share your email.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- *
 * PasswordStrength — bar + label below the password field
 * -------------------------------------------------------------------------- */

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  // Simple scoring: length, character class variety. Result: 0-3.
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z\d]/.test(password);
  const variety = [hasLetter, hasNumber, hasSymbol].filter(Boolean).length;
  if (variety >= 2) score += 1;
  // Cap the meaningful score at 3.

  const label =
    password.length < 8 ? "Too short" : score === 1 ? "Weak" : score === 2 ? "Medium" : "Strong";
  const color =
    password.length < 8
      ? "bg-red-500"
      : score === 1
      ? "bg-amber-500"
      : score === 2
      ? "bg-yellow-500"
      : "bg-teal-500";
  const fillPct =
    password.length < 8 ? 33 : score === 1 ? 33 : score === 2 ? 66 : 100;

  return (
    <div className="mt-1.5">
      <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-200`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        {label}
        {password.length < 8 && ` — ${8 - password.length} more`}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 * Icons
 * -------------------------------------------------------------------------- */

function AppleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
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
