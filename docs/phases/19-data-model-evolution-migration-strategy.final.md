# [19] Phase — Data Model Evolution & Migration Strategy Final Revision

## 1. Revision Summary

This final revision makes one targeted correction to the Phase 19 migration strategy: in the future-safe model, every Booking must resolve to exactly one `subject_person_id`, and a subjectless Booking is not a valid steady-state operational record. Untargeted or not-yet-person-specific work must live in Booking Request, Intake Draft, or Shift Occurrence / Shift Template flows, not in a generic Booking. Sent Booking Requests must create or link a person-specific Requested Booking. Any legacy Booking without a resolvable subject must be reconciled before full Booking-domain cutover or be held in a controlled compatibility/reconciliation state outside the customer-visible lifecycle and blocked from being treated as fully migrated schedule truth. All other migration structure, staging, compatibility, and rollback posture remain intact.

The practical effect of this correction is narrow but important:

- `bookings.subject_person_id` may be temporarily nullable only during staged migration.
- The end-state model requires `bookings.subject_person_id` to be non-null and foreign-key valid.
- “Subjectless Booking if lifecycle allows” is removed.
- Draft-stage untargeted demand remains valid only in:
  - `booking_requests` in Draft where already allowed
  - `intake_drafts`
  - `shift_occurrences` / `shift_templates` on the demand side
- Compatibility/reconciliation handling for unresolved legacy Bookings is a migration-control status, not a new Booking lifecycle state.

## 2. Updated Current MVP / V1 Data Model Baseline

### 2.1 Updated baseline interpretation
The MVP / V1 operational meaning of a Booking should be treated as already person-specific in business intent, even if some legacy rows may not yet carry a clean explicit subject reference. A Booking is the calendar-truth object for one schedule subject / person. If current data contains Bookings whose subject is ambiguous, missing, or only indirectly inferable, those rows should be treated as legacy data-shape defects or pre-migration gaps, not as evidence that subjectless Bookings are a valid product concept.

### 2.2 Updated practical baseline
The MVP / V1 operational meaning of the live model remains the same seven practical domains:

#### A. Identity and access
- auth users
- profile/user metadata
- owner-centric access logic in MVP/V1

#### B. Booking domain
- `bookings`
- lifecycle state
- venue/time/region/service-day data
- conflict/audit metadata
- operational schedule truth for one specific subject/person, even where that subject is not yet fully normalized in schema

#### C. Request and staffing domain
- `booking_requests`
- `shift_templates`
- `shift_occurrences`
- request-to-booking linkage
- occurrence slot counts and open-slot math

#### D. Availability domain
- `manual_availability_blocks`
- separate hard-blocking schedule objects for a specific subject/person

#### E. Intake domain
- `intake_drafts`
- review-before-save extraction workflow
- staging only; not Booking truth

#### F. Normalized schedule surface
- `schedule_commitments`
- derived overlap surface from source-of-truth schedule records

#### G. Visibility, audit, and operations
- public share configuration/output
- notifications
- audit logging
- admin/support surfaces

### 2.3 Updated baseline constraint
The baseline should now be read with this correction:

- untargeted or not-yet-person-specific work belongs in Request / Draft / Occurrence flows
- Bookings are not the container for generic demand
- any current Booking row without a resolvable subject is a migration problem to solve, not a business rule to preserve

### 2.4 Updated baseline pressure point
The main data-model pressure point is not that Bookings can validly be subjectless. It is that the current schema may not yet enforce subject resolution strongly enough. Phase 19 therefore needs to:
- make subject identity explicit and durable on Bookings
- backfill or reconcile legacy ambiguity
- enforce person-specific Booking truth by the time full cutover is complete

## 3. Updated Target Expansion Data Model Goals

### 3.1 Booking subject goal
In the target future-safe model, every Booking must resolve to exactly one `subject_person_id`.

This means:
- a subjectless Booking is not a valid steady-state operational record
- there is no generic “unassigned Booking” concept for untargeted work
- there is no future-state Booking row whose scheduling truth is detached from a specific person

### 3.2 Request-linkage goal
Booking Request behavior remains unchanged in structure but tightened in targeting semantics:

- Draft request may exist without a linked Booking
- Draft request may remain untargeted where already allowed
- once a request is Sent, the linked Requested Booking must be person-specific
- once Sent, the same linked request + linked-booking path remains canonical
- accepting the request does not create a second Booking
- conversion/assignment updates the existing linked Booking path

### 3.3 Untargeted-demand goal
Untargeted demand remains in the appropriate non-Booking objects:
- `booking_requests` in Draft where allowed
- `intake_drafts`
- `shift_templates`
- `shift_occurrences`

The model should not store untargeted or generic work as a Booking simply to reserve workflow state.

