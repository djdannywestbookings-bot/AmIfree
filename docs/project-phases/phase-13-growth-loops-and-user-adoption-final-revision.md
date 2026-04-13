# [13] Phase — Growth Loops & User Adoption Final Revision

## 1. Revision Summary

The Growth Loops & User Adoption plan remains unchanged in strategy, loop design, prioritization, sequencing, role adoption model, privacy/trust posture, and scope.

The only correction made is analytics alignment:

- instrumentation examples and event references now follow the locked Phase 9 naming convention:  
  `<domain>.<entity_or_surface>.<verb_or_result>`
- locked Phase 9 event names are reused wherever they already exist
- any additional instrumentation examples now use the same lowercase dot-notation pattern
- no parallel or conflicting analytics taxonomy is introduced

No product, workflow, lifecycle, staffing, sharing, notification, or roadmap behavior has been changed.

---

## 2. Updated Instrumentation and Measurement References

### 14. What to Instrument and Measure

Instrumentation should track loop progression, not just isolated events.

#### 14.1 Core event layer

Recommended high-value event families, aligned to the locked Phase 9 taxonomy:

- `booking.created`
- `booking.updated`
- `booking.state_changed`
- `manual_block.created`
- `manual_block.updated`
- `intake_draft.created`
- `intake_draft.converted_to_booking`
- `public_share.created`
- `public_share.viewed`
- `public_share.reused`
- `shift_occurrence.created`
- `shift_occurrence.generated`
- `shift_occurrence.capacity_recomputed`
- `shift_template.created`
- `shift_template.paused`
- `shift_template.resumed`
- `booking_request.sent`
- `booking_request.viewed`
- `booking_request.accepted`
- `booking_request.declined`
- `booking_request.expired`
- `booking_request.converted`
- `staffing.assignment_completed`
- `missing_info.flagged`
- `missing_info.resolved`
- `time_tbd.flagged`
- `time_tbd.resolved`
- `possible_conflict.viewed`
- `hard_conflict.blocked`
- `override.reason_saved`
- `manager_lite.invited`
- `manager_lite.activated`
- `operator.activated`
- `notification.opened`
- `coverage_queue.item_resolved`
- `availability_pattern.applied`
- `venue_default.applied`
- `activity_log.entry_written`

#### 14.2 Activation metrics

- Time to first real booking saved
- Time to first manual block saved
- Time to first public share created
- Time to first occurrence/template
- Time to first request sent
- Percentage of new workspaces reaching role-specific activation milestone
- Percentage of activated workspaces with a second session before next service day

#### 14.3 Loop health metrics

##### Schedule Truth Loop
- Future bookings per active owner
- Manual blocks per active owner
- Percentage of future service days with at least one schedule object
- Repeat booking entry frequency
- Public share creation after booking completeness increases

##### Coverage Fill Loop
- Open slots created
- Requests sent per open slot
- Request response rate
- Fill rate per occurrence/template
- Time from slot creation to slot filled
- Percentage of recurring staffing handled in-product

##### Share-to-Trust Loop
- Public shares created per active owner
- Reuse rate of public shares
- Open rate of public shares
- Repeat open rate
- Public-share-driven downstream booking or intake-draft capture rate

##### Request + Resolution Loop
- Open unresolved requests
- Time to request resolution
- Missing Info aging
- Time TBD aging
- Possible Conflict resolution rate
- Queue resolution velocity

#### 14.4 Retention metrics

- Weekly active workspaces by role mix
- Weekly active schedulers by role
- Percentage of workspaces with activity across consecutive service-day cycles
- Return rate after first completed workflow
- Ratio of active workspaces using two or more core workflows:
  - booking truth
  - sharing
  - coverage
  - resolution

#### 14.5 Expansion metrics

- Additional users invited per workspace
- Percentage of workspaces moving from one active role to two active roles
- Percentage of single-user workspaces adopting Manager Lite
- Percentage of owner workspaces adopting Coverage workflows
- Number of new workspaces attributed to direct workflow exposure or referral conversation
- Expansion conversion from successful operator or sharing-heavy accounts

#### 14.6 Quality and trust metrics

These are growth-critical:

- Conflict false-positive / false-negative reports
- Service-day or timezone support incidents
- Duplicate booking confusion incidents
- Share visibility misunderstanding incidents
- Assignment-blocking correctness issues
- PWA performance on key flows
- Request-linkage integrity errors

Growth should not be scaled faster than trust-quality metrics remain healthy.

---

## 3. Updated Any Other Affected Sections

The following wording adjustments are the only other affected changes needed for analytics-taxonomy consistency. No strategic content has changed.

### 9. Activation Strategy

#### Recommended activation milestone by role

##### DJ Owner activation
A DJ Owner should be considered activated when they:
- save at least one real future booking, and
- either save one manual availability block or create one public share, and
- return for at least one second session tied to a real future service day or decision.

### 10. Engagement and Habit Formation Strategy

#### Engagement design priorities

3. **Repeat-use shortcuts**
- Reuse public shares
- Reuse venue defaults
- Reuse availability patterns
- Reuse templates

### 11. Retention and Reactivation Strategy

#### Reactivation mechanics
- In-app badges and queue visibility first
- Role-specific unresolved counts
- “Needs attention” surfaces tied to real workflow state
- Manual success outreach for dormant but high-potential workspaces
- Guided re-entry for dormant users:
  - “Review upcoming week”
  - “Resolve open slots”
  - “Clear missing info”
  - “Reuse your public share”

