"use client";

import { useState, useMemo } from "react";
import type { BookingRow } from "@/modules/bookings";
import type { VenueRow } from "@/modules/venues";

/**
 * CalendarMonthGrid — calendar surface for /calendar.
 *
 * Supports four view modes:
 *   - 1 month  — detailed grid (the original full view)
 *   - 3 month  — three mini-month tiles (quarter view)
 *   - 6 month  — six mini-month tiles (half-year view)
 *   - 12 month — twelve mini-month tiles (year view)
 *
 * In the detailed view, each day cell shows up to MAX_PILLS bookings
 * with venue color and time. In mini views, each day shows the date
 * number plus tiny colored dots for bookings; clicking the month
 * header jumps to that month's detailed view.
 */

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_PILLS = 3;
const MAX_MINI_DOTS = 3;

type ViewMode = 1 | 3 | 6 | 12;

const STATUS_COLOR: Record<string, string> = {
  inquiry: "#9ca3af",     // neutral-400
  hold: "#f59e0b",        // amber-500
  requested: "#3b82f6",   // blue-500
  assigned: "#6366f1",    // indigo-500
  booked: "#10b981",      // emerald-500
  completed: "#94a3b8",   // slate-400
  cancelled: "#ef4444",   // red-500
};

type DayBucket = {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  shifts: BookingRow[];
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Bucket bookings by local YYYY-M-D key. Memoizable across views.
 */
function bucketShiftsByDate(shifts: BookingRow[]): Map<string, BookingRow[]> {
  const byDate = new Map<string, BookingRow[]>();
  for (const s of shifts) {
    let key: string | null = null;
    if (s.start_at) {
      const d = new Date(s.start_at);
      if (!Number.isNaN(d.getTime())) {
        const local = startOfDay(d);
        key = `${local.getFullYear()}-${local.getMonth()}-${local.getDate()}`;
      }
    } else if (s.service_day) {
      const m = s.service_day.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) key = `${Number(m[1])}-${Number(m[2]) - 1}-${Number(m[3])}`;
    }
    if (!key) continue;
    const arr = byDate.get(key) ?? [];
    arr.push(s);
    byDate.set(key, arr);
  }
  for (const arr of byDate.values()) {
    arr.sort((a, b) => {
      if (!a.start_at && !b.start_at) return 0;
      if (!a.start_at) return 1;
      if (!b.start_at) return -1;
      return a.start_at.localeCompare(b.start_at);
    });
  }
  return byDate;
}

function buildMonthGrid(
  viewYear: number,
  viewMonth: number,
  byDate: Map<string, BookingRow[]>,
): DayBucket[] {
  const today = startOfDay(new Date());
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells: DayBucket[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekday + 1;
    const date = new Date(viewYear, viewMonth, dayNum);
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const dayShifts = byDate.get(key) ?? [];
    cells.push({
      date,
      inMonth,
      isToday: date.getTime() === today.getTime(),
      shifts: dayShifts,
    });
  }
  return cells;
}

function shiftPillStyle(
  b: BookingRow,
  venuesById: Map<string, VenueRow>,
): React.CSSProperties {
  const venueColor = b.venue_id ? venuesById.get(b.venue_id)?.color : null;
  const color = venueColor ?? STATUS_COLOR[b.status] ?? STATUS_COLOR.inquiry;
  return {
    backgroundColor: `${color}1A`,
    borderColor: `${color}66`,
    color,
  };
}

function shiftDotColor(
  b: BookingRow,
  venuesById: Map<string, VenueRow>,
): string {
  const venueColor = b.venue_id ? venuesById.get(b.venue_id)?.color : null;
  return venueColor ?? STATUS_COLOR[b.status] ?? STATUS_COLOR.inquiry;
}

function shiftLabel(
  b: BookingRow,
  venuesById: Map<string, VenueRow>,
): string {
  const venue = b.venue_id ? venuesById.get(b.venue_id) : null;
  const venueName = venue?.name ?? "";
  const time = b.start_at
    ? new Date(b.start_at).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : "TBD";
  if (venueName) return `${time} · ${venueName}`;
  return `${time} · ${b.title}`;
}

