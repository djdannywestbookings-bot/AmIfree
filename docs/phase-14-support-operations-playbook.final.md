# [14] Phase — Support & Operations Playbook

## 1. Support & Operations Playbook Summary

This playbook defines how AmIFree Scheduler should be supported and operated in live use by a small MVP team while preserving booking truth, staffing integrity, request-linkage integrity, privacy, and mobile-first usability. It operationalizes the locked source-of-truth inputs for Phase 14.

Primary objective: keep the live product trustworthy, understandable, and stable without introducing silent data drift or support-side workarounds that weaken core product rules.

Scope of this playbook:
- Day-to-day support operations
- Ticket intake, triage, routing, severity, and escalation
- Direct support actions versus escalations
- Daily and weekly operational checks
- Incident handling
- Schedule truth, request-linkage, staffing/capacity, and sharing/privacy issue handling
- User communication standards
- Minimum internal tools needed to operate safely

Explicit assumptions:
- A1. Small-team model: MVP live operations are handled by a small team with four functional roles: Support/Ops Generalist, Product/Ops Owner, rotating On-call Engineer, and QA/Release Owner.
- A2. Coverage model: Standard support coverage is one U.S. business-hours window. After-hours paging is reserved for Sev 1 and live-event Sev 2 issues.
- A3. Peak-risk pattern: Since the product is DJ-first, the highest operational risk window is evenings and weekends around live gigs. Tickets affecting the next 72 hours are prioritized above ordinary backlog work.
- A4. Tooling model: Safe admin tooling exists or will be built for read-only inspection, audit logs, share-link revocation, idempotent retries, and ticket-linked admin actions. If the tool does not exist, support escalates rather than improvises through raw data access.
- A5. Queue model: All support work flows through one official ticket queue with required tags and object IDs. Informal chats, DMs, and texts do not count as resolved support work.

Minimum viable operating model:
- One shared support queue
- One rotating incident owner for Sev 1 and Sev 2 issues
- One engineer on-call for product-breaking, truth, linkage, privacy, and worker/job issues
- One weekly operations review
- One strict rule set for what support may and may not mutate directly
- One audit trail for every administrative action affecting a live account or record

## 2. Operating Principles

1. Truth before speed.
The team does not close the ticket fast by making opaque fixes that risk corrupting bookings, requests, occurrences, or public sharing.

2. Canonical objects first.
Investigation starts with canonical records, not rendered UI. In AmIFree, Booking is the only calendar-truth object. Manual Availability Blocks are separate schedule objects. Requests and Shift Occurrences are separate from Bookings.

3. Derived views are never repaired before source records.
Agenda, Coverage, share outputs, and eligibility outputs are derived surfaces. If one is wrong, support investigates the source record and derivation path first.

4. Lifecycle state and alert state are separate.
Support must not describe a Hard Conflict or Missing Info alert as though it were a Booking lifecycle state change.

5. Agenda and Coverage remain separate.
Agenda is for Bookings only. Coverage is for Shift Occurrences only. Support must not explain one screen using the logic of the other.

6. Privacy and least disclosure come first.
The product exposes only Busy or Busy + Region externally. Internal staffing eligibility logic is private. Support must not expose internal eligibility reasoning through public-share explanations.

7. No silent mutations.
Every support-side action that changes data must be explicitly logged with actor, ticket ID, reason, before/after snapshot, and affected object IDs.

8. No policy-breaking workarounds.
Support must not bypass hard conflict rules, force assignment, create shadow bookings, hand-edit occurrence counts, or create special-case visibility behavior.

9. Contain first when trust is at risk.
For privacy leaks, incorrect live schedule truth, or widespread linkage corruption, containment comes before deep root-cause explanation.

10. Live-event proximity matters.
A localized issue affecting a gig tonight can outrank a broader but less time-sensitive defect.

11. Support is not an unreviewed data-repair function.
Frontline support explains, triages, verifies, and performs only safe audited admin actions. Data repair belongs to engineering or explicitly approved operations tooling.

12. Support should reduce confusion, not invent certainty.
User communication must separate: what is confirmed, what is being investigated, what the user should do now, and when they will hear back.

## 3. Team Roles and Responsibilities

### 3.1 Support/Ops Generalist
Primary responsibilities:
- Own the shared ticket queue
- Triage, tag, and severity-rank incoming issues
- Collect required IDs, timestamps, screenshots, and reproduction notes
- Perform approved safe admin actions
- Communicate with users during normal support handling
- Open incident tickets and page the right internal owner
- Maintain macros, known issues, and internal runbooks

May do:
- Read-only inspection of admin views
- Share-link revoke/regenerate
- Auth/session recovery steps
- Idempotent retries where tooling explicitly supports them
- Ticket linking, duplicate merge, categorization

May not do:
- Raw DB repair
- Booking/request/occurrence relinking
- Manual lifecycle changes on live truth objects outside approved flows
- Force assignment or hard-conflict bypass
- Manual edits to derived counters like open_slots_count

### 3.2 Product/Ops Owner
Primary responsibilities:
- Own policy interpretation and edge-case decisions
- Approve user-facing incident language for major trust issues
- Decide whether a behavior is known/expected, bug, or needs product clarification
- Prioritize recurring issue classes into product backlog
- Approve temporary workarounds that affect user behavior

Must be involved for:
- Privacy/trust incidents
- Behavior ambiguity around product rules
- Decisions about banners, known-issue messaging, or workflow changes
- Requests for exceptions to locked product truths

