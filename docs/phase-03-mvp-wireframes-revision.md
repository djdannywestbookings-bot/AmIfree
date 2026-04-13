# [3] Phase — MVP Wireframes Revision

## 1. Revision Summary

This revision preserves the approved MVP wireframe pack and only updates the operator shift system plus the hard-conflict limited save path. It restores explicit recurring weekly shift templates, keeps one-off shift occurrences separate from templates, and makes the DJ-owner / Manager Lite lower-commitment hard-conflict save flow visible with required reason capture, confirmation, and audit trail.

Carry forward unchanged from the current approved pack unless revised below:
- all global app shells
- DJ Home / Schedule / Requests / Sharing / More core structures
- operator staffing candidate grouping
- booking / request / shift occurrence separation
- booking as only calendar-truth object
- manual availability block system
- external sharing rules
- no operator force-assign path in MVP

## 2. Updated Object Clarification

### Shift Template

**Definition**
- A recurring weekly staffing rule.
- Not a booking.
- Not a request.
- Not calendar truth.

**Core fields**
- venue
- shift label / role
- weekday selection
- local start time / end time
- slots needed
- active start date / active end date
- notes / staffing instructions
- active / paused state

**Behavior**
- Generates future dated Shift Occurrences inside the active date range.
- May span cross-midnight using venue-local service-day logic.
- Shows a preview of upcoming generated occurrences before save.
- Editing a template affects future generated occurrences only.
- Pausing a template stops future occurrence generation only.
- Past generated occurrences remain as historical operational records.

**UI placement**
- Managed from operator creation flows and venue template views.
- Never shown as if it were a booking on the agenda timeline.

### Shift Occurrence

**Definition**
- A single dated staffing unit for a specific night and time window.
- May come from a recurring Shift Template or be created as a one-off occurrence.
- Not calendar truth.

**Core fields**
- venue
- date
- start time / end time
- service day
- slots needed
- staffing status
- source type:
  - from template
  - one-off
- optional linked request(s)
- optional linked booking(s)

**Behavior**
- Appears in operator Coverage views and venue operational views.
- Drives staffing, requests, and assignment decisions.
- If created from a template, keeps a source-template reference.
- If one-off, has no template reference.
- Remains separate from Bookings even when staffed.

**UI placement**
- Coverage lists
- Venue Detail
- Shift Occurrence Detail
- Request linking

### Booking

**Definition**
- The only calendar-truth object.
- Represents the saved booking state for the master calendar.

**Core fields**
- lifecycle state
- alert state
- date / time or Time TBD
- service day
- venue
- notes
- linked request
- linked shift occurrence

**Behavior**
- Appears on DJ and operator agenda views.
- Can be created from intake, quick add, request flow, or staffing flow.
- Hard-conflicted items cannot advance to Assigned or Booked.
- DJ owner / Manager Lite may use a limited hard-conflict save path only for:
  - Inquiry
  - Hold
  - Requested
- This limited save path does not remove conflict status and does not make the person eligible for staffing.

**UI placement**
- agenda timeline
- booking detail
- booking edit
- intake review save path

## 3. Updated Wireframes

### Screen name
Shift Template Builder

**User role(s):** Operator  
**Goal:** Create or edit a recurring weekly shift template that generates future dated shift occurrences.  
**Entry points:** Operator Home quick actions, Operator Schedule sticky action, Venue Detail Templates tab, Shift Creation Choice Sheet.

