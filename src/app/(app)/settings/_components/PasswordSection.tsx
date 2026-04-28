"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { updatePasswordAction } from "../password-actions";

/**
 * Change-password card on the settings page.
 *
 * Three fields: current password, new password (with show/hide eye),
 * confirm. Validates client-side that the new password is 8+ chars and
 * matches confirm before submitting; the server re-validates and also
 * verifies the current password.
 *
 * For OAuth-only users who don't have a password yet, the server
 * surfaces a redirect-style message pointing at /forgot-password — set
 * a first password via the recovery flow, then return here to change
 * it normally.
 */
export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    setShowNew(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const form = new FormData();
    form.set("current_password", currentPassword);
    form.set("new_password", newPassword);
    form.set("confirm", confirm);

    const result = await updatePasswordAction(form);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    reset();
    setMessage("Password updated.");
  }

  const newOk = newPassword.length >= 8;
  const matchOk = confirm.length === 0 || confirm === newPassword;
  const canSubmit =
    currentPassword.length > 0 && newOk && newPassword === confirm;

  return (
    <section className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">Password</h2>
        <p className="text-sm text-slate-600 mt-1">
          Change the password on this account. Need to set one for the
          first time?{" "}
          <Link
            href="/forgot-password"
            className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
          >
            Use Forgot password
          </Link>{" "}
          — Supabase emails you a link to set one without needing the
          current one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Current password
          </span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="input"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            New password
          </span>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="8 characters minimum"
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {newPassword.length > 0 && !newOk && (
            <span className="block text-[11px] text-amber-700 mt-1">
              {8 - newPassword.length} more character
              {8 - newPassword.length === 1 ? "" : "s"}.
            </span>
          )}
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Confirm new password
          </span>
          <input
            type={showNew ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className={`input ${!matchOk ? "border-red-400 focus:ring-red-500/25 focus:border-red-500" : ""}`}
          />
          {!matchOk && (
            <span className="block text-[11px] text-red-600 mt-1">
              Passwords don&rsquo;t match.
            </span>
          )}
        </label>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending || !canSubmit}
            className="btn btn-md btn-primary"
          >
            {pending ? "Updating…" : "Update password"}
          </button>
          {message && (
            <span className="text-xs text-emerald-700">{message}</span>
          )}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </form>
    </section>
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
