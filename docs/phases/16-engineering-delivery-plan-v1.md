# [16] Phase — Engineering Delivery Plan for V1

## 1. Engineering Delivery Plan Summary

This plan translates the locked V1 priorities, product guardrails, technical decisions, QA expectations, analytics requirements, support learnings, and multi-user expansion constraints into a concrete delivery sequence for a small engineering team.

The recommended approach is a **three-wave V1 delivery program** with a small number of tightly scoped release slices inside each wave:

- **Wave 1:** build the operational core that creates immediate leverage for staffing and coverage while laying the foundations needed for later workflow safety.
- **Wave 2:** build the workflow-resolution layer that makes V1 trustworthy in daily use: request orchestration completion, missing-info resolution, conflict explainability, override review, auditability, notification center, and availability-block ergonomics.
- **Wave 3:** build the scaling and delegation layer: internal ops dashboards, reusable defaults, lightweight venue profiles, Manager Lite handoffs, and final performance/reliability polish.

The locked priority ranking remains intact. Engineering sequencing differs slightly from ranking only where lower-ranked items provide enabling infrastructure for higher-ranked items. In practice, this means some foundational work for conflict explainability, notifications, and mobile sync safety starts early, but the first major user-visible delivery remains **Coverage Action Queue + Staffing Recommendation Panel**, followed by **Request Lifecycle Orchestration**, then **Missing Info / Time TBD Resolution**.

The plan assumes V1 is delivered through **feature-flagged, additive, low-risk slices**, with:
- no redesign of the domain model,
- no change to Booking as the only calendar-truth object,
- no expansion of intake scope,
- no blending of Agenda and Coverage,
- no weakening of staffing or conflict rules.

## 2. Delivery Assumptions

1. **Team shape**
   - 1 technical lead / senior full-stack engineer
   - 2 product engineers
   - 1 frontend/mobile-focused engineer
   - 0.5–1 backend/platform contribution shared across the team
   - shared design/product support
   - part-time QA support, with engineers owning most automation

2. **Time horizon**
   - Realistic V1 engineering duration: **18–22 weeks** of execution, including stabilization and rollout buffers.
   - A smaller 3-engineer team can still execute this plan, but likely in **22–28 weeks**.

3. **Starting point**
   - MVP scheduling, bookings, requests, shift occurrences, manual availability blocks, normalized conflict surface, and core operator flows already exist.
   - Supabase, Graphile Worker, analytics basics, and role/auth patterns are already available from MVP.

4. **Scope guardrails**
   - No payments, invoicing, marketplace/discovery, external calendar truth, broad intake expansion, or autonomous AI scope in V1.
   - Workflow email remains deferred; in-app notifications are the shipping path.

5. **Release discipline**
   - All V1 changes ship behind flags.
   - Schema changes are additive.
   - Rollouts use internal dogfooding, then limited-tenant/operator rollout, then broader release.

## 3. Inputs from Locked Phases

The execution plan is governed by the following locked inputs:

- **Product shape:** DJ-first, mobile-first SaaS/PWA.
- **Core truth:** Booking is the only calendar-truth object.
- **Explicit schedule separation:** Manual Availability Blocks remain separate schedule objects.
- **Flow separation:** Booking Request, Shift Occurrence, and Booking stay separate objects.
- **Coverage model:** Shift Templates and one-off Shift Occurrences remain separate flows and objects.
- **Operational UI separation:** Agenda shows Bookings only; Coverage shows Shift Occurrences only.
- **Staffing rules:** eligibility uses internal private schedule logic, not public sharing visibility.
- **Conflict rules:** Assigned/Booked bookings and active Manual Availability Blocks hard-block assignment; Inquiry/Hold/Requested remain soft-state review signals only.
- **Request-linkage rules:** accepting a request never creates a second Booking; linked request and linked Booking remain a single path.
- **Occurrence capacity model:** one staffed DJ equals one linked Booking; open capacity uses the approved formula and must not drift in frontend logic.
- **Lifecycle/alert separation:** lifecycle states and alert states remain distinct systems.
- **Technical stack:** TypeScript modular monolith, Next.js App Router PWA, Supabase, Graphile Worker, OpenAI Responses API, normalized `schedule_commitments`.
- **Support/QA/analytics/stabilization learnings:** V1 must be observable, supportable, and resilient under daily operational use.
- **Expansion constraints:** future multi-user growth is additive; no V1 work should force a redesign of org/workspace/person/permission evolution.

