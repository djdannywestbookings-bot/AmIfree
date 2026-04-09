# [10] Phase — Launch Readiness

## 1. Launch Readiness Summary

AmIFree Scheduler is ready to launch when the approved MVP can be used in production without breaking schedule truth, privacy, role safety, request-linkage integrity, occurrence capacity integrity, or core mobile usability.

For this MVP, "launch" does **not** mean feature-complete. It means the product can safely support the core production workflow:

- DJ / Manager Lite intake creates drafts for review-before-save
- Booking is the only calendar-truth object
- Manual Availability Blocks remain explicit, separate schedule objects
- Booking Request, Shift Occurrence, and Booking remain separate objects
- Operator Schedule preserves:
  - Agenda = Bookings only
  - Coverage = Shift Occurrences only
- Request linkage is exact and non-duplicative
- Occurrence generation and capacity math are correct
- Public sharing exposes only privacy-safe busy output
- Internal staffing eligibility uses private source-of-truth logic, not public visibility logic
- Core flows work reliably on mobile-first web/PWA

**Assumptions used for this package**
- Preferred launch shape is a controlled production release to a small initial user cohort, even if the product becomes publicly reachable on launch day.
- Small-team operations means one decision-maker from product/operations, one engineering owner, and one QA/UAT owner are available during launch and first-week stabilization.
- Workflow email may exist, but email delivery is not required to declare launch readiness.

## 2. Launch Principles

1. **Correctness over breadth**
   - A smaller safe launch is better than a broader unstable launch.
   - Any issue that compromises booking truth, request linkage, capacity math, privacy, or permissions is launch-blocking.

2. **Privacy over convenience**
   - External viewers may see only:
     - Busy
     - Busy + Region
   - Shared viewers never see booking details, titles, client names, venue names, notes, staffing logic, or internal eligibility reasons.

3. **Booking remains the only calendar truth**
   - The system must not create parallel “calendar event truth” objects outside approved booking logic.
   - Requests, occurrences, drafts, and blocks cannot silently become booking substitutes.

4. **Internal staffing logic is separate from public visibility**
   - “Not shared” must never be interpreted as “not eligible.”
   - Public sharing output must never be used as the internal staffing source of truth.

5. **No unsafe hard-conflict advancement**
   - Hard-conflicted items cannot advance to Assigned or Booked.
   - Limited hard-conflict save exists only for Inquiry, Hold, and Requested, and requires explicit reason, confirmation, and audit note.

6. **Operateable by a small team**
   - Launch requires simple runbooks, clear ownership, observable systems, reversible deployment steps, and minimal heroic manual intervention.

7. **Reversible changes only**
   - Production rollout should use tagged builds, controlled migrations, and documented rollback paths.

## 3. Release Candidate Definition

A build qualifies as a Release Candidate only when all of the following are true:

### Product and behavior
- All approved MVP behaviors are implemented for the locked scope.
- Booking lifecycle states exist exactly as approved:
  - Inquiry
  - Hold
  - Requested
  - Assigned
  - Booked
  - Completed
  - Cancelled
- Alert states remain separate from lifecycle states:
  - Hard Conflict
  - Possible Conflict
  - Missing Info
  - Time TBD
- Request-linkage behavior is exact:
  - Draft request may exist without a linked Booking
  - Sent request must create or link a Requested Booking
  - Viewed / Accepted / Declined / Withdrawn / Expired / Converted preserve the same linked request + linked-booking path
  - Accepting a request does not create a second Booking
  - Conversion / assignment updates the existing linked Booking path
- Occurrence capacity behavior matches approved MVP model:
  - `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`

### Technical and deployment
- RC is built from a tagged commit in the launch branch or protected mainline.
- The exact migration set for the RC is frozen and documented.
- The RC has been deployed to staging with production-like configuration.
- Next.js app, Supabase services, Graphile Worker jobs, and OpenAI extraction flows are all running in staging.
- No schema drift exists between application contracts and deployed database schema.
- Required environment variables, secrets, auth config, storage config, and worker config are documented and present.

