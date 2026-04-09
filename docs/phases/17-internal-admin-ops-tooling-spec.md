# [17] Phase - Internal Admin & Ops Tooling Spec

## 1. Internal Admin & Ops Tooling Summary

AmIFree Scheduler should ship **one internal operations console** inside the same product codebase and deployment boundary as the main app, not a separate back-office product. It should live behind separate internal auth, permission gates, audit rules, and production safety controls, and it should be built as a **read-first, limited-write** system for support, operations, QA, and engineering.

The internal tooling goal is not broad admin CRUD. Its goal is to let the team:

- inspect source-of-truth records safely
- understand why the product is behaving the way it is
- contain privacy and operational incidents
- retry safe automations
- resolve supported operational exceptions
- support launch, stabilization, and V1 delivery without creating shadow workflows

### Recommended shape

Build a single internal console with these modules:

1. Case and identity
2. Booking and scheduling diagnostics
3. Requests, staffing, and eligibility diagnostics
4. Sharing and privacy controls
5. Intake and automation diagnostics
6. Audit and exception operations

### Assumptions

- External customer support intake may remain in an existing helpdesk, inbox, or lightweight manual process at launch. The internal console is **not** a replacement CRM or full helpdesk.
- The internal console uses the approved stack: **Next.js App Router + TypeScript modular monolith + Supabase + Graphile Worker**.
- All production mutations from internal tooling go through the same domain commands and validation rules as product workflows, plus extra audit and step-up safety.
- Launch volume is small enough that **single-record operations** are sufficient for MVP and early V1. Bulk tooling can wait.

### Core recommendation

Ship a minimal but strong internal console that is:

- **deep on inspection**
- **narrow on writes**
- **strict on audit**
- **clear about source vs derived**
- **safe under multi-user SaaS growth**

---

## 2. Tooling Principles

1. **Read-first, write-last.**  
   Default internal access should be read-only. Production writes should exist only where they are operationally necessary.

2. **No shadow truth.**  
   Internal tooling must not become a parallel product where staff hand-edit lifecycle state, counters, linkage, or schedule facts outside domain rules.

3. **Source before derived.**  
   If derived surfaces look wrong, operators inspect and repair the source record or replay approved derivation jobs. They do not hand-edit projections.

4. **Same invariants as product.**  
   Internal tools must enforce the same truths:
   - Booking is the only calendar-truth booking object
   - Manual Availability Blocks are separate schedule objects
   - Request, Occurrence, and Booking remain separate
   - Agenda is bookings only
   - Coverage is occurrences only
   - hard-conflicted items cannot advance to Assigned or Booked
   - request linkage remains one linked request + one linked booking path

5. **Internal eligibility is private logic.**  
   Staffing eligibility must be shown from the private source-of-truth schedule model and must remain separate from public sharing visibility.

6. **Containment beats convenience.**  
   Privacy and operational incidents need quick containment actions such as disabling sharing, revoking sessions, or pausing jobs. They do not justify broad data-edit powers.

7. **Single-object precision over bulk admin convenience.**  
   For launch and V1, optimize for safe diagnosis and small, auditable actions on one object at a time.

8. **Every consequential internal action is audited.**  
   Mutations, retries, queue controls, privacy actions, role changes, and break-glass actions all need durable audit records with actor, reason, scope, and outcome.

9. **Workspace and org boundaries matter.**  
   Internal tools must scale to the approved Org / Workspace / Team / Person model without requiring a redesign.

10. **Do not overbuild.**  
    A small team should avoid building a giant admin platform. Ship the minimum surfaces that directly support live operations and V1 delivery.

---

## 3. Inputs from Locked Phases

This tooling spec is constrained by the following locked truths:

- **Product shape**
  - DJ-first
  - mobile-first web app / PWA
  - notifications are in-app first
  - workflow email is not a required launch dependency

- **Scheduling truth**
  - Booking is the only calendar-truth booking object
  - Manual Availability Blocks are explicit schedule objects
  - service day is separate from timestamp
  - cross-midnight work belongs visually to starting nightlife day

- **Lifecycle truth**
  - Booking lifecycle states and alert states are separate systems
  - hard conflict and possible conflict are not booking states
  - hard-conflicted items cannot reach Assigned or Booked

- **Request linkage truth**
  - a sent request must create or link a Requested Booking
  - accepting a request must not create a second Booking
  - viewed / accepted / declined / withdrawn / expired / converted preserve the same path
  - internal tooling must never relink this path manually

