import {
  requireWorkspace,
  getCurrentMemberId,
  getOpenPunchForMember,
  listPunchesForMember,
  listBookings,
  formatHours,
} from "@/server/services";
import { durationMinutes, isOpen } from "@/modules/punches";
import type { TimePunchRow } from "@/modules/punches";
import { ClockInOutButtons } from "./_components/ClockInOutButtons";

/**
 * Timesheet — Phase 42.
 *
 * Shows the current user's time punches for the last 30 days, grouped
 * by day. Open punch (currently clocked in) shows live elapsed time.
 *
 * Owner punches + employee punches both render here when viewing your
 * own timesheet. A future phase can add an owner-wide team timesheet.
 */
export default async function TimesheetPage() {
  const workspace = await requireWorkspace();
  const memberId = await getCurrentMemberId(workspace);
  if (!memberId) {
    return (
      <main className="max-w-screen-md mx-auto p-8 text-sm text-neutral-600">
        You&apos;re not currently a member of this workspace.
      </main>
    );
  }

  // Last 30 days
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [openPunch, recentPunches, allBookings] = await Promise.all([
    getOpenPunchForMember(workspace, memberId),
    listPunchesForMember(workspace, memberId, since.toISOString()),
    listBookings(workspace),
  ]);

  // Group punches by local date.
  const byDay = new Map<string, TimePunchRow[]>();
  for (const p of recentPunches) {
    const d = new Date(p.clocked_in_at);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const arr = byDay.get(dayKey) ?? [];
    arr.push(p);
    byDay.set(dayKey, arr);
  }

  // Sort days descending
  const days = Array.from(byDay.keys()).sort((a, b) => b.localeCompare(a));

  // Total minutes across the period
  const totalMinutes = recentPunches.reduce(
    (sum, p) => sum + durationMinutes(p),
    0,
  );

  // Map booking_id → title for display
  const bookingsById = new Map(allBookings.map((b) => [b.id, b]));

  // Eligible bookings the user can clock into right now: assigned to
  // them, not cancelled, not far in the past. We surface up to 5.
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const eligibleBookings = allBookings
    .filter((b) => {
      if (b.status === "cancelled" || b.status === "completed") return false;
      if (b.assigned_employee_id !== memberId) return false;
      if (!b.start_at) return true;
      const startMs = new Date(b.start_at).getTime();
      // Show shifts starting today or in the next 7 days.
      const sevenDaysAhead = startOfToday.getTime() + 7 * 86_400_000;
      return startMs >= startOfToday.getTime() - 86_400_000 && startMs <= sevenDaysAhead;
    })
    .slice(0, 5);

  return (
    <main className="max-w-screen-lg mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Timesheet</h1>
        <p className="text-xs text-neutral-500">
          <strong>{workspace.name}</strong> · last 30 days · {formatHours(totalMinutes)} clocked
        </p>
      </div>

      <ClockInOutButtons
        openPunch={openPunch}
        eligibleBookings={eligibleBookings.map((b) => ({
          id: b.id,
          title: b.title,
          start_at: b.start_at,
        }))}
      />

      {recentPunches.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-md p-10 text-center text-sm text-neutral-500">
          No clock-ins in the last 30 days. Use the button above to start
          your first punch.
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((dayKey) => {
            const punches = byDay.get(dayKey) ?? [];
            const dayMinutes = punches.reduce(
              (s, p) => s + durationMinutes(p),
              0,
            );
            const date = new Date(dayKey + "T00:00:00");
            const heading = date.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            return (
              <section
                key={dayKey}
                className="bg-white border border-neutral-200 rounded-md overflow-hidden"
              >
                <header className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 bg-neutral-50">
                  <span className="text-sm font-medium text-neutral-800">
                    {heading}
                  </span>
                  <span className="text-xs text-neutral-600 tabular-nums">
                    {formatHours(dayMinutes)}
                  </span>
                </header>
                <ul className="divide-y divide-neutral-200">
                  {punches.map((p) => {
                    const inTime = new Date(p.clocked_in_at).toLocaleTimeString(
                      undefined,
                      { hour: "numeric", minute: "2-digit" },
                    );
                    const outTime = p.clocked_out_at
                      ? new Date(p.clocked_out_at).toLocaleTimeString(
                          undefined,
                          { hour: "numeric", minute: "2-digit" },
                        )
                      : null;
                    const booking = p.booking_id
                      ? bookingsById.get(p.booking_id)
                      : null;
                    return (
                      <li
                        key={p.id}
                        className="grid grid-cols-[1fr_auto] gap-3 items-center px-4 py-3 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="text-neutral-800">
                            {inTime} → {outTime ?? <span className="text-amber-700">on the clock</span>}
                          </div>
                          {booking && (
                            <div className="text-xs text-neutral-500 mt-0.5 truncate">
                              {booking.title}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-neutral-700 tabular-nums">
                          {formatHours(durationMinutes(p))}
                          {isOpen(p) && (
                            <span className="ml-2 text-amber-700">live</span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
