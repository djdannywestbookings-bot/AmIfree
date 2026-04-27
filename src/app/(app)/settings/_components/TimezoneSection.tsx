"use client";

import { useState, type FormEvent } from "react";
import {
  updateWorkspaceTimezoneAction,
  shiftAllBookingTimesAction,
} from "../timezone-actions";

/**
 * Phase 36.5 — workspace timezone + one-shot time-shift fix.
 *
 * Two controls:
 *   1. Timezone picker (saves on submit)
 *   2. "Shift all booking times by N hours" — for bookings imported
 *      via AI extraction before the timezone-aware prompt shipped
 *      and stored as UTC instead of workspace-local.
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

  const [shiftHours, setShiftHours] = useState<string>("5");
  const [shifting, setShifting] = useState(false);
  const [shiftMessage, setShiftMessage] = useState<string | null>(null);
  const [shiftError, setShiftError] = useState<string | null>(null);

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

  async function shiftTimes(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !window.confirm(
        `Shift EVERY booking's start and end times by ${shiftHours} hours? This rewrites every existing booking. Make sure you back up first if you're not sure.`,
      )
    ) {
      return;
    }
    setShifting(true);
    setShiftError(null);
    setShiftMessage(null);
    const form = new FormData();
    form.set("hours", shiftHours);
    const result = await shiftAllBookingTimesAction(form);
    setShifting(false);
    if (!result.ok) {
      setShiftError(result.error);
      return;
    }
    setShiftMessage(`Shifted ${result.updated} booking${result.updated === 1 ? "" : "s"}.`);
  }

  return (
    <section className="border border-neutral-200 rounded-md p-5 bg-white space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">Timezone</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Used to interpret times in pasted booking text and to align the iCal
          feed. Set this to wherever you actually book gigs.
        </p>
      </div>

      <form onSubmit={saveTimezone} className="space-y-2">
        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Workspace timezone
          </span>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm bg-white"
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
            className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-sm disabled:opacity-50"
          >
            {savingTz ? "Saving…" : "Save timezone"}
          </button>
          {tzMessage && (
            <span className="text-xs text-emerald-700">{tzMessage}</span>
          )}
          {tzError && <span className="text-xs text-red-600">{tzError}</span>}
        </div>
      </form>

      <div className="border-t border-neutral-200 pt-4 space-y-2">
        <h3 className="text-sm font-semibold text-neutral-800">
          Fix imported booking times
        </h3>
        <p className="text-xs text-neutral-600 max-w-2xl">
          One-time tool: shift every booking&apos;s start/end by a fixed number
          of hours. Use this if your AI-imported bookings are off (e.g. they
          show 5 hours earlier than expected on Google Calendar). Central Time
          users typically shift by <strong>-5</strong> (CDT) or{" "}
          <strong>-6</strong> (CST). Run once, then verify on /calendar.
        </p>
        <form onSubmit={shiftTimes} className="flex items-end gap-2 flex-wrap">
          <label className="block">
            <span className="block text-[11px] font-medium text-neutral-600 mb-1">
              Hours
            </span>
            <input
              type="number"
              min={-23}
              max={23}
              value={shiftHours}
              onChange={(e) => setShiftHours(e.target.value)}
              className="w-24 rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={shifting}
            className="text-xs rounded border border-amber-300 bg-amber-50 text-amber-800 px-3 py-1.5 hover:bg-amber-100 disabled:opacity-50"
          >
            {shifting ? "Shifting…" : "Shift all bookings"}
          </button>
          {shiftMessage && (
            <span className="text-xs text-emerald-700">{shiftMessage}</span>
          )}
          {shiftError && (
            <span className="text-xs text-red-600">{shiftError}</span>
          )}
        </form>
      </div>
    </section>
  );
}
