# [7] Phase — MVP Build Plan Final Revision

## 1. Revision Summary

The build plan remains structurally unchanged. The only adjustments made are wording alignments so Intake is consistently positioned as a **DJ / Manager Lite MVP feature** and never described as operator-facing.

The revised language now makes the following explicit throughout:
- Intake is for **DJ / Manager Lite** in MVP.
- Intake remains **Booking-only** in MVP.
- Intake review and Booking conversion are separate from operator workflows.
- Request linkage remains a **separate but parallel workflow** primarily used by operators and still follows the exact approved linked-request + linked-booking behavior.
- Notifications remain **in-app first** for MVP, and workflow email delivery remains **non-blocking for launch**.

---

## 2. Updated Milestone 3

## Milestone 3 — DJ / Manager Lite Intake and Request Linkage

**Estimated span:** 2 to 3 weeks

**Goal**
- Add DJ / Manager Lite intake speed and request workflow correctness without breaking booking truth.

**Must deliver**
- Intake Draft creation for approved inputs, available to **DJ and Manager Lite only** in MVP.
- Storage/upload plumbing for screenshots, pasted text, notes, invoices, and similar approved sources.
- OpenAI Responses API extraction job producing structured booking candidate fields.
- **DJ / Manager Lite intake review-before-save UI.**
- **Booking-only intake conversion path** for DJ / Manager Lite users.
- Request draft flow where a draft request may exist without a linked Booking.
- Sent request flow that creates or links a Requested Booking.
- Request lifecycle states that preserve the same linked request + linked-booking path:
  - Viewed
  - Accepted
  - Declined
  - Withdrawn
  - Expired
  - Converted
- Accepting a request updates the existing linked path and does not create a second Booking.
- Conversion/assignment updates the existing linked Booking path.
- In-app notifications and activity logs for intake review completion and request state changes.

**Dependencies**
- Stable Booking lifecycle services and conflict calculations from Milestone 2.

**Quality gate**
- Intake is available only to DJ / Manager Lite in MVP.
- Intake never writes a Booking without review/confirmation.
- Intake converts only into Bookings.
- Sent request always produces exactly one linked Requested Booking path.
- Accept/decline/convert flows do not duplicate Bookings.

**Demo checkpoint**
- A DJ or Manager Lite pastes intake text, reviews extracted fields, saves to Booking, and an operator separately sends a request and completes an accept/decline flow while preserving the same linked Booking path.

---

## 3. Updated Any Other Affected Sections

## Updated Build Plan Summary wording

The practical build order is:

1. Establish the platform shell, auth, database migrations, protected routing, and one working booking flow.
2. Finish booking lifecycle enforcement, conflict logic, service day behavior, manual availability blocks, and agenda rendering.
3. Add **DJ / Manager Lite intake**, AI extraction review-before-save, and request linkage behavior as a separate but parallel workflow.
4. Add shift templates, occurrence generation, occurrence capacity, staffing eligibility, and assignment blocking.
5. Add public sharing, in-app notifications, activity logs, mobile polish, regression coverage, and launch readiness hardening.

---

## Updated Primary Workstreams wording

5. **Intake and AI review**
   - Intake Drafts, uploads/pasted text parsing, structured extraction, human review, booking conversion for **DJ / Manager Lite**.

6. **Requests**
   - Request objects, linked Requested Booking path, status transitions, conversion/update behavior for operator-managed request workflows.

---

## Updated Recommended Build Sequence wording

7. Implement intake drafts, upload/paste flows, AI extraction jobs, and **DJ / Manager Lite review-before-save booking conversion**.
8. Implement request objects and exact sent/requested-booking linkage behavior as a **separate parallel workflow**.

---

## Updated Workstream-by-Workstream Scope — intake and AI review

### intake and AI review

**In scope**
- Intake Draft records for **DJ / Manager Lite** users in MVP.
- Upload/paste ingestion for approved sources.
- OpenAI Responses API structured extraction.
- Review-before-save UI for **DJ / Manager Lite**.
- Confirmed conversion into Booking creation or update.
- Draft persistence and retry behavior.

**Key implementation rules**
- Intake is explicitly **DJ / Manager Lite only** in MVP.
- Intake stages Booking creation only in MVP.
- AI extraction never auto-creates a Booking.
- Review-before-save is mandatory.
- Extraction should target only booking-relevant fields required by approved contracts.

**Not launch-critical**
- Auto-approval.
- Non-booking object creation from intake.
- Operator-facing intake workflows.
- Fully automated email ingestion pipelines if they delay launch.

---

## Updated QA / Validation Checkpoints wording