### Quality and readiness
- All launch-blocking test cases pass in staging.
- No open Sev-0 or Sev-1 defects exist.
- Any remaining Sev-2 defects must have:
  - documented impact
  - known workaround
  - explicit approval from product and engineering
  - confirmation that they do not affect launch-blocking domains
- Monitoring dashboards, logs, and incident alert paths are live before production deployment.
- Rollback steps have been reviewed and rehearsed at least once on staging.

### Operational readiness
- Named launch owner, engineering owner, QA/UAT owner, and incident decision-maker are assigned.
- Support inbox/channel and escalation path are active.
- First 24-hour and first 7-day operating plans are agreed.

After an RC is declared, only the following changes may enter it:
- Sev-0 / Sev-1 fixes
- privacy or permission fixes
- data-integrity fixes
- instrumentation required for launch monitoring
- deployment-script or migration fixes required to safely ship

No net-new features should enter the RC.

## 4. Scope Locked for Launch

The following scope is locked and must be the basis of launch evaluation:

### Core schedule and booking model
- Booking is the only calendar-truth object.
- Manual Availability Blocks are explicit, separate schedule objects.
- Booking Request, Shift Occurrence, and Booking remain separate objects.
- Shift Templates and one-off Shift Occurrences are separate flows and separate objects.

### Intake and extraction
- Intake is DJ / Manager Lite only in MVP.
- Intake Drafts stage Booking creation only in MVP.
- AI extraction is review-before-save.
- Extraction failure must not auto-create final bookings.

### Scheduling and views
- Default schedule view is a date-strip + mobile agenda timeline.
- Default visible time window is approximately 12:00 PM through 6:00 AM next day.
- Cross-midnight gigs visually belong to the starting nightlife day.
- Service day is separate from calendar timestamp and defaults to 6:00 AM local venue time.

### Operator schedule
- Agenda = Bookings only.
- Coverage = Shift Occurrences only.

### Staffing safety
- Internal staffing eligibility uses private source-of-truth schedule logic.
- “Not shared” is not the same as “not eligible.”
- Operators cannot force-assign hard-conflicted DJs.
- Hard-conflicted items cannot advance to Assigned or Booked.

### Hard-conflict exceptions
- DJ owner / Manager Lite limited hard-conflict save exists only for:
  - Inquiry
  - Hold
  - Requested
- Limited hard-conflict save requires:
  - explicit reason entry
  - confirmation
  - audit note

### Request linkage
- Draft request may exist without linked Booking.
- Sent request must create or link a Requested Booking.
- All downstream request states preserve the same linked request + linked-booking path.
- Accepting a request must not create a second Booking.

### Shift template / occurrence behavior
- Shift Templates include approved recurrence fields, preview, and pause/resume behavior.
- Pausing a template stops future occurrence generation only.
- Already materialized occurrences remain unchanged.
- Resuming generates missing future occurrences inside remaining active date range without duplication.

### Occurrence capacity
- Occurrences support multi-slot staffing using approved counters and math.
- One staffed DJ = one linked Booking.
- Requests are per occurrence for one slot of capacity.

### Sharing and privacy
- External sharing modes are only:
  - Busy
  - Busy + Region
- Shared viewers see only blocked time and optionally region/city-state.
- Public shared busy output includes only hard-blocking schedule truth:
  - Assigned bookings
  - Booked bookings
  - Active Manual Availability Blocks
- Inquiry / Hold / Requested are soft-state only and do not appear in public shared busy output.

### Technical platform
- TypeScript modular monolith
- Next.js App Router PWA
- Supabase Postgres/Auth/Storage
- Graphile Worker for async jobs
- OpenAI Responses API for structured extraction
- `schedule_commitments` is the normalized overlap surface

### Notifications
- Notifications are in-app first for MVP.
- Workflow email delivery is not a required MVP launch dependency.

## 5. Explicitly Deferred From Launch

The following are explicitly not required to declare launch readiness:

- Any public sharing mode beyond:
  - Busy
  - Busy + Region
