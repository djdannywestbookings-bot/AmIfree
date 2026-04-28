"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * NavLinks — the horizontal app nav rendered inside (app)/layout.tsx.
 *
 * Lives as a client component so it can read usePathname() and
 * highlight the currently active section. The list of links itself is
 * defined here (single source of truth).
 *
 * Active rule: pathname matches the link's href exactly OR is a
 * sub-route under it (so /agenda/abc-123 still lights the Schedule
 * link).
 */
const LINKS: Array<{ href: string; label: string }> = [
  { href: "/calendar", label: "Calendar" },
  { href: "/my-calendar", label: "My Calendar" },
  { href: "/agenda", label: "Schedule" },
  { href: "/venues", label: "Venues" },
  { href: "/employees", label: "Employees" },
  { href: "/positions", label: "Positions" },
  { href: "/intake", label: "Intake" },
  { href: "/timesheet", label: "Timesheet" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 flex-1 overflow-x-auto -mx-1 px-1">
      {LINKS.map(({ href, label }) => {
        const active =
          pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={[
              "px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors text-sm",
              active
                ? "bg-indigo-50 text-indigo-700 font-medium ring-1 ring-indigo-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-indigo-700",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