### Checkpoint C — DJ / Manager Lite intake and request validation
- Intake Draft persists without creating a Booking.
- Intake access is restricted to DJ / Manager Lite in MVP.
- AI extraction requires review before save.
- Intake converts only to Booking records.
- Sent request always creates or links a Requested Booking.
- Accept/decline/convert preserve the same linked path.
- Accept does not create a second Booking.

---

## Updated Demo Checkpoints by Milestone wording

### Milestone 3 demo
- A DJ or Manager Lite pastes intake text, reviews extracted fields, saves to Booking, and a separate request flow creates, updates, and resolves the linked Requested Booking path without duplication.

---

## Updated Top Build Risks and Mitigations wording

### Risk 6 — Intake scope grows beyond approved DJ / Manager Lite MVP ownership
**Mitigation**
- Limit intake access to DJ / Manager Lite only.
- Limit extraction outputs to booking-relevant fields only.
- Keep human review mandatory.
- Do not allow intake to create occurrences or templates.
- Do not expand intake into an operator-facing workflow for MVP.

---

## 4. Final Revised MVP Build Plan

## 1. Build Plan Summary

The MVP should be built as five dependency-ordered milestones that start with platform/auth plus a single working booking vertical slice, then harden the booking truth and conflict model, then add **DJ / Manager Lite intake** and request linkage, then add shift templates/occurrences plus staffing, and only then finish public sharing, notifications, and launch hardening. The plan should be executed contract-first, with server-enforced rules landing before UI polish, and with Agenda and Coverage kept separate from the first serializer implementation onward.

The practical build order is:

1. Establish the platform shell, auth, database migrations, protected routing, and one working booking flow.
2. Finish booking lifecycle enforcement, conflict logic, service day behavior, manual availability blocks, and agenda rendering.
3. Add **DJ / Manager Lite intake**, AI extraction review-before-save, and request linkage behavior as a separate but parallel workflow.
4. Add shift templates, occurrence generation, occurrence capacity, staffing eligibility, and assignment blocking.
5. Add public sharing, in-app notifications, activity logs, mobile polish, regression coverage, and launch readiness hardening.

This keeps the highest-risk logic centralized early:
- booking as the only calendar-truth object
- `schedule_commitments` as the normalized overlap surface
- request linkage as a single linked path
- staffing eligibility as a separate internal evaluator
- public sharing as a derived output, not a scheduling source

---

## 2. Planning Assumptions

- Small MVP team: 3 product engineers with full-stack capability, 1 fractional product/design lead, 1 fractional QA/UAT resource.
- Rough implementation window: 12 to 14 weeks across 5 milestones, with milestone overlap where contracts are already stable.
- Phase 6 schema/API contracts are treated as approved and implementation-ready; changes during build are limited to defect-level corrections, not model redesign.
- The first launch is a mobile-first web app/PWA only; no native iOS/Android build is required for MVP.
- Supabase Auth, Postgres, Storage, and managed infra are available at project start.
- Graphile Worker is available for async intake parsing, notifications fan-out, and occurrence generation jobs.
- In-app notifications are launch-critical; workflow email/SMS delivery is explicitly not a launch dependency.
- Public sharing is limited to the approved busy and busy+region modes only.
- The initial production scope should target core user roles already implied by approved behavior: DJs, Manager Lite, and operators/admins.
- English-only UX and primary mobile browser support are acceptable for MVP launch.
- Intake supports approved inputs, but intake remains Booking-only for MVP and is available only to **DJ / Manager Lite**.

---

## 3. MVP Build Principles

- **Dependency-first, not screen-first.** Build the core rule engine, data model wiring, and serializers before secondary UI refinement.
- **Server authority over scheduling rules.** Conflict, lifecycle, assignment, and sharing rules must be enforced server-side, not only in client checks.
- **One calendar truth.** Only Bookings render into Agenda and only Bookings write the booking schedule truth.
- **Derived views stay derived.** Coverage, public busy intervals, and staffing eligibility are downstream read models/evaluators, not source objects.
- **Review-before-save AI only.** AI may propose structured fields, but a human must confirm before a Booking is created or updated.
- **Link existing paths, do not duplicate objects.** Requests, conversions, and assignments must update the existing linked path instead of creating parallel records.
- **Mobile behavior is part of core quality, not post-launch polish.** Every milestone must leave the primary mobile flows usable.
- **Risky logic gets test coverage at the milestone where it lands.** Especially conflict rules, request linkage, occurrence generation, and capacity math.
- **Launch scope stays narrow.** Anything that does not protect scheduling truth, assignment quality, or share safety should not become a launch blocker.

---

## 4. Primary Workstreams

