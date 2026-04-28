"use client";

import { useState, type FormEvent } from "react";
import { updateProfileAction } from "../profile-actions";
import { buildMapsUrl } from "@/lib/maps-link";

/**
 * Profile section — replaces the previous "Workspace" card on the
 * settings page. Shows and edits the current user's name, email,
 * phone, and home address (split into street / city / state / zip
 * since migration 0017).
 *
 * Email is read-only by default with an explicit "Change email"
 * button that gates the change behind the current password —
 * users won't accidentally start an email change just by tabbing
 * through. Once started, the email field is editable plus an
 * amber security panel asks for the current password. Server
 * verifies via supabase.auth.signInWithPassword + then calls
 * supabase.auth.updateUser({ email }) which sends a confirmation
 * link to the new address.
 *
 * Saving the profile name also syncs workspace.name so the rest of
 * the app reads the user's name instead of an unrelated workspace
 * label.
 */
export function ProfileSection({
  initialName,
  initialEmail,
  initialPhone,
  initialHomeAddress,
  initialHomeCity,
  initialHomeState,
  initialHomeZip,
}: {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  initialHomeAddress: string;
  initialHomeCity: string;
  initialHomeState: string;
  initialHomeZip: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [homeAddress, setHomeAddress] = useState(initialHomeAddress);
  const [homeCity, setHomeCity] = useState(initialHomeCity);
  const [homeState, setHomeState] = useState(initialHomeState);
  const [homeZip, setHomeZip] = useState(initialHomeZip);

  const [editingEmail, setEditingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const emailChanged =
    editingEmail &&
    email.trim().toLowerCase() !== initialEmail.trim().toLowerCase();

  // Build a maps URL for the current home address so the saved value
  // is one tap away from "open in Maps." Only visible after save.
  const savedAddressMapsUrl = buildMapsUrl(
    initialHomeAddress,
    initialHomeCity,
    initialHomeState,
    initialHomeZip,
  );

  function startEditingEmail() {
    setEditingEmail(true);
    setMessage(null);
    setError(null);
  }

  function cancelEditingEmail() {
    setEditingEmail(false);
    setEmail(initialEmail);
    setCurrentPassword("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const form = new FormData();
    form.set("name", name);
    if (editingEmail) form.set("email", email);
    form.set("phone", phone);
    form.set("home_address", homeAddress);
    form.set("home_city", homeCity);
    form.set("home_state", homeState);
    form.set("home_zip", homeZip);
    if (emailChanged) form.set("current_password", currentPassword);

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
      setCurrentPassword("");
      setEditingEmail(false);
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
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Full name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="input"
          />
        </label>

        {/* Email — read-only display + Change email button. Changing
         *  is gated by the current-password challenge below. */}
        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-slate-700">
            Email
          </span>
          {!editingEmail ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 input bg-slate-50 text-slate-700 flex items-center select-text">
                {initialEmail || (
                  <span className="text-slate-400 italic">
                    No email on file — click Change to set one.
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={startEditingEmail}
                className="btn btn-md btn-secondary shrink-0"
              >
                Change email
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="input flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={cancelEditingEmail}
                  className="btn btn-md btn-ghost shrink-0"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                We&rsquo;ll send a confirmation link to the new address.
                The change activates only after you click it.
              </p>

              {emailChanged && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 space-y-2 animate-fade-in">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Security check.</strong> Enter your current
                    password to confirm.
                  </p>
                  <label className="block">
                    <span className="block text-xs font-medium text-slate-700 mb-1">
                      Current password
                    </span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      autoComplete="current-password"
                      className="input"
                      required
                    />
                    <span className="block text-[11px] text-slate-500 mt-1">
                      Signed in with Apple or Google?{" "}
                      <a
                        href="/forgot-password"
                        className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
                      >
                        Set a password first
                      </a>
                      .
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Phone
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={40}
            className="input"
          />
        </label>

        {/* Home address — split into street / city / state / zip so the
         *  whole thing can be passed to a maps URL cleanly. */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <span className="block text-xs font-medium text-slate-700">
              Home address
            </span>
            {savedAddressMapsUrl && (
              <a
                href={savedAddressMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
              >
                Open in Maps ↗
              </a>
            )}
          </div>
          <input
            type="text"
            value={homeAddress}
            onChange={(e) => setHomeAddress(e.target.value)}
            maxLength={500}
            aria-label="Street"
            className="input"
          />
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-2">
            <input
              type="text"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              maxLength={120}
              aria-label="City"
              className="input"
            />
            <input
              type="text"
              value={homeState}
              onChange={(e) => setHomeState(e.target.value)}
              maxLength={60}
              aria-label="State"
              className="input"
            />
            <input
              type="text"
              value={homeZip}
              onChange={(e) => setHomeZip(e.target.value)}
              maxLength={20}
              aria-label="ZIP"
              inputMode="numeric"
              className="input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-2 -mt-1">
            <span className="text-[11px] text-slate-500">Street</span>
            <span className="text-[11px] text-slate-500 hidden sm:block">
              City
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:block">
              State / ZIP
            </span>
          </div>
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