## 4. Engineering Delivery Principles

1. **Protect domain invariants before adding speed**
   - Centralize lifecycle transitions, capacity updates, conflict rules, and request-linkage behavior in server-side domain services.
   - Never duplicate critical business rules in multiple UI surfaces.

2. **Ship operator leverage first**
   - Deliver the actions that reduce manual staffing effort earliest.
   - Read-only insight is useful, but actionability must follow quickly.

3. **Use additive foundations**
   - Prefer new read models, derived views, event logs, and helper services over rewriting existing MVP flows.
   - Avoid schema churn that would destabilize core scheduling objects.

4. **Separate compute surfaces from source-of-truth surfaces**
   - Recommendation panels, dashboards, exception queues, and notifications should read from derived services and views.
   - Writes continue to flow through authoritative booking/request/occurrence services.

5. **Design for mobile-first daily use**
   - Every major V1 feature must be performant in the default agenda/date-strip workflow and resilient under resume/reconnect/stale-state conditions.

6. **Audit every consequential action**
   - Staffing actions, override actions, request transitions, handoffs, and admin remediations should all produce an audit trail.

7. **Treat support and analytics as build requirements**
   - Every major V1 initiative should ship with instrumentation, support diagnostics, and clear exception surfaces.

8. **Prefer staged completeness over broad partial delivery**
   - Finish one strong operational slice at a time instead of opening ten half-complete systems.

## 5. V1 Delivery Workstreams

### A. Staffing Operations Workstream
Covers:
- Coverage Action Queue
- Staffing Recommendation Panel
- occurrence-level action APIs
- recommendation explainability primitives

### B. Workflow Orchestration Workstream
Covers:
- request lifecycle state machine
- request-linked booking transitions
- Missing Info / Time TBD resolution
- in-app workflow nudges

### C. Conflict, Audit, and Scheduling Safety Workstream
Covers:
- conflict explainability service
- override review workflow
- audit history
- availability-block ergonomics and reusable patterns
- mutation guardrails

### D. Mobile Platform and Reliability Workstream
Covers:
- PWA performance
- sync safety
- stale-state handling
- service worker/version safety
- critical-list rendering and caching discipline

### E. Internal Visibility and Operations Workstream
Covers:
- internal ops dashboards
- exception queues
- admin diagnostics
- request aging, queue health, and notification/job health surfaces

### F. Configuration and Delegation Workstream
Covers:
- reusable booking defaults
- lightweight venue profiles
- Manager Lite collaboration and safe handoffs

## 6. Dependency and Sequencing Map

### Foundational dependencies that must start first

1. **Central transition services**
   - Request lifecycle transitions
   - booking/request linkage enforcement
   - occurrence staffing actions
   - override validation
   - audit emission

2. **Derived read models**
   - coverage queue summaries by occurrence
   - recommendation summaries by occurrence + candidate
   - missing-info/time-TBD task summaries
   - notification inbox summaries
   - internal exception views

3. **Event and audit framework**
   - Every staffing, lifecycle, override, and handoff action should emit structured events for audit, support, and analytics.

4. **Mobile mutation safety**
   - idempotency keys or equivalent mutation dedupe
   - stale-write protection
   - reliable invalidation/reload after critical actions

### Major initiative dependencies

