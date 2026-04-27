import {
  formatHours,
  formatUsdFromCents,
  type ScheduleStats,
} from "@/server/services";

/**
 * StatsBar — Sling-style metrics row above the Schedule.
 *
 * Server component, takes pre-computed stats so it stays a pure
 * render. Each cell is a stacked label / value pair, separated by
 * subtle dividers.
 *
 * Phase 41: Est. wages, Hours, Shifts, Unassigned. We'll add O/T
 * cost + labor % in Phase 42 once the time-clock data exists.
 */
export function StatsBar({ stats }: { stats: ScheduleStats }) {
  return (
    <section
      aria-label="Schedule stats"
      className="flex flex-wrap gap-y-3 items-stretch bg-white border border-neutral-200 rounded-md overflow-hidden"
    >
      <Cell label="Est. wages" value={formatUsdFromCents(stats.totalEstimatedWageCents)} />
      <Cell label="Scheduled hours" value={formatHours(stats.totalScheduledMinutes)} />
      <Cell label="Shifts" value={String(stats.totalShifts)} />
      <Cell
        label="Unassigned"
        value={String(stats.unassignedShifts)}
        muted={stats.unassignedShifts === 0}
      />
      <Cell
        label="Time TBD"
        value={String(stats.unscheduledShifts)}
        muted={stats.unscheduledShifts === 0}
      />
      <Cell
        label="Cancelled"
        value={String(stats.cancelledShifts)}
        muted={stats.cancelledShifts === 0}
      />
    </section>
  );
}

function Cell({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex-1 min-w-[112px] px-4 py-3 border-r border-neutral-200 last:border-r-0">
      <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
        {label}
      </div>
      <div
        className={`text-lg font-semibold mt-0.5 ${
          muted ? "text-neutral-400" : "text-neutral-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
