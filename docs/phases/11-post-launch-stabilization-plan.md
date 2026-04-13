# [11] Phase — Post-Launch Stabilization Plan

## 1. Post-Launch Stabilization Summary

The post-launch stabilization period for AmIFree Scheduler is a controlled 30-day operating window focused on proving that the live MVP is safe, correct, observable, and supportable before any meaningful expansion of scope, audience, or product surface area.

This period is not for broad feature delivery. It exists to confirm that the live system preserves the approved schedule truth model, privacy boundaries, request-linkage integrity, occurrence-capacity integrity, permission safety, and mobile-first usability under real usage.

The stabilization operating posture is:

- correctness over speed
- privacy over convenience
- reversible change over aggressive optimization
- defect removal over feature expansion
- narrow release control over continuous experimentation

At the end of stabilization, the team should be able to say, with evidence, that:

- Booking remains the only calendar-truth object
- Manual Availability Blocks behave as explicit separate schedule objects
- Booking Request, Shift Occurrence, and Booking remain distinct and linked correctly
- public share output exposes only approved busy or busy+region intervals
- internal staffing eligibility remains independent from external sharing visibility
- hard-conflict protection works reliably
- request acceptance/conversion never creates duplicate booking truth
- occurrence capacity math remains correct
- the live app is operable by a small team without unsafe manual workarounds

---

## 2. Stabilization Objectives

### Primary Objectives

1. **Protect schedule truth**
   - Ensure Bookings remain the only calendar-truth object.
   - Ensure schedule_commitments remain the normalized overlap surface used consistently in conflict logic.
   - Confirm Assigned and Booked bookings and active Manual Availability Blocks hard-block assignment as approved.

2. **Protect privacy and sharing boundaries**
   - Confirm public share endpoints expose only Busy or Busy + Region intervals.
   - Confirm no internal states, alert states, booking details, request states, notes, or staffing logic leak into public sharing.

3. **Protect request-linkage integrity**
   - Ensure Sent request creates or links exactly one Requested Booking.
   - Ensure Viewed / Accepted / Declined / Withdrawn / Expired / Converted preserve a single linked request + linked-booking path.
   - Ensure acceptance and later conversion update the existing linked Booking rather than creating a second Booking.

4. **Protect occurrence capacity integrity**
   - Ensure slots_needed, filled_slots_count, active_request_count, and open_slots_count remain correct.
   - Ensure one staffed DJ equals one linked Booking.
   - Ensure approved formula remains true in production:
     - `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`

5. **Protect role and permission safety**
   - Ensure DJs, Manager Lite users, operators, and shared viewers only see and do what the MVP allows.
   - Ensure operators cannot force-assign hard-conflicted DJs.
   - Ensure limited hard-conflict save is available only where approved and always requires reason, confirmation, and audit note.

6. **Prove operational readiness**
   - Ensure incidents can be detected quickly, triaged consistently, fixed safely, and verified after release.
   - Ensure a small team can operate the product daily without fragile heroics.

### Secondary Objectives

- validate that the mobile-first web app / PWA experience is usable in live conditions
- reduce defect backlog to a controlled, well-prioritized set
- confirm analytics and operational metrics are trustworthy enough to guide next-phase decisions
- establish evidence-based gates for cohort expansion or broader launch

---

## 3. Stabilization Assumptions

### Product and launch assumptions

- MVP launches as a **mobile-first web app / PWA**.
- Initial launch may use a **controlled cohort** rather than fully open distribution.
- MVP users are primarily **DJ-first**, with Manager Lite and operator workflows used in limited real-world operations.
- Notifications are **in-app first**; workflow email delivery is not a launch dependency.
- Intake remains **DJ / Manager Lite only** and stages Booking creation through Intake Drafts with review-before-save AI extraction.

### Team assumptions

- Small operating team with shared responsibility across product, engineering, QA, and operations.
- One engineer is designated **stabilization technical owner** each day.
- One person owns **daily operational review** and **incident coordination** each day.
- Team can ship targeted hotfixes during stabilization, but should minimize unrelated deploys.

### Technical assumptions

