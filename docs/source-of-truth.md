# AmIFree Scheduler — Source of Truth

_Last updated: 2026-04-24 (Phase 23 positioning rewrite)_

## Project identity

- **Project name:** AmIFree
- **Product name:** AmIFree Scheduler
- **Domain:** amifreescheduler.com
- **Product type:** mobile-first SaaS scheduling and booking platform / PWA
- **Primary audience:** any service provider who takes bookings from clients. Entertainment (DJs, performers, event talent, venues, promoters), appointment-based services (photographers, videographers, fitness trainers, beauty/wellness, tutors, coaches), and anyone else coordinating recurring or one-off commitments against a calendar. Entertainment remains a first-class use case — nightlife-day service-day handling is preserved as a workspace setting — but is no longer the exclusive target.

> **Historical note.** Phase docs 1 through 22 were authored under a "DJ-first" framing. Those documents remain in `docs/` as frozen records of past decisions; the locked truths in this file supersede any "DJ-first" or "DJ / Manager Lite only" statements in earlier phase docs. See `docs/phases/23-positioning-rewrite.md` and `docs/coordinator/SESSION_2026-04-24.md` for the audit that produced this change.

## Approved completed phases

- [1] Phase — Product Blueprint
- [2] Phase — UX/UI System Revision
- [3] Phase — MVP Wireframes
- [4] Phase — MVP Functional Spec
- [5] Phase — MVP Technical Architecture
- [6] Phase — Database Schema & API Contracts
- [7] Phase — MVP Build Plan
- [8] Phase — QA / Test Strategy
- [9] Phase — Analytics & Operational Metrics
- [10] Phase — Launch Readiness
- [11] Phase — Post-Launch Stabilization Plan
- [12] Phase — V1 / Post-MVP Prioritization
- [13] Phase — Growth Loops & User Adoption
- [22] Phase — Canonical Beta Foundation _(code shipped 2026-04-24; tag `phase-22-complete`)_
- [23] Phase — Positioning Rewrite _(this document; doc-only)_
- [26] Phase — Multi-User and Tenant Boundary Foundation _(planning only)_

Phases 14 through 21, 24, 25, and 27 through 29 have phase documents in
`docs/phases/` and `docs/` but their product-level truths either fold
into the above or are not yet reflected as locked truths here. Code has
not shipped for them.

## Current active phase

- [24] Phase — First Feature (TBD; scope pending owner direction after Phase 23 rewrite lands)

## Locked core product truths

- MVP launch shape is a mobile-first web app / PWA.
- Booking is the only calendar-truth object.
- Manual Availability Blocks are explicit, separate schedule objects.
- Booking Request, Shift Occurrence, and Booking remain separate objects.
- Shift Templates and one-off Shift Occurrences are separate flows and separate objects.
- AI extraction is review-before-save.
- Intake Drafts stage Booking creation only in MVP.
- Intake is scoped to workspace members with role `owner` or `manager_lite` in MVP. Public / client-facing intake is out of MVP scope.
- Shared viewer modes are only:
  - Busy
  - Busy + Region
- Operator Schedule is:
  - Agenda = Bookings only
  - Coverage = Shift Occurrences only
- Internal staffing eligibility must use private source-of-truth schedule logic.
- "Not shared" is not the same as "not eligible" internally.
- Operators cannot force-assign hard-conflicted talent.
- Hard-conflicted items cannot advance to Assigned or Booked.
- `owner` / `manager_lite` limited hard-conflict save exists only for:
  - Inquiry
  - Hold
  - Requested
- Limited hard-conflict save requires:
  - explicit reason entry
  - confirmation
  - audit note

## Locked schedule, lifecycle, and staffing truths

- Default schedule view is a date-strip + mobile agenda timeline.
- Default visible time window is workspace-configurable (see `service_day_mode` below); entertainment workspaces default to approximately 12:00 PM through 6:00 AM next day, standard-day workspaces default to a standard calendar day.
- Cross-midnight bookings visually belong to the starting service day as defined by the workspace's `service_day_mode`.
- Service day is separate from calendar timestamp. Cutoff time is determined by `service_day_mode`; default for entertainment is 6:00 AM local venue time, default for standard-day workspaces is midnight.
- Lifecycle states and alert states are separate systems.

### Booking lifecycle states

- Inquiry
- Hold
- Requested
- Assigned
- Booked
- Completed
- Cancelled

### Alert states

- Hard Conflict
- Possible Conflict
- Missing Info
- Time TBD

## Locked request-linkage behavior