- Any staffing flow that bypasses hard-conflict safety
- Any intake role expansion beyond DJ / Manager Lite
- Any behavior that lets requests, drafts, or occurrences act as parallel booking truth
- Any workflow email dependency for core MVP operations
- Native mobile apps beyond the approved mobile-first web app / PWA
- Advanced staffing automation or auto-assignment beyond approved MVP logic
- Expanded external-facing booking presentation beyond privacy-safe busy sharing
- Nice-to-have reporting, exports, or analytics views not required for launch monitoring
- Nonessential polish improvements that do not affect correctness, privacy, role safety, or mobile usability

If a deferred item is incomplete, launch may still proceed.
If a locked-scope item is incomplete, launch should not proceed.

## 6. Go / No-Go Criteria

Launch is **Go** only if every item below is true.

### Product truth and behavior
- Booking remains the only calendar-truth object in all core flows.
- Agenda and Coverage are correctly separated.
- Booking lifecycle and alert states behave exactly as approved.
- Soft states do not hard-block assignment and do not appear in public shared busy output.
- Manual Availability Blocks cannot be saved over Assigned or Booked bookings.
- Hard-conflicted items cannot advance to Assigned or Booked.
- Limited hard-conflict save exists only where approved and captures reason, confirmation, and audit note.
- Cross-midnight rendering and service-day logic are correct in all core schedule views.

### Request-linkage integrity
- Sent request always creates or links one Requested Booking path.
- No duplicate booking creation occurs on request acceptance or conversion.
- Request state changes preserve the same linked objects.
- Withdrawal, expiration, decline, acceptance, and conversion produce correct downstream state.

### Occurrence generation and capacity integrity
- Template preview, save, pause, and resume behave exactly as approved.
- Resume does not duplicate future occurrences.
- `filled_slots_count`, `active_request_count`, and `open_slots_count` stay consistent.
- `open_slots_count` never becomes negative.
- Each staffed DJ maps to one linked Booking only.

### Privacy and permissions
- Public share endpoints expose only busy or busy+region intervals.
- No private booking metadata, notes, staffing logic, or internal eligibility data leaks.
- Role boundaries prevent unauthorized edits, assignments, or visibility.

### Technical and operational readiness
- Production deployment path is documented and tested.
- Staging signoff is complete.
- Monitoring and incident response are active.
- Rollback path is documented and credible.
- No open Sev-0 or Sev-1 defects remain.
- Core mobile flows pass on target browsers/devices.

Launch is **No-Go** if any one of the following is true:
- any privacy leak exists
- any request-linkage duplication exists
- any hard-conflict safety bypass exists
- any occurrence-capacity integrity defect exists
- any role/permission defect allows unsafe access or mutation
- any core schedule truth defect exists
- any production migration is unverified or unsafe
- monitoring or rollback is not ready
- core mobile flows are materially broken

## 7. Launch-Blocking Risks

1. **Request-linkage duplication**
   - Risk: accepted or converted requests create duplicate bookings or break the single linked path.
   - Impact: schedule truth corruption and staffing confusion.
   - Block launch if observed even once in validated flows.

2. **Occurrence capacity drift**
   - Risk: counter math becomes inconsistent after request, staffing, withdrawal, or resume flows.
   - Impact: overbooking, understaffing, false open slots.
   - Block launch if counters can diverge from actual staffing state.

3. **Hard-conflict safety bypass**
   - Risk: operators or edge-case flows move hard-conflicted items to Assigned or Booked.
   - Impact: unsafe assignments and broken trust.
   - Block launch immediately.

4. **Public share privacy leak**
   - Risk: public share endpoints expose booking details, notes, venue/client data, or internal schedule logic.
   - Impact: direct privacy breach.
   - Immediate no-go / rollback condition.

5. **Role and permission leakage**
   - Risk: unauthorized users can view or mutate bookings, requests, blocks, or staffing decisions.
   - Impact: privacy and integrity breach.
   - Launch-blocking.

6. **Cross-midnight or service-day errors**
   - Risk: bookings appear on the wrong nightlife day or overlap checks use the wrong day boundary.
   - Impact: operational confusion and false conflicts.
   - Launch-blocking if reproducible on core flows.