1. **Platform and auth**
   - App shell, protected routes, role-aware access, session handling, PWA shell.

2. **Database and API foundation**
   - Migrations, RLS/policies, typed server access, domain services, worker jobs.

3. **Bookings and calendar truth**
   - Booking CRUD, lifecycle, service day logic, alerts, agenda serializers, schedule commitment projection.

4. **Manual availability blocks**
   - Separate schedule objects, hard-blocking logic participation, save restrictions.

5. **Intake and AI review**
   - Intake Drafts, uploads/pasted text parsing, structured extraction, human review, booking conversion for **DJ / Manager Lite**.

6. **Requests**
   - Request objects, linked Requested Booking path, status transitions, conversion/update behavior for operator-managed request workflows.

7. **Shift templates and occurrences**
   - Template CRUD, preview, generation, pause/resume, coverage read model.

8. **Staffing eligibility and assignment**
   - Internal eligibility logic, occurrence capacity, hard assignment blocking, slot filling.

9. **Sharing and public view**
   - Busy and busy+region views, public-safe interval outputs.

10. **Notifications, activity logs, and UI assembly**
   - In-app notification center, audit/activity feed, approved wireframe assembly, mobile refinement.

---

## 5. Critical Dependency Map

- **Auth and role context**
  - Required before any protected operator, manager, or DJ surfaces can be trusted.

- **Core schema + migrations**
  - Required before domain services, serializers, background jobs, and any stable UI integration.

- **Bookings schema and lifecycle services**
  - Required before Agenda rendering, request linkage, conflict logic, and staffing assignment.

- **`schedule_commitments` projection**
  - Required before hard/possible conflict evaluation, staffing eligibility, and public busy interval derivation.

- **Manual availability blocks**
  - Depend on booking overlap rules and commitment projection.
  - Must land before final assignment logic.

- **Request model**
  - Depends on Booking services because sent requests must create or link a Requested Booking.
  - Must land before staffing conversion flows are finalized.

- **Intake Drafts + AI review**
  - Depend on Booking services and upload/storage foundations.
  - Must land before end-to-end intake demos.

- **Shift Templates**
  - Depend on occurrence schema, generation services, and venue/timezone/service-day utilities.

- **Occurrences and coverage serializers**
  - Depend on template generation and assignment-capable occurrence records.
  - Must remain separate from Agenda serializers.

- **Staffing eligibility**
  - Depends on bookings, manual blocks, occurrences, request counts, and hard-block rules.

- **Public share endpoints**
  - Depend on finalized busy-interval derivation rules and sharing visibility rules.
  - Should land after booking/manual-block logic is stable to avoid leakage and rework.

- **Notifications/activity logs**
  - Depend on domain events emitted by bookings, requests, templates, occurrences, and assignments.

---

## 6. Recommended Build Sequence

1. Stand up the app shell, auth, role guards, and base deployment workflow.
2. Implement approved schema migrations, policies, and typed service/repository layer.
3. Implement Booking CRUD and lifecycle transitions with audit/event hooks.
4. Implement `schedule_commitments` writes for Bookings and build the first Agenda serializer.
5. Implement service day handling, cross-midnight rendering rules, and alert-state calculation.
6. Implement Manual Availability Blocks with overlap restrictions and commitment participation.
7. Implement intake drafts, upload/paste flows, AI extraction jobs, and **DJ / Manager Lite review-before-save booking conversion**.
8. Implement request objects and exact sent/requested-booking linkage behavior as a **separate parallel workflow**.
9. Implement shift templates, occurrence preview, materialization, pause/resume, and Coverage serializers.
10. Implement staffing eligibility, slot math, request-per-occurrence handling, and assignment blocking.
11. Implement public share endpoints and busy/busy+region public views.
12. Finish in-app notifications, activity logs, UI polish, PWA hardening, regression validation, and launch prep.

---

## 7. Milestone Plan

### Milestone 1 — Foundation and First Vertical Slice

**Estimated span:** 2 to 3 weeks

**Goal**
- Prove the stack and deliver one end-to-end protected booking flow.

**Must deliver**
- Next.js App Router project skeleton and route structure.
- Supabase Auth integration and role-aware protected routing.
- Base app shell, navigation, mobile layout frame, and PWA manifest/installability.
- Core database migrations and environment wiring.
- Typed API/service layer for Bookings.
- Minimal Booking CRUD for core states.
- First `schedule_commitments` write path for Bookings.
- First Agenda serializer returning Bookings only.
- Basic audit/event emission scaffolding.
- Minimal booking create/edit/list mobile UI wired to live data.

**Dependencies**
- None beyond approved prior phase outputs.

