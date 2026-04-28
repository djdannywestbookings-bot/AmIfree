"use client";

import { useMemo, useState, useEffect } from "react";

/**
 * AvailabilityView — anonymized busy/free calendar for /share/[token].
 *
 * The parent page passes only the time fields needed to render busy
 * blocks (start_at, end_at, all_day, service_day). This component
 * never sees titles, venues, pay, or notes — and never asks for them.
 *
 * Free days render plain. Busy days show a red dot + "Busy" pill, and
 * clicking opens a small modal that shows the busy time ranges for
 * that day (still anonymized: just "4:00p – 9:00p Busy").
 */

type Block = {
  id: string;
  start_at: string | null;
  end_at: string | null;
  all_day: boolean;
  service_day: string | null;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function bucketByDate(blocks: Block[]): Map<string, Block[]> {
  const out = new Map<string, Block[]>();
  for (const b of blocks) {
    let key: string | null = null;
    if (b.start_at) {
      const d = new Date(b.start_at);
      if (!Number.isNaN(d.getTime())) {
        const local = startOfDay(d);
        key = `${local.getFullYear()}-${local.getMonth()}-${local.getDate()}`;
      }
    } else if (b.service_day) {
      const m = b.service_day.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (m) key = `${Number(m[1])}-${Number(m[2]) - 1}-${Number(m[3])}`;
    }
    if (!key) continue;
    const arr = out.get(key) ?? [];
    arr.push(b);
    out.set(key, arr);
  }
  return out;
}

type DayBucket = {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  blocks: Block[];
};

function buildMonth(
  year: number,
  month: number,
  byDate: Map<string, Block[]>,
): DayBucket[] {
  const today = startOfDay(new Date());
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

  const cells: DayBucket[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekday + 1;
    const date = new Date(year, month, dayNum);
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const blocks = byDate.get(key) ?? [];
    cells.push({
      date,
      inMonth,
      isToday: date.getTime() === today.getTime(),
      isPast: date.getTime() < today.getTime(),
      blocks,
    });
  }
  return cells;
}

export function AvailabilityView({
  blocks,
  timezone: _timezone,
}: {
  blocks: Block[];
  timezone: string;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<DayBucket | null>(null);

  const byDate = useMemo(() => bucketByDate(blocks), [blocks]);
  const cells = useMemo(
    () => buildMonth(year, month, byDate),
    [year, month, byDate],
  );

  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function step(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function jumpToToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50"
          aria-label="Previous month"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-50"
          aria-label="Next month"
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
        <h2 className="text-lg font-semibold ml-2 tabular-nums text-slate-900">
          {monthLabel}
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden text-xs">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="bg-slate-50 p-2 text-center font-medium text-slate-500"
          >
            {d}
          </div>
        ))}
        {cells.map((cell, i) => {
          const busy = cell.blocks.length > 0;
          const interactive = cell.inMonth && !cell.isPast;
          const Wrapper = busy && interactive ? "button" : "div";
          const wrapperProps =
            busy && interactive
              ? {
                  type: "button" as const,
                  onClick: () => setSelected(cell),
                }
              : {};
          return (
            <Wrapper
              key={i}
              {...wrapperProps}
              className={[
                "min-h-[80px] sm:min-h-[100px] p-2 flex flex-col items-start gap-1 text-left transition-colors",
                cell.inMonth ? "bg-white" : "bg-slate-50/60 text-slate-300",
                cell.isPast && cell.inMonth ? "bg-slate-50/40 text-slate-400" : "",
                busy && interactive
                  ? "hover:bg-slate-50 cursor-pointer"
                  : "",
              ].join(" ")}
              aria-label={
                busy
                  ? `Busy on ${cell.date.toLocaleDateString()}`
                  : `Available on ${cell.date.toLocaleDateString()}`
              }
            >
              <span
                className={[
                  "text-xs",
                  cell.isToday
                    ? "inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white"
                    : "",
                ].join(" ")}
              >
                {cell.date.getDate()}
              </span>
              {cell.inMonth && !cell.isPast && (
                <>
                  {busy ? (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Busy
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Free
                    </span>
                  )}
                </>
              )}
            </Wrapper>
          );
        })}
      </div>

      <Legend />

      {selected && (
        <DayBusyModal
          day={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 px-1">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Free
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        Busy
      </span>
      <span className="text-slate-400">Click a busy day for time ranges.</span>
    </div>
  );
}

function DayBusyModal({
  day,
  onClose,
}: {
  day: DayBucket;
  onClose: () => void;
}) {
  // Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dateLabel = day.date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const ranges = day.blocks.map((b) => {
    if (b.all_day) return "All day";
    if (!b.start_at) return "Time TBD";
    const startStr = new Date(b.start_at).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    if (!b.end_at) return startStr;
    const endStr = new Date(b.end_at).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${startStr} – ${endStr}`;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Busy times on ${dateLabel}`}
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg w-full max-w-sm overflow-hidden">
        <header className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">
              {dateLabel}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Busy {ranges.length === 1 ? "block" : "blocks"} on this day
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 -m-1"
            aria-label="Close"
          >
            ✕
          </button>
        </header>
        <ul className="p-5 space-y-2">
          {ranges.map((r, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="tabular-nums">{r}</span>
              <span className="ml-auto text-xs text-rose-700">Busy</span>
            </li>
          ))}
        </ul>
        <footer className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          To inquire about this date, reach out directly.
        </footer>
      </div>
    </div>
  );
}
