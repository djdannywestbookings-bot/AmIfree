"use client";

import { useState, useEffect } from "react";

/**
 * Flexible duration input. Accepts:
 *   4            → 240 min (4 hours — most common case for a "4 hour gig")
 *   4h           → 240 min
 *   4 hours      → 240 min
 *   2.5h         → 150 min
 *   2h30m        → 150 min
 *   2hr 30m      → 150 min
 *   45m          → 45 min
 *   45 min       → 45 min
 *   90m          → 90 min
 *
 * Returns minutes via onChange (a string of digits so it fits naturally
 * in a FormData hidden input). Empty string when cleared.
 */

export function parseDuration(raw: string): number | null {
  const input = raw.trim().toLowerCase();
  if (input.length === 0) return null;

  // 2h30m / 2hr 30m / 2h 30min / 2h
  const hmMatch = input.match(
    /^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)\s*(?:(\d+)\s*(?:m|min|mins|minutes?)?)?$/,
  );
  if (hmMatch) {
    const hours = Number(hmMatch[1]);
    const mins = hmMatch[2] ? Number(hmMatch[2]) : 0;
    const total = Math.round(hours * 60) + mins;
    return total > 0 ? total : null;
  }

  // 45m / 45min / 45 minutes
  const mMatch = input.match(/^(\d+)\s*(?:m|min|mins|minutes?)$/);
  if (mMatch) {
    const mins = Number(mMatch[1]);
    return mins > 0 ? mins : null;
  }

  // Bare number → interpret as hours. "4" = 4 hours.
  const bare = input.match(/^(\d+(?:\.\d+)?)$/);
  if (bare) {
    const hours = Number(bare[1]);
    const total = Math.round(hours * 60);
    return total > 0 ? total : null;
  }

  return null;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

export function DurationInput({
  value,
  onChange,
  name,
  id,
  placeholder = "4h, 4 hours, 2h30m, 45m",
}: {
  value: string;
  onChange: (minutes: string) => void;
  name: string;
  id?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(() =>
    value ? formatDuration(Number(value)) : "",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setText("");
      setError(null);
    }
  }, [value]);

  function commit(raw: string) {
    if (raw.trim().length === 0) {
      onChange("");
      setError(null);
      return;
    }
    const minutes = parseDuration(raw);
    if (minutes === null) {
      setError("Try 4h, 4 hours, 2h30m, 45m");
      return;
    }
    onChange(String(minutes));
    setText(formatDuration(minutes));
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
      <input type="hidden" name={name} value={value} />
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
