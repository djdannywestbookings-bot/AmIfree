# [18] Phase — Security, Privacy & Compliance Hardening Final Revision

## 1. Revision Summary

The current Security, Privacy & Compliance Hardening plan remains intact except for one boundary-model correction:

- The prior wording around workspace boundaries was too strict and could be read as requiring all core linked records to live in the same workspace.
- That is now corrected to preserve the locked approved model in which:
  - a **Booking** may be canonically owned by one workspace while referencing a **schedule subject / person** from another workspace
  - a **Booking Request** may be canonically owned by one workspace while referencing a **schedule subject / person** from another workspace
  - this supports operator-owned requests and bookings against DJ-owned schedule subjects **without cloning or duplicating Bookings**
- The revised model now explicitly distinguishes:
  1. **canonical owning workspace** of the operational record
  2. **referenced schedule subject / person** that may belong to another workspace
  3. **restricted projection-based cross-workspace visibility** that may expose only the minimum data needed for conflict, eligibility, or approved workflow actions

This correction does **not** weaken any existing hardening requirement. The following remain fully unchanged:

- Booking remains the only calendar-truth object
- request-linkage behavior remains exact
- Agenda vs Coverage separation remains exact
- occurrence-capacity math remains exact
- staffing eligibility remains separate from external sharing visibility
- cross-tenant leakage remains prohibited
- cross-workspace and cross-org collaboration remain projection-based rather than clone-based
- one canonical owner remains required per operational record
- non-owning workspaces do not automatically gain full client, source, or internal detail

This correction applies only where the approved product model already allows cross-workspace ownership/reference behavior. It does **not** widen unrestricted cross-workspace writes or raw cross-workspace reads for all record classes.

## 2. Updated Org / Workspace / Team / Person Boundary Protections

### Org boundary

Org remains the:

- billing boundary
- policy boundary
- top-level tenant isolation boundary

Controls remain unchanged:

- no normal product flow should expose raw tenant-private data across orgs
- org-level policy and access controls remain stricter than workspace-local operational permissions
- cross-org collaboration remains projection-based and must not imply broad raw record access or cloned Bookings

### Workspace boundary

Workspace remains the:

- operational system-of-record boundary
- canonical ownership boundary for operational records

The boundary correction is:

- **workspace ownership does not mean all referenced entities must originate from the same workspace**
- for approved object types, especially **Booking** and **Booking Request**, the system must support:
  - **one canonical owning workspace** for the operational record
  - **one referenced schedule subject / person** that may belong to another workspace
  - **restricted projection-based visibility** to other workspaces where product behavior requires it

### Corrected workspace rule

The correct rule is:

- most operational records remain workspace-owned and workspace-scoped
- however, **approved Bookings and Booking Requests may be owned by Workspace A while referencing a schedule subject / person associated with Workspace B**
- this does **not** create a second Booking or second Booking Request in Workspace B
- this does **not** automatically grant Workspace B full access to the owner workspace’s client detail, notes, request history, or internal source context
- this does **not** collapse the tenant boundary or create a shared raw-record model across workspaces

### Operational meaning

The owning workspace remains responsible for the canonical operational record, including as applicable:

- client/source detail
- lifecycle control
- operational notes
- request orchestration
- audit trail for owner-side actions

A referenced subject’s home workspace may receive only the minimum approved visibility needed for product behavior, such as:

- restricted conflict visibility
- restricted schedule impact visibility
- approved response/action surfaces
- staffing eligibility or conflict outcomes through controlled projections

It must **not** receive full owner-side record detail unless separately and explicitly permitted.

### No-clone rule remains unchanged

- A cross-workspace Booking or Booking Request remains **one canonical record**
- multi-workspace participation must resolve through projections, scoped views, or controlled relationship surfaces
- the product must not create cloned Bookings, mirrored Bookings, or duplicated request records to represent the same operational reality

## Team boundary

Team remains:

- an optional coordination layer inside a workspace
- not a separate tenant boundary
- not a substitute for owner-workspace authorization

No change to team rules:

- team visibility may narrow access inside a workspace
- team membership must not broaden raw access across workspaces
- team assignment logic remains subordinate to workspace and org authorization rules

## Person boundary

Person / DJ profile remains:

- a first-class operational entity
- separate from user identity
- capable of being referenced across workspace boundaries where already approved

### Corrected person rule

A workspace may:

- own a canonical Booking or Booking Request
- reference a schedule subject / person associated with another workspace

But that reference does **not** mean:

- transfer of person ownership
- automatic merge of full profile detail
- automatic access to the subject’s home-workspace notes, internal staffing rationale, or private operational context
- automatic access to all Bookings or requests associated with that person in another workspace

### Person protection rules remain

