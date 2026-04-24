import "server-only";

import { serverEnv } from "@/lib/config/env.server";
import { getOpenAIClient } from "@/lib/openai/client";
import type { WorkspaceRow } from "@/modules/auth";

/**
 * Booking extraction service.
 *
 * Takes raw text pasted by the owner (text message, email, invoice line
 * items, etc.) and produces partial booking fields ready to review.
 *
 * Two execution modes:
 *   1. OpenAI — when OPENAI_API_KEY is set, calls the Chat Completions
 *      API with a structured-output schema. Higher quality, costs ~$0.0003
 *      per extraction on gpt-4o-mini.
 *   2. Heuristic — no API key required. Regex-based best-effort. Lower
 *      quality, good enough to test the UX while the owner is waiting
 *      to fund their OpenAI account.
 *
 * Both paths return the same shape.
 */

export type ExtractionResult = {
  source: "openai" | "heuristic";
  title: string | null;
  status: "inquiry" | "hold" | "requested" | "assigned" | "booked" | "completed" | "cancelled" | null;
  // When the extractor finds a specific date+time, these hold the ISO.
  // When it only finds partial info, they stay null and the user fills
  // in the review form.
  start_at: string | null;
  end_at: string | null;
  all_day: boolean;
  location: string | null;
  pay: string | null;
  notes: string | null;
  confidence: number; // 0..1
  warnings: string[];
};

const EMPTY: ExtractionResult = {
  source: "heuristic",
  title: null,
  status: null,
  start_at: null,
  end_at: null,
  all_day: false,
  location: null,
  pay: null,
  notes: null,
  confidence: 0,
  warnings: [],
};

// ---------------------------------------------------------------------
// Public entry point — picks the best available mode
// ---------------------------------------------------------------------

export async function extractBookingFromText(
  text: string,
  workspace: Pick<WorkspaceRow, "service_day_mode" | "nightlife_cutoff_hour">,
): Promise<ExtractionResult> {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { ...EMPTY, warnings: ["Input was empty."] };
  }

  if (serverEnv.OPENAI_API_KEY) {
    try {
      return await extractViaOpenAI(trimmed, workspace);
    } catch (err) {
      // Fall back to heuristic on any OpenAI failure so the user still
      // gets a useful extraction instead of an error screen.
      const heuristic = extractViaHeuristic(trimmed, workspace);
      const msg = err instanceof Error ? err.message : "Unknown error";
      return {
        ...heuristic,
        warnings: [
          `OpenAI extraction failed (${msg}). Showing heuristic result.`,
          ...heuristic.warnings,
        ],
      };
    }
  }

  return extractViaHeuristic(trimmed, workspace);
}

// ---------------------------------------------------------------------
// Heuristic mode — regex-based, runs without API key
// ---------------------------------------------------------------------

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function findDate(text: string, refNow = new Date()): Date | null {
  const lower = text.toLowerCase();

  // "April 26" or "Apr 26" (optionally with year)
  const monthDay = lower.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:(?:st|nd|rd|th))?(?:[,\s]+(\d{2,4}))?/,
  );
  if (monthDay) {
    const m = MONTHS[monthDay[1]];
    const d = Number(monthDay[2]);
    let y = monthDay[3] ? Number(monthDay[3]) : refNow.getFullYear();
    if (y < 100) y += 2000;
    // If the computed date is in the past by more than a week, bump a year.
    const candidate = new Date(y, m, d);
    if (candidate.getTime() < refNow.getTime() - 7 * 86400_000) {
      candidate.setFullYear(y + 1);
    }
    return candidate;
  }

  // "4/26" or "4/26/26" or "04/26/2026"
  const slash = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (slash) {
    const m = Number(slash[1]) - 1;
    const d = Number(slash[2]);
    let y = slash[3] ? Number(slash[3]) : refNow.getFullYear();
    if (y < 100) y += 2000;
    const candidate = new Date(y, m, d);
    if (candidate.getTime() < refNow.getTime() - 7 * 86400_000) {
      candidate.setFullYear(y + 1);
    }
    return candidate;
  }

  // "this Saturday" / "next Friday" — basic handling
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < 7; i++) {
    const pattern = new RegExp(`\\b(this|next|on)?\\s*${days[i]}\\b`);
    if (pattern.test(lower)) {
      const base = new Date(refNow);
      const offset = (i - base.getDay() + 7) % 7 || 7;
      base.setDate(base.getDate() + offset);
      return base;
    }
  }

  return null;
}

function findTime(text: string): { hours: number; minutes: number } | null {
  const lower = text.toLowerCase();

  // "10pm", "10 PM", "10:30pm", "10:30 PM"
  const ampm = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (ampm) {
    let h = Number(ampm[1]);
    const m = ampm[2] ? Number(ampm[2]) : 0;
    const period = ampm[3];
    if (h < 1 || h > 12) return null;
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return { hours: h, minutes: m };
  }

  // "22:00" / "14:30" — 24-hour only (avoids false-matching 12:30 which
  // could be am or pm)
  const military = lower.match(/\b(1[3-9]|2[0-3]):(\d{2})\b/);
  if (military) {
    return { hours: Number(military[1]), minutes: Number(military[2]) };
  }

  return null;
}

function findPay(text: string): string | null {
  // "$300", "$300.00", "$1,200"
  const dollar = text.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/);
  if (dollar) return `$${dollar[1].replace(/,/g, "")}`;

  // "pay is 300" / "300 for the night"
  const contextual = text.match(/\b(?:pay|rate|fee)(?:\s+is)?\s*[:=]?\s*\$?(\d{2,4})/i);
  if (contextual) return `$${contextual[1]}`;

  return null;
}

