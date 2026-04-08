# [6] Phase — Database Schema & API Contracts Revision

## 1. Revision Summary

This revision applies the targeted fixes required for Phase 6 and preserves the rest of the approved schema/API contract unchanged.

The revised MVP behavior is now:

- **Hard assignment-blocking commitments** come only from:
  - `Assigned` bookings
  - `Booked` bookings
  - active `Manual Availability Blocks`
- **Soft-state bookings** (`Inquiry`, `Hold`, `Requested`) remain non-blocking for hard assignment, but still participate in:
  - possible conflict logic
  - review-needed logic
  - downstream alert recomputation
- **Public shared busy output** includes only:
  - `Assigned` bookings
  - `Booked` bookings
  - active `Manual Availability Blocks`
- **Manual Availability Blocks** cannot be created or updated on top of:
  - `Assigned` bookings
  - `Booked` bookings
- **Manual Availability Blocks** may overlap:
  - `Inquiry`
  - `Hold`
  - `Requested`
  but those overlaps must trigger downstream alert recalculation on the soft-state booking side
- **Shift Template lifecycle** is limited to:
  - `active`
  - `paused`
  - `archived`

Implementation decision for this revision:

- `schedule_commitments` remains the normalized overlap surface, but now explicitly distinguishes:
  - **hard blocking commitments**
  - **soft-state review commitments**
- hard assignment enforcement uses only rows where `blocks_assignment = true`
- public share output uses only rows where `contributes_to_shared_busy = true`
- possible conflict / review logic may use both:
  - non-blocking `schedule_commitments` rows from soft-state bookings
  - time-TBD soft-state bookings directly from `bookings`

---

## 2. Updated Allowed Values / Enums / Check Constraints

### Updated enum: `shift_template_status`

Replace prior values with:

- `active`
- `paused`
- `archived`

Remove:

- `ended`

### Updated check/meaning rules for booking conflict participation

For `bookings.lifecycle_state`:

- `inquiry`
- `hold`
- `requested`

are **soft-state bookings** and therefore:

- do **not** create hard assignment-blocking commitments
- do **not** contribute to public shared busy
- may participate in possible conflict and review-needed logic

For `bookings.lifecycle_state`:

- `assigned`
- `booked`

are **hard-unavailable bookings** and therefore:

- do create hard assignment-blocking commitments
- do contribute to public shared busy

For `bookings.lifecycle_state`:

- `completed`
- `cancelled`

do not participate in hard blocking, possible conflict, or shared busy, except as historical records.

### Updated `schedule_commitments` semantic rules

The following semantic rules now apply:

- `blocks_assignment = true` only for:
  - active manual availability blocks
  - `assigned` bookings
  - `booked` bookings

- `contributes_to_shared_busy = true` only for:
  - active manual availability blocks
  - `assigned` bookings
  - `booked` bookings

- `participates_in_possible_conflict = true` for:
  - active manual availability blocks
  - `inquiry` bookings with known times
  - `hold` bookings with known times
  - `requested` bookings with known times
  - `assigned` bookings
  - `booked` bookings

### Updated check constraints

For `schedule_commitments`:

- if `source_type = 'manual_availability_block'` then:
  - `blocks_assignment = true`
  - `contributes_to_shared_busy = true`
  - `participates_in_possible_conflict = true`

- if `source_type = 'booking'` and `source_booking_state in ('assigned','booked')` then:
  - `blocks_assignment = true`
  - `contributes_to_shared_busy = true`
  - `participates_in_possible_conflict = true`

- if `source_type = 'booking'` and `source_booking_state in ('inquiry','hold','requested')` then:
  - `blocks_assignment = false`
  - `contributes_to_shared_busy = false`
  - `participates_in_possible_conflict = true`

- if `source_type = 'booking'` and `source_booking_state in ('completed','cancelled')` then no active commitment row should exist

---

## 3. Updated Table Definitions

### bookings

No structural column changes are required. The following behavioral definitions replace the prior drifted interpretation:

- `has_hard_conflict`
  - true only when the booking’s proposed known-time range overlaps an active hard-blocking commitment from:
    - `assigned` booking
    - `booked` booking
    - active manual availability block

- `has_possible_conflict`
  - true when any of the following are true:
    - overlap with a soft-state booking (`inquiry`, `hold`, `requested`)
    - incomplete timing
    - Time TBD ambiguity
    - overlap between a soft-state booking and a manual availability block
    - other workspace-defined review-needed conditions already approved elsewhere in the spec

Updated lifecycle enforcement meaning:

