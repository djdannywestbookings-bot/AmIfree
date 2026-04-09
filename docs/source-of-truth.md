# AmIFree Scheduler — Source of Truth

_Last updated: 2026-04-09_

## Project identity

- **Project name:** AmIFree
- **Product name:** AmIFree Scheduler
- **Domain:** amifreescheduler.com
- **Product type:** mobile-first SaaS scheduling and booking platform / PWA
- **Primary audience:** DJs first, with operator and manager-lite workflows where explicitly approved

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

## Current active block

- [11] Phase — Post-Launch Stabilization Plan
- [12] Phase — V1 / Post-MVP Prioritization
- [13] Phase — Growth Loops & User Adoption
- [14] Phase — Support & Operations Playbook
- [15] Phase — Expansion Architecture for Multi-User SaaS

## Locked core product truths

- Product is DJ-first.
- MVP launch shape is a mobile-first web app / PWA.
- Booking is the only calendar-truth object.
- Manual Availability Blocks are explicit, separate schedule objects.
- Booking Request, Shift Occurrence, and Booking remain separate objects.
- Shift Templates and one-off Shift Occurrences are separate flows and separate objects.
- AI extraction is review-before-save.
- Intake Drafts stage Booking creation only in MVP.
- Intake is DJ / Manager Lite only in MVP.
- Shared viewer modes are only:
  - Busy
  - Busy + Region
- Operator Schedule is:
  - Agenda = Bookings only
  - Coverage = Shift Occurrences only
- Internal staffing eligibility must use private source-of-truth schedule logic.
- “Not shared” is not the same as “not eligible” internally.
- Operators cannot force-assign hard-conflicted DJs.
- Hard-conflicted items cannot advance to Assigned or Booked.
- DJ owner / Manager Lite limited hard-conflict save exists only for:
  - Inquiry
  - Hold
  - Requested
- Limited hard-conflict save requires:
  - explicit reason entry
  - confirmation
  - audit note

## Locked schedule, lifecycle, and staffing truths

- Default schedule view is a date-strip + mobile agenda timeline.
- Default visible time window is approximately 12:00 PM through 6:00 AM next day.
- Cross-midnight gigs visually belong to the starting nightlife day.
- Service day is separate from calendar timestamp and defaults to 6:00 AM local venue time.
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
- one staffed DJ = one linked Booking
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

## Locked operating truths from launch, stabilization, and growth

- Correctness, privacy, request-linkage integrity, occurrence-capacity integrity, role safety, and mobile usability outrank breadth.
- Stabilization should constrain changes and prioritize hotfixes, observability, and integrity checks.
- Growth should be workflow-rooted, DJ-first, and privacy-safe.
- Product-led loops should strengthen schedule truth, coverage fill, request resolution, and safe sharing.
- Support and operations should not weaken locked product truths for convenience.

## Current execution status

- First 13 phases are complete and locked.
- Phase 14 is currently being documented.
- Phase 15 is the next phase in the current 5-phase block.

## Repository note

At the time this file was added, this repository was being bootstrapped from project planning artifacts available in ChatGPT. Application source code had not yet been added to the connected workspace for sync.
