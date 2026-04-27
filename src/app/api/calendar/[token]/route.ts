/**
 * Public iCal feed endpoint — Phase 34.
 *
 * GET /api/calendar/{token}
 *
 * Returns text/calendar with all bookings for the workspace whose
 * calendar_token matches. No Supabase session required — Google /
 * Apple / Outlook poll without auth, the token is the bearer.
 *
 * Caching: short TTL so changes propagate quickly to subscribed
 * calendars but we don't hammer the DB.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceByCalendarToken } from "@/server/services";
import { bookingRowSchema, type BookingRow } from "@/modules/bookings";
import { venueRowSchema, type VenueRow } from "@/modules/venues";
import { generateIcsCalendar } from "@/lib/ics";

export const runtime = "nodejs";
// Force dynamic — never serve a stale .ics from build-time cache.
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;

  const workspace = await getWorkspaceByCalendarToken(token);
  if (!workspace) {
    return new NextResponse("Calendar not found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const admin = createAdminClient();
  const [{ data: bookingRows }, { data: venueRows }] = await Promise.all([
    admin
      .from("bookings")
      .select("*")
      .eq("workspace_id", workspace.id),
    admin
      .from("venues")
      .select("*")
      .eq("workspace_id", workspace.id),
  ]);

  const bookings: BookingRow[] = (bookingRows ?? []).map((r) =>
    bookingRowSchema.parse(r),
  );
  const venues: VenueRow[] = (venueRows ?? []).map((r) =>
    venueRowSchema.parse(r),
  );

  const ics = generateIcsCalendar(workspace, bookings, venues);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // Suggest filename if a browser fetches the URL directly.
      "Content-Disposition": `inline; filename="amifree-${workspace.id.slice(0, 8)}.ics"`,
      // 5-minute browser cache, calendar clients use Last-Modified /
      // ETag for their own scheduling.
      "Cache-Control": "public, max-age=300, must-revalidate",
    },
  });
}