- `assigned` and `booked` remain impossible when `has_hard_conflict = true`
- `inquiry`, `hold`, `requested` may still exist alongside hard conflicts only under the previously approved limited override rules
- soft-state overlap does **not** make an item hard-unavailable

### manual_availability_blocks

No new columns required.

Updated behavioral definition:

- a manual block is an explicit hard-unavailable subject-level interval
- a manual block always produces an active `schedule_commitments` row with:
  - `blocks_assignment = true`
  - `contributes_to_shared_busy = true`
  - `participates_in_possible_conflict = true`

Updated save rule:

- block create/update must be rejected if the proposed block overlaps any booking for the same subject where `lifecycle_state in ('assigned','booked')`
- overlap with `inquiry`, `hold`, or `requested` is allowed
- when overlap with soft-state bookings exists, downstream booking alert recomputation is required

### shift_templates

Replace prior definition fragment with:

- `status shift_template_status not null default 'active'`

Allowed values only:

- `active`
- `paused`
- `archived`

Remove any use of:

- `ended`

Updated lifecycle meaning:

- `active` = eligible for future occurrence generation
- `paused` = future occurrence generation stopped; existing occurrences unchanged
- `archived` = no future generation; template hidden from normal active management flows

### schedule_commitments

Update the table definition as follows.

#### Existing columns retained