7. **Worker / async job instability**
   - Risk: occurrence generation, request jobs, or extraction-related jobs fail silently or repeat.
   - Impact: missing occurrences, duplicate actions, stale counters.
   - Launch-blocking if jobs are not observable and recoverable.

8. **Review-before-save not enforced**
   - Risk: AI extraction writes final booking data without user review.
   - Impact: incorrect bookings entering schedule truth.
   - Launch-blocking.

## 8. Required Pre-Launch Checks

### Product checks
- Verify all lifecycle states and alert states are visible and distinct where intended.
- Verify Booking Request, Shift Occurrence, Booking, Intake Draft, and Manual Availability Block remain separate objects in UI and behavior.
- Verify Sent request creates or links a Requested Booking.
- Verify Accepted / Declined / Withdrawn / Expired / Converted preserve the linked path correctly.
- Verify acceptance does not create a second Booking.
- Verify hard-conflicted items cannot reach Assigned or Booked.
- Verify limited hard-conflict save is allowed only for Inquiry, Hold, and Requested and requires:
  - reason
  - confirmation
  - audit note
- Verify Manual Availability Blocks cannot be saved over Assigned or Booked bookings.
- Verify public share output reflects only Assigned, Booked, and active Manual Availability Blocks.
- Verify Inquiry, Hold, and Requested remain internal/soft and do not show on public shared busy.
- Verify Busy and Busy + Region are the only sharing modes exposed.
- Verify default schedule window, date-strip, agenda timeline, cross-midnight rendering, and service-day behavior.

### Engineering checks
- Build production artifact from tagged RC commit.
- Confirm production env vars, secrets, Supabase config, OpenAI config, and worker config are present and correct.
- Confirm Graphile Worker is running with correct queues, retries, and failure visibility.
- Confirm app and worker versions are compatible with deployed schema.
- Confirm PWA shell, manifest, and service worker behavior do not cache private responses incorrectly.
- Confirm error logging, server logs, worker logs, and request tracing are available.
- Confirm feature flags or kill switches exist for:
  - public share access if needed
  - extraction intake if needed
  - occurrence generation jobs if needed
- Confirm rate-limit and timeout behavior for extraction and async flows degrades safely to review/retry, not silent corruption.
- Confirm backup / snapshot procedure is ready before deployment.

### Data/schema checks
- Confirm schema matches approved objects and relationships.
- Confirm `schedule_commitments` is populated and used as normalized overlap surface.
- Confirm uniqueness/integrity constraints prevent duplicate linked-booking paths where expected.
- Confirm foreign keys for bookings, requests, occurrences, templates, and blocks are valid.
- Confirm service-day, timezone, local start/end time, and venue-time assumptions persist correctly.
- Confirm occurrence counters recalculate or remain transactionally correct across:
  - request created
  - request withdrawn
  - request expired
  - request accepted/converted
  - staffing added
  - staffing removed
  - template paused
  - template resumed
- Confirm migration scripts are ordered, repeat-safe where applicable, and documented for rollback or forward-fix.
- Run data-integrity queries in staging showing:
  - no duplicate active linked bookings from one request path
  - no negative open slot counts
  - no occurrence with filled slots above slots needed unless explicitly unsupported and blocked
  - no public-share rows including soft states

### Security/privacy checks
- Validate authentication and role checks for all mutating routes and server actions.
- Validate row-level security / access-control rules for private schedule data.
- Validate public share endpoints expose only approved busy payload shape.
- Validate Busy + Region returns only approved region/city-state data and no extra metadata.
- Validate internal notes, audit notes, extraction payloads, and staffing logic are never exposed publicly.
- Validate logs and monitoring tools do not capture sensitive booking details unnecessarily.
- Validate signed URLs, tokens, and public share links follow least-privilege behavior.
- Validate deleted/disabled public links stop resolving.
- Validate session expiry, logout, and unauthorized access flows on mobile browsers.