- **Staffing and occurrence truth**
  - Shift Templates and Shift Occurrences are separate objects and flows
  - occurrence capacity uses approved multi-slot model
  - `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`
  - one staffed DJ = one linked Booking

- **Visibility truth**
  - public sharing exposes only:
    - Busy
    - Busy + Region
  - public share output is not the same as internal staffing eligibility
  - soft bookings do not hard-block assignment and do not appear in shared busy output

- **Technical truth**
  - TypeScript modular monolith
  - Next.js App Router PWA
  - Supabase Postgres/Auth/Storage
  - Graphile Worker
  - OpenAI Responses API for extraction
  - `schedule_commitments` is a normalized overlap surface

- **Support and ops truth**
  - trust, privacy, and correctness matter more than speed
  - support must not rewrite booking truth, relink requests, force assignments, or hand-edit derived counters
  - every consequential internal action must be explicitly audited

- **Expansion truth**
  - Org = tenant / billing / policy boundary
  - Workspace = operational system-of-record boundary
  - Team = optional coordination layer
  - Person / DJ profile becomes first-class later
  - permissions evolve through role bundles + scoped grants

- **V1 delivery truth**
  - internal tooling must support coverage actioning, request orchestration, missing info resolution, conflict explainability, availability ergonomics, performance stabilization, in-app notification operations, ops dashboards, reusable defaults, and Manager Lite handoffs

---

## 4. Internal User Personas

### support / ops generalist

**Primary goal:** resolve customer-reported issues safely without weakening product invariants.

**Needs:**
- reliable object lookup
- read access to booking, request, shift, sharing, and intake state
- clear explanation of what is happening
- a narrow set of safe actions:
  - disable or rotate share links
  - retry safe jobs
  - resend in-app notifications
  - add case notes
  - escalate

**Must not have:**
- direct lifecycle edits
- request relinking
- forced assignment
- direct counter edits
- broad role escalation

### product / ops owner

**Primary goal:** operate live workflows, own operational correctness, and handle approved production interventions.

**Needs:**
- everything support sees
- queue ownership and exception triage
- limited domain actions such as:
  - pause / resume templates
  - approved request terminal actions
  - scoped role and membership changes
  - privacy containment actions
  - controlled recompute/reconciliation triggers

**Must not have:**
- invisible edits outside audited commands
- unrestricted database-style admin powers

### on-call engineer

**Primary goal:** contain incidents, diagnose automation failures, and repair system behavior without corrupting business truth.

**Needs:**
- worker and job controls
- payload diagnostics
- failure clustering
- replay / retry tools for idempotent jobs
- queue pausing
- derivation health visibility
- links from jobs to affected objects
- access to engineering-only scripts outside the internal console when true repair is required

**Must not have through standard UI:**
- arbitrary direct SQL mutation
- hidden edits to business records
- silent bypass of audit rules

### QA / release owner

**Primary goal:** verify production and staging behavior, assess release impact, and confirm fixes safely.

**Needs:**
- read access to booking/request/shift/share/intake state
- audit trails
- deployment-correlated job and exception views
- ability to compare expected vs actual domain outcomes
- strong staging tools; very limited or no production writes

**Must not have in production:**
- direct data surgery
- user impersonation by default
- hidden admin changes used as “testing”

---

## 5. Must-Have Tooling for Launch and Stabilization

These are the minimum internal surfaces needed to run launch and early stabilization safely.

### A. Internal console foundation

Must ship first:

- internal auth and role-based access control
- environment banners and production danger states
- global lookup across:
  - user email
  - booking ID
  - request ID
  - shift template ID
  - shift occurrence ID
  - intake draft ID
  - extraction job ID
  - worker job ID
  - share token / share ID
  - audit request ID
- workspace / org scoping on every page
- append-only audit middleware
- object timeline panel showing source changes, derived refreshes, notifications, and job activity
- reason-required mutation framework
- step-up confirmation for sensitive actions

### B. Core launch modules

Must exist for launch/stabilization:

- support ticket console
- account / role viewer
- booking inspector
- manual availability block viewer
- request-linkage inspector
- shift occurrence / template inspector
- eligibility and conflict viewer
- sharing preview and control tool
- intake draft / extraction job console
- worker / job dashboard
- audit log viewer
- minimal internal ops dashboards / exception queues

### C. Minimum write actions at launch

Allowed at launch if implemented through audited domain commands:

