"use client";

import { useState, type FormEvent } from "react";
import { createBookingAction } from "../actions";
import { BOOKING_STATUSES } from "@/modules/bookings";

/**
 * Inline create-booking form. Phase 24C MVP — minimal fields the
 * booking can be saved with. Missing-info flags (Time TBD, no contact
 * captured, etc.) are computed at the app layer and will get UI
 * surface in a later phase.
 */
export function BookingForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await createBookingAction(form);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // Success — reset the form.
    event.currentTarget.reset();
    setExpanded(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-200 rounded-md p-4 bg-white space-y-3"
    >
      <div className="flex items-end gap-2">
        <label className="block flex-1">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            New booking
          </span>
          <input
            type="text"
            name="title"
            required
            maxLength={200}
            placeholder="Smith Wedding, Saturday headliner, Client consult…"
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            onFocus={() => setExpanded(true)}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-neutral-900 text-white py-2 px-4 text-sm disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Status
            </span>
            <select
              name="status"
              defaultValue="inquiry"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm bg-white"
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Start
            </span>
            <input
              type="datetime-local"
              name="start_at"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              End
            </span>
            <input
              type="datetime-local"
              name="end_at"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>

          <label className="flex items-center gap-2 pt-5">
            <input type="checkbox" name="all_day" />
            <span className="text-xs text-neutral-700">All day</span>
          </label>

          <label className="block sm:col-span-2">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Notes
            </span>
            <textarea
              name="notes"
              rows={2}
              maxLength={10000}
              placeholder="Location, pay, contact, any context…"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