**Quality gate**
- Admin/operator/DJ-authenticated users can sign in and reach only allowed areas.
- A booking can be created, edited, and rendered in Agenda without breaking mobile layout.
- Agenda output contains only Bookings.

**Demo checkpoint**
- Sign in, create a booking, view it in the mobile agenda timeline, edit it, and confirm persistence.

---

### Milestone 2 — Calendar Truth and Conflict Enforcement

**Estimated span:** 2 to 3 weeks

**Goal**
- Make Booking truth and conflict behavior trustworthy enough to build dependent flows.

**Must deliver**
- Full Booking lifecycle transitions and server-side transition guards.
- Alert-state calculation separated from lifecycle state.
- Service day implementation using 6:00 AM local venue time default.
- Cross-midnight booking handling where visuals stay on the starting nightlife day.
- Default schedule view behavior: date strip plus mobile agenda timeline with ~12:00 PM to 6:00 AM window.
- Manual Availability Block CRUD as separate schedule objects.
- Restriction preventing Manual Availability Blocks from saving over Assigned or Booked bookings.
- Hard Conflict / Possible Conflict / Missing Info / Time TBD calculations.
- Limited hard-conflict save flow for DJ owner / Manager Lite only for Inquiry, Hold, Requested.
- Required reason, confirmation, and audit note for limited hard-conflict saves.
- Rule that hard-conflicted items cannot advance to Assigned or Booked.
- Internal hard-block rules sourced only from Assigned, Booked, and active Manual Availability Blocks.

**Dependencies**
- Milestone 1 Booking services and commitment projection.

**Quality gate**
- Overlap matrix passes for Bookings vs Bookings and Manual Blocks vs Bookings.
- Hard-block and soft-review behavior matches approved rules.
- Alert states and lifecycle states are visibly and programmatically separate.

**Demo checkpoint**
- Create overlapping bookings, create manual blocks, show hard vs possible conflicts, and demonstrate blocked transition to Assigned/Booked.

---

### Milestone 3 — DJ / Manager Lite Intake and Request Linkage

**Estimated span:** 2 to 3 weeks

**Goal**
- Add DJ / Manager Lite intake speed and request workflow correctness without breaking booking truth.

**Must deliver**
- Intake Draft creation for approved inputs, available to **DJ and Manager Lite only** in MVP.
- Storage/upload plumbing for screenshots, pasted text, notes, invoices, and similar approved sources.
- OpenAI Responses API extraction job producing structured booking candidate fields.
- **DJ / Manager Lite intake review-before-save UI.**
- **Booking-only intake conversion path** for DJ / Manager Lite users.
- Request draft flow where a draft request may exist without a linked Booking.
- Sent request flow that creates or links a Requested Booking.
- Request lifecycle states that preserve the same linked request + linked-booking path:
  - Viewed
  - Accepted
  - Declined
  - Withdrawn
  - Expired
  - Converted
- Accepting a request updates the existing linked path and does not create a second Booking.
- Conversion/assignment updates the existing linked Booking path.
- In-app notifications and activity logs for intake review completion and request state changes.

**Dependencies**
- Stable Booking lifecycle services and conflict calculations from Milestone 2.

**Quality gate**
- Intake is available only to DJ / Manager Lite in MVP.
- Intake never writes a Booking without review/confirmation.
- Intake converts only into Bookings.
- Sent request always produces exactly one linked Requested Booking path.
- Accept/decline/convert flows do not duplicate Bookings.

**Demo checkpoint**
- A DJ or Manager Lite pastes intake text, reviews extracted fields, saves to Booking, and an operator separately sends a request and completes an accept/decline flow while preserving the same linked Booking path.

---

### Milestone 4 — Shift Templates, Occurrences, and Staffing

**Estimated span:** 2 to 3 weeks

**Goal**
- Add operator staffing workflows while preserving Booking as the only calendar-truth object.

**Must deliver**
- Shift Template CRUD with lifecycle states:
  - active
  - paused
  - archived
- Template fields:
  - `service_day_weekday`
  - `active_start_date`
  - `active_end_date`
  - `local_start_time`
  - `local_end_time`
  - `timezone`
  - `slots_needed`
- Preview of generated occurrences before save.
- Occurrence materialization service.
- Pause behavior that stops future generation only.
- Resume behavior that generates missing future occurrences in remaining active range without duplication.
- Coverage serializers/read models returning Shift Occurrences only.
- Agenda remains Bookings only.
- Occurrence multi-slot model:
  - `slots_needed`
  - `filled_slots_count`
  - `active_request_count`
  - `open_slots_count`
