# AmIFree Scheduler

A mobile-first prototype of a DJ scheduling app, built as a Vite + React SPA
running on in-memory mock data. No backend, no auth, no persistence —
refreshing the page resets everything.

This repo is a storyboard of five screens wired together with local React
state, intended as a fast iteration surface for booking/conflict UX before
we commit to any backend or framework decisions.

## Running locally

    npm install
    npm run dev        # local dev server (Vite, http://localhost:5173)
    npm run build      # type-check (tsc -b) + production build
    npm test           # vitest in watch mode
    npm run test:run   # single vitest run
    npm run lint       # eslint

## Screens

- **Dashboard** — stat tiles (Total / Upcoming / Conflicts) and a sorted list
  of all bookings with expand-to-see-details cards.
- **Calendar** — the current week (Mon–Sun), bookings grouped by nightlife
  start day.
- **Ingest** — UI for pasting a message to extract a booking from it. The
  textarea is currently ignored and the "Extract" button shows two hardcoded
  mock results; this screen is visual-only.
- **Availability** — owner-view / shared-view toggle demonstrating the
  privacy surface a DJ would share with a promoter.
- **Schedule** — pick a venue, see its recurring shifts, assign an available
  DJ. Assignment state is per-page and does not persist.

## Domain model

All types live in `src/types/index.ts`. Core entities:

- **DJ** — `id`, `name`, `available`, `city`, `state`.
- **Venue** — `id`, `name`, `city`, `state`, owning `operatorId`.
- **Operator** — a venue owner / promoter with a list of `venueIds`.
- **Booking** — the primary object: `djId`, `venueId`, `title`,
  `nightlifeDate`, `startTime`, `endTime`, flags (`crossMidnight`,
  `afterHours`), `status`, `conflict`, `fee`, `notes`, ingestion `source`,
  and pre-written `followUpMessages`.
- **RecurringShift** — a venue's weekly slot (`dayOfWeek`, `startTime`,
  `endTime`, `crossMidnight`, `afterHours`, `assignedDJId`).
- **ExtractionResult** — output shape for a parsed booking message.

### Nightlife-day concept

Booking times use a "nightlife day" convention rather than a raw calendar
day. A Friday 22:00–02:00 set stays anchored to Friday
(`crossMidnight: true`); a 02:00–05:00 after-hours set that runs into
Saturday morning belongs to Saturday's extended night (`afterHours: true`).
Time helpers in `src/utils/time.ts` respect this — `formatTimeRange`
appends `+1` for cross-midnight and `(after-hours)` for early-morning
service-day sets. The convention is currently a data-entry contract on the
mocks; there is no function yet that derives it from a raw input.

## What works vs. what's stubbed

Working end-to-end (within a session):

- Dashboard, Calendar, and Availability render correctly from mock data.
- The Schedule page's DJ assignment dropdown updates local state and
  reflects in the UI; only available DJs appear as options.
- Copy-to-clipboard on follow-up messages in the booking card.

Stubbed or non-functional:

- **Ingest** — the textarea is ignored; "Extract with AI" always renders
  the same two hardcoded results; "Add" flips a local flag but does not
  create a Booking anywhere visible.
- **Availability** — the "Copy share link" affordance has no click handler.
- **Conflict detection** — the `conflict` field on each booking is
  hand-authored in `src/data/mock.ts`. No function computes conflicts;
  badges show what the mock says.
- **Cross-page state** — Schedule's assignment edits, Ingest's applied
  items, and Availability's view-mode toggle all live in per-page local
  state. Nothing propagates between screens.
- **Persistence** — there is none; page refresh resets everything.

Known structural issue to fix when we introduce real state:

- **Module-scope data derivations.** Several pages (`DashboardPage`,
  `CalendarPage`, `AvailabilityPage`, `SchedulePage`) compute filtered or
  derived collections at the top of the file rather than inside the
  component. The most visible consequence today is that the Calendar's
  "current week" is computed exactly once per page load, so leaving the app
  open across midnight will show the wrong week. Once booking/shift data
  becomes actually mutable (step 1 of the roadmap below), these hoisted
  snapshots will go stale and need to move inside the components — likely
  as memoized selectors off the store.

## Project layout

    src/
      App.tsx              # page switcher (useState<Page>)
      main.tsx             # React root
      index.css            # Tailwind layers + shadcn-style CSS variables
      components/
        layout/AppShell.tsx
        booking/{BookingCard,StatusBadge,ConflictBadge}.tsx
        followup/FollowUpPanel.tsx
        ingestion/ExtractionCard.tsx
      pages/
        DashboardPage.tsx
        CalendarPage.tsx
        IngestPage.tsx
        AvailabilityPage.tsx
        SchedulePage.tsx
      data/mock.ts         # in-memory DJs, venues, bookings, shifts, extractions
      types/index.ts       # domain types
      utils/
        time.ts            # parse, format, week-bounds helpers
        time.test.ts       # time-utility tests (vitest)
        mock-fixtures.test.ts  # tripwire tests on the mock dataset
      lib/utils.ts         # cn() helper (clsx + tailwind-merge)

## Roadmap

Near-term, in order:

1. **Shared state store.** Introduce a lightweight store (React Context +
   reducer, or Zustand) so edits on one page propagate to others.
   Concretely, wire the Ingest "Add" button to actually create a Booking
   visible on Dashboard and Calendar.
2. **Conflict detection.** Replace the hand-authored `conflict` field with
   a real `detectConflicts(bookings)` function that respects the
   nightlife-day rules (same DJ, overlapping effective windows,
   cross-midnight and after-hours semantics). Ship a proper test file
   alongside it.

Deferred until the mechanics feel right in the SPA: routing, a component
primitive library (shadcn/ui or similar), any backend (Supabase, API,
worker), and screenshot ingest / real LLM extraction.

**This is a prototype, not a product. Treat the code as disposable until
the mechanics feel right.**
