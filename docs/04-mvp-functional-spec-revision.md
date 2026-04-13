# [4] Phase — MVP Functional Spec Revision

## 1. Revision Summary

This revision updates only the sections directly affected by the alignment issues called out in the current phase brief. All unchanged behavior, rules, permissions, lifecycle definitions, conflict rules, sharing rules, and acceptance criteria from the current MVP Functional Spec remain in force.

This revision does four things:

1. Restores full recurring Shift Template behavior from the approved wireframes by adding:
   - active start date
   - active end date
   - preview of generated upcoming occurrences before save
   - explicit pause / resume behavior
   - explicit future-occurrence generation behavior
   - explicit cross-midnight and service-day handling in template preview

2. Aligns Operator Schedule to the approved segmented behavior:
   - **Agenda** = Bookings only
   - **Coverage** = Shift Occurrences only
   - Shift Templates do not appear as dated schedule items until they are materialized into Shift Occurrences

3. Replaces the accidental single-slot simplification with the approved MVP multi-slot occurrence model:
   - Shift Templates may define `slots_needed`
   - Shift Occurrences may represent more than one staffing slot
   - Occurrences may be partially filled
   - operator surfaces may show fill states such as `0/1 filled`, `1/2 filled`, `2/2 filled`
   - Bookings remain the only calendar-truth object, with one Booking filling one staffed slot

4. Updates all directly affected scope, object, screen, rule, validation, staffing, and acceptance sections to match the approved wireframes while keeping the MVP implementation-aware and tight.

---

## 2. Updated MVP Scope / Out of Scope Corrections

### 2.1 Updated MVP Scope corrections

The following items are explicitly in scope for MVP and supersede the prior single-slot simplification:

- Recurring Shift Templates include:
  - venue
  - service-day weekday
  - active start date
  - active end date
  - exact local start time
  - exact local end time
  - timezone
  - `slots_needed`
  - preview of generated upcoming occurrences before save
  - pause / resume behavior

- Shift Occurrences may represent more than one staffing slot.

- The Operator Schedule is segmented into:
  - **Agenda** for Bookings only
  - **Coverage** for Shift Occurrences only

- Coverage surfaces show fill progress at the occurrence level using counts such as:
  - `0/1 filled`
  - `1/2 filled`
  - `2/2 filled`

- One occurrence may be linked to multiple Bookings, up to its slot capacity.

- One occurrence may be partially filled while still remaining open for additional staffing.

### 2.2 Updated Out of Scope corrections

The previous out-of-scope statement excluding “multi-slot staffing in a single Shift Occurrence object” is removed.

The following remain out of scope for MVP:

- A separate configurable Slot object with its own standalone lifecycle, schedule row, or editor.
- Different times per slot inside the same Shift Occurrence.
- Different venue assignments per slot inside the same Shift Occurrence.
- Different pay rates, contracts, or deal terms per slot inside the same Shift Occurrence.
- Mixed role definitions inside one occurrence, such as “1 opener + 1 closer” with different scheduling logic in the same object.
- Bulk multi-assign actions that fill several slots in one action.
- Auto-rebalancing or auto-reassignment when a partially filled occurrence changes.
- Advanced staffing optimization, ranking, or marketplace auto-fill behavior.
- Templates appearing on dated schedule views before materialization as occurrences.

MVP multi-slot staffing is intentionally simple:
- one occurrence has one shared time window
- one shared venue
- one shared staffing need
- `slots_needed` determines capacity
- each staffed DJ is represented by a separate linked Booking

---

## 3. Updated Core Objects

### 3.1 Shift Template

**Purpose**  
Shift Template defines a recurring weekly staffing need for a venue across a bounded active date range. A template may generate one or more dated Shift Occurrences, each with the same shared time window and slot count.

**Updated core data**
A Shift Template stores:
- `venue_id`
- `service_day_weekday`
- `active_start_date`
- `active_end_date`
- `local_start_time`
- `local_end_time`
- `timezone`
- `slots_needed`
- optional shared role / slot label
- optional notes
- status:
  - Active
  - Paused
  - Archived
- generation metadata
- audit metadata

