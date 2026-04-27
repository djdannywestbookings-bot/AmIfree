"use client";

import { useState } from "react";
import type { PositionRow } from "@/modules/positions";

/**
 * PositionsMultiSelect — Phase 39.
 *
 * Lightweight multi-select rendered as a list of toggleable chips.
 * Hidden inputs serialize the selection so server actions can pluck
 * them out of FormData (one entry per selected position id).
 */
export function PositionsMultiSelect({
  allPositions,
  initialSelectedIds = [],
  name = "position_ids",
}: {
  allPositions: PositionRow[];
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

  if (allPositions.length === 0) {
    return (
      <div className="text-xs text-neutral-500">
        No positions yet —{" "}
        <a href="/positions/new" className="underline text-indigo-600">
          create one
        </a>{" "}
        and come back to assign it.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allPositions.map((p) => {
        const isSelected = selected.has(p.id);
        const dot = p.color ?? "#e5e7eb";
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => toggle(p.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
              isSelected
                ? "bg-indigo-50 border-indigo-300 text-indigo-800"
                : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full border border-neutral-200"
              style={{ backgroundColor: dot }}
              aria-hidden="true"
            />
            <span>{p.name}</span>
            {isSelected && <span className="text-indigo-700">✓</span>}
          </button>
        );
      })}
      {/* Hidden inputs — one per selected id so FormData carries them
          all under the same field name. */}
      {[...selected].map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
    </div>
  );
}