- add internal case notes
- retry idempotent jobs
- resend in-app notifications
- disable / rotate share links
- revoke user sessions for security containment
- pause / resume shift templates
- trigger approved recompute/reconciliation jobs
- acknowledge / assign exception queue items

### D. Launch actions that should stay blocked

Blocked at launch:

- direct booking field edits
- direct request state flips in storage
- direct request relinking
- direct block create/edit/delete in production
- direct lifecycle changes outside product/domain commands
- direct edits to `schedule_commitments`
- direct edits to occurrence counters
- bulk mutation tools
- impersonation
- internal “force assign” action

---

## 6. Must-Have Tooling for V1 Operations

V1 does not require a broader admin platform. It requires deeper operational tooling around the approved V1 feature set.

### V1 operational additions

1. **Coverage action queue**
   - queue of unfilled or at-risk occurrences
   - quick jump into occurrence, linked requests, and eligibility diagnostics
   - staffing recommendation explainability links
   - no hidden assignment overrides

2. **Request lifecycle operations**
   - read model for each request and its booking path
   - safe terminal actions where business rules permit
   - notification and expiry diagnostics
   - invariant checker for “one request / one booking path”

3. **Missing Info / Time TBD queue**
   - queue of bookings needing structured resolution
   - source fields, validation gaps, last outreach, suggested next step
   - no silent field edits from the queue

4. **Conflict explainability panel**
   - hard vs possible conflict reasoning
   - underlying source commitments
   - service-day and timezone calculations
   - override-note visibility where allowed by product rules

5. **Availability ergonomics diagnostics**
   - clearer visibility into block patterns, overlap outcomes, and public-share effects
   - still no broad production block editing UI unless explicitly approved later

6. **Notification diagnostics**
   - in-app notification event history by object
   - user preference state
   - retry / replay for safe notification jobs

7. **Manager Lite handoff visibility**
   - membership and scope viewer
   - handoff audit history
   - safe role and access review tools

8. **Defaults and venue profile provenance**
   - explain where reusable defaults came from
   - show what was applied to a booking
   - avoid silent background mutation

9. **Richer ops dashboards**
   - state backlog, queue aging, failure classes, exception trends
   - production use, not BI overreach

---

## 7. Later / Conditional Tooling

These should remain later or conditional unless volume, compliance, or support burden proves they are necessary.

- user impersonation with explicit consent and full-screen banner
- bulk admin actions with dry-run and rollback guardrails
- internal feature flag console
- self-serve data export / redaction / DSR tooling
- advanced notification campaign tooling
- broad CSV import/export operations
- queue backfill runners for large scopes
- visual schema repair tools
- multi-tenant org admin matrix with delegated internal support scopes
- advanced BI builder and custom report authoring
- external helpdesk deep integration if manual case linking becomes too slow

These are not launch or baseline V1 requirements.

---

## 8. Tool-by-Tool Spec

## support ticket console

**Primary users:** support / ops generalist, product / ops owner

**Purpose:**  
A lightweight internal case workspace that ties an external or manual support ticket to the actual product objects involved.

**Must show:**
- case ID and source channel
- reporter identity
- org / workspace / person context
- linked objects:
  - booking
  - request
  - shift occurrence / template
  - intake draft
  - share link
  - user account
- recent relevant timeline across those objects
- current alerts and exception flags
- internal notes
- escalation state and owner

**Allowed actions:**
- create or update internal case note
- set severity
- assign case owner
- link or unlink internal objects to the case
- escalate to product / ops owner or on-call engineer
- launch safe actions from linked tools

**Forbidden actions:**
- editing source business objects from the case screen
- closing domain issues by changing raw state on the ticket
- using case notes as a replacement for product-state changes

**Delivery tier:** launch must-have

**Implementation note:**  
This should be a light case console, not a full helpdesk rebuild.

## account / role viewer

**Primary users:** support / ops generalist, product / ops owner

**Purpose:**  
Inspect identity, access, and membership without exposing secrets.

**Must show:**
- user identity and account status
- auth provider and last sign-in metadata
- active memberships by org / workspace / team
- role bundle assignments
- Manager Lite relationships where applicable
- session list
- linked Person / DJ projection once introduced
- recent access-related audit events

**Allowed actions:**
- revoke active sessions for security reasons
- product / ops owner can grant or revoke approved role bundles within permitted scope
- attach internal note or incident reference to access changes

