# [2] Phase — UX/UI System Revision

## 1. Revision Summary

This revision turns the earlier architecture-heavy draft into a tighter MVP UX/UI system by reducing screen sprawl, simplifying the role model, separating external visibility from internal staffing logic, adding a true component and token layer, and making conflict/state behavior explicit. It keeps the DJ-first, mobile-first, nightlife-native core while staying credible for an MVP build.

The revised system makes six concrete changes:

- narrows the MVP to a small set of primary routes plus reusable system surfaces
- treats promoter and venue-operator workflows as one **Operator** shell with permission-based differences
- limits manager complexity to a lightweight delegated mode instead of a full workspace model
- separates **what an external viewer can see** from **what an internal operator can use for assignment**
- defines a strict hard-conflict policy with very limited override behavior
- adds the missing UI-system layer: components, interaction standards, semantic tokens, and screen-state rules

---

## 2. Locked MVP UX Decisions

1. The MVP is a **mobile-first web app / PWA**.
2. The product is **DJ-first**, with operator request and assignment basics included.
3. The **calendar is the source of truth** for actual booked and blocked work.
4. All AI extraction is **review-before-save**.
5. The app uses a **five-tab mobile shell** that adapts by role.
6. The default schedule view is a **date-strip + agenda timeline**.
7. The default visible time window is **approximately 12:00 PM through 6:00 AM next day**.
8. Cross-midnight gigs visually belong to the **starting nightlife day**.
9. **Service day** is a separate operational concept and defaults to **6:00 AM local venue time**.
10. Shared external visibility modes are only:
   - **Busy**
   - **Busy + Region**
11. **Lifecycle states** and **alert states** remain separate systems.
12. **Booking Request**, **Shift Occurrence**, and **Booking** remain separate objects.
13. **Assigned** counts as hard unavailable in MVP.
14. Internal staffing lists must use **actual private schedule truth**, not just what is externally shared.
15. **Not shared** is not the same as **not eligible** unless the workflow explicitly depends on a share relationship.
16. Suggested follow-up messages are **copy-first**, not full messaging automation.

---

## 3. MVP UX Scope vs Deferred UX Scope

### 3.1 In MVP

- DJ home, schedule, intake, requests, and sharing controls
- Operator home, schedule, requests, venues, and recurring shift basics
- Booking detail/edit flow
- Intake inbox plus extraction review
- Request list plus request detail
- Assignment sheet with:
  - Eligible DJs
  - Review-needed DJs
  - Blocked diagnostics
- Venue detail with simple recurring weekly shift templates
- Shared external availability view with Busy / Busy + Region only
- Copy-ready follow-up message sheets
- Limited manager delegate mode for one linked DJ context at a time

### 3.2 Deferred from MVP

- full multi-organization workspace architecture
- advanced multi-roster manager dashboard
- team chat or in-app threaded conversations
- automated outbound SMS/email sending
- deep analytics or staffing reporting
- multi-venue bulk planning board
- advanced exception handling for recurring shifts
- desktop-first dense planning tables
- full contract/payment workflow
- force-assigning hard-conflicted DJs from staffing workflows
- custom external share modes beyond Busy / Busy + Region

---

## 4. Simplified MVP Role Model

| Role | Purpose in MVP | Can do | Deliberate MVP limit |
|---|---|---|---|
| **DJ** | Core owner of schedule truth | review intake, manage bookings, respond to requests, share availability, copy follow-up messages | no full team admin layer |
| **Operator** | Covers promoters and venue operators | create requests, manage venues if permitted, create shift templates, assign eligible DJs, track request outcomes | operator powers depend on venue/internal permissions |
| **Manager Lite** | Minimal delegated helper for a DJ | use the DJ shell for one linked DJ at a time, review intake, manage requests, update bookings where allowed | no full workspace, no roster-wide dashboard, no org admin |
| **Shared Viewer** | External viewer of limited availability | see Busy or Busy + Region, optionally open a request path | not a full internal app role |

### MVP simplification rule

For MVP, **Promoter** and **Venue Operator** use the same Operator shell.  
Venue-specific permissions unlock venue and recurring shift features.  
Managers do not get a separate admin product; they use a limited DJ-context mode.

---

## 5. MVP Information Architecture

### 5.1 Primary product areas

- **Home** — daily triage and next actions
- **Schedule** — calendar truth, booking details, conflict visibility
- **Intake** — only for DJ and Manager Lite
- **Requests** — inbound/outbound asks and assignment outcomes
- **Venues** — only for Operator
- **More** — sharing, settings, profile, notifications