- Production stack follows approved architecture:
  - TypeScript modular monolith
  - Next.js App Router PWA
  - Supabase Postgres/Auth/Storage
  - Graphile Worker for async jobs
  - OpenAI Responses API for structured extraction
- Launch observability is already in place from prior phases for:
  - client errors
  - API/server failures
  - job failures
  - schedule correctness and privacy-adjacent operational metrics
- Rollback or feature-flag-style disablement exists for high-risk release paths, even if coarse-grained.

### Data assumptions

- Production database allows read-safe integrity queries and dashboards.
- Auditability exists for critical state transitions, especially around:
  - booking lifecycle transitions
  - request lifecycle transitions
  - assignment attempts
  - hard-conflict override saves
  - sharing visibility changes
  - shift template pause/resume effects

---

## 4. Allowed vs Frozen Changes During Stabilization

### Allowed Changes

These changes are allowed during stabilization if they are scoped, tested, and reversible:

1. **P0/P1 bug fixes**
   - schedule truth defects
   - privacy defects
   - permission defects
   - request-linkage defects
   - occurrence-capacity defects
   - blocking mobile usability defects
   - job-processing failures affecting core workflow

2. **Targeted UX fixes**
   - copy clarification that prevents user error
   - button-state fixes
   - form validation corrections
   - visibility/state indicator fixes
   - mobile layout fixes for critical tasks

3. **Operational controls**
   - tighter logging
   - additional monitors and alerts
   - safer rate limits
   - safer retry or dead-letter handling
   - temporary manual review gates for risky automations

4. **Analytics corrections**
   - fixing incorrect event firing
   - correcting dashboard logic
   - adding missing internal operational instrumentation tied to stability

5. **Security/privacy hardening**
   - permission check corrections
   - endpoint response narrowing
   - token/session safety fixes
   - storage or access-rule tightening

### Frozen Changes

These changes are frozen during stabilization unless a change is required to resolve a P0/P1 issue:

1. **No new major product capabilities**
   - no new booking states
   - no new alert states
   - no new sharing modes
   - no new staffing models
   - no new calendar-truth objects
   - no workflow email expansion as a launch initiative

2. **No changes to core approved truth models**
   - Booking remains the only calendar-truth object
   - Agenda remains Bookings only
   - Coverage remains Shift Occurrences only
   - request-linkage behavior remains exact
   - occurrence capacity math remains exact
   - staffing eligibility remains separate from external sharing visibility

3. **No schema or contract churn without incident justification**
   - no broad DB refactors
   - no nonessential API shape changes
   - no mass renaming of key fields or states
   - no new public endpoints unless required for safety

4. **No risky optimization-only releases**
   - no large caching rewrites
   - no broad query-performance rewrites unless they fix production pain
   - no wide UI redesign passes
   - no dependency churn without clear need

5. **No cohort expansion by instinct**
   - rollout only expands when explicit gates are met

### Change Control Rule

During stabilization, every production change must be labeled as one of:

- incident hotfix
- high-priority bug fix
- instrumentation/monitoring improvement
- operational safety improvement
- approved stabilization usability fix

If a proposed change does not fit one of those categories, it waits until post-stabilization prioritization.

---

## 5. Team Roles and Ownership During Stabilization

### Product Owner

Owns:

- stabilization priorities
- severity confirmation for ambiguous user-facing issues
- allowed-vs-frozen change decisions
- rollout expansion approval with evidence
- weekly stabilization review
- stabilization exit recommendation

Responsibilities:

- maintain single prioritized stabilization backlog
- ensure no feature creep enters hotfix releases
- review top user feedback clusters daily
- confirm whether a defect changes behavior or only messaging

### Technical Stabilization Lead

Owns:

- production issue diagnosis
- hotfix solution choice
- deploy safety and rollback readiness
- integrity-query review with operations/QA
- engineering coordination across API, job, and frontend surfaces

Responsibilities:

- act as final engineering approver for stabilization releases
- ensure root-cause notes exist for all P0/P1 incidents
- verify fixes preserve approved truths
- stop unsafe deploys

### QA Lead

Owns:

