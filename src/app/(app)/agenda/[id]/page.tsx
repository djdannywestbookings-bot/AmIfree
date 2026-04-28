import { notFound } from "next/navigation";
import {
  requireWorkspace,
  getBookingById,
  listVenues,
  listAssignableEmployees,
} from "@/server/services";
import { ShiftDetailView } from "./_components/ShiftDetailView";

/**
 * /agenda/[id] — read-only Shift detail page.
 *
 * The default landing when a user clicks a booking from the calendar
 * day-detail modal or the agenda list. Shows every field plus two
 * actions: Edit shift (→ /agenda/[id]/edit) and Delete shift (posts
 * to deleteFromEditAction).
 *
 * Going straight into edit mode used to surprise users — they wanted
 * to see what's on a booking before changing anything.
 */
export default async function ShiftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const workspace = await requireWorkspace();
  const { id } = await params;
  const [booking, venues, employees] = await Promise.all([
    getBookingById(workspace, id),
    listVenues(workspace),
    listAssignableEmployees(workspace),
  ]);

  if (!booking) {
    notFound();
  }

  const venue = booking.venue_id
    ? venues.find((v) => v.id === booking.venue_id) ?? null
    : null;
  const assignee = booking.assigned_employee_id
    ? employees.find((e) => e.id === booking.assigned_employee_id) ?? null
    : null;

  return (
    <main className="max-w-screen-md mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Shift detail</h1>
        <a
          href="/agenda"
          className="text-xs text-slate-500 underline hover:text-slate-700"
        >
          ← back to schedule
        </a>
      </div>
      <ShiftDetailView
        booking={booking}
        venue={venue}
        assignee={assignee}
      />
    </main>
  );
}
