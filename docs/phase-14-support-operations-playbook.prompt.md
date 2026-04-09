[14] Phase — Support & Operations Playbook

You are working on the AmIFree project. Execute only this phase. Output the deliverable only, and stop.

Project source of truth:
- Project name: AmIFree
- Product name: AmIFree Scheduler
- Domain: amifreescheduler.com
- Product type: mobile-first SaaS scheduling and booking platform / PWA

Approved prior phases:
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

Locked core product truths:
- Product is DJ-first
- MVP launch shape is a mobile-first web app / PWA
- Booking is the only calendar-truth object
- Manual Availability Blocks are explicit, separate schedule objects
- Booking Request, Shift Occurrence, and Booking remain separate objects
- Shift Templates and one-off Shift Occurrences are separate flows and separate objects
- AI extraction is review-before-save
- Intake Drafts stage Booking creation only in MVP
- Intake is DJ / Manager Lite only in MVP
- Shared viewer modes are only:
  - Busy
  - Busy + Region
- Operator Schedule is:
  - Agenda = Bookings only
  - Coverage = Shift Occurrences only
- Internal staffing eligibility must use private source-of-truth schedule logic
- “Not shared” is not the same as “not eligible” internally
- Operators cannot force-assign hard-conflicted DJs
- Hard-conflicted items cannot advance to Assigned or Booked
- DJ owner / Manager Lite limited hard-conflict save exists only for:
  - Inquiry
  - Hold
  - Requested
- Limited hard-conflict save requires:
  - explicit reason entry
  - confirmation
  - audit note

Locked schedule, lifecycle, and staffing truths:
- Default schedule view is a date-strip + mobile agenda timeline
- Default visible time window is approximately 12:00 PM through 6:00 AM next day
- Cross-midnight gigs visually belong to the starting nightlife day
- Service day is separate from calendar timestamp and defaults to 6:00 AM local venue time
- Lifecycle states and alert states are separate systems

Locked Booking lifecycle states:
- Inquiry
- Hold
- Requested
- Assigned
- Booked
- Completed
- Cancelled

Locked alert states:
- Hard Conflict
- Possible Conflict
- Missing Info
- Time TBD

Locked request-linkage behavior:
- Draft request may exist without a linked Booking
- Sent request must create or link a Requested Booking
- Viewed / Accepted / Declined / Withdrawn / Expired / Converted preserve the same linked request + linked-booking path
- Accepting a request does not create a second Booking
- Conversion / assignment updates the existing linked Booking path

Locked recurring-template / occurrence truths:
- Shift Templates include:
  - service_day_weekday
  - active_start_date
  - active_end_date
  - local_start_time
  - local_end_time
  - timezone
  - slots_needed
  - preview of generated occurrences before save
  - pause / resume behavior
- Pausing a template stops future occurrence generation only
- Already materialized occurrences remain unchanged
- Resuming generates missing future occurrences inside the remaining active date range without duplication

Locked occurrence capacity truths:
- Shift Occurrences use the approved multi-slot MVP model:
  - slots_needed
  - filled_slots_count
  - active_request_count
  - open_slots_count
  - partial-fill behavior
  - one staffed DJ = one linked Booking
  - requests are per occurrence for one slot of capacity
- Approved formula:
  - open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)

Locked technical/data/platform truths:
- Recommended stack is a TypeScript modular monolith
- Next.js App Router PWA
- Supabase Postgres/Auth/Storage
- Graphile Worker for async jobs
- OpenAI Responses API for structured extraction
- schedule_commitments is the normalized overlap surface
- public share endpoints expose only busy or busy+region intervals
- hard assignment-blocking comes only from:
  - Assigned bookings
  - Booked bookings
  - Active Manual Availability Blocks
- soft-state bookings:
  - Inquiry
  - Hold
  - Requested
  participate in possible-conflict/review logic but do not hard-block assignment and do not appear in public shared busy output