- production validation checklist execution
- reproduction quality
- regression validation for hotfixes
- daily smoke pass on critical user journeys
- defect severity and reproducibility confidence notes

Responsibilities:

- verify fixes in staging and production-safe paths where applicable
- maintain stabilization test matrix for critical flows
- track reopened issues separately from new issues
- confirm whether defects are isolated or systemic

### Operations / Support Owner

Owns:

- first-line incident intake
- user-reported issue capture quality
- daily metrics and support-pattern review
- controlled cohort communication when needed
- escalation routing

Responsibilities:

- collect exact reproduction details
- flag privacy or trust-risk issues immediately
- maintain incident timeline notes
- identify user confusion vs system defect vs training gap

### Analytics / Data Owner
For a small team, this can be shared by product or engineering.

Owns:

- dashboard correctness
- daily operating metric review preparation
- integrity query maintenance
- weekly trend summaries
- cohort-expansion evidence packets

### Release Approver

For a small team, this can be Product + Technical Lead jointly.

Owns:

- go/no-go decision on hotfix deploys
- release note discipline
- rollback threshold enforcement

### RACI-style Practical Rule

For each stabilization issue, explicitly assign:

- **DRI**: one person responsible for closure
- **Verifier**: one person responsible for acceptance evidence
- **Decision owner**: one person responsible for severity or release choice

No issue should enter active work without all three roles assigned.

---

## 6. First 24 Hours Plan

### Operating Goal

Confirm the live launch is fundamentally safe and that the most critical schedule, privacy, and permissions behaviors are working with real traffic.

### 0–2 Hours After Launch

1. **War-room operating posture**
   - Product, Technical Lead, QA, and Operations stay actively available.
   - Freeze all nonessential deploys.
   - Route all support and internal bug findings into one visible stabilization queue.

2. **Launch smoke verification in production**
   Validate live production on real accounts and sanitized test accounts for:
   - authentication and session continuity
   - DJ dashboard load
   - Manager Lite access paths
   - operator schedule load
   - agenda showing Bookings only
   - coverage showing Shift Occurrences only
   - booking create/edit/load
   - manual availability block create/edit/load
   - request send flow
   - request accept/decline flow
   - shift occurrence capacity update behavior
   - public busy share page
   - public busy + region share page
   - mobile-first critical screens
   - in-app notifications arrival for core actions

3. **Production integrity spot checks**
   Run first-day queries/checks for:
   - duplicate linked bookings from request flow
   - bookings missing required linked request where expected
   - occurrences with negative or impossible open_slots_count
   - manual blocks overlapping Assigned/Booked bookings
   - public share payload fields outside approved contract
   - hard-conflict assignments that somehow succeeded

4. **Monitoring confirmation**
   Confirm dashboards and alerts are live for:
   - 5xx/API failure rate
   - job failure rate
   - request send/create failures
   - booking save failures
   - share endpoint errors
   - client-side crash/error spikes
   - auth failures
   - unusual latency in critical flows

### 2–8 Hours After Launch

1. **Review first real user interactions**
   - inspect first successful bookings
   - inspect first sent requests
   - inspect first accepted/declined requests
   - inspect first shared-link views
   - inspect first shift occurrence fills

2. **Classify early issues immediately**
   Sort all findings into:
   - safety/privacy
   - schedule correctness
   - workflow breakage
   - data inconsistency
   - UX confusion
   - low-priority polish

3. **Deploy only if needed**
   - ship only P0/P1 hotfixes
   - batch lower-severity issues for later review

### End-of-Day 1 Review

Hold a same-day review covering:

- incident list
- unresolved high-severity issues
- integrity check results
- top user feedback themes
- whether controlled cohort expansion remains paused or allowed
- whether launch status remains normal, constrained, or partially rolled back

Output of this review:

- updated severity-ranked stabilization backlog
- next-day watchlist
- explicit go/no-go on wider cohort access

---

## 7. First 7 Days Plan

### Operating Goal

Reduce immediate production risk, validate core workflow correctness over repeated use, and separate true product defects from onboarding confusion.

### Daily Execution for Days 2–7

