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

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <nav className="max-w-screen-xl mx-auto px-4 py-3 flex items-center gap-4 sm:gap-6 text-sm">
          {/* Wordmark mirrors the logo: AmI in indigo, Free in teal */}
          <Link href="/calendar" className="font-bold tracking-tight text-base">
            <span className="text-indigo-700">AmI</span>
            <span className="text-teal-500">Free</span>
          </Link>
          <div className="flex gap-3 sm:gap-5 flex-1 overflow-x-auto text-neutral-700">
            <Link href="/calendar" className="hover:text-indigo-600 transition-colors">
              Calendar
            </Link>
            <Link href="/my-calendar" className="hover:text-indigo-600 transition-colors whitespace-nowrap">
              My Calendar
            </Link>
            <Link href="/agenda" className="hover:text-indigo-600 transition-colors">
              Schedule
            </Link>
            <Link href="/venues" className="hover:text-indigo-600 transition-colors">
              Venues
            </Link>
            <Link href="/employees" className="hover:text-indigo-600 transition-colors">
              Employees
            </Link>
            <Link href="/positions" className="hover:text-indigo-600 transition-colors">
              Positions
            </Link>
            <Link href="/intake" className="hover:text-indigo-600 transition-colors">
              Intake
            </Link>
            <Link href="/settings" className="hover:text-indigo-600 transition-colors">
              Settings
            </Link>
          </div>
          {/* Reserved slot for future notification entry point. */}
          <span
            className="text-xs text-neutral-500 hidden sm:inline"
            aria-label="Signed in as"
          >
            {actor.email}
          </span>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
