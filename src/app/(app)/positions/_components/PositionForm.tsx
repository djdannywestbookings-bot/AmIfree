"use client";

import { useState, type FormEvent } from "react";
import { createPositionAction, updatePositionAction } from "../actions";
import type { PositionRow } from "@/modules/positions";
import { VenueColorPicker } from "../../venues/_components/VenueColorPicker";

const PRESET_NAMES = [
  "DJ",
  "Bartender",
  "MC",
  "Sound Tech",
  "Photographer",
  "Videographer",
  "Promoter",
  "Security",
];

/**
 * Reusable position form (Phase 39). Reuses the venue color picker
 * since it's the same swatch + custom UX.
 */
export function PositionForm({ existing }: { existing?: PositionRow }) {
  const isEdit = Boolean(existing);
  const [name, setName] = useState(existing?.name ?? "");
  const [color, setColor] = useState(existing?.color ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData();
    form.set("name", name);
    if (color) form.set("_position_color", color);

    if (isEdit && existing) {
      form.set("id", existing.id);
      const result = await updatePositionAction(form);
      setPending(false);
      if (result && !result.ok) setError(result.error);
      return;
    }

    const result = await createPositionAction(form);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setColor("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border border-neutral-200 rounded-md p-4 bg-white"
    >
      <label className="block">
        <span className="block text-xs font-medium text-neutral-700 mb-1">
          Position name
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          placeholder="DJ, Bartender, MC, Sound Tech…"
          list="position-presets"
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <datalist id="position-presets">
          {PRESET_NAMES.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </label>

      <div>
        <span className="block text-xs font-medium text-neutral-700 mb-1">
          Color
        </span>
        <VenueColorPicker
          value={color}
          onChange={setColor}
          name="_position_color_visual"
        />
        <p className="text-[11px] text-neutral-500 mt-1">
          Used as the dot next to the position name on the team list.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 text-sm disabled:opacity-50 transition-colors"
        >
          {pending ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create position"}
        </button>
        <a
          href="/positions"
          className="text-xs rounded border border-neutral-300 py-2 px-4 hover:bg-neutral-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
