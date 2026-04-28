"use client";

import { useMemo, useState } from "react";
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
 * If `currentMemberId` is omitted, the list reverts to the legacy
 * order (Unassigned → all employees) so the component stays usable
 * in surfaces that don't have a current-member context.
 */
export function EmployeeSelect({
  employees,
  initialAssignedId,
  currentMemberId,
  name = "assigned_employee_id",
}: {
  employees: WorkspaceMemberRow[];
  initialAssignedId?: string | null;
  currentMemberId?: string | null;
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

  const ordered = useMemo(() => {
    const me =
      currentMemberId && employees.find((e) => e.id === currentMemberId);
    const rest = employees.filter((e) => e.id !== currentMemberId);
    rest.sort((a, b) => {
      const an = (a.name || a.email || "").toLowerCase();
      const bn = (b.name || b.email || "").toLowerCase();
      return an.localeCompare(bn);
    });
    return { me, rest };
  }, [employees, currentMemberId]);

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
      </select>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