### 3.3 On-call Engineer
Primary responsibilities:
- Diagnose product defects, worker failures, performance regressions, and data inconsistencies
- Perform data repair when needed
- Build or use admin repair tools
- Contain incidents with feature flags, worker pauses, or kill switches
- Ship hotfixes and verify post-fix system behavior

Owns:
- Any issue involving data repair
- Any issue involving request-linkage integrity
- Any issue involving occurrence-capacity math drift
- Any issue involving share/privacy overexposure
- Any issue involving auth, jobs, latency, or service failure

### 3.4 QA/Release Owner
Primary responsibilities:
- Reproduce bugs from ticket evidence
- Validate bug fixes and hotfixes
- Run focused regression checks for affected flows
- Confirm issue closure criteria before final close on defects
- Maintain regression lists for high-risk surfaces:
  - Booking lifecycle
  - Conflict handling
  - Request-linkage
  - Occurrence generation and capacity
  - Public sharing
  - Schedule commitments

### 3.5 Functional backup model
- Support/Ops Generalist is primary queue owner
- Product/Ops Owner is backup for support prioritization
- On-call Engineer is backup for all Sev 1 and Sev 2 technical escalations
- QA/Release Owner is required before closing any production defect ticket as fixed

## 4. Support Intake Channels and Rules

### 4.1 Official support channels
1. In-app support form — primary channel for authenticated users
2. Support email — fallback for locked-out users and users who cannot access the app
3. Internal operator escalation form — for staffing or operations users handling live coverage issues
4. Privacy/security intake path — same queue, but auto-tagged for immediate review when the issue mentions sharing, exposure, unauthorized access, or wrong visibility

### 4.2 Unsupported channels
The following are not accepted as final support channels:
- Personal text messages
- Social DMs
- Ad hoc internal chat messages without ticket creation
- Verbal-only reports without follow-up ticket logging

If an issue first appears in one of those channels, support opens a ticket immediately and moves the handling there.

### 4.3 Required intake fields
Every ticket should capture:
- Reporter name and contact email
- Reporter role: DJ, Manager Lite, Operator, other
- Environment: production unless otherwise specified
- Issue category
- Affected object type:
  - Booking
  - Booking Request
  - Shift Occurrence
  - Shift Template
  - Manual Availability Block
  - Share link
  - Intake Draft
  - Notification
  - Auth/account
- Affected object ID(s) if known
- Affected service day
- Venue timezone if schedule-related
- Whether the issue affects the next 72 hours
- Number of affected users
- Screenshot or screen recording if helpful
- Steps user took immediately before issue
- Whether privacy or trust is implicated

### 4.4 Queue states
All tickets move through a standard state model:
- New
- Triaged
- Waiting on User
- Escalated to Engineering
- Escalated to Product
- Escalated to QA
- Monitoring
- Resolved
- Closed

### 4.5 Intake rules
- Every ticket must be tagged with severity, issue category, and live-event impact.
- Tickets affecting gigs in the next 72 hours get a Live Event flag.
- Privacy concerns are never left untagged; they default to trust-sensitive routing.
- Something is wrong with my calendar is insufficient; support must identify whether the issue is Booking truth, Manual Availability Block logic, request-linkage, occurrence coverage, public sharing, or eligibility interpretation.
- Support must capture venue timezone and service day before declaring a cross-midnight display a bug.
- Support must not promise a fix until the issue has been classified as expected behavior, user configuration issue, transient failure, product defect, data inconsistency, or privacy incident.

## 5. Ticket Categories and Routing

### 5.1 Auth and account access
Examples:
- Cannot log in
- Session expired repeatedly
- Magic link not working
- Wrong account role displayed

Primary owner: Support/Ops
Escalate to engineering if: repeated auth failures, role mismatch from source data, broad access failure

### 5.2 Booking lifecycle and schedule truth
Examples:
- Booking missing from Agenda
- Booking appears on wrong day
- Hard conflict not showing correctly
- Manual Availability Block interaction seems wrong

Primary owner: Support/Ops for triage
Escalate to engineering if: canonical data mismatch, derivation mismatch, hard-block failure, multiple users affected

### 5.3 Request-linkage
Examples:
- Sent request has no linked Requested Booking
- Accepted request created duplicate Booking
- Request status and linked Booking state diverge

Primary owner: Engineering after initial support triage
Support role: gather IDs, timeline, screenshots, and audit references

### 5.4 Shift template / Shift occurrence / capacity / coverage
Examples:
- Occurrence count looks wrong
- Coverage shows slot open when filled
- Template resume created duplicate future occurrences
- Open slots appear wrong

Primary owner: Support/Ops for first-pass review
Escalate to engineering if: formula mismatch, duplicate generation, stale counters, impossible values, overfill, underfill, staffing block bug

### 5.5 Staffing eligibility and conflict handling
Examples:
- Operator says DJ looks available but cannot assign
- DJ says I am free but system blocks assignment
- Hard conflict dispute

Primary owner: Support/Ops for explanation and inspection
Escalate to engineering if: rule evaluation appears wrong
Escalate to product if: complaint is policy-based rather than defect-based

### 5.6 Sharing and privacy
Examples:
- Public share reveals too much
- Share link missing expected busy time
- Busy + Region shows wrong region
- Link should be revoked immediately

Primary owner: Support/Ops for containment
Immediate escalation: Product/Ops Owner and On-call Engineer for any possible overexposure

