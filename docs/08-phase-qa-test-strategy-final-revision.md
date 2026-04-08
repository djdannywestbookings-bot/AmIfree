# [8] Phase — QA / Test Strategy Final Revision

## 1. Revision Summary

This revision makes one targeted correction to the QA / Test Strategy’s sharing language and leaves the rest of the strategy unchanged.

The corrected sharing rule is now explicit and consistent throughout:

- **Active Manual Availability Blocks do appear as busy in public/shared output**
- **Private block labels, reasons, notes, and internal details never appear externally**
- **Public shared busy output includes only:**
  - Assigned bookings
  - Booked bookings
  - Active Manual Availability Blocks
- **Soft-state bookings do not appear in public/shared busy output:**
  - Inquiry
  - Hold
  - Requested

No other strategy scope, layer ownership, or test priorities are changed.

---

## 2. Updated Public Sharing Test Matrix

| Share Mode / Scenario | What must appear | What must never appear |
|---|---|---|
| Busy | Busy intervals only | title, venue name, address, notes, requester, lifecycle, conflicts, internal IDs |
| Busy + Region | Busy intervals + region/city-state only | title, venue, precise private details, requester, internal notes, conflicts |
| No share / revoked | No public access | any interval or metadata |
| Soft-state booking present | Should not appear in public shared busy output | Inquiry/Hold/Requested visibility |
| Assigned/Booked booking present | Busy interval appears if share is active | underlying private fields hidden |
| Active Manual Availability Block present | Busy interval appears in public/shared output | private block label, private block reason, notes, internal details, internal IDs |
| Cross-midnight interval | Accurate start/end interval | wrong date/day caused by local conversion |

---

## 3. Updated Any Other Affected Sections

### 9. Domain Test Matrix — sharing and public view

**What must be tested**
- busy mode shows only busy intervals
- busy+region shows busy intervals plus region/city-state only
- no private event title, venue, notes, lifecycle internals, conflict details, or requester info leak
- Inquiry/Hold/Requested do not appear in public shared busy output
- Assigned/Booked busy intervals do appear in public shared output
- Active Manual Availability Blocks do appear as busy in public shared output
- private Manual Availability Block labels, reasons, notes, and internal details never appear externally
- sharing output is derived from the correct schedule truths
- revoked/expired share handling if present in MVP

**Best test layers**
- unit: projection/whitelist functions
- service/domain: share payload assembly
- API contract: schema whitelist
- integration: endpoint response body assertions
- E2E: public share link rendering

### 10. Core Role / Permission / Privacy Test Matrix

**Required permission tests**
- unauthorized actor gets 401/403 consistently
- actors cannot mutate out-of-scope records by ID guessing
- public endpoint cannot infer private record existence through error differences
- hidden/private fields are absent, not merely blanked in UI
- Active Manual Availability Blocks appear externally only as busy intervals, never with private block labels, reasons, notes, or internal metadata

### 16. API and Schema Validation Strategy

#### 16.2 Recommended API validation approach
Use contract tests to verify:
- successful response bodies for core routes
- validation failures for malformed payloads
- unauthorized and forbidden responses
- public share response whitelist
- backward-stable enum values used by UI
- public share payload includes busy intervals from Assigned bookings, Booked bookings, and Active Manual Availability Blocks only
- public share payload excludes soft-state bookings and excludes Manual Availability Block private labels/reasons/details

### 22. Launch-Blocking Quality Gates

#### 22.2 Privacy/security gates
- public share leaks private details beyond approved mode
- public share fails to include Active Manual Availability Blocks as busy intervals
- unauthorized user can view or mutate out-of-scope records
- internal/private fields are exposed in public API payloads
- private Manual Availability Block labels, reasons, notes, or internal details are exposed externally

---

## 4. Final Revised MVP QA / Test Strategy

AmIFree Scheduler’s MVP QA strategy remains risk-first, domain-first, and mobile-first. Its purpose is to protect schedule truth, prevent unsafe staffing decisions, preserve privacy boundaries, and keep the booking/request/occurrence model internally consistent under real nightlife workflows.

The core truths this QA strategy protects remain unchanged:

- Booking is the only calendar-truth object.
- Manual Availability Blocks are separate, explicit schedule objects.
- Booking Requests, Shift Occurrences, and Bookings remain distinct.
- Intake Drafts stage Booking creation only and never commit schedule truth before review.
- Request linkage remains single-path and non-duplicative.
- Hard-conflicted items cannot advance to Assigned or Booked.
- Operator staffing eligibility uses private internal truth, not public sharing visibility.
- Agenda and Coverage remain separate views over separate object types.
- Public sharing exposes only approved interval-based availability output.
- Cross-midnight and service-day logic behave consistently for nightlife workflows.

The corrected and final sharing truth for QA is:

- External sharing modes are only **Busy** and **Busy + Region**
- Shared viewers see only blocked time and optionally region/city-state
- Public shared busy output includes only:
  - Assigned bookings
  - Booked bookings
  - Active Manual Availability Blocks
- Soft-state bookings do not appear in public shared busy output:
  - Inquiry
  - Hold
  - Requested
- Active Manual Availability Blocks appear externally as busy intervals
- Private Manual Availability Block labels, reasons, notes, and internal details never appear externally

The recommended execution model remains unchanged:

- heavy coverage of pure rules and domain services
- focused integration tests around persistence, async jobs, and API permissions
- a small number of stable, high-value E2E tests
- deliberate manual exploratory testing for mobile, intake messiness, and nightlife edge cases

The automated suite remains focused on:
- conflict rules
- linkage invariants
- capacity math
- permission/privacy boundaries
- service-day logic
- public share payload safety
- async idempotency for request/template/notification flows

The manual suite remains focused on:
- messy real-world intake inputs
- cross-midnight scheduling confidence
- mobile readability and actionability
- operator staffing trust
- public-share safety verification

The release remains blocked by any defect that compromises schedule truth, assignment safety, privacy, request-linkage integrity, or core mobile usability, including any defect where public sharing omits Active Manual Availability Blocks from busy output or exposes their private labels, reasons, notes, or internal details.