- do not auto-merge person records across workspaces or orgs based only on name, email, or phone
- linking a user account to a workspace person record remains explicit and audited
- workspace-specific notes, staffing rationale, internal comments, and operational metadata remain visible only within the workspace that owns them or is explicitly authorized to see them
- cross-workspace person references must use explicit scoped relationships / projections, not implicit broad joins or duplicated local copies

## 3. Updated Authorization and Tenant Boundary Hardening

### Enforcement model

Authorization remains enforced at:

1. route / API layer
2. domain service layer
3. database layer

The boundary correction is that authorization must now explicitly distinguish between:

- **actor scope**
- **canonical owning workspace of the record**
- **referenced schedule subject / person scope**
- **projection entitlement**, where cross-workspace visibility is intentionally allowed

Authorization logic must **not** assume:

- `record_owner_workspace == schedule_subject_home_workspace`

That assumption is now explicitly disallowed for approved cross-workspace Booking and Booking Request flows.

## Mandatory authorization rules

### 1. Owner and subject scope must be modeled separately

For approved cross-workspace objects, especially Bookings and Booking Requests, the system must treat these as distinct concepts:

- canonical owning workspace of the operational record
- referenced schedule subject / person identity
- any home workspace or originating scope associated with that subject
- any projection/relationship surface that authorizes limited cross-workspace visibility

These concepts must not be collapsed into one overloaded workspace assumption in:

- API handlers
- domain services
- database policies
- analytics and internal BI views
- admin tooling

### 2. Canonical write authority remains with the owning workspace

For Bookings and Booking Requests:

- canonical create/update/lifecycle authority remains with the owning workspace, subject to role and business-rule enforcement
- non-owning workspaces do not gain full write authority just because the referenced subject belongs to them
- tightly controlled internal/admin repair actions remain the only exception, and they must still follow audit and domain guardrail rules

### 3. Cross-workspace visibility must be projection-based

A workspace that is not the canonical owner may only see or act on data through explicitly approved projection surfaces.

Examples of acceptable restricted visibility include:

- limited conflict outcomes
- limited schedule impact visibility
- limited assignment eligibility outcomes
- narrowly scoped response/action surfaces when explicitly allowed by the product flow

Examples of unacceptable visibility remain:

- raw owner-side notes
- full client/source detail
- unrestricted request history
- unrestricted audit history
- unrestricted staffing rationale
- broad access to all related records for the referenced subject

### 4. Database isolation must preserve owner-row protection

RLS and database access patterns must continue to protect tenant data, but they must do so without assuming same-workspace ownership and subject scope.

Correct rule:

- direct row access to canonical Booking and Booking Request records must remain owner-scoped unless a separately authorized projection or controlled function is used
- cross-workspace workflows must not be implemented by simply widening raw row visibility to every referencing workspace
- where restricted cross-workspace access is required, it should be served through curated projection views/functions/tables that expose only approved fields

### 5. Search, list, export, and BI must remain owner-safe

Default search/list/export behavior remains:

- owner-workspace scoped
- field scoped
- role scoped

Cross-workspace reporting or dashboards must be built from curated projection layers and must not:

- join broad raw tables across workspaces
- infer unauthorized detail from owner-only data
- leak full source/client context through operational summaries

### 6. Cross-tenant boundary remains strict

This revision preserves cross-workspace ownership where already approved, but it does **not** weaken cross-tenant isolation.

Rules remain:

- cross-org collaboration remains projection-based
- no default raw record access across orgs
- no cloned Bookings used to represent cross-org collaboration
- any future cross-org visibility must remain least-privilege and projection-mediated

## Updated data-access pattern requirement

For approved cross-workspace Booking and Booking Request flows, implementation should follow this rule:

- keep **one canonical owner record**
- keep **one referenced schedule-subject/person relationship**
- expose **restricted projections** for non-owning visibility
- do **not** widen canonical raw record access merely because another workspace is involved

This is the boundary-safe version of the approved model.

## 4. Updated Any Other Affected Sections

### Inputs from Locked Phases — corrected interpretation

Add the following locked input clarification:

- **Cross-workspace ownership is intentionally allowed in the approved model**
- a Booking can be owned by one workspace while referencing a schedule subject from another workspace
- a Booking Request can be owned by one workspace while referencing a schedule subject from another workspace
- this supports operator-owned requests and bookings against DJ-owned schedule subjects without duplicated Bookings
- cross-workspace and cross-org collaboration should still use projections, not cloned Bookings
- the hardening plan must protect this model rather than collapse it into a same-workspace-only assumption

### Threat Model and Risk Areas — additional corrected risk

Add the following product-specific risk:

#### Unauthorized detail bleed or duplication across approved cross-workspace references

Examples:

- engineering assumes owner workspace and schedule subject workspace must be the same and incorrectly blocks approved flows
- engineering tries to support approved cross-workspace flows by broadening raw row access instead of using restricted projections
- a Booking is duplicated or cloned into the referenced subject’s workspace instead of remaining one canonical record
- Workspace B gains owner-side client/source detail from Workspace A merely because the referenced schedule subject belongs to Workspace B
- internal BI/admin views infer or reveal restricted owner-side fields across workspace boundaries

