"use client";

import Link from "next/link";
import type { BookingRow } from "@/modules/bookings";
import type { VenueRow } from "@/modules/venues";
import type { WorkspaceMemberRow } from "@/modules/auth";
import { deleteFromEditAction } from "../actions";

/**
 * Read-only Shift detail view.
 *
 * Default landing for /agenda/[id] — shows every field on the booking
 * and offers two actions: Edit shift (links to /agenda/[id]/edit) and
 * Delete shift (posts to deleteFromEditAction with a confirm guard).
 *
 * The Delete form is intentionally a top-level <form> so the click
 * actually submits — when it was nested inside the Edit form the
 * browser collapsed the inner form and clicks were swallowed.
 */
export function ShiftDetailView({
  booking,
  venue,
  assignee,
}: {
  booking: BookingRow;
  venue: VenueRow | null;
  assignee: WorkspaceMemberRow | null;
}) {
  const statusUi = booking.status === "booked" ? "Confirmed" : "Not confirmed";
  const statusClass =
    booking.status === "booked"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  const start = booking.start_at ? new Date(booking.start_at) : null;
  const end = booking.end_at ? new Date(booking.end_at) : null;

  const dateLabel =
    booking.all_day && booking.service_day
      ? `${booking.service_day} (all day)`
      : start
      ? start.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "Date TBD";

  const timeLabel = (() => {
    if (booking.all_day) return "All day";
    if (!start) return "Time TBD";
    const startStr = start.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    if (!end) return startStr;
    const endStr = end.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    // Duration in human form
    const durMin = Math.round((end.getTime() - start.getTime()) / 60_000);
    const durLabel =
      durMin >= 60
        ? `${Math.floor(durMin / 60)}h${durMin % 60 ? ` ${durMin % 60}m` : ""}`
        : `${durMin}m`;
    return `${startStr} – ${endStr}  ·  ${durLabel}`;
  })();

  const venueLabel = venue
    ? venue.address
      ? `${venue.name} · ${venue.address}`
      : venue.name
    : booking.location ?? null;

  const assigneeLabel = assignee
    ? assignee.name || assignee.email || "(no name)"
    : null;

  return (
    <article className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header — title + status pill */}
      <header className="px-5 sm:px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">
            {booking.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{dateLabel}</p>
        </div>
        <span
          className={`shrink-0 inline-block text-xs px-2.5 py-1 rounded border ${statusClass}`}
        >
          {statusUi}
        </span>
      </header>

      {/* Field grid */}
      <dl className="px-5 sm:px-6 py-5 space-y-4 text-sm">
        <Row label="Time" value={timeLabel} mono />

        {venueLabel && <Row label="Venue" value={venueLabel} />}

        {assigneeLabel && <Row label="Assigned to" value={assigneeLabel} />}

        {booking.pay && <Row label="Pay" value={booking.pay} />}

        {booking.notes && (
          <div className="grid grid-cols-[6.5rem_1fr] gap-3">
            <dt className="text-slate-500 text-xs font-medium uppercase tracking-wider mt-0.5">
              Notes
            </dt>
            <dd className="text-slate-800 whitespace-pre-wrap break-words">
              {booking.notes}
            </dd>
          </div>
        )}

        {!venueLabel && !assigneeLabel && !booking.pay && !booking.notes && (
          <p className="text-slate-500 italic">
            No additional details on this shift yet.{" "}
            <Link
              href={`/agenda/${booking.id}/edit`}
              className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
            >
              Add some
            </Link>
            .
          </p>
        )}
      </dl>

      {/* Action footer */}
      <footer className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
        <Link
          href={`/agenda/${booking.id}/edit`}
          className="btn btn-md btn-primary"
        >
          Edit shift
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/agenda"
            className="btn btn-md btn-secondary"
          >
            Back to schedule
          </Link>

          {/* Top-level delete form — outside any other form, so the
              browser doesn't collapse it. */}
          <form
            action={deleteFromEditAction}
            onSubmit={(e) => {
              if (
                !window.confirm(
                  `Delete "${booking.title}"? This can't be undone.`,
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={booking.id} />
            <button type="submit" className="btn btn-md btn-danger">
              Delete shift
            </button>
          </form>
        </div>
      </footer>
    </article>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3 items-baseline">
      <dt className="text-slate-500 text-xs font-medium uppercase tracking-wider">
        {label}
      </dt>
      <dd className={`text-slate-900 break-words ${mono ? "tabular-nums" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