**Forbidden actions:**
- view passwords or secrets
- impersonate user
- assign arbitrary hidden roles
- move data between workspaces by changing membership
- silent elevation to broader tenant scope

**Delivery tier:** launch read-heavy; V1 adds limited scoped role changes

## booking inspector

**Primary users:** support / ops generalist, product / ops owner, QA / release owner

**Purpose:**  
Single source view of a booking and its operational history.

**Must show:**
- booking core fields
- lifecycle state
- alert states
- venue-local start/end time
- service day
- timezone and UTC reference
- cross-midnight rendering context
- linked request if one exists
- linked shift occurrence if relevant
- schedule_commitment references
- public-share contribution status
- internal notes
- audit timeline
- related in-app notifications
- agenda-context preview using bookings-only rules

**Allowed actions:**
- add internal note
- trigger approved derived-surface recompute from source
- resend in-app notification where applicable
- open linked request / occurrence / sharing views

**Forbidden actions:**
- direct field edit
- direct lifecycle mutation outside domain command
- force transition to Assigned or Booked under hard conflict
- editing `schedule_commitments`
- delete booking from UI

**Delivery tier:** launch must-have

## manual availability block viewer

**Primary users:** support / ops generalist, product / ops owner, QA / release owner

**Purpose:**  
Inspect manual schedule blocks as first-class objects separate from bookings.

**Must show:**
- block source fields
- owner / workspace
- local start/end
- service day implications
- status
- source actor
- overlap diagnostics against Assigned / Booked bookings
- schedule_commitment references
- public-share contribution status
- linked audit events

**Allowed actions:**
- add internal note
- trigger approved recompute if derived projections are stale
- open related eligibility or sharing views

**Forbidden actions:**
- create, edit, or delete production blocks from the internal UI at launch
- save over Assigned or Booked bookings
- convert block into booking
- bypass validation rules

**Delivery tier:** launch read-only must-have

**Recommendation:**  
Keep block mutations out of internal tooling until product-level ergonomics and permission rules are proven.

## request-linkage inspector

**Primary users:** support / ops generalist, product / ops owner, on-call engineer

**Purpose:**  
Protect the exact request-to-booking path and make it debuggable.

**Must show:**
- request record
- linked booking record
- linked occurrence / staffing context when relevant
- request lifecycle timeline:
  - Draft
  - Sent
  - Viewed
  - Accepted
  - Declined
  - Withdrawn
  - Expired
  - Converted
- invariant status:
  - linked booking exists
  - same workspace
  - no duplicate booking path
  - no orphaned sent request
- expiry job status
- notification history
- actor/system event history

**Allowed actions:**
- retry idempotent orchestration jobs
- rerun invariant checks
- resend in-app notifications
- V1 only: execute approved terminal actions through the same domain commands, with reason and confirmation

**Forbidden actions:**
- relink request to another booking
- create a second booking for the same accepted path
- directly edit raw linkage fields
- manually mark a request accepted / converted in storage

**Delivery tier:** launch must-have; V1 gains limited domain actions

## shift occurrence / template inspector

**Primary users:** support / ops generalist, product / ops owner, QA / release owner

**Purpose:**  
Inspect coverage truth separately from bookings and make occurrence capacity debuggable.

**Must show:**
- template fields:
  - service_day_weekday
  - active_start_date
  - active_end_date
  - local_start_time
  - local_end_time
  - timezone
  - slots_needed
  - lifecycle
- preview logic for generated occurrences
- generated occurrence list
- per-occurrence fields
- linked bookings by slot
- request counts
- derived counters including:
  - filled_slots_count
  - active_request_count
  - open_slots_count
- displayed formula:
  - `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`
- pause / resume history
- coverage-context preview using occurrences-only rules

**Allowed actions:**
- product / ops owner can pause template
- product / ops owner can resume template
- trigger safe future-occurrence regeneration inside allowed range without duplication
- trigger counter reconciliation from linked source records

**Forbidden actions:**
- hand-edit counters
- direct slot fabrication
- force staffing over hard conflict
- mutate historical generated occurrences in unsupported ways
- edit template fields outside domain commands

**Delivery tier:** launch must-have

## eligibility and conflict viewer

**Primary users:** support / ops generalist, product / ops owner, QA / release owner

**Purpose:**  
Explain staffing eligibility and conflicts using internal source-of-truth schedule logic.

