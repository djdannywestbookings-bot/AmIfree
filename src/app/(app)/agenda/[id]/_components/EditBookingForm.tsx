"use client";

import { useState, type FormEvent } from "react";
import { updateBookingAction, deleteFromEditAction } from "../actions";
import { type BookingRow } from "@/modules/bookings";
import type { VenueRow } from "@/modules/venues";
import type { WorkspaceMemberRow } from "@/modules/auth";
import { DatePicker } from "../../_components/DatePicker";
import { TimeInput } from "../../_components/TimeInput";
import { DurationInput } from "../../_components/DurationInput";
import { VenueSelect } from "../../_components/VenueSelect";
import { EmployeeSelect } from "../../_components/EmployeeSelect";

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

/**
 * The status dropdown surfaces only two user-facing choices —
 * Confirmed (writes "booked") and Not confirmed (writes "hold") —
 * because that's the only distinction this audience cares about.
 * The DB enum keeps its full lifecycle ("inquiry"/"hold"/.../"completed")
 * so calendar pills, ICS export, and reports keep their richer
 * coloring; we just present the simplest 2-state view in the form.
 *
 * Existing rows with statuses other than "booked" are presented as
 * "Not confirmed" — saving will normalize them to "hold".
 */
function statusToUiKey(s: string): "confirmed" | "not_confirmed" {
  return s === "booked" ? "confirmed" : "not_confirmed";
}
function uiKeyToStatus(k: "confirmed" | "not_confirmed"): "booked" | "hold" {
  return k === "confirmed" ? "booked" : "hold";
}

export function EditBookingForm({
  booking,
  venues,
  employees,
  currentMemberId,
}: {
  booking: BookingRow;
  venues: VenueRow[];
  employees: WorkspaceMemberRow[];
  currentMemberId?: string | null;
}) {
  const initialDateTime = splitIsoToDateAndTime(booking.start_at);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<{ hard: string[]; possible: string[] } | null>(null);

  const [title, setTitle] = useState(booking.title);
  const [statusUi, setStatusUi] = useState<"confirmed" | "not_confirmed">(
    statusToUiKey(booking.status),
  );
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
    setConflicts(null);

    const form = new FormData();
    form.set("id", booking.id);
    form.set("title", title);
    form.set("status", uiKeyToStatus(statusUi));
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

    // Pull venue fields from VenueSelect's hidden inputs (it manages
    // its own state since the dropdown vs inline-create choice is its
    // concern, not the parent form's).
    const formEl = event.currentTarget;
    const venueId = (formEl.elements.namedItem("venue_id") as HTMLInputElement | null)?.value ?? "";
    const newVenueName = (formEl.elements.namedItem("new_venue_name") as HTMLInputElement | null)?.value ?? "";
    const newVenueAddress = (formEl.elements.namedItem("new_venue_address") as HTMLInputElement | null)?.value ?? "";
    if (venueId) form.set("venue_id", venueId);
    if (newVenueName) form.set("new_venue_name", newVenueName);
    if (newVenueAddress) form.set("new_venue_address", newVenueAddress);

    if (location) form.set("location", location);
    if (pay) form.set("pay", pay);
    if (notes) form.set("notes", notes);

    const result = await updateBookingAction(form);
    setPending(false);
    if (result && !result.ok) {
      setError(result.error);
      if (result.conflicts) setConflicts(result.conflicts);
    }
    // Success path redirects via the server action.
  }

  return (
    <>
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
            value={statusUi}
            onChange={(e) =>
              setStatusUi(e.target.value as "confirmed" | "not_confirmed")
            }
            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm bg-white"
          >
            <option value="confirmed">Confirmed</option>
            <option value="not_confirmed">Not confirmed</option>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Venue
          </span>
          <VenueSelect venues={venues} initialVenueId={booking.venue_id} />
        </div>
        <div>
          <span className="block text-xs font-medium text-neutral-700 mb-1">
            Assigned to
          </span>
          <EmployeeSelect
            employees={employees}
            initialAssignedId={booking.assigned_employee_id}
            currentMemberId={currentMemberId}
          />
        </div>
      </div>

      <details open={Boolean(location)}>
        <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-700">
          + Free-form location (one-off / not on venue list)
        </summary>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={500}
          placeholder="Hotel ballroom downtown, client's house, etc."
          className="mt-2 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </details>

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
        <div className="text-xs rounded border border-red-200 bg-red-50 text-red-700 p-2 space-y-1" role="alert">
          <div className="font-medium">{error}</div>
          {conflicts && conflicts.hard.length > 0 && (
            <ul className="list-disc list-inside">
              {conflicts.hard.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 text-sm disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <a
          href="/agenda"
          className="text-xs rounded border border-neutral-300 py-2 px-4 hover:bg-neutral-50"
        >
          Cancel
        </a>
      </div>
    </form>

    {/* Delete is intentionally a sibling — nested HTML forms get
        collapsed by the browser, which silently swallowed clicks on
        the old in-form Delete button. Its own form posts to
        deleteFromEditAction with a confirm() guard. */}
    <div className="mt-3 flex justify-end">
      <DeleteShiftButton bookingId={booking.id} title={booking.title} />
    </div>
    </>
  );
}

function DeleteShiftButton({
  bookingId,
  title,
}: {
  bookingId: string;
  title: string;
}) {
  return (
    <form
      action={deleteFromEditAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Delete "${title}"? This can't be undone.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={bookingId} />
      <button
        type="submit"
        className="text-xs rounded border border-red-300 bg-red-50 text-red-700 py-2 px-4 hover:bg-red-100"
      >
        Delete shift
      </button>
    </form>
  );
}
