import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentActor } from "@/server/policies";

/**
 * Protected shell layout for all (app)/* routes.
 *
 * Middleware already redirects unauthenticated requests to /login — this
 * server-side check is defense in depth, and also enforces the owner
 * allowlist plus application role at the shell level so a revoked owner
 * cannot reach protected surfaces until their session expires.
 *
 * Phase 22 §Protected route/app shell plan: Agenda / Coverage / Intake /
 * Settings are the only canonical surfaces, and Agenda = Bookings only
 * while Coverage = Shift Occurrences only — the nav labels must enforce
 * that separation from day one.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const actor = await getCurrentActor();

  if (!actor) {
    redirect("/login");
  }

  const navLinks: Array<{ href: string; label: string }> = [
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

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="bg-white/85 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20 shadow-card">
        <nav className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4 sm:gap-6 text-sm">
          {/* Wordmark mirrors the logo: AmI in indigo, Free in teal */}
          <Link
            href="/calendar"
            className="font-bold tracking-tight text-base shrink-0"
          >
            <span className="text-indigo-700">AmI</span>
            <span className="text-teal-500">Free</span>
          </Link>
          <div className="flex gap-1 flex-1 overflow-x-auto text-slate-600 -mx-1 px-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-2.5 py-1.5 rounded-md hover:bg-slate-100 hover:text-indigo-700 transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </div>
          {/* Reserved slot for future notification entry point. */}
          <span
            className="text-xs text-slate-500 hidden sm:inline truncate max-w-[14rem]"
            aria-label="Signed in as"
            title={actor.email}
          >
            {actor.email}
          </span>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
