# [20] Phase — Reporting, Dashboards & Internal BI Spec Final Revision

## 1. Revision Summary

This final revision makes one targeted correction to the current Reporting, Dashboards & Internal BI Spec: the North Star Metric, **Trusted Scheduled Commitments (TSC) per week**, is now explicitly and consistently defined as a **Booking-based** metric, not a generic schedule-commitments count.

The corrected metric definition is:

- **TSC per week** = count of trustworthy **Bookings** in the states:
  - **Assigned**
  - **Booked**
  - **Completed**
- counted only when they satisfy the approved integrity conditions
- explicitly **excluding**:
  - Manual Availability Blocks
  - Booking Requests
  - Shift Occurrences
  - Shift Templates
  - any other non-Booking record

The corrected source strategy is:

- **Primary TSC source**:
  - canonical **bookings truth view**
  - optionally joined with integrity / request-linkage validation views where needed for trust qualification
- **Supporting but non-primary TSC source**:
  - `schedule_commitments` and its reporting truth view(s), used only for:
    - overlap truth
    - freshness validation
    - conflict integrity checks
    - operational trust support

Nothing else in the BI/reporting model changes. All current structure, dashboard inventory, reporting boundaries, privacy rules, staffing separation, and small-team implementation posture remain intact.

## 2. Updated Data Source Strategy

### 2.1 Source-of-truth tables

These remain the authoritative reporting inputs for operational truth.

#### Required source-of-truth entities
- organizations
- workspaces
- teams
- persons / DJ profiles
- workspace memberships / roles
- bookings
- booking_requests
- shift_templates
- shift_occurrences
- manual_availability_blocks
- schedule_commitments
- notification records
- share/public-link records
- audit log records
- intake drafts
- operator actions / assignment actions
- support case linkage tables if present
- billing/subscription state tables later

#### Rules for source-of-truth use
Use source tables or canonical SQL views for:
- **TSC per week**
- Booking state counts
- Booking lifecycle conversion counts
- request-linkage integrity
- coverage fill rate
- occurrence capacity integrity
- hard-conflict escape rate
- schedule commitment freshness
- privacy validation pass rate
- staffing eligibility outcomes
- support diagnostics
- auditability

#### Updated TSC source rule
**Trusted Scheduled Commitments (TSC) per week must be computed from Booking truth, not from generic schedule commitments.**

TSC must be derived from a canonical bookings truth surface that:
- includes only **Booking** records
- includes only Bookings in:
  - **Assigned**
  - **Booked**
  - **Completed**
- applies approved integrity conditions
- excludes:
  - Manual Availability Blocks
  - Booking Requests
  - Shift Occurrences
  - Shift Templates
  - any non-Booking record

`schedule_commitments` remains important, but only as a **supporting integrity/freshness input** for TSC and related trust checks. It is **not** the canonical primary numerator source for TSC.

#### Canonical truth views recommended
Build and maintain a small set of reviewed SQL truth views:
- `reporting.bookings_truth_v1`
- `reporting.booking_request_linkage_truth_v1`
- `reporting.shift_occurrence_capacity_truth_v1`
- `reporting.schedule_commitments_truth_v1`
- `reporting.workspace_activation_truth_v1`
- `reporting.public_share_privacy_truth_v1`
- `reporting.notifications_truth_v1`

#### Updated TSC computation recommendation
For TSC specifically, use:
- `reporting.bookings_truth_v1` as the primary source
- with optional joins to:
  - `reporting.booking_request_linkage_truth_v1` where linkage integrity is part of trust qualification
  - `reporting.schedule_commitments_truth_v1` where freshness/overlap/conflict validation is part of trust qualification

The primary counting unit for TSC remains the **Booking**, not the schedule commitment row.

### 2.2 Event streams

No change. Event streams continue to support:
- onboarding funnel steps
- setup actions
- intake interactions
- share-link creation interactions
- notification opened/clicked/viewed interactions
- workflow interaction timing
- UI surface adoption
- feature discoverability
- selected latency milestones