**Mobile wireframe layout**
- `[Top bar: New recurring template | Venue context | Close]`
- `[Template type badge: Recurring weekly]`
- `[Field group: Venue]`
- `[Field group: Shift label / role]`
- `[Weekday selector chips: Mon | Tue | Wed | Thu | Fri | Sat | Sun]`
- `[Field row: Start time | End time]`
- `[Field group: Slots needed]`
- `[Field row: Active start date | Active end date]`
- `[Toggle row: Template active]`
- `[Helper strip: Generates future shift occurrences only; does not create bookings]`
- `[Card: Upcoming generated occurrence preview]`
  - `[List row: Fri Apr 3 | 10:00 PM–2:00 AM | 1 slot]`
  - `[List row: Fri Apr 10 | 10:00 PM–2:00 AM | 1 slot]`
  - `[List row: Fri Apr 17 | 10:00 PM–2:00 AM | 1 slot]`
  - `[List row: Fri Apr 24 | 10:00 PM–2:00 AM | 1 slot]`
- `[Field group: Notes / staffing instructions]`
- `[Sticky action bar: Save template | Cancel]`

**Primary actions**
- Save template
- Preview generated occurrences

**Secondary actions**
- Cancel
- Toggle active / paused state

**State variants**
- Single weekday recurring template
- Multi-weekday recurring template
- Cross-midnight recurring template
- Missing weekday selection
- Missing active date range
- Paused existing template

**Notes for engineering / UX behavior**
- Preview recalculates live from weekday selection, active date range, and local venue time.
- Saving creates or updates a Shift Template object, not dated bookings.
- Generated occurrence preview should represent upcoming materialized occurrences, not generic prose.
- Future occurrences retain `source_template_id`.
- Past already-generated occurrences are not retroactively deleted by template edits.

### Screen name
One-Off Shift Occurrence Create Flow

**User role(s):** Operator  
**Goal:** Create a single dated shift occurrence without creating a recurring template.  
**Entry points:** Operator Home quick actions, Operator Schedule sticky action, Venue Detail, Shift Creation Choice Sheet.

**Mobile wireframe layout**
- `[Top bar: New one-off occurrence | Venue context | Close]`
- `[Template type badge: One-off occurrence]`
- `[Field group: Venue]`
- `[Field group: Shift label / role]`
- `[Field group: Date]`
- `[Field row: Start time | End time]`
- `[Field group: Slots needed]`
- `[Field group: Notes / staffing instructions]`
- `[Helper strip: Creates one dated staffing occurrence only; no recurring template will be created]`
- `[Inline text link: Need this weekly? Create recurring template instead]`
- `[Sticky action bar: Create occurrence | Cancel]`

**Primary actions**
- Create one-off occurrence

**Secondary actions**
- Cancel
- Switch to recurring template flow

**State variants**
- Single-slot occurrence
- Multi-slot occurrence
- Cross-midnight occurrence
- Missing required fields

**Notes for engineering / UX behavior**
- Saves a Shift Occurrence object with no template reference.
- One-off occurrences appear immediately in Coverage and Venue Detail.
- Requests and assignments can attach directly to this occurrence.
- This flow must stay separate from the recurring template builder.

### Screen name
Home — Operator (Updated)

**User role(s):** Operator  
**Goal:** Surface urgent coverage work while making recurring-template and one-off creation explicit.  
**Entry points:** Bottom nav Home, login landing.

**Mobile wireframe layout**
- `[Top bar: AmIFree | Venue/org context | Notifications]`
- `[Summary strip: Tonight 8 occurrences | 4 active templates | 2 unfilled]`
- `[Card: Urgent staffing]`
  - `[List row: Fri 10:00 PM Venue A | 0/1 filled | Source: From template | Assign]`
  - `[List row: Sat 11:00 PM Venue B | 1 pending request | Source: One-off | Open]`
- `[Card: Template health]`
  - `[List row: 4 active weekly templates | Open templates]`
  - `[List row: 1 template ends in 5 days | Review]`
- `[Card: Recent request activity]`
  - `[List row: DJ Alex | accepted | linked occurrence filled]`
  - `[List row: DJ Nina | pending response | one-off occurrence]`
- `[Card: Quick actions]`
  - `[2-up buttons: New template | One-off occurrence]`
  - `[2-up buttons: New request | Open venues]`
- `[Bottom nav: Home* | Schedule | Requests | Venues | More]`

