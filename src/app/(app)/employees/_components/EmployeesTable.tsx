"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { WorkspaceMemberRow } from "@/modules/auth";
import { deleteEmployeeAction } from "../actions";

/**
 * EmployeesTable — Sling-style team list (Phase 38).
 *
 * Header bar with count + search + Add button. Below: a table with
 * Name, Email, Phone, Role, Status, and a per-row kebab menu
 * (Edit / Delete).
 *
 * Pending invites render with an amber "Pending" pill so the owner
 * knows who hasn't signed in yet.
 */

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  manager_lite: "Manager",
  employee: "Employee",
};

const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  joined: "bg-emerald-50 text-emerald-800 border-emerald-200",
  disabled: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

export function EmployeesTable({
  employees,
}: {
  employees: WorkspaceMemberRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      const blob = [e.name, e.email, e.phone, e.role, e.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [employees, query]);

  const joinedCount = employees.filter((e) => e.status === "joined").length;
  const pendingCount = employees.filter((e) => e.status === "pending").length;

  return (
    <div className="space-y-0">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white border border-neutral-200 rounded-t-md px-4 py-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-lg font-semibold text-indigo-600">
            {employees.length}{" "}
            {employees.length === 1 ? "Employee" : "Employees"}
          </h1>
          {pendingCount > 0 && (
            <span className="text-xs text-amber-700">
              {pendingCount} pending invite{pendingCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
          />
          <Link
            href="/employees/new"
            className="rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-sm transition-colors"
          >
            Add employee
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="border border-t-0 border-neutral-200 rounded-b-md overflow-hidden bg-white">
        <div className="grid grid-cols-[2fr_2.5fr_1.3fr_1fr_1fr_60px] gap-3 px-4 py-2 border-b border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Options</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-500">
            {employees.length === 0
              ? "No employees yet. Click Add employee to invite your first team member."
              : `No employees match "${query}".`}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {filtered.map((e) => (
              <EmployeeRow key={e.id} employee={e} />
            ))}
          </ul>
        )}
      </div>

      {joinedCount === 0 && pendingCount > 0 && (
        <p className="text-xs text-neutral-500 mt-3">
          Invited employees can sign in at{" "}
          <span className="font-mono text-neutral-700">am-ifree.vercel.app/login</span>{" "}
          using the email you added. They&apos;ll receive a 6-digit code by email.
        </p>
      )}
    </div>
  );
}

function EmployeeRow({ employee: e }: { employee: WorkspaceMemberRow }) {
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

  const isOwner = e.role === "owner";

  return (
    <li className="grid grid-cols-[2fr_2.5fr_1.3fr_1fr_1fr_60px] gap-3 items-center px-4 py-3 text-sm hover:bg-neutral-50">
      <Link
        href={`/employees/${e.id}`}
        className="font-medium text-neutral-800 hover:text-indigo-600 truncate"
      >
        {e.name ?? <span className="text-neutral-400">(no name)</span>}
      </Link>
      <span className="text-neutral-600 truncate">
        {e.email ?? <span className="text-neutral-400">—</span>}
      </span>
      <span className="text-neutral-600 truncate">
        {e.phone ?? <span className="text-neutral-400">—</span>}
      </span>
      <span className="text-neutral-700">
        {ROLE_LABEL[e.role] ?? e.role}
      </span>
      <span>
        <span
          className={`inline-block rounded border px-2 py-0.5 text-[11px] font-medium ${STATUS_PILL[e.status] ?? STATUS_PILL.joined}`}
        >
          {e.status === "pending" ? "Pending" : e.status === "disabled" ? "Disabled" : "Joined"}
        </span>
      </span>
      <div className="text-right relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={`Options for ${e.name ?? e.email ?? "employee"}`}
          className="rounded border border-transparent hover:border-neutral-200 p-1 text-neutral-400 hover:text-neutral-700"
        >
          ⋮
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-10 w-32 rounded-md border border-neutral-200 bg-white shadow-md text-left text-sm">
            <Link
              href={`/employees/${e.id}`}
              className="block px-3 py-2 hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              Edit
            </Link>
            {!isOwner && (
              <form
                action={deleteEmployeeAction}
                onSubmit={(ev) => {
                  if (
                    !window.confirm(
                      `Remove ${e.name ?? e.email ?? "this employee"} from the workspace?`,
                    )
                  ) {
                    ev.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={e.id} />
                <button
                  type="submit"
                  className="block w-full text-left px-3 py-2 text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