### 5.7 Intake Draft / AI extraction
Examples:
- Draft extraction failed
- Parsed details look wrong before save
- Draft did not stage correctly

Primary owner: Support/Ops
Escalate to engineering if: extraction job failed repeatedly or malformed structured output blocks flow

### 5.8 Notifications
Examples:
- In-app notification missing
- Duplicate notification burst
- Request notification out of sync

Primary owner: Support/Ops
Escalate to engineering if: recurring failure, fanout storm, status transition mismatch

### 5.9 Performance / outage / jobs
Examples:
- Slow app
- Coverage view timing out
- Worker failures
- Widespread errors

Primary owner: Engineering
Support role: incident intake, affected-user communication, ticket linking

### 5.10 UX confusion / product understanding
Examples:
- User expects Requested to appear in public Busy
- User confuses Coverage with Agenda
- User thinks Possible Conflict means blocked

Primary owner: Support/Ops
Escalate to product if: confusion is systematic and should drive copy or UX changes

### 5.11 Billing / subscription / account admin
Primary owner: Product/Ops
Escalate to engineering only if: entitlements or role provisioning are broken

## 6. Severity Model

### Sev 1 — Critical trust or service failure
Definition:
- Confirmed or strongly suspected privacy exposure
- Widespread production outage
- Widespread inability to access or use core workflow
- Request-linkage corruption at scale
- Incorrect assigned/booked behavior causing live operational risk
- Public sharing exposing data beyond Busy or Busy + Region rules
- Hard-conflict protections failing in live assignment flow

Response target:
- Immediate page
- Human acknowledgment within 15 minutes
- Internal incident room opened immediately
- User-facing updates at least every 30 minutes while active

### Sev 2 — Major workflow impairment
Definition:
- Core workflow broken for one or several users
- Issue affects a live or near-term event within 72 hours
- Schedule truth mismatch for live records
- Capacity or staffing logic blocks correct workflow
- Repeated worker failure on an important flow
- Sent request without proper linked Requested Booking for a live workflow

Response target:
- Human acknowledgment within 1 business hour
- Engineering engaged same business window
- User updated when classification is complete and after any material change

### Sev 3 — Localized defect or moderate friction
Definition:
- Single-user defect without immediate live-event risk
- Non-critical notification issue
- Localized UI confusion or stale render
- Draft extraction failure with workaround available
- Incorrect display that does not mutate truth

Response target:
- Human acknowledgment within 1 business day
- Routed in normal backlog with live-window reprioritization if needed

### Sev 4 — Low urgency / non-blocking
Definition:
- Feature request
- Cosmetic bug
- Minor copy issue
- General product feedback
- Low-value cleanup

Response target:
- Human acknowledgment within 2 business days
- Reviewed in weekly operations/product planning

### 6.5 Live Event priority rule
Any ticket touching a Booking, Request, or Shift Occurrence in the next 72 hours gets a Live Event flag.
That flag raises handling priority and may raise severity if:
- schedule truth is unclear,
- staffing eligibility is disputed,
- a request-linkage issue may affect assignment,
- public sharing may misrepresent availability.

## 7. Escalation Rules

### 7.1 Immediate escalation triggers
Support escalates immediately when any of the following is true:
- Possible privacy or visibility overexposure
- Sent request has no linked Requested Booking
- Duplicate Booking appears tied to one request path
- Assignment or conversion breaks the linked path
- open_slots_count is impossible or inconsistent with source records
- Hard conflict appears bypassed
- Assigned or Booked records appear missing from blocking logic
- Manual Availability Block appears saved over Assigned or Booked Booking
- Widespread worker/job failures
- Broad auth or performance incident
- Any issue affecting multiple live gigs tonight or this weekend

### 7.2 Escalation ownership
- Support/Ops Generalist opens and classifies
- Product/Ops Owner approves policy-sensitive messaging and exception handling
- On-call Engineer owns technical diagnosis, containment, and repair
- QA/Release Owner validates defect fixes before closure

### 7.3 Escalation workflow
1. Create or update the ticket with severity, category, Live Event flag, and affected IDs.
2. Add internal note with known facts only.
3. Page the correct owner based on severity and category.
4. If Sev 1 or trust-sensitive, create one master incident ticket.
5. Link all duplicate user tickets to the master incident ticket.
6. Freeze unsafe admin mutations until engineering confirms the repair path.
7. Resume ordinary support closure only after verification.

### 7.4 Downgrade rule
A Sev 1 or privacy-tagged issue cannot be downgraded by frontline support alone.
Downgrade requires Product/Ops Owner or On-call Engineer agreement.

## 8. What Support Can Resolve Directly

### 8.1 Read-only investigation actions
Support may directly:
- Verify lifecycle state, alert state, service day, venue timezone, and view context
- Explain cross-midnight service-day behavior
- Explain why soft-state bookings do not appear in public shared Busy output
- Explain difference between public sharing and internal staffing eligibility
- Verify whether an issue is in Agenda or Coverage
- Confirm whether a Manual Availability Block is the hard-blocking source
- Confirm whether a user is seeing Busy versus Busy + Region mode

### 8.2 Safe admin actions
Support may directly perform only the following write actions when tooling supports them and audit logging is automatic:
- Resend auth or sign-in recovery
- End a stuck session
- Revoke or regenerate a public share link
- Retry an idempotent in-app notification delivery
- Retry a failed Intake Draft extraction job where no Booking has yet been created
- Cancel a clearly failed draft-stage job that has not mutated live Booking truth
- Update non-truth account metadata such as display preferences or support labels
- Merge duplicate tickets and clean queue metadata