1. **Daily production smoke pass**
   Execute critical-path checks at least once per day:
   - create and edit Booking
   - create and edit Manual Availability Block
   - send Booking Request
   - accept/decline Booking Request
   - convert/assign existing linked request path
   - verify no duplicate Booking creation
   - create/use Shift Template
   - verify generated Shift Occurrences
   - verify occurrence capacity updates after request and staffing changes
   - view Agenda and Coverage separately
   - view Busy and Busy + Region public share output
   - verify hard-conflict prevention on operator assignment
   - verify limited hard-conflict save path is only available in approved states and requires audit inputs

2. **Daily integrity review**
   Run checklist in Section 11 and log pass/fail findings.

3. **Defect burn-down with release discipline**
   - close P0 immediately
   - close P1 within stabilization-fast cadence
   - batch P2 fixes into controlled releases
   - leave P3/P4 for post-stabilization unless they materially affect adoption or trust

4. **Support and user feedback review**
   - review all incoming user reports daily
   - tag each report as defect, confusion, missing capability, training issue, or edge case
   - identify repeated friction in core flows

5. **Cohort health review**
   If launch is controlled:
   - review account activation rate
   - review first successful workflow completion rate
   - review support load per active user
   - review severity of issues observed in cohort

6. **Job and background workflow review**
   Review Graphile Worker behavior daily for:
   - stuck jobs
   - retry storms
   - dead-letter/failure accumulation
   - duplicate job side effects
   - extraction pipeline failures or review bottlenecks

### Day 3–4 Focus

- validate multi-day request-linkage behavior after edits and state changes
- validate service day and cross-midnight display correctness with live event data
- validate paused/resumed shift template generation behavior without duplication
- validate role-boundary correctness after real account usage patterns emerge

### Day 5–7 Focus

- review all P1 and repeated P2 issues for systemic themes
- identify top 3 operator inefficiencies that are safe to fix during stabilization
- confirm whether analytics metrics align with observed reality
- decide whether to expand cohort, hold steady, or narrow access

### End-of-Week 1 Decision

At the end of Day 7, formally decide one of:

- **Expand cohort**
- **Hold cohort size steady**
- **Constrain or partially roll back launch exposure**

Decision must be based on rollout gates in Section 16, not intuition.

---

## 8. Days 8–30 Plan

### Operating Goal

Move from emergency launch posture to controlled steady-state stabilization while continuing to prove correctness, reduce recurring defects, and prepare for post-MVP expansion decisions.

### Week 2 Priorities

1. **Finish high-severity defect cleanup**
   - all open P0 should be resolved
   - P1 backlog should be near zero
   - repeated P2s affecting core workflows should be addressed

2. **Reduce operational fragility**
   - tighten monitors where blind spots appeared
   - add admin-safe diagnostic tooling if needed
   - document recurring support resolutions
   - reduce manual cleanup steps required after failures

3. **Validate data durability**
   - re-run all integrity queries with trend tracking
   - compare week-over-week defect creation vs closure
   - confirm no hidden drift in booking/request/occurrence records

4. **Review user confusion systematically**
   - identify top confusing terms, statuses, and transitions
   - distinguish copy/UX problems from true feature gaps
   - ship only safe clarifications that reduce errors

### Week 3 Priorities

1. **Controlled scaling check**
   - increase active accounts only if rollout gates remain green
   - monitor whether support burden scales linearly or worse
   - watch for performance and concurrency issues not seen in small cohort

2. **Operational consistency**
   - ensure daily reviews are no longer discovering unknown categories of failure
   - ensure incident handling becomes predictable and documented
   - ensure hotfixes are becoming smaller and less frequent

3. **Analytics confidence review**
   - validate that operational metrics accurately reflect real usage
   - confirm funnel and health metrics are stable enough for post-MVP planning

### Week 4 Priorities

1. **Prepare stabilization exit assessment**
   - summarize incident history
   - summarize defect trends
   - summarize unresolved risk areas
   - summarize user feedback themes
   - summarize data-integrity results across the month

2. **Separate remaining issues into buckets**
   - must-fix before stabilization exit
   - acceptable known limitations for MVP
   - post-MVP capability requests
   - operational/documentation improvements

