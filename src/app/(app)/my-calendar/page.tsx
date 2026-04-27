import {
  requireWorkspace,
  listBookings,
  listVenues,
} from "@/server/services";
import { getCurrentActor } from "@/server/policies";
import { CalendarMonthGrid } from "../calendar/_components/CalendarMonthGrid";

/**
 * "My Calendar" — workspace shifts filtered to the current user.
 *
 * Phase 29: filter on bookings.created_by === current user. When
 * Phase 30 (talent/employee) lands, expand the filter to also include
 * bookings where the assigned_to person is the current user.
 */
export default async function MyCalendarPage() {
  const workspace = await requireWorkspace();
  const actor = await getCurrentActor();
  const [allShifts, venues] = await Promise.all([
    listBookings(workspace),
    listVenues(workspace),
  ]);

  const myShifts = actor
    ? allShifts.filter((s) => s.created_by === actor.userId)
    : [];

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">My Calendar</h1>
        <p className="text-xs text-neutral-500">
          <strong>{workspace.name}</strong> · only shifts you created
        </p>
      </div>
      {myShifts.length === 0 && allShifts.length > 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-md p-6 text-center text-sm text-neutral-500">
          You haven&apos;t created any shifts in this workspace. The
          <a href="/calendar" className="underline mx-1">
            full Calendar
          </a>
          shows everything.
        </div>
      ) : (
        <CalendarMonthGrid shifts={myShifts} venues={venues} />
      )}
    </main>
  );
}