### 13. Manual / Sales / Ops-Assisted Loops

#### 13.1 Guided first-workspace setup
Use human help to ensure:
- first real bookings are entered,
- first public share is created,
- first occurrence/template exists where relevant,
- first request is sent.

#### 13.4 Dormancy recovery outreach
If a workspace has:
- bookings created but no second-week usage,
- open slots but no requests,
- public shares created but never reused,
- manager invited but inactive,

then success/support can intervene with a targeted corrective workflow, not generic “come back” messaging.

---

## 4. Final Revised Growth Loops & User Adoption Plan

### 1. Growth Loops & User Adoption Summary

AmIFree Scheduler should grow through repeated, trusted workflow use, not through broad top-of-funnel tactics. The product’s strongest growth engine is: a DJ or team captures real work into the app, the app becomes more trustworthy, that trust unlocks more daily decisions inside the app, and those repeated decisions naturally pull in more roles, more workflows, and more recurring use.

The recommended growth model is depth-first:

- First, make the **DJ Owner** trust AmIFree as the place where real bookings and availability are kept accurate.
- Second, make **Operators** trust Coverage as the place where real staffing gets filled safely.
- Third, make **external sharing** the default low-friction way to answer “Are you free?” without leaking private schedule detail.
- Fourth, add **Manager Lite**, resolution workflows, reusable patterns, and nudges to increase frequency, consistency, and multi-user adoption.
- Fifth, use **manual and ops-assisted rollout** to expand successful workspaces into larger teams and adjacent workspaces.

The three strongest loops in the approved product direction are:

1. **Schedule Truth Loop**  
   Real bookings and manual blocks get captured → schedule becomes reliable → users check it more often → more future work gets captured there.

2. **Coverage Fill Loop**  
   Open shift capacity appears → operator sends requests and manages staffing in-product → slots get filled safely → operator trusts Coverage more → more staffing activity moves into the product.

3. **Share-to-Trust Loop**  
   External party asks availability → DJ shares Busy or Busy + Region link → recipient gets a fast, privacy-safe answer → fewer coordination loops → DJ reuses the product for future share situations and captures resulting work as bookings.

Everything else should strengthen those loops, not distract from them.

---

### 2. Growth Principles

1. **Trust before scale**  
   Growth should follow schedule correctness, conflict safety, service-day correctness, and privacy protection. If trust is weak, growth will be shallow and fragile.

2. **Workflow-rooted growth only**  
   The product should grow from real operational moments: a new gig, a request to staff a shift, an availability question, a missing info problem, a recurring schedule need.

3. **DJ-first, then team expansion**  
   Single-owner schedule trust is the first adoption milestone. Multi-user growth should follow only after that trust exists.

4. **Depth before breadth**  
   A workspace using more of its real scheduling/staffing workflow is more valuable than many shallow signups.

5. **Private schedule logic stays private**  
   Internal staffing eligibility must remain separate from public sharing. Growth must not rely on exposing internal logic or broader visibility than the locked model allows.

6. **Agenda and Coverage stay distinct**  
   Booking truth and staffing operations should reinforce each other, but not collapse into one overloaded surface.

7. **In-app behavior before outbound dependency**  
   Notifications, queues, reminders, and prompts should be in-app first. Email may help later, but should not be a launch or early-growth dependency.

8. **Human-assisted rollout is acceptable early**  
   For a small team, some growth can and should come from guided setup, hand-holding, and targeted success work, especially for team/operator adoption.

9. **Expansion must preserve safety**  
   No loop should pressure the team into auto-booking, over-sharing, AI autonomy, or unsafe assignment behavior.

10. **Measure completed workflow value, not vanity activity**  
    The primary signal is whether the product helps teams complete real scheduling and staffing work more reliably.

---

### 3. Inputs from Locked Phases

This plan is grounded in the approved source-of-truth constraints for AmIFree Scheduler, including DJ-first scope, booking-as-calendar-truth, separate manual availability blocks, separate request/occurrence/booking objects, Agenda vs Coverage separation, in-app-first notifications, private staffing eligibility, approved request-linkage behavior, and the V1 priority stack focused on coverage, requests, resolution, conflict explainability, patterns, performance, notifications, dashboards, defaults, and Manager Lite collaboration.

Key implications for growth:

- Growth must center on **Bookings**, **Manual Availability Blocks**, **Shift Occurrences**, and **Booking Requests** exactly as approved.
- Growth cannot depend on external calendar sync, marketplace dynamics, or broad intake expansion.
- Growth should use V1 features as **loop multipliers**, not as a separate strategy.
- External sharing is a **trust surface**, not a substitute for private schedule logic.
- The best retained behavior is likely tied to **nightlife service-day cadence**, recurring staffing needs, and repeated availability coordination.

Assumptions:

- Early customers are likely independent DJs, small DJ teams, agencies, or nightlife operators with recurring service-day planning needs.
- Early growth is primarily **product-led inside the workflow** and **ops-assisted at the workspace level**, not mass self-serve PLG.
- The product will be adopted in environments where time windows are fluid, cross-midnight work is common, and ad hoc coordination is a major pain point.

---

### 4. Core Adoption Goals

#### Primary adoption outcomes