- **Coverage Action Queue** depends on stable occurrence summary computation and authoritative capacity calculation.
- **Staffing Recommendation Panel** depends on internal eligibility/conflict computation, explainability reason codes, and staffing action endpoints.
- **Request Lifecycle Orchestration** depends on a single server-side request state machine and linked Booking transition rules.
- **Missing Info / Time TBD Resolution** depends on alert-state derivation and request/booking/occurrence task surfaces.
- **Conflict Explainability** depends on `schedule_commitments`, lifecycle/alert separation, and audit primitives.
- **Override Review and Audit History** depend on explainability, permission checks, and structured audit events.
- **Availability Block Ergonomics** depends on hard-conflict guardrails and cross-midnight/service-day-safe validation.
- **Notification Center** depends on normalized event generation and user preference storage.
- **Ops Dashboards** depend on shipped analytics contracts, audit events, and derived operational views.
- **Booking Defaults / Venue Profiles** depend on stabilized booking forms and booking creation/update APIs.
- **Manager Lite Handoffs** depend on audit history, permission scoping, notifications, and safe workflow ownership controls.

### What can run in parallel

- Platform reliability work can run in parallel with every wave.
- Notification infrastructure can start in parallel with request-state work even if user-facing inbox ships later.
- Conflict explainability backend primitives can start in parallel with staffing recommendation backend work.
- Availability-block UX work can run in parallel with Wave 2 conflict/audit UI once validation services are settled.
- Booking defaults / venue profiles can run in parallel with ops dashboards in Wave 3.
- Manager Lite handoffs should not start before audit, notification, and permission safeguards are production-ready.

## 7. Recommended Delivery Waves

### Wave 1

**Primary objective:** deliver the first high-leverage operator workflow while putting guardrails underneath all later V1 work.

**Build in Wave 1**
- Coverage Action Queue v1
- Staffing Recommendation Panel v1
- request lifecycle service core
- audit/event framework
- recommendation explainability reason codes v1
- mobile sync-safety baseline
- notification event plumbing baseline
- critical analytics instrumentation baseline

**Wave 1 release slices**
1. **Slice 1A — Internal alpha**
   - read-only queue summaries
   - read-only recommendation results
   - audit/event emission in shadow mode
   - performance/sync hardening on critical list/detail pages

2. **Slice 1B — Operator beta**
   - actionable queue
   - recommendation panel with request/send/assign actions
   - authoritative occurrence staffing actions
   - request-linked booking transition enforcement
   - canary rollout to internal users or one pilot workspace

3. **Slice 1C — Stabilization**
   - recommendation quality tuning
   - duplicate-action prevention
   - support diagnostics for queue/action failures
   - analytics validation

**Why first**
This wave attacks the highest-value V1 priority while also establishing the server-side control surfaces needed for later workflow safety.

### Wave 2

**Primary objective:** make V1 operationally trustworthy by resolving ambiguity, conflicts, and exception handling.

**Build in Wave 2**
- Request Lifecycle Orchestration completion
- Missing Info / Time TBD Resolution Workflow
- Conflict Explainability UI
- Override Review workflow
- Audit History timeline
- Availability Block Ergonomics and reusable patterns
- Notification Center v1
- actionable nudges and preference controls
- continued mobile polish

**Wave 2 release slices**
1. **Slice 2A — Workflow completion**
   - full request state transitions and expiry/withdraw/convert handling
   - missing-info task surfacing
   - time-TBD resolution prompts
   - notification inbox basic UI

2. **Slice 2B — Conflict trust layer**
   - conflict explainability panel
   - override review flow for allowed states only
   - audit history timeline
   - availability-block conflict preview and fast-create presets

3. **Slice 2C — Stabilization**
   - alert fatigue tuning
   - resolution-flow completion tuning
   - QA regression expansion around cross-midnight and service-day cases

**Why second**
Wave 1 makes staffing faster. Wave 2 makes staffing safe, explainable, and supportable.

### Wave 3

**Primary objective:** scale daily operations, reduce repetitive admin work, and enable limited collaboration without breaking the DJ-first model.

**Build in Wave 3**
- Internal Ops Dashboards and Exception Queues
- Reusable Booking Defaults
- Lightweight Venue Profiles
- Manager Lite Collaboration and Safe Handoffs
- final mobile/PWA performance and reliability polish
- release hardening and cleanup

**Wave 3 release slices**
1. **Slice 3A — Internal ops**
   - admin dashboards
   - exception queues
   - notification/job health surfaces
   - request aging and override monitoring

