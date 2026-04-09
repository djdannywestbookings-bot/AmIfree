# AmIFree Scheduler

AmIFree Scheduler is a mobile-first SaaS scheduling and booking platform / PWA built for DJs.

## Repository status

This repository currently contains **project documentation and source-of-truth planning artifacts**.

At the time of this push, the connected workspace did **not** contain the application source code, so this commit bootstraps the repo with the approved product truth, roadmap, and current phase prompt rather than pretending code already exists.

## Product summary

AmIFree is a DJ-first scheduling system designed to keep booking truth, staffing logic, request-linkage integrity, and privacy-safe sharing clear and separate.

### Locked MVP product truths

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
- Internal staffing eligibility uses private source-of-truth schedule logic.
- "Not shared" is not the same as "not eligible" internally.
- Operators cannot force-assign hard-conflicted DJs.
- Hard-conflicted items cannot advance to Assigned or Booked.

### Locked technical direction

- TypeScript modular monolith
- Next.js App Router PWA
- Supabase Postgres / Auth / Storage
- Graphile Worker for async jobs
- OpenAI Responses API for structured extraction
- `schedule_commitments` as the normalized overlap surface
- In-app notifications first for MVP

## Current project phase state

### Complete

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

### In progress / queued

- [14] Phase — Support & Operations Playbook
- [15] Phase — Expansion Architecture for Multi-User SaaS

## Repo structure

- `README.md` — repo overview and current status
- `docs/source-of-truth.md` — approved product, technical, and operating truths
- `docs/roadmap.md` — current phase tracker and execution order
- `docs/phases/14-support-operations-playbook.prompt.md` — current phase prompt snapshot

## Recommended next repo additions

1. Add the approved phase deliverables as versioned docs.
2. Add the actual Next.js / Supabase application scaffold.
3. Add schema, API contracts, worker jobs, and test harnesses.
4. Add CI, deployment, and environment templates once app code exists.

## Notes

This repo bootstrap is intentionally honest: it reflects the planning state of the project without implying that implementation files were already available in this session.
