"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { sendOtp, verifyOtp } from "./actions";
import { signInWithApple, signInWithGoogle } from "./oauth-actions";

type Stage = "email" | "otp";

/**
 * /login — redesigned auth surface.
 *
 * Layout:
 *  - Mobile: single column, gradient bg, card centered.
 *  - Desktop: split layout — left side dark product panel with the
 *    AmIFree wordmark + a value-prop line, right side the auth card.
 *
 * Auth priority (top → bottom):
 *  1. Continue with Apple
 *  2. Continue with Google
 *  3. divider
 *  4. Email magic link (existing OTP flow stays as fallback)
 *
 * Long-lived sessions are configured server-side in Supabase
 * (Auth → Sessions → 30 days). No "remember me" checkbox — we just
 * keep the user signed in.
 */
export default function LoginPage() {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "apple" | null>(
    null,
  );

  // Surface ?error=... from the OAuth callback. Reading via
  // window.location avoids the useSearchParams Suspense requirement
  // in Next 15 — this is a non-critical, post-mount enhancement.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get("error");
    if (e) setError(e);
  }, []);

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
    if (result && !result.ok) setError(result.error);
  }

  async function handleOAuth(provider: "google" | "apple") {
    setOauthPending(provider);
    setError(null);
    try {
      if (provider === "google") await signInWithGoogle();
      else await signInWithApple();
    } catch (err) {
      // The action redirects on success; only re-thrown errors arrive
      // here. Next's redirect() throws a special error we want to ignore.
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
          <Link href="/" className="inline-block font-bold tracking-tight text-xl">
            <span className="text-indigo-400">AmI</span>
            <span className="text-teal-400">Free</span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-tight">
            Paste a client text.
            <br />
            <span className="text-slate-400">Get a clean booking.</span>
          </h2>
          <p className="mt-5 text-slate-400 text-sm leading-relaxed">
            AmIFree pulls the gig out of any message and warns you before
            you double-book the date. Built for DJs, photographers, MCs,
            and the rest of us booking by text.
          </p>
        </div>

        <div className="relative text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1 h-1 rounded-full bg-teal-400" />
            <span>Used by working gig pros across the US</span>
          </div>
          <p>© {new Date().getFullYear()} AmIFree</p>
        </div>
      </aside>

      {/* RIGHT — auth card. */}
      <section className="flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50 md:bg-slate-50 md:bg-none">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile-only wordmark */}
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
              {stage === "email" ? "Sign in" : "Check your email"}
            </h1>
            <p className="text-sm text-slate-500 mb-5">
              {stage === "email"
                ? "Use Apple, Google, or email — no password needed."
                : (
                    <>
                      Code sent to{" "}
                      <strong className="text-slate-700">{email}</strong>
                    </>
                  )}
            </p>

            {stage === "email" ? (
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

                {/* Divider */}
                <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-400">
                  <span className="flex-1 h-px bg-slate-200" />
                  or sign in with email
                  <span className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Magic link */}
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <label className="block">
                    <span className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="input"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={pending || oauthPending !== null}
                    className="btn btn-lg btn-primary w-full"
                  >
                    {pending ? "Sending…" : "Send sign-in code"}
                  </button>
                </form>
              </>
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

            {error && (
              <p
                className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          <p className="text-center text-xs text-slate-500 mt-5 leading-relaxed">
            New here?{" "}
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
            >
              See what AmIFree does →
            </Link>
            <br />
            We never share your email. No password needed.
          </p>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- *
 * Provider logos — inline SVG to match Apple + Google brand specs.
 * -------------------------------------------------------------------------- */

function AppleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