2. **Slice 3B — Reuse and speed**
   - booking defaults
   - venue profiles
   - safe autofill on booking creation/edit
   - analytics on reuse adoption

3. **Slice 3C — Delegation**
   - Manager Lite handoff flows
   - scoped ownership transfer or assist workflows
   - attribution, audit, and notification coverage
   - final rollout hardening

**Why third**
These features matter, but they rely on the workflow, audit, notification, and permission scaffolding established in Waves 1–2.

## 8. Initiative-by-Initiative Engineering Breakdown

### Coverage Action Queue + Staffing Recommendation Panel

**Engineering goal**
Create an occurrence-centric operational queue that tells operators what needs attention and who can credibly fill it.

**Build**
- Derived occurrence queue service keyed to Shift Occurrences, not Bookings.
- Queue filters and sort keys based on:
  - `open_slots_count`
  - staffing urgency
  - active request presence
  - missing info
  - time-TBD state
  - region/time fit indicators
- Recommendation service using private internal schedule logic and normalized commitments.
- Reason-code layer for each candidate:
  - available
  - possible conflict
  - hard conflict
  - missing info
  - region fit or mismatch
  - recent request already active
- Occurrence action endpoints:
  - open candidate panel
  - send request
  - assign where allowed
  - prevent force-assign on hard conflict
- Frontend detail panel optimized for mobile use.

**Dependencies**
- occurrence summary computation
- authoritative capacity math
- conflict/read service
- audit events
- mutation dedupe

**Release definition**
- Queue v1 is complete when operators can identify open coverage, view top candidates with explainability, and safely trigger request/assignment actions without leaving the coverage flow.

### Request Lifecycle Orchestration

**Engineering goal**
Make request handling exact, idempotent, and fully aligned with linked Booking behavior.

**Build**
- Central request state machine service.
- Strict enforcement of linked request + linked Booking path.
- Transition handlers for viewed, accepted, declined, withdrawn, expired, converted.
- Guarantee that accepting a request does not create a second Booking.
- Background jobs for expiry and stale-request housekeeping.
- Timeline events for request lifecycle.
- UI surfaces for request status visibility in occurrence detail and booking detail.
- Deep links from notifications into the relevant workflow.

**Dependencies**
- audit/event framework
- notification plumbing
- linked booking transition service
- permission-aware action endpoints

**Release definition**
- The orchestration is complete when every request transition is server-enforced, idempotent, auditable, and reflected in the single linked Booking path.

### Missing Info / Time TBD Resolution Workflow

**Engineering goal**
Turn alert states into actionable resolution tasks instead of passive warning labels.

**Build**
- Derived task service that identifies records blocked by missing info or time TBD.
- Resolution checklist UI in booking/request/coverage detail.
- Required-field enforcement before later transitions where needed.
- Time-TBD resolution flow that updates the existing linked Booking path rather than creating parallel records.
- Queue surfacing for unresolved items with aging and urgency.
- Nudges/reminders through in-app notifications.
- Analytics for creation-to-resolution timing.

**Dependencies**
- alert-state derivation
- request lifecycle services
- notification center baseline
- booking/request update APIs

**Release definition**
- Complete when operators can discover, resolve, and track missing-info/time-TBD blockers directly from daily workflow surfaces.

### Conflict Explainability, Override Review, and Audit History

**Engineering goal**
Make conflict behavior understandable and safe without weakening hard-stop rules.

**Build**
- Conflict explainability service over `schedule_commitments`.
- Structured explanation payloads separating:
  - hard blockers
  - soft review signals
  - public-share visibility differences
- Override workflow only for DJ owner / Manager Lite limited hard-conflict save in:
  - Inquiry
  - Hold
  - Requested
- Mandatory override reason, confirmation, and audit note.
- Explicit prevention of advancing hard-conflicted items to Assigned or Booked.
- Unified audit history timeline on relevant records.
- Shared explainability components reused in staffing recommendations and booking detail.