### 5.2 Core objects

- **Booking**
- **Booking Request**
- **Intake Draft**
- **Venue**
- **Shift Template**
- **Shift Occurrence**
- **Share Connection**

### 5.3 Object relationships

- Intake Draft → may become Booking
- Booking Request → may link to one Booking
- Shift Template → generates many Shift Occurrences
- Shift Occurrence → may link to one or more Requests over time
- Share Connection → controls external visibility only
- Venue → supplies timezone, region, and service-day behavior

### 5.4 Architecture rule

Only **Booking** is the calendar truth object.  
Requests and shift occurrences may create, link to, or update bookings, but they do not replace them.

---

## 6. MVP Navigation Model

### 6.1 DJ shell

- **Home**
- **Schedule**
- **Intake**
- **Requests**
- **More**

### 6.2 Operator shell

- **Home**
- **Schedule**
- **Requests**
- **Venues**
- **More**

### 6.3 Manager Lite shell

Same as DJ shell, with a **linked DJ selector** in the top bar.

### 6.4 Shared Viewer shell

No five-tab shell.  
Shared viewers use a lightweight external availability route.

### 6.5 Top-bar behavior

The top bar may contain only one context control at a time:

- date context
- venue selector
- linked DJ selector

Never stack multiple heavy selectors in the same header.

### 6.6 Primary action model

No global always-on FAB.  
Primary actions should be **screen-level** and predictable:

- Home: contextual CTA card
- Schedule: Quick Add or New Request
- Intake Review: Save Booking
- Request Detail: Send / Assign / Close
- Venue Detail: New Shift or New Request

This reduces ambiguity and keeps mobile behavior clean.

---

## 7. Final MVP Screen Inventory

### 7.1 Primary routes

1. **Home**
2. **Schedule**
3. **Intake** *(DJ / Manager Lite only)*
4. **Requests**
5. **Venues** *(Operator only)*
6. **More**

### 7.2 Secondary routes / full-screen surfaces

7. **Booking Edit**
8. **Intake Review**
9. **Request Detail**
10. **Venue Detail / Shift Builder**
11. **Sharing**

### 7.3 Reusable system surfaces

- Booking Detail Sheet
- Assignment Sheet
- Conflict Sheet
- Quick Add Sheet
- Copy Message Sheet
- Confirmation Sheet
- Candidate Diagnostics Sheet
- External Shared Availability View

### 7.4 Inventory reduction rule

If a flow can be handled as a bottom sheet or nested detail screen, it should not become a new primary route.

---

## 8. Core User Flows

### 8.1 DJ intake to booking save

1. DJ uploads or pastes source material.
2. Intake item lands in Intake.
3. Extraction runs.
4. DJ opens Intake Review.
5. DJ confirms or edits fields.
6. System checks:
   - duplicate risk
   - missing required fields
   - conflict severity
7. DJ saves.
8. Booking is written to Schedule.

### 8.2 DJ manual booking flow

1. DJ opens Schedule.
2. Taps Quick Add.
3. Fills minimal schedulable fields.
4. Sees immediate conflict check.
5. Saves as Inquiry, Hold, Requested, Assigned, or Booked if allowed.
6. Booking appears on calendar.

### 8.3 Operator request flow

1. Operator opens Requests or Venue Detail.
2. Creates request for a slot or date.
3. Targets a DJ or opens candidate selection.
4. If a DJ is selected, linked Booking enters **Requested**.
5. DJ responds.
6. Operator closes or advances the request.
7. Linked Booking continues through Assigned / Booked.

### 8.4 Shift occurrence fill flow

1. Operator opens a Shift Occurrence.
2. Opens Assignment Sheet.
3. Sees:
   - Eligible
   - Review Needed
   - Blocked
4. Selects an Eligible DJ or sends request to a Review Needed DJ if allowed.
5. Occurrence and Booking update.
6. Slot becomes Assigned or Filled.

### 8.5 Conflict resolution flow

1. User taps a Hard Conflict or Possible Conflict chip.
2. Conflict Sheet opens with both items and the reason.
3. User chooses:
   - edit time
   - change state
   - cancel one item
   - save lower-commitment state if allowed
4. System recalculates calendar truth and candidate eligibility.

### 8.6 Availability-sharing flow

1. DJ opens More → Sharing.
2. Creates or edits Share Connection.
3. Chooses Busy or Busy + Region.
4. Reviews exact external preview.
5. Saves.
6. Shared viewer sees limited availability only.

### 8.7 Follow-up copy flow

