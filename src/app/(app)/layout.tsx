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
        <nav className="max-w-screen-lg mx-auto px-4 py-3 flex items-center gap-4 sm:gap-6 text-sm">
          <span className="font-semibold">AmIFree</span>
          <div className="flex gap-3 sm:gap-4 flex-1 overflow-x-auto">
            <Link href="/calendar" className="hover:text-neutral-600">
              Calendar
            </Link>
            <Link href="/my-calendar" className="hover:text-neutral-600 whitespace-nowrap">
              My Calendar
            </Link>
            <Link href="/agenda" className="hover:text-neutral-600">
              Schedule
            </Link>
            <Link href="/venues" className="hover:text-neutral-600">
              Venues
            </Link>
            <Link href="/intake" className="hover:text-neutral-600">
              Intake
            </Link>
            <Link href="/settings" className="hover:text-neutral-600">
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