### QA/UAT checks
- Pass end-to-end test set for:
  - intake draft creation and review-before-save
  - booking creation/edit lifecycle
  - request send / accept / decline / withdraw / expire / convert
  - operator agenda and coverage separation
  - manual block creation/edit/delete
  - hard and possible conflict handling
  - shift template preview / save / pause / resume
  - occurrence staffing and slot math
  - public share Busy and Busy + Region
- Pass cross-browser/device checks on at minimum:
  - iPhone Safari
  - Android Chrome
  - desktop Chrome
- Confirm core screens are usable without layout breakage in mobile-first viewport.
- Confirm empty states, error states, retries, and validation messaging exist for critical flows.
- Confirm no unresolved launch-blocking defects remain.

### Analytics/monitoring checks
- Confirm event instrumentation exists for the core actions that determine launch success.
- Confirm dashboards exist for product integrity and technical health.
- Confirm alerts are configured for:
  - server/app errors
  - worker failures
  - public share endpoint failures
  - auth/login failures
  - unexpected increase in request-linkage mismatches
  - unexpected increase in slot-count mismatches
- Confirm analytics event names and payloads do not leak sensitive content.
- Confirm monitoring works in staging with test events before launch.

## 9. Staging Signoff Requirements

Staging signoff is complete only when all of the following are true:

1. **Production-like environment**
   - Staging uses production-like auth, environment configuration, worker setup, and database schema.
   - Feature flags match intended launch posture.

2. **Clean RC deployment**
   - Staging has the exact RC build and exact RC migrations.
   - No untracked patches or manual tweaks exist.

3. **UAT dataset**
   - Staging contains representative test data for:
     - DJs
     - Manager Lite users
     - requests
     - bookings in multiple lifecycle states
     - manual blocks
     - shift templates and generated occurrences
     - public share links
     - cross-midnight bookings
     - multi-slot occurrences

4. **Signoff checklist**
   - Product/operations signs off that user-visible behavior matches approved MVP.
   - Engineering signs off that deployment, schema, jobs, monitoring, and rollback are ready.
   - QA/UAT signs off that launch-blocking scenarios passed.
   - No signoff may be conditional on a known blocking bug being “watched.”

5. **Required evidence**
   - Smoke-test record for staging
   - test-pass summary for launch-blocking cases
   - list of accepted non-blocking issues
   - deployment checklist
   - rollback checklist
   - dashboard links / monitoring readiness notes

No production launch should occur without completed staging signoff.

## 10. Launch-Day Runbook

### Before deployment
1. Confirm launch owner, engineering owner, QA/UAT owner, and incident lead are present.
2. Freeze non-launch merges and deployments.
3. Confirm RC tag, migration list, rollback version, and config manifest.
4. Confirm monitoring dashboards and alert channels are open.
5. Confirm support channel and incident channel are active.
6. Take pre-deploy production database backup / snapshot.
7. Confirm no unresolved Sev-0/1 issues opened since signoff.

### Deployment sequence
1. Put team in launch mode; pause unrelated operational work.
2. Deploy database migrations first, only if reviewed and required.
3. Run post-migration integrity checks.
4. Deploy application build.
5. Deploy / restart Graphile Worker processes on RC version.
6. Verify application health endpoint and worker health.
7. Run production smoke tests on:
   - login
   - intake draft
   - booking view
   - request send path
   - operator agenda
   - operator coverage
   - public Busy share
   - Busy + Region share
8. Verify first analytics events and logs are arriving.
9. Enable access for launch cohort or open production traffic.

### First validation after go-live
- Create a test draft and confirm review-before-save.
- Confirm one request send flow creates/links one Requested Booking.
- Confirm one public share URL returns only allowed payload.
- Confirm one occurrence staffing action updates counters correctly.
- Confirm no immediate error spike in app, DB, or worker logs.

### Communication discipline
- Record exact deployment time, build tag, migration IDs, and first successful smoke-test completion.
- Record any launch-day deviation from planned steps.
- Do not introduce unrelated fixes during the monitoring window unless they are incident-response changes.

## 11. Rollback Criteria and Rollback Plan

### Rollback criteria
Rollback should be initiated immediately if any of the following occur in production:

