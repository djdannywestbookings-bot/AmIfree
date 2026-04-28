import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentActor } from "@/server/policies";
import {
  requireWorkspace,
  countPendingInquiriesForCurrentMember,
} from "@/server/services";
import { NavLinks } from "./_components/NavLinks";
import { signOutAction } from "./_actions/sign-out";

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

  // Pull a few server-side counts the nav badges need. Best-effort —
  // if any throws (e.g., the inquiries table isn't there yet on a
  // pre-migration env), default to 0 so the nav still renders.
  let pendingInquiries = 0;
  try {
    const workspace = await requireWorkspace();
    pendingInquiries = await countPendingInquiriesForCurrentMember(workspace);
  } catch {
    /* keep nav rendering even if the lookup fails */
  }

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

          <NavLinks badges={{ inquiries: pendingInquiries }} />

          {/* Identity + persistent log-out, always pinned to the right. */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span
              className="text-xs text-slate-500 hidden sm:inline truncate max-w-[14rem]"
              aria-label="Signed in as"
              title={actor.email}
            >
              {actor.email}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-xs px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                Log out
              </button>
            </form>
          </div>
        </nav>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