1. Make the DJ Owner trust AmIFree as the place to track real future work.
2. Make schedule review part of the owner’s normal day-of and week-of routine.
3. Make external availability sharing happen through AmIFree instead of screenshots and ad hoc texting.
4. Make Operators trust Coverage as the safest place to fill open slots.
5. Make Manager Lite useful as a force multiplier for intake, cleanup, and handoff without breaking owner control.
6. Make V1 workflows reduce schedule entropy so the product becomes harder to replace.

#### Behavioral goals by role

- **DJ Owner**
  - Save real future bookings in AmIFree.
  - Save real manual availability blocks.
  - Check the agenda before accepting or confirming work.
  - Share Busy / Busy + Region links instead of manually explaining availability.
  - Return to resolve requests, conflicts, and missing info.

- **Manager Lite**
  - Capture incoming opportunities as intake drafts.
  - Convert or stage work cleanly into the approved linked booking path.
  - Reduce owner admin burden by resolving missing fields and maintaining consistency.
  - Become the second habitual user only after owner trust exists.

- **Operator**
  - Create and maintain one-off occurrences and recurring templates in-product.
  - Use request workflows instead of off-product staffing memory.
  - Trust open slots, active requests, and fill progress as operational truth.
  - Return frequently to close coverage gaps and monitor status changes.

- **Shared Viewer / External Recipient**
  - Open the shared availability view.
  - Understand quickly whether the DJ appears busy.
  - Use the link as a repeat coordination input.
  - Trigger future work that the DJ or manager then captures in-product.

---

### 5. Primary User Journeys to Strengthen

#### DJ Owner

**First value moment**
- Save a real future booking or confirmed gig.
- See it correctly on the mobile agenda timeline using the nightlife service day.
- Experience conflict or timing clarity that reduces mental load.

**Critical repeat behavior**
- Return to check the agenda before accepting new work.
- Add manual blocks when unavailable.
- Reuse sharing for external availability checks.
- Review requests and booking states from Inquiry through Booked.

**What strengthens adoption**
- Fast booking creation.
- Accurate cross-midnight handling.
- Clear alert states.
- Reliable mobile performance.
- Reusable defaults and patterns later in V1.

**What breaks adoption**
- Any mismatch between expected real-world schedule and what the app shows.
- Confusing difference between booking states and alert states.
- Too much setup before first real value.
- Overexposure of private schedule details when sharing.

#### Manager Lite

**First value moment**
- Create an intake draft or help clean up a booking with missing data.
- Reduce owner workload without causing duplicate or conflicting records.

**Critical repeat behavior**
- Capture incoming work the owner would otherwise forget, delay, or track elsewhere.
- Maintain data quality and progress bookings through the approved path.
- Help resolve Missing Info or Time TBD states in V1.

**What strengthens adoption**
- Clear limited role boundaries.
- Safe handoffs.
- Easy intake-to-booking flow.
- Context about what still needs owner review or decision.

**What breaks adoption**
- Ambiguity over authority.
- Work duplication with the owner.
- Any behavior that implies Manager Lite can bypass the linked booking path or create shadow schedule truth.

#### Operator

**First value moment**
- Create an occurrence or template, send requests, and see slot state change.
- Trust that hard conflicts are blocked and open capacity counts are correct.

**Critical repeat behavior**
- Return to Coverage to monitor open slots and active requests.
- Use the request workflow for each slot of capacity.
- Convert staffing progress into safe assigned/booked outcomes.

**What strengthens adoption**
- Clear separation between Coverage and Agenda.
- Accurate open slots count.
- Request lifecycle clarity.
- Staffing recommendations and action queue in V1.
- Exception queues and dashboards later in V1.

**What breaks adoption**
- Unreliable eligibility or conflict handling.
- Unclear distinction between public busy share and private staffing eligibility.
- Hidden or stale slot/request state.

#### Shared Viewer / External Recipient

**First value moment**
- Open the shared link and understand availability quickly.
- Trust that it is useful without seeing private operational detail.

**Critical repeat behavior**
- Ask for times, send opportunity details, or plan around known busy windows.
- Expect future availability coordination through the same shared link.

**What strengthens adoption**
- Fast mobile load.
- Simplicity.
- Privacy-safe presentation.
- Stable link behavior and understandable output.

**What breaks adoption**
- Too much detail.
- Confusing interpretation.
- Broken or stale links.
- Any implication that “not shown as busy” equals guaranteed eligibility or commitment.

Important: external recipients are not the primary retained product user in MVP. Their role is to increase sender trust, reduce coordination friction, and create expansion signals.

---

### 6. Main Growth Loop Candidates

1. **Schedule Truth Loop**  
   Product-led. Strongest now. Core owner retention loop.

2. **Coverage Fill Loop**  
   Product-led. Strong now for team/operator workspaces; stronger in early V1 with queue and recommendations.

3. **Share-to-Trust Loop**  
   Product-led. Strong now. Best external-facing loop that preserves privacy.

4. **Request Lifecycle Loop**  
   Product-led. Medium now; strong in V1 with orchestration and queueing.

5. **Resolution Loop (Missing Info / Time TBD / Possible Conflict)**  
   Product-led. More important in V1. Increases return frequency and data quality.

6. **Manager Delegation Loop**  
   Product-led with some ops assistance. Medium later. Strong for busy owners and team workspaces.

7. **Reusable Setup Loop (templates, defaults, patterns)**  
   Product-led. Medium later. Important for retention and time-to-value compression.

