"use client";

import { useState, type FormEvent } from "react";
import { clockInAction, clockOutAction } from "../actions";
import type { TimePunchRow } from "@/modules/punches";

/**
 * ClockInOutButtons — Phase 42.
 *
 * If a punch is open, render a big "Clock out" button with elapsed
 * timer (display-only). Otherwise render a "Clock in" button + an
 * optional dropdown of upcoming assigned shifts to attach the punch
 * to.
 */
export function ClockInOutButtons({
  openPunch,
  eligibleBookings,
}: {
  openPunch: TimePunchRow | null;
  eligibleBookings: { id: string; title: string; start_at: string | null }[];
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState("");

  async function handleClockIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData();
    if (bookingId) form.set("booking_id", bookingId);
    const result = await clockInAction(form);
    setPending(false);
    if (!result.ok) setError(result.error);
  }

  async function handleClockOut(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!openPunch) return;
    setPending(true);
    setError(null);
    const form = new FormData();
    form.set("punch_id", openPunch.id);
    const result = await clockOutAction(form);
    setPending(false);
    if (!result.ok) setError(result.error);
  }

  if (openPunch) {
    const startedAt = new Date(openPunch.clocked_in_at).toLocaleTimeString(
      undefined,
      { hour: "numeric", minute: "2-digit" },
    );
    return (
      <form
        onSubmit={handleClockOut}
        className="bg-white border border-amber-300 rounded-md p-4 flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse mr-2 align-middle" />
          <span className="font-medium text-amber-800">On the clock</span>
          <span className="ml-2 text-neutral-600">
            since {startedAt}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-xs text-red-600" role="alert">
              {error}
            </span>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {pending ? "Clocking out…" : "Clock out"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleClockIn}
      className="bg-white border border-neutral-200 rounded-md p-4 flex items-center justify-between gap-3 flex-wrap"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-neutral-600">Ready to clock in?</span>
        {eligibleBookings.length > 0 && (
          <select
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            className="text-sm rounded border border-neutral-300 px-2 py-1.5 bg-white"
          >
            <option value="">No specific shift</option>
            {eligibleBookings.map((b) => {
              const date = b.start_at
                ? new Date(b.start_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "TBD";
              return (
                <option key={b.id} value={b.id}>
                  {b.title} · {date}
                </option>
              );
            })}
          </select>
        )}
      </div>
      <div className="flex items-center gap-3">
        {error && (
          <span className="text-xs text-red-600" role="alert">
            {error}
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {pending ? "Clocking in…" : "Clock in"}
        </button>
      </div>
    </form>
  );
}