### 3.4 Cross-workspace expansion goal
Expansion may still allow:
- `bookings.owner_workspace_id` to belong to one workspace
- `bookings.subject_person_id` to reference a person whose home workspace is different

But even in that case:
- the Booking still belongs to exactly one owner workspace
- the Booking still represents schedule truth for exactly one person
- cross-workspace capability does not loosen person-specific Booking truth

### 3.5 Migration completeness goal
A Booking-domain migration should only be considered fully cut over when:
- operationally live Bookings are person-resolved
- `subject_person_id` is authoritative in Booking-domain reads/writes
- unresolved legacy exceptions, if any, are isolated in a controlled compatibility/reconciliation path and not treated as fully migrated truth

## 4. Updated Organization / Workspace / Team / Person Model Evolution

### 4.1 Person remains first-class and now explicitly mandatory for Bookings
The person model remains the first-class schedule-subject identity, but this revision makes one additional requirement explicit:

- a Booking must resolve to one `person`
- a Manual Availability Block must resolve to one `person`
- a public share configuration must resolve to one `person`
- a Booking Request may be untargeted only while still in Draft where already allowed

This preserves the intended separation:
- person = schedule subject
- user = authenticated actor
- workspace = canonical operational owner
- team = optional coordination layer

### 4.2 Workspace roster and targeting flow
The workspace/person model should support targeting before Booking creation, not after generic Booking creation.

Recommended flow:
- the owner workspace identifies or selects the target person from:
  - its home roster
  - an allowed projected external roster/person
  - a resolved intake outcome
  - a request target selection
- only then is a Booking created or linked as schedule truth

This keeps Bookings person-specific from creation/link time onward.

### 4.3 Team model remains unchanged
Team remains optional coordination only and does not alter the subject rule:
- team does not own Bookings
- team does not replace `subject_person_id`
- team does not serve as a proxy for untargeted Booking truth

### 4.4 User-person decoupling remains unchanged
The migration still requires:
- `persons`
- `person_user_links`
- roster presence independent of login identity

The correction simply clarifies that the person layer is not optional for the Booking domain in the end-state model.

## 5. Updated Ownership and Reference Model Evolution

### 5.1 Updated canonical Booking rule
Each Booking must carry:
- exactly one `owner_workspace_id`
- exactly one `subject_person_id`

These fields represent different truths:
- `owner_workspace_id` = who canonically owns the operational record
- `subject_person_id` = whose schedule the Booking is calendar truth for

Neither field should be inferred indefinitely at runtime in the future-safe model.

### 5.2 Updated Booking rule for cross-workspace cases
If a Booking is cross-workspace:
- `owner_workspace_id` may differ from the subject person’s home workspace
- `subject_person_id` is still required
- the external-person reference must still be mediated by the approved projection/grant mechanism
- cross-workspace support does not permit a generic subjectless Booking placeholder

### 5.3 Updated Booking Request rule
Booking Requests remain separate from Bookings and continue to handle pre-target and demand-side workflow.

Updated rule:
- Draft request:
  - may exist without `linked_booking_id`
  - may remain untargeted where already allowed
- Sent request and later:
  - must have a target person
  - must create or link a Requested Booking for that specific person
  - must preserve the same linked request + linked-booking path

### 5.4 Updated record-type matrix

| Record type | Canonical owner required | `subject_person_id` rule | Untargeted allowed | Cross-workspace subject allowed |
|---|---:|---|---:|---:|
| Booking | Yes | Required in future-safe model; exactly one subject | No | Yes, via approved projection/grant |
| Booking Request | Yes | Optional only in Draft where already allowed; required from Sent onward | Draft only | Yes, once targeted and granted |
| Shift Template | Yes | Not applicable | Yes, demand-side only | No initial change |
| Shift Occurrence | Yes | Not applicable as the occurrence itself is demand-side capacity | Yes, demand-side only | No initial change |
| Manual Availability Block | Yes | Required | No | No initial change |
| Intake Draft | Yes | Optional candidate/reference only | Yes | No initial change |
| `schedule_commitments` | Derived | Required when derived from a person-scoped source | N/A | Derived only |

### 5.5 Updated Booking creation/linkage rule
The migration strategy should now assume:

- direct Booking creation requires a resolved target person
- request-driven Booking creation/linkage at Sent requires a resolved target person
- untargeted work must stay upstream in Request / Draft / Occurrence structures

There should be no wording or implementation pattern that encourages “create Booking now, choose person later” as a steady-state model.

### 5.6 Updated compatibility rule for legacy Bookings
Legacy Bookings with unresolved subject may temporarily exist only as migration exceptions. During that period they are:

- not evidence of valid future-state Booking shape
- not eligible to be treated as fully migrated Booking truth
- controlled through reconciliation tooling/admin compatibility handling, not a new product lifecycle state

