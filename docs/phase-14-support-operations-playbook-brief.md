# [14] Phase - Support and Operations Playbook

## Goal

Produce a builder-grade Support and Operations Playbook for AmIFree Scheduler that defines how a small team should support users, run daily operations, handle incidents, manage data and trust issues, and keep the product stable in live use.

## Phase context

- First 13 phases are complete and locked.
- This is the fourth phase of the current 5-phase block.
- Current block:
  - [11] Phase - Post-Launch Stabilization Plan
  - [12] Phase - V1 / Post-MVP Prioritization
  - [13] Phase - Growth Loops & User Adoption
  - [14] Phase - Support & Operations Playbook
  - [15] Phase - Expansion Architecture for Multi-User SaaS

## Core product truths this phase must preserve

- Product is DJ-first.
- MVP launch shape is a mobile-first web app / PWA.
- Booking is the only calendar-truth object.
- Manual Availability Blocks are explicit and separate from bookings.
- Booking Request, Shift Occurrence, and Booking remain separate objects.
- Shift Templates and one-off Shift Occurrences are separate flows and objects.
- AI extraction is review-before-save.
- Intake Drafts stage Booking creation only in MVP.
- Intake is DJ / Manager Lite only in MVP.
- Shared viewer modes are Busy and Busy + Region only.
- Operator Schedule is Agenda = Bookings only and Coverage = Shift Occurrences only.
- Internal staffing eligibility uses private source-of-truth schedule logic.
- External sharing visibility and internal staffing eligibility are separate.
- Operators cannot force-assign hard-conflicted DJs.
- Hard-conflicted items cannot advance to Assigned or Booked.

## Lifecycle and staffing truths this phase must preserve

- Default schedule view is a date-strip plus mobile agenda timeline.
- Default visible time window is about 12:00 PM through 6:00 AM next day.
- Cross-midnight gigs visually belong to the starting nightlife day.
- Service day is separate from calendar timestamp and defaults to 6:00 AM local venue time.
- Lifecycle states and alert states are separate systems.
- Booking lifecycle states: Inquiry, Hold, Requested, Assigned, Booked, Completed, Cancelled.
- Alert states: Hard Conflict, Possible Conflict, Missing Info, Time TBD.

## Request-linkage truths this phase must preserve

- Draft request may exist without a linked Booking.
- Sent request must create or link a Requested Booking.
- Viewed, Accepted, Declined, Withdrawn, Expired, and Converted preserve the same linked request plus linked-booking path.
- Accepting a request does not create a second Booking.
- Conversion or assignment updates the existing linked Booking path.

## Occurrence and template truths this phase must preserve

- Shift Templates include weekday, active dates, local start and end times, timezone, slots needed, preview before save, and pause or resume behavior.
- Pausing stops future occurrence generation only.
- Existing occurrences remain unchanged.
- Resuming generates missing future occurrences inside the remaining active date range without duplication.
- Shift Template lifecycle is active, paused, archived only.
- Shift Occurrences use the approved multi-slot model.
- Approved capacity formula: open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0).
- One staffed DJ equals one linked Booking.
- Requests are per occurrence for one slot of capacity.

## Technical and platform truths this phase must preserve

- Recommended stack is a TypeScript modular monolith.
- Next.js App Router PWA.
- Supabase Postgres, Auth, and Storage.
- Graphile Worker for async jobs.
- OpenAI Responses API for structured extraction.
- schedule_commitments is the normalized overlap surface.
- Public share endpoints expose only busy or busy plus region intervals.
- Hard assignment blocking comes only from Assigned bookings, Booked bookings, and active Manual Availability Blocks.
- Soft-state bookings participate in review logic but do not hard-block assignment and do not appear in public shared busy output.
- Manual Availability Blocks cannot be saved over Assigned or Booked bookings.
- Notifications are in-app first for MVP.
- Workflow email delivery is not a required MVP launch dependency.

## Operating truths this phase must preserve

- Correctness, privacy, request-linkage integrity, occurrence-capacity integrity, role safety, and mobile usability outrank breadth.
- Stabilization should constrain changes and prioritize hotfixes, observability, and integrity checks.
- Growth should be workflow-rooted, DJ-first, and privacy-safe.
- Product-led loops should strengthen schedule truth, coverage fill, request resolution, and safe sharing.
- Support and operations should not weaken locked product truths for convenience.

## What the playbook must define

- Day-to-day support operations.
- Support channels and intake rules.
- Ticket categories, severity, routing, and escalation.
- What support can resolve directly versus what must escalate.
- Daily and weekly operational routines.
- How to handle schedule truth, request-linkage, sharing/privacy, and staffing/integrity issues.
- Communication rules during incidents or confusing states.
- Support tooling and internal views needed.
- Response frameworks and macros.
- A minimum viable operating model for a small team.

## Required deliverable sections

1. Support and Operations Playbook Summary
2. Operating Principles
3. Team Roles and Responsibilities
4. Support Intake Channels and Rules
5. Ticket Categories and Routing
6. Severity Model
7. Escalation Rules
8. What Support Can Resolve Directly
9. What Must Escalate to Engineering, Product, or QA
10. Daily Operations Checklist
11. Weekly Operations Review
12. Incident Handling Playbook
13. Schedule Truth and Data Integrity Playbook
14. Request-Linkage Issue Playbook
15. Occurrence Capacity and Staffing Issue Playbook
16. Sharing and Privacy Issue Playbook
17. User Communication Standards
18. Internal Tools, Views, and Dashboards Needed
19. Suggested Macros and Response Templates
20. Metrics for Support and Operations
21. Playbook Risks and Guardrails
22. Final Support and Operations Playbook

## Quality bar

- Be specific, structured, and implementation-aware.
- Keep the model realistic for a small MVP team.
- Prioritize trust, privacy, and correctness over speed of closure.
- Prefer concrete operating rules over vague guidance.
- Write so product, support, operations, QA, and engineering can use it directly.