**Primary actions**
- Open urgent unfilled occurrence
- Create recurring template
- Create one-off occurrence

**Secondary actions**
- Open templates
- Open venues
- Open request queue

**State variants**
- No staffing issues
- Unfilled template-generated occurrence
- Unfilled one-off occurrence
- Expiring template date range

**Notes for engineering / UX behavior**
- Home shows occurrences as operational work items.
- Template count is summary-level only; templates themselves are managed in dedicated flows.
- Source badges on urgent items make origin explicit without mixing objects.

### Screen name
Schedule — Operator (Updated)

**User role(s):** Operator  
**Goal:** Keep booking truth and staffing work separate while showing whether an occurrence came from a template or was created one-off.  
**Entry points:** Bottom nav Schedule, Home cards, Venue Detail.

**Mobile wireframe layout**
- `[Top bar: Schedule | Venue filter | Filters]`
- `[Helper banner: Service day ends 6:00 AM local venue time]`
- `[Date strip: Thu 4 | Fri 5* | Sat 6 | Sun 7]`
- `[Segmented control: Agenda | Coverage]`
- `[Agenda view timeline: bookings only]`
  - `[Booking card: Booked | DJ Alex | Venue A | 10:00 PM–2:00 AM]`
  - `[Booking card: Assigned | DJ Nina | Venue B | 11:00 PM–3:00 AM | Possible Conflict]`
- `[Coverage view list: occurrences only]`
  - `[Shift occurrence card: Venue A | 10:00 PM–2:00 AM | 0/1 filled | Source badge: From template | Assign]`
  - `[Shift occurrence card: Venue B | 11:00 PM–3:00 AM | 1/1 filled | Source badge: One-off]`
  - `[Inline row: View venue templates]`
- `[Sticky action bar: New template | One-off occurrence]`
- `[Bottom nav: Home | Schedule* | Requests | Venues | More]`

**Primary actions**
- Open booking detail
- Open shift occurrence detail
- Create recurring template
- Create one-off occurrence

**Secondary actions**
- Filter by venue / staffing status
- Open venue templates

**State variants**
- Agenda only
- Coverage pressure
- Mixed template-generated and one-off occurrences
- No occurrences for selected date

**Notes for engineering / UX behavior**
- Agenda remains booking-truth only.
- Coverage remains occurrence-only.
- Templates are not rendered as if they are dated items on the selected day until they materialize as occurrences.
- Source badges on occurrences are required for operator clarity.

### Screen name
Requests — Operator (Updated)

**User role(s):** Operator  
**Goal:** Track request progress while showing the request’s linked occurrence origin.  
**Entry points:** Bottom nav Requests, Home request activity.

**Mobile wireframe layout**
- `[Top bar: Requests | Venue filter]`
- `[Segmented control: Open | Awaiting DJs | Closed]`
- `[Request card: Venue A Fri late slot | Linked occurrence Apr 5 10:00 PM–2:00 AM | Source: From template | 3 DJs requested | 1 accepted]`
- `[Request card: Venue B Sat opener | Linked occurrence Apr 6 9:00 PM–1:00 AM | Source: One-off | 1 DJ pending]`
- `[Request card: Closed | Filled | linked booking created]`
- `[Sticky action bar: New request | Open coverage]`
- `[Bottom nav: Home | Schedule | Requests* | Venues | More]`

**Primary actions**
- Open Request Detail
- Start new request

**Secondary actions**
- Filter by venue
- Sort by urgency or fill status

**State variants**
- No open requests
- Template-generated occurrence request
- One-off occurrence request
- Closed / archived

**Notes for engineering / UX behavior**
- Requests remain linked to occurrences, not directly to templates.
- Source badge gives operator context without collapsing the object model.

### Screen name
Request Detail (Updated)

**User role(s):** DJ, Operator  
**Goal:** Show request state, linked occurrence, and occurrence origin clearly.  
**Entry points:** Requests list, Shift Occurrence Detail, Booking Detail linked object row.

