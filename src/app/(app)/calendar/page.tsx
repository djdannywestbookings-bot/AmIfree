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
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-xs text-neutral-500">
          <strong>{workspace.name}</strong> · all shifts in this workspace
        </p>
      </div>
      <CalendarMonthGrid shifts={shifts} venues={venues} />
    </main>
  );
}
