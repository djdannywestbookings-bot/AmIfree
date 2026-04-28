import {
  requireWorkspace,
  listBookings,
  listVenues,
  getCurrentMember,
} from "@/server/services";
import { CalendarMonthGrid } from "./_components/CalendarMonthGrid";

export default async function CalendarPage() {
  const workspace = await requireWorkspace();
  const [shifts, venues, member] = await Promise.all([
    listBookings(workspace),
    listVenues(workspace),
    getCurrentMember(workspace),
  ]);

  // The user's saved preference (if any) is the fallback view when
  // the URL has no ?view=... param. Defaults to 1-month otherwise.
  const defaultView = member?.default_calendar_view ?? 1;

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Calendar</h1>
      <CalendarMonthGrid
        shifts={shifts}
        venues={venues}
        defaultView={defaultView}
      />
    </main>
  );
}