**Dependencies**
- commitments read service
- audit/event system
- role/permission checks
- request/booking transition services

**Release definition**
- Complete when operators can see exactly why a conflict exists, know whether it blocks progression, and use the allowed override flow only where the locked rules permit it.

### Availability Block Ergonomics and Reusable Patterns

**Engineering goal**
Reduce friction in creating and managing Manual Availability Blocks while preserving explicit-block semantics and hard conflict rules.

**Build**
- Fast-create block flows aligned to nightlife service-day usage.
- Reusable patterns/presets for common block shapes.
- duplicate/edit/copy behavior for frequent availability patterns.
- Cross-midnight-aware form UX and previews.
- Server-side validation that prevents saving blocks over Assigned/Booked bookings.
- Clear visual distinction from Bookings and Shift Occurrences.
- Optional quick actions from schedule views without collapsing object boundaries.

**Dependencies**
- scheduling validation services
- conflict preview logic
- mobile form performance improvements

**Release definition**
- Complete when users can create common block patterns quickly with confidence and without violating hard booking conflicts.

### Mobile PWA Performance, Sync Safety, and Daily-Use Polish

**Engineering goal**
Make V1 dependable during heavy daily use on mobile, especially around list/detail transitions and critical staffing actions.

**Build**
- Faster agenda/date-strip rendering and list virtualization where needed.
- Query/cache invalidation discipline for bookings, occurrences, requests, and notifications.
- Stale-state detection and reload prompts for critical records.
- Idempotent mutation handling for request send, assign, override, and block creation.
- Safe service worker versioning to avoid broken stale clients.
- Resume/reconnect handling for mobile backgrounding.
- Skeleton/loading/error states for core operational surfaces.
- Performance budgets for first interactive render on key pages.

**Dependencies**
- shared app architecture and query layer
- action endpoint idempotency
- telemetry for slow flows and failure rates

**Release definition**
- Complete when critical V1 flows behave predictably across refresh, reconnect, and repeated-tap conditions on mobile.

### In-App Notification Center, Preferences, and Actionable Nudges

**Engineering goal**
Provide one in-app workflow inbox for state changes, resolution tasks, and operational follow-up.

**Build**
- Notification event schema and storage.
- Notification generation jobs from request, conflict, missing-info, time-TBD, and handoff events.
- Inbox list and unread counters.
- Actionable deep links to the exact record/action state.
- Basic user preferences by notification class and urgency.
- De-duplication and bundling rules to reduce noise.
- Support/admin visibility into failed or stuck notification generation.

**Dependencies**
- event/audit framework
- Graphile jobs
- task derivation from request/conflict systems

**Release definition**
- Complete when major operational events generate actionable in-app notifications without requiring email dependency.

### Internal Ops Dashboards and Exception Queues

**Engineering goal**
Give internal teams visibility into workload health, stuck states, and system exceptions without creating parallel operational truth.

**Build**
- Internal admin dashboards for:
  - coverage queue health
  - open-slot aging
  - request aging/failure states
  - missing-info/time-TBD backlog
  - override frequency
  - notification/job failures
- Exception queues with drill-down into authoritative records.
- Safe remediation actions only where clearly defined.
- Derived views/materialized summaries for performance.
- Operator vs admin visibility separation.

**Dependencies**
- analytics contract stability
- audit events
- notification/job instrumentation
- read-model layer

**Release definition**
- Complete when support and ops can diagnose major workflow issues without manual database inspection.

### Reusable Booking Defaults and Lightweight Venue Profiles

**Engineering goal**
Reduce repetitive entry work while keeping Booking creation simple and source-of-truth boundaries intact.

**Build**
- Per-user or workspace-level booking defaults where appropriate.
- Lightweight venue profiles for common reusable fields such as region, address hints, time conventions, notes, and contact helpers.
- Safe autofill into booking create/edit flows with explicit override.
- No CRM expansion, no calendar-truth shift, no heavy relationship model.
- Migration-free adoption path where profiles are optional and additive.

**Dependencies**
- stabilized booking form APIs
- support instrumentation for autofill errors
- analytics for usage and edit-overrides