function findLocation(text: string): string | null {
  // "at Bottle Blonde", "at The Grand Ballroom Dallas"
  // Stops at end of line, punctuation, or common trailing words.
  const atMatch = text.match(
    /\bat\s+((?:[A-Z][A-Za-z0-9&']*\s*){1,6})(?=[\n.,;!?]|$|\s+(?:for|on|from|starting|to)\b)/,
  );
  if (atMatch) return atMatch[1].trim();

  // "@ Venue Name"
  const symMatch = text.match(/@\s*((?:\S+\s*){1,4})(?=[\n.,;!?]|$)/);
  if (symMatch) return symMatch[1].trim();

  return null;
}

function findDuration(text: string): number | null {
  // "4 hour gig" / "for 4 hours" / "4hr gig"
  const hoursMatch = text.match(
    /\b(\d+(?:\.\d+)?)\s*(?:hr|hrs|hour|hours)\b/i,
  );
  if (hoursMatch) {
    const mins = Math.round(Number(hoursMatch[1]) * 60);
    return mins > 0 ? mins : null;
  }

  return null;
}

export function extractViaHeuristic(
  text: string,
  _workspace: Pick<WorkspaceRow, "service_day_mode" | "nightlife_cutoff_hour">,
): ExtractionResult {
  const warnings: string[] = [];
  const date = findDate(text);
  const time = findTime(text);
  const pay = findPay(text);
  const location = findLocation(text);
  const duration = findDuration(text);

  let startIso: string | null = null;
  let endIso: string | null = null;
  if (date && time) {
    const start = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.hours,
      time.minutes,
      0,
      0,
    );
    startIso = start.toISOString();
    if (duration) {
      endIso = new Date(start.getTime() + duration * 60_000).toISOString();
    }
  } else if (date && !time) {
    warnings.push("Date found but no time — setting as Time TBD.");
  } else if (!date && time) {
    warnings.push("Time found but no date.");
  }

  // Title: use location if we found one; otherwise first line of the
  // message truncated to a reasonable length.
  let title: string | null = null;
  if (location) {
    title = location;
  } else {
    const firstLine = text.split(/\n/)[0]?.trim() ?? "";
    if (firstLine.length > 0) {
      title = firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
    }
  }

  // Confidence heuristic: found_fields / total_fields.
  const found = [title, startIso, location, pay].filter(Boolean).length;
  const confidence = found / 4;

  if (!title && !startIso && !location && !pay) {
    warnings.push("No structured fields recognized. Edit the form manually.");
  }

  return {
    source: "heuristic",
    title,
    status: null,
    start_at: startIso,
    end_at: endIso,
    all_day: false,
    location,
    pay,
    notes: text,
    confidence,
    warnings,
  };
}

// ---------------------------------------------------------------------
// OpenAI mode — activates when OPENAI_API_KEY is set
// ---------------------------------------------------------------------

const EXTRACTION_SYSTEM_PROMPT = `You extract booking information from messy text (text messages, emails, invoice snippets) for a scheduling app called AmIFree.

Return JSON that matches the provided schema exactly. For each field:
- title: short, descriptive. If a venue is mentioned, use the venue. If nothing specific, summarize in a few words.
- status: one of inquiry, hold, requested, assigned, booked, completed, cancelled. Default to "inquiry" if unclear; use "booked" only if the message confirms the booking explicitly.
- start_at: ISO 8601 datetime with offset, OR null if date+time aren't both present.
- end_at: ISO 8601 datetime with offset, OR null. Only set this if the message explicitly states an end time or duration.
- all_day: true only if the message clearly says "all day" or similar.
- location: venue name or address, as written. null if not mentioned.
- pay: pay as written (e.g., "$300", "300 + tips", "TBD"). null if not mentioned.
- notes: the original message text, preserving any context that doesn't fit the structured fields.
- confidence: 0 to 1, how confident you are the extraction is correct.
- warnings: array of strings flagging anything ambiguous or missing.

Be conservative. When in doubt, leave a field null and add a warning. Never fabricate information.`;

const EXTRACTION_JSON_SCHEMA = {
  name: "booking_extraction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: ["string", "null"] },
      status: {
        type: ["string", "null"],
        enum: [
          "inquiry",
          "hold",
          "requested",
          "assigned",
          "booked",
          "completed",
          "cancelled",
          null,
        ],
      },
      start_at: { type: ["string", "null"] },
      end_at: { type: ["string", "null"] },
      all_day: { type: "boolean" },
      location: { type: ["string", "null"] },
      pay: { type: ["string", "null"] },
      notes: { type: ["string", "null"] },
      confidence: { type: "number" },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: [
      "title",
      "status",
      "start_at",
      "end_at",
      "all_day",
      "location",
      "pay",
      "notes",
      "confidence",
      "warnings",
    ],
  },
} as const;

async function extractViaOpenAI(
  text: string,
  workspace: Pick<WorkspaceRow, "service_day_mode" | "nightlife_cutoff_hour">,
): Promise<ExtractionResult> {
  const client = getOpenAIClient();

  const today = new Date().toISOString().slice(0, 10);
  const context = [
    `Today is ${today}.`,
    `Workspace mode: ${workspace.service_day_mode}${
      workspace.service_day_mode === "nightlife"
        ? ` (day rolls over at ${workspace.nightlife_cutoff_hour}:00am local)`
        : ""
    }.`,
  ].join(" ");

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      { role: "system", content: context },
      { role: "user", content: text },
    ],
    response_format: {
      type: "json_schema",
      json_schema: EXTRACTION_JSON_SCHEMA,
    },
    temperature: 0,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned an empty response");
  }

  const parsed = JSON.parse(raw) as Omit<ExtractionResult, "source">;
  return { ...parsed, source: "openai" };
}