1. User opens Booking Detail, Intake Review, or Request Detail.
2. Opens Copy Message Sheet.
3. Selects generated message variant.
4. Taps Copy.
5. Uses native device sharing or pastes externally.

---

## 9. State Mapping Matrix

## 9.1 Request states

| Request State | Meaning | Typical Next State |
|---|---|---|
| **Draft** | composed but not sent | Sent / Cancelled |
| **Sent** | active ask waiting for response | Accepted / Declined / Cancelled |
| **Accepted** | recipient agreed | Closed |
| **Declined** | recipient said no | Closed |
| **Cancelled** | requester withdrew ask | Closed |
| **Closed** | request workflow is done | — |

### Request rule
A request is an operational ask.  
It is not the same thing as the booking itself.

---

## 9.2 Shift occurrence states

| Shift Occurrence State | Meaning | Typical Next State |
|---|---|---|
| **Open** | slot exists, no active assignee | Requested / Assigned / Cancelled |
| **Requested** | one or more active requests exist for this slot | Assigned / Open / Cancelled |
| **Assigned** | a specific DJ is selected | Filled / Open / Cancelled |
| **Filled** | slot is covered by a Booked booking | Open only by explicit edit / Cancelled |
| **Cancelled** | slot no longer needs coverage | — |

### Shift rule
A shift occurrence represents staffing need, not calendar truth.

---

## 9.3 Booking lifecycle states

| Booking State | Meaning | Typical Next State |
|---|---|---|
| **Inquiry** | early lead, not yet reserved | Hold / Requested / Cancelled |
| **Hold** | temporarily reserved | Requested / Assigned / Cancelled |
| **Requested** | active ask tied to a DJ | Assigned / Cancelled |
| **Assigned** | committed enough to block availability | Booked / Cancelled |
| **Booked** | confirmed work | Completed / Cancelled |
| **Completed** | work finished | — |
| **Cancelled** | no longer happening | — |

### Booking rule
Only **Booking** writes to the master calendar.

---

## 9.4 Alert states

| Alert State | Meaning | Can coexist with | Clears when |
|---|---|---|---|
| **Missing Info** | saved booking lacks noncritical details | Inquiry / Hold / Requested / Assigned / Booked | required missing fields are filled or item is cancelled |
| **Possible Conflict** | overlap or timing uncertainty needs review | Inquiry / Hold / Requested | overlap is resolved or item is cancelled |
| **Hard Conflict** | overlap with protected availability truth | Inquiry / Hold / Requested | conflict is resolved or item is cancelled |

### Alert rule
Alerts are orthogonal to lifecycle state.  
They never replace lifecycle state.

---

## 9.5 Cross-object transition matrix

| Scenario | Request | Shift Occurrence | Booking | Alert Notes |
|---|---|---|---|---|
| Manual lead added by DJ | — | — | Inquiry or Hold | Missing Info / Possible Conflict may apply |
| Direct request sent to a DJ | Sent | — | Requested | conflict check runs immediately |
| Open shift created | — | Open | — | no booking yet |
| Shift request sent to a DJ | Sent | Requested | Requested | booking is created for that DJ |
| DJ accepts and operator commits | Accepted → Closed | Assigned | Assigned | Hard Conflict must be clear |
| Final confirmation received | Closed | Filled | Booked | Possible Conflict must be resolved before Booked |
| Work completed | Closed | Filled | Completed | conflict alerts clear from active UI |
| Request declined for shift | Declined → Closed | Open | Cancelled | slot reopens |
| Request cancelled by requester | Cancelled → Closed | Open or Cancelled | Cancelled | depends on whether slot still needs fill |

### Transition notes

- A **direct internal assignment** may skip Request and move straight to:
  - Shift Occurrence = Assigned
  - Booking = Assigned  
  This is allowed only inside internal operator workflows.
- **Booked** should be treated as confirmed truth. A booking should not become Booked while a Hard Conflict remains unresolved.
- **Possible Conflict** may coexist with lower-commitment states, but it should be resolved before advancing to Booked.
- **Missing Info** may remain on Booked if the missing fields are noncritical.

---

## 10. Availability Visibility vs Staffing Eligibility Rules

| Topic | External Shared Availability | Internal Staffing Eligibility |
|---|---|---|
| **Purpose** | show limited availability to a booker/promoter | determine who can actually be assigned |
| **Viewer** | shared viewer with connection | internal operator with workflow permission |
| **Data source** | share connection output | private source-of-truth schedule |
| **What is visible** | Busy or Busy + Region only | eligibility result, booking conflicts, assignment state |
| **Private booking details** | never visible | only visible if operator has permission |
| **Does “Not shared” matter?** | yes, viewer sees nothing | no, not by itself |
| **Can it drive assignment?** | only indirectly, for external discovery | yes, directly |
| **Default candidate groups** | not applicable | Eligible / Review Needed / Blocked |
| **Primary decision basis** | privacy-limited visibility | actual overlap, permissions, roster rules |