**Release definition**
- Complete when frequent booking-entry steps are meaningfully faster without introducing hidden automation or object coupling.

### Manager Lite Collaboration and Safe Handoffs

**Engineering goal**
Allow limited delegation and shared operational handling without broad multi-user redesign.

**Build**
- Scoped Manager Lite permissions aligned with locked constraints.
- Safe handoff/assist workflows on bookings, requests, and occurrence tasks.
- Attribution of actor vs owner on every major action.
- Notification triggers for ownership changes and pending follow-up.
- Enforcement of limited hard-conflict save only in allowed states, with required reason/confirmation/audit note.
- Explicit prevention of Manager Lite bypassing assignment hard blockers.
- Read/write scope boundaries that remain additive to future workspace/team evolution.

**Dependencies**
- audit history
- notification center
- permission scaffolding
- stable request/conflict services

**Release definition**
- Complete when delegated collaborators can assist and hand off work safely without weakening staffing rules or obscuring accountability.

## 9. Cross-Cutting Technical Safeguards

1. **Single-source domain services**
   - Capacity math, lifecycle transitions, conflict checks, and override validation must live server-side in shared services.

2. **Approved occurrence-capacity formula only**
   - `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`
   - Frontend may display the value, but must not own the calculation.

3. **Strict object-boundary protection**
   - Bookings remain calendar truth.
   - Shift Occurrences remain coverage truth.
   - Manual Availability Blocks remain explicit separate schedule objects.

4. **Agenda/Coverage separation**
   - Agenda features never become a mixed staffing board.
   - Coverage features remain occurrence-centric.

5. **Idempotent writes**
   - Request sends, assignments, overrides, block saves, and handoffs need mutation dedupe or equivalent protection.

6. **Audit envelope on consequential actions**
   - actor
   - acting role
   - target record(s)
   - prior state
   - new state
   - reason/note where required
   - timestamp

7. **Additive migrations only**
   - new tables, views, columns, and indexes
   - careful backfills
   - no destabilizing rewrite migrations mid-program

8. **Feature flags and kill switches**
   - queue
   - recommendations
   - notifications
   - override UI
   - Manager Lite handoffs
   - admin dashboards

9. **Performance budgets**
   - key mobile list/detail screens should have tracked performance thresholds and regression alerts.

10. **Private staffing logic protection**
   - recommendation and eligibility services must never derive from public share endpoints.

## 10. QA / Analytics / Support Integration Points

### QA integration
- Expand automated coverage around:
  - linked request + linked Booking transitions
  - hard vs soft conflict behavior
  - allowed override states only
  - cross-midnight rendering and service-day handling
  - occurrence slot math and partial-fill behavior
  - manual block save restrictions
  - Manager Lite permission boundaries
- Add regression suites for stale-write, duplicate-tap, refresh/reconnect, and notification deep-link flows.
- Use seed data covering nightlife edge cases, time zones, and overlapping commitments.

### Analytics integration
Ship event instrumentation with every initiative, including:
- queue viewed
- candidate panel opened
- request sent
- request accepted/declined/expired/withdrawn/converted
- missing-info created/resolved
- time-TBD resolved
- override attempted/confirmed/blocked
- availability preset used
- notification delivered/opened/acted
- handoff initiated/completed
- recommendation accepted vs ignored

### Support integration
- Each wave should update support playbooks, internal troubleshooting docs, and exception handling guides.
- Support/admin tooling should expose:
  - last transition attempts
  - notification generation status
  - recommendation reason payloads
  - audit notes
- Rollouts should include support briefing before wider enablement.

### Stabilization feedback loop
- Weekly review during V1 execution of:
  - support tickets
  - failed mutations
  - slow screens
  - recommendation trust metrics
  - unresolved alert aging
- Feed findings directly into the next slice, not a separate future backlog.

## 11. Release Slicing and Rollout Strategy

### Rollout model
1. **Internal shadow mode**
   - compute queue summaries, recommendations, and notifications without exposing all actions to users.
