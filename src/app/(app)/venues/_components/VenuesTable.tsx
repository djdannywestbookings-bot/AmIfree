"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import type { VenueRow } from "@/modules/venues";
import { deleteVenueAction } from "../actions";

/**
 * VenuesTable — Sling-style locations list (Phase 33).
 *
 * Header bar with count, search, and Add button. Below: a sortable
 * table with per-row kebab menu (Edit / Delete). Search filters by
 * name + address client-side.
 */

type SortKey = "name" | "address" | "bookings";
type SortDir = "asc" | "desc";

export function VenuesTable({
  venues,
  bookingCounts,
}: {
  venues: VenueRow[];
  bookingCounts: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q.length === 0
      ? venues
      : venues.filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            (v.address ?? "").toLowerCase().includes(q),
        );
    const sorted = [...rows].sort((a, b) => {
      let av: string | number = "";
      let bv: string | number = "";
      if (sortKey === "name") {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
      } else if (sortKey === "address") {
        av = (a.address ?? "").toLowerCase();
        bv = (b.address ?? "").toLowerCase();
      } else if (sortKey === "bookings") {
        av = bookingCounts[a.id] ?? 0;
        bv = bookingCounts[b.id] ?? 0;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [venues, bookingCounts, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-0">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white border border-neutral-200 rounded-t-md px-4 py-3">
        <h1 className="text-lg font-semibold text-blue-600">
          {venues.length} {venues.length === 1 ? "Venue" : "Venues"}
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="rounded border border-neutral-300 pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 w-48 sm:w-64"
            />
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs"
              aria-hidden="true"
            >
              ⌕
            </span>
          </div>
          <Link
            href="/venues/new"
            className="rounded bg-blue-600 text-white px-4 py-1.5 text-sm hover:bg-blue-700"
          >
            Add venue
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="border border-t-0 border-neutral-200 rounded-b-md overflow-hidden bg-white">
        {/* Header row */}
        <div className="grid grid-cols-[2fr_3fr_1fr_1fr_60px] gap-3 px-4 py-2 border-b border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
          <button
            type="button"
            onClick={() => toggleSort("name")}
            className="text-left flex items-center gap-1 hover:text-neutral-700"
          >
            Name {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
          </button>
          <button
            type="button"
            onClick={() => toggleSort("address")}
            className="text-left flex items-center gap-1 hover:text-neutral-700"
          >
            Address {sortKey === "address" && (sortDir === "asc" ? "↑" : "↓")}
          </button>
          <span>Color</span>
          <button
            type="button"
            onClick={() => toggleSort("bookings")}
            className="text-left flex items-center gap-1 hover:text-neutral-700"
          >
            Bookings{" "}
            {sortKey === "bookings" && (sortDir === "asc" ? "↑" : "↓")}
          </button>
          <span className="text-right">Options</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            {venues.length === 0
              ? "No venues yet. Click Add venue to create your first one."
              : `No venues match "${query}".`}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {filtered.map((v) => (
              <VenueRowItem
                key={v.id}
                venue={v}
                bookingCount={bookingCounts[v.id] ?? 0}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function VenueRowItem({
  venue,
  bookingCount,
}: {
  venue: VenueRow;
  bookingCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Click-outside to close kebab menu.
  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <li className="grid grid-cols-[2fr_3fr_1fr_1fr_60px] gap-3 items-center px-4 py-3 text-sm hover:bg-neutral-50">
      <Link
        href={`/venues/${venue.id}`}
        className="font-medium text-neutral-800 hover:text-blue-600 truncate"
      >
        {venue.name}
      </Link>
      <span className="text-neutral-600 truncate">
        {venue.address ?? <span className="text-neutral-400">—</span>}
      </span>
      <span className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full border border-neutral-200"
          style={{ backgroundColor: venue.color ?? "#e5e7eb" }}
          aria-hidden="true"
        />
        <span className="text-xs text-neutral-500 font-mono">
          {venue.color ?? "—"}
        </span>
      </span>
      <span className="text-neutral-600">
        {bookingCount} {bookingCount === 1 ? "booking" : "bookings"}
      </span>
      <div className="text-right relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={`Options for ${venue.name}`}
          className="rounded border border-transparent hover:border-neutral-200 p-1 text-neutral-400 hover:text-neutral-700"
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-10 w-32 rounded-md border border-neutral-200 bg-white shadow-md text-left text-sm">
            <Link
              href={`/venues/${venue.id}`}
              className="block px-3 py-2 hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              Edit
            </Link>
            <form
              action={deleteVenueAction}
              onSubmit={(e) => {
                if (
                  !window.confirm(
                    `Delete "${venue.name}"? Bookings at this venue keep their address but lose the link.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={venue.id} />
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
