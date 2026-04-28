"use client";

import { useState, type FormEvent } from "react";
import { updateProfileAction } from "../profile-actions";

/**
 * Profile section — replaces the previous "Workspace" card on the
 * settings page. Shows and edits the current user's name, email,
 * phone, and home address.
 *
 * Saving the name also syncs workspace.name so the rest of the app
 * (calendar headers, agenda subhead) reads the user's name instead of
 * an unrelated "workspace" label.
 *
 * Email changes go through Supabase Auth's confirmation flow —
 * supabase.auth.updateUser({ email }) sends a confirmation link to
 * the new address; the change doesn't take effect until the user
 * clicks it.
 */
export function ProfileSection({
  initialName,
  initialEmail,
  initialPhone,
  initialHomeAddress,
}: {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialHomeAddress: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [homeAddress, setHomeAddress] = useState(initialHomeAddress);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const form = new FormData();
    form.set("name", name);
    form.set("email", email);
    form.set("phone", phone);
    form.set("home_address", homeAddress);

    const result = await updateProfileAction(form);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.emailChange) {
      setMessage(
        `Profile saved. Confirm your new email at ${result.emailChange.sentTo} — the change takes effect after you click the link.`,
      );
    } else {
      setMessage("Profile saved.");
    }
  }

  return (
    <section className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">Your profile</h2>
        <p className="text-sm text-slate-600 mt-1">
          Your name shows up on the calendar header and on bookings you
          assign to yourself.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Full name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              placeholder="Danny West"
              className="input"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="input"
            />
            <span className="block text-[11px] text-slate-500 mt-1">
              Changing email sends a confirmation link to the new address.
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Phone
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={40}
              placeholder="(555) 123-4567"
              className="input"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Home address
            </span>
            <input
              type="text"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              maxLength={500}
              placeholder="Optional — used only on your profile"
              className="input"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="btn btn-md btn-primary"
          >
            {pending ? "Saving…" : "Save profile"}
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