2. **Canary operators / pilot workspace**
   - enable actions for a small trusted cohort.
3. **Limited production rollout**
   - expand by feature flag to selected users.
4. **General availability**
   - broaden once operational metrics and support burden stabilize.

### Recommended release slices

- **Release Slice A**
  - queue summaries
  - recommendation explainability v1
  - mutation safety baseline
  - no broad release yet

- **Release Slice B**
  - actionable coverage queue
  - request orchestration core
  - limited pilot rollout

- **Release Slice C**
  - missing-info/time-TBD workflow
  - conflict explainability
  - override review
  - notification center v1

- **Release Slice D**
  - availability block ergonomics
  - ops dashboards
  - defaults/profiles
  - Manager Lite handoffs
  - V1 broad release

### Rollout gates
Before expanding each slice:
- transition error rate acceptable
- duplicate mutation rate low
- recommendation latency acceptable
- support burden manageable
- no violations of hard conflict or request-linkage invariants
- mobile regression checks passed

## 12. Main Risks and Mitigations

1. **Risk: V1 breaks core domain rules**
   - **Mitigation:** centralize all critical transitions and validations in shared server-side services; require invariant tests before every rollout.

2. **Risk: Recommendation output is not trusted**
   - **Mitigation:** ship explainability reason codes from day one; run shadow mode before full actionability; log accepted vs ignored recommendations.

3. **Risk: cross-midnight and service-day bugs**
   - **Mitigation:** explicit test matrix around nightlife day boundaries and local venue time; no client-side ad hoc date math.

4. **Risk: duplicate actions on mobile**
   - **Mitigation:** idempotency, disabled-in-flight UI, stale-state detection, authoritative post-action refresh.

5. **Risk: notification noise reduces usefulness**
   - **Mitigation:** bundling, de-duplication, severity tiers, preference controls, analytics on open/action rates.

6. **Risk: Manager Lite scope expands unsafely**
   - **Mitigation:** ship last; keep scoped permissions narrow; audit every action; prevent bypass of hard blockers.

7. **Risk: internal ops tools become shadow workflow systems**
   - **Mitigation:** admin surfaces read from derived views and link back to authoritative records; remediation actions remain limited and explicit.

8. **Risk: team overload from too many parallel initiatives**
   - **Mitigation:** strict wave discipline; only foundational pieces of later initiatives start early; user-visible delivery stays concentrated.

9. **Risk: additive schema sprawl degrades maintainability**
   - **Mitigation:** keep new tables/views purpose-specific, document ownership, and prune abandoned read models before general release.

## 13. Final Recommended Engineering Delivery Plan for V1

The recommended engineering path for V1 is:

1. **Start with a V1 foundation sprint**
   - central transition services
   - audit/event framework
   - derived read models
   - sync/mutation safety
   - analytics contract setup

2. **Deliver Wave 1 first**
   - Coverage Action Queue v1
   - Staffing Recommendation Panel v1
   - request orchestration core
   - pilot rollout and stabilization

3. **Use Wave 2 to make the system trustworthy**
   - finish Request Lifecycle Orchestration
   - ship Missing Info / Time TBD resolution
   - ship Conflict Explainability, Override Review, and Audit History
   - ship Notification Center v1
   - ship Availability Block ergonomics

4. **Use Wave 3 to make the system scalable and delegable**
   - Internal Ops Dashboards and exception queues
   - Reusable Booking Defaults and lightweight Venue Profiles
   - Manager Lite collaboration and safe handoffs
   - final mobile/PWA polish and broad rollout

5. **Enforce these non-negotiables throughout**
   - Booking remains the only calendar-truth object
   - Agenda remains Bookings-only
   - Coverage remains Shift-Occurrence-only
   - staffing eligibility stays private and separate from sharing visibility
   - request-linkage behavior remains exact
   - hard-conflicted items never advance to Assigned or Booked
   - notifications remain in-app first
   - V1 remains additive, realistic, and small-team executable

This is the most defensible V1 engineering sequence because it delivers the highest operator leverage first, adds workflow trust second, and only then adds delegation and operational scale.