## 6. Updated Backfill and Compatibility Strategy

### 6.1 Updated backfill priority
The person-subject backfill for Bookings becomes a hard gate, not a soft enhancement.

Recommended priority within Phase 19 migration:
1. seed organizations/workspaces/memberships
2. backfill `owner_workspace_id`
3. create persons and person-user links
4. backfill `subject_person_id` on Bookings and other subject-bound records
5. reconcile unresolved Booking subjects
6. only then complete Booking-domain cutover to fully migrated truth

### 6.2 Updated Booking subject inference rules
Booking subject inference should remain deterministic and conservative. Recommended priority order:

1. explicit assigned / booked DJ person field if present
2. linked Booking Request target person
3. explicit intake-reviewed subject resolution
4. explicit roster/person mapping already recorded on the Booking
5. only where clearly authoritative, owner-linked self-person mapping
6. otherwise unresolved → reconciliation queue

No step should silently create a future-state subjectless Booking.

### 6.3 Updated handling of unresolved legacy Bookings
If a legacy Booking subject cannot be confidently resolved:

- the row enters reconciliation
- the row is marked as not fully migrated for Booking-domain truth
- the row is blocked from new-model full-truth treatment until resolved

Controlled compatibility handling may include:
- visibility in admin/support reconciliation views
- exclusion from migrated Booking-domain read paths
- exclusion from migrated `schedule_commitments` rebuilds
- exclusion from public share output
- blockage from new-model operational transitions that assume a resolved subject

This compatibility handling is a migration-control state, not a new customer-facing Booking lifecycle state.

### 6.4 Updated compatibility posture
Temporary nullability of `bookings.subject_person_id` is allowed only to support staged migration. It should not be interpreted as endorsed model shape.

Recommended implementation posture:
- application guard first: no new Booking writes without `subject_person_id`
- dual-write/shadow-read period while backfill runs
- reconciliation of legacy gaps
- final database hardening:
  - foreign key enforcement
  - not-null enforcement
  - migrated Booking read path requires resolved subject

### 6.5 Updated request compatibility posture
Booking Requests may continue to allow untargeted Draft behavior where already approved. However, the compatibility layer should enforce:

- if request state is Draft: untargeted allowed
- if request state is Sent or later: target person required
- if request state is Sent or later: linked Booking required and person-specific

### 6.6 Updated derived-surface compatibility
During migration:
- `schedule_commitments` in the fully migrated path should only be derived from Bookings with resolved `subject_person_id`
- unresolved legacy Bookings must not silently enter migrated commitment truth as anonymous or generic commitments

If legacy compatibility support is temporarily needed for historical visibility, it should remain isolated from the fully migrated operational derivation path.

## 7. Updated Data Validation and Reconciliation Strategy

### 7.1 Updated structural validation
Add the following Booking-domain validation requirements:

- every fully migrated Booking has non-null, valid `subject_person_id`
- every fully migrated Booking has exactly one `owner_workspace_id`
- every person-scoped derived commitment resolves to the same subject as its source Booking
- no fully migrated Booking exists without a resolvable person subject

### 7.2 Updated request-linkage validation
Validate all of the following:

- Draft request may exist without `linked_booking_id`
- Draft request may remain untargeted only where already allowed
- every Sent-or-later request has a target person
- every Sent-or-later request has a linked Booking
- the linked Booking’s `subject_person_id` matches the request’s resolved target person
- accepting a request does not create a second Booking
- conversion/assignment updates the same linked Booking path

### 7.3 Updated behavioral parity validation
Behavioral parity must now include subject-specific Booking checks:

- conflict detection parity for Assigned / Booked Bookings must be evaluated on person-resolved Bookings
- public Busy / Busy + Region output must continue to derive from subject-resolved records only
- no operational logic should treat a generic subjectless Booking as valid migrated schedule truth

### 7.4 Updated reconciliation requirements
Reconciliation queue items for Bookings must now distinguish between:
- resolvable by deterministic rule
- resolvable by admin-assisted mapping
- unresolved / blocked from cutover

A Booking with unresolved subject should not be allowed to “pass” migration merely because other fields are complete.

### 7.5 Updated acceptance thresholds
Recommended Booking-domain cutover thresholds:

- 100% of active and future Bookings have resolved `subject_person_id`
- 100% of Sent-or-later Booking Requests have target person + linked person-specific Booking
- 0 migrated Booking-domain reads depend on implicit subject inference
- 0 public-share or staffing surfaces consume anonymous/generic Booking rows
- any remaining unresolved historical exceptions are explicitly quarantined in compatibility/reconciliation handling and excluded from fully migrated truth

### 7.6 Updated final-state expectation
The end-state target remains:
- no subjectless Bookings in operational truth
- no generic untargeted work stored as Booking
- no ambiguity in whose schedule a Booking represents

