"use client";

import { useState, type FormEvent } from "react";
import { sendOtp, verifyOtp } from "./actions";

type Stage = "email" | "otp";

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
    <main className="min-h-dvh flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-2">AmIFree</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Sign in to continue.
        </p>

        {stage === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm mb-1">Email</span>
              <input
                type="email"
                name="email"
                required
                autoFocus
                autoComplete="email"
                className="w-full rounded border border-neutral-300 px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded bg-neutral-900 text-white py-2 disabled:opacity-50"
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
            <p className="text-sm text-neutral-600">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
            </p>
            <label className="block">
              <span className="block text-sm mb-1">Code</span>
              <input
                type="text"
                name="token"
                required
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                className="w-full rounded border border-neutral-300 px-3 py-2 bg-transparent font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded bg-neutral-900 text-white py-2 disabled:opacity-50"
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
              className="text-xs text-neutral-500 underline"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
