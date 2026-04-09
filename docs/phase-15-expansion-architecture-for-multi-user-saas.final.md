# [15] Phase - Expansion Architecture for Multi-User SaaS

## 1. Expansion Architecture Summary

AmIFree should expand into a **workspace-operated, organization-scoped, multi-user SaaS platform** without changing its core scheduling truth model.

Recommended target shape:

- **Organization** = billing, policy, compliance, and commercial tenant boundary
- **Workspace** = operational boundary and system of record for day-to-day scheduling and staffing activity
- **Team** = optional coordination layer inside a workspace for queue ownership and workload partitioning
- **Person / DJ Profile** = the schedule subject whose commitments are evaluated
- **User** = authenticated actor who can hold roles in one or more organizations or workspaces
- **Network Connection** = later-stage, explicit trust relationship between organizations that exposes restricted projections only, not raw shared ownership

Core operational truth stays workspace-owned, but conflict evaluation becomes person-centric across authorized scope through the existing normalized `schedule_commitments` surface. This allows more users, more workspaces, and later partner relationships without duplicating Bookings or weakening privacy.

Assumptions:
- Current MVP and V1 start with one primary workspace per customer business.
- Customers will grow into multi-user operations before they need true cross-organization network behavior.
- The product remains DJ-first and mobile-first, with no immediate need for per-tenant infrastructure isolation.

The expansion should be additive, not a redesign:
- keep the modular monolith
- keep Supabase / Postgres / Auth / Storage
- keep Graphile Worker
- keep current core objects and lifecycle rules
- add tenanting, memberships, scoped permissions, and projection-based collaboration around them

## 2. Expansion Principles

1. Protect schedule truth before expanding seats.
2. Keep operational writes local and make conflict visibility broader.
3. Separate people from users.
4. Use one canonical owner per operational record.
5. Use projections instead of duplication.
6. Keep permissions layered.
7. Expand configuration slowly.
8. Preserve internal versus external visibility separation.
9. Favor additive schema and API evolution.
10. Keep the architecture maintainable for a small team.

## 3. Inputs from Locked Phases

This phase is constrained by approved product, technical, and operating truths:

- DJ-first product
- mobile-first PWA
- Booking is the only calendar-truth object
- Manual Availability Blocks are separate explicit objects
- Booking Request, Shift Occurrence, and Booking remain separate
- request-linkage behavior remains exact
- lifecycle states and alert states remain separate systems
- internal staffing eligibility uses private source-of-truth schedule logic
- public share output remains restricted and is not equal to internal eligibility
- hard conflict rules remain non-bypassable for Assigned and Booked outcomes
- occurrence-capacity math remains exact
- architecture remains a TypeScript modular monolith with Next.js App Router, Supabase, Graphile Worker, and OpenAI Responses API
- notifications remain in-app first for MVP
- correctness, privacy, request-linkage integrity, and mobile usability outrank breadth

## 4. What Must Remain Invariant

### Domain invariants
- Booking remains the only calendar-truth object.
- Manual Availability Blocks remain explicit separate schedule objects.
- Booking Request, Shift Occurrence, and Booking remain separate objects.
- Shift Templates and one-off Shift Occurrences remain separate flows and objects.
- Agenda = Bookings only.
- Coverage = Shift Occurrences only.

### Request invariants
- Draft request may exist without a linked Booking.
- Sent request must create or link a Requested Booking.
- Viewed / Accepted / Declined / Withdrawn / Expired / Converted preserve the same linked request plus linked-booking path.
- Accepting a request does not create a second Booking.
- Conversion or assignment updates the existing linked Booking path.

### Conflict and staffing invariants
- internal staffing eligibility remains separate from external sharing visibility
- not shared is not not eligible
- operators cannot force-assign hard-conflicted DJs
- hard-conflicted items cannot advance to Assigned or Booked
- limited hard-conflict save remains restricted to DJ owner or Manager Lite and only for Inquiry, Hold, or Requested, with explicit reason, confirmation, and audit note

### Occurrence-capacity invariants
- `slots_needed`
- `filled_slots_count`
- `active_request_count`
- `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`
- one staffed DJ = one linked Booking
- requests are per occurrence for one slot of capacity

### Visibility invariants
- shared viewer modes remain only Busy and Busy + Region
- soft-state bookings do not hard-block assignment
- soft-state bookings do not appear in public shared busy output
- public views never become the source of truth for internal staffing logic