8. **In-App Nudge Loop**  
   Product-led. Later V1 multiplier. Helps reactivate incomplete work.

9. **Workspace Expansion Loop**  
   Mixed product-led and ops-led. Later. Triggered once one role becomes dependent on the product.

10. **Cross-Workspace Reputation / Referral Loop**  
    Mostly ops-led at first. Weak if treated as viral; stronger if treated as a trust-driven sales signal.

---

### 7. Recommended Growth Loops in Priority Order

#### Priority 1 — Schedule Truth Loop
This is the foundational loop. If the owner does not trust the app for real bookings and blocks, every other loop weakens.

#### Priority 2 — Coverage Fill Loop
For operator-led or team-led workspaces, this is the highest-leverage operational loop because it ties staffing demand directly to product usage.

#### Priority 3 — Share-to-Trust Loop
This is the best privacy-safe expansion surface already present in the approved model. It turns external coordination into a repeatable product behavior.

#### Priority 4 — Request Lifecycle + Resolution Loop
These should be treated as one operational reliability loop in early V1. They convert “work in limbo” into resolved outcomes and drive repeat visits.

#### Priority 5 — Manager Delegation Loop
This expands adoption from a single habitual user to a small working team without requiring broad role complexity.

#### Priority 6 — Reusable Setup + Defaults Loop
This lowers repeat setup cost and increases retention by making weekly usage easier than off-product alternatives.

#### Priority 7 — In-App Nudge Loop
This is a multiplier, not a base loop. It should only be emphasized after core trust and workflow correctness are strong.

#### Priority 8 — Cross-Workspace Expansion Loop
This should be pursued selectively and manually at first, not as a self-serve viral bet.

#### Strongest now vs later

**Strongest now**
- Schedule Truth Loop
- Coverage Fill Loop
- Share-to-Trust Loop

**Strongest in V1**
- Request Lifecycle + Resolution Loop
- Reusable Setup + Defaults Loop
- In-App Nudge Loop
- Manager Delegation Loop

**Strongest later, after architecture and ops maturity**
- Cross-workspace expansion
- Broader multi-user growth motion
- Repeatable team rollout playbooks

---

### 8. Loop-by-Loop Breakdown

#### 8.1 Schedule Truth Loop

- **Trigger**  
  A new gig, inquiry, hold, request-linked booking, confirmed event, or unavailable period appears in the real world.

- **User action**  
  DJ Owner or Manager Lite captures it as an intake draft, booking, or manual availability block, then reviews it on the agenda timeline.

- **Product value delivered**  
  A single trusted nightlife-aware schedule view, safer acceptance decisions, conflict visibility, and reduced mental overhead.

- **Loop output**  
  More future work exists in structured form inside the app, which improves schedule completeness and trust.

- **Repeat or downstream effect**  
  The owner checks the app before accepting future work, uses sharing more often, and becomes more likely to keep all future bookings inside the product.

**Why it matters**  
This is the base loop for activation, engagement, and retention. Without it, AmIFree is a nice helper. With it, AmIFree becomes the operational home base.

#### 8.2 Coverage Fill Loop

- **Trigger**  
  An operator has an open slot in a one-off occurrence or recurring template.

- **User action**  
  Operator creates or reviews the occurrence, sees open slots, sends one-slot requests, tracks active requests, and converts accepted paths into assigned/booked staffing outcomes.

- **Product value delivered**  
  Safe staffing progress, capacity clarity, blocked hard conflicts, and a dedicated workflow separate from the owner’s booking agenda.

- **Loop output**  
  Filled slots, fewer staffing gaps, and greater operator trust in Coverage as an operational tool.

- **Repeat or downstream effect**  
  Operators move more staffing activity into AmIFree, create more recurring templates, and depend on queue/recommendation surfaces in V1.

**Why it matters**  
This is the strongest loop for team workspaces because it converts recurring operational need into repeated product use.

#### 8.3 Share-to-Trust Loop

- **Trigger**  
  A promoter, client, venue, or collaborator asks whether the DJ is free.

- **User action**  
  DJ Owner sends a Busy or Busy + Region share link instead of manually describing availability.

- **Product value delivered**  
  Faster coordination, less repetitive messaging, better privacy, and a cleaner external communication pattern.

- **Loop output**  
  Recipient gets a useful answer; sender experiences lower coordination cost and greater confidence in the app’s usefulness.

- **Repeat or downstream effect**  
  The owner reuses the same share behavior in future conversations, captures resulting opportunities as drafts/bookings, and increasingly treats AmIFree as the outward-facing availability tool.

**Why it matters**  
This is the cleanest product-led external loop in MVP. It is not viral in the consumer sense, but it repeatedly converts external coordination into internal product reliance.

#### 8.4 Request Lifecycle + Resolution Loop

- **Trigger**  
  A request is sent, viewed, accepted, declined, expired, or remains unresolved; or a booking remains in Missing Info, Time TBD, or Possible Conflict state.

- **User action**  
  User returns to the app, reviews the open issue, resolves the request or missing detail, and updates the linked booking path.

- **Product value delivered**  
  Reduced operational ambiguity, cleaner booking states, faster staffing resolution, and lower schedule entropy.

- **Loop output**  
  More records move from uncertain to actionable states, improving trust across both Agenda and Coverage.