- Approved capacity math:
  - `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`
- Request-per-occurrence, one slot at a time.
- One staffed DJ = one linked Booking.
- Internal staffing eligibility evaluator separated from external sharing visibility.
- Operator assignment flow with hard-conflict blocking.
- Rule that operators cannot force-assign hard-conflicted DJs.

**Dependencies**
- Request linkage, booking truth, and conflict engine already stable.

**Quality gate**
- No duplicate future occurrences after pause/resume cycles.
- Coverage renders only occurrences.
- Eligibility can distinguish not-shared from not-eligible.
- Assignment blocks on hard conflicts consistently.

**Demo checkpoint**
- Create a template, preview occurrences, materialize coverage, send requests against occurrence slots, fill slots, and show agenda vs coverage separation.

---

### Milestone 5 — Sharing, Mobile Completion, and Launch Hardening

**Estimated span:** 2 to 3 weeks

**Goal**
- Finish safe external sharing and harden the MVP for launch.

**Must deliver**
- Public share settings and link management.
- Public share endpoints and pages for:
  - Busy
  - Busy + Region
- Public outputs expose intervals only, with approved visibility behavior.
- Soft-state bookings (Inquiry, Hold, Requested) excluded from public busy output.
- Private event details hidden from public/shared viewers.
- In-app notification center for launch-critical events.
- Activity/audit feed for:
  - lifecycle changes
  - request changes
  - manual block changes
  - hard-conflict override reasons
  - template pause/resume
  - occurrence generation
  - assignment actions
- Final mobile assembly of approved wireframes and edge-case UI states.
- PWA installability, icons, manifest, caching strategy for shell assets, and basic reliability polish.
- End-to-end regression pack across booking, intake, requests, templates, occurrences, staffing, and sharing.
- Staging hardening, migration rehearsal, and launch checklist completion.

**Dependencies**
- All core business rules stable from Milestones 1 through 4.

**Quality gate**
- No data leakage in public share views.
- All launch-critical flows work on primary mobile browsers.
- All launch readiness gates pass.

**Demo checkpoint**
- Full operator-to-DJ-to-shared-view walkthrough on mobile, including share-safe busy view and in-app notification updates.

---

## 8. Workstream-by-Workstream Scope

### platform and auth

**In scope**
- Next.js App Router structure and protected route groups.
- Supabase Auth session handling.
- Role-aware route and action gating.
- Base organization/user context handling.
- PWA shell, manifest, icons, and install prompt.
- Shared mobile layout frame and navigation.

**Key implementation rules**
- Permissions that matter to business logic must be enforced server-side.
- Role restrictions for limited hard-conflict save cannot be UI-only.
- Mobile usability must be preserved from first implementation, not deferred.

**Not launch-critical**
- Email-based workflow automation.
- Native mobile packaging.
- Advanced SSO.

---

### database and API foundation

**In scope**
- Approved schema migrations.
- RLS and access policy implementation.
- Typed service layer for all MVP domain objects.
- Domain event hooks.
- Graphile Worker jobs for async flows.
- Contract-aligned server actions or API handlers.

**Key implementation rules**
- `schedule_commitments` is the overlap authority.
- API contracts from Phase 6 are the implementation source.
- All state transitions and conflict rules live in shared services, not duplicated per screen.

**Not launch-critical**
- Model expansion beyond approved schema/API scope.
- Broad analytics/event warehouse work.

---

### bookings and calendar truth

**In scope**
- Booking CRUD and lifecycle transitions.
- Alert-state calculation separate from lifecycle.
- Service day computation.
- Cross-midnight handling.
- Agenda serializer/read model with Bookings only.
- Booking-derived writes into `schedule_commitments`.

**Key implementation rules**
- Booking remains the only calendar-truth object.
- Hard-conflicted records cannot advance to Assigned or Booked.
- Soft-state bookings participate in review logic but do not hard-block assignment.
- Soft-state bookings do not appear in public shared busy output.

**Not launch-critical**
- Secondary schedule object types rendered in Agenda.
- Non-booking intake conversion targets.

---

### manual availability blocks

**In scope**
- Separate object creation/edit/delete.
- Participation in normalized overlap logic.
- Save restrictions against Assigned and Booked bookings.
- Participation in hard assignment-blocking logic.

**Key implementation rules**
- Manual Availability Blocks remain explicit and separate from Bookings.
- They are schedule objects, but not Booking truth.
- They must be centrally included in overlap evaluation, not checked ad hoc.

**Not launch-critical**
- Complex recurring availability systems beyond approved explicit manual blocks.

---

### intake and AI review

