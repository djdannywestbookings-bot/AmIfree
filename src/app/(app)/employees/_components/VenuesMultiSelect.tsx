"use client";

import { useState } from "react";
import type { VenueRow } from "@/modules/venues";

/**
 * VenuesMultiSelect — pick which venues this employee is eligible at.
 *
 * Mirrors PositionsMultiSelect: toggleable chips backed by hidden
 * inputs so the server action can pluck them out of FormData under
 * the same field name (`venue_ids`).
 *
 * The booking form's Assigned-to dropdown filters to employees who
 * have the booking's venue selected here.
 */
export function VenuesMultiSelect({
  allVenues,
  initialSelectedIds = [],
  name = "venue_ids",
}: {
  allVenues: VenueRow[];
  initialSelectedIds?: string[];
  name?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelectedIds),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (allVenues.length === 0) {
    return (
      <div className="text-xs text-slate-500">
        No venues yet —{" "}
        <a href="/venues/new" className="underline text-indigo-600">
          create one
        </a>{" "}
        and come back to assign it.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allVenues.map((v) => {
        const isSelected = selected.has(v.id);
        const dot = v.color ?? "#e5e7eb";
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => toggle(v.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
              isSelected
                ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full border border-slate-200"
              style={{ backgroundColor: dot }}
              aria-hidden="true"
            />
            <span>{v.name}</span>
            {isSelected && <span className="text-indigo-700">✓</span>}
          </button>
        );
      })}
      {[...selected].map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