### 10.1 External shared availability rules

- connection-based
- limited to Busy or Busy + Region
- no titles, venue names, rates, notes, or contacts
- meant for **visibility**, not staffing authority

### 10.2 Internal staffing eligibility rules

A DJ is **Eligible** when:

- the operator has permission to consider them
- the schedule shows no Hard Conflict
- there is no unresolved Possible Conflict in default strict mode
- the slot has enough timing data to make a reliable decision

A DJ is **Review Needed** when:

- there is a Possible Conflict
- timing is incomplete or uncertain
- service-day interpretation still needs review

A DJ is **Blocked** when:

- there is a Hard Conflict
- a required permission or roster rule fails
- the slot cannot be evaluated reliably enough for assignment

### 10.3 Core separation rule

**Not shared** does not equal **not eligible**.  
It only means the person is not visible through the external share layer.

---

## 11. Conflict Handling Rules

| Alert | Trigger | What it blocks | Override exists? | Who can override | How override works |
|---|---|---|---|---|---|
| **Hard Conflict** | overlap with Assigned or Booked truth, or attempt to promote into protected overlap | blocks direct assignment and blocks moving booking to Assigned/Booked | **limited yes** | DJ owner or Manager Lite with edit permission | may save only as Inquiry / Hold / Requested with required reason; alert stays attached |
| **Possible Conflict** | overlap with Inquiry / Hold / Requested, missing time certainty, after-hours ambiguity | blocks direct assignment and blocks Booked until reviewed | **yes** | DJ, Operator, or Manager Lite depending context | may keep lower-commitment state or send request from Review Needed list |
| **Missing Info** | noncritical saved fields missing | does not block active use if minimum schedulable fields exist | not needed | n/a | normal save allowed; alert remains until fixed |

### 11.1 Hard conflict

A Hard Conflict exists when a proposed booking or assignment overlaps an existing **Assigned** or **Booked** booking for the same DJ.

#### Hard conflict policy

- Hard-conflicted DJs do **not** appear in the primary Eligible list.
- Operators cannot **force assign** a hard-conflicted DJ in MVP.
- A booking with Hard Conflict cannot advance to:
  - Assigned
  - Booked
- A DJ may still save a conflicting item as:
  - Inquiry
  - Hold
  - Requested  
  but only through manual booking or intake review, and only with an explicit reason.

#### Override rule

Override is for **capturing reality without lying about availability**.  
It is not for pretending a DJ is free.

### 11.2 Possible conflict

A Possible Conflict exists when timing is uncertain or overlaps only with lower-commitment states.

Examples:

- overlap with Inquiry, Hold, or Requested
- missing end time
- Time TBD
- after-hours date ambiguity before review

#### Possible conflict policy

- Possible-conflict DJs do not appear in the primary Eligible list.
- They appear in **Review Needed**.
- Operators may send a request from Review Needed.
- Operators may not direct-assign from Review Needed until the conflict is resolved.
- DJs may save lower-commitment states with Possible Conflict attached.

### 11.3 Missing info

Missing Info is only for **saved bookings** with noncritical gaps.

Examples:

- missing end time
- missing rate
- missing contact
- missing venue details
- missing city/region

### 11.4 Blocking draft vs saved missing-info rule

A draft stays blocked if it does not have minimum schedulable truth:

- assignee / owner DJ
- date or nightlife day anchor
- start time **or** explicit `Time TBD`

If those are present, save is allowed and Missing Info may attach.

### 11.5 Conflict-sheet UX

When a user opens an alert:

1. show proposed item
2. show conflicting item
3. state why this is Hard or Possible
4. show allowed actions only
5. require explicit confirm for risky action
6. write an audit note when override is used

---

## 12. Nightlife Day + Service Day UI Rules

1. **Calendar timestamp** is the real date-time value.
2. **Nightlife day** controls visual grouping in Schedule.
3. **Service day** controls after-hours operations and defaults to previous day when local start time is before 6:00 AM.
4. All grouping uses **venue-local time** when a venue exists.
5. If no venue exists yet, fallback to the account timezone until venue is set.
6. A booking starting at 11:00 PM Friday and ending at 2:00 AM Saturday appears under **Friday**.
7. A booking starting at 2:30 AM Saturday should show:
   - actual time: `Sat 2:30 AM`
   - service-day label: `Service day: Fri`