**Field definitions**
- `service_day_weekday` is the recurring nightlife/service-day anchor, not a raw calendar-end-date label.
- `active_start_date` and `active_end_date` bound the dates on which the template may generate occurrences.
- `slots_needed` is an integer greater than or equal to 1 and defines how many DJs the generated occurrence needs.
- The optional shared role / slot label applies to the occurrence as a whole, not to distinct per-slot configurations.

**Template preview behavior**
Before save, the template builder must generate and display a preview of upcoming dated occurrences that would be created from:
- the selected service-day weekday
- active date range
- start and end times
- timezone
- cross-midnight behavior
- `slots_needed`

The preview must show:
- service day
- actual start date/time
- actual end date/time
- cross-midnight indicator when applicable
- initial fill state as `0/[slots_needed] filled`

### 3.2 Shift Occurrence

**Purpose**  
Shift Occurrence represents a dated staffing need derived either from a Shift Template or created one-off. An occurrence may require more than one DJ.

**Updated core data**
A Shift Occurrence stores:
- `venue_id`
- `template_id`, optional
- `service_day`
- `start_at`
- `end_at`
- `timezone`
- `slots_needed`
- `filled_slots_count` (derived)
- `active_request_count` (derived)
- `open_slots_count` (derived)
- status:
  - Open
  - Requested
  - Partially Filled
  - Filled
  - Cancelled
- optional shared role / slot label
- optional notes
- linked request ids
- linked booking ids
- audit metadata

**Derived count rules**
- `filled_slots_count` = count of linked Bookings on the occurrence in:
  - Assigned
  - Booked
  - Completed

  Requested, Inquiry, Hold, and Cancelled Bookings do not count as filled slots.

- `active_request_count` = count of linked Booking Requests in:
  - Sent
  - Viewed
  - Accepted

  Declined, Withdrawn, Expired, and Converted requests do not count as active requests.

- `open_slots_count` = `slots_needed - filled_slots_count - active_request_count`

  `open_slots_count` may not go below 0.

**Multi-slot rule**
One occurrence may have more than one linked Booking, but no more than its slot capacity after request capacity is considered.

### 3.3 Booking relationships if affected

The Booking object remains unchanged as the only calendar-truth object, with the following relationship clarifications:

- A Booking linked to a Shift Occurrence represents one DJ staffing one slot for that occurrence.
- One occurrence may therefore link to many Bookings.
- Each linked Booking may optionally store an internal `occurrence_slot_number` assigned at conversion or direct assignment time.
- `occurrence_slot_number` is an implementation detail for fill tracking and is not a separately managed user-facing object in MVP.
- A Booking created from a Booking Request linked to an occurrence remains in Requested until converted.
- Requested Bookings linked to an occurrence do not count as filled slots.

---

## 4. Updated Object Relationships and Source-of-Truth Rules

### 4.1 Shift Template to Shift Occurrence relationship

- One Shift Template may generate many Shift Occurrences.
- Generated occurrences must fall within the template’s active start and end dates.
- Templates do not appear on dated schedules.
- Only generated occurrences appear on Coverage views.

### 4.2 Shift Occurrence to Booking relationship

- A Shift Occurrence may link to many Bookings.
- Each linked Assigned, Booked, or Completed Booking fills one slot on that occurrence.
- Bookings remain the only calendar-truth objects for staffed DJs.
- The occurrence itself does not write to any DJ calendar.

### 4.3 Shift Occurrence to Booking Request relationship

- A Shift Occurrence may link to many Booking Requests over time.
- Each Booking Request linked to an occurrence is a request for one slot on that occurrence.
- Requests are **per occurrence**, not pre-bound to a fixed slot at creation time.
- A request occupies one unit of open staffing capacity while it is active.
- When a request is converted into an Assigned or Booked Booking, it is bound to the next available internal occurrence slot number.

### 4.4 Capacity and uniqueness rules

For any active, non-cancelled occurrence:
- `slots_needed` defines maximum staffing capacity.
- `filled_slots_count + active_request_count` may not exceed `slots_needed`.
- One DJ may not hold more than one active linked Booking for the same occurrence.
- One DJ may not hold more than one active Booking Request for the same occurrence at the same time.

### 4.5 Partial-fill source-of-truth rule

Partial fill is an occurrence-level staffing concept only.