- public share privacy leak
- unauthorized access or permission bypass
- duplicate booking creation from request flows
- hard-conflict bypass allowing Assigned or Booked state
- occurrence-capacity counters drifting in core flows
- severe cross-midnight/service-day misplacement affecting live operations
- broken login or unusable core mobile flow for primary users
- failed migration causing data corruption risk
- worker loop, duplicate job execution, or job failure pattern that threatens integrity
- sustained critical error rate on core flows without a safe immediate hotfix

### Rollback plan
1. Declare incident and pause further rollout.
2. Disable new exposure where possible:
   - disable public share routes if affected
   - disable extraction intake if affected
   - pause occurrence-generation jobs if affected
3. Revert app to previous stable build.
4. Revert worker to previous stable version.
5. If migration is safely reversible, execute approved rollback migration.
6. If migration is not safely reversible:
   - keep schema in place
   - revert application/worker
   - apply forward-fix or operational containment
7. Validate rollback smoke tests.
8. Audit affected records:
   - requests
   - linked bookings
   - occurrences
   - counters
   - public share responses
9. Decide whether production remains partially available, enters restricted mode, or is fully paused.

### Rollback posture
- Prefer partial containment over full outage when privacy and integrity allow it.
- Prefer application rollback plus targeted kill switches over database restore.
- Database restore should be reserved for major corruption scenarios and used only with explicit incident leadership approval.

## 12. First 24 Hours Monitoring Plan

### First 2 hours
- Continuous observation by launch owner and engineering owner.
- Watch:
  - app/server errors
  - auth failures
  - worker queue backlog
  - request send/accept flows
  - public share responses
  - booking save failures
  - occurrence counter anomalies
- Re-run smoke tests at least once after live traffic begins.

### Hours 2–8
- Review metrics every 30–60 minutes.
- Sample real production records for:
  - one intake draft
  - one sent request
  - one accepted or declined request if available
  - one generated occurrence
  - one public share payload
- Confirm no silent integrity drift.

### Hours 8–24
- Review overnight/late-use traffic and cross-midnight behavior specifically.
- Audit:
  - service-day grouping
  - nightlife-day rendering
  - public share correctness during late-night hours
  - async job health after recurring/template windows run

### Required alerts in first 24 hours
- Sev-0/1 incident alert to launch team
- worker failure/retry spike
- request-linkage anomaly
- negative or inconsistent open slot counts
- public share endpoint error spike
- login/auth error spike

## 13. First 7 Days Operating Plan

1. **Stabilization window**
   - No nonessential feature work.
   - Only bug fixes, instrumentation improvements, and operational hardening.

2. **Daily integrity checks**
   - Review a daily sample of:
     - new bookings
     - sent requests
     - accepted/declined/expired requests
     - generated occurrences
     - public share links
   - Run daily anomaly queries for:
     - duplicate linked booking paths
     - negative or impossible slot counts
     - hard-conflicted assignments
     - share rows exposing disallowed fields

3. **Daily triage**
   - One daily launch review across product/ops, engineering, and QA.
   - Reclassify issues into:
     - immediate fix
     - monitor
     - defer
   - Anything touching launch-blocking domains gets same-day attention.

4. **Change control**
   - Batch noncritical fixes into controlled releases.
   - Re-run smoke suite after each production patch.

5. **Support loop**
   - Log all user-reported issues.
   - Tag each issue by domain:
     - booking truth
     - request linkage
     - conflicts
     - occurrence generation
     - capacity math
     - public share
     - permissions
     - mobile UI
     - extraction review
   - Feed trends into daily review.

6. **Exit from stabilization**
   - After 7 days, exit launch mode only if:
     - no unresolved Sev-0/1
     - no recurring integrity/privacy incidents
     - no evidence of hidden counter or linkage drift
     - support load is manageable

## 14. Support and Incident Triage Plan

### Support ownership
- **Product/Operations owner**: user impact, business decision-making, user communication
- **Engineering owner**: app, DB, worker, deployment, rollback
- **QA/UAT owner**: reproduction, regression verification, fix validation

### Severity levels
- **Sev-0**
  - privacy breach
  - data corruption
  - broad outage
  - permission bypass
  - duplicate booking creation causing live schedule corruption