3. **Decide next operating mode**
   - continue stabilization
   - exit stabilization and move to controlled post-MVP expansion
   - pause expansion and run targeted correction sprint

---

## 9. Incident Severity Model

### P0 — Critical / Launch-Threatening

Any issue that creates immediate trust, safety, privacy, or core data integrity risk.

Examples:

- public share endpoint leaks anything beyond approved busy or busy+region output
- operator or user can bypass hard-conflict safety in disallowed ways
- request acceptance/conversion creates duplicate Booking truth
- occurrence capacity becomes materially wrong in a way that affects staffing decisions
- permissions expose private booking details to wrong roles
- production outage blocks core workflows for most users
- destructive data corruption affecting bookings, requests, occurrences, or availability blocks

Response rule:

- immediate escalation
- stop related rollout expansion
- hotfix or rollback same day
- no unrelated deploys until contained
- root-cause note required

### P1 — High / Core Workflow Damaged

Issue materially harms completion of core workflows but does not clearly produce catastrophic privacy or data-integrity failure.

Examples:

- users cannot reliably create or update bookings
- requests fail to send or transition correctly in a common path
- Agenda/Coverage separation renders incorrectly for meaningful user segments
- public share pages fail or show obviously wrong intervals
- mobile UX blocks completion of critical flow for many users
- Graphile Worker failures prevent important state transitions

Response rule:

- same-day or next-available hotfix path
- explicit DRI and verifier assigned immediately
- workaround documented if hotfix is not immediate

### P2 — Medium / Important but Contained

Issue is real and impactful but has a contained scope, a manual workaround, or limited blast radius.

Examples:

- edge-case state badge mismatch
- noncritical in-app notification timing defect
- operator confusion due to label/copy issue
- occasional extraction-review friction that does not corrupt truth
- isolated template pause/resume edge case with contained workaround

Response rule:

- prioritize in stabilization if repeated, confusing, or adjacent to trust
- otherwise batch into controlled release

### P3 — Low / Minor

Issue causes inconvenience or visible roughness but does not threaten trust or core workflow completion.

Examples:

- minor layout bug
- noncritical copy inconsistency
- low-visibility analytics event mismatch
- small visual rendering issue

Response rule:

- log and defer unless trivially fixable within safe release

### P4 — Enhancement / Non-bug

- request for a new capability
- workflow preference
- optimization suggestion
- reporting wish list

Response rule:

- do not treat as stabilization bug
- route to post-MVP prioritization

---

## 10. Hotfix Decision Framework

A hotfix is justified during stabilization only when at least one of the following is true:

1. it fixes P0 or P1 behavior
2. it prevents likely escalation into P0/P1
3. it removes a repeated P2 causing measurable workflow failure or support burden
4. it improves observability required to manage a live risk area
5. it corrects a trust-damaging UX issue in a core flow without changing approved product behavior

### Hotfix Decision Questions

Before approving a hotfix, answer:

1. Does the fix preserve all locked truths?
2. Is the blast radius understood?
3. Is there a safer config/flag/workaround alternative?
4. Can it be validated with a focused regression pass?
5. Can it be rolled back quickly?
6. Does it introduce schema or contract risk?
7. Does it bundle unrelated cleanup? If yes, split it.

### Hotfix Packaging Rules

- one issue family per hotfix when possible
- no opportunistic refactors
- no “while we’re here” changes
- add monitoring for the failure mode if missing
- include before/after validation notes
- include explicit rollback condition

### Rollback Rule

Rollback is preferred over patch-forward when:

- privacy exposure is possible
- duplicate booking truth risk is not fully understood
- hard-conflict safety is compromised
- public sharing output cannot be trusted
- hotfix confidence is low and blast radius is high

---

## 11. Daily Integrity Review Checklist

Run this once daily during Days 1–14, then at least three times per week through Day 30. Any failure is logged and triaged immediately.

### Booking / Request Integrity

- no duplicate Booking records created from a single request path
- every Sent request has exactly one linked Requested Booking
- Viewed / Accepted / Declined / Withdrawn / Expired / Converted retain same linked path
- acceptance does not create a second Booking
- assignment/conversion updates existing linked Booking path correctly
- booking lifecycle transitions remain within approved states only

