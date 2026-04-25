"use client";

import { useState } from "react";
import type { VenueRow } from "@/modules/venues";

/**
 * Venue dropdown with inline "Add new venue" option.
 *
 * Phase 28. Renders a select with the workspace's saved venues plus
 * three sentinel options at the top:
 *   ""              — no venue (one-off / unknown)
 *   "__new__"       — expands inline name + address fields below
 *
 * The form picks up the result via three hidden inputs on submit:
 *   venue_id          — uuid of an existing venue, or empty
 *   new_venue_name    — only set when "__new__" is selected
 *   new_venue_address — only set when "__new__" is selected
 *
 * The server action uses these to either link an existing venue or
 * create a new one in-line before saving the booking.
 */
export function VenueSelect({
  venues,
  initialVenueId,
}: {
  venues: VenueRow[];
  initialVenueId?: string | null;
}) {
  const [selected, setSelected] = useState<string>(initialVenueId ?? "");
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const isNew = selected === "__new__";

  return (
    <div className="space-y-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm bg-white"
      >
        <option value="">— No venue —</option>
        {venues.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
            {v.address ? ` · ${v.address}` : ""}
          </option>
        ))}
        <option value="__new__">+ Add a new venue</option>
      </select>

      {/* Hidden field for the form to pick up */}
      <input
        type="hidden"
        name="venue_id"
        value={isNew ? "" : selected}
      />

      {isNew && (
        <div className="space-y-2 rounded border border-dashed border-neutral-300 p-3">
          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              New venue name
            </span>
            <input
              type="text"
              name="new_venue_name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              maxLength={200}
              placeholder="Bottle Blonde, The Grand Ballroom, Studio West"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-neutral-700 mb-1">
              Address (optional)
            </span>
            <input
              type="text"
              name="new_venue_address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              maxLength={500}
              placeholder="Street, city, state — used in directions later"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </label>
          <p className="text-xs text-neutral-500">
            Will be saved to your venue list — pick from the dropdown next time.
          </p>
        </div>
      )}
    </div>
  );
}
