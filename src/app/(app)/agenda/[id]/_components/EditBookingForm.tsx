"use client";

import { useState, type FormEvent } from "react";
import { updateBookingAction, deleteFromEditAction } from "../actions";
import { BOOKING_STATUSES, type BookingRow } from "@/modules/bookings";
import { DatePicker } from "../../_components/DatePicker";
import { TimeInput } from "../../_components/TimeInput";
import { DurationInput } from "../../_components/DurationInput";

function splitIsoToDateAndTime(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  const yyyy = String(d.getFullYear()).padStart(4, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${HH}:${MM}` };
}

function combineDateAndTime(date: string, time: string): string | null {
  const dMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const tMatch = time.match(/^(\d{2}):(\d{2})$/);
  if (!dMatch || !tMatch) return null;
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

function durationMinutesFromStartEnd(
  startIso: string | null,
  endIso: string | null,
): string {
  if (!startIso || !endIso) return "";
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return "";
  return String(Math.round((e - s) / 60_000));
}

export function EditBookingForm({ booking }: { booking: BookingRow }) {
  const initialDateTime = splitIsoToDateAndTime(booking.start_at);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(booking.title);
  const [status, setStatus] = useState(booking.status);
  const [allDay, setAllDay] = useState(booking.all_day);
  const [date, setDate] = useState(initialDateTime.date);
  const [startTime, setStartTime] = useState(initialDateTime.time);
  const [durationMinutes, setDurationMinutes] = useState(
    durationMinutesFromStartEnd(booking.start_at, booking.end_at),
  );
  const [location, setLocation] = useState(booking.location ?? "");
  const [pay, setPay] = useState(booking.pay ?? "");
  const [notes, setNotes] = useState(booking.notes ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData();
    form.set("id", booking.id);
    form.set("title", title);
    form.set("status", status);
    if (allDay) form.set("all_day", "on");

    if (date && startTime) {
      const combined = combineDateAndTime(date, startTime);
      if (combined) {
        form.set("start_at", combined);
        if (durationMinutes) {
          const mins = Number(durationMinutes);
          if (Number.isFinite(mins) && mins > 0) {
            const end = new Date(new Date(combined).getTime() + mins * 60_000);
            form.set("end_at", end.toISOString());
          }
        }
      }
    } else if (date && allDay) {
      form.set("start_at", combineDateAndTime(date, "00:00") ?? "");
    }

    if (location) form.set("location", location);
    if (pay) form.set("pay", pay);
    if (notes) form.set("notes", notes);

    const result = await updateBookingAction(form);
    setPending(false);
    if (result && !result.ok) {
      setError(result.error);
    }
    // Success path redirects via the server action.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-neutral-200 rounded-md p-4 bg-white">
      <label className="block">
        <span className="block text-xs font-medium text-neutral-700 mb-1">
          Title
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
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
          <DatePicker value={date} onChange={setDate} name="_edit_date" />
        </div>

        <div>
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Start time
          </span>
          <TimeInput value={startTime} onChange={setStartTime} name="_edit_start" />
        </div>

        <div>
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Duration
          </span>
          <DurationInput
            value={durationMinutes}
            onChange={setDurationMinutes}
            name="_edit_duration"
          />
        </div>
      </div>

      <label className="block">
        <span className="block text-xs font-medium text-neutral-700 mb-1">
          Location
        </span>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={500}
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-medium text-neutral-700 mb-1">
          Pay
        </span>
        <input
          type="text"
          value={pay}
          onChange={(e) => setPay(e.target.value)}
          maxLength={200}
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-medium text-neutral-700 mb-1">
          Notes
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={10000}
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </label>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-neutral-900 text-white py-2 px-4 text-sm disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <div className="flex items-center gap-2">
          <a
            href="/agenda"
            className="text-xs rounded border border-neutral-300 py-2 px-4 hover:bg-neutral-50"
          >
            Cancel
          </a>
        </div>
      </div>

      {/* Separate destructive action — uses its own server action */}
      <details className="pt-2 border-t border-neutral-200">
        <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700">
          Danger zone
        </summary>
        <form action={deleteFromEditAction} className="mt-2">
          <input type="hidden" name="id" value={booking.id} />
          <button
            type="submit"
            className="text-xs rounded border border-red-200 text-red-700 py-1.5 px-3 hover:bg-red-50"
          >
            Delete this booking
          </button>
        </form>
      </details>
    </form>
  );
}
