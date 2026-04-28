"use client";

import { useState, useEffect } from "react";

/**
 * DurationInput — primary picker is a 1-hour-increment dropdown
 * (1h..12h). For atypical durations users pick "Custom…" which
 * reveals the original free-form text field that accepts:
 *   4            → 240 min
 *   4h / 4 hours → 240 min
 *   2.5h         → 150 min
 *   2h30m / 2h 30min → 150 min
 *   45m / 45 min     → 45 min
 *
 * Returns minutes as a digit string via onChange (suits FormData).
 */

const PRESET_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const CUSTOM_VALUE = "__custom";

export function parseDuration(raw: string): number | null {
  const input = raw.trim().toLowerCase();
  if (input.length === 0) return null;

  const hmMatch = input.match(
    /^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)\s*(?:(\d+)\s*(?:m|min|mins|minutes?)?)?$/,
  );
  if (hmMatch) {
    const hours = Number(hmMatch[1]);
    const mins = hmMatch[2] ? Number(hmMatch[2]) : 0;
    const total = Math.round(hours * 60) + mins;
    return total > 0 ? total : null;
  }

  const mMatch = input.match(/^(\d+)\s*(?:m|min|mins|minutes?)$/);
  if (mMatch) {
    const mins = Number(mMatch[1]);
    return mins > 0 ? mins : null;
  }

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

function isPresetMinutes(mins: number): boolean {
  return mins > 0 && mins % 60 === 0 && PRESET_HOURS.includes(mins / 60);
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
  // The dropdown either holds an hour-preset string ("4") or
  // CUSTOM_VALUE. When CUSTOM_VALUE, we render the text field below.
  const initial = (() => {
    if (!value) return "";
    const mins = Number(value);
    if (Number.isFinite(mins) && isPresetMinutes(mins)) {
      return String(mins / 60);
    }
    return CUSTOM_VALUE;
  })();

  const [select, setSelect] = useState(initial);
  const [text, setText] = useState(() =>
    value ? formatDuration(Number(value)) : "",
  );
  const [error, setError] = useState<string | null>(null);

  // Stay in sync if the parent clears or replaces value.
  useEffect(() => {
    if (!value) {
      setSelect("");
      setText("");
      setError(null);
      return;
    }
    const mins = Number(value);
    if (Number.isFinite(mins) && isPresetMinutes(mins)) {
      setSelect(String(mins / 60));
      setText(formatDuration(mins));
    } else if (Number.isFinite(mins)) {
      setSelect(CUSTOM_VALUE);
      setText(formatDuration(mins));
    }
  }, [value]);

  function handleSelectChange(next: string) {
    setSelect(next);
    setError(null);
    if (next === "") {
      onChange("");
      setText("");
      return;
    }
    if (next === CUSTOM_VALUE) {
      // Don't change the underlying value yet — wait for the user to
      // type something into the custom field.
      return;
    }
    const hours = Number(next);
    if (Number.isFinite(hours) && hours > 0) {
      const mins = hours * 60;
      onChange(String(mins));
      setText(formatDuration(mins));
    }
  }

  function commitCustom(raw: string) {
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
      <select
        id={id}
        value={select}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm bg-white"
      >
        <option value="">— No duration —</option>
        {PRESET_HOURS.map((h) => (
          <option key={h} value={String(h)}>
            {h === 1 ? "1 hour" : `${h} hours`}
          </option>
        ))}
        <option value={CUSTOM_VALUE}>Custom…</option>
      </select>

      {select === CUSTOM_VALUE && (
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
          onBlur={(e) => commitCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitCustom(text);
            }
          }}
          placeholder={placeholder}
          className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          autoComplete="off"
          aria-label="Custom duration"
        />
      )}

      <input type="hidden" name={name} value={value} />
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