### 8.3 Direct user guidance
Support may directly:
- Walk the user to the correct object (Booking vs Request vs Occurrence)
- Explain why a hard-conflicted DJ cannot be force-assigned
- Explain why a Manual Availability Block cannot overlap Assigned or Booked Bookings
- Explain why a Possible Conflict is not a hard block
- Explain why not shared does not equal not eligible

### 8.4 Conditions for direct resolution
Support may close directly only when:
- no truth object repair is needed,
- no privacy risk remains,
- no linkage inconsistency remains,
- no engineering fix is required,
- the explanation matches the locked product behavior,
- the ticket includes all relevant IDs and notes.

## 9. What Must Escalate to Engineering / Product / QA

### 9.1 Must escalate to Engineering
- Any request-linkage inconsistency
- Any Booking truth mismatch requiring data repair
- Any derived-surface mismatch not explainable by expected behavior
- Any duplicate Booking or orphaned linked path
- Any incorrect occurrence capacity value or stale recomputation
- Any incorrect eligibility result
- Any issue requiring worker replay, job inspection, or kill switch use
- Any privacy incident involving actual data exposure
- Any raw-data repair or backfill
- Any bug causing incorrect hard-block behavior
- Any issue where a fix may touch:
  - booking lifecycle logic,
  - conflict logic,
  - request-linkage,
  - occurrence materialization,
  - schedule_commitments,
  - share output generation

### 9.2 Must escalate to Product
- Requests for exceptions that violate locked product truths
- Repeated confusion indicating copy or UX failure
- Demands for unsupported sharing modes
- Pressure to let operators override hard conflicts
- Complaints that public share should reflect internal staffing rules
- One-off business asks that would alter lifecycle, staffing, or visibility policy

### 9.3 Must escalate to QA
- Any confirmed product defect before close
- Any hotfix touching truth, sharing, linkage, or capacity
- Any issue that needs repro documentation for future regression coverage
- Any incident requiring a verified post-fix checklist

## 10. Daily Operations Checklist

### 10.1 Start-of-day review
- Review all open Sev 1 and Sev 2 tickets.
- Review overnight alerts and worker failures.
- Review all tickets with Live Event flag.
- Review unresolved issues affecting today, tonight, or next 72 hours.
- Check whether any privacy-tagged tickets remain uncontained.
- Check incident queue and known-issue list.

### 10.2 Integrity and reliability checks
- Error rate and latency dashboards
- Auth failure rate
- Graphile Worker failures, retries, stuck jobs, dead-letter items
- Notification failure or burst indicators
- Integrity alerts for:
  - sent requests without linked Requested Bookings,
  - duplicate Bookings on one request path,
  - impossible occurrence counts,
  - duplicate occurrence generation,
  - schedule_commitments drift,
  - share output mismatches,
  - Manual Availability Block overlap violations,
  - hard-conflict bypass attempts

### 10.3 Queue triage cycle
- Triage all new tickets into category and severity.
- Request missing IDs before deep investigation.
- Elevate anything affecting the next 72 hours.
- Link duplicates to master issues.
- Assign owner and next action for all Sev 2+ tickets.

### 10.4 Midday operational pass
- Recheck open live-event tickets.
- Recheck any engineering escalations waiting on fix verification.
- Recheck privacy or trust-sensitive tickets for user update needs.
- Confirm no ticket is stuck without owner.

### 10.5 End-of-day handoff
- Update status on all open Sev 1 / Sev 2 / Live Event tickets.
- Hand off anything still affecting next 72 hours.
- Note pending engineering actions, workarounds, and next update times.
- Confirm incident tickets are linked and queue states are current.

## 11. Weekly Operations Review

### 11.1 Weekly meeting agenda
- Ticket volume by category
- Ticket volume by severity
- Live Event ticket count
- First-response and time-to-containment performance
- Top recurring confusion drivers
- Top recurring defect drivers
- Integrity alert trend review
- Privacy/share complaint review
- Open backlog older than target
- Hotfixes shipped and regression outcomes
- Admin action audit sample review

### 11.2 Weekly outputs
- Updated known-issues list
- Top 3 product/UX fixes for confusion reduction
- Top 3 reliability or observability improvements
- Macro/template updates
- Runbook changes
- Admin-tooling gaps to build next
- Decision on whether any issue class should change routing or severity defaults

### 11.3 Weekly audit sample
Review a small sample of:
- tickets closed as expected behavior,
- tickets involving share visibility,
- tickets involving linkage or capacity,
- support-performed admin actions.

Goal: confirm support did not silently cross mutation boundaries.

## 12. Incident Handling Playbook

### 12.1 Incident triggers
An incident is opened when:
- Sev 1 occurs
- more than one user is affected by the same Sev 2 trust/workflow problem
- a privacy issue may be systemic
- a core job or flow is degraded broadly
- a live-event risk is multiplying across accounts

### 12.2 Incident roles
- Incident Commander: Product/Ops Owner or designated Support/Ops Lead
- Technical Owner: On-call Engineer
- Communications Owner: Support/Ops Generalist unless trust-sensitive, then Product/Ops Owner approves
- Verification Owner: QA/Release Owner

### 12.3 Incident steps
1. Open one master incident ticket.
2. Set severity and initial hypothesis.
3. Contain first:
   - revoke or disable affected share links,
   - pause affected worker/job,
   - disable risky mutations,
   - stop fanout notifications if they are incorrect or storming,
   - temporarily pause template generation if duplication is suspected.