- A partially filled occurrence does not by itself block any DJ calendar.
- Only the linked Bookings for assigned/booked DJs create calendar occupancy.
- Remaining open capacity does not affect other DJs until a request or assignment is created for them.

### 4.6 Status derivation relationship rule

Occurrence status is derived as follows:

- **Open**
  - `filled_slots_count = 0`
  - `active_request_count = 0`

- **Requested**
  - `filled_slots_count = 0`
  - `active_request_count > 0`

- **Partially Filled**
  - `filled_slots_count > 0`
  - `filled_slots_count < slots_needed`

- **Filled**
  - `filled_slots_count = slots_needed`

- **Cancelled**
  - explicit terminal occurrence state

If an occurrence is partially filled and also has active requests, it remains **Partially Filled** and surfaces both:
- fill ratio
- active request count

### 4.7 Booking as only calendar-truth object remains unchanged

The following remain true without exception:
- Booking Request, Shift Occurrence, and Booking remain separate objects.
- Booking is the only calendar-truth object.
- Manual Availability Block remains the only non-Booking object that may block availability.

---

## 5. Updated Screen-by-Screen Functional Behavior

### 5.1 Home — Operator

Home — Operator remains staffing-first, with the following alignment updates:

**Updated summary blocks**
- today / next service day Agenda Bookings
- open Coverage gaps by open slot count
- partially filled occurrences
- pending active requests
- venues with upcoming recurrence activity

**Updated quick actions**
- New Request
- New Occurrence
- New Template
- Add Venue

**Updated list behavior**
Home cards for staffing needs must reflect occurrence fill state using ratios such as:
- `0/1 filled`
- `1/2 filled`
- `2/2 filled`

Cards may also show:
- active requests count
- open slots remaining

### 5.2 Schedule — Operator

Operator Schedule is explicitly segmented into:

- **Agenda**
- **Coverage**

#### Agenda segment

**Agenda = Bookings only**

Agenda shows only Bookings relevant to the operator’s owned requests, assignments, and venue staffing flows.

Agenda does not show:
- Shift Templates
- raw Shift Occurrences
- undated staffing placeholders

Each Agenda item represents one Booking.  
If one occurrence needs 2 DJs and both are staffed, Agenda shows 2 Booking items.

Agenda uses:
- the same date-strip + mobile agenda timeline pattern
- the same nightlife/service-day grouping logic
- the same approximate visible time window of 12:00 PM through 6:00 AM next day

Agenda items may include lifecycle chips such as:
- Requested
- Assigned
- Booked
- Cancelled

#### Coverage segment

**Coverage = Shift Occurrences only**

Coverage shows one row/card per Shift Occurrence.

Each Coverage item must show:
- venue
- service day
- time window
- `slots_needed`
- fill ratio
- active request count when greater than 0
- derived occurrence status

Examples:
- `0/1 filled`
- `1/2 filled`
- `2/2 filled`

Coverage does not show:
- templates as dated items
- separate booking rows per staffed DJ

Templates remain accessible only through Venue Detail and Template Builder flows until they materialize as occurrences.

**Coverage actions**
From a Coverage item the operator can:
- open Shift Occurrence Detail
- open Assignment Sheet
- send request if `open_slots_count > 0`
- create direct assignment if `open_slots_count > 0`

### 5.3 Venue Detail

Venue Detail remains the venue-specific staffing entry point, with these updates:

**Updated content**
- venue details and timezone
- active Shift Templates with:
  - service-day weekday
  - active start/end date
  - time window
  - `slots_needed`
  - status
- upcoming Shift Occurrences with:
  - fill ratio
  - active request count
  - status
- recent linked operator-owned Bookings

**Updated actions**
- create Shift Template
- edit/pause/resume/archive Shift Template
- create one-off Shift Occurrence
- open Shift Occurrence Detail
- open Agenda or Coverage context

### 5.4 Shift Template Builder

Shift Template Builder is revised as follows.

**Required fields**
- venue
- service-day weekday
- active start date
- active end date
- local start time
- local end time
- timezone
- `slots_needed`

**Optional fields**
- shared role / slot label
- notes
- initial status

**Preview behavior before save**
The builder must generate a preview of upcoming occurrences that would be materialized.