8. Intake Review must prompt when the parsed time falls between 12:00 AM and 5:59 AM:
   - `This looks like after-hours work. Keep service day as the previous day?`
9. Month view counts belong to the **starting nightlife day** cell.
10. Shift template preview must show cross-midnight and service-day behavior before save.
11. Conflict calculation uses real timestamps first.  
    Nightlife day and service day affect grouping and display, not raw overlap math.

---

## 13. Screen-by-Screen MVP Specs

## 13.1 Home

### Purpose
Daily triage screen.

### DJ view
Shows:

- today’s schedule summary
- unresolved conflicts
- pending intake reviews
- incoming requests
- next upcoming booking

### Operator view
Shows:

- open requests
- awaiting responses
- today’s staffing gaps
- upcoming venue activity

### Manager Lite view
Same as DJ view, plus linked DJ selector in top bar.

### Core layout
- summary strip
- Today card
- Needs Action stack
- next upcoming item
- contextual CTA card

### Primary actions
- Review intake
- Open conflict
- Open request
- Add booking or create request

---

## 13.2 Schedule

### Purpose
Master calendar truth.

### Default layout
- horizontal date strip
- agenda timeline
- filter chips
- schedule cards
- Quick Add trigger

### Supported views
- Day
- 3-Day
- Month
- Agenda

Day is default.

### DJ behavior
Sees own bookings and requested items.  
Can add, edit, resolve conflict, and copy follow-up messages.

### Operator behavior
Sees operational schedule for their context, typically venue-linked or request-linked work.  
Can open booking/request details and create requests.

### Key states
- Booked card
- Missing Info card
- Possible Conflict card
- Hard Conflict card
- Time TBD grouping

### Card rules
Each card shows:

- time range
- title or venue label
- one lifecycle chip
- up to two alert chips
- region if useful
- source indicator if intake-created

---

## 13.3 Booking Detail Sheet + Booking Edit

### Purpose
View and edit one booking without losing schedule context.

### Detail sheet content
- lifecycle state
- alert state
- date/time
- service-day label if relevant
- venue / region
- linked request if present
- copy-follow-up action

### Edit screen content
- basics
- timing
- venue / region
- notes / rate / contact
- linked object references
- save actions

### Permission behavior
- DJ: full edit on owned items
- Operator: only where linked and permitted
- Manager Lite: same as DJ for linked account
- Shared Viewer: no access

### Action footer
Only shows legal actions:
- Save
- Cancel Booking
- Resolve Conflict
- Copy Message
- Mark Completed

---

## 13.4 Intake

### Purpose
Queue of raw items that have not yet become trusted bookings.

### Layout
Single list with filters:

- Needs Review
- Blocked
- Saved / Archived

### Card content
- source type
- received time
- extracted preview
- blocking reason if any
- duplicate/conflict hint

### DJ / Manager Lite behavior
Can upload, paste, review, archive, or discard.

### Operator behavior
Not a primary route in MVP.

---

## 13.5 Intake Review

### Purpose
Human confirmation layer before calendar write.

### Layout
- source preview
- extracted fields
- inline field confidence hints
- duplicate preview
- conflict preview
- sticky Save Booking bar

### Required UX behavior
- low-confidence fields stay visible
- critical missing fields block save
- noncritical missing fields create Missing Info
- conflict severity must be shown before save

### Primary actions
- Save Booking
- Save and Open
- Keep in Blocked
- Discard

### Follow-up messages
If the source implies a next response, show a Copy Message action after save or in the footer sheet.

---

## 13.6 Requests

### Purpose
Operational queue for asks, responses, and outcomes.

### DJ view
Shows incoming requests and their dates, venues, and next actions.

### Operator view
Shows outgoing requests, awaiting responses, accepted items, and closed outcomes.

### Layout
- top filter tabs:
  - Open
  - Resolved
- filter chips:
  - Date
  - Venue
  - DJ
- list rows / cards

### Primary actions
- open detail
- create request
- resend
- cancel
- close

---

## 13.7 Request Detail + Assignment Sheet

### Purpose
Single request truth plus staffing action.

### Request Detail content
- request state
- linked shift occurrence if any
- linked booking if any
- venue / date / notes
- response history
- next action footer

### Assignment Sheet content
Three groups:

1. **Eligible**
2. **Review Needed**
3. **Blocked**

### Eligible group
May support:
- Request
- Assign directly  
depending on workflow permission.