**Mobile wireframe layout**
- `[Top bar: Request detail | Close]`
- `[Status banner: Awaiting DJ response / Accepted / Declined / Cancelled]`
- `[Summary card: Venue | Fri 10:00 PM–2:00 AM | requested role / slot]`
- `[Section: Requested DJ(s)]`
  - `[List row: DJ Alex | Pending]`
  - `[List row: DJ Nina | Accepted]`
- `[Section: Linked objects]`
  - `[List row: Shift occurrence | Fri Apr 5 10:00 PM–2:00 AM]`
  - `[List row: Source template | Fri Resident weekly template]`
  - `[List row: Booking | B-18 or none]`
- `[Helper strip: Requests attach to occurrences; templates only define recurring generation]`
- `[Section: Request notes / ask]`
- `[Section: Suggested follow-up]`
  - `[List row: Copy reminder message]`
  - `[List row: Copy clarification message]`
- `[Sticky action bar: role-aware primary actions]`

**Primary actions**
- DJ accepts or declines
- Operator resends or cancels request

**Secondary actions**
- Open linked occurrence
- Open linked booking
- Copy suggested message

**State variants**
- Source template present
- Source template absent / one-off occurrence
- Accepted
- Declined
- Cancelled

**Notes for engineering / UX behavior**
- If the occurrence is one-off, show `[List row: Source template | None — one-off occurrence]`.
- This screen must not imply that accepting a request modifies a template.

### Screen name
Venue Detail (Updated)

**User role(s):** Operator  
**Goal:** Manage one venue’s occurrences, bookings, and recurring templates without mixing them into one object.  
**Entry points:** Venues List, Home venue pulse card, linked booking/occurrence context.

**Mobile wireframe layout**
- `[Top bar: Venue name | Edit]`
- `[Summary card: City/State | Timezone | Venue notes preview]`
- `[Segmented control: Tonight | Upcoming | Templates]`

- `[If Tonight / Upcoming]`
  - `[Shift occurrence card: Fri 10:00 PM–2:00 AM | 0/1 filled | Source badge: From template | Assign]`
  - `[Shift occurrence card: Sat 9:00 PM–1:00 AM | 1/1 filled | Source badge: One-off]`
  - `[Booking row: DJ Alex | Booked | 11:00 PM–3:00 AM]`

- `[If Templates]`
  - `[Template card: Fri Resident | Fri | 10:00 PM–2:00 AM | Active Apr 1–Aug 31]`
    - `[List row: Upcoming generated: Apr 3, Apr 10, Apr 17]`
    - `[Inline actions: Edit template | Pause template]`
  - `[Template card: Sat Opener | Sat | 9:00 PM–1:00 AM | Paused]`
    - `[List row: Upcoming generated: none while paused]`
    - `[Inline actions: Edit template | Resume template]`

- `[Sticky action bar: New template | One-off occurrence]`

**Primary actions**
- Open occurrence detail
- Open booking detail
- Create recurring template
- Create one-off occurrence

**Secondary actions**
- Edit / pause / resume template
- Edit venue

**State variants**
- No upcoming work
- Active templates with future previews
- Paused template
- Mixed template-generated and one-off occurrences

**Notes for engineering / UX behavior**
- Templates need their own visible tab / section.
- Occurrences and bookings remain separate even inside the same venue workspace.
- Pausing a template stops future occurrence generation only; existing occurrences remain.
- Template preview rows should use venue-local service-day logic.

### Screen name
Shift Occurrence Detail (Updated)

**User role(s):** Operator  
**Goal:** Manage one dated occurrence while making its origin explicit.  
**Entry points:** Schedule Coverage, Home urgent staffing, Venue Detail, Requests link.