4. Gather canonical evidence:
   - source object IDs,
   - status histories,
   - audit trail,
   - worker/job traces,
   - user screenshots,
   - timezones/service day context.
5. Confirm whether the issue is:
   - display-only,
   - workflow-blocking,
   - data-corrupting,
   - privacy-impacting.
6. Publish first user update.
7. Repair or mitigate.
8. Verify with QA.
9. Remove temporary containment only after validation.
10. Publish resolution update.
11. Complete incident review.

### 12.4 Communication cadence
- Sev 1: update every 30 minutes while active
- Sev 2 incident: update on classification, containment, and resolution
- If there is no new fix, still send the promised status update

### 12.5 Incident close criteria
- Immediate risk contained
- Root cause identified or bounded
- Repair validated
- No open integrity alerts on affected records
- User communication complete
- Follow-up action items logged

### 12.6 Post-incident review
- Sev 1: within 2 business days
- Sev 2 incident: within 5 business days

Review must answer:
- What broke
- Why it was not caught
- What was contained quickly
- What took too long
- What monitoring/test/admin tool is needed now

## 13. Schedule Truth and Data Integrity Playbook

### 13.1 Non-negotiable invariants
- Booking is the only calendar-truth object.
- Manual Availability Blocks are separate schedule objects.
- Agenda displays Bookings only.
- Coverage displays Shift Occurrences only.
- Cross-midnight gigs visually belong to the starting nightlife day.
- Service day is separate from raw timestamp and defaults to 6:00 AM local venue time.
- Lifecycle state and alert state are separate.
- Hard assignment-blocking comes only from:
  - Assigned Bookings
  - Booked Bookings
  - Active Manual Availability Blocks
- Inquiry, Hold, and Requested may affect review/possible-conflict logic but do not hard-block assignment and do not appear in public shared Busy output.
- schedule_commitments is the normalized overlap surface; it is derived and must not be treated as the canonical source.

### 13.2 Common schedule-truth complaints
- My gig is on the wrong day
- My booking disappeared
- I am marked busy when I should not be
- I look free publicly but staff says I am unavailable
- Coverage is wrong
- Hard conflict should exist but does not
- Manual block will not save

### 13.3 Triage sequence
1. Capture affected Booking ID or Manual Availability Block ID.
2. Confirm whether the complaint is about Agenda, Coverage, eligibility, or public sharing.
3. Inspect service day, venue timezone, start/end timestamps, lifecycle state, and alert state.
4. Inspect overlapping Assigned/Booked Bookings and active Manual Availability Blocks.
5. Inspect derived commitments or rendered intervals.
6. Determine whether the issue is expected behavior, timezone/service-day misunderstanding, stale UI, derivation mismatch, or source-data defect.

### 13.4 Repair rules
- Do not repair the agenda render without verifying the underlying Booking.
- Do not mutate a Booking just to fix public-share output.
- Do not mutate public-share output manually; change source config or repair source derivation.
- Do not create a Manual Availability Block to mimic a missing Booking.
- If schedule_commitments drifted, engineering repairs the source or reruns safe recomputation from canonical records.

### 13.5 Expected-behavior explanations support should use
- A Requested Booking may influence review logic without appearing in public Busy output.
- A DJ may appear publicly free while remaining internally ineligible.
- A cross-midnight event is intentionally grouped under the starting nightlife day.
- A Possible Conflict alert is not the same as a hard assignment block.
- A Manual Availability Block cannot be saved over an Assigned or Booked Booking.

### 13.6 Escalation threshold
Escalate to engineering immediately if:
- hard-blocking is wrong,
- a Booking appears duplicated or missing from canonical truth,
- service-day logic is wrong on the canonical record,
- one user’s data differs across derived surfaces in a way not explainable by expected behavior,
- multiple accounts report the same schedule truth symptom.

## 14. Request-Linkage Issue Playbook

### 14.1 Non-negotiable invariants
- A Draft request may exist without a linked Booking.
- A Sent request must create or link a Requested Booking.
- Viewed, Accepted, Declined, Withdrawn, Expired, and Converted remain on the same linked request + linked-booking path.
- Accepting a request does not create a second Booking.
- Conversion/assignment updates the existing linked Booking path.

### 14.2 Common request-linkage symptoms
- Sent request shows no linked Requested Booking
- Accepted request created duplicate Requested or Assigned Booking
- Request status changed but linked Booking did not update
- Coverage slot still looks open after conversion
- User sees multiple records for one outreach path
- Declined/expired request still appears active operationally

### 14.3 Triage sequence
1. Capture request ID, linked Booking ID if present, and linked occurrence ID if relevant.
2. Confirm whether the record is Draft or Sent.
3. Inspect request status history and timestamp sequence.
4. Inspect booking linkage history and current lifecycle state.
5. Inspect notification events and worker/job traces around send/accept/convert.
6. Confirm whether the issue is UI stale state, worker delay, true linkage break, or duplicate-record creation.

### 14.4 Support handling rules
Support may:
- explain expected request/booking linkage behavior,
- collect evidence,
- retry an idempotent notification or safe refresh action if tooling supports it.

Support may not:
- relink requests and bookings manually,
- delete one duplicate Booking to clean up the UI,
- move a Booking to a new lifecycle state to patch linkage,
- mark a request converted/accepted/declined outside the product workflow.

