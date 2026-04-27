"use client";

import { useState } from "react";
import type { WorkspaceMemberRow } from "@/modules/auth";

/**
 * EmployeeSelect — Phase 40.
 *
 * Simple dropdown of assignable employees. The booking form reads the
 * selected id from the hidden `assigned_employee_id` input so the
 * server action can pluck it out of FormData.
 *
 * Pending invites are shown with an amber dot so the picker knows
 * the assignee hasn't signed in yet.
 */
export function EmployeeSelect({
  employees,
  initialAssignedId,
  name = "assigned_employee_id",
}: {
  employees: WorkspaceMemberRow[];
  initialAssignedId?: string | null;
  name?: string;
}) {
  const [value, setValue] = useState(initialAssignedId ?? "");

  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm bg-white"
      >
        <option value="">Unassigned</option>
        {employees.map((e) => {
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