- **Repeat or downstream effect**  
  Users learn that unresolved work lives in AmIFree, which increases daily/weekly return behavior and makes in-app notifications valuable in V1.

**Why it matters**  
This loop turns the app from a static schedule record into an active operational control surface.

#### 8.5 Manager Delegation Loop

- **Trigger**  
  DJ Owner becomes too busy to capture or maintain all schedule/admin details personally.

- **User action**  
  Owner brings in Manager Lite; manager captures intake drafts, updates details, and helps progress work within approved boundaries.

- **Product value delivered**  
  Lower admin burden, higher schedule completeness, safer collaboration, and less dependence on the owner being the only data-entry person.

- **Loop output**  
  A second active user contributes to the same trusted schedule system.

- **Repeat or downstream effect**  
  The workspace becomes stickier, data quality improves, and owner retention increases because the product is now part of team workflow, not just personal workflow.

**Why it matters**  
This is the most natural within-workspace expansion path once owner trust exists.

#### 8.6 Reusable Setup + Defaults Loop

- **Trigger**  
  Repeating venues, repeating availability patterns, recurring staffing needs, or repeated booking-field entry.

- **User action**  
  Users apply recurring templates, reusable patterns, booking defaults, and venue defaults.

- **Product value delivered**  
  Lower setup time, more consistent data entry, faster weekly planning, and less friction in repeated use.

- **Loop output**  
  More work gets captured because doing so becomes easier and more predictable.

- **Repeat or downstream effect**  
  Weekly usage becomes habitual because AmIFree is faster than rebuilding schedule context manually each time.

**Why it matters**  
This loop increases retention and reduces operational fatigue, especially for recurring nightlife work.

#### 8.7 In-App Nudge Loop

- **Trigger**  
  Upcoming service day, unresolved conflict, open staffing gap, stale request, or missing booking detail.

- **User action**  
  User opens the app from an in-app badge, queue, or notification and resolves the item.

- **Product value delivered**  
  Timely attention to real work, fewer dropped tasks, and a stronger sense that the app is the operational inbox for scheduling issues.

- **Loop output**  
  Resolved tasks and preserved schedule trust.

- **Repeat or downstream effect**  
  Users start expecting the app to tell them what needs attention next, increasing active usage frequency.

**Why it matters**  
This is a multiplier loop that becomes powerful only after there is enough real workflow state to act on.

---

### 9. Activation Strategy

Activation should be defined by **completion of the first meaningful workflow**, not by sign-up.

#### Activation order

1. **DJ Owner activation**
2. **Operator activation** for team/operator workspaces
3. **Share behavior activation**
4. **Manager Lite activation**
5. **V1 issue-resolution activation**

#### Recommended activation milestone by role

##### DJ Owner activation
A DJ Owner should be considered activated when they:
- save at least one real future booking, and
- either save one manual availability block or create one public share, and
- return for at least one second session tied to a real future service day or decision.

##### Operator activation
An Operator should be considered activated when they:
- create one occurrence or template,
- send at least one request, and
- observe one slot progress event or status change.

##### Manager Lite activation
A Manager Lite user should be considered activated when they:
- create one intake draft or booking update that the owner actually uses, and
- help complete one real workflow step without creating duplicate work.

##### Shared Viewer activation
A shared viewer should be considered activated when they:
- open the link successfully, and
- produce a meaningful downstream coordination outcome, such as replying with dates, confirming a direction, or prompting a booking conversation.

#### Product tactics for activation

- Use a **role-aware onboarding path** rather than one generic walkthrough.
- Optimize the first-run experience around **real data entry**, not sample data.
- Use lightweight checklists:
  - Add first booking
  - Add first unavailable time
  - Create first share link
  - Create first coverage item or send first request
- Present the agenda immediately after first save so the user sees the service-day model working.
- For team workspaces, guide operators into Coverage, not Agenda, as their first primary surface.
- Prompt home-screen install only after first real value is delivered.

#### What should be encouraged first

For DJ Owner:
1. Add real future bookings
2. Add real unavailable periods
3. Check agenda before accepting work
4. Share Busy / Busy + Region link

For Operator:
1. Create real occurrence/template
2. Send real request
3. Track real fill progress

For Manager Lite:
1. Capture real inbound work
2. Resolve incomplete details
3. Support owner review

---

### 10. Engagement and Habit Formation Strategy

Habit should be built around the product’s real operational cadence, not arbitrary “daily active use” pressure.

#### Habit anchors by role

##### DJ Owner
- **Week-of planning habit**: review future bookings and holds for the week.
- **Day-of habit**: check the agenda before travel, setup, or accepting additional work.
- **Opportunity-response habit**: use the app when new gigs appear or availability is questioned.
- **Share habit**: send the link instead of manually explaining schedule status.

##### Operator
- **Coverage-check habit**: review open slots and active requests on a predictable staffing cadence.
- **Day-of exception habit**: use Coverage for late changes, declines, or unresolved slots.
- **Template habit**: rely on recurring templates for repeated service-day staffing.

##### Manager Lite
- **Intake-clearing habit**: capture or clean incoming work during the day.
- **Resolution habit**: close Missing Info and Time TBD items in V1.
- **Handoff habit**: prep clean records for owner review.

#### Engagement design priorities

1. **Next-best-action surfaces**
   - Show unresolved items, not just stored records.
   - Prioritize open slots, requests awaiting action, missing info, and possible conflicts.

