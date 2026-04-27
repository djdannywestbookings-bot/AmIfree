/**
 * AmIFree brand tokens — refreshed in Pass 1 (visual polish).
 *
 * Source of truth for the visual identity. Two layers:
 *
 *  1. `brand` — raw color values, useful for inline styles and SVG fills
 *     where Tailwind classes don't apply.
 *
 *  2. `brandClass` — opinionated class strings. The new system uses the
 *     `.btn`, `.input`, `.pill-*` component classes defined in
 *     globals.css; the legacy keys here remain for backward compat
 *     while older components migrate over.
 *
 * Logo palette:
 *   - violet/indigo gradient on the symbol + "AmI" wordmark
 *   - teal dot + "Free" wordmark
 *   - slate-900 dark surface
 */

export const brand = {
  // Primary — used for headings, links, primary buttons, brand accents.
  primary: {
    DEFAULT: "#4f46e5",       // indigo-600 (matches viewport theme color)
    light: "#8b5cf6",         // violet-500
    dark: "#4338ca",          // indigo-700
    gradientFrom: "#7c3aed",  // violet-600
    gradientTo: "#3b82f6",    // blue-500
  },
  // Accent — used for "Free", success states, confirmed bookings.
  accent: {
    DEFAULT: "#14b8a6",       // teal-500
    light: "#5eead4",         // teal-300
    dark: "#0f766e",          // teal-700
  },
  // Surfaces.
  surface: {
    page: "#f8fafc",          // slate-50 — app background
    card: "#ffffff",
    subtle: "#f1f5f9",        // slate-100
    border: "#e2e8f0",        // slate-200
    borderStrong: "#cbd5e1",  // slate-300
    dark: "#0f172a",          // slate-900
    darkSubtle: "#1e293b",    // slate-800
    text: "#0f172a",
    muted: "#64748b",         // slate-500
  },
  // Booking status palette — drives both pill tones and venue color
  // fallbacks. The "loud" variant is for calendar cells.
  status: {
    inquiry:   "#94a3b8",     // slate-400
    hold:      "#f59e0b",     // amber-500
    requested: "#3b82f6",     // blue-500
    assigned:  "#8b5cf6",     // violet-500
    booked:    "#14b8a6",     // teal-500
    completed: "#64748b",     // slate-500
    cancelled: "#ef4444",     // red-500
  },
} as const;

export type BookingStatusKey = keyof typeof brand.status;

/**
 * Tailwind class fragments. New work should reach for `.btn`, `.input`,
 * `.pill-*`, and `.card` from globals.css; the keys below stay so
 * existing call sites compile unchanged.
 */
export const brandClass = {
  // Legacy button classes — kept for components not yet migrated.
  buttonPrimary:
    "rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-sm font-medium shadow-sm transition-colors",
  buttonPrimaryLg:
    "rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium shadow-sm transition-colors",
  buttonAccent:
    "rounded-md bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 text-sm font-medium shadow-sm transition-colors",

  // Header count text (matches "X Locations" Sling-style display).
  headingCount: "text-lg font-semibold text-indigo-600 tabular-nums",

  // Link.
  link: "text-indigo-600 hover:text-indigo-700 underline-offset-2 hover:underline",

  // Wordmark — used in the (app)/layout.tsx nav.
  wordmarkAmI: "text-indigo-700 font-bold",
  wordmarkFree: "text-teal-500 font-bold",

  // Quick aliases onto the new component classes — code that imports
  // brandClass can opt in incrementally.
  btnPrimary: "btn btn-md btn-primary",
  btnPrimaryLg: "btn btn-lg btn-primary",
  btnSecondary: "btn btn-md btn-secondary",
  btnGhost: "btn btn-md btn-ghost",
  btnDanger: "btn btn-md btn-danger",
  btnAccent: "btn btn-md btn-accent",
  input: "input",
  textarea: "textarea",
  card: "card",
  cardHover: "card card-hover",
} as const;

/**
 * Map a booking status to its soft-pill class. Returns the default
 * `pill` base + a status modifier defined in globals.css.
 */
export function pillClassForStatus(status: BookingStatusKey | string): string {
  const map: Record<string, string> = {
    inquiry: "pill pill-inquiry",
    hold: "pill pill-hold",
    requested: "pill pill-requested",
    assigned: "pill pill-assigned",
    booked: "pill pill-booked",
    completed: "pill pill-completed",
    cancelled: "pill pill-cancelled",
  };
  return map[status] ?? "pill pill-inquiry";
}

/**
 * Map a booking status to its loud-pill class — used inside calendar
 * cells where the surface is busy and contrast needs to be loud.
 */
export function loudPillClassForStatus(status: BookingStatusKey | string): string {
  const map: Record<string, string> = {
    inquiry: "pill pill-loud-inquiry",
    hold: "pill pill-loud-hold",
    requested: "pill pill-loud-requested",
    assigned: "pill pill-loud-assigned",
    booked: "pill pill-loud-booked",
    completed: "pill pill-loud-completed",
    cancelled: "pill pill-loud-cancelled",
  };
  return map[status] ?? "pill pill-loud-inquiry";
}