### Conflict / Commitment Integrity

- Assigned and Booked bookings produce expected hard-blocking commitments
- active Manual Availability Blocks produce expected hard-blocking commitments
- Inquiry / Hold / Requested appear only in possible-conflict/review logic and not in public busy output
- no successful operator force-assignment of hard-conflicted DJs
- limited hard-conflict save occurs only for Inquiry, Hold, or Requested and includes reason, confirmation, and audit note

### Occurrence Capacity Integrity

- `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)` holds for all active occurrences
- no negative open_slots_count
- no filled_slots_count above slots_needed without explicit approved model reason
- one staffed DJ corresponds to one linked Booking
- active_request_count aligns with active request records
- partial-fill behavior reflects actual staffing status

### Shift Template / Occurrence Integrity

- paused templates generate no future occurrences while paused
- already materialized occurrences remain unchanged after pause
- resumed templates generate missing future occurrences inside remaining active date range without duplication
- service_day_weekday and local start/end times remain correct on generated occurrences

### Sharing / Privacy Integrity

- public share endpoints expose only Busy or Busy + Region intervals
- Busy mode shows no location/region detail
- Busy + Region mode shows only approved region/city-state abstraction
- no notes, booking states, alerts, venue names, client names, request status, or internal staffing logic appear in shared output
- “not shared” remains distinct from “not eligible” in internal logic

### UI / Presentation Integrity

- Agenda shows Bookings only
- Coverage shows Shift Occurrences only
- cross-midnight gigs visually belong to starting nightlife day
- service day defaults to 6:00 AM local venue time
- default visible time window remains approximately 12:00 PM through 6:00 AM next day

### Async / Job Integrity

- no abnormal Graphile Worker failure spikes
- retries are not duplicating side effects
- dead-letter or permanently failed jobs are reviewed
- extraction jobs respect review-before-save requirement

---

## 12. Daily Operating Metrics to Review

Review these daily during stabilization. Thresholds should be set relative to launch baseline and tightened after Week 1.

### Reliability Metrics

- API error rate on core endpoints
- client crash/error rate
- auth/session failure rate
- share endpoint failure rate
- job failure/retry rate
- p95 latency for:
  - booking load/save
  - request send/respond
  - operator schedule load
  - public share page load

### Workflow Success Metrics

- booking create success rate
- booking edit success rate
- manual availability block create success rate
- request send success rate
- request response success rate
- shift template save success rate
- occurrence generation completion rate
- public share page successful render rate

### Integrity Metrics

- count of duplicate booking-link anomalies
- count of invalid request-linkage anomalies
- count of occurrence capacity mismatches
- count of invalid conflict-save attempts
- count of manual blocks overlapping Assigned/Booked bookings
- count of permission-denied events in protected endpoints
- count of public-share payload validation failures

### User Experience Metrics

- active users by role
- first core action completion after first login
- median time to complete first booking flow
- support tickets/issues per active user
- repeated error rate per user/session
- mobile viewport error concentration

### Operational Load Metrics

- open bug count by severity
- reopened bug count
- incident count by severity
- mean time to acknowledge
- mean time to mitigate
- mean time to resolve
- number of manual interventions required

### Quality Signal Metrics

- number of issues found by users vs by internal reviews
- number of failed daily integrity checks
- number of releases/hotfixes this week
- regression count after hotfixes

---

## 13. Weekly Review Cadence

Hold a formal weekly stabilization review at the end of each week.

### Weekly Review Agenda

1. **Incident review**
   - what happened
   - severity
   - time to detect
   - time to mitigate
   - time to resolve
   - root-cause status
   - prevention action

2. **Defect review**
   - opened vs closed
   - severity mix
   - repeats/reopens
   - top unresolved P1/P2 issues
   - regressions introduced by fixes

3. **Integrity review**
   - trends from daily checks
   - any recurring anomalies
   - whether anomalies are shrinking, stable, or growing