**In scope**
- Intake Draft records for **DJ / Manager Lite** users in MVP.
- Upload/paste ingestion for approved sources.
- OpenAI Responses API structured extraction.
- Review-before-save UI for **DJ / Manager Lite**.
- Confirmed conversion into Booking creation or update.
- Draft persistence and retry behavior.

**Key implementation rules**
- Intake is explicitly **DJ / Manager Lite only** in MVP.
- Intake stages Booking creation only in MVP.
- AI extraction never auto-creates a Booking.
- Review-before-save is mandatory.
- Extraction should target only booking-relevant fields required by approved contracts.

**Not launch-critical**
- Auto-approval.
- Non-booking object creation from intake.
- Operator-facing intake workflows.
- Fully automated email ingestion pipelines if they delay launch.

---

### requests

**In scope**
- Request draft creation.
- Sent request creation with linked Requested Booking.
- Full request status transition model.
- Request detail UI and update flows.
- Request-linked notifications and audit logs.

**Key implementation rules**
- Draft request may exist without linked Booking.
- Sent request must create or link a Requested Booking.
- Viewed/Accepted/Declined/Withdrawn/Expired/Converted preserve one linked path.
- Accepting a request does not create a second Booking.
- Conversion/assignment updates the existing linked Booking path.

**Not launch-critical**
- Multi-channel automated outbound delivery beyond what is needed to complete in-app MVP behavior.

---

### shift templates and occurrences

**In scope**
- Shift Template CRUD and lifecycle state handling.
- Preview of generated occurrences before save.
- Occurrence materialization jobs.
- Pause/resume behavior.
- Coverage serializer/read model.
- Template administration screens and occurrence detail screens.

**Key implementation rules**
- Templates never appear as dated schedule items until materialized.
- Coverage shows Shift Occurrences only.
- Pausing stops future generation only.
- Resuming fills missing future occurrences without duplication.

**Not launch-critical**
- Deep template analytics.
- Complex override systems beyond approved occurrence flow.

---

### staffing eligibility and assignment

**In scope**
- Internal eligibility evaluator.
- Occurrence capacity tracking.
- Active request counting and filled-slot counting.
- Assignment UI and server actions.
- Linked Booking update on staffing.
- Assignment-blocking error handling.

**Key implementation rules**
- Eligibility is separate from external sharing visibility.
- “Not shared” is not the same as “not eligible.”
- One staffed DJ equals one linked Booking.
- Operators cannot force-assign hard-conflicted DJs.
- Approved capacity formula must be implemented exactly:
  - `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`

**Not launch-critical**
- AI-assisted staffing recommendations.
- Auto-assignment engines.

---

### sharing and public view

**In scope**
- Share preference settings.
- Public busy interval endpoint.
- Public busy+region endpoint.
- Public-safe views/screens.
- Share-link creation/management.

**Key implementation rules**
- Public sharing exposes only approved modes.
- Private event details never leak.
- Soft-state bookings are excluded from shared busy output.
- External sharing visibility must not influence internal staffing eligibility.

**Not launch-critical**
- Rich client portals with detailed booking objects.
- More than the two approved share modes.

---

### notifications and activity logs

**In scope**
- Domain event emission for launch-critical flows.
- In-app notification center/inbox/badges.
- Activity log entries for important state changes and overrides.
- Launch-critical notification triggers:
  - intake review completed
  - request state changes
  - assignment changes
  - template pause/resume
  - occurrence generation issues

**Key implementation rules**
- In-app first.
- Workflow email delivery is not a required launch dependency.
- Limited hard-conflict saves must always leave an audit trail.

**Not launch-critical**
- Full external messaging automation.
- Notification preference center beyond basic MVP needs.

---

### UI assembly from the approved wireframes

**In scope**
- Date strip + mobile agenda timeline as default schedule surface.
- Operator coverage screens.
- Booking forms and detail screens.
- Manual block forms.
- Intake review screens.
- Request flow screens.
- Shift template preview/create/edit screens.
- Public share settings and public share pages.
- Notification center and activity surfaces.

**Key implementation rules**
- Agenda = Bookings only.
- Coverage = Shift Occurrences only.
- Default visible time window is approximately 12:00 PM to 6:00 AM next day.
- Cross-midnight visuals belong to the starting nightlife day.
- UI should consume stable serializers/read models instead of reconstructing business rules client-side.

**Not launch-critical**
- Highly polished animations.
- Desktop-first redesign work.

---

## 9. Parallelization Opportunities