Each preview row must show:
- service day label
- actual local calendar start
- actual local calendar end
- cross-midnight indicator when start and end fall on different local dates
- initial fill state `0/[slots_needed] filled`

**Cross-midnight / service-day behavior in preview**
- If local start time is 6:00 AM or later, the occurrence starts on the displayed service-day date.
- If local start time is before 6:00 AM, the occurrence’s service day is the previous nightlife day, and preview must show the actual calendar start occurring on the following local calendar date.
- If end time is earlier than start time, preview must render the occurrence as cross-midnight into the next local calendar date.
- Preview must use venue timezone.

**Save behavior**
On save, the template materializes future Shift Occurrences within the active date range according to the preview. Templates themselves do not appear on the dated schedule.

**Pause / resume behavior**
- Pausing a template stops creation of new future occurrences.
- Already materialized occurrences remain unchanged.
- Resuming a template regenerates missing future occurrences inside the remaining active date range.
- Resume is not allowed if the active end date has already passed unless the date range is extended first.

### 5.5 One-Off Shift Occurrence Create Flow

The one-off occurrence flow is updated to include multi-slot behavior.

**Required fields**
- venue
- service day/date
- exact start time
- exact end time
- timezone
- `slots_needed`

**Optional fields**
- shared role / slot label
- notes

**Behavior**
- exact times remain required
- save creates one dated Shift Occurrence
- initial display state is `0/[slots_needed] filled`
- one-off occurrences appear in Coverage, not as templates
- no DJ calendar is blocked until linked Bookings are created

### 5.6 Shift Occurrence Detail

Shift Occurrence Detail is revised to support partial fill and multi-slot capacity.

**Updated content**
- status
- venue
- service day
- exact time window
- timezone
- `slots_needed`
- `filled_slots_count`
- `active_request_count`
- `open_slots_count`
- fill ratio
- linked requests
- linked Bookings
- activity log

**Updated fill display examples**
- `0/1 filled`
- `1/2 filled`
- `2/2 filled`

**Updated actions**
- open Assignment Sheet
- send request when `open_slots_count > 0`
- direct assign when `open_slots_count > 0`
- edit occurrence
- cancel occurrence

**Behavior**
- a partially filled occurrence remains open for additional staffing until filled or cancelled
- if `open_slots_count = 0`, request and direct assignment actions are disabled
- linked Bookings are shown as separate staffed entries
- linked active requests are shown separately from staffed Bookings

### 5.7 Assignment Sheet

Assignment Sheet is revised to support one-at-a-time fill into multi-slot occurrences.

**Header context**
The sheet must show:
- occurrence venue
- date/service day
- time window
- fill ratio
- active request count
- open slots remaining

**Candidate groups remain**
- Eligible
- Review Needed
- Blocked

**Action behavior**
- **Assign now** assigns one candidate into one currently open slot.
- **Send Request** creates one Booking Request for one open slot on the occurrence.
- repeated use of the sheet may fill multiple slots over time until the occurrence is filled

**Important MVP simplification**
There is no separate user-managed slot picker in MVP.  
All open slots in an occurrence are interchangeable.  
The system assigns the next available internal slot position when:
- direct assignment occurs, or
- a request converts into a staffed Booking

**Capacity behavior**
- If `open_slots_count = 0`, new request and assign actions are disabled.
- If a candidate already has an active linked request or linked Booking for the occurrence, that candidate may not be requested or assigned again for the same occurrence.

---

## 6. Updated Shift Template and Shift Occurrence Rules

### 6.1 Shift Template rules

- A Shift Template defines a recurring weekly staffing need across an active date range.
- The template’s weekday is the **service-day weekday**.
- `active_start_date` and `active_end_date` are required in MVP.
- `slots_needed` is required and must be at least 1.
- Template preview is required before save.
- Preview must show cross-midnight and service-day results in venue timezone.
- Saving an Active template generates dated future Shift Occurrences matching the preview.
- Historical occurrences before the current local date are not backfilled by template save.
- Templates do not appear in dated Agenda or Coverage schedule segments until they generate occurrences.
- Pausing a template stops future generation only.
- Resuming a template generates missing future occurrences within the remaining active date range.
- Archiving a template preserves history and prevents future generation.

### 6.2 Template edit rules

Editing a template may affect only future occurrences that are still untouched.