2. **Empty-state guidance**
   - No generic blank states.
   - Each role should see one next useful step tied to real work.

3. **Repeat-use shortcuts**
   - Reuse public shares
   - Reuse venue defaults
   - Reuse availability patterns
   - Reuse templates

4. **Operational visibility**
   - Give users confidence that the system is current.
   - Surface recent state changes clearly.

5. **Mobile-first speed**
   - The product must be fast enough to use in the field, between messages, or on the way to a gig.

#### The real habit target

The habit target is not “open every day.”  
It is: **when scheduling or staffing work appears, the user instinctively opens AmIFree first.**

---

### 11. Retention and Reactivation Strategy

Retention will come from operational dependence, not novelty.

#### Primary retention drivers

1. **Schedule trust**
   - The app reflects reality correctly.
   - The owner feels safer making decisions with it than without it.

2. **Friction reduction**
   - Sharing, staffing, and cleanup are faster than off-product alternatives.

3. **Workflow centralization**
   - Open requests, missing info, recurring coverage, and availability answers all live in one place.

4. **Multi-user embeddedness**
   - Once a manager or operator depends on the workspace, churn becomes less likely.

5. **Compounding setup value**
   - Templates, patterns, defaults, and accumulated booking history reduce future work.

#### Reactivation triggers

##### DJ Owner
- Upcoming service day with incomplete data
- New opportunity that creates decision pressure
- Repeated external availability asks
- Need to avoid double-booking

##### Operator
- Open slots still unfilled
- Active requests unresolved
- Recurring template coming due
- Last-minute staffing change

##### Manager Lite
- Intake backlog
- Missing info backlog
- Owner needing handoff support

#### Reactivation mechanics

- In-app badges and queue visibility first
- Role-specific unresolved counts
- “Needs attention” surfaces tied to real workflow state
- Manual success outreach for dormant but high-potential workspaces
- Guided re-entry for dormant users:
  - “Review upcoming week”
  - “Resolve open slots”
  - “Clear missing info”
  - “Reuse your public share”

#### Retention posture

Retention should be measured by **continued workflow completion over service-day cycles**, not just generic weekly activity.

---

### 12. Expansion Loops

#### 12.1 Within workspace

This is the most important expansion path.

##### Owner → Manager Lite
Once the owner sees value and begins to feel admin pressure, inviting a Manager Lite user is the natural next step.

**Expansion driver**
- Owner wants help with intake and cleanup without losing control.

**Why it works**
- It increases completeness and reduces bottleneck risk.

##### Owner / Manager → External sharing reuse
As availability conversations repeat, sharing becomes normalized.

**Expansion driver**
- External coordination volume increases.

**Why it works**
- It makes the product the standard way this workspace answers availability questions.

##### Owner / Operator → More Coverage usage
Once one staffing flow succeeds, more recurring shifts move into templates and occurrences.

**Expansion driver**
- Recurring service-day staffing demand.

**Why it works**
- Coverage saves time on repeated staffing coordination.

##### Single-user → Multi-role workspace
A workspace that starts with only the owner can expand to include operators and managers as workflow complexity grows.

**Expansion driver**
- The product proves trustworthy enough to become team infrastructure.

**Why it works**
- Each added role increases workspace stickiness and process centralization.

#### 12.2 Cross-workspace / network

Cross-workspace growth should be selective and trust-led, not viral or spammy.

##### External recipient → New workspace interest
A venue, promoter, or collaborator repeatedly sees AmIFree links and experiences cleaner coordination.

**Expansion output**
- They ask what tool is being used or request a similar workflow for their own operation.

**Recommended motion**
- Treat this as a sales or founder-led signal, not an automated referral funnel.

##### Staffed DJ / collaborator → Personal workspace adoption
A DJ who receives requests through an AmIFree-powered workflow may want their own schedule system.

**Expansion output**
- They adopt AmIFree for their own bookings and share behavior.

**Recommended motion**
- Enable through intentional invitation and setup, not implicit network coupling.

##### Operator playbook → Another team rollout
A successful operator or agency workflow can be replicated to another internal team or nearby partner organization.

**Expansion output**
- New workspace creation using the same rollout playbook.

**Recommended motion**
- Manual and templated at first.

#### Expansion rule

Expansion should happen through **proven value transfer**, not through exposing shared pools, leaking private state, or creating uncontrolled network interactions.

---

### 13. Manual / Sales / Ops-Assisted Loops

These loops are important early and realistic for a small team.

#### 13.1 Guided first-workspace setup
Use human help to ensure:
- first real bookings are entered,
- first public share is created,
- first occurrence/template exists where relevant,
- first request is sent.

This is high leverage because early failure is more likely caused by setup friction than by product irrelevance.

#### 13.2 Role rollout sequencing
Success or onboarding can recommend:
- owner first,
- then operator if staffing exists,
- then manager lite when workload justifies it.

This avoids activating too many roles before schedule truth is established.

#### 13.3 Coverage launch assistance
For operator-heavy workspaces, help configure:
- first recurring template,
- first open slot batch,
- request process norms,
- staffing cadence.

This speeds adoption of the strongest team loop.

#### 13.4 Dormancy recovery outreach
If a workspace has:
- bookings created but no second-week usage,
- open slots but no requests,
- public shares created but never reused,
- manager invited but inactive,