### Platform invariants
- modular monolith remains the recommended architecture
- notifications stay in-app first unless later layered with optional delivery channels
- AI remains review-before-save
- Intake remains Booking-only and DJ / Manager Lite only unless a later phase explicitly re-approves expansion

## 5. Expansion Goals

1. Support multiple internal users per customer with safe delegation.
2. Support organizations operating multiple cities, brands, or roster groups.
3. Support one DJ or person appearing in multiple workspaces without duplicating identity.
4. Allow conflict evaluation across authorized scope while preserving source privacy.
5. Support richer auditability, collaboration, and operational queue ownership.
6. Create a future-safe path to partner-network workflows without creating second Bookings.
7. Preserve small-team implementation feasibility.
8. Keep schema, APIs, and QA evolution manageable.

## 6. Future Organizational / Tenant Model

### Platform layer
Global platform concerns:
- auth identities
- feature flags
- internal support controls
- system jobs
- global abuse and security controls

This layer should not directly own customer scheduling truth.

### Organization
The Organization becomes the primary SaaS tenant.

It should own:
- billing and subscription
- organization-level policies
- organization settings
- organization-level people registry
- workspace catalog
- org-wide audit and membership controls

Recommended tables:
- `organizations`
- `organization_memberships`
- `organization_settings`

### Workspace
The Workspace remains the operational system-of-record boundary.

It should own:
- Bookings
- Booking Requests
- Manual Availability Blocks
- Shift Templates
- Shift Occurrences
- workspace queues
- workspace activity streams
- workspace roles and delegation

Recommended additive metadata on operational tables:
- `organization_id`
- `workspace_id`
- `created_by_user_id`
- `updated_by_user_id`

### Team
Teams are optional subgroups inside a workspace.

Use them for:
- queue ownership
- territory or city partitioning
- staffing lanes
- manager scopes
- assignment routing

Teams should not become a separate tenant.

### Person / DJ Profile
A Person record represents the schedule subject.

It should support:
- DJs without logins
- DJs with logins
- managed talent with delegates
- one person attached to multiple workspaces

Recommended tables:
- `people`
- `person_user_links`
- `workspace_roster_memberships`

### Network Connection
A Network Connection is a later-stage link between organizations.

It should allow:
- restricted availability or request collaboration
- partner staffing lanes
- projection-based interaction

It should not allow:
- shared raw record ownership
- direct cross-org editing of source Bookings
- second Booking creation for the same engagement

### Tenancy recommendation
Use shared-database row-scoped multi-tenancy.

Rules:
- every customer-owned row has `organization_id`
- every operational row also has `workspace_id`
- RLS is enforced in Postgres for row access
- server-side domain services enforce business rules
- indexes should be built around `(organization_id, workspace_id, state, service_day)` and person-centered conflict lookups

## 7. Multi-User Role Evolution

Use role bundles plus scoped grants, not a full custom permission builder.

### Organization roles
- Org Owner
- Org Admin
- Billing Admin later if needed

### Workspace roles
- Workspace Admin
- Staffing Manager
- Operator
- Manager Lite
- DJ Member
- Read-Only Internal Viewer

### Scoped grants
Add narrow grants such as:
- `manage_person_schedule`
- `respond_to_requests_for_person`
- `manage_public_share_for_person`
- `manage_team_coverage`
- `manage_roster_memberships`
- `review_ai_intake`
- `view_audit_details`

Critical rule: no role, including Org Owner or Workspace Admin, bypasses Booking-only calendar truth, request-linkage rules, hard-conflict advancement rules, occurrence-capacity math, or public visibility restrictions.

## 8. Ownership and Data Boundary Model

### Canonical ownership rules
- A Booking is owned by exactly one workspace and one organization and references exactly one schedule-owner person.
- A Booking Request is owned by exactly one workspace and preserves one canonical linked-booking path.
- A Manual Availability Block is owned by exactly one workspace and references exactly one person.
- A Shift Template or Shift Occurrence is owned by exactly one workspace and remains a demand-side staffing object, not a calendar-truth object.

### Data boundary layers
1. Full internal source detail
2. Internal conflict surface
3. Public share surface

Full internal source detail is only visible to users with source-workspace or scoped record rights.

Internal conflict surface may include time window, service day, conflict type, hard or soft block classification, and limited region metadata if policy allows. It should not expose full client or private details by default.

Public share surface may include only Busy or Busy + Region and nothing more.

Key design decision: conflict visibility becomes person-centric, but source detail remains workspace-scoped.

## 9. Permission and Access Evolution

Every action should pass all four layers:
1. Membership check
2. Role bundle check
3. Resource scope check
4. Domain guard check