They remain invalid as the primary truth source for:
- final Booking count
- final Booking state
- request-linkage integrity rate
- open slot count
- privacy exposure state
- hard conflict blocking
- **TSC per week**

### 2.3 Derived rollups / materialized views

No structural change. Rollups remain valid and recommended.

#### Updated TSC rollup rule
The weekly TSC rollup must be built from:
- `reporting.bookings_truth_v1`
- plus any required trust-qualification joins

It must **not** be built primarily from `schedule_commitments_truth_v1`.

Recommended TSC rollup:
- `reporting.weekly_tsc_rollup_v1`

Recommended columns:
- organization_id
- workspace_id
- service_week_start
- trusted_scheduled_commitments_count
- assigned_booking_count_in_tsc
- booked_booking_count_in_tsc
- completed_booking_count_in_tsc
- excluded_non_booking_count_for_validation
- integrity_rule_version
- as_of_timestamp

## 3. Updated Metric-to-Source Mapping

### 3.1 North Star and primary success metrics

#### Trusted Scheduled Commitments (TSC) per week
**Updated Definition:**
Count of trustworthy **Bookings** per week in the states:
- **Assigned**
- **Booked**
- **Completed**

These Bookings must satisfy approved integrity conditions. TSC is explicitly a **Booking-based** metric and is **not** a generic count of schedule commitments.

**Explicit exclusions:**
- Manual Availability Blocks
- Booking Requests
- Shift Occurrences
- Shift Templates
- any other non-Booking record

**Primary Source:**
- `reporting.bookings_truth_v1`

**Supporting validation inputs where required:**
- `reporting.booking_request_linkage_truth_v1`
- `reporting.schedule_commitments_truth_v1` for overlap/freshness/conflict integrity support only

**Layer:**
- bookings truth view + weekly rollup

**Owner:**
- Product + Operations + Data/Engineering

**Implementation note:**
The primary counting unit is the Booking record. Supporting tables may validate trustworthiness, but they do not replace the Booking-based numerator.

---

#### Workspace Setup Activation Rate (7-day)
No change.

#### Workflow Activation Rate (14-day)
No change.

#### Weekly Active Scheduling Workspaces
No change.

#### Coverage Fill Rate
No change.

#### Request Linkage Integrity Rate
No change.

#### Hard-Conflict Escape Rate
No change.

#### Public Share Privacy Validation Pass Rate
No change.

#### Occurrence Capacity Integrity Rate
No change.

#### Schedule Commitment Freshness Rate
No change.

### 3.2 Supporting metrics

#### Updated TSC-adjacent supporting metrics
To keep TSC explainable and auditable, the reporting layer should expose supporting diagnostic metrics alongside the North Star:
- TSC by Booking state:
  - Assigned
  - Booked
  - Completed
- Bookings excluded from TSC due to failed trust/integrity checks
- TSC-qualified Bookings with stale schedule commitment freshness warnings
- TSC-qualified Bookings with linkage anomalies requiring review
- non-Booking schedule objects in the same operational window, reported separately but never included in TSC

These are diagnostic/support metrics only and do not change the North Star definition.

## 4. Updated Any Other Affected Sections

### 4.1 Updated Reporting, Dashboards & Internal BI Summary

The reporting model remains a three-layer system:
1. operational truth layer from first-party source tables and governed SQL truth views
2. behavior/event layer from product instrumentation
3. derived reporting layer from reproducible rollups/materialized views

The North Star Metric is explicitly:
- **Trusted Scheduled Commitments (TSC) per week**
- defined from trustworthy **Bookings**
- limited to Bookings in:
  - Assigned
  - Booked
  - Completed
- excluding Manual Availability Blocks and all other non-Booking records

This preserves Booking as the only calendar-truth object while allowing `schedule_commitments` to continue serving overlap truth, freshness checks, and conflict integrity support.

### 4.2 Updated Reporting Goals