then success/support can intervene with a targeted corrective workflow, not generic “come back” messaging.

#### 13.5 Founder-led expansion from trusted usage
When a workspace shows strong schedule truth or coverage use:
- ask who else needs this workflow,
- offer a guided second workspace or second-role rollout,
- use the existing workflow as proof.

#### 13.6 Support-driven cleanup loop
Support can help recover value by resolving:
- timezone/service-day confusion,
- request linkage confusion,
- duplicate process habits,
- misunderstanding about Busy vs eligibility.

This is especially important because growth depends on trust, and trust can be lost through subtle workflow misunderstanding.

---

### 14. What to Instrument and Measure

Instrumentation should track loop progression, not just isolated events.

#### 14.1 Core event layer

Recommended high-value event families, aligned to the locked Phase 9 taxonomy:

- `booking.created`
- `booking.updated`
- `booking.state_changed`
- `manual_block.created`
- `manual_block.updated`
- `intake_draft.created`
- `intake_draft.converted_to_booking`
- `public_share.created`
- `public_share.viewed`
- `public_share.reused`
- `shift_occurrence.created`
- `shift_occurrence.generated`
- `shift_occurrence.capacity_recomputed`
- `shift_template.created`
- `shift_template.paused`
- `shift_template.resumed`
- `booking_request.sent`
- `booking_request.viewed`
- `booking_request.accepted`
- `booking_request.declined`
- `booking_request.expired`
- `booking_request.converted`
- `staffing.assignment_completed`
- `missing_info.flagged`
- `missing_info.resolved`
- `time_tbd.flagged`
- `time_tbd.resolved`
- `possible_conflict.viewed`
- `hard_conflict.blocked`
- `override.reason_saved`
- `manager_lite.invited`
- `manager_lite.activated`
- `operator.activated`
- `notification.opened`
- `coverage_queue.item_resolved`
- `availability_pattern.applied`
- `venue_default.applied`
- `activity_log.entry_written`

#### 14.2 Activation metrics

- Time to first real booking saved
- Time to first manual block saved
- Time to first public share created
- Time to first occurrence/template
- Time to first request sent
- Percentage of new workspaces reaching role-specific activation milestone
- Percentage of activated workspaces with a second session before next service day

#### 14.3 Loop health metrics

##### Schedule Truth Loop
- Future bookings per active owner
- Manual blocks per active owner
- Percentage of future service days with at least one schedule object
- Repeat booking entry frequency
- Public share creation after booking completeness increases

##### Coverage Fill Loop
- Open slots created
- Requests sent per open slot
- Request response rate
- Fill rate per occurrence/template
- Time from slot creation to slot filled
- Percentage of recurring staffing handled in-product

##### Share-to-Trust Loop
- Public shares created per active owner
- Reuse rate of public shares
- Open rate of public shares
- Repeat open rate
- Public-share-driven downstream booking or intake-draft capture rate

##### Request + Resolution Loop
- Open unresolved requests
- Time to request resolution
- Missing Info aging
- Time TBD aging
- Possible Conflict resolution rate
- Queue resolution velocity

#### 14.4 Retention metrics

- Weekly active workspaces by role mix
- Weekly active schedulers by role
- Percentage of workspaces with activity across consecutive service-day cycles
- Return rate after first completed workflow
- Ratio of active workspaces using two or more core workflows:
  - booking truth
  - sharing
  - coverage
  - resolution

#### 14.5 Expansion metrics

- Additional users invited per workspace
- Percentage of workspaces moving from one active role to two active roles
- Percentage of single-user workspaces adopting Manager Lite
- Percentage of owner workspaces adopting Coverage workflows
- Number of new workspaces attributed to direct workflow exposure or referral conversation
- Expansion conversion from successful operator or sharing-heavy accounts

#### 14.6 Quality and trust metrics

These are growth-critical:

- Conflict false-positive / false-negative reports
- Service-day or timezone support incidents
- Duplicate booking confusion incidents
- Share visibility misunderstanding incidents
- Assignment-blocking correctness issues
- PWA performance on key flows
- Request-linkage integrity errors

Growth should not be scaled faster than trust-quality metrics remain healthy.

---

### 15. What to Avoid or Defer

1. **Paid acquisition before loop proof**  
   Do not pour traffic into a workflow product before the core loops retain.

2. **Marketplace/discovery growth**  
   Explicitly deferred. It does not match the approved direction.

3. **Broad community or social virality bets**  
   This is not a consumer social product. Forced virality would likely weaken trust.

4. **External recipient write-back as product dependency**  
   External viewers are a trust surface, not a required active workflow user in MVP.

5. **Broad intake expansion beyond DJ / Manager Lite**  
   Deferred unless explicitly re-approved later.

6. **Email-first growth motion**  
   Notifications and workflow completion should remain in-app first.

7. **Any growth tactic that blurs private staffing eligibility with public sharing**  
   This violates core trust and privacy design.

8. **Any growth tactic that implies “not busy” equals eligible or confirmed**  
   This would create operational and trust risk.

9. **Generic productivity positioning**  
   The product should stay grounded in DJ-first scheduling and staffing reality.

10. **AI autonomy as a growth shortcut**  
    AI remains review-before-save. Do not use automation claims as a core adoption lever.

11. **Cross-workspace shared labor pool mechanics**  
    Defer. Too risky relative to current product constraints.