- **Sev-1**
  - core flow unavailable for many users
  - hard-conflict safety bypass
  - occurrence capacity integrity broken
  - request-linkage integrity broken
- **Sev-2**
  - important function degraded but workaround exists
  - localized mobile issue on non-primary flow
  - delayed but recoverable worker issue
- **Sev-3**
  - cosmetic issue
  - minor usability issue
  - noncritical instrumentation gap

### Triage rules
- Sev-0 and Sev-1 require immediate incident handling and no waiting for the next meeting.
- Sev-0 privacy or permissions issues trigger immediate containment and likely rollback.
- Sev-1 integrity issues trigger same-day fix or rollback decision.
- Sev-2 may stay open only if it does not affect launch-blocking domains.
- Every incident gets:
  - owner
  - affected flow
  - reproduction steps
  - mitigation
  - user impact statement
  - release decision

## 15. Launch Metrics to Watch

These are the minimum metrics that matter for launch quality.

### Product integrity metrics
- intake draft creation success rate
- review-before-save completion rate
- booking creation/update success rate
- request send success rate
- request acceptance/decline/withdrawal/expiration success rate
- linked request-to-booking integrity rate
- number of duplicate linked-booking anomalies
- number of hard-conflict assignment-block attempts prevented
- number of hard-conflicted items incorrectly advanced
- occurrence generation success rate
- occurrence resume-without-duplication success rate
- slot-count integrity anomaly count
- number of negative or impossible `open_slots_count` states

### Privacy and sharing metrics
- public share endpoint success/error rate
- count of Busy vs Busy + Region share requests
- privacy validation anomaly count from audits
- unauthorized access attempts or permission-denied spikes

### Technical health metrics
- app/server error rate
- worker job failure/retry count
- DB latency / timeout trend on core queries
- auth/login success rate
- page/action latency for core mobile flows
- deployment and job health status

### Operational metrics
- support tickets by severity and domain
- time to acknowledge Sev-0/1 issues
- time to contain launch incidents
- number of hotfixes required in first 7 days

## 16. Post-Launch Review Checklist

After the first-week stabilization period, complete a launch review covering:

- Did launch-blocking domains remain intact?
  - schedule truth
  - hard-conflict safety
  - request-linkage integrity
  - occurrence capacity integrity
  - public share privacy
  - role/permission safety
  - core mobile usability
- Were any rollback criteria hit or narrowly avoided?
- Did any data repair need to be performed?
- Were dashboards and alerts sufficient?
- Did support volume match expectations?
- Which flows caused the most friction?
- Were cross-midnight and service-day behaviors correct in real usage?
- Did review-before-save reduce extraction errors effectively?
- Did soft-state vs hard-state booking behavior remain clear operationally?
- Did public sharing remain privacy-safe under real traffic?
- What Sev-2 issues should be promoted into immediate roadmap work?
- What deferred items now have evidence-based priority for the next phase?

Outputs of the review should include:
- incidents summary
- metrics summary
- defects opened/closed
- user pain points
- top 5 stabilization follow-ups
- recommendation: remain in stabilization, expand rollout, or proceed to broader launch

## 17. Final MVP Launch Readiness Definition

AmIFree Scheduler is launch-ready when the approved MVP can be deployed to production from a tagged release candidate, pass staging signoff and production smoke tests, and operate for real users without compromising:

- Booking as the only calendar-truth object
- exact request-linkage behavior
- correct occurrence generation and capacity math
- hard-conflict assignment safety
- privacy-safe Busy / Busy + Region sharing only
- internal staffing eligibility based on private schedule truth
- role and permission boundaries
- mobile-first usability for core workflows

In practical terms, the MVP is ready to launch only when:

- all locked launch scope is implemented
- all launch-blocking tests pass
- no Sev-0/1 issues remain
- monitoring and incident response are live
- rollback is credible and documented
- product, engineering, and QA/UAT have signed off
- the small launch team can support the first 24 hours and first 7 days safely

If any of those conditions are not met, launch should be treated as **No-Go** until corrected.
