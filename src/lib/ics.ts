/**
 * iCalendar (RFC 5545) feed generator — Phase 34.
 *
 * Produces a VCALENDAR document from a workspace's bookings + venues.
 * Subscribed by Google Calendar, Apple Calendar, Outlook, etc., each
 * of which polls the feed on a schedule (Google: every few hours,
 * Apple: hourly, Outlook: every 3 hours). One-way push: AmIFree is
 * the source of truth, external calendars are read-only mirrors.
 *
 * Format references:
 *   - RFC 5545 (iCalendar)
 *   - https://www.rfc-editor.org/rfc/rfc5545
 *
 * Lines must be folded at 75 octets per the spec; we fold conservatively
 * at 73 to give multibyte chars a buffer.
 */

import type { BookingRow } from "@/modules/bookings";
import type { VenueRow } from "@/modules/venues";
import type { WorkspaceRow } from "@/modules/auth";

// ---- Helpers ----------------------------------------------------------

/** Escape per RFC 5545: backslash, semicolon, comma, newline. */
function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold long lines at 73 octets, continuation lines start with a space. */
function foldLine(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (i === 0) {
      parts.push(line.slice(0, 73));
      i = 73;
    } else {
      parts.push(" " + line.slice(i, i + 72));
      i += 72;
    }
  }
  return parts.join("\r\n");
}

/** "20260428T030000Z" — UTC, no separators. */
function formatUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = String(d.getUTCFullYear()).padStart(4, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const HH = String(d.getUTCHours()).padStart(2, "0");
  const MM = String(d.getUTCMinutes()).padStart(2, "0");
  const SS = String(d.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${HH}${MM}${SS}Z`;
}

/** "20260428" — for all-day VEVENTs (DATE value type). */
function formatDate(serviceDay: string): string {
  // service_day is "YYYY-MM-DD"
  return serviceDay.replace(/-/g, "");
}

function bookingStatusToIcs(s: BookingRow["status"]): string {
  switch (s) {
    case "inquiry":
    case "hold":
    case "requested":
      return "TENTATIVE";
    case "cancelled":
      return "CANCELLED";
    default:
      return "CONFIRMED";
  }
}

// ---- VEVENT builder ---------------------------------------------------

function buildVEvent(
  booking: BookingRow,
  venuesById: Map<string, VenueRow>,
  productHost: string,
): string[] {
  const lines: string[] = [];
  lines.push("BEGIN:VEVENT");
  lines.push(`UID:booking-${booking.id}@${productHost}`);
  lines.push(`DTSTAMP:${formatUtc(new Date().toISOString())}`);

  // Time block. Three cases:
  //   1) start_at + end_at both set → DTSTART/DTEND in UTC
  //   2) start_at only → DTSTART + 60-minute fallback DTEND
  //   3) neither (TBD/all-day) → all-day VEVENT on service_day, or skip
  //      if no service_day either
  if (booking.start_at) {
    lines.push(`DTSTART:${formatUtc(booking.start_at)}`);
    if (booking.end_at) {
      lines.push(`DTEND:${formatUtc(booking.end_at)}`);
    } else {
      // Fallback 60-min duration so the event is visible on calendars
      // that require DTEND.
      const start = new Date(booking.start_at);
      const fallbackEnd = new Date(start.getTime() + 60 * 60_000);
      lines.push(`DTEND:${formatUtc(fallbackEnd.toISOString())}`);
    }
  } else if (booking.service_day) {
    const dateStr = formatDate(booking.service_day);
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
    // For all-day VEVENT, DTEND is the next day.
    const next = new Date(booking.service_day + "T00:00:00Z");
    next.setUTCDate(next.getUTCDate() + 1);
    lines.push(`DTEND;VALUE=DATE:${formatDate(next.toISOString().slice(0, 10))}`);
  } else {
    // No date at all — skip this booking from the feed; calendars
    // require at least DTSTART.
    return [];
  }

  // Title / SUMMARY
  const title = booking.title || "Untitled booking";
  const venue = booking.venue_id ? venuesById.get(booking.venue_id) : null;
  const summary = venue
    ? `${title} · ${venue.name}`
    : booking.location
      ? `${title} · ${booking.location}`
      : title;
  lines.push(foldLine(`SUMMARY:${icsEscape(summary)}`));

  // Location: prefer venue address, else venue name, else booking.location
  const locationStr =
    venue?.address ?? venue?.name ?? booking.location ?? null;
  if (locationStr) {
    lines.push(foldLine(`LOCATION:${icsEscape(locationStr)}`));
  }

  // Description: notes + pay + status, joined with newlines
  const descBits: string[] = [];
  if (booking.notes) descBits.push(booking.notes);
  if (booking.pay) descBits.push(`Pay: ${booking.pay}`);
  descBits.push(`Status: ${booking.status}`);
  descBits.push(`(via AmIFree)`);
  lines.push(foldLine(`DESCRIPTION:${icsEscape(descBits.join("\n"))}`));

  lines.push(`STATUS:${bookingStatusToIcs(booking.status)}`);

  // Make tentative bookings show as "free" (not blocking) so users
  // can still get pinged for those slots.
  if (
    booking.status === "inquiry" ||
    booking.status === "hold" ||
    booking.status === "requested"
  ) {
    lines.push("TRANSP:TRANSPARENT");
  } else {
    lines.push("TRANSP:OPAQUE");
  }

  lines.push("END:VEVENT");
  return lines;
}

// ---- Public entry point -----------------------------------------------

/**
 * Generate the full VCALENDAR string for a workspace.
 */
export function generateIcsCalendar(
  workspace: Pick<WorkspaceRow, "id" | "name">,
  bookings: BookingRow[],
  venues: VenueRow[],
  productHost: string = "amifree.app",
): string {
  const venuesById = new Map(venues.map((v) => [v.id, v] as const));

  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push(`PRODID:-//AmIFree//Bookings//EN`);
  lines.push("CALSCALE:GREGORIAN");
  lines.push("METHOD:PUBLISH");
  lines.push(foldLine(`X-WR-CALNAME:${icsEscape(`${workspace.name} · AmIFree`)}`));
  lines.push("X-WR-CALDESC:AmIFree booking schedule");
  // 1-hour refresh hint for clients that honor it.
  lines.push("REFRESH-INTERVAL;VALUE=DURATION:PT1H");
  lines.push("X-PUBLISHED-TTL:PT1H");

  for (const b of bookings) {
    const eventLines = buildVEvent(b, venuesById, productHost);
    lines.push(...eventLines);
  }

  lines.push("END:VCALENDAR");

  // RFC 5545 mandates CRLF line endings.
  return lines.join("\r\n") + "\r\n";
}
