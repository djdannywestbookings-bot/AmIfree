import {
  requireWorkspace,
  listBookings,
  listVenues,
  getCurrentMemberId,
} from "@/server/services";
import { getCurrentActor } from "@/server/policies";
import { CalendarMonthGrid } from "../calendar/_components/CalendarMonthGrid";

/**
 * "My Calendar" — workspace shifts filtered to the current user.
 *
 * Phase 40 expansion: now matches shifts that are EITHER created by
 * the current user OR assigned to them as an employee. The "assigned
 * to me" path is what makes My Calendar useful for non-owner team
 * members — they only see what's on their plate.
 */
export default async function MyCalendarPage() {
  const workspace = await requireWorkspace();
  const actor = await getCurrentActor();
  const [allShifts, venues, myMemberId] = await Promise.all([
    listBookings(workspace),
    listVenues(workspace),
    getCurrentMemberId(workspace),
  ]);

  const myShifts = actor
    ? allShifts.filter(
        (s) =>
          s.created_by === actor.userId ||
          (myMemberId && s.assigned_employee_id === myMemberId),
      )
    : [];

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">My Calendar</h1>
        <p className="text-xs text-neutral-500">
          <strong>{workspace.name}</strong> · shifts assigned to you or
          created by you
        </p>
      </div>
      {myShifts.length === 0 && allShifts.length > 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-md p-6 text-center text-sm text-neutral-500">
          Nothing on your plate yet. The
          <a href="/calendar" className="underline mx-1">
            full Calendar
          </a>
          shows everything in the workspace.
        </div>
      ) : (
        <CalendarMonthGrid shifts={myShifts} venues={venues} />
      )}
    </main>
  );
}