4. **User feedback review**
   - top complaint clusters
   - top confusion clusters
   - top requested capabilities
   - defects disguised as “feature requests”

5. **Rollout review**
   - cohort size
   - activation and retention signals
   - support burden
   - decision: expand / hold / narrow

6. **Change control review**
   - releases shipped
   - risky changes avoided
   - frozen items held back
   - whether stabilization scope remained disciplined

### Weekly Outputs Required

- updated stabilization scorecard
- updated ranked defect list
- updated rollout decision
- updated risk register
- explicit next-week operating priorities

---

## 14. User Feedback Intake and Classification

User feedback during stabilization must be captured in a structured way so the team does not overreact to anecdotes or misclassify defects as roadmap requests.

### Required Fields for Each Feedback Item

- reporter
- user role
- account/cohort
- timestamp
- surface/page
- action attempted
- expected result
- actual result
- screenshot or recording if available
- severity guess
- reproducibility guess
- whether trust/privacy was affected
- whether workaround exists

### Feedback Classification Types

1. **Defect**
   - system behavior violates approved or expected behavior

2. **Confusion / UX ambiguity**
   - product likely works as designed, but the wording, states, or layout caused misuse

3. **Missing capability**
   - user expectation exceeds current MVP scope

4. **Training / onboarding gap**
   - issue is primarily educational or setup-related

5. **Edge-case workflow**
   - legitimate unusual workflow not yet handled well

### Interpretation Rules

- repeated confusion in a core flow is a stabilization issue, even if not a “bug”
- a user asking for a workaround to avoid intended safety logic is not evidence the safety logic should be removed
- requests that would violate locked truths are logged but not actioned during stabilization
- one severe trust complaint carries more weight than several cosmetic complaints
- feedback from controlled cohort power users is valuable, but does not automatically justify scope expansion

### Daily Feedback Output

Each day, summarize feedback into:

- top 3 defects
- top 3 confusion points
- top 3 feature requests
- top trust/privacy concerns
- recommendation: fix / clarify / defer

---

## 15. Bug Triage and Prioritization Rules

### Triage Rules

Every new issue must be assigned:

- severity: P0–P4
- category
- impacted workflow
- impacted role(s)
- DRI
- verifier
- release target
- workaround status
- linked evidence

### Priority Order

During stabilization, prioritize in this order:

1. privacy and permission safety
2. schedule truth and hard-conflict protection
3. request-linkage integrity
4. occurrence-capacity integrity
5. booking/manual-block create-edit correctness
6. operator scheduling usability for core staffing actions
7. public sharing correctness
8. mobile critical-path usability
9. async job reliability
10. noncritical polish

### Bug Ownership Rules

- frontend-visible issue with backend truth risk: backend owner leads, frontend supports
- pure UI state issue with no truth risk: frontend owner leads
- linkage/integrity issue: backend owner leads, QA verifier required
- permission/privacy issue: technical lead oversight mandatory
- metrics-only issue: analytics/data owner leads unless it obscures real risk

### Reopen Rule

A reopened bug is automatically escalated one attention level above its previous planning priority because it signals incomplete diagnosis, weak verification, or regression risk.

### “Not a Bug” Discipline

Do not mark something “not a bug” unless one of the following is documented:

- expected behavior tied to locked truth
- confirmed user error with clear evidence
- duplicate of existing tracked issue
- out-of-scope feature request

---

## 16. Rollout Expansion Gates

If launch begins with a controlled cohort, expansion is allowed only when all gate categories are green for a sustained review period.

### Gate Category A — Safety and Privacy

Must be true:

- no open P0 issues
- no unresolved privacy leakage risk
- no unresolved role/permission exposure risk
- public share output validated against approved modes only

### Gate Category B — Schedule Truth

Must be true:

- no active evidence of duplicate Booking truth from request flow
- no unresolved hard-conflict assignment bypass
- no recurring integrity failures in bookings, commitments, or manual blocks
- Agenda/Coverage separation functioning correctly

### Gate Category C — Occurrence and Staffing Integrity

Must be true:

- occurrence capacity formula holds in production checks
- no unresolved partial-fill/accounting defect materially affecting staffing
- request counts and filled counts remain trustworthy