Under the primary goals, the leadership/product reporting goal should be read as:
- Give leadership a trustworthy view of business and operating health anchored in **Booking-based North Star reporting**, with TSC derived from trustworthy Bookings rather than generic schedule-commitment counts.

No other goal changes.

### 4.3 Updated Dashboard Inventory References

#### Executive / Leadership Dashboard
The TSC panel must use a **Booking-based weekly TSC metric** from `reporting.bookings_truth_v1` and its weekly rollup, with optional supporting trust validation inputs.

It must not source the displayed TSC numerator primarily from `schedule_commitments_truth_v1`.

#### Integrity / Trust Dashboard
This dashboard should include a TSC diagnostic section that explains:
- which Booking records qualified for TSC
- which Booking records were excluded from TSC due to trust/integrity conditions
- whether any supporting `schedule_commitments` freshness/conflict checks affected Booking trust qualification

This remains a supporting integrity view, not a redefinition of TSC.

### 4.4 Updated Must-Have Reporting for Current Product and V1

#### Must-have canonical truth views
No structural change, but the TSC dependency is clarified:
- `reporting.bookings_truth_v1` is the canonical primary source for TSC
- `reporting.schedule_commitments_truth_v1` is supporting only for freshness/overlap/conflict validation
- `reporting.booking_request_linkage_truth_v1` may support trust qualification where required

#### Must-have metric owners
No change.

#### Must-have delivery approach
No change.

## 5. Final Revised Reporting, Dashboards & Internal BI Spec

AmIFree should keep the current Reporting, Dashboards & Internal BI Spec intact with one final locked correction:

### A. North Star definition
The North Star Metric is:

- **Trusted Scheduled Commitments (TSC) per week**

TSC is explicitly a **Booking-based** metric.

It counts trustworthy **Bookings** in the states:
- **Assigned**
- **Booked**
- **Completed**

It explicitly excludes:
- Manual Availability Blocks
- Booking Requests
- Shift Occurrences
- Shift Templates
- any other non-Booking record

### B. Canonical TSC source
The primary source for TSC must be:
- `reporting.bookings_truth_v1`

TSC may be qualified or validated using supporting truth views such as:
- `reporting.booking_request_linkage_truth_v1`
- `reporting.schedule_commitments_truth_v1`

But those supporting inputs do not replace the Booking-based numerator.

### C. Role of schedule_commitments
`schedule_commitments` remains important for:
- overlap truth
- freshness
- conflict integrity
- operational trust checks

It remains part of the reporting model and integrity model, but it is **not** the canonical primary numerator source for TSC.

### D. Dashboard and rollup behavior
All dashboards remain as currently specified:
1. Executive / Leadership
2. Product / Growth
3. Operations
4. Support
5. Integrity / Trust
6. Staffing / Coverage
7. Notification / Workflow Health

For these surfaces:
- TSC must be displayed and trended as a Booking-based metric
- operational and integrity drill-downs may reference schedule commitments for validation context
- coverage remains occurrence-based
- agenda remains Booking-based
- staffing eligibility remains separate from public sharing visibility

### E. Implementation posture
For MVP/V1, the BI/reporting model remains realistic for a small team:
- Supabase Postgres as source
- canonical reporting schema with truth views
- Graphile Worker refresh jobs
- derived rollups/materialized views
- lightweight internal dashboards/admin views
- no separate warehouse required yet

### F. Final lock
With this correction, the Reporting, Dashboards & Internal BI Spec now correctly aligns the North Star Metric with the locked analytics truth from Phase 9 while preserving the rest of the approved BI model unchanged:
- Booking remains the only calendar-truth object
- TSC remains explicitly Booking-based
- Manual Availability Blocks remain outside the TSC numerator
- request-linkage behavior remains exact
- Agenda vs Coverage separation remains intact
- approved occurrence-capacity math remains unchanged
- staffing eligibility remains separate from external sharing visibility
- reporting remains privacy-safe, reproducible, and small-team realistic