A future occurrence is considered untouched only when:
- `filled_slots_count = 0`
- `active_request_count = 0`
- occurrence status is not Cancelled

If a future occurrence already has:
- any active request, or
- any staffed Booking, or
- a cancelled history state

then that occurrence is not rewritten by template edits.

Template edits therefore apply to:
- newly generated future occurrences
- existing future untouched occurrences only

### 6.3 Shift Occurrence rules

- A Shift Occurrence may be template-generated or one-off.
- A Shift Occurrence may need one or more DJs.
- `slots_needed` defines maximum staffing capacity.
- Exact times are required for all occurrences.
- Each occurrence uses one shared venue, one shared time window, and one shared timezone.
- Slots are interchangeable in MVP.
- There is no separate standalone Slot object in MVP.

### 6.4 Multi-slot fill rules

- A single occurrence may have more than one linked Booking.
- Each linked Assigned, Booked, or Completed Booking counts as one filled slot.
- A single DJ may fill only one slot on a given occurrence.
- A single active request also consumes one unit of open staffing capacity for that occurrence.
- `open_slots_count` determines whether additional request or assignment actions are allowed.

### 6.5 Request granularity rule

Requests are **per occurrence** and represent intent to fill one slot on that occurrence.

Requests are not user-bound to named slot positions at creation time.

When converted, the request fills the next available internal occurrence slot number.

### 6.6 Occurrence status derivation rules

Occurrence statuses are:

- **Open**
  - no staffed Bookings
  - no active requests

- **Requested**
  - no staffed Bookings
  - one or more active requests

- **Partially Filled**
  - at least one staffed Booking exists
  - total staffed Bookings are fewer than `slots_needed`

- **Filled**
  - staffed Bookings equal `slots_needed`

- **Cancelled**
  - occurrence is explicitly cancelled

Fill ratios must still be shown even when status text is present.

### 6.7 Partial-fill rule

A partially filled occurrence:
- remains available for additional staffing up to capacity
- may continue to receive requests or direct assignments while `open_slots_count > 0`
- appears in Coverage as partially filled
- may show both staffed Bookings and pending requests at the same time

### 6.8 Cancellation rule for multi-slot occurrences

If an occurrence is cancelled:

- the occurrence moves to Cancelled
- all active linked Booking Requests move to:
  - Withdrawn, or
  - Expired if already time-expired
- all linked Requested Bookings tied to those requests move to Cancelled
- all linked Assigned or Booked Bookings for the occurrence move to Cancelled after explicit confirmation
- historical audit records remain intact

Occurrence cancellation is blocked if any linked Booking for the occurrence is already in Completed state.

---

## 7. Updated Save / Validation / Blocking Rules

### 7.1 Shift Template save rules

A Shift Template requires:
- venue
- service-day weekday
- active start date
- active end date
- exact start time
- exact end time
- timezone
- `slots_needed >= 1`

Save is blocked when:
- `active_end_date` is earlier than `active_start_date`
- preview cannot generate at least one future occurrence inside the active range
- timezone is missing
- `slots_needed` is less than 1

Preview generation must complete before final save is enabled.

### 7.2 Shift Template generation rules

On save:
- the system generates future occurrences within the active date range
- generation begins at the first matching service day on or after the current local date and on or after `active_start_date`
- generation ends at `active_end_date`
- duplicate generation for the same template + service day must be prevented

### 7.3 Shift Template pause / resume validation

Pause is allowed when template status is Active.

Resume is allowed only when:
- template status is Paused
- active end date has not passed, or the date range is edited forward first

On resume:
- missing future occurrences inside the valid date range are generated
- already existing occurrences are not duplicated

### 7.4 Shift Occurrence save rules

A Shift Occurrence requires:
- venue
- exact start time
- exact end time
- timezone
- service day/date
- `slots_needed >= 1`

Save is blocked when:
- any required field is missing
- `slots_needed < 1`
- edited `slots_needed` would be less than `filled_slots_count + active_request_count`
- occurrence cancellation is attempted while any linked Booking is Completed

### 7.5 Request creation rules for multi-slot occurrences

A new Booking Request linked to an occurrence may be created only when:
- occurrence is not Cancelled
- `open_slots_count > 0`
- target DJ is not already actively linked to that occurrence by request or staffed Booking