**Mobile wireframe layout**
- `[Top bar: Shift occurrence | Edit]`
- `[Status strip: 1/2 filled | No clean match chip]`
- `[Summary card: Venue A | Fri 10:00 PM–2:00 AM | Service day Fri]`
- `[Section: Source]`
  - `[List row: Origin | From template — Fri Resident]`
  - `[List row: Template schedule | Every Fri | Active Apr 1–Aug 31]`
- `[Section: Filled slots]`
  - `[List row: Slot 1 | DJ Alex | Assigned]`
- `[Section: Open slots]`
  - `[List row: Slot 2 | Unfilled | Assign]`
- `[Section: Requests sent]`
  - `[List row: DJ Nina | Pending]`
  - `[List row: DJ Omar | Declined]`
- `[Section: Linked bookings]`
  - `[List row: Booking B-18 | Booked]`
- `[Sticky action bar: Assign / Send request | Edit occurrence]`

**Primary actions**
- Open Assignment sheet
- Send request
- Edit occurrence

**Secondary actions**
- Open linked booking
- Open source template when present

**State variants**
- From template
- One-off occurrence
- Fully filled
- Partially filled
- No clean staffing matches

**Notes for engineering / UX behavior**
- For one-off occurrences, replace the source section with `[List row: Origin | One-off occurrence]`.
- Editing an occurrence does not silently convert it into a template.
- Occurrence source context is read-only unless the operator explicitly edits the template in template flows.

## 4. Updated Reusable Sheets and Overlays

### Screen name
Shift Creation Choice Sheet

**User role(s):** Operator  
**Goal:** Make the recurring-template versus one-off-occurrence choice explicit before creation.  
**Entry points:** Operator Home quick actions, Operator Schedule sticky action, Venue Detail sticky action.

**Mobile wireframe layout**
- `[Bottom sheet handle]`
- `[Header: Create shift | Close]`
- `[Action card: Recurring weekly template | Choose weekday pattern + active date range]`
- `[Action card: One-off occurrence | Create one dated staffing occurrence]`
- `[Helper row: Templates generate future occurrences; occurrences handle actual staffing for a specific date]`

**Primary actions**
- Open Shift Template Builder
- Open One-Off Shift Occurrence Create Flow

**Secondary actions**
- Close

**State variants**
- Single-venue context
- Multi-venue context requiring venue pick in next step

**Notes for engineering / UX behavior**
- This sheet is a routing layer only.
- It must never imply that template and one-off are the same object type.

### Screen name
Conflict Sheet (Updated)

**User role(s):** DJ, Operator, Manager Lite  
**Goal:** Explain hard conflict rules while showing the role-limited exception path only where allowed.  
**Entry points:** Booking card chip, Booking Detail, Booking Edit, Intake Review, Assignment Sheet.

**Mobile wireframe layout**
- `[Bottom sheet handle]`
- `[Header: Hard Conflict details | Close]`
- `[Summary strip: Hard Conflict detected]`
- `[Card: Existing item | time / venue / state]`
- `[Card: Current item | time / venue / selected state]`
- `[Section: Blocked actions]`
  - `[List row: Cannot assign]`
  - `[List row: Cannot save as Assigned or Booked]`
  - `[List row: Cannot use operator force-path]`
- `[Conditional section for DJ owner / Manager Lite with edit permission]`
  - `[Card: Limited save available]`
  - `[Body: Save only as Inquiry / Hold / Requested]`
  - `[List row: Reason required]`
  - `[List row: Audit note will be stored]`
- `[Sticky action bar: Open conflicting item | Role-aware secondary CTA]`
  - DJ / Manager allowed: `Continue with limited save`
  - Operator: `Close`

**Primary actions**
- Open conflicting item
- Continue with limited save when role allows

**Secondary actions**
- Close

**State variants**
- Operator blocked path
- DJ-owner limited save path
- Manager Lite limited save path
- Multiple conflict sources

**Notes for engineering / UX behavior**
- Limited-save section is hidden for operators.
- This sheet explains the exception path but does not bypass confirmation or audit capture.
- Hard conflict status remains after limited save.