- `id uuid primary key`
- `schedule_subject_id uuid not null references schedule_subjects(id)`
- `source_type schedule_commitment_source_type not null`
- `source_id uuid not null`
- `source_workspace_id uuid not null references workspaces(id)`
- `source_booking_state booking_lifecycle_state null`
- `commitment_status schedule_commitment_status not null default 'active'`
- `blocks_assignment boolean not null`
- `contributes_to_shared_busy boolean not null default false`
- `timezone text not null`
- `service_day_date date not null`
- `starts_at_utc timestamptz not null`
- `ends_at_utc timestamptz not null`
- `time_span tstzrange generated stored`
- `region_label text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

#### Add one explicit column

- `participates_in_possible_conflict boolean not null default true`

#### Updated checks

- `ends_at_utc > starts_at_utc`
- `source_type='booking'` requires `source_booking_state is not null`
- `source_type='manual_availability_block'` requires `source_booking_state is null`

Behavioral mapping:

- manual block row:
  - `blocks_assignment = true`
  - `contributes_to_shared_busy = true`
  - `participates_in_possible_conflict = true`

- booking row with `source_booking_state in ('assigned','booked')`:
  - `blocks_assignment = true`
  - `contributes_to_shared_busy = true`
  - `participates_in_possible_conflict = true`

- booking row with `source_booking_state in ('inquiry','hold','requested')`:
  - `blocks_assignment = false`
  - `contributes_to_shared_busy = false`
  - `participates_in_possible_conflict = true`

No active row should exist for:

- `completed`
- `cancelled`

Time-TBD soft-state bookings still do not create a `schedule_commitments` row because there is no concrete range; they remain part of possible conflict logic through direct booking inspection.

---

## 4. Updated Overlap / Range / Enforcement Strategy

### Hard assignment-blocking enforcement

Hard conflict now uses only active `schedule_commitments` rows where:

- `schedule_subject_id` matches
- `commitment_status = 'active'`
- `blocks_assignment = true`

These rows may come only from:

- `assigned` bookings
- `booked` bookings
- active manual availability blocks

Therefore:

- overlap with `inquiry`, `hold`, or `requested` is **not** a hard conflict
- overlap with `inquiry`, `hold`, or `requested` is a **possible conflict / review-needed condition**

### Soft-state review enforcement

Soft-state review logic uses:

- active `schedule_commitments` rows where `participates_in_possible_conflict = true`, plus
- time-TBD soft-state bookings from `bookings` with no commitment row

This means:

- known-time `inquiry` / `hold` / `requested` bookings participate in overlap-based possible conflict checks
- time-TBD soft-state bookings participate in ambiguity-based possible conflict checks
- soft-state bookings do not block assignment by themselves

### Manual Availability Block enforcement

Manual block create/update uses two separate validations:

1. **Hard save blocker**
   - reject if the proposed block overlaps a booking for the same subject where `lifecycle_state in ('assigned','booked')`

2. **Allowed soft-state overlap**
   - allow overlap with:
     - `inquiry`
     - `hold`
     - `requested`
   - after save, recompute alerts on affected soft-state bookings

### Limited hard-conflict save behavior

No change to the previously approved override model except for the corrected conflict source set:

- limited hard-conflict save exists only for `inquiry`, `hold`, `requested`
- hard conflict for that purpose now means overlap only with:
  - `assigned`
  - `booked`
  - active manual availability block

### Shared busy generation

Public shared busy output now uses only active `schedule_commitments` rows where:

- `contributes_to_shared_busy = true`

This includes only:

- `assigned` bookings
- `booked` bookings
- active manual availability blocks

It excludes:

- `inquiry`
- `hold`
- `requested`
- `completed`
- `cancelled`

---

## 5. Updated Derived Rules

### conflict classification

#### Hard Conflict

A booking has `Hard Conflict` only when its proposed known-time window overlaps an active hard-blocking interval for the same subject from:

- `assigned` booking
- `booked` booking
- active manual availability block

#### Possible Conflict

A booking has `Possible Conflict` when any of the following are true:

- overlap with `inquiry`, `hold`, or `requested`
- incomplete timing
- Time TBD ambiguity
- a manual availability block overlaps a soft-state booking
- another approved review-needed condition already defined in the existing spec

Interpretation rule:

- soft-state bookings may influence review logic
- soft-state bookings are not hard-unavailable

### shared busy eligibility

A record contributes to public shared busy only when it is:

- an `assigned` booking
- a `booked` booking
- an active manual availability block

Soft-state bookings never appear in the shared route, even if they have concrete times.

### schedule commitment derivation

Replace the previous derivation rule with:

Create or update an active `schedule_commitments` row for:

- every active manual availability block
- every booking with known start and end times where `lifecycle_state in ('inquiry','hold','requested','assigned','booked')`

Do **not** create an active commitment row for:

- time-TBD bookings
- `completed` bookings
- `cancelled` bookings
- shift occurrences by themselves
- booking requests by themselves

Derivation mapping:

- booking in `assigned` or `booked`
  - `blocks_assignment = true`
  - `contributes_to_shared_busy = true`
  - `participates_in_possible_conflict = true`

- booking in `inquiry`, `hold`, or `requested`
  - `blocks_assignment = false`
  - `contributes_to_shared_busy = false`
  - `participates_in_possible_conflict = true`

- manual availability block
  - `blocks_assignment = true`
  - `contributes_to_shared_busy = true`
  - `participates_in_possible_conflict = true`

---

## 6. Updated Validation Rules by Endpoint

### bookings if affected

Update booking validation language to:

`POST /bookings` and `PATCH /bookings/{booking_id}` must validate:

- caller can act on the subject
- `service_day_date` is required
- if one timestamp is present, both are required
- `end > start`
- `timezone` is required
- `assigned`, `booked`, and `completed` require concrete times
- `assigned` and `booked` reject when the booking overlaps:
  - an `assigned` booking
  - a `booked` booking
  - an active manual availability block
- overlap with `inquiry`, `hold`, or `requested` does not by itself block save to a soft-state booking, but must set/recompute possible-conflict behavior
- hard-conflicted `inquiry`, `hold`, or `requested` save is allowed only for:
  - role `owner` or `manager_lite`
  - explicit override reason
  - explicit confirmation
  - audit log
- `origin_type='request'` requires linked occurrence
- occurrence-linked bookings cannot use `inquiry` or `hold`

### manual availability blocks

Replace the prior validation rule with:

`POST /manual-availability-blocks` and `PATCH /manual-availability-blocks/{block_id}` must validate:

- caller can manage availability for the subject
- known-time range required
- `end > start`
- proposed block is rejected if it overlaps any booking for the same subject where `lifecycle_state in ('assigned','booked')`
- overlap with `inquiry`, `hold`, or `requested` is allowed
- when allowed overlap with soft-state bookings occurs:
  - save the block
  - upsert the block’s `schedule_commitments` row
  - recompute impacted soft-state booking alerts
  - ensure downstream `has_possible_conflict` / review-needed state is refreshed on those affected bookings

### shift templates if affected

Replace prior lifecycle validation references with:

`POST /shift-templates`, `PATCH /shift-templates/{template_id}`, `POST /shift-templates/{template_id}/pause`, and `POST /shift-templates/{template_id}/resume` must use only these template statuses:

- `active`
- `paused`
- `archived`

Updated rules:

- `pause` requires current `status = 'active'`
- `resume` requires current `status = 'paused'`
- archived templates cannot be resumed unless an explicit future unarchive action is later introduced; MVP does not require such an action
- do not reference or derive an `ended` status anywhere in persistence or API response contracts

---

## 7. Updated Read Model Rules

### DJ agenda if affected

No structural change to the DJ agenda source:

- DJ agenda remains **bookings only**

Updated interpretation:

- DJ agenda may include soft-state bookings and hard-state bookings because it is a booking read model
- alert payloads returned for agenda rows must reflect the revised conflict classification:
  - hard conflict only from overlap with `assigned`, `booked`, or active manual block
  - possible conflict for soft-state overlap or Time TBD ambiguity

### Operator agenda if affected

No structural change to the operator agenda source:

- Operator agenda remains **bookings only**

Updated interpretation:

- operator agenda may show `requested`, `assigned`, and `booked` booking rows that belong in the operator booking workflow
- alert payloads and badge logic must use the corrected hard vs possible conflict rules
- soft-state bookings do not become shared-busy items merely because they appear in operator agenda

### Shared availability view

Replace prior shared availability inclusion rule with:

Source:
- active `schedule_commitments`
- only rows where `contributes_to_shared_busy = true`

This includes only:

- `assigned` bookings
- `booked` bookings
- active manual availability blocks

This excludes:

- `inquiry`
- `hold`
- `requested`
- `completed`
- `cancelled`

Transform and visibility rules remain unchanged:

- merge overlapping busy intervals
- return interval only for `busy`
- return interval plus `region_label` for `busy_region`
- never expose title, venue name, lifecycle state, request state, or notes

---

## 8. Updated Acceptance Criteria

The revised MVP schema and contract is accepted when all of the following are true:

1. `bookings` remains the only calendar-truth object.
2. `manual_availability_blocks` remain separate explicit schedule objects.
3. `booking_requests`, `shift_occurrences`, and `bookings` remain separate objects.
4. hard assignment-blocking logic is limited to overlap with:
   - `assigned` bookings
   - `booked` bookings
   - active manual availability blocks
5. `inquiry`, `hold`, and `requested` are soft-state bookings and do not by themselves hard-block assignment.
6. soft-state bookings still participate in possible conflict, review-needed, and alert recomputation logic.
7. public shared busy output includes only:
   - `assigned` bookings
   - `booked` bookings
   - active manual availability blocks
8. soft-state bookings never appear in the shared route.
9. creating or updating a manual availability block is blocked when it overlaps:
   - an `assigned` booking
   - a `booked` booking
10. overlap between a manual availability block and a soft-state booking is allowed and causes downstream alert recalculation on the affected booking side.
11. `shift_template_status` uses only:
   - `active`
   - `paused`
   - `archived`
12. no `ended` template lifecycle appears in schema, API contracts, validation rules, or acceptance logic.
13. operator agenda remains bookings only.
14. operator coverage remains shift occurrences only.
15. occurrence capacity math remains:
   - `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`

---

## 9. Final Revised MVP Schema & API Contract Definition

Adopt the Phase 6 schema/API contract with the following targeted revisions locked:

### A. `schedule_commitments` revision

`schedule_commitments` remains in the schema as the normalized known-time conflict surface, with explicit behavior split across three flags:

- `blocks_assignment`
- `contributes_to_shared_busy`
- `participates_in_possible_conflict`

Use the following mapping:

| Source | blocks_assignment | contributes_to_shared_busy | participates_in_possible_conflict |
|---|---:|---:|---:|
| Manual Availability Block | true | true | true |
| Booking: Inquiry | false | false | true |
| Booking: Hold | false | false | true |
| Booking: Requested | false | false | true |
| Booking: Assigned | true | true | true |
| Booking: Booked | true | true | true |

Do not maintain active commitment rows for:

- `completed`
- `cancelled`
- time-TBD bookings

### B. hard conflict enforcement revision

Hard conflict exists only for overlap with:

- `assigned`
- `booked`
- active manual availability block

Use only `schedule_commitments.blocks_assignment = true` for hard assignment-blocking enforcement.

### C. possible conflict revision

Possible conflict includes:

- overlap with `inquiry`, `hold`, or `requested`
- incomplete timing
- Time TBD ambiguity
- block-over-soft-state overlap consequences

Use:

- `schedule_commitments.participates_in_possible_conflict = true` for known-time rows
- direct booking inspection for time-TBD soft-state rows

### D. shared availability revision

Public share output must be generated only from `schedule_commitments` rows where:

- `contributes_to_shared_busy = true`

That means only:

- `assigned`
- `booked`
- active manual availability block

### E. manual availability block revision

Manual block save/update rules are now:

- reject on overlap with `assigned` or `booked`
- allow overlap with `inquiry`, `hold`, `requested`
- after allowed soft-state overlap, recompute impacted soft-state booking alerts

### F. shift template lifecycle revision

`shift_template_status` is permanently limited in MVP to:

- `active`
- `paused`
- `archived`

Remove all references to `ended`.

These revisions fully replace the previously drifted interpretations while preserving the rest of the Phase 6 schema/API contract as approved.