Sending the request:
- creates one Booking Request
- creates the linked Requested Booking
- reduces `open_slots_count` by consuming one unit of request capacity

### 7.6 Direct assignment rules for multi-slot occurrences

Direct assignment may occur only when:
- occurrence is not Cancelled
- `open_slots_count > 0`
- target DJ is Eligible
- target DJ has no existing active request or staffed Booking on that occurrence
- no Hard Conflict exists

Direct assignment:
- creates or updates one Booking for that DJ
- assigns the next available internal occurrence slot number
- increments `filled_slots_count`
- reduces `open_slots_count`

### 7.7 Conversion rules for accepted requests

A request linked to an occurrence may convert into a staffed Booking only when:
- the request is active and non-terminal
- occurrence is not Cancelled
- no Hard Conflict exists
- the request’s target DJ does not already fill a slot on that occurrence

Conversion:
- changes the request to Converted
- updates the linked Booking to Assigned or Booked
- binds the Booking to the next available internal occurrence slot number
- increments `filled_slots_count`
- reduces `active_request_count`
- recalculates `open_slots_count`

### 7.8 Occurrence edit rules

Editing occurrence time, venue, or slot count must trigger:
- permission check
- validation
- conflict re-evaluation for all linked staffed Bookings
- fill-count recalculation
- activity logging

If an edit would make the occurrence invalid relative to current staffing capacity, save must be blocked rather than silently dropping linked staffing.

---

## 8. Updated Staffing and Partial-Fill Rules

### 8.1 Slot model used in MVP

The MVP uses a **count-based multi-slot model**, not a standalone slot-object model.

The model is:

- `slots_needed` defines required headcount
- `filled_slots_count` defines staffed headcount
- `active_request_count` defines pending requested headcount
- `open_slots_count` defines remaining requestable/assignable headcount

### 8.2 Count definitions

- `slots_needed`
  - required number of DJs for the occurrence
  - integer >= 1

- `filled_slots_count`
  - count of linked Bookings in Assigned, Booked, or Completed
  - one linked staffed Booking = one filled slot

- `open_slots_count`
  - `slots_needed - filled_slots_count - active_request_count`
  - represents the remaining capacity available for new request or assign actions

### 8.3 How many DJs can be assigned to one occurrence

One occurrence may have up to `slots_needed` unique DJs staffed.

No DJ may occupy more than one active slot on the same occurrence.

### 8.4 Requests: per occurrence or per slot

Requests are **per occurrence**, one request representing one intended staffed slot.

They are not manually bound to fixed slot numbers at request creation time.

### 8.5 Linked Bookings: per occurrence or per slot

Linked Bookings are effectively **per staffed slot**.

One staffed DJ = one linked Booking = one filled slot.

A multi-slot occurrence may therefore have many linked Bookings.

### 8.6 Eligibility behavior for multi-slot occurrences

Candidate eligibility is still evaluated against:
- the occurrence’s shared time window
- venue/timezone context
- the candidate’s private source-of-truth schedule

Because all slots in MVP are interchangeable, the same eligibility logic applies to every open slot on that occurrence.

Candidate groups remain:
- Eligible
- Review Needed
- Blocked

### 8.7 Partial-fill behavior

An occurrence may be partially filled and still have pending requests.

Examples:
- `1/2 filled` with `0` active requests
- `1/2 filled` with `1` active request
- `0/2 filled` with `2` active requests

### 8.8 Fill completion behavior

An occurrence becomes Filled only when:
- `filled_slots_count = slots_needed`

Once Filled:
- new request actions are disabled
- new direct assignment actions are disabled
- Coverage shows the occurrence as filled

### 8.9 Capacity release behavior

Capacity is released when:
- a request is Declined, Withdrawn, Expired, or Converted
- a staffed Booking linked to the occurrence is Cancelled

After capacity is released:
- `active_request_count` and/or `filled_slots_count` recalculate
- `open_slots_count` recalculates
- occurrence status may move from Filled or Partially Filled back to a lower-capacity state if staffing was removed before completion

### 8.10 Duplicate targeting rules