### Screen name
Confirmation Sheet (Updated)

**User role(s):** DJ, Manager Lite, Operator for other existing confirmations  
**Goal:** Confirm sensitive actions, including the limited hard-conflict save variant.  
**Entry points:** Booking Edit, Intake Review, destructive actions, request responses.

**Mobile wireframe layout**
- `[Bottom sheet handle]`
- `[Header: Confirm action | Close]`

- `[Standard confirmation variant]`
  - `[Body: concise summary of action]`
  - `[Impact list: state change / linked object effect / sharing behavior]`

- `[Hard-conflict limited save variant]`
  - `[Summary strip: Hard Conflict detected]`
  - `[Card: Saving as Hold / Inquiry / Requested only]`
  - `[Read-only row: Reason entered]`
  - `[Audit preview card: Saved by | role | selected state | conflicting item refs | timestamp at save]`
  - `[Helper text: This does not mark the time free and cannot advance to Assigned or Booked]`

- `[Sticky action bar: Confirm | Cancel]`

**Primary actions**
- Confirm action

**Secondary actions**
- Cancel
- Edit previous screen inputs

**State variants**
- Standard confirm
- Hard-conflict limited save confirm
- Cancel booking
- Decline request

**Notes for engineering / UX behavior**
- For hard-conflict limited save, Confirm remains disabled until a reason exists on the prior screen.
- Reason entry starts in Booking Edit or Intake Review; this sheet shows the final audit preview.
- On confirm, write an audit note to item history / activity log.

## 5. Hard-Conflict Limited Save Path

### Screen name
Booking Edit (Updated)

**User role(s):** DJ, Manager Lite with edit permission, Operator for normal non-exception edits  
**Goal:** Preserve normal booking editing while exposing the limited-save exception only for allowed roles under hard conflict.  
**Entry points:** Booking Detail Sheet, Intake Review, Quick Add “More details”.

**Mobile wireframe layout**
- `[Top bar: Edit booking | Save | Close]`
- `[Field group: Title / event label]`
- `[Field group: Venue]`
- `[Field group: Date]`
- `[Field row: Start time | End time]`
- `[Toggle row: Time TBD]`
- `[Helper strip: Auto service day = Fri (based on 6:00 AM local boundary)]`

- `[Normal state picker when no hard conflict]`
  - `[Field group: Lifecycle state picker: Inquiry / Hold / Requested / Assigned / Booked / Completed / Cancelled]`

- `[If hard conflict detected and role = DJ owner or Manager Lite with edit permission]`
  - `[Inline alert card: Hard Conflict with existing booking at Club Echo | 10:30 PM–1:30 AM]`
  - `[Field group: Allowed save states under hard conflict]`
    - `[Segmented control: Inquiry | Hold | Requested]`
  - `[Disabled row: Assigned | Booked | Completed locked]`
  - `[Required field: Reason for lower-commitment save]`
  - `[Helper strip: This keeps the item in a lower-commitment state only; it does not mark the time free]`

- `[If hard conflict detected and role does not qualify]`
  - `[Inline alert card: Hard Conflict | Save blocked for selected state]`
  - `[Disabled row: Save changes]`
  - `[Action row: Open conflict details]`

- `[Field group: Notes]`
- `[Sticky action bar: Continue to confirmation | Cancel]`

**Primary actions**
- Continue to confirmation
- Open conflict details

**Secondary actions**
- Cancel
- Edit fields

**State variants**
- No conflict
- Hard conflict with DJ-owner limited save available
- Hard conflict with Manager Lite limited save available
- Hard conflict with no limited-save permission
- Missing reason on limited-save path

**Notes for engineering / UX behavior**
- Limited-save path is never an assignment override.
- If hard conflict exists, the exception path only permits Inquiry / Hold / Requested.
- Save remains blocked until reason is non-empty.
- On successful confirmation, append audit note to booking history.
- Existing Booking Detail activity log must display the audit entry.