/* -------------------------------------------------------------------------- *
 * Main component
 * -------------------------------------------------------------------------- */

export function CalendarMonthGrid({
  shifts,
  venues,
}: {
  shifts: BookingRow[];
  venues: VenueRow[];
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [view, setView] = useState<ViewMode>(1);

  const venuesById = useMemo(
    () => new Map(venues.map((v) => [v.id, v] as const)),
    [venues],
  );

  const byDate = useMemo(() => bucketShiftsByDate(shifts), [shifts]);

  function step(delta: number) {
    // delta is +1 / -1; multiplied by view to step by the view's range.
    const next = new Date(viewYear, viewMonth + delta * view, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function jumpToToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  // Range label across the current view.
  const rangeLabel = useMemo(() => {
    if (view === 1) {
      return new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    }
    const start = new Date(viewYear, viewMonth, 1);
    const end = new Date(viewYear, viewMonth + view - 1, 1);
    const sameYear = start.getFullYear() === end.getFullYear();
    const startLabel = start.toLocaleDateString(undefined, {
      month: "short",
      ...(sameYear ? {} : { year: "numeric" }),
    });
    const endLabel = end.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
    return `${startLabel} – ${endLabel}`;
  }, [viewYear, viewMonth, view]);

  return (
    <div className="space-y-3">
      {/* Top bar: nav on the left, view toggle on the right */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50"
            aria-label={`Previous ${view === 1 ? "month" : `${view} months`}`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50"
            aria-label={`Next ${view === 1 ? "month" : `${view} months`}`}
          >
            ›
          </button>
          <button
            type="button"
            onClick={jumpToToday}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50"
          >
            Today
          </button>
          <h2 className="text-lg font-semibold ml-2 tabular-nums">
            {rangeLabel}
          </h2>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === 1 ? (
        <FullMonth
          year={viewYear}
          month={viewMonth}
          byDate={byDate}
          venuesById={venuesById}
        />
      ) : (
        <MultiMonth
          startYear={viewYear}
          startMonth={viewMonth}
          count={view}
          byDate={byDate}
          venuesById={venuesById}
          onJumpToMonth={(y, m) => {
            setViewYear(y);
            setViewMonth(m);
            setView(1);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- *
 * Sub-components
 * -------------------------------------------------------------------------- */

function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const opts: Array<{ v: ViewMode; label: string }> = [
    { v: 1, label: "1 mo" },
    { v: 3, label: "3 mo" },
    { v: 6, label: "6 mo" },
    { v: 12, label: "12 mo" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Calendar view"
      className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-sm"
    >
      {opts.map(({ v, label }) => {
        const active = view === v;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={[
              "px-3 py-1 rounded transition-colors tabular-nums",
              active
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function FullMonth({
  year,
  month,
  byDate,
  venuesById,
}: {
  year: number;
  month: number;
  byDate: Map<string, BookingRow[]>;
  venuesById: Map<string, VenueRow>;
}) {
  const cells = useMemo(
    () => buildMonthGrid(year, month, byDate),
    [year, month, byDate],
  );

  return (
    <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded overflow-hidden text-xs">
      {WEEKDAY_LABELS.map((d) => (
        <div
          key={d}
          className="bg-slate-50 p-2 text-center font-medium text-slate-500"
        >
          {d}
        </div>
      ))}
      {cells.map((cell, i) => {
        const visible = cell.shifts.slice(0, MAX_PILLS);
        const overflow = cell.shifts.length - visible.length;
        return (
          <div
            key={i}
            className={[
              "bg-white p-1.5 min-h-[100px] flex flex-col gap-1",
              cell.inMonth ? "" : "bg-slate-50/50 text-slate-400",
            ].join(" ")}
          >
            <div
              className={[
                "text-xs",
                cell.isToday
                  ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white"
                  : "text-slate-500",
              ].join(" ")}
            >
              {cell.date.getDate()}
            </div>
            {visible.map((s) => (
              <a
                key={s.id}
                href={`/agenda/${s.id}`}
                className="text-[11px] leading-tight rounded border px-1.5 py-0.5 truncate hover:opacity-80"
                style={shiftPillStyle(s, venuesById)}
                title={`${s.title} · ${s.status}`}
              >
                {shiftLabel(s, venuesById)}
              </a>
            ))}
            {overflow > 0 && (
              <span className="text-[11px] text-slate-500">
                +{overflow} more
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MultiMonth({
  startYear,
  startMonth,
  count,
  byDate,
  venuesById,
  onJumpToMonth,
}: {
  startYear: number;
  startMonth: number;
  count: 3 | 6 | 12;
  byDate: Map<string, BookingRow[]>;
  venuesById: Map<string, VenueRow>;
  onJumpToMonth: (year: number, month: number) => void;
}) {
  const months = Array.from({ length: count }, (_, i) => {
    const d = new Date(startYear, startMonth + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const gridCols =
    count === 3
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : count === 6
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {months.map(({ year, month }) => (
        <MiniMonth
          key={`${year}-${month}`}
          year={year}
          month={month}
          byDate={byDate}
          venuesById={venuesById}
          onJump={() => onJumpToMonth(year, month)}
        />
      ))}
    </div>
  );
}

function MiniMonth({
  year,
  month,
  byDate,
  venuesById,
  onJump,
}: {
  year: number;
  month: number;
  byDate: Map<string, BookingRow[]>;
  venuesById: Map<string, VenueRow>;
  onJump: () => void;
}) {
  const cells = useMemo(
    () => buildMonthGrid(year, month, byDate),
    [year, month, byDate],
  );
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onJump}
        className="w-full px-3 py-2 text-left bg-slate-50 hover:bg-slate-100 border-b border-slate-200 transition-colors flex items-center justify-between"
        aria-label={`Open ${monthLabel} in detail`}
      >
        <span className="text-sm font-semibold text-slate-800">
          {monthLabel}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          Open →
        </span>
      </button>
      <div className="grid grid-cols-7 gap-px bg-slate-100 text-[10px]">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="bg-white py-1 text-center text-slate-400 font-medium"
          >
            {d.charAt(0)}
          </div>
        ))}
        {cells.map((cell, i) => {
          const dotColors = cell.shifts
            .slice(0, MAX_MINI_DOTS)
            .map((s) => shiftDotColor(s, venuesById));
          const overflow = cell.shifts.length - dotColors.length;
          const hasShifts = cell.shifts.length > 0;
          return (
            <a
              key={i}
              href={
                hasShifts && cell.inMonth
                  ? `/agenda/${cell.shifts[0].id}`
                  : undefined
              }
              className={[
                "bg-white px-1 py-1 min-h-[44px] flex flex-col items-center text-[10px] tabular-nums",
                cell.inMonth ? "" : "bg-slate-50/60 text-slate-300",
                hasShifts ? "hover:bg-indigo-50/40 cursor-pointer" : "",
              ].join(" ")}
              title={
                hasShifts
                  ? cell.shifts.map((s) => shiftLabel(s, venuesById)).join("\n")
                  : undefined
              }
            >
              <span
                className={[
                  cell.isToday
                    ? "inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600 text-white"
                    : cell.inMonth
                    ? "text-slate-700"
                    : "text-slate-300",
                ].join(" ")}
              >
                {cell.date.getDate()}
              </span>
              {dotColors.length > 0 && (
                <span className="mt-1 flex items-center gap-[2px] flex-wrap justify-center">
                  {dotColors.map((c, j) => (
                    <span
                      key={j}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {overflow > 0 && (
                    <span className="text-[8px] text-slate-500 ml-0.5">
                      +{overflow}
                    </span>
                  )}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