12. **Growth through role overload**  
    Do not push manager/operator complexity onto simple single-owner users too early.

---

### 16. Dependencies and Preconditions

1. **Post-launch stability is achieved**  
   Growth work should accelerate only after correctness, privacy, and operational safety are stable.

2. **Service-day and timezone handling are reliable**  
   This is foundational to trust and repeat use.

3. **Conflict logic is dependable**  
   Especially for hard-blocking assigned/booked bookings and manual availability blocks.

4. **Request-linkage behavior is correct**  
   Sent request must create or link a requested booking; accept/convert must preserve the same linked path.

5. **Coverage state is dependable**  
   Open slots, active requests, and filled slots must remain accurate.

6. **Sharing is fast, clear, and revocable**  
   It must be simple enough to become habitual.

7. **Role permissions are understandable**  
   Especially between owner, manager lite, operator, and external recipient surfaces.

8. **Analytics instrumentation is live**  
   Without this, loop diagnosis will be guesswork.

9. **Onboarding and support content exist**  
   Even minimal role-specific guidance materially improves adoption.

10. **V1 multipliers ship in the approved order**  
    Coverage queue, request orchestration, resolution flows, explainability, patterns, performance, nudges, dashboards, defaults, and manager collaboration should amplify the loops in sequence.

---

### 17. Main Risks and Tradeoffs

#### Risk 1: Growing before trust is mature
If the app is pushed aggressively before schedule correctness is trusted, usage may spike briefly and then collapse.

**Tradeoff**
- Slower early expansion, stronger long-term retention.

#### Risk 2: Over-rotating toward external sharing
Shared links are useful, but they are not the full growth engine.

**Tradeoff**
- Treat sharing as a reinforcement loop, not the sole acquisition surface.

#### Risk 3: Activating too many roles too early
Multi-role complexity can confuse early single-owner users.

**Tradeoff**
- Sequence roles gradually instead of maximizing invites immediately.

#### Risk 4: Weak operator adoption if owner schedule truth is incomplete
Coverage gets weaker when the underlying booking data is poor.

**Tradeoff**
- Ensure owner capture habits and operator workflows reinforce each other.

#### Risk 5: Over-notifying users in V1
Too many nudges will feel noisy and reduce trust.

**Tradeoff**
- Resolve real high-value tasks only; keep nudges sparse and actionable.

#### Risk 6: Manual rollout does not scale forever
Ops-assisted growth is useful early, but cannot be the final model.

**Tradeoff**
- Use manual rollout to discover repeatable activation patterns, then productize the best ones.

#### Risk 7: Expansion pressure could compromise privacy
Trying to create faster network effects may tempt broader visibility or looser sharing semantics.

**Tradeoff**
- Preserve trust boundaries even if expansion is slower.

---

### 18. Final Recommended Growth Loops & User Adoption Plan

AmIFree Scheduler should pursue a **workflow-compounding growth strategy** centered on schedule trust, staffing reliability, and privacy-safe sharing.

#### Recommended operating thesis

**AmIFree grows when it becomes the fastest trusted place to:**
- capture real bookings,
- protect against schedule mistakes,
- fill real staffing needs,
- and answer real availability questions.

#### Recommended loop stack

##### Tier 1: Core now
1. **Schedule Truth Loop**
2. **Coverage Fill Loop**
3. **Share-to-Trust Loop**

These are the loops to build activation and early retention around.

##### Tier 2: Core V1 multipliers
4. **Request Lifecycle + Resolution Loop**
5. **Manager Delegation Loop**
6. **Reusable Setup + Defaults Loop**
7. **In-App Nudge Loop**

These make the product operationally sticky and increase role depth per workspace.

##### Tier 3: Controlled expansion
8. **Within-workspace multi-role expansion**
9. **Manual cross-workspace expansion from trusted usage**

These should come after loop proof, not before it.

#### Recommended adoption sequence

**Step 1 — Prove owner trust**
- Focus onboarding, UX, and support on getting DJ Owners to capture real future bookings and blocks.
- Make share link creation the first external-facing habit.
- Measure second-session return tied to real service-day workflows.

**Step 2 — Prove operator utility**
- In relevant workspaces, move staffing coordination into Coverage.
- Use requests and slot state to make Coverage indispensable.
- Emphasize recurring templates where staffing repeats.

**Step 3 — Add issue-resolution gravity**
- Ship V1 queues, orchestration, and resolution flows that pull users back for real operational cleanup.
- Make unresolved work visible and actionable.

**Step 4 — Expand to small-team dependence**
- Add Manager Lite as the first meaningful internal expansion path.
- Use defaults, patterns, and safe handoffs to reduce friction and increase completeness.

**Step 5 — Expand selectively outward**
- Use repeated share-link trust and successful operator workflows as signals for manual expansion into adjacent users and workspaces.
- Do not force network mechanics before the product and architecture are ready.

#### Final recommendation

The best growth plan for AmIFree is not “more users faster.”  
It is:

- get the **DJ Owner** to trust the schedule,
- get the **Operator** to trust Coverage,
- get external parties to trust **Busy / Busy + Region sharing**,
- use V1 to turn unresolved workflow state into repeat return behavior,
- and expand from successful workspaces outward in a controlled, privacy-safe, workflow-native way.

That approach fits the locked product truths, preserves trust, matches the approved V1 direction, and gives a small team the highest chance of building durable adoption rather than shallow activity.