### Review Needed group
May support:
- View reason
- Send request anyway  
but not direct assignment.

### Blocked group
Shows reason only:
- Hard Conflict
- Permission failure
- insufficient data

### Critical rule
The primary staffing action lives in the Assignment Sheet, not in a separate planning screen.

---

## 13.8 Venues + Shift Builder

### Purpose
Operator home for venue-linked scheduling.

### Venue list
Shows:
- venue name
- city / region
- next occurrence
- open staffing count

### Venue detail
Uses segmented sections:
- Overview
- Schedule
- Shifts

### Shift Builder
Full-screen form with:
- weekday
- start time
- end time
- cross-midnight behavior
- service-day preview
- active date range

### Occurrence detail
Bottom sheet with:
- occurrence state
- linked request(s)
- linked booking if filled
- open Assignment Sheet action

### MVP limit
Only weekly recurring patterns and simple date ranges.

---

## 13.9 Sharing

### Purpose
DJ control center for external availability visibility.

### Content
- active share connections
- visibility mode per connection
- preview of external output
- revoke access action

### Required behavior
Every share edit must show exact external preview before save.

### Visibility modes
- Busy
- Busy + Region

### What never appears
- booking titles
- venue names
- notes
- contacts
- rates

---

## 13.10 More

### Purpose
Low-frequency controls.

### Content
- profile
- notifications
- sharing entry point
- linked DJ selector entry for Manager Lite
- settings
- sign out

### MVP rule
No heavy admin surfaces live here.

---

## 13.11 External Shared Availability View

### Purpose
Simple read-only external visibility surface.

### Content
- date navigation
- busy blocks
- optional region label
- request action if enabled

### Important rule
This page is not an internal staffing dashboard.

---

## 14. UI Component System

## 14.1 App shell

- safe-area aware top bar
- single scroll region
- fixed bottom nav
- page action slot below top bar when needed
- content should not scroll under sticky action bars without visible padding

## 14.2 Top bar

Contains:

- back or menu affordance
- page title
- one context control max
- optional badge or overflow

Rules:

- titles stay short
- avoid stacked metadata
- use context chip instead of second subtitle line when possible

## 14.3 Bottom nav

Rules:

- 5 items max
- icon + label always visible
- badge only for actionable counts
- no hidden long-press behavior
- active state must be obvious without color alone

## 14.4 Cards

Three card patterns only:

- **Summary Card**
- **Queue Card**
- **Schedule Card**

Rules:

- one primary action per card
- cards may expand to sheet or detail route
- schedule cards prioritize time and state over descriptive copy

## 14.5 Status chips

Used for lifecycle state only.

Rules:

- exactly one lifecycle chip per object card
- pill shape
- compact label
- optional leading icon
- never used for alerts

## 14.6 Alert chips

Used only for:

- Hard Conflict
- Possible Conflict
- Missing Info

Rules:

- can coexist with lifecycle chip
- max two visible per card
- Hard Conflict should always win first visible slot

## 14.7 Banners

Used for screen-level messaging:

- save failed
- permission warning
- unresolved hard conflict
- parse failed

Rules:

- one blocking banner at a time
- banners sit below top bar and above content
- banners should not replace inline field errors

## 14.8 Segmented controls

Used for switching closely related views:

- Day / 3-Day / Month / Agenda
- Overview / Schedule / Shifts

Rules:

- 2 to 4 options only
- equal visual weight
- not for filtering large data sets

## 14.9 Filter chips

Used for multi-select or temporary list filtering.

Rules:

- horizontally scrollable
- removable
- concise labels
- reset available within same rail

## 14.10 Tabs

Used for route-level list grouping:

- Open / Resolved
- Needs Review / Blocked / Archived

Rules:

- keep count badges light
- do not mix tabs and segmented controls for the same purpose on the same screen

## 14.11 Bottom sheets

Used for:

- quick detail
- quick add
- conflict review
- copy message
- occurrence detail

Rules:

- use only for short or medium tasks
- avoid long forms
- allow swipe-down dismiss only when unsaved work is not at risk

## 14.12 Full-screen forms

Used for:

- Booking Edit
- Intake Review
- Shift Builder
- Request creation when complex

Rules:

- field groups should be short
- sticky action bar required
- keyboard must not hide primary action

## 14.13 Sticky action bars

Used on all write flows.

Rules:

- one primary action
- optional secondary text action
- button labels must be specific:
  - Save Booking
  - Send Request
  - Assign DJ

## 14.14 List rows

Used in requests, venues, and settings.