Why it matters:

- it either breaks the approved operating model or leaks data across workspace boundaries
- it creates the exact class of trust failure the hardening plan is meant to prevent

Required response:

- separate owner scope from subject scope
- separate raw-record access from projection access
- enforce one canonical owner per Booking/Request
- prohibit cloned Bookings
- keep cross-workspace visibility least-privilege and projection-based

### Source-of-Truth and Integrity Protections — corrected invariant language

Update the invariant model with the following corrected rule:

#### Canonical ownership with foreign schedule-subject reference

For approved Bookings and Booking Requests:

- each record has **one canonical owning workspace**
- that record may reference a **schedule subject / person associated with another workspace**
- this does **not** create a second Booking or second Booking Request in the referenced subject’s workspace
- request linkage, lifecycle progression, audit, and schedule impact must all continue to resolve through the same single canonical record path
- any cross-workspace visibility derived from that record must be projection-based and field-limited

#### Request-linkage integrity remains exact across workspace boundaries

Update the prior request-linkage language to clarify:

- a sent request must still create or link exactly one Requested Booking in the same transaction
- that linked Booking may be canonically owned by one workspace while referencing a schedule subject from another workspace where approved
- accepting, declining, withdrawing, expiring, or converting the request must still preserve the same linked request + linked-booking path
- cross-workspace reference does not justify creating a duplicate Booking in the referenced subject’s workspace

#### Staffing eligibility and restricted conflict visibility remain separate from owner detail

Where a non-owning workspace receives conflict or eligibility outcomes related to a referenced schedule subject:

- that visibility must remain restricted and purpose-limited
- it must not automatically reveal full booking client/source detail, owner-side notes, or unrestricted operational context
- “can see enough to honor conflict/eligibility rules” is not the same as “can read the canonical owner record”

### Main Risks and Failure Modes — corrected additional failure mode

Add the following failure mode:

| Failure Mode | Consequence | Primary Prevention |
|---|---|---|
| Approved cross-workspace Booking/Request flow is implemented through cloned records or widened raw access | duplicate source-of-truth, broken request linkage, or workspace-to-workspace data leakage | one canonical owner record, separate owner vs subject scope, projection-based non-owner visibility, no-clone enforcement |

## 5. Final Revised Security, Privacy & Compliance Hardening Plan

The final revised hardening plan remains exactly as previously approved except for the corrected boundary model below.

### Corrected boundary model

AmIFree must harden around this exact rule set:

1. **One canonical owner per operational record remains mandatory**
   - especially for Bookings and Booking Requests

2. **Approved cross-workspace ownership remains allowed**
   - a Booking may be owned by one workspace while referencing a schedule subject / person from another workspace
   - a Booking Request may be owned by one workspace while referencing a schedule subject / person from another workspace

3. **Owner scope and subject scope are distinct**
   - canonical owner workspace controls the operational record
   - referenced schedule subject / person may belong to another workspace
   - those two scopes must not be conflated in auth, storage, BI, or admin tooling

4. **Non-owner visibility remains restricted and projection-based**
   - approved cross-workspace participation must use limited projections, not raw broad access
   - conflict visibility, schedule impact visibility, and approved workflow visibility remain least-privilege
   - owner-side client/source detail, notes, staffing rationale, and unrestricted audit do not automatically cross workspace boundaries

5. **No cloned Bookings remain allowed**
   - cross-workspace collaboration must use projections
   - the system must not duplicate or mirror Bookings or Booking Requests into another workspace just to represent shared participation

6. **Cross-tenant protection remains strict**
   - this correction preserves approved cross-workspace ownership without weakening org/tenant isolation
   - cross-org collaboration remains projection-based and tightly bounded
   - no default raw cross-org record access is introduced

7. **All other hardening requirements remain unchanged**
   - Booking remains the only calendar-truth object
   - request-linkage remains exact
   - Agenda vs Coverage separation remains exact
   - occurrence-capacity math remains exact
   - staffing eligibility remains separate from external sharing visibility
   - public Busy / Busy + Region sharing remains narrowly scoped
   - internal admin tooling remains read-first, limited-write, and heavily audited

## Final corrected recommendation

The correct security, privacy, and compliance posture for AmIFree is therefore:

- protect tenant boundaries strictly
- protect canonical record ownership strictly
- allow approved cross-workspace Booking and Booking Request ownership/reference patterns explicitly
- model owner scope, subject scope, and projection visibility separately
- keep all non-owner visibility least-privilege
- preserve one canonical Booking path and one canonical request-linkage path
- prevent duplicated/cloned records
- keep the rest of the current hardening plan fully intact

This is the final revised hardening model that preserves the approved cross-workspace operating design without weakening privacy, authorization, or source-of-truth integrity.
