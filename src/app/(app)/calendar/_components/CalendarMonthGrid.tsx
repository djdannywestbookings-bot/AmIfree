"use client";

import { useState, useMemo } from "react";
import type { BookingRow } from "@/modules/bookings";
import type { VenueRow } from "@/modules/venues";

/**
 * CalendarMonthGrid — visual month view of bookings.
 *
 * Phase 29. Server passes the full booking + venue lists; the client
 * handles month navigation locally so prev/next don't round-trip.
 *
 * Each day cell shows up to MAX_PILLS bookings as colored pills. Color
 * comes from venue.color when present, otherwise status. Overflow
 * shows "+N more". Click a pill → edit page.
 */

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_PILLS = 3;

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

function buildMonthGrid(viewYear: number, viewMonth: number, shifts: BookingRow[]): DayBucket[] {
  const today = startOfDay(new Date());
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  // Bucket shifts by their local date (start_at if present; else
  // service_day; else skip).
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
      // service_day is "YYYY-MM-DD".
      const m = s.service_day.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) key = `${Number(m[1])}-${Number(m[2]) - 1}-${Number(m[3])}`;
    }
    if (!key) continue;
    const arr = byDate.get(key) ?? [];
    arr.push(s);
    byDate.set(key, arr);
  }

  // Sort each bucket by start_at ascending (TBD last).
  for (const arr of byDate.values()) {
    arr.sort((a, b) => {
      if (!a.start_at && !b.start_at) return 0;
      if (!a.start_at) return 1;
      if (!b.start_at) return -1;
      return a.start_at.localeCompare(b.start_at);
    });
  }

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

function shiftPillStyle(b: BookingRow, venuesById: Map<string, VenueRow>): React.CSSProperties {
  const venueColor = b.venue_id ? venuesById.get(b.venue_id)?.color : null;
  const color = venueColor ?? STATUS_COLOR[b.status] ?? STATUS_COLOR.inquiry;
  return {
    backgroundColor: `${color}1A`, // ~10% opacity tint
    borderColor: `${color}66`,
    color: color,
  };
}

function shiftLabel(b: BookingRow, venuesById: Map<string, VenueRow>): string {
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

  const venuesById = useMemo(
    () => new Map(venues.map((v) => [v.id, v] as const)),
    [venues],
  );

  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, shifts),
    [viewYear, viewMonth, shifts],
  );

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" },
  );

  function step(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function jumpToToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          className="rounded border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-50"
          aria-label="Previous month"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          className="rounded border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-50"
          aria-label="Next month"
        >
          ›
        </button>
        <button
          type="button"
          onClick={jumpToToday}
          className="rounded border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-50"
        >
          Today
        </button>
        <h2 className="text-lg font-semibold ml-2">{monthName}</h2>
      </div>

      <div className="grid grid-cols-7 gap-px bg-neutral-200 border border-neutral-200 rounded overflow-hidden text-xs">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="bg-neutral-50 p-2 text-center font-medium text-neutral-500"
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
                cell.inMonth ? "" : "bg-neutral-50/50 text-neutral-400",
              ].join(" ")}
            >
              <div
                className={[
                  "text-xs",
                  cell.isToday
                    ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-white"
                    : "text-neutral-500",
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
                <span className="text-[11px] text-neutral-500">
                  +{overflow} more
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