**Must show:**
- candidate DJ / person
- target booking or occurrence
- all relevant source commitments
- hard conflict reasons:
  - Assigned bookings
  - Booked bookings
  - active Manual Availability Blocks
- possible conflict reasons:
  - Inquiry
  - Hold
  - Requested
- service-day and timezone calculations
- overlap windows
- “not shared” vs “not eligible” distinction
- public-share preview side by side
- limited hard-conflict save history for Inquiry / Hold / Requested where product permits
- audit trail for override reason and confirmation

**Allowed actions:**
- rerun explanation
- copy/share diagnostic explanation internally
- add internal review note

**Forbidden actions:**
- mark someone eligible manually
- force assign hard-conflicted DJ
- alter sharing settings to influence internal eligibility
- hide source commitments from the view

**Delivery tier:** launch read-only; V1 deepens explainability

## sharing preview and control tool

**Primary users:** support / ops generalist, product / ops owner

**Purpose:**  
Preview exactly what the external viewer sees and allow fast privacy containment.

**Must show:**
- sharing enabled / disabled state
- share mode:
  - Busy
  - Busy + Region
- token / link metadata
- current interval preview as external viewer sees it
- region string where applicable
- source contributions to shared busy output
- distinction between shared busy and private staffing logic
- recent share-related audit events

**Allowed actions:**
- disable sharing immediately
- rotate share token/link
- product / ops owner can change between approved modes
- regenerate share projection
- add privacy case note

**Forbidden actions:**
- expose booking names, venues, notes, or private metadata externally
- create any third sharing mode
- include Inquiry / Hold / Requested in public busy output
- use sharing visibility as an eligibility control

**Delivery tier:** launch must-have

## intake draft / extraction job console

**Primary users:** support / ops generalist, product / ops owner, on-call engineer

**Purpose:**  
Debug AI-assisted intake while preserving review-before-save.

**Must show:**
- intake draft record
- submitting user and workspace
- uploaded artifacts
- extraction job state
- structured extraction summary
- validation errors
- review status
- linked staged or created booking path if applicable
- parser / model failure details
- quarantine / retention state
- related worker jobs
- audit and notification history

**Allowed actions:**
- retry extraction
- cancel stuck extraction
- rerun validation
- quarantine artifact
- purge temporary artifact per policy
- resend nudges to complete review
- reopen draft if the product workflow allows it

**Forbidden actions:**
- create booking without review-before-save
- invisibly edit extracted fields
- bypass DJ / Manager Lite intake scope
- move draft across user or workspace boundaries

**Delivery tier:** launch must-have

## worker / job dashboard

**Primary users:** on-call engineer, product / ops owner

**Purpose:**  
Operate async jobs safely and diagnose failures by object and job class.

**Must show:**
- queue health
- backlog
- age
- retry counts
- failure rates by class
- dead/stuck jobs
- payload summaries
- linked object IDs
- environment and release version correlation
- replay history
- idempotency classification by job type

**Allowed actions:**
- retry idempotent jobs
- cancel duplicate jobs
- pause / resume queue classes
- trigger scoped replay with caps and confirmation
- rerun approved projection rebuilds

**Forbidden actions:**
- edit payload inline
- run arbitrary SQL
- mass replay non-idempotent jobs from UI
- bypass rate limits or scope caps
- mutate source records through the queue dashboard

**Delivery tier:** launch must-have

## audit log viewer

**Primary users:** product / ops owner, on-call engineer, QA / release owner, support read access as needed

**Purpose:**  
Provide a trustworthy append-only record of consequential actions and system transitions.

**Must show:**
- actor
- actor type
- action class
- object type and object ID
- org / workspace scope
- timestamp
- before / after summary
- reason
- case ID or incident ID
- request ID
- result status
- source surface
- auth/security metadata where relevant

**Allowed actions:**
- filter
- view
- export filtered results for authorized users

**Forbidden actions:**
- edit
- delete
- suppress
- backfill reasons after the fact without an additional audit entry

**Delivery tier:** launch must-have

## internal ops dashboards / exception queues

**Primary users:** support / ops generalist, product / ops owner, on-call engineer

**Purpose:**  
Turn recurring operational failures into visible queues without turning queues into source truth.

**Must show at launch:**
- extraction failures
- request invariant violations
- stuck or repeatedly failing worker jobs
- sharing/privacy exceptions
- template generation gaps
- stale derived projections
- bookings with Missing Info
- bookings with Time TBD

