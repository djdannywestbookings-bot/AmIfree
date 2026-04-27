import {
  requireWorkspace,
  listBookings,
  listVenues,
  listAssignableEmployees,
} from "@/server/services";
import { BOOKING_STATUSES, type BookingRow } from "@/modules/bookings";
import type { VenueRow } from "@/modules/venues";
import type { WorkspaceMemberRow } from "@/modules/auth";
import { BookingForm } from "./_components/BookingForm";
import {
  updateBookingStatusAction,
  deleteBookingAction,
} from "./actions";

const STATUS_STYLES: Record<string, string> = {
  inquiry: "bg-neutral-100 text-neutral-700 border-neutral-200",
  hold: "bg-amber-50 text-amber-700 border-amber-200",
  requested: "bg-blue-50 text-blue-700 border-blue-200",
  assigned: "bg-indigo-50 text-indigo-700 border-indigo-200",
  booked: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-neutral-100 text-neutral-500 border-neutral-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function formatWhen(b: BookingRow): string {
  if (b.all_day && b.service_day) return `${b.service_day} (all day)`;
  if (!b.start_at) return "Time TBD";
  const start = new Date(b.start_at);
  const end = b.end_at ? new Date(b.end_at) : null;
  const dateStr = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (!end) return `${dateStr} · ${startTime}`;
  const endTime = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dateStr} · ${startTime} – ${endTime}`;
}

function venueLabel(b: BookingRow, venuesById: Map<string, VenueRow>): string | null {
  if (b.venue_id) {
    const v = venuesById.get(b.venue_id);
    if (v) {
      return v.address ? `${v.name} · ${v.address}` : v.name;
    }
  }
  return b.location;
}

function employeeLabel(
  b: BookingRow,
  employeesById: Map<string, WorkspaceMemberRow>,
): string | null {
  if (!b.assigned_employee_id) return null;
  const m = employeesById.get(b.assigned_employee_id);
  if (!m) return null;
  return m.name || m.email || "(unnamed)";
}

export default async function AgendaPage() {
  const workspace = await requireWorkspace();
  const [bookings, venues, employees] = await Promise.all([
    listBookings(workspace),
    listVenues(workspace),
    listAssignableEmployees(workspace),
  ]);
  const venuesById = new Map(venues.map((v) => [v.id, v] as const));
  const employeesById = new Map(employees.map((m) => [m.id, m] as const));

  return (
    <main className="max-w-screen-lg mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Schedule</h1>
        <p className="text-xs text-neutral-500">
          <strong>{workspace.name}</strong> ·{" "}
          {workspace.service_day_mode === "nightlife"
            ? `nightlife day (ends ${workspace.nightlife_cutoff_hour}:00am)`
            : "standard day"}
        </p>
      </div>

      <BookingForm venues={venues} employees={employees} />

      {bookings.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-md p-8 text-center text-sm text-neutral-500">
          No shifts yet. Create one above to get started.
        </div>
      ) : (
        <ul className="space-y-2">
          {bookings.map((b) => {
            const venue = venueLabel(b, venuesById);
            const assignee = employeeLabel(b, employeesById);
            return (
              <li
                key={b.id}
                className="border border-neutral-200 rounded-md p-4 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{b.title}</span>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded border ${
                        STATUS_STYLES[b.status] ?? STATUS_STYLES.inquiry
                      }`}
                    >
                      {b.status}
                    </span>
                    {assignee && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded border bg-indigo-50 text-indigo-700 border-indigo-200">
                        → {assignee}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {formatWhen(b)}
                  </div>
                  {(venue || b.pay || b.notes) && (
                    <dl className="text-xs mt-2 space-y-1">
                      {venue && (
                        <div className="flex gap-2">
                          <dt className="text-neutral-500 w-16 shrink-0">Venue</dt>
                          <dd className="text-neutral-700 min-w-0 break-words">
                            {venue}
                          </dd>
                        </div>
                      )}
                      {b.pay && (
                        <div className="flex gap-2">
                          <dt className="text-neutral-500 w-16 shrink-0">Pay</dt>
                          <dd className="text-neutral-700 min-w-0 break-words">
                            {b.pay}
                          </dd>
                        </div>
                      )}
                      {b.notes && (
                        <div className="flex gap-2">
                          <dt className="text-neutral-500 w-16 shrink-0">Notes</dt>
                          <dd className="text-neutral-700 min-w-0 whitespace-pre-wrap break-words">
                            {b.notes}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <form action={updateBookingStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={b.id} />
                    <select
                      name="status"
                      defaultValue={b.status}
                      className="text-xs rounded border border-neutral-300 px-2 py-1 bg-white"
                      aria-label="Change status"
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="text-xs rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50"
                    >
                      Save
                    </button>
                  </form>

                  <a
                    href={`/agenda/${b.id}`}
                    className="text-xs rounded border border-neutral-300 px-2 py-1 hover:bg-neutral-50"
                  >
                    Edit
                  </a>

                  <form action={deleteBookingAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      type="submit"
                      className="text-xs rounded border border-red-200 text-red-700 px-2 py-1 hover:bg-red-50"
                      aria-label="Delete shift"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