## 8. Updated Any Other Affected Sections

### 8.1 Updated invariants
The following invariant should now be read explicitly:

- a Booking represents schedule truth for one specific schedule subject / person
- therefore, the future-safe Booking model requires exactly one `subject_person_id`
- subjectless Booking rows are not valid steady-state operational truth

All previously stated invariants remain unchanged.

### 8.2 Updated schema evolution stages
The existing stage plan remains intact, with these clarifications:

#### Stage 3 — Person decoupling
This stage must explicitly:
- add `subject_person_id` to Bookings
- backfill Booking subjects before full Booking-domain cutover
- route unresolved legacy Bookings into reconciliation
- prevent new Booking creation without a resolved subject

#### Stage 6 — Cross-workspace staffing via projections
Cross-workspace support continues to apply first to Bookings and Booking Requests, but:
- the external-person Booking must still have exactly one `subject_person_id`
- projection/grant logic enables external reference, not generic Booking placeholders

### 8.3 Updated cutover and rollback posture
The overall cutover and rollback strategy remains unchanged, with one Booking-domain gate added:

- full Booking-domain cutover should not occur while active/future Bookings remain unresolved as to subject
- any temporary compatibility handling for unresolved legacy Bookings must stay outside the fully migrated Booking truth path
- rollback disables new-model reads/writes as before, but does not change the intended end-state requirement that Bookings be person-specific

### 8.4 Updated “What Explicitly Should Not Change”
Add this explicit prohibition:

- do not store untargeted or not-yet-person-specific work as a Booking
- do not create generic Bookings to hold pre-target workflow state that belongs in Booking Request, Intake Draft, Shift Occurrence, or Shift Template flows

Everything else in the prior “should not change” list remains intact.

## 9. Final Revised Data Model Evolution & Migration Strategy

The Phase 19 strategy remains the same in structure and rollout approach, with one corrected Booking-subject rule applied consistently across the model.

AmIFree should still evolve additively from a DJ-first MVP/V1 shape into the approved multi-user SaaS architecture by introducing organization, workspace, team, person, membership, and projection/grant layers around the existing operational core. The operational core remains unchanged: Booking, Booking Request, Shift Template, Shift Occurrence, Manual Availability Block, Intake Draft, and `schedule_commitments` stay separate and retain their locked product semantics.

The corrected future-safe model is:

- **Organization** remains the tenant / billing / policy boundary.
- **Workspace** remains the operational system-of-record boundary and canonical owner of operational records.
- **Team** remains optional coordination inside a workspace.
- **Person** remains the first-class schedule subject, separate from user identity.
- **User** remains the authentication and actor identity.
- **Projection / Grant** remains the mechanism for least-privilege cross-workspace collaboration without clones.

Within that model, the Booking domain is now explicit and unambiguous:

- a Booking is the only calendar-truth object
- a Booking is always schedule truth for one specific person
- therefore, the future-safe Booking model requires exactly one `subject_person_id`
- a subjectless Booking is not valid steady-state operational truth
- untargeted demand stays in Request / Draft / Occurrence structures, not in Bookings

Request-linkage behavior remains exact:

- Draft request may exist without a linked Booking
- Draft request may remain untargeted where already allowed
- Sent request must create or link a Requested Booking
- once Sent, the linked Booking path is canonical
- the linked Requested Booking must already be person-specific
- accepting the request does not create a second Booking
- conversion/assignment updates the existing linked Booking path

Cross-workspace expansion also remains intact, with the corrected subject rule preserved:

- a Booking may be owned by one workspace while referencing a person from another workspace
- ownership still belongs to exactly one `owner_workspace_id`
- subject still belongs to exactly one `subject_person_id`
- external reference still requires projection/grant mediation
- no cloning of Bookings is introduced

The migration path remains staged, additive, and small-team realistic:

1. add organizations/workspaces/memberships
2. backfill workspace ownership
3. add persons and person-user links
4. backfill Booking subjects and other subject-bound records
5. reconcile unresolved legacy Bookings
6. cut over Booking-domain reads/writes only after subject resolution is operationally safe
7. enable broader multi-user and cross-workspace behavior in later stages

Temporary nullability for `bookings.subject_person_id` is allowed only during staged migration. It is not the target model. Legacy Bookings that cannot yet be resolved must either be reconciled before full cutover or be held in a controlled compatibility/reconciliation path outside the customer-facing lifecycle and outside fully migrated schedule truth surfaces. They must not be treated as normal migrated Bookings.

With this correction applied, the Phase 19 strategy now cleanly preserves all locked truths while removing the last ambiguity around Booking subject identity. The final model remains additive, secure, projection-based for collaboration, and operationally realistic for a small team, while fully honoring the rule that Booking is the only calendar-truth object for one specific schedule subject / person.
