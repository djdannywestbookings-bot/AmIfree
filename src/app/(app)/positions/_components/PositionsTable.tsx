"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { PositionRow } from "@/modules/positions";
import { deletePositionAction } from "../actions";

/**
 * PositionsTable — Sling-style team-positions list (Phase 39).
 */
export function PositionsTable({
  positions,
  employeeCounts,
}: {
  positions: PositionRow[];
  employeeCounts: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return positions;
    return positions.filter((p) => p.name.toLowerCase().includes(q));
  }, [positions, query]);

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white border border-neutral-200 rounded-t-md px-4 py-3">
        <h1 className="text-lg font-semibold text-indigo-600">
          {positions.length}{" "}
          {positions.length === 1 ? "Position" : "Positions"}
        </h1>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
          />
          <Link
            href="/positions/new"
            className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-sm transition-colors"
          >
            Add position
          </Link>
        </div>
      </div>

      <div className="border border-t-0 border-neutral-200 rounded-b-md overflow-hidden bg-white">
        <div className="grid grid-cols-[2fr_1fr_1fr_60px] gap-3 px-4 py-2 border-b border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
          <span>Name</span>
          <span>Color</span>
          <span>Employees</span>
          <span className="text-right">Options</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            {positions.length === 0
              ? "No positions yet. Click Add position to create your first one (DJ, Bartender, MC…)."
              : `No positions match "${query}".`}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {filtered.map((p) => (
              <PositionRowItem
                key={p.id}
                position={p}
                count={employeeCounts[p.id] ?? 0}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PositionRowItem({
  position: p,
  count,
}: {
  position: PositionRow;
  count: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(ev: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(ev.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <li className="grid grid-cols-[2fr_1fr_1fr_60px] gap-3 items-center px-4 py-3 text-sm hover:bg-neutral-50">
      <Link
        href={`/positions/${p.id}`}
        className="font-medium text-neutral-800 hover:text-indigo-600 truncate flex items-center gap-2"
      >
        <span
          className="w-3 h-3 rounded-full border border-neutral-200 shrink-0"
          style={{ backgroundColor: p.color ?? "#e5e7eb" }}
          aria-hidden="true"
        />
        <span className="truncate">{p.name}</span>
      </Link>
      <span className="text-xs text-neutral-500 font-mono">
        {p.color ?? "—"}
      </span>
      <span className="text-neutral-600">
        {count} {count === 1 ? "employee" : "employees"}
      </span>
      <div className="text-right relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={`Options for ${p.name}`}
          className="rounded border border-transparent hover:border-neutral-200 p-1 text-neutral-400 hover:text-neutral-700"
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-10 w-32 rounded-md border border-neutral-200 bg-white shadow-md text-left text-sm">
            <Link
              href={`/positions/${p.id}`}
              className="block px-3 py-2 hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              Edit
            </Link>
            <form
              action={deletePositionAction}
              onSubmit={(ev) => {
                if (
                  !window.confirm(
                    `Delete "${p.name}"? Employees who hold this position will lose the link, but stay on the team.`,
                  )
                ) {
                  ev.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={p.id} />
              <button
                type="submit"
                className="block w-full text-left px-3 py-2 text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </form>
          </div>
        )}
      </div>
    </li>
  );
}