For the same occurrence:
- one DJ cannot have two active requests
- one DJ cannot have two staffed Bookings
- one DJ cannot be directly assigned if already requested and active for that occurrence
- one DJ cannot be requested if already staffed on that occurrence

### 8.11 Force-assignment remains blocked

All prior force-assignment restrictions remain unchanged.

Even in multi-slot occurrences:
- operators cannot force-assign hard-conflicted DJs
- hard-conflicted items cannot advance to Assigned or Booked
- Booking remains the only schedule-truth object for a staffed fill

---

## 9. Updated Feature-Level Acceptance Criteria

### 9.1 Shift Template acceptance criteria

- A template requires active start date and active end date.
- A template requires `slots_needed`.
- Before template save, the system shows a preview of upcoming generated occurrences.
- Preview shows service day, actual local start/end timestamps, and cross-midnight behavior when applicable.
- Saving an active template materializes future occurrences within the active date range.
- Pausing a template stops future occurrence generation without deleting already created occurrences.
- Resuming a paused template regenerates missing future occurrences inside the remaining valid date range.
- Templates do not appear as dated schedule items until materialized as occurrences.

### 9.2 Operator Schedule acceptance criteria

- Operator Schedule contains two segments:
  - Agenda
  - Coverage
- Agenda shows Bookings only.
- Coverage shows Shift Occurrences only.
- Templates do not appear in Agenda or Coverage as dated items before materialization.
- A multi-staffed occurrence with 2 linked Bookings produces 2 Booking rows in Agenda and 1 occurrence row in Coverage.

### 9.3 Multi-slot occurrence acceptance criteria

- A Shift Template may define `slots_needed > 1`.
- A one-off Shift Occurrence may define `slots_needed > 1`.
- An occurrence can display fill ratios such as:
  - `0/1 filled`
  - `1/2 filled`
  - `2/2 filled`
- One occurrence may link to multiple staffed Bookings.
- One occurrence may be partially filled.
- One DJ cannot fill more than one slot on the same occurrence.

### 9.4 Request and assignment capacity acceptance criteria

- A request linked to an occurrence consumes one unit of staffing capacity while active.
- New requests cannot be sent when `open_slots_count = 0`.
- Direct assignment cannot occur when `open_slots_count = 0`.
- Converting a request to a staffed Booking preserves capacity math correctly.
- If a request is withdrawn, declined, or expires, capacity is released and the occurrence updates accordingly.

### 9.5 Partial-fill lifecycle acceptance criteria

- An occurrence with some staffed DJs and remaining open capacity appears as Partially Filled.
- A partially filled occurrence may continue receiving requests or assignments while capacity remains.
- A filled occurrence disables additional staffing actions.
- Cancelling a partially filled occurrence cancels linked staffing and requests only after explicit confirmation.
- Occurrence cancellation is blocked once any linked Booking is Completed.

### 9.6 Source-of-truth acceptance criteria

- Even in multi-slot staffing, only Bookings write DJ schedule truth.
- Shift Occurrences do not block any DJ calendar unless linked Bookings exist for that DJ.
- Coverage status and fill ratios do not expose private DJ conflict details beyond approved diagnostics behavior.

---

## 10. Final Revised MVP Functional Definition

AmIFree Scheduler MVP remains a DJ-first, nightlife-aware scheduling and staffing product where Booking is the only calendar-truth object and AI extraction remains review-before-save.

With this revision, operator staffing is now fully aligned to the approved wireframes:

- recurring Shift Templates are bounded by active date ranges
- templates preview future generated occurrences before save
- templates support pause and resume behavior
- templates materialize dated Shift Occurrences without appearing directly on dated schedules
- Operator Schedule is explicitly split into:
  - Agenda for Bookings only
  - Coverage for Shift Occurrences only
- Shift Occurrences support a realistic MVP multi-slot model through:
  - `slots_needed`
  - `filled_slots_count`
  - `active_request_count`
  - `open_slots_count`
- one occurrence may have multiple staffed DJs
- one occurrence may be partially filled
- requests are per occurrence for one slot of capacity
- staffed Bookings are per filled slot
- force-assignment remains blocked
- Booking remains the only object that writes DJ calendar truth

The revised MVP therefore supports recurring venue staffing, coverage tracking, and partial fill behavior without expanding into a heavy slot-management system or bloated operations platform.