### 14.5 Escalation thresholds
Escalate immediately if:
- any Sent request lacks a linked Requested Booking,
- any Accepted request appears to create a second Booking,
- conversion or assignment breaks the existing linked path,
- request status and Booking lifecycle diverge in a live workflow,
- multiple users report the same linkage problem.

### 14.6 Engineering repair rules
- Repair the linked path, not just the visible symptom.
- Preserve one canonical request + booking path.
- Audit every repair.
- Revalidate linked occurrence counters and notifications after repair.
- QA must validate the repaired path against send, view, accept, decline, withdraw, expire, and convert.

## 15. Occurrence Capacity / Staffing Issue Playbook

### 15.1 Non-negotiable invariants
- Shift Occurrences use the approved multi-slot model.
- One staffed DJ equals one linked Booking.
- Requests are per occurrence for one slot of capacity.
- open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)
- open_slots_count is derived and must not be hand-edited as a source of truth.
- Internal staffing eligibility uses private source-of-truth schedule logic.
- Not shared is not the same as not eligible.
- Operators cannot force-assign hard-conflicted DJs.

### 15.2 Common symptoms
- Occurrence shows too many or too few open slots
- Coverage shows filled when it should be open
- Coverage shows open when it should be filled
- Duplicate future occurrences after template resume
- DJ appears free publicly but is blocked internally
- Hard conflict prevents assignment and operator asks for override

### 15.3 Triage sequence
1. Capture occurrence ID and template ID if applicable.
2. Inspect:
   - service day,
   - timezone,
   - slots needed,
   - filled slots count,
   - active request count,
   - open slots count.
3. Inspect linked Bookings and active requests.
4. Inspect whether the occurrence was generated from a paused/resumed template.
5. Inspect eligibility and blocking sources:
   - Assigned Booking,
   - Booked Booking,
   - Active Manual Availability Block,
   - soft-state review logic.
6. Determine whether the issue is expected behavior, stale render, duplicate generation, counter drift, or eligibility bug.

### 15.4 Support handling rules
Support may:
- explain the public-share versus internal-eligibility difference,
- explain why hard-conflicted DJs cannot be force-assigned,
- ask operators to choose an alternate eligible DJ when the hard block is legitimate,
- escalate same-day staffing blockers immediately.

Support may not:
- manually change open_slots_count,
- hand-edit filled or active request counts without approved admin tooling,
- assign a DJ by bypassing conflict logic,
- close a staffing ticket as resolved until occurrence counters and booking links align.

### 15.5 Escalation thresholds
Escalate immediately if:
- counters produce impossible or contradictory values,
- duplicate occurrences appear after resume,
- coverage fill is wrong for a live event,
- eligibility logic contradicts canonical blocking records,
- hard-conflict logic appears broken.

### 15.6 Repair rules
- Fix source records first.
- Recompute derived occurrence counters second.
- Revalidate linked Bookings, requests, and notifications third.
- If the issue affects live staffing, user communication must include what the operator should do now.

## 16. Sharing / Privacy Issue Playbook

### 16.1 Non-negotiable invariants
- Public sharing modes are only:
  - Busy
  - Busy + Region
- Public share endpoints expose only approved busy or busy+region intervals.
- Soft-state Bookings do not appear in public shared Busy output.
- Internal staffing eligibility logic is private and separate from sharing.
- Support must default to least disclosure and fastest safe containment.

### 16.2 Common sharing/privacy complaints
- My link shows too much
- My link shows the wrong region
- I revoked sharing but the link still works
- Someone can see times they should not
- I look available publicly but the operator says I am not
- A request/hold should not be visible publicly

### 16.3 Immediate containment rule
If a report suggests possible overexposure, support:
1. Revokes the active share link immediately if tooling allows.
2. Opens a privacy-tagged ticket.
3. Escalates to Product/Ops Owner and On-call Engineer.
4. Avoids broad internal resharing of screenshots or URLs.

### 16.4 Triage sequence
1. Capture share link ID or URL.
2. Inspect active share mode.
3. Inspect preview output from internal admin view.
4. Compare preview against expected Busy or Busy + Region behavior.
5. Confirm whether the underlying interval comes from valid public-share rules.
6. Confirm whether the complaint is expected visibility, stale cache/view, wrong region labeling, actual overexposure, or misunderstanding about internal staffing rules.

### 16.5 Support handling rules
Support may:
- revoke or regenerate share links,
- switch users to safer share guidance,
- explain Busy versus Busy + Region,
- explain that internal assignment eligibility is not the same as public share visibility.

Support may not:
- create custom one-off visibility exceptions,
- expose internal staffing logic to explain someone else’s availability,
- tell a user nothing private was exposed before verification,
- leave a suspected privacy issue in Waiting on User without containment.

### 16.6 Severity rule
- Any confirmed overexposure is Sev 1.
- Any plausible overexposure is treated as at least Sev 2 until disproven.

## 17. User Communication Standards

### 17.1 Base communication rules
Every user update should state:
- what we know,
- what we are checking,
- whether the issue affects live scheduling or sharing,
- what the user should do now,
- when they will hear from us next.

### 17.2 Tone and wording rules
- Use plain language.
- Use product terms consistently:
  - Booking
  - Request
  - Shift Occurrence
  - Manual Availability Block
  - Busy / Busy + Region
- Separate lifecycle from alert language.
- Do not speculate.
- Do not promise a fix before classification.
- Do not overstate certainty during incidents.

### 17.3 Live-event communication rule
If the issue affects the next 72 hours, support must:
- acknowledge urgency explicitly,
- confirm the ticket is being prioritized,
- give immediate safe guidance where possible,
- keep updates active even if engineering is still investigating.