### Screen name
Intake Review (Updated)

**User role(s):** DJ, Manager Lite  
**Goal:** Keep AI review-before-save intact while exposing the limited-save conflict path for extracted items.  
**Entry points:** Intake analyze action, open queued intake item.

**Mobile wireframe layout**
- `[Top bar: Review extracted details | Close]`
- `[Source preview card: snippet / thumbnail / file label]`
- `[Alert row: Hard Conflict / Missing Info / Possible Conflict]`
- `[Section: Proposed booking fields]`
  - `[Field row: Title | editable value]`
  - `[Field row: Venue | editable value]`
  - `[Field row: Date | editable value]`
  - `[Field row: Start / End | editable value]`
  - `[Field row: Suggested lifecycle | Hold]`
  - `[Field row: Notes | editable value]`

- `[If hard conflict detected]`
  - `[Inline alert card: Hard Conflict with existing booking]`
  - `[Field group: Save type under hard conflict]`
    - `[Segmented control: Inquiry | Hold | Requested]`
  - `[Required field: Reason for lower-commitment save]`
  - `[Helper strip: Extracted item cannot save as Assigned or Booked while hard conflict remains]`

- `[Section: Extraction confidence]`
  - `[List row: 3 fields need review]`
- `[Section: Related items / possible duplicates]`
  - `[List row: Conflicting booking | Open]`
- `[Sticky action bar: Continue to confirmation | Discard]`

**Primary actions**
- Continue to confirmation
- Open conflicting item

**Secondary actions**
- Discard
- Edit extracted values

**State variants**
- Clean extraction
- Hard conflict with allowed limited-save path
- Missing time + hard conflict
- Multiple conflicts detected

**Notes for engineering / UX behavior**
- AI extraction still never writes directly to the calendar.
- Under hard conflict, save options are restricted to Inquiry / Hold / Requested.
- Confirmation sheet and audit behavior are required before final save.
- Saved item keeps hard conflict alert until independently resolved.

### Confirmation / Reason Capture / Audit Behavior

**Required behavior**
- Reason entry is mandatory before the limited-save confirmation can be opened.
- Confirmation sheet shows the exact chosen lower-commitment state and the entered reason.
- Confirming the save writes an audit record.

**Audit record must capture**
- actor id
- actor role
- permission context
- selected lifecycle state
- reason text
- conflict type = Hard Conflict
- related conflicting item ids / time ranges
- save timestamp

**Audit visibility**
- visible in Booking Detail activity log
- visible in item history / audit trail
- not exposed to Shared Viewer routes

**Rule preservation**
- limited-save path does not clear the Hard Conflict chip
- limited-save path does not make the DJ staffable
- operator cannot use this path to assign or mark free
- force-assignment remains blocked in MVP

## 6. Updated State-Specific Wireframes

### Hard Conflict (Updated)

**Where shown**
- booking cards
- Booking Edit
- Intake Review
- Conflict Sheet
- Assignment Sheet candidate rows
- operator staffing surfaces

**Wireframe pattern**
- `[Card: Lifecycle pill | Hard Conflict chip]`
- `[Inline alert card: Cannot advance to Assigned or Booked]`
- `[Operator path: candidate disabled / no override]`
- `[If role = DJ owner or Manager Lite with edit permission]`
  - `[Limited save card: Inquiry / Hold / Requested only]`
  - `[Required reason field]`
  - `[Continue to confirmation]`

**Primary actions**
- Open conflict details
- Continue with limited save when allowed
- Edit conflicting item

**Secondary actions**
- Cancel
- Copy clarification message

**Notes for engineering / UX behavior**
- Hard conflict remains a blocking operational state for staffing.
- The limited-save branch is a record-keeping path only.
- Booking cards may continue to show a lower-commitment lifecycle pill plus Hard Conflict chip together.

### No Clean Staffing Matches (Updated)

