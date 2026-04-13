# AmIFree Scheduler - Roadmap and Phase Tracker

Last updated: 2026-04-13

## Coordination rules

- Keep this repository and project workspace as the source of truth.
- Use number-first phase titles in the format [number] Phase - [Name].
- Build the full roadmap first, but execute only one phase at a time.
- Each coordinator chat handles a maximum of 5 phases.
- After every 5 phases, generate a handoff packet for the next coordinator chat.
- After results are pasted back, audit them against the roadmap, locked decisions, prior outputs, and open risks before moving on.

## Completed phases

- [1] Phase - Product Blueprint
- [2] Phase - UX/UI System Revision
- [3] Phase - MVP Wireframes
- [4] Phase - MVP Functional Spec
- [5] Phase - MVP Technical Architecture
- [6] Phase - Database Schema & API Contracts
- [7] Phase - MVP Build Plan
- [8] Phase - QA / Test Strategy
- [9] Phase - Analytics & Operational Metrics
- [10] Phase - Launch Readiness
- [11] Phase - Post-Launch Stabilization Plan
- [12] Phase - V1 / Post-MVP Prioritization
- [13] Phase - Growth Loops & User Adoption
- [26] Phase - Multi-User and Tenant Boundary Foundation

## Current phase status

- [26] Phase - Multi-User and Tenant Boundary Foundation - complete
- [27] Phase - Internal Admin, Repair, and Ops Console - active

## Locked decisions to preserve

- Booking is the only calendar-truth object.
- Intake is Booking-only and DJ / Manager Lite only in MVP.
- Request-linkage behavior stays exact.
- Agenda and Coverage remain separate views and surfaces.
- Occurrence capacity math stays: open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)
- Staffing eligibility remains separate from external sharing visibility.
- Notifications are in-app first for MVP.
- Correctness, privacy, and schedule integrity outrank breadth.
- Workspace is the tenant boundary.
- No raw cross-workspace reads are allowed.
- Public sharing remains workspace-scoped and projection-only.

## Open risks to track

- Documentation is currently ahead of implementation code in this repository.
- Support and operations workflows must not weaken product truth for convenience.
- Multi-user SaaS expansion must preserve booking, request, staffing, and privacy integrity.
- Tenant-boundary expansion must not weaken workspace isolation, request-linkage integrity, or public-share privacy.

## Repo bootstrap files

- README.md
- docs/source-of-truth.md
- docs/roadmap.md
- docs/phases/14-support-operations-playbook.prompt.md
- docs/phases/26-multi-user-and-tenant-boundary-foundation.md
