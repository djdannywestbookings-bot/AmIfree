/**
 * AmIFree brand tokens — Phase 33+.
 *
 * Source of truth for the visual identity. Anything that paints the
 * brand (logo, primary buttons, brand-colored accents, status pills)
 * pulls from here so swapping the palette later is a single-file edit.
 *
 * Pulled from the logo:
 *   - violet/indigo gradient on the symbol + "AmI" wordmark
 *   - teal dot + "Free" wordmark
 *   - navy dark-mode background
 *
 * Tailwind hex equivalents are noted so JIT class strings match.
 */

export const brand = {
  // Primary — used for headings, links, primary buttons, brand accents
  primary: {
    DEFAULT: "#6366f1",       // indigo-500
    light: "#8b5cf6",         // violet-500
    dark: "#4338ca",          // indigo-700
    gradientFrom: "#7c3aed",  // violet-600
    gradientTo: "#3b82f6",    // blue-500
  },
  // Accent — used for "Free", success states, highlights
  accent: {
    DEFAULT: "#14b8a6",       // teal-500
    light: "#5eead4",         // teal-300
    dark: "#0f766e",          // teal-700
  },
  // Surfaces
  surface: {
    light: "#ffffff",
    subtle: "#f8fafc",        // slate-50
    muted: "#f1f5f9",         // slate-100
    border: "#e2e8f0",        // slate-200
    dark: "#0f172a",          // slate-900 (matches dark-mode logo bg)
    darkSubtle: "#1e293b",    // slate-800
  },
  // Status (used for booking status pills + venue color fallbacks)
  status: {
    inquiry: "#94a3b8",       // slate-400
    hold: "#f59e0b",          // amber-500
    requested: "#3b82f6",     // blue-500
    assigned: "#8b5cf6",      // violet-500
    booked: "#14b8a6",        // teal-500 (brand accent — confirmed bookings)
    completed: "#64748b",     // slate-500
    cancelled: "#ef4444",     // red-500
  },
} as const;

/**
 * Tailwind class fragments — keep brand classes consistent across
 * components. These compile correctly because the literal strings are
 * present in the codebase (Tailwind JIT scans for class names).
 */
export const brandClass = {
  // Primary button
  buttonPrimary:
    "rounded bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-sm transition-colors",
  buttonPrimaryLg:
    "rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm transition-colors",
  // Accent button (rare — for confirm/save secondary)
  buttonAccent:
    "rounded bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 text-sm transition-colors",
  // Header count text (matches Sling-style "X Locations" in primary)
  headingCount: "text-lg font-semibold text-indigo-600",
  // Link
  link: "text-indigo-600 hover:text-indigo-700",
  // Wordmark gradient — for the brand title in the nav
  wordmarkAmI: "text-indigo-700 font-bold",
  wordmarkFree: "text-teal-500 font-bold",
} as const;
