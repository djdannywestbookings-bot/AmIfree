import {
  requireWorkspace,
  listBookings,
  listVenues,
  listAssignableEmployees,
  computeReports,
  formatHours,
  formatUsdFromCents,
  type WorkspaceReports,
  type MonthlyBucket,
  type VenueLeaderboardEntry,
  type DayOfWeekBucket,
} from "@/server/services";

const STATUS_COLORS: Record<string, string> = {
  inquiry: "#94a3b8",
  hold: "#f59e0b",
  requested: "#3b82f6",
  assigned: "#8b5cf6",
  booked: "#14b8a6",
  completed: "#64748b",
  cancelled: "#ef4444",
};

export default async function ReportsPage() {
  const workspace = await requireWorkspace();
  const [bookings, venues, employees] = await Promise.all([
    listBookings(workspace),
    listVenues(workspace),
    listAssignableEmployees(workspace),
  ]);
  const reports = computeReports(bookings, venues, employees);

  const totalEstimatedWageCents = reports.monthly.reduce(
    (sum, m) => sum + m.estimatedWageCents,
    0,
  );

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-xs text-neutral-500">
          <strong>{workspace.name}</strong>
          {reports.oldestBookingDate && reports.newestBookingDate && (
            <>
              {" "}
              · {reports.oldestBookingDate} → {reports.newestBookingDate}
            </>
          )}
        </p>
      </div>

      {/* Top-line numbers */}
      <section
        aria-label="Headline metrics"
        className="flex flex-wrap gap-y-3 items-stretch bg-white border border-neutral-200 rounded-md overflow-hidden"
      >
        <HeadlineCell label="Total bookings" value={String(reports.totalBookings)} />
        <HeadlineCell
          label="Booked"
          value={String(reports.conversion.assignedOrBooked)}
        />
        <HeadlineCell label="Pending" value={String(reports.conversion.inquiry + reports.conversion.holdOrRequested)} />
        <HeadlineCell label="Cancelled" value={String(reports.conversion.cancelled)} muted={reports.conversion.cancelled === 0} />
        <HeadlineCell
          label="Est. wages (all time)"
          value={formatUsdFromCents(totalEstimatedWageCents)}
        />
      </section>

      {reports.totalBookings === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-md p-10 text-center text-sm text-neutral-500">
          No data yet. Add some bookings on{" "}
          <a href="/agenda" className="text-indigo-600 underline">
            Schedule
          </a>{" "}
          and they&apos;ll show up here.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportCard title="Bookings by status" subtitle="Lifecycle distribution">
            <StatusDonut reports={reports} />
          </ReportCard>

          <ReportCard title="Bookings by month" subtitle="Volume + estimated wages over time">
            <MonthlyBarChart monthly={reports.monthly} />
          </ReportCard>

          <ReportCard title="Top venues" subtitle="Where you book most">
            <VenueLeaderboard venues={reports.topVenues} />
          </ReportCard>

          <ReportCard title="Busiest days" subtitle="Bookings by day of week">
            <DayOfWeekChart days={reports.byDayOfWeek} />
          </ReportCard>
        </div>
      )}
    </main>
  );
}

// ---- Building blocks --------------------------------------------------

function HeadlineCell({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex-1 min-w-[160px] px-4 py-3 border-r border-neutral-200 last:border-r-0">
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

function ReportCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-neutral-200 rounded-md p-5 space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function StatusDonut({ reports }: { reports: WorkspaceReports }) {
  const entries = (Object.keys(reports.statusCounts) as Array<
    keyof typeof reports.statusCounts
  >)
    .map((status) => ({
      status,
      count: reports.statusCounts[status],
      color: STATUS_COLORS[status] ?? "#94a3b8",
    }))
    .filter((e) => e.count > 0);

  const total = entries.reduce((s, e) => s + e.count, 0);
  if (total === 0) {
    return <p className="text-xs text-neutral-500">No bookings.</p>;
  }

  // SVG donut: stroke-dasharray ring approach
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="20" />
        {entries.map((e) => {
          const length = (e.count / total) * circumference;
          const offset = -acc;
          acc += length;
          return (
            <circle
              key={e.status}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={e.color}
              strokeWidth="20"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
            />
          );
        })}
        <text
          x="80"
          y="78"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="#0f172a"
        >
          {total}
        </text>
        <text
          x="80"
          y="98"
          textAnchor="middle"
          fontSize="10"
          fill="#64748b"
        >
          bookings
        </text>
      </svg>

      <ul className="flex-1 min-w-[120px] space-y-1.5 text-xs">
        {entries.map((e) => (
          <li key={e.status} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: e.color }}
            />
            <span className="capitalize text-neutral-700">{e.status}</span>
            <span className="ml-auto text-neutral-500">
              {e.count} · {Math.round((e.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MonthlyBarChart({ monthly }: { monthly: MonthlyBucket[] }) {
  if (monthly.length === 0) {
    return <p className="text-xs text-neutral-500">Nothing scheduled.</p>;
  }
  const maxCount = Math.max(...monthly.map((m) => m.bookingCount), 1);

  return (
    <ul className="space-y-1.5 text-xs">
      {monthly.map((m) => {
        const pct = (m.bookingCount / maxCount) * 100;
        return (
          <li key={m.monthKey} className="grid grid-cols-[80px_1fr_auto] gap-3 items-center">
            <span className="text-neutral-600">{m.label}</span>
            <div className="h-5 bg-neutral-50 rounded overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${pct}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="text-neutral-700 tabular-nums">
              {m.bookingCount}{" "}
              {m.estimatedWageCents > 0 && (
                <span className="text-teal-700 ml-2">
                  {formatUsdFromCents(m.estimatedWageCents)}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function VenueLeaderboard({
  venues,
}: {
  venues: VenueLeaderboardEntry[];
}) {
  if (venues.length === 0) {
    return <p className="text-xs text-neutral-500">No venues yet.</p>;
  }
  const max = Math.max(...venues.map((v) => v.bookingCount), 1);
  return (
    <ul className="space-y-1.5 text-xs">
      {venues.map((v) => (
        <li
          key={v.venueId ?? v.venueName}
          className="grid grid-cols-[1fr_2fr_auto] gap-3 items-center"
        >
          <span className="text-neutral-700 truncate">{v.venueName}</span>
          <div className="h-5 bg-neutral-50 rounded overflow-hidden">
            <div
              className="h-full bg-teal-500"
              style={{ width: `${(v.bookingCount / max) * 100}%` }}
              aria-hidden="true"
            />
          </div>
          <span className="text-neutral-700 tabular-nums">
            {v.bookingCount}
            {v.totalScheduledMinutes > 0 && (
              <span className="text-neutral-500 ml-2">
                · {formatHours(v.totalScheduledMinutes)}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DayOfWeekChart({ days }: { days: DayOfWeekBucket[] }) {
  const max = Math.max(...days.map((d) => d.bookingCount), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {days.map((d) => {
        const pct = (d.bookingCount / max) * 100;
        return (
          <div
            key={d.weekday}
            className="flex-1 flex flex-col items-center justify-end gap-1.5"
          >
            <div className="text-xs text-neutral-700 tabular-nums">
              {d.bookingCount}
            </div>
            <div
              className="w-full rounded-t bg-indigo-500"
              style={{ height: `${pct}%`, minHeight: d.bookingCount > 0 ? 4 : 0 }}
              aria-hidden="true"
            />
            <div className="text-[11px] text-neutral-500">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}
