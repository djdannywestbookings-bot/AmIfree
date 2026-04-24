"use client";

import { useState, type FormEvent } from "react";
import { createBookingAction } from "../actions";
import { BOOKING_STATUSES } from "@/modules/bookings";
import { DatePicker } from "./DatePicker";
import { TimeInput } from "./TimeInput";
import { DurationInput } from "./DurationInput";

/**
 * Inline create-booking form (Phase 24D).
 *
 * Replaces the native datetime-local inputs with:
 *   - DatePicker       (month + year dropdowns, day grid)
 *   - TimeInput        (flexible text: "10pm", "22:00", "2225", …)
 *   - DurationInput    (flexible text: "4h", "2h30m", "45m", …)
 *
 * On submit, date + start time → start_at ISO. If duration is set,
 * end_at = start_at + duration. If duration is empty, end_at is omitted.
 * The server action schema already accepts start_at and end_at as ISO
 * strings, so no server changes required.
 */

function combineDateAndTime(
  date: string, // YYYY-MM-DD
  time: string, // HH:MM (24h)
): string | null {
  const dMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tMatch = time.match(/^(\d{2}):(\d{2})$/);
  if (!dMatch || !tMatch) return null;
  // Construct as local time; browser will produce the correct ISO with offset.
  const d = new Date(
    Number(dMatch[1]),
    Number(dMatch[2]) - 1,
    Number(dMatch[3]),
    Number(tMatch[1]),
    Number(tMatch[2]),
    0,
    0,
  );
  return d.toISOString();
}

export function BookingForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("inquiry");
  const [allDay, setAllDay] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  function resetForm() {
    setTitle("");
    setStatus("inquiry");
    setAllDay(false);
    setDate("");
    setStartTime("");
    setDurationMinutes("");
    setExpanded(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    // Build the outgoing FormData — the server action reads these
    // field names via getOrUndef().
    const form = new FormData();
    form.set("title", title);
    form.set("status", status);
    if (allDay) form.set("all_day", "on");

    let startIso = "";
    let endIso = "";

    if (date && startTime) {
      const combined = combineDateAndTime(date, startTime);
      if (!combined) {
        setPending(false);
        setError("Couldn't combine date + start time — check both fields.");
        return;
      }
      startIso = combined;

      if (durationMinutes) {
        const mins = Number(durationMinutes);
        if (Number.isFinite(mins) && mins > 0) {
          const endDate = new Date(new Date(combined).getTime() + mins * 60_000);
          endIso = endDate.toISOString();
        }
      }
    } else if (date && !startTime && allDay) {
      // All-day booking: anchor to midnight local; end_at stays null.
      startIso = combineDateAndTime(date, "00:00") ?? "";
    }

    if (startIso) form.set("start_at", startIso);
    if (endIso) form.set("end_at", endIso);

    // Structured free-form fields.
    const formEl = event.currentTarget;
    const location = (formEl.elements.namedItem("location") as HTMLInputElement | null)?.value ?? "";
    const pay = (formEl.elements.namedItem("pay") as HTMLInputElement | null)?.value ?? "";
    const notes = (formEl.elements.namedItem("notes") as HTMLTextAreaElement | null)?.value ?? "";
    if (location) form.set("location", location);
    if (pay) form.set("pay", pay);
    if (notes) form.set("notes", notes);

    const result = await createBookingAction(form);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    resetForm();
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
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
        <div className="space-y-3 pt-2 border-t border-neutral-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-neutral-700 mb-1">
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm bg-white"
              >
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              <span className="text-xs text-neutral-700">All day</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="block text-xs font-medium text-neutral-700 mb-1">
                Date
              </span>
              <DatePicker value={date} onChange={setDate} name="_datepicker_date" />
            </div>

            <div>
              <span className="block text-xs font-medium text-neutral-700 mb-1">
                Start time
              </span>
              <TimeInput
                value={startTime}
                onChange={setStartTime}
                name="_timepicker_start"
                placeholder="10pm, 22:00, 2225"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-neutral-700 mb-1">
                Duration
              </span>
              <DurationInput
                value={durationMinutes}
                onChange={setDurationMinutes}
                name="_durationpicker_minutes"
                placeholder="4h, 2h30m, 45m"
              />
            </div>
          </div>

          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Location
            </span>
            <input
              type="text"
              name="location"
              maxLength={500}
              placeholder="Venue name, address, or both"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Pay
            </span>
            <input
              type="text"
              name="pay"
              maxLength={200}
              placeholder="$300, 300 + tips, TBD, split 50/50…"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Notes
            </span>
            <textarea
              name="notes"
              rows={2}
              maxLength={10000}
              placeholder="Contact person, equipment needed, context…"
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