Rules:

- minimum height 56px
- 44px minimum tap targets
- leading icon or avatar
- primary text + one metadata line max
- trailing chip or chevron, not both unless necessary

## 14.15 Empty states

Pattern:

- simple illustration or icon
- one-line explanation
- one primary CTA

Examples:

- No bookings on this day
- Nothing needs review
- No venues yet
- No clean matches for this slot

## 14.16 Loading states

Pattern:

- skeletons matching real layout
- no full-screen spinner on primary routes
- preserve last good content when refetching if possible

## 14.17 Error states

Pattern:

- inline banner for recoverable error
- retry action
- preserve unsaved input
- manual fallback where relevant

Examples:

- Parse failed → keep source, offer manual entry
- Save failed → keep edits, retry
- Permission failed → explain why and remove illegal action

## 14.18 Screen-state rules

Every primary route should implement the same order of precedence:

1. **Blocking permission stop** if the user truly cannot access the route
2. **Loading skeleton** if no data yet
3. **Empty state** if load succeeds but there is no content
4. **Content state**
5. **Inline error banner** layered over last good content when possible

Destructive confirms and conflict sheets sit above whichever state is active.

---

## 15. Interaction Standards

## 15.1 Tap behavior

- Tapping a card opens detail first, not edit directly
- Tapping a lifecycle chip filters or explains only if clearly signaled
- Tapping an alert chip opens Conflict Sheet or Missing Info detail
- Tapping a primary button should always have one obvious result

## 15.2 Long-press behavior

Allowed only for high-value shortcuts:

- long-press empty calendar space → Quick Add
- long-press date strip day → New Booking / New Request shortcut

Not used for destructive actions.

## 15.3 Destructive actions

Destructive actions include:

- cancel booking
- discard intake draft
- cancel request
- revoke share connection
- delete shift template

Rules:

- require confirm sheet
- name the object being changed
- explain the effect on linked objects where relevant

## 15.4 Save / confirm patterns

- no silent auto-save for schedule truth changes
- all calendar writes require explicit save
- request sends require explicit send
- assigning a DJ requires explicit confirm
- unsaved changes should trigger leave-confirmation

## 15.5 Permission-aware action footers

Footers should show only actions the current user can actually perform.

Examples:

- DJ owner sees `Save Booking`
- Operator without edit permission sees no save action
- Shared viewer sees `Request` only if enabled
- Blocked actions should be hidden unless the user needs a reason, in which case show a disabled explanation row instead of a dead button

## 15.6 Swipe behavior

MVP swipe is limited to low-risk utility actions:

- archive
- mark read
- dismiss notification

Do not use swipe for booking state changes or assignment.

---

## 16. Semantic Design Tokens

## 16.1 Typography roles

- `type.pageTitle` = 24/30, semibold
- `type.sectionTitle` = 18/24, semibold
- `type.cardTitle` = 16/22, semibold
- `type.body` = 16/22, regular
- `type.bodySmall` = 14/20, regular
- `type.label` = 12/16, medium
- `type.meta` = 11/14, medium

### Typography rule
Use at most three text sizes in a single card.

## 16.2 Spacing scale

- `space.1` = 4
- `space.2` = 8
- `space.3` = 12
- `space.4` = 16
- `space.5` = 20
- `space.6` = 24
- `space.8` = 32

### Spacing rule
Base all padding and layout on the 4px grid.

## 16.3 Radius scale

- `radius.sm` = 8
- `radius.md` = 12
- `radius.lg` = 16
- `radius.xl` = 24
- `radius.pill` = 999

## 16.4 Elevation rules

- `elevation.0` = flat background
- `elevation.1` = cards
- `elevation.2` = sticky bars, bottom sheets
- `elevation.3` = confirm modal only

### Elevation rule
Use depth sparingly. Cards should feel structured, not floating everywhere.

## 16.5 Semantic color roles

### Base UI tokens
- `color.bg.canvas`
- `color.bg.surface`
- `color.bg.subtle`
- `color.border.default`
- `color.border.strong`
- `color.text.primary`
- `color.text.secondary`
- `color.text.inverse`
- `color.brand.primary`

### Lifecycle tokens
- `color.lifecycle.inquiry`
- `color.lifecycle.hold`
- `color.lifecycle.requested`
- `color.lifecycle.assigned`
- `color.lifecycle.booked`
- `color.lifecycle.completed`
- `color.lifecycle.cancelled`

### Alert tokens
- `color.alert.hardConflict`
- `color.alert.possibleConflict`
- `color.alert.missingInfo`