Implementation recommendation:
- keep authorization in a central policy layer in server code
- mirror row visibility in Postgres RLS
- do not rely on UI hiding as access control
- log all high-risk actions

High-risk actions requiring audit:
- manual conflict-override saves where allowed
- public share creation or policy changes
- roster membership changes
- request conversion or assignment actions
- status changes on Booking, Request, or Occurrence-linked workflows
- scoped grant changes

What not to do:
- no free-form customer-defined policy scripting
- no arbitrary custom role designer in early stages
- no permission decisions in async jobs without re-validation

## 10. Collaboration Model Expansion

Safe collaboration expansion includes:
- shared queues
- internal comments and mentions
- structured handoffs
- watch and follow states
- approval overlays as separate workflow metadata
- optimistic concurrency and updated-since-opened warnings

Collaboration should wrap operational records, not redefine them.

## 11. Workspace / Organization / Network Relationship Model

Recommended model:
- Organization = top-level customer container
- Workspace = operational unit inside an organization
- Team = optional sub-unit inside a workspace
- Person = organization-level identity that can be rostered into one or more workspaces
- Network Connection = explicit link between organizations for partner collaboration

Rules:
1. A user can belong to multiple organizations.
2. A user can hold different roles in different workspaces.
3. A person can belong to multiple workspaces through roster memberships.
4. A person should usually have one primary or home workspace for defaults, but not exclusive identity ownership.
5. A Booking belongs to one workspace only, even if visible elsewhere in restricted form.
6. A Team never spans multiple workspaces.
7. A Network Connection never merges tenant ownership.

Recommended join model:
- `organization_memberships`
- `workspace_memberships`
- `workspace_roster_memberships`
- `team_memberships`
- `network_connections`
- `network_access_policies`

## 12. Safe Expansion Paths by Product Area

### Bookings
Safe:
- multi-user editing and ownership metadata
- team routing and queue ownership
- approval overlays
- richer venue or profile linkage
- workspace or org reporting views
- restricted cross-workspace projections

Protected:
- Booking remains the only calendar-truth object
- no generic event object replaces it
- no second Booking is created for cross-workspace or cross-org collaboration
- Agenda remains Booking-only

### Manual Availability Blocks
Safe:
- reusable patterns
- templates or presets
- better mobile creation flows
- scoped delegate management
- organization-aware conflict contribution for authorized staffing logic

Protected:
- remain explicit separate objects
- remain distinct from Bookings
- cannot be saved over Assigned or Booked Bookings
- do not become hidden metadata on the person record

### Booking Requests
Safe:
- batch send
- reminder nudges
- delegated responders
- richer expiration controls
- team queue routing
- later network-routed request surfaces

Protected:
- exact request-linkage behavior remains unchanged
- Sent request must create or link a Requested Booking
- Accepting a request does not create a second Booking
- routing to another workspace or org does not create a second request or booking chain

### Shift Templates and Occurrences
Safe:
- team-owned coverage lanes
- city or brand tagging
- improved recurrence controls
- capacity dashboards
- batch staffing actions
- roster suggestions within scope

Protected:
- templates and one-off occurrences remain separate flows
- occurrences remain demand-side objects, not calendar-truth
- Coverage remains Occurrence-only
- occurrence-capacity math stays exact

### Staffing Eligibility and Assignment
Safe:
- recommendation scoring
- preference matching
- team or region filters
- skill or certification filters
- manager scopes
- cross-workspace authorized search within org
- later network-aware candidate surfaces

Protected:
- internal staffing eligibility remains private source-of-truth logic
- public sharing is never the eligibility source
- hard-conflicted items cannot advance to Assigned or Booked
- operators cannot force-assign hard-conflicted DJs

### Sharing and Public View
Safe:
- multiple share links per person
- expirable links
- branded share surfaces
- analytics on share usage
- temporary event-specific links

Protected:
- external modes remain only Busy or Busy + Region
- no detailed Booking, Occurrence, Request, or Block disclosure
- no source workspace or client details in public output

### Intake and AI Review
Safe:
- multi-reviewer queues
- confidence flags
- structured extraction improvements
- reusable review presets
- manager assignment of draft review work

Protected:
- review-before-save
- Booking-only staging
- no autonomous Booking creation
- MVP and V1 intake remains DJ / Manager Lite only unless explicitly re-approved later

Deferred later:
- broader role entry into intake
- non-booking intake objects
- autonomous AI actions
- external intake as a primary workflow