- Platform shell and auth can start immediately while migrations are being finalized.
- UI assembly can begin against mocked Phase 6 contracts before all back-end services are complete.
- Booking forms and Agenda UI can be built in parallel once Booking contracts are stable.
- Conflict engine implementation and conflict-state UI can proceed in parallel after `schedule_commitments` write rules are defined.
- Intake review UI can be built in parallel with async extraction jobs being implemented, as long as access remains scoped to DJ / Manager Lite.
- Request screens can be built in parallel with notification feed UI once request state contracts are stable.
- Template CRUD screens and preview UI can proceed before full occurrence generation jobs are production-ready.
- Coverage UI can be assembled against stub occurrence serializers while pause/resume idempotency work is being completed.
- Public share pages can be built in parallel once busy interval endpoint shapes are frozen.
- Notification center UI can proceed early as long as domain event payloads are agreed.

Parallel work that should **not** begin too early:
- Final public sharing until conflict/public busy derivation is stable.
- Final staffing assignment UX until eligibility and hard-block rules are implemented server-side.
- Launch UAT until request linkage and occurrence generation are stable.

---

## 10. QA / Validation Checkpoints

### Checkpoint A — Foundation validation
- Auth flows work on mobile.
- Protected routes reject unauthorized roles.
- Booking CRUD works against live DB.
- Agenda returns only Bookings.

### Checkpoint B — Calendar truth validation
- Service day and cross-midnight rendering match approved rules.
- Conflict matrix passes:
  - Assigned vs Assigned
  - Booked vs Booked
  - Manual Block vs Assigned/Booked
  - Inquiry/Hold/Requested vs hard-block logic
- Limited hard-conflict save restriction works only for approved roles/states.

### Checkpoint C — DJ / Manager Lite intake and request validation
- Intake Draft persists without creating a Booking.
- Intake access is restricted to DJ / Manager Lite in MVP.
- AI extraction requires review before save.
- Intake converts only to Booking records.
- Sent request always creates or links a Requested Booking.
- Accept/decline/convert preserve the same linked path.
- Accept does not create a second Booking.

### Checkpoint D — Template, occurrence, and staffing validation
- Template preview matches generated occurrences.
- Pause stops only future generation.
- Resume creates missing future occurrences without duplicates.
- Coverage returns occurrences only.
- Capacity math is correct under partial fills and active requests.
- Hard-conflicted DJs cannot be assigned.

### Checkpoint E — Sharing and launch validation
- Public busy outputs never expose private event details.
- Soft-state bookings are excluded from public busy output.
- In-app notifications fire for launch-critical flows.
- Full mobile walkthrough passes on primary devices/browsers.
- Regression suite passes for end-to-end MVP flows.

---

## 11. Demo Checkpoints by Milestone

### Milestone 1 demo
- Login, role-protected navigation, create/edit booking, booking visible in mobile agenda.

### Milestone 2 demo
- Create overlapping bookings and manual blocks, show alert states, demonstrate blocked hard-conflict progression and approved limited override flow.

### Milestone 3 demo
- A DJ or Manager Lite pastes intake text, reviews extracted fields, saves to Booking, and a separate request flow creates, updates, and resolves the linked Requested Booking path without duplication.

### Milestone 4 demo
- Create a template, preview occurrences, materialize coverage, send requests against occurrence slots, fill one slot with one booking, show remaining open slots.

### Milestone 5 demo
- Turn on sharing, open busy/busy+region public view, complete a full operator workflow on mobile, and show in-app notifications/activity logs updating in real time.

---

## 12. Launch Readiness Gates

The MVP is launch-ready only when all of the following are true:

- Auth and role protections are enforced server-side and verified in staging.
- Booking CRUD, lifecycle transitions, and agenda rendering are stable on mobile.
- Agenda returns only Bookings.
- Coverage returns only Shift Occurrences.
- Templates never appear as dated schedule items until materialized.
- Service day and cross-midnight logic match approved behavior.
- Hard assignment-blocking comes only from:
  - Assigned bookings
  - Booked bookings
  - Active Manual Availability Blocks
- Soft-state bookings:
  - Inquiry
  - Hold
  - Requested
  do not hard-block assignment and do not appear in public shared busy output.
- Manual Availability Blocks cannot be saved over Assigned or Booked bookings.
- Limited hard-conflict save exists only for DJ owner / Manager Lite and only for Inquiry, Hold, Requested, with reason, confirmation, and audit note.
- Sent request creates or links a Requested Booking every time.
- Accepting a request never creates a second Booking.
- Conversion/assignment updates the existing linked path.
- Shift template pause/resume is idempotent and creates no duplicate future occurrences.
- Occurrence capacity math is correct for all tested fill/request combinations.
- Operators cannot force-assign hard-conflicted DJs.
- Public sharing exposes only busy or busy+region intervals.
- Private event details are never exposed through shared/public endpoints.
- In-app notifications exist for launch-critical user events.
- PWA installability works and the shell is stable.
- Migration rehearsal, rollback plan, and staging smoke test are complete.