### Utility tokens
- `color.success`
- `color.warning`
- `color.danger`
- `color.info`

### Color rule
Use lifecycle colors on lifecycle chips.  
Use alert colors on alert chips and banners.  
Do not reuse one system’s color semantics for the other.

## 16.6 Icon usage rules

- one icon family only
- 16px for inline/chips
- 20px for list rows and cards
- 24px for nav and headers
- use icon + label for alerts, never icon only

## 16.7 Motion / transition guidance

- 150–180ms for micro interactions
- 200–240ms for sheet and route transitions
- ease-out for entrance, ease-in for exit
- no decorative bounce
- respect reduced-motion settings

### Motion rule
Motion should preserve context, not entertain.

---

## 17. MVP Copy System Rules

1. Use **sentence case** everywhere.
2. Prefer short operational verbs:
   - Review
   - Save
   - Assign
   - Resolve
   - Copy
3. Keep lifecycle wording exact:
   - Inquiry
   - Hold
   - Requested
   - Assigned
   - Booked
   - Completed
   - Cancelled
4. Keep alert wording exact:
   - Hard Conflict
   - Possible Conflict
   - Missing Info
5. Avoid AI jargon. Prefer:
   - Extracted from source
   - Check this field
   - Missing required detail
   - Possible duplicate found
6. CTA labels must describe the result:
   - Save Booking
   - Send Request
   - Assign DJ
   - Copy Message
7. Shared-availability copy must be privacy clear:
   - `This connection sees Busy only`
   - `This connection sees Busy + Region`
8. Conflict copy must explain actionability:
   - `This overlaps a booked set`
   - `Review timing before assigning`
9. Empty states should be calm and useful:
   - `Nothing needs review right now`
   - `No clean matches for this slot`
   - `No venues yet`
10. Do not use playful or consumer-social language in work flows.

---

## 18. Implementation Notes for Design + Engineering Handoff

1. **Model separation matters.**  
   Request, Shift Occurrence, Booking, and Share Connection should remain separate objects at both API and UI levels.

2. **Build the schedule engine first.**  
   Candidate eligibility, conflict logic, and external sharing all depend on reliable calendar truth.

3. **Derive nightlife day and service day server-side and client-side the same way.**  
   Shared logic should prevent inconsistent grouping between surfaces.

4. **Keep eligibility logic separate from visibility logic.**  
   External share output should not be reused as the staffing engine.

5. **Use a small tokenized component library.**  
   Build only the components listed in Section 14 before adding anything custom.

6. **Treat Booking Edit, Intake Review, and Shift Builder as the only heavy forms.**  
   Everything else should use sheets or lightweight detail screens.

7. **Persist draft input aggressively.**  
   Intake Review and Booking Edit should survive refreshes or accidental navigation whenever possible in the PWA.

8. **Audit override actions.**  
   Hard conflict overrides should record:
   - who did it
   - when
   - why

9. **Default to hiding illegal actions, not teasing them.**  
   If a user cannot perform an action, remove it unless explanation is necessary for trust.

10. **Use route-level skeletons and last-good-data rendering.**  
    Scheduling apps feel unreliable when screens blank out on every refresh.

11. **Follow-up messaging should be copy-first.**  
    Build a generated text sheet with Copy and native Share integration, not a full in-app messaging system.

12. **Keep future expansion clean.**  
    The MVP role model should be implemented with permission flags so that full multi-user SaaS expansion can layer on later.

---

## 19. Final Revised MVP UX/UI Definition

AmIFree Scheduler MVP should be a **DJ-first operational scheduling app** built around one trusted calendar, one human-review intake path, and one clear staffing workflow.

The final UX/UI definition is:

- a **five-tab mobile shell** by role
- a **tight route set** with heavy use of sheets and nested detail instead of route sprawl
- a **calendar-first schedule system** using nightlife-day grouping and service-day logic
- a **review-before-save intake system** that makes extracted data explicit and correctable
- a **request system** that stays separate from both bookings and shift occurrences
- an **assignment sheet** that distinguishes Eligible, Review Needed, and Blocked
- a **strict privacy boundary** between external share output and internal staffing logic
- a **strict hard-conflict policy** that prevents force-assignment and false availability
- a **small, reusable mobile component system** with clear lifecycle and alert semantics
- a **tokenized UI layer** ready for design and engineering handoff

In MVP terms, the product should feel like:

- a booking inbox
- a trustworthy nightlife calendar
- a clean assignment filter
- a privacy-safe availability layer

That is the correct revised MVP UX/UI system for AmIFree.