### Gate Category D — Operational Control

Must be true:

- daily reviews completed consistently
- alerts and dashboards trusted by team
- support intake manageable by small team
- hotfix process no longer chaotic
- no repeated unknown-unknown incident category emerging

### Gate Category E — User Experience Baseline

Must be true:

- critical mobile flows are usable
- first workflow completion rate is acceptable for cohort stage
- support burden per active user is declining or stable
- repeated confusion points are understood and either fixed or documented

### Expansion Rule

- expand in small increments only
- review 48–72 hours after each expansion step before next increase
- if a new expansion triggers P0/P1 spike, pause expansion immediately
- if trust/privacy issue appears, expansion stops regardless of other metrics

---

## 17. Stabilization Exit Criteria

AmIFree exits stabilization only when the team can demonstrate the following:

### Incident and Defect Criteria

- zero open P0 issues
- no unresolved high-risk privacy or permission issues
- P1 backlog is zero or explicitly accepted with documented workaround and low residual risk
- hotfix frequency is declining and controlled
- reopened bug rate is low

### Integrity Criteria

- daily/weekly integrity checks show stable results across:
  - request-linkage
  - conflict logic
  - occurrence capacity
  - sharing privacy
  - template generation/resume behavior
- no unexplained production data anomalies remain open in critical tables/flows

### Operational Criteria

- team can manage support and incident load without emergency-only posture
- dashboards and alerts are trusted
- release process is controlled and predictable
- manual interventions are infrequent and documented

### User Experience Criteria

- core mobile workflows are reliably completable
- top confusion points have either been fixed or explicitly accepted as known limitations
- user trust is not being damaged by repeated visible inconsistencies

### Rollout Criteria

- current cohort is stable under normal use
- any cohort expansion completed during stabilization did not introduce uncontrolled incident growth
- product can support next-stage growth without violating locked truths

### Exit Deliverables Required

Before declaring stabilization complete, produce:

- stabilization scorecard
- unresolved-known-issues list
- post-MVP correction backlog
- recommended next-phase priorities
- operational watchlist for next 30–60 days

---

## 18. Risks to Watch Closely

1. **Duplicate truth creation via request lifecycle**
   - highest structural workflow risk because it corrupts schedule truth

2. **Privacy leakage through public sharing**
   - highest trust risk because even a small leak is unacceptable

3. **Hard-conflict enforcement drift**
   - especially around operator assignment and override boundaries

4. **Occurrence capacity drift**
   - especially under mixed states with active requests plus filled slots

5. **Template pause/resume duplication**
   - likely subtle and easy to miss until later scheduling windows

6. **Cross-midnight and service-day display confusion**
   - high likelihood of user confusion in nightlife scheduling context

7. **Role/permission regression**
   - especially if hotfixes touch shared loaders, APIs, or UI guards

8. **Graphile Worker retries causing duplicate side effects**
   - especially on request-linked or occurrence-linked operations

9. **Analytics blind spots creating false confidence**
   - dangerous if dashboards undercount integrity failures

10. **Small-team fatigue causing unsafe release bundling**
   - operational risk increases when hotfixes start carrying unrelated changes

---

## 19. Final Post-Launch Stabilization Definition

For AmIFree Scheduler, post-launch stabilization is the 30-day live-operations period in which the team deliberately constrains change, monitors the system daily, fixes only what materially affects trust or core workflow integrity, validates the approved schedule and sharing truths under real usage, and proves that the MVP can operate safely before broader expansion.

A stabilization period is considered successful only if the live product demonstrates all of the following in practice:

- Booking remains the only calendar-truth object
- request-linkage remains singular and consistent
- occurrence capacity remains mathematically and operationally correct
- staffing eligibility remains private and separate from sharing visibility
- public sharing remains limited to Busy or Busy + Region only
- hard-conflict safety remains enforceable
- Agenda and Coverage remain correctly separated
- the product remains operable by a small team through disciplined reviews, triage, and controlled hotfixes

Until those conditions are evidenced consistently in production, the team is still stabilizing and should not behave as though it has entered normal feature-delivery mode.