**Should show by V1:**
- coverage risk queue
- unfilled or aging occurrences
- notification delivery failures
- repeated hard-conflict save reviews
- manager handoff exceptions
- defaults/venue-profile application anomalies

**Allowed actions:**
- acknowledge
- assign owner
- snooze
- open linked underlying object
- trigger safe reconciliation or retry
- add resolution note

**Forbidden actions:**
- mark business issue “fixed” by editing queue status alone
- mutate source domain fields directly from queue rows
- hide privacy or security incidents without explicit audit trail

**Delivery tier:** launch minimal; V1 enriched

---

## 9. Allowed Internal Actions vs Forbidden Internal Actions

### Allowed internal actions

These are acceptable if they are permission-gated, audited, and use approved domain or ops commands.

- read source records and derived records
- attach internal notes to cases and objects
- assign case or queue ownership
- revoke active sessions
- grant or revoke approved scoped role bundles
- disable or rotate public share links
- resend in-app notifications
- retry idempotent jobs
- pause or resume queue classes
- rerun invariant checks
- trigger projection rebuilds and reconciliation jobs
- pause or resume shift templates
- execute approved request terminal actions through domain commands
- quarantine temporary intake artifacts
- export filtered audit data for authorized roles

### Forbidden internal actions

These must remain blocked from standard internal tooling.

- direct SQL-like editing of business records from UI
- direct booking lifecycle rewrites outside domain commands
- relinking request paths
- creating a second booking for an existing request path
- hand-editing `schedule_commitments`
- hand-editing `filled_slots_count`, `active_request_count`, or `open_slots_count`
- force assigning hard-conflicted DJs
- making soft bookings appear in public shared busy output
- editing Manual Availability Blocks in ways the product does not allow
- bypassing review-before-save for intake
- editing audit logs
- password access
- invisible impersonation
- unrestricted bulk mutations
- changing org/workspace boundaries as a data-repair shortcut

### Engineering-only actions

These are valid operational tools, but they should remain outside normal internal ops UI and require code review, incident handling, or migration process.

- schema changes
- data migrations
- one-off repair scripts
- broad historical backfills
- unsafe or non-idempotent replay jobs
- raw database repair
- emergency feature/config switches if they exist outside this tooling scope

---

## 10. Permission and Audit Model for Internal Tooling

## Permission model

Use **role bundles + scoped grants**, aligned with the approved multi-user SaaS direction.

### Internal role bundles

**support_generalist**
- broad read access across linked operational objects
- case-note and queue triage rights
- safe retries
- share disable / rotate
- no role editing
- no template mutation except read

**ops_owner**
- all support rights
- scoped role changes
- template pause / resume
- approved request terminal actions
- reconciliation triggers
- privacy containment
- queue ownership and policy-level operations

**engineer_oncall**
- deep diagnostics
- worker and job controls
- replay/retry controls
- queue pause/resume
- derivation rebuild tools
- no business access escalation unless separately granted

**qa_release**
- broad read in prod
- stronger write/test powers in non-prod
- production writes generally blocked

### Scope model

Permissions should apply at one of these scopes:

- global internal
- org
- workspace
- team
- object-level override only where explicitly needed

Default to the narrowest scope possible. Support staff should not browse cross-tenant production data casually.

## Audit model

Every consequential action must write an append-only audit event with:

- actor user ID
- effective role bundle
- scope
- object type and object ID
- action name
- reason text
- case ID or incident ID
- request ID
- before summary
- after summary
- outcome
- timestamp
- environment
- step-up confirmation flag when applicable

### Actions that always require reason text

- share disable / rotate
- session revoke
- role change
- template pause / resume
- request terminal action
- queue pause / resume
- replay / reconciliation trigger
- artifact quarantine / purge
- any break-glass action

### Actions that require step-up confirmation

- privacy containment actions
- role changes
- queue-wide controls
- template lifecycle changes
- artifact purge
- any action affecting many downstream objects

---

## 11. Source-of-Truth vs Derived-Surface Rules

## Source-of-truth records

These are canonical records and must be treated as such:

- Bookings
- Manual Availability Blocks
- Booking Requests
- Shift Templates
- Shift Occurrences
- Intake Drafts
- share configuration records
- memberships and role assignments
- audit records
- system job records where they represent actual operational execution state

## System-managed derived surfaces

These are useful and operationally necessary, but not human-editable truth:

