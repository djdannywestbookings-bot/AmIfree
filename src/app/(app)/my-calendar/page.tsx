import { headers } from "next/headers";
import {
  requireWorkspace,
  listBookings,
  listVenues,
  getCurrentMember,
} from "@/server/services";
import { getCurrentActor } from "@/server/policies";
import { CalendarMonthGrid } from "../calendar/_components/CalendarMonthGrid";
import { ShareCalendarSection } from "./_components/ShareCalendarSection";

/**
 * "My Calendar" — workspace shifts filtered to the current user.
 *
 * Phase 40 expansion: now matches shifts that are EITHER created by
 * the current user OR assigned to them as an employee. The "assigned
 * to me" path is what makes My Calendar useful for non-owner team
 * members — they only see what's on their plate.
 *
 * Adds a "Share my availability" card at the top — a public link
 * that anyone can open to see anonymized busy/free per day.
 */
export default async function MyCalendarPage() {
  const workspace = await requireWorkspace();
  const actor = await getCurrentActor();
  const [allShifts, venues, member] = await Promise.all([
    listBookings(workspace),
    listVenues(workspace),
    getCurrentMember(workspace),
  ]);

  const myShifts = actor
    ? allShifts.filter(
        (s) =>
          s.created_by === actor.userId ||
          (member?.id && s.assigned_employee_id === member.id),
      )
    : [];

  // Build the absolute base URL for the share link.
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "amifreescheduler.com";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const baseUrl = `${proto}://${host}`;

  return (
    <main className="max-w-screen-xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold">My Calendar</h1>
      </div>

      <ShareCalendarSection
        initialToken={member?.availability_token ?? null}
        baseUrl={baseUrl}
      />

      {myShifts.length === 0 && allShifts.length > 0 ? (
        <div className="border border-dashed border-slate-300 rounded-md p-6 text-center text-sm text-slate-500">
          Nothing on your plate yet. The
          <a href="/calendar" className="underline mx-1">
            full Calendar
          </a>
          shows everything in the workspace.
        </div>
      ) : (
        <CalendarMonthGrid
          shifts={myShifts}
          venues={venues}
          defaultView={member?.default_calendar_view ?? 1}
        />
      )}
    </main>
  );
}
