"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Flexible time input. Accepts:
 *   10pm       → 22:00
 *   10 PM      → 22:00
 *   10:30pm    → 22:30
 *   10:30 PM   → 22:30
 *   22:00      → 22:00
 *   2225       → 22:25
 *   14:30      → 14:30
 *   9          → ambiguous, needs AM/PM
 *   9am        → 09:00
 *   2:25 PM    → 14:25
 *
 * Returns a normalized "HH:MM" (24-hour) string to the parent via
 * onChange. If the input is ambiguous (no AM/PM and hour < 12), the
 * component shows AM/PM pills so the user can disambiguate.
 *
 * Military time support falls out naturally — any input with an hour
 * ≥ 13 is interpreted as 24-hour.
 */

export type ParsedTime = { hours: number; minutes: number };

/**
 * Try to parse a user-typed time string. Returns:
 *   - { ok: true, time } on a clean parse
 *   - { ok: "ambiguous", hours, minutes } when AM/PM is needed
 *   - { ok: false } when the input is unparseable
 */
export type ParseResult =
  | { ok: true; time: ParsedTime }
  | { ok: "ambiguous"; hours: number; minutes: number }
  | { ok: false };

export function parseTime(raw: string): ParseResult {
  const input = raw.trim().toLowerCase();
  if (input.length === 0) return { ok: false };

  // Detect AM/PM suffix/prefix.
  let ampm: "am" | "pm" | null = null;
  let core = input;
  const ampmMatch = core.match(/\s*(am|pm)\s*$/);
  if (ampmMatch) {
    ampm = ampmMatch[1] as "am" | "pm";
    core = core.slice(0, ampmMatch.index).trim();
  }

  let hours: number | null = null;
  let minutes: number | null = null;

  // "14:30" or "2:25" form.
  const colonMatch = core.match(/^(\d{1,2}):(\d{2})$/);
  if (colonMatch) {
    hours = Number(colonMatch[1]);
    minutes = Number(colonMatch[2]);
  }

  // "2225" four-digit military form (and "0025"). Also handle "225" → 02:25.
  if (hours === null) {
    const digitsMatch = core.match(/^(\d{3,4})$/);
    if (digitsMatch) {
      const digits = digitsMatch[1];
      if (digits.length === 4) {
        hours = Number(digits.slice(0, 2));
        minutes = Number(digits.slice(2, 4));
      } else {
        hours = Number(digits.slice(0, 1));
        minutes = Number(digits.slice(1, 3));
      }
    }
  }

  // Bare number like "10" → hour only.
  if (hours === null) {
    const hourOnly = core.match(/^(\d{1,2})$/);
    if (hourOnly) {
      hours = Number(hourOnly[1]);
      minutes = 0;
    }
  }

  if (hours === null || minutes === null) return { ok: false };
  if (minutes < 0 || minutes > 59) return { ok: false };
  if (hours < 0 || hours > 23) return { ok: false };

  if (ampm) {
    if (hours < 1 || hours > 12) return { ok: false };
    if (ampm === "pm" && hours !== 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    return { ok: true, time: { hours, minutes } };
  }

  // No AM/PM. If hour >= 13, treat as 24-hour. Otherwise ambiguous.
  if (hours >= 13 || hours === 0) {
    return { ok: true, time: { hours, minutes } };
  }
  if (hours === 12) {
    // "12:30" alone — noon is the reasonable default.
    return { ok: true, time: { hours, minutes } };
  }
  return { ok: "ambiguous", hours, minutes };
}

export function formatTime(t: ParsedTime): string {
  const hh = String(t.hours).padStart(2, "0");
  const mm = String(t.minutes).padStart(2, "0");
  return `${hh}:${mm}`;
}

function formatDisplay(t: ParsedTime): string {
  const period = t.hours >= 12 ? "PM" : "AM";
  const h12 = t.hours === 0 ? 12 : t.hours > 12 ? t.hours - 12 : t.hours;
  const mm = String(t.minutes).padStart(2, "0");
  return `${h12}:${mm} ${period}`;
}

/**
 * Props:
 *   value      — the currently-committed "HH:MM" string, or empty for none.
 *   onChange   — called with "HH:MM" when a valid time is committed, or
 *                empty string when cleared.
 *   name       — name attribute of the hidden input that the server form
 *                picks up (so the parent can keep using FormData).
 *   id         — accessibility hook; the visible input uses this id.
 *   placeholder — optional placeholder on the visible field.
 */
export function TimeInput({
  value,
  onChange,
  name,
  id,
  placeholder = "10pm, 10:30 PM, 22:00",
}: {
  value: string;
  onChange: (next: string) => void;
  name: string;
  id?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(() => {
    if (!value) return "";
    const m = value.match(/^(\d{2}):(\d{2})$/);
    if (!m) return value;
    return formatDisplay({ hours: Number(m[1]), minutes: Number(m[2]) });
  });
  const [ambiguous, setAmbiguous] = useState<{ hours: number; minutes: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync when parent resets the value.
  useEffect(() => {
    if (!value) {
      setText("");
      setAmbiguous(null);
      setError(null);
    }
  }, [value]);

  const commit = useCallback(
    (raw: string) => {
      if (raw.trim().length === 0) {
        onChange("");
        setAmbiguous(null);
        setError(null);
        return;
      }
      const result = parseTime(raw);
      if (result.ok === true) {
        onChange(formatTime(result.time));
        setText(formatDisplay(result.time));
        setAmbiguous(null);
        setError(null);
      } else if (result.ok === "ambiguous") {
        setAmbiguous({ hours: result.hours, minutes: result.minutes });
        setError(null);
      } else {
        setError("Try 10pm, 10:30 PM, 22:00, or 2225");
        setAmbiguous(null);
      }
    },
    [onChange],
  );

  function pickAmpm(period: "am" | "pm") {
    if (!ambiguous) return;
    let h = ambiguous.hours;
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    const time = { hours: h, minutes: ambiguous.minutes };
    onChange(formatTime(time));
    setText(formatDisplay(time));
    setAmbiguous(null);
    setError(null);
  }

  return (
    <div className="space-y-1">
      <input
        type="text"
        id={id}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setAmbiguous(null);
          setError(null);
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(text);
          }
        }}
        placeholder={placeholder}
        className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
        autoComplete="off"
      />
      {/* Hidden input carries the normalized 24h value to the FormData. */}
      <input type="hidden" name={name} value={value} />

      {ambiguous && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-600">{ambiguous.hours}:{String(ambiguous.minutes).padStart(2, "0")} —</span>
          <button
            type="button"
            onClick={() => pickAmpm("am")}
            className="rounded border border-neutral-300 px-2 py-0.5 hover:bg-neutral-50"
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => pickAmpm("pm")}
            className="rounded border border-neutral-300 px-2 py-0.5 hover:bg-neutral-50"
          >
            PM
          </button>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600">{error}</div>
      )}
    </div>
  );
}