- `schedule_commitments`
- agenda timeline views
- coverage timeline views
- eligibility calculations
- conflict flags
- public share interval projections
- queue membership and exception flags
- search indexes
- notification projections/status views
- staffing counters and rollups when materialized
- recommendation panels and explainability summaries

## Rules

1. Internal tools should show **source and derived side by side** when it helps diagnosis.
2. If source and derived disagree, the UI must say so explicitly.
3. Operators repair the source record or rerun approved derivation jobs.
4. Operators do not hand-edit derived tables or counters.
5. Queue rows are **pointers to work**, not truth.
6. `schedule_commitments` is a normalized overlap surface and must remain system-managed.
7. Public sharing projections must be rebuilt from approved source rules only.
8. Eligibility views must be computed from private internal rules, not from the public sharing projection.
9. Occurrence counters must be reconciled from linked request and booking records, never hand-patched.

---

## 12. Safety Guardrails and Break-Glass Rules

## Standard guardrails

- production pages must have strong environment labeling
- read-only by default
- sensitive actions require explicit confirmation
- mutation actions require reason text
- mutation actions must call domain services, not bypass them
- launch scope should favor one-object-at-a-time actions
- all write actions generate audit entries automatically
- hidden fields and hidden mutation side effects are not allowed

## Break-glass purpose

Break-glass is for **containment**, not convenience. It exists for:

- privacy exposure containment
- security containment
- runaway automation containment
- major production incident containment

## Allowed break-glass actions

These may be allowed to specifically authorized users:

- disable all sharing for a targeted user/workspace
- rotate compromised share links
- revoke active sessions
- pause a failing queue class
- quarantine an intake artifact
- pause a problematic template that is creating bad future operational load

## Disallowed break-glass actions

Even break-glass should not permit:

- request relinking
- force assignment through hard conflict
- raw lifecycle rewrites
- direct edits to derived tables/counters
- silent deletion of audit evidence
- broad data surgery from UI

## Break-glass controls

- temporary elevated grant only
- strong reason required
- incident reference required
- automatic audit prominence
- post-incident review required
- privilege removed after incident window

---

## 13. Rollout Priority for Internal Tooling

## Priority 0 - before production launch

Build first:

- internal console shell
- RBAC and scoped permissions
- audit middleware
- global lookup
- booking inspector
- request-linkage inspector
- shift occurrence / template inspector
- sharing preview and control
- intake draft / extraction job console
- worker / job dashboard
- audit log viewer
- minimal exception queues
- account / role viewer

## Priority 1 - launch stabilization

Add next:

- support ticket console refinement
- eligibility and conflict viewer
- session revoke controls
- template pause / resume controls
- reconciliation triggers
- queue ownership, snooze, and notes
- better release/version correlation in job dashboards

## Priority 2 - V1 operational layer

Add for V1 delivery:

- coverage action queue
- request terminal actions via domain commands
- Missing Info / Time TBD operations queue
- notification diagnostics
- Manager Lite handoff visibility
- defaults / venue profile provenance
- richer exception dashboards and trend views

## Priority 3 - later / conditional

Only if justified:

- impersonation
- bulk tooling
- advanced BI
- deep helpdesk integration
- broad org-admin console
- self-serve privacy/compliance tooling

---

## 14. V1 Delivery Dependencies

### 1. Coverage Action Queue + Staffing Recommendation Panel
Depends on:
- shift occurrence / template inspector
- eligibility and conflict viewer
- internal ops dashboards / exception queues
- audit log viewer

### 2. Request Lifecycle Orchestration
Depends on:
- request-linkage inspector
- worker / job dashboard
- internal ops dashboards
- audit log viewer

### 3. Missing Info / Time TBD Resolution Workflow
Depends on:
- booking inspector
- intake draft / extraction job console
- exception queues
- notification diagnostics

### 4. Conflict Explainability, Override Review, and Audit History
Depends on:
- eligibility and conflict viewer
- booking inspector
- audit log viewer

### 5. Availability Block Ergonomics and Reusable Patterns
Depends on:
- manual availability block viewer
- eligibility viewer
- sharing preview
- later-safe mutation decisions if ever approved

### 6. Mobile PWA Performance, Sync Safety, and Daily-Use Polish
Depends on:
- QA / release visibility
- worker / job dashboard
- exception queues
- audit and release correlation

### 7. In-App Notification Center, Preferences, and Actionable Nudges
Depends on:
- account / role viewer
- booking and request inspectors
- worker / job dashboard
- notification diagnostics layer