---

## 13. Top Build Risks and Mitigations

### Risk 1 — Conflict logic fragments across UI and API
**Mitigation**
- Centralize overlap and transition rules in shared server services using `schedule_commitments`.
- Keep clients display-only for conflict results.

### Risk 2 — Request linkage accidentally duplicates Bookings
**Mitigation**
- Treat linked request and linked booking IDs as canonical references.
- Add explicit regression tests for send, accept, decline, convert, and assign.

### Risk 3 — Shift resume duplicates occurrences
**Mitigation**
- Use deterministic generation windows and idempotent occurrence keys.
- Add pause/resume replay tests before staging.

### Risk 4 — Service day and calendar timestamp drift cause confusing schedule views
**Mitigation**
- Build dedicated service-day utilities early.
- Test midnight and post-2:00 AM edge cases in Milestone 2.

### Risk 5 — Eligibility and sharing logic get mixed together
**Mitigation**
- Separate internal evaluator from public serializer from day one.
- Explicitly test “not shared” vs “not eligible.”

### Risk 6 — Intake scope grows beyond approved DJ / Manager Lite MVP ownership
**Mitigation**
- Limit intake access to DJ / Manager Lite only.
- Limit extraction outputs to booking-relevant fields only.
- Keep human review mandatory.
- Do not allow intake to create occurrences or templates.
- Do not expand intake into an operator-facing workflow for MVP.

### Risk 7 — Mobile UI becomes unstable due to late integration
**Mitigation**
- Build contract-driven UI in parallel from Milestone 1.
- Make every demo checkpoint mobile-first.

### Risk 8 — Public sharing leaks too much detail
**Mitigation**
- Build sharing from dedicated public serializers/endpoints, never by reusing internal booking payloads.
- Add explicit privacy regression tests before launch.

---

## 14. Recommended Definition of Done by Milestone

### Milestone 1 DoD
- Protected routes and auth are wired and tested.
- DB migrations apply cleanly in dev and staging.
- One booking vertical slice works end-to-end.
- Agenda serializer returns only Bookings.
- Mobile shell is usable.

### Milestone 2 DoD
- Booking lifecycle and alert rules are enforced server-side.
- Manual Availability Blocks are live and validated.
- Service day and cross-midnight rules are correct.
- Hard-block vs soft-review logic passes automated tests.
- Limited hard-conflict override path is audited.

### Milestone 3 DoD
- Intake review-before-save works reliably for DJ / Manager Lite.
- AI extraction can stage Bookings through intake drafts.
- Request linkage behavior is exact and non-duplicative.
- Request transitions generate in-app notifications/activity entries.
- Core intake/request regression suite passes.

### Milestone 4 DoD
- Templates preview and materialize occurrences correctly.
- Pause/resume is idempotent.
- Coverage is occurrence-only.
- Eligibility and assignment rules are enforced correctly.
- Capacity math and slot filling pass automated and manual tests.

### Milestone 5 DoD
- Public share modes are correct and safe.
- Notification center and activity logs cover launch-critical events.
- Mobile wireframe assembly is complete for launch flows.
- PWA shell is launch-usable.
- Staging UAT and regression checks pass.

---

## 15. Final MVP Build Plan

Build the MVP in five milestones with a strict dependency-first sequence:

1. **Foundation and booking vertical slice**
   - Ship auth, app shell, migrations, booking CRUD, and agenda.

2. **Calendar truth enforcement**
   - Ship lifecycle guards, service day behavior, cross-midnight handling, conflicts, and manual blocks.

3. **DJ / Manager Lite intake and request linkage**
   - Ship Intake Drafts, AI review-before-save for DJ / Manager Lite, Booking-only intake conversion, and exact request state handling as a separate parallel workflow.

4. **Templates, occurrences, and staffing**
   - Ship template preview/materialization, occurrence capacity, eligibility, and assignment blocking.

5. **Sharing and launch hardening**
   - Ship busy/busy+region public views, in-app notifications, activity logs, PWA polish, and full regression/UAT.

Execution guidance for engineering and product:
- Freeze launch scope around the approved scheduling truths.
- Land server-enforced rule systems before UI expansion.
- Use contract-driven frontend work to maximize parallelism.
- Treat request linkage, occurrence generation, and sharing safety as top regression areas.
- Do not allow email workflow delivery to delay launch.
- Launch only when all readiness gates are satisfied.