### Notifications and Activity Logs
Safe:
- in-app notification center maturation
- granular subscriptions and watch states
- digest email later as optional delivery, not source of truth
- org and workspace activity streams
- richer audit diffs and actor history

Protected:
- notifications are secondary workflow aids
- activity logs do not replace domain state
- key workflow mutations remain fully auditable

## 13. Migration Path from MVP / V1 to Multi-User SaaS

### Phase A: Add organizational envelope
Add:
- `organizations`
- `organization_memberships`
- `organization_id` to all existing customer-owned tables
- default organization creation for each current customer or workspace set

### Phase B: Separate person identity from user identity
Add:
- `people`
- `person_user_links`
- `workspace_roster_memberships`

### Phase C: Harden workspace ownership and policy checks
Add or verify:
- `workspace_id` on all operational objects
- strict RLS by org or workspace membership
- central server-side policy checks
- optimistic concurrency on sensitive records

### Phase D: Introduce layered visibility surfaces
Implement:
- source-detail visibility
- internal conflict-surface visibility
- public share visibility

### Phase E: Add teams and scoped grants
Add:
- `teams`
- `team_memberships`
- scoped grants for person, team, or workspace responsibilities

### Phase F: Enable multi-workspace org behavior
Add:
- workspace switching
- org-level roster registry
- controlled cross-workspace staffing visibility
- workspace-level queue ownership and reporting

### Phase G: Add cross-org network projections later
Add:
- `network_connections`
- `network_access_policies`
- remote request or action projections

Rollout method:
- additive migrations
- backfills
- feature flags by organization
- shadow-read validation for conflict logic
- audit-first rollout for high-risk actions

Required migration QA gates:
- request-linkage integrity
- occurrence-capacity integrity
- public share output consistency
- RLS isolation
- audit completeness
- mobile workflow parity

## 14. Recommended Expansion Stages

1. Single-Workspace Multi-User Hardening
2. Multi-Workspace Organization
3. Shared Roster plus Cross-Workspace Staffing
4. Collaboration and Governance Maturity
5. Cross-Organization Network Links

Deferred until clearly needed:
- per-tenant database isolation
- custom role builder
- workflow-email-first design
- external calendar truth
- marketplace or discovery
- payments or invoicing
- autonomous AI scheduling actions

## 15. Main Risks and Failure Modes

1. Cross-tenant data leakage
2. Privacy leakage through staffing visibility
3. Duplicate schedule truth
4. Request-linkage breakage during remote workflows
5. Occurrence-capacity drift
6. Permission sprawl
7. Operational complexity outrunning product clarity
8. Async side effects creating hidden state drift
9. Support or admin backdoors weakening trust

Mitigations should center on strict RLS, central authorization, projection-based collaboration, transactional assignment logic, idempotent async jobs, immutable audit events, and least-privilege support tooling.

## 16. What Explicitly Should Not Change

- Booking should not stop being the only calendar-truth object.
- Manual Availability Blocks should not be collapsed into Booking metadata.
- Booking Request and Booking should not be merged into one object.
- Shift Occurrence should not become a Booking substitute.
- Agenda and Coverage should not be merged into one generic schedule screen.
- Public sharing should not expose more than Busy or Busy + Region.
- Public share output should not become internal eligibility logic.
- Operators should not gain the ability to force-assign hard-conflicted DJs.
- Hard-conflicted items should not be allowed to advance to Assigned or Booked.
- The approved occurrence-capacity model should not be replaced.
- Intake should not become autonomous AI Booking creation.
- Notification delivery should not become the workflow source of truth.
- Expansion should not require a microservice rewrite.
- Cross-workspace or cross-org collaboration should not create cloned Bookings.
- Support or operations convenience should not override locked product truths.

## 17. Final Recommended Expansion Architecture for Multi-User SaaS

AmIFree should evolve into a **shared-database, organization-scoped, workspace-operated SaaS platform** with this final shape:

1. Organization becomes the tenant boundary.
2. Workspace remains the operational truth boundary.
3. Person / DJ profiles become first-class and separate from users.
4. Conflict evaluation becomes person-centric across authorized scope.
5. Permissions use role bundles plus scoped grants.
6. Cross-workspace and cross-org collaboration use projections, not duplicated truth.
7. Teams are a coordination layer, not a new tenant.
8. The system expands in stages.
9. The modular monolith stays.
10. The protected product truths do not move.

This is the safest and most realistic path for turning AmIFree from a strong DJ-first MVP and V1 product into a scalable multi-user SaaS platform without breaking the scheduling and staffing model that makes the product valuable.
