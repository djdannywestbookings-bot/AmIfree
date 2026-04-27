"use client";

import { useState } from "react";

/**
 * Color picker for venue branding.
 *
 * 8 preset swatches that cover the common scheduling palette plus a
 * native color input for custom picks. Emits a 7-char hex string via
 * onChange. Empty string means "no color".
 */

const PRESETS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#eab308", // yellow
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export function VenueColorPicker({
  value,
  onChange,
  name,
  id,
}: {
  value: string;
  onChange: (next: string) => void;
  name: string;
  id?: string;
}) {
  const [custom, setCustom] = useState(value || "#3b82f6");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={[
              "w-7 h-7 rounded-full border-2 transition-all",
              value.toLowerCase() === c.toLowerCase()
                ? "border-neutral-900 scale-110"
                : "border-neutral-200 hover:border-neutral-400",
            ].join(" ")}
            style={{ backgroundColor: c }}
            aria-label={`Pick color ${c}`}
          />
        ))}
        <label className="flex items-center gap-1 text-xs text-neutral-600 cursor-pointer">
          <input
            type="color"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              onChange(e.target.value);
            }}
            className="w-7 h-7 rounded-full border-0 p-0 cursor-pointer"
            aria-label="Pick a custom color"
          />
          <span>custom</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-neutral-500 underline ml-auto"
          >
            Clear
          </button>
        )}
      </div>
      <input type="hidden" name={name} id={id} value={value} />
      <p className="text-xs text-neutral-500">
        Shows as a tinted pill on the calendar so you can spot venues at a glance.
      </p>
    </div>
  );
}