### 17.4 Privacy communication rule
For privacy/share issues:
- acknowledge seriousness immediately,
- state containment action if taken,
- avoid describing unverified scope,
- provide next-update timing.

### 17.5 Closure communication rule
A closure message should include:
- whether the issue was expected behavior or a defect,
- what changed,
- whether any user action is needed,
- whether the same share link / record / draft should be reused or recreated,
- whether the issue will be monitored.

### 17.6 Prohibited statements
Support should not say:
- We fixed it if only the symptom disappeared
- This will not happen again without a verified systemic fix
- That other DJ is blocked because...
- Just ignore the conflict
- We manually forced it through
- Your public share should match staffing eligibility

## 18. Internal Tools / Views / Dashboards Needed

### 18.1 Must-have internal tools for launch operations

A. Support ticket console
Must show:
- severity,
- category,
- Live Event flag,
- affected object IDs,
- linked incident,
- owner,
- next action,
- audit-log references.

B. Account and role viewer
Must show:
- user ID,
- role,
- auth status,
- region,
- timezone,
- active share mode,
- active share links,
- recent support tickets.

C. Booking inspector
Must show:
- booking ID,
- lifecycle state,
- alert state,
- service day,
- venue timezone,
- local start/end,
- linked request ID if any,
- linked occurrence ID if any,
- source flow,
- recent mutation history,
- related schedule_commitments.

D. Manual Availability Block viewer
Must show:
- block ID,
- active status,
- service day,
- local start/end,
- overlap analysis against Assigned/Booked Bookings.

E. Request-linkage inspector
Must show:
- request ID,
- draft/sent state,
- request status timeline,
- linked Booking ID,
- linked occurrence ID,
- notification events,
- worker/job history.

F. Shift occurrence / template inspector
Must show:
- occurrence ID,
- template ID,
- service day,
- timezone,
- slots needed,
- filled slots count,
- active request count,
- open slots count,
- linked Bookings,
- linked requests,
- template status,
- generation history.

G. Eligibility and conflict viewer
Must show:
- hard blockers,
- possible-conflict signals,
- blocking source type,
- why an operator cannot assign,
- side-by-side comparison with public-share preview.

H. Sharing preview and control tool
Must support:
- preview of Busy or Busy + Region output,
- active-link revoke,
- link regeneration,
- audit note entry.

I. Draft extraction/job console
Must show:
- draft ID,
- extraction status,
- structured output preview,
- error traces,
- retry/cancel controls for safe draft-stage failures.

J. Worker and job dashboard
Must show:
- Graphile Worker queue health,
- retries,
- stuck jobs,
- dead-letter events,
- job type by failure count.

K. Audit log viewer
Must show:
- actor,
- action,
- object type,
- object ID,
- before/after summary,
- ticket ID,
- timestamp.

### 18.2 Must-have dashboards
- Error rate / latency dashboard
- Auth failure dashboard
- Notification delivery dashboard
- Integrity alert dashboard
- Incident dashboard
- Live Event ticket dashboard
- Privacy/share complaint dashboard

### 18.3 Recommended near-term additions
- One-click safe recompute for derived counters and commitments, limited to engineering-approved use
- Known-issue banner controls
- Release-impact view showing tickets opened within 24 hours of deployment
- Admin action approval step for higher-risk mutations

## 19. Suggested Macros / Response Templates

### 19.1 Initial acknowledgment
Thanks for reporting this. I have opened a support ticket and I am reviewing the affected record(s) now. If this impacts anything in the next 72 hours, we are treating it as a live-priority issue.

### 19.2 Need identifiers
To verify exactly what happened, I need the affected record details: the date/service day, the booking/request/occurrence involved, and a screenshot if available. Once I have that, I can confirm whether this is a display issue, a workflow issue, or a data issue.

### 19.3 Schedule truth under review
I am reviewing the source schedule record now. AmIFree separates booking truth, availability blocks, and coverage records, so I want to confirm which record is driving what you are seeing before I tell you the cause.

### 19.4 Request-linkage under review
I am checking the request path and its linked booking path together. Those should remain tied to the same record flow after send, accept, decline, withdraw, expire, and convert, so I am verifying that relationship before we make any change.

### 19.5 Live-event escalation
I have marked this as a live-priority issue because it affects a near-term booking/coverage workflow. It is now escalated for immediate review. I will update you again as soon as I have either confirmation of expected behavior or a concrete repair path.

### 19.6 Sharing/privacy containment
Thanks for flagging this. I am treating it as a privacy-sensitive issue. I have taken or initiated containment steps on the affected share link while we verify exactly what was visible. I will follow up with the next confirmed update.

### 19.7 Expected behavior explanation
I reviewed the record and this appears to match current product behavior. In AmIFree, [brief product rule]. I know that can be confusing in practice, so here is the safest next step for your workflow: [next step].

### 19.8 Resolved defect
We found and corrected the issue affecting [record/workflow]. The current record state has been rechecked, and the affected path now behaves as expected. No further action is needed from you unless you still see the same behavior.

### 19.9 Waiting on user
I am ready to continue, but I need one missing detail to confirm the affected record: [missing detail]. I will keep the ticket open and continue as soon as you send it.

## 20. Metrics for Support and Operations

### 20.1 Support performance metrics
- First response time by severity
- Time to triage
- Time to severity classification
- Time to escalation
- Time to containment for Sev 1 / Sev 2
- Time to resolution
- Reopen rate
- Ticket aging by category

