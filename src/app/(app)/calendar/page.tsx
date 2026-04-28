import {
  requireWorkspace,
  listBookings,
  listVenues,
} from "@/server/services";
import { CalendarMonthGrid } from "./_components/CalendarMonthGrid";

export default async function CalendarPage() {
  const workspace = await requireWorkspace();
  const [shifts, venues] = await Promise.all([
    listBookings(workspace),
    listVenues(workspace),
  ]);

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Calendar</h1>
      <CalendarMonthGrid shifts={shifts} venues={venues} />
    </main>
  );
}
