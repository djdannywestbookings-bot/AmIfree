"use client";

import { useState, type FormEvent } from "react";
import { updateWorkspaceTimezoneAction } from "../timezone-actions";

/**
 * Timezone picker — anchors AI-extracted booking times and aligns the
 * iCal feed. Set this to wherever you actually book gigs.
 *
 * The "Fix imported booking times" tool that used to live in this
 * section has been retired — the AI extraction is timezone-aware now
 * and the bulk shift is no longer needed.
 */

const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: "America/Chicago", label: "Central — Chicago / Dallas / Houston" },
  { value: "America/New_York", label: "Eastern — New York / Atlanta / Miami" },
  { value: "America/Denver", label: "Mountain — Denver / Salt Lake City" },
  { value: "America/Los_Angeles", label: "Pacific — Los Angeles / Seattle" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  { value: "Europe/London", label: "UK — London" },
  { value: "Europe/Paris", label: "Central Europe — Paris / Berlin" },
  { value: "UTC", label: "UTC (no offset)" },
];

export function TimezoneSection({
  initialTimezone,
}: {
  initialTimezone: string;
}) {
  const [timezone, setTimezone] = useState(initialTimezone);
  const [savingTz, setSavingTz] = useState(false);
  const [tzMessage, setTzMessage] = useState<string | null>(null);
  const [tzError, setTzError] = useState<string | null>(null);

  async function saveTimezone(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingTz(true);
    setTzError(null);
    setTzMessage(null);
    const form = new FormData();
    form.set("timezone", timezone);
    const result = await updateWorkspaceTimezoneAction(form);
    setSavingTz(false);
    if (!result.ok) {
      setTzError(result.error);
      return;
    }
    setTzMessage(`Timezone updated to ${timezone}.`);
  }

  return (
    <section className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">Timezone</h2>
        <p className="text-sm text-slate-600 mt-1">
          Used to interpret times in pasted booking text and to align the
          iCal feed. Set this to wherever you actually book gigs.
        </p>
      </div>

      <form onSubmit={saveTimezone} className="space-y-3">
        <label className="block">
          <span className="block text-xs font-medium text-slate-700 mb-1">
            Workspace timezone
          </span>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="input"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label} — {tz.value}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={savingTz}
            className="btn btn-md btn-primary"
          >
            {savingTz ? "Saving…" : "Save timezone"}
          </button>
          {tzMessage && (
            <span className="text-xs text-emerald-700">{tzMessage}</span>
          )}
          {tzError && <span className="text-xs text-red-600">{tzError}</span>}
        </div>
      </form>
    </section>
  );
}