- Draft request may exist without a linked Booking.
- Sent request must create or link a Requested Booking.
- Viewed / Accepted / Declined / Withdrawn / Expired / Converted preserve the same linked request + linked-booking path.
- Accepting a request does not create a second Booking.
- Conversion / assignment updates the existing linked Booking path.

## Locked recurring-template and occurrence truths

### Shift Templates include

- service_day_weekday
- active_start_date
- active_end_date
- local_start_time
- local_end_time
- timezone
- slots_needed
- preview of generated occurrences before save
- pause / resume behavior

### Shift Template rules

- Pausing a template stops future occurrence generation only.
- Already materialized occurrences remain unchanged.
- Resuming generates missing future occurrences inside the remaining active date range without duplication.
- Shift Template lifecycle is only:
  - active
  - paused
  - archived

## Locked occurrence capacity truths

Shift Occurrences use the approved multi-slot MVP model with:

- slots_needed
- filled_slots_count
- active_request_count
- open_slots_count
- partial-fill behavior
- one staffed assignee = one linked Booking
- requests are per occurrence for one slot of capacity

Approved formula:

```text
open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)
```

## Locked technical, data, and platform truths

- Recommended stack is a TypeScript modular monolith.
- Next.js App Router PWA.
- Supabase Postgres / Auth / Storage.
- Graphile Worker for async jobs.
- OpenAI Responses API for structured extraction.
- `schedule_commitments` is the normalized overlap surface.
- **`service_day_mode` is a workspace-level setting.** Values:
  - `"standard"` — service day equals the calendar day; cutoff at local midnight.
  - `"nightlife"` — service day extends past midnight; default cutoff at 6:00 AM local.
  New workspaces default to `"standard"`. Workspaces created for entertainment use cases (self-identified during onboarding) default to `"nightlife"`. The setting drives service-day anchoring, calendar rendering, default visible window, and cross-midnight grouping. It does not affect stored UTC timestamps.
- Public share endpoints expose only busy or busy+region intervals.
- Hard assignment-blocking comes only from:
  - Assigned bookings
  - Booked bookings
  - Active Manual Availability Blocks
- Soft-state bookings:
  - Inquiry
  - Hold
  - Requested
  participate in possible-conflict / review logic, do not hard-block assignment, and do not appear in public shared busy output.
- Manual Availability Blocks cannot be saved over Assigned or Booked bookings.
- Notifications are in-app first for MVP.
- Workflow email delivery is not a required MVP launch dependency.

## Locked multi-user and tenant-boundary truths

- Workspace is the tenant boundary for operational data ownership and authorization.
- All core operational records must be workspace-owned.
- No raw cross-workspace reads are allowed.
- Public sharing remains workspace-scoped and projection-only.
- Public shared busy includes only:
  - Assigned bookings
  - Booked bookings
  - Active Manual Availability Blocks
- Inquiry, Hold, and Requested do not appear in public shared busy.
- Multi-user expansion must preserve strict separation between Booking, Manual Availability Block, Booking Request, Shift Template, and Shift Occurrence.
- Multi-user expansion must preserve private source-of-truth schedule logic for internal staffing eligibility.

## Locked role truths

- Application-level roles for Phase 22+:
  - `owner` — active; assigned to every email on `APP_ALLOWED_EMAILS`. Full workspace authority.
  - `manager_lite` — reserved scaffolding; no user is assigned this role in Phase 22. Hooks exist so Manager Lite flows land additively.
- Role names are deliberately use-case-neutral. The role `owner` applies regardless of whether the workspace is run by a DJ booking their own gigs, a venue manager booking talent, a photography studio owner, or any other service provider.

## Locked operating truths from launch, stabilization, and growth

- Correctness, privacy, request-linkage integrity, occurrence-capacity integrity, role safety, and mobile usability outrank breadth.
- Stabilization should constrain changes and prioritize hotfixes, observability, and integrity checks.
- Growth should be workflow-rooted and privacy-safe. Channels and messaging may emphasize any specific service-provider vertical per growth experiment without relaxing the workspace-level data boundaries.
- Product-led loops should strengthen schedule truth, coverage fill, request resolution, and safe sharing.
- Support and operations should not weaken locked product truths for convenience.

## Current execution status

- Phase 22 Canonical Beta Foundation: code shipped 2026-04-24. `amifree-prod` live on Vercel + Railway + Supabase. Tag `phase-22-complete`.
- Phase 23 Positioning Rewrite: landing in this commit.
- Phase 24 First Feature: scope pending owner direction.

## Repository note

Planning documents for phases 1 through 22 were authored in ChatGPT and
committed to `docs/` when this repository was bootstrapped. Application
source code landed during the Phase 22 Wave execution cycle. From Phase
23 onward, planning and implementation live in the same repository and
are audited against each other each session.