- Manual Availability Blocks cannot be saved over Assigned or Booked bookings
- Shift Template lifecycle is only:
  - active
  - paused
  - archived
- Notifications are in-app first for MVP
- Workflow email delivery is not a required MVP launch dependency

Locked operating truths from launch, stabilization, and growth:
- Correctness, privacy, request-linkage integrity, occurrence-capacity integrity, role safety, and mobile usability outrank breadth
- Stabilization should constrain changes and prioritize hotfixes, observability, and integrity checks
- Growth should be workflow-rooted, DJ-first, and privacy-safe
- Product-led loops should strengthen schedule truth, coverage fill, request resolution, and safe sharing
- Support and operations should not weaken locked product truths for convenience

Current process state:
- First 13 phases are complete and locked
- This is the fourth phase of the current 5-phase block
- Current block:
  - [11] Post-Launch Stabilization Plan
  - [12] V1 / Post-MVP Prioritization
  - [13] Growth Loops & User Adoption
  - [14] Support & Operations Playbook
  - [15] Expansion Architecture for Multi-User SaaS

Your task:
Produce a builder-grade Support & Operations Playbook for AmIFree Scheduler that defines how a small team should support users, run daily operations, handle incidents, manage data and trust issues, and keep the product stable in live use.

Important:
- This is not a generic support article
- This is not just an incident response policy
- This is not architecture again
- This is not a customer success strategy deck
- This is the practical support and operations playbook for the live product

What this phase must do:
- define how support should work day to day
- define support channels and intake rules
- define support issue categories, severity, routing, and escalation
- define what support can resolve directly vs what must escalate to engineering/product
- define operational routines for daily/weekly checks
- define how to handle schedule truth issues, request-linkage issues, sharing/privacy concerns, and staffing/integrity issues
- define communication rules with users during incidents or confusing states
- define what support tooling and internal views are needed
- define support macros / response frameworks where helpful
- define the minimum viable operating model for a small team
- preserve all locked product, functional, technical, schema/API, build, QA, analytics, launch, stabilization, and growth truths
- stay realistic for a small team

Playbook rules:
- Make reasonable assumptions where needed and label them clearly
- Prioritize trust, privacy, and correctness over speed of closing tickets
- Be specific and implementation-aware
- Prefer concrete operating rules over vague guidance
- Keep it realistic for a small team with limited staffing
- Do not ask questions
- Do not include commentary outside the deliverable

Produce the deliverable with these sections:

1. Support & Operations Playbook Summary
2. Operating Principles
3. Team Roles and Responsibilities
4. Support Intake Channels and Rules
5. Ticket Categories and Routing
6. Severity Model
7. Escalation Rules
8. What Support Can Resolve Directly
9. What Must Escalate to Engineering / Product / QA
10. Daily Operations Checklist
11. Weekly Operations Review
12. Incident Handling Playbook
13. Schedule Truth and Data Integrity Playbook
14. Request-Linkage Issue Playbook
15. Occurrence Capacity / Staffing Issue Playbook
16. Sharing / Privacy Issue Playbook
17. User Communication Standards
18. Internal Tools / Views / Dashboards Needed
19. Suggested Macros / Response Templates
20. Metrics for Support and Operations
21. Playbook Risks and Guardrails
22. Final Support & Operations Playbook

Requirements:
- Be specific, structured, and implementation-aware
- Preserve the approved functional, technical, schema/API, build-plan, QA, analytics, launch, stabilization, growth, and V1 behavior
- Keep Booking as the only calendar-truth object
- Keep Intake Booking-only and DJ / Manager Lite only
- Keep request-linkage behavior exact
- Preserve Agenda vs Coverage separation
- Preserve the approved occurrence capacity math
- Keep staffing eligibility separate from external sharing visibility
- Keep notifications in-app first for MVP
- Keep the support/ops model realistic for a small MVP team
- Write as if this will be handed directly to product, support, operations, QA, and engineering
- Output the deliverable only, and stop