**Where shown**
- Operator Home
- Schedule Coverage
- Shift Occurrence Detail
- Venue Detail

**Wireframe pattern**
- `[Shift occurrence card: No clean staffing matches | Source badge: From template / One-off]`
- `[Status strip: Eligible = 0 | Review Needed > 0 | Blocked > 0]`
- `[Action row: View diagnostics | Send request]`

**Primary actions**
- View diagnostics
- Send request
- Adjust staffing plan

**Secondary actions**
- Open linked occurrence
- Open venue templates when source = from template

**Notes for engineering / UX behavior**
- Source badge clarifies origin only; it does not affect staffing eligibility logic.
- Template-generated occurrences and one-off occurrences use the same private availability rules.
- “Not shared” still does not equal “not eligible.”

## 7. Final Revised MVP Wireframe Inventory

### Global shells
- GW-01 — DJ App Shell
- GW-02 — Operator App Shell
- GW-03 — Manager Lite App Shell
- GW-04 — Shared Viewer Route Shell

### DJ route wireframes
- DJ-01 — Home — DJ
- DJ-02 — Schedule — DJ
- DJ-03 — Booking Detail Sheet
- DJ-04 — Booking Edit **(updated: hard-conflict limited save path)**
- DJ-05 — Quick Add Sheet
- DJ-06 — Intake
- DJ-07 — Intake Review **(updated: hard-conflict limited save path)**
- DJ-08 — Requests — DJ
- DJ-09 — Sharing
- DJ-10 — More

### Operator route wireframes
- OP-01 — Home — Operator **(updated: template count + explicit create paths)**
- OP-02 — Schedule — Operator **(updated: occurrence source badges + explicit create paths)**
- OP-03 — Requests — Operator **(updated: occurrence source summary)**
- OP-04 — Request Detail **(updated: linked source template / one-off origin)**
- OP-05 — Assignment Sheet
- OP-06 — Candidate Diagnostics Sheet
- OP-07 — Venues List
- OP-08 — Venue Detail **(updated: Templates tab + occurrence/template separation)**
- OP-09 — Shift Template Builder **(replaces generic Shift Builder for recurring weekly templates)**
- OP-10 — One-Off Shift Occurrence Create Flow **(new explicit one-off creation screen)**
- OP-11 — Shift Occurrence Detail **(updated: source section)**

### Manager Lite variations
- ML-01 — Home variation with DJ selector
- ML-02 — Schedule variation with DJ selector **(inherits Booking Edit limited-save path)**
- ML-03 — Requests variation with DJ selector

### Shared viewer wireframes
- SV-01 — External Shared Availability View

### Reusable sheets and overlays
- RS-01 — Conflict Sheet **(updated: role-aware limited-save branch)**
- RS-02 — Copy Message Sheet
- RS-03 — Confirmation Sheet **(updated: hard-conflict reason + audit preview)**
- RS-04 — Empty State Pattern
- RS-05 — Loading State Pattern
- RS-06 — Error State Pattern
- RS-07 — Shift Creation Choice Sheet **(new)**

### Manual availability block wireframes
- MB-01 — Manual Availability Block — Create Sheet
- MB-02 — Manual Availability Block — Detail / Edit
- MB-03 — Manual Availability Block — Schedule Placement Pattern

### State-specific wireframes
- ST-01 — Hard Conflict pattern **(updated)**
- ST-02 — Possible Conflict pattern
- ST-03 — Missing Info pattern
- ST-04 — Time TBD pattern
- ST-05 — No Clean Staffing Matches pattern **(updated with occurrence source badge)**

### Revision lock check
- recurring weekly Shift Template support restored explicitly
- weekday-based setup shown
- active date range shown
- preview of generated upcoming occurrences shown
- Shift Template and Shift Occurrence kept separate
- one-off occurrence create flow kept separate
- hard-conflict limited save path shown clearly
- required reason entry shown
- confirmation shown
- audit behavior shown
- force-assignment remains blocked