### 20.2 Live-operations metrics
- Tickets affecting next 72 hours
- Same-day booking/coverage issue count
- Percentage of live-event tickets resolved before event start
- Number of open live-event tickets at end of day

### 20.3 Integrity metrics
- Sent requests without linked Requested Booking
- Duplicate linked-path incidents
- Occurrence count mismatch incidents
- Duplicate occurrence generation incidents
- schedule_commitments drift alerts
- Hard-conflict bypass attempts
- Manual Availability Block overlap violations

### 20.4 Reliability metrics
- Auth failure rate
- Worker failure rate by job type
- Stuck-job count
- Notification failure rate
- Latency on critical views

### 20.5 Trust and privacy metrics
- Share/privacy complaint count
- Confirmed exposure incidents
- Time to containment for privacy issues
- Share-link revoke response time

### 20.6 Product learning metrics
- Top expected-behavior but confusing ticket drivers
- Tickets caused by unclear copy or workflow design
- Post-release ticket spikes by surface area

## 21. Playbook Risks and Guardrails

### Risk 1: Support becomes a shadow data-repair team
Guardrail: frontline support may only use approved audited admin actions; all truth-object repairs escalate.

### Risk 2: Derived data gets hand-fixed while source truth stays wrong
Guardrail: repair source records first; only then recompute derived surfaces.

### Risk 3: Privacy issues are under-classified as just a share bug
Guardrail: every possible overexposure gets immediate containment and trust-sensitive routing.

### Risk 4: Operators pressure support to bypass hard conflicts
Guardrail: no force-assignments; no policy exception without product approval; no admin override that violates locked rules.

### Risk 5: Public share is treated as a staffing system
Guardrail: support must explicitly separate public Busy output from private staffing eligibility in both tooling and user language.

### Risk 6: Live-event tickets get buried in ordinary backlog
Guardrail: Live Event flag and 72-hour priority rule.

### Risk 7: Thursday/Friday risky releases destabilize weekend operations
Guardrail: changes touching booking truth, request-linkage, occurrence generation, share output, conflict logic, or schedule_commitments should ship early in the week during staffed hours; late-week changes should be hotfix-only unless explicitly approved.

### Risk 8: Incident comms become vague or overconfident
Guardrail: every update must separate confirmed facts, current investigation, current containment, and next timing.

### Risk 9: Audit trail is incomplete
Guardrail: no admin action without automatic logging tied to ticket ID.

### Risk 10: QA is skipped on urgent fixes
Guardrail: no defect ticket closes as fixed until QA or designated release verification is complete.

## 22. Final Support & Operations Playbook

### 22.1 Adopted operating model
AmIFree should run a single-queue, small-team, truth-first support model with the following default rules:
- One shared queue for all production support
- One triage owner each business day
- One rotating engineer on-call for Sev 1 / Sev 2 and data integrity issues
- One weekly operations review
- One incident workflow for major issues
- One audit standard for every admin mutation

### 22.2 Non-negotiables
- Booking remains the only calendar-truth object.
- Support never collapses Requests, Occurrences, Manual Availability Blocks, and Bookings into one mental model.
- Support never bypasses hard-conflict rules.
- Support never uses public sharing as proof of internal eligibility.
- Support never hand-edits derived counters as the source of truth.
- Support never performs silent repairs.
- Support never closes a trust-sensitive ticket without explicit verification.

### 22.3 Minimum staffing model
- Support/Ops Generalist: owns queue, user communication, safe admin actions
- Product/Ops Owner: owns policy, incident messaging approval, backlog learning
- On-call Engineer: owns repair, containment, instrumentation, hotfixes
- QA/Release Owner: owns repro, regression, and closure validation

### 22.4 Daily operating rhythm
1. Morning: queue triage, incident review, integrity dashboard review
2. Midday: live-event follow-up, engineering escalation follow-up, ticket aging check
3. End of day: unresolved live-event handoff, status updates, audit completeness check

### 22.5 Safe action boundaries
Support may:
- inspect,
- explain,
- tag,
- route,
- revoke share links,
- recover auth,
- retry safe idempotent draft/notification jobs.

Support may not:
- relink request paths,
- rewrite booking truth,
- override staffing hard blocks,
- edit occurrence math directly,
- repair data through raw database access.

### 22.6 Incident rule
When trust, privacy, linkage, or live schedule truth is at risk:
- contain first,
- communicate clearly,
- repair canonical truth,
- verify with QA,
- close only after audit and validation.

### 22.7 Release-stability rule
Any release touching:
- booking lifecycle,
- request-linkage,
- shift occurrence generation,
- capacity logic,
- conflict logic,
- share output,
- schedule_commitments

must have:
- explicit QA coverage,
- support awareness,
- rollback path,
- weekday staffed release timing unless it is an urgent hotfix.

### 22.8 Ticket close criteria
A ticket is only closed when:
- issue classification is documented,
- affected object IDs are attached,
- user communication is complete,
- any admin action is audited,
- any engineering fix is verified,
- no open integrity alert remains on the affected path.

### 22.9 Success definition
This playbook is successful if:
- users can trust that what they see reflects the correct source logic,
- operators can trust that staffing decisions are protected by correct hard-block and eligibility rules,
- request-linkage stays intact,
- public sharing stays privacy-safe,
- support remains fast without becoming a source of truth drift,
- the small team can operate the product reliably without weakening the product’s locked rules.
