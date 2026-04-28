"use client";

import { useMemo, useState, useEffect } from "react";
import type { WorkspaceMemberRow } from "@/modules/auth";

/**
 * EmployeeSelect — assignee dropdown for booking forms.
 *
 * Order:
 *   1. Current user ("Me · {email}") — first in the list so the
 *      common case (the owner taking the gig themselves) is one click.
 *   2. Unassigned
 *   3. Other employees (alphabetical, pending invites tagged)
 *
 * Venue eligibility filter:
 *   When `eligibleEmployeeIds` is provided AND non-null, only employees
 *   in that list (plus the current user, who's always available) appear
 *   in the dropdown. A small "Show all" toggle lets the user override
 *   the filter for one-off cases.
 *
 *   When `eligibleEmployeeIds` is null/undefined, no filter is applied.
 */
export function EmployeeSelect({
  employees,
  initialAssignedId,
  currentMemberId,
  eligibleEmployeeIds,
  name = "assigned_employee_id",
}: {
  employees: WorkspaceMemberRow[];
  initialAssignedId?: string | null;
  currentMemberId?: string | null;
  eligibleEmployeeIds?: string[] | null;
  name?: string;
}) {
  // Default selection: prefer initialAssignedId (edit case). If absent,
  // default to the current user (create case). Falls through to "" if
  // the current user isn't in the assignable list.
  const defaultValue =
    initialAssignedId !== undefined && initialAssignedId !== null
      ? initialAssignedId
      : currentMemberId &&
        employees.some((e) => e.id === currentMemberId)
      ? currentMemberId
      : "";

  const [value, setValue] = useState(defaultValue);
  const [showAll, setShowAll] = useState(false);

  // Reset the show-all override whenever the venue filter changes,
  // so changing venue re-applies the eligibility filter cleanly.
  const eligibilityKey = eligibleEmployeeIds?.join(",") ?? "__none__";
  useEffect(() => {
    setShowAll(false);
  }, [eligibilityKey]);

  const filterActive =
    !showAll &&
    eligibleEmployeeIds !== undefined &&
    eligibleEmployeeIds !== null;

  const filtered = useMemo(() => {
    if (!filterActive) return employees;
    const allowed = new Set(eligibleEmployeeIds ?? []);
    // The current user is always allowed (they can take a gig anywhere).
    if (currentMemberId) allowed.add(currentMemberId);
    return employees.filter((e) => allowed.has(e.id));
  }, [employees, eligibleEmployeeIds, currentMemberId, filterActive]);

  const ordered = useMemo(() => {
    const me =
      currentMemberId && filtered.find((e) => e.id === currentMemberId);
    const rest = filtered.filter((e) => e.id !== currentMemberId);
    rest.sort((a, b) => {
      const an = (a.name || a.email || "").toLowerCase();
      const bn = (b.name || b.email || "").toLowerCase();
      return an.localeCompare(bn);
    });
    return { me, rest };
  }, [filtered, currentMemberId]);

  // If the previously-selected assignee was filtered out, surface them
  // anyway as a "current selection (not eligible)" option so the form
  // doesn't silently drop the value.
  const selectedNotInList =
    value && !filtered.some((e) => e.id === value)
      ? employees.find((e) => e.id === value) ?? null
      : null;

  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm bg-white"
      >
        {ordered.me && (
          <option value={ordered.me.id}>
            Me{ordered.me.email ? ` · ${ordered.me.email}` : ""}
          </option>
        )}
        <option value="">Unassigned</option>
        {ordered.rest.map((e) => {
          const label = e.name || e.email || "(no name)";
          const suffix = e.status === "pending" ? " · pending" : "";
          return (
            <option key={e.id} value={e.id}>
              {label}
              {suffix}
            </option>
          );
        })}
        {selectedNotInList && (
          <option value={selectedNotInList.id}>
            {selectedNotInList.name || selectedNotInList.email || "(no name)"}{" "}
            · not eligible at this venue
          </option>
        )}
      </select>
      {filterActive && (
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>Filtered to employees eligible at this venue.</span>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline"
          >
            Show all
          </button>
        </div>
      )}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
