"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Custom date picker.
 *
 * Shows an input that displays the selected date. Clicking the input
 * opens a popover with a month dropdown and a year dropdown (both
 * freely selectable — no one-month-at-a-time arrows) and a day grid.
 *
 * Emits YYYY-MM-DD via onChange. Empty string when cleared.
 *
 * No dependencies. No keyboard navigation beyond tab/enter. Sufficient
 * for Phase 24D.
 */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function parseISODate(s: string): { y: number; m: number; d: number } | null {
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    y: Number(match[1]),
    m: Number(match[2]) - 1,
    d: Number(match[3]),
  };
}

function formatDisplay(s: string): string {
  const parsed = parseISODate(s);
  if (!parsed) return "";
  const d = new Date(parsed.y, parsed.m, parsed.d);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DatePicker({
  value,
  onChange,
  name,
  id,
  minYear,
  maxYear,
  placeholder = "Pick a date",
}: {
  value: string;
  onChange: (next: string) => void;
  name: string;
  id?: string;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Initialize the view month/year from the current value, or today.
  const today = new Date();
  const initial = parseISODate(value) ?? {
    y: today.getFullYear(),
    m: today.getMonth(),
    d: today.getDate(),
  };
  const [viewYear, setViewYear] = useState(initial.y);
  const [viewMonth, setViewMonth] = useState(initial.m);

  // Re-sync view when the parent value changes externally.
  useEffect(() => {
    const p = parseISODate(value);
    if (p) {
      setViewYear(p.y);
      setViewMonth(p.m);
    }
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Year range defaults: 10 past, 10 future.
  const thisYear = today.getFullYear();
  const minY = minYear ?? thisYear - 10;
  const maxY = maxYear ?? thisYear + 10;
  const years: number[] = [];
  for (let y = minY; y <= maxY; y++) years.push(y);

  // Build the day grid for the current view month.
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = i - startWeekday + 1;
    cells.push(d >= 1 && d <= daysInMonth ? d : null);
  }

  const selected = parseISODate(value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left rounded border border-neutral-300 px-2 py-1.5 text-sm bg-white"
      >
        {value ? (
          formatDisplay(value)
        ) : (
          <span className="text-neutral-400">{placeholder}</span>
        )}
      </button>
      {/* Hidden input so the surrounding <form> picks up the ISO value. */}
      <input type="hidden" name={name} value={value} />

      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded border border-neutral-200 bg-white shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
              aria-label="Month"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="rounded border border-neutral-300 px-2 py-1 text-sm"
              aria-label="Year"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs text-neutral-500 mb-1 text-center">
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) {
                return <div key={i} />;
              }
              const isSelected =
                selected &&
                selected.y === viewYear &&
                selected.m === viewMonth &&
                selected.d === d;
              const isToday =
                viewYear === today.getFullYear() &&
                viewMonth === today.getMonth() &&
                d === today.getDate();
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(toISODate(viewYear, viewMonth, d));
                    setOpen(false);
                  }}
                  className={[
                    "text-xs rounded py-1.5 hover:bg-neutral-100",
                    isSelected
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "",
                    !isSelected && isToday
                      ? "border border-neutral-400"
                      : "",
                  ].join(" ")}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-neutral-500 underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(
                  toISODate(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                  ),
                );
                setOpen(false);
              }}
              className="text-neutral-700 underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