### 8. Internal Ops Dashboards and Exception Queues
This phase directly defines the foundation for this V1 item.

### 9. Reusable Booking Defaults and Lightweight Venue Profiles
Depends on:
- booking inspector
- defaults provenance surfaces
- audit logging of default application

### 10. Manager Lite Collaboration and Safe Handoffs
Depends on:
- account / role viewer
- audit log viewer
- support case console
- scoped permissions model

---

## 15. Main Risks and Failure Modes

### 1. Shadow admin behavior
**Risk:** staff start fixing production through internal shortcuts instead of domain rules.  
**Mitigation:** read-first design, blocked direct edits, domain-command-only writes, audit.

### 2. Cross-tenant privacy leakage
**Risk:** internal search or viewers reveal the wrong workspace/org data.  
**Mitigation:** scoped grants, global search controls, explicit org/workspace context, audit on access to sensitive views.

### 3. Public sharing privacy mistakes
**Risk:** internal tooling leaks more than Busy or Busy + Region.  
**Mitigation:** fixed mode enum, exact preview, share control isolation, no freeform external payload editing.

### 4. Derived-surface drift
**Risk:** counters, projections, and commitments become wrong and staff patch them manually.  
**Mitigation:** mismatch indicators, reconciliation jobs, derived surfaces non-editable.

### 5. Unsafe job replay
**Risk:** repeated or broad replays duplicate effects.  
**Mitigation:** idempotency labeling, scope caps, confirmations, replay audit, engineer-focused controls only.

### 6. Request-path corruption
**Risk:** manual relinking creates duplicate or orphaned booking paths.  
**Mitigation:** relinking blocked, invariant checker, request-linkage inspector, orchestration retries only.

### 7. Hard-conflict assignment bypass
**Risk:** internal operators assign people into invalid states.  
**Mitigation:** assignment override blocked, eligibility viewer read-only, domain validation preserved.

### 8. Tool sprawl
**Risk:** team builds too many internal apps and slows feature delivery.  
**Mitigation:** one internal console, shared shell, modular tabs, minimal write scope.

### 9. Support confusion over schedule semantics
**Risk:** staff misread cross-midnight, service-day, or Agenda vs Coverage behavior.  
**Mitigation:** inspectors must render the same semantic model as product and label service-day/timezone clearly.

### 10. Weak audit discipline
**Risk:** team cannot reconstruct who changed what during incidents.  
**Mitigation:** append-only audit, required reasons, case/incident linkage, step-up controls.

---

## 16. Final Recommended Internal Admin & Ops Tooling Spec

AmIFree Scheduler should implement a **single internal operations console** inside the approved TypeScript modular monolith, protected by dedicated internal RBAC, scoped grants, audit middleware, and step-up safeguards. It should not be a second product, and it should not provide generic CRUD over live production data.

### Final recommendation

Ship the console as a small, modular suite with these launch-critical surfaces:

- support ticket console
- account / role viewer
- booking inspector
- manual availability block viewer
- request-linkage inspector
- shift occurrence / template inspector
- eligibility and conflict viewer
- sharing preview and control
- intake draft / extraction job console
- worker / job dashboard
- audit log viewer
- internal ops dashboards / exception queues

### Design stance

- **Deep inspection**
- **narrow writes**
- **strict source-vs-derived discipline**
- **privacy-first containment controls**
- **no request relinking**
- **no forced hard-conflict assignment**
- **no manual counter editing**
- **no bypass of review-before-save**
- **no shadow workflow truth**

### Launch operating model

At launch and early stabilization, the internal console should primarily let the team:

- find the right object fast
- understand exactly what happened
- contain privacy/security exposure
- retry safe jobs
- pause bad automation
- inspect staffing and sharing behavior
- audit every meaningful action

### V1 operating model

For V1, deepen the console around:

- coverage actioning
- request orchestration
- missing-info resolution
- conflict explainability
- in-app notification diagnostics
- Manager Lite handoffs
- reusable-default provenance
- exception queues and ops dashboards

### Explicit boundary

Operational data repair that requires:
- lifecycle rewriting
- request relinking
- raw data patching
- large-scope backfills
- schema evolution
- unsafe replays

should remain **engineering-only**, outside normal internal ops tooling, and executed through code-reviewed operational procedures.

This is the minimum viable internal tooling model that is realistic for a small team, consistent with all locked product truths, and strong enough to support launch, stabilization, and V1 without weakening AmIFree’s core trust and correctness model.
