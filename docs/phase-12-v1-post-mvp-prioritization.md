# [12] Phase — V1 / Post-MVP Prioritization

## 1. V1 / Post-MVP Prioritization Summary

AmIFree V1 should be a workflow-strengthening release, not a scope-expansion release. The immediate opportunity after stabilization is to make the existing booking and staffing loop materially faster, safer, and more trustworthy for DJs and operators: reduce open-slot aging, increase request response speed, clear Missing Info and Time TBD states earlier, and improve daily mobile schedule confidence.

The correct V1 posture is to invest in operator throughput, DJ responsiveness, schedule trust, and mobile reliability before adding adjacent product surface. That means improving staffing decision support, request orchestration, availability management, conflict explainability, and PWA quality ahead of new channels, integrations, payments, or broader intake.

Assumptions used in this prioritization:
- Stabilization is substantially complete, with no unresolved high-severity defects in booking truth, request linkage, occurrence capacity integrity, or privacy.
- The team remains small and should optimize for 2–3 focused release waves, not a multi-quarter expansion program.
- Phase 9 analytics instrumentation exists or can be completed with minor follow-on work.

This prioritization explicitly preserves the locked product constraints: Booking remains the only calendar-truth object; Intake remains Booking-only and DJ / Manager Lite only; Agenda and Coverage remain separate; occurrence-capacity math remains unchanged; staffing eligibility remains private and separate from external sharing visibility; and notifications remain in-app first.

## 2. Prioritization Principles

1. **Protect schedule truth before adding surface area.**  
   No V1 initiative should weaken Booking as the only calendar-truth object or blur the separation between Booking Request, Shift Occurrence, Booking, and Manual Availability Blocks.

2. **Prioritize loop compression over feature breadth.**  
   The best V1 work removes friction from the existing staffing loop rather than introducing new modules.

3. **Favor high-frequency workflows.**  
   Daily and weekly operator and DJ actions outrank low-frequency admin or expansion features.

4. **Improve trust and explainability with every acceleration feature.**  
   Faster staffing is only valuable if users understand why recommendations, conflicts, and blocks exist.

5. **Keep intelligence advisory, not autonomous.**  
   Rule-based guidance is appropriate in V1; auto-assignment and auto-save are not.

6. **Stay mobile-first in execution, not just design.**  
   Every top-priority initiative must improve or preserve one-handed, late-night, cross-midnight usage.

7. **Prefer low-dependency improvements.**  
   Features that depend on email, third-party integrations, or new system-of-record relationships should be downgraded unless core metrics prove they are necessary.

8. **Use evidence to unlock expansion.**  
   Expansion beyond the core DJ-first scheduling loop should happen only after measurable improvement in fill rate, response time, data completeness, and trust indicators.

## 3. Inputs from Locked Phases

The following locked inputs define the rails for V1 prioritization and are non-negotiable:

### Model and workflow invariants
- Booking remains the only calendar-truth object.
- Booking Request, Shift Occurrence, Booking, and Manual Availability Block remain separate objects.
- Request-linkage remains a single-path model; accepting a request must not create a second Booking.
- Intake remains Booking-only and limited to DJ / Manager Lite in MVP and V1 unless explicitly deferred beyond V1.

### Schedule and staffing invariants
- Agenda remains Bookings only.
- Coverage remains Shift Occurrences only.
- Internal staffing eligibility must continue to use private source-of-truth logic.
- “Not shared” must not be treated as “not eligible.”
- Hard-conflicted items cannot advance to Assigned or Booked.
- Occurrence capacity math remains:
  `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`

### Platform and delivery invariants
- TypeScript modular monolith, Next.js App Router PWA, Supabase, Graphile Worker, and existing structured extraction approach remain the operating stack.
- Notifications remain in-app first.
- Workflow email is not a required dependency for V1.
- AI extraction remains review-before-save.

### Operating assumptions inherited from launch and stabilization
- Correctness, privacy, request-linkage integrity, occurrence-capacity integrity, role safety, and mobile usability outrank breadth.
- Stabilization must finish before broad scope expansion.
- Product changes must remain realistic for a small team and evidence-driven.

## 4. Strategic Goals for V1

1. **Reduce time-to-staff without compromising safety.**  
   Make it faster to identify viable DJs, send requests, and fill occurrence capacity while preserving hard-block rules and private eligibility logic.

2. **Increase DJ responsiveness and schedule trust.**  
   Improve the speed and clarity with which DJs can review requests, manage availability, and trust what the schedule is telling them.

3. **Reduce operational drag from incomplete bookings.**  
   Turn Missing Info and Time TBD into faster-to-resolve workflows so operators are not staffing around bad data.

4. **Improve daily mobile retention.**  
   Make the schedule and request experience fast enough and reliable enough to become habitual daily infrastructure.

5. **Create a stronger evidence base for post-V1 expansion.**  
   Ensure V1 creates measurable improvements that justify later investment in messaging, integrations, or broader intake.

## 5. Candidate Opportunity Areas

1. Coverage action queue and staffing decision support
2. Request lifecycle orchestration
3. Booking completeness and alert resolution
4. Availability management ergonomics
5. Conflict explainability and auditability
6. Mobile PWA performance and resilience
7. Notification center maturity
8. Internal operations dashboards and exception queues
9. Reusable booking defaults and lightweight venue memory
10. Manager Lite collaboration improvements
11. Supplemental outbound communication channels
12. Expansionary integrations and adjacent products

## 6. Evaluation Framework

Each initiative should be scored on a 1–5 scale using the following weighted dimensions:

- **User value (25%)**  
  How strongly it improves core DJ and operator jobs-to-be-done.

- **Trust / safety impact (20%)**  
  How much it strengthens schedule integrity, privacy, role safety, and explainability.

- **Retention impact (20%)**  
  How much it increases repeat weekly use or reduces churn risk.

- **Operational leverage (20%)**  
  How much manual work, delay, or coordination overhead it removes.

- **Build complexity (10%)**  
  Reverse-scored for prioritization: 5 = low complexity, 1 = high complexity.

- **Dependency risk (5%)**  
  Reverse-scored for prioritization: 5 = low dependency risk, 1 = high dependency risk.

### Scoring method
Priority Score = weighted total across the six dimensions above.

### Hard gates
Regardless of score, an initiative cannot be Tier 1 if it:
- changes Booking’s role as the only calendar-truth object
- breaks request-linkage behavior
- collapses Agenda and Coverage into one surface
- changes occurrence-capacity math
- treats sharing visibility as staffing eligibility
- introduces email or external integrations as a required dependency
- weakens hard-conflict assignment blocking

### Strategic tiebreakers
When scores are close, prefer the initiative that:
1. shortens the open-slot-to-filled workflow
2. reduces trust-breaking ambiguity
3. improves mobile daily use
4. can be delivered incrementally by a small team

## 7. Priority Tiers

### Tier 1: Must Do Next
- Coverage Action Queue + Staffing Recommendation Panel
- Request Lifecycle Orchestration
- Missing Info / Time TBD Resolution Workflow
- Conflict Explainability, Override Review, and Audit History
- Availability Block Ergonomics and Reusable Patterns
- Mobile PWA Performance, Sync Safety, and Daily-Use Polish

### Tier 2: Strong Next Candidates
- In-App Notification Center, Preferences, and Actionable Nudges
- Internal Ops Dashboards and Exception Queues
- Reusable Booking Defaults and Lightweight Venue Profiles
- Manager Lite Collaboration and Safe Handoffs

### Tier 3: Later / Conditional
- Supplemental workflow email for requests or reminders, only if in-app response rates underperform
- Read-only external calendar overlay or import, only if staffing accuracy is demonstrably blocked without it
- Expanded intake beyond DJ / Manager Lite
- Native app wrapper, only if PWA performance and retention remain insufficient
- Deeper venue/client records that move toward CRM territory

### Tier 4: Explicitly Not Now
- Two-way calendar sync or any external calendar as schedule truth
- Payments, invoicing, payroll, or contract execution
- Marketplace/discovery features
- Merging Booking Request, Shift Occurrence, and Booking into a simpler combined model
- AI auto-save or AI auto-assignment
- Public detailed availability sharing beyond Busy or Busy + Region
- Any force-assign path around hard conflicts
- Messaging/SMS/chat becoming a required workflow dependency

## 8. Detailed Priority Ranking

| Rank | Initiative | Tier | Priority Score | Why it ranks here |
|---|---:|---:|---:|---|
| 1 | Coverage Action Queue + Staffing Recommendation Panel | 1 | 92 | Highest operator leverage; directly improves fill speed while preserving coverage-specific workflow boundaries. |
| 2 | Request Lifecycle Orchestration | 1 | 90 | Removes the largest manual bottleneck between viable candidate and accepted staffing outcome. |
| 3 | Missing Info / Time TBD Resolution Workflow | 1 | 88 | Protects booking quality and reduces downstream staffing confusion and rework. |
| 4 | Conflict Explainability, Override Review, and Audit History | 1 | 85 | High trust value; makes hard and possible conflict behavior understandable and defensible. |
| 5 | Availability Block Ergonomics and Reusable Patterns | 1 | 84 | High DJ retention and candidate-quality benefit with relatively manageable build scope. |
| 6 | Mobile PWA Performance, Sync Safety, and Daily-Use Polish | 1 | 82 | Critical enabling work for a mobile-first product used in time-sensitive conditions. |
| 7 | In-App Notification Center, Preferences, and Actionable Nudges | 2 | 80 | Meaningful response-rate upside, but best after the underlying request and staffing workflows are stronger. |
| 8 | Internal Ops Dashboards and Exception Queues | 2 | 76 | Supports evidence-driven product decisions and better daily oversight once the core workflows are instrumented. |
| 9 | Reusable Booking Defaults and Lightweight Venue Profiles | 2 | 72 | Good operational efficiency gain, but less urgent than staffing-loop improvements. |
| 10 | Manager Lite Collaboration and Safe Handoffs | 2 | 69 | Useful for growing team operations, but should follow stronger core workflow and trust foundations. |

## 9. Why Each Top Priority Matters

### 1. Coverage Action Queue + Staffing Recommendation Panel
This is the single highest-leverage operator improvement. It should create a coverage-first workspace showing open slots, `filled_slots_count`, `active_request_count`, `open_slots_count`, candidate viability, and next actions without collapsing Coverage into Agenda.

Implementation should start with deterministic rule-based ranking, not machine learning. Use private eligibility logic, region fit, hard-conflict absence, current request status, and response reliability signals; keep all recommendations advisory and never auto-assign.

### 2. Request Lifecycle Orchestration
AmIFree’s staffing loop slows down when operators must manually send, resend, track, and clean up requests. V1 should reduce that friction with batch send, resend, withdraw, expiry defaults, reminder scheduling, and clearer DJ-facing accept/decline flows.

This work must preserve the exact request-linkage rules. Every request action should operate against the same linked request and linked Booking path, with no duplicate Booking creation.

### 3. Missing Info / Time TBD Resolution Workflow
Incomplete bookings create silent risk. V1 should turn Missing Info and Time TBD from passive alert labels into structured workflows with explicit owners, required-field checklists, and visibility into what is blocking progression.

This improves both trust and throughput. Operators should be able to resolve data gaps before staffing decisions become unsafe or inefficient.

### 4. Conflict Explainability, Override Review, and Audit History
Trust breaks when users see a conflict but do not understand why it exists or why an action is blocked. V1 should expose the reason for hard and possible conflicts, the underlying commitments involved, and the exact blocker preventing progression.

This also hardens governance. Limited hard-conflict saves for Inquiry, Hold, and Requested should remain possible only with reason entry, confirmation, and audit note visibility.

### 5. Availability Block Ergonomics and Reusable Patterns
DJ trust depends heavily on whether the system reflects real-world availability with low effort. V1 should make it easier to create, copy, repeat, pause, and edit Manual Availability Blocks for common patterns such as recurring nightlife windows, vacations, and temporary blackout periods.

This must remain an ergonomics improvement, not a model shift. Manual Availability Blocks stay explicit, separate schedule objects and cannot overwrite Assigned or Booked bookings.

### 6. Mobile PWA Performance, Sync Safety, and Daily-Use Polish
A DJ-first mobile-first product wins or loses in the last-mile experience: schedule opens quickly, actions complete reliably, and cross-midnight behavior feels correct. V1 should improve p75 load times, perceived responsiveness, mutation safety, and stale-state handling.

This is enabling work, not cosmetic polish. Poor mobile reliability directly suppresses response rates, schedule trust, and repeat use.

### 7. In-App Notification Center, Preferences, and Actionable Nudges
Once request orchestration is stronger, the next leverage point is timely in-app prompting. V1 should add grouped notifications for requests, expiries, missing-info tasks, and status changes, with clear action targets and user-level preferences.

This should remain in-app first. The goal is to improve action velocity without creating channel sprawl or dependence on email.

### 8. Internal Ops Dashboards and Exception Queues
Leadership and operations need visibility into where staffing slows down and where integrity risks accumulate. Dashboards should focus on fill rate, request conversion, open-slot aging, alert backlog, and operator SLA misses.

This is especially important for a small team. Better visibility improves prioritization discipline and prevents anecdote-driven roadmap changes.

### 9. Reusable Booking Defaults and Lightweight Venue Profiles
Many events will share repetitive metadata. V1 should allow lightweight defaults for repeat venues or event types—such as typical service windows, region, notes, and setup assumptions—to reduce manual entry and improve data completeness.

This should stay intentionally constrained. It is an efficiency feature, not the start of a full CRM system.

### 10. Manager Lite Collaboration and Safe Handoffs
As usage grows, more scheduling work will involve handoffs, shared visibility, and limited delegation. V1 should improve ownership clarity, scoped notes, and safe transfer of operational responsibility without broadening role power or weakening auditability.

This matters, but it is secondary to getting the core staffing loop fast and trustworthy first.

## 10. Dependencies and Sequencing Rules

### Required exit gate before V1
Do not begin broad V1 expansion until all of the following are true:
- no unresolved high-severity issues in booking truth
- no unresolved request-linkage integrity defects
- no unresolved occurrence-capacity math defects
- no unresolved privacy or role-safety regressions
- core mobile booking and request flows are stable enough to instrument and compare over time

### Recommended sequencing

#### Wave 1: Strengthen the staffing core
- Coverage Action Queue + Staffing Recommendation Panel
- Request Lifecycle Orchestration
- Missing Info / Time TBD Resolution Workflow

This wave directly attacks the operator bottleneck and should deliver the clearest time-to-fill gains.

#### Wave 2: Increase trust and quality of decisions
- Conflict Explainability, Override Review, and Audit History
- Availability Block Ergonomics and Reusable Patterns
- Mobile PWA Performance, Sync Safety, and Daily-Use Polish

This wave improves the quality and reliability of the staffing loop that Wave 1 accelerates.

#### Wave 3: Improve responsiveness and visibility
- In-App Notification Center, Preferences, and Actionable Nudges
- Internal Ops Dashboards and Exception Queues
- Reusable Booking Defaults and Lightweight Venue Profiles

This wave should be started only after Waves 1 and 2 are stable enough to measure.

#### Wave 4: Optional, only if V1 velocity remains strong
- Manager Lite Collaboration and Safe Handoffs

### Sequencing rules
- Recommendation logic should launch as rule-based guidance before any more advanced ranking approach.
- Request workflow changes must be idempotent and preserve the single linked request + linked Booking path.
- Availability improvements must write only Manual Availability Blocks, never Bookings.
- Notification work should follow stable event instrumentation and preference rules.
- Dashboards should be built only after event names and workflow states are stable enough to avoid noisy reporting.
- Collaboration features should not precede trust, audit, and permission hardening.

## 11. What to Defer Until After V1

The following should be deferred until after V1 because they increase scope, introduce new dependencies, or threaten schedule truth:

### Expansion beyond the current workflow core
- Public or client-facing intake beyond DJ / Manager Lite
- Deep venue/client relationship management
- Marketplace/discovery functionality

### New channels and external dependencies
- Workflow email as a primary path
- SMS or chat systems
- Two-way calendar sync
- Broad third-party integrations

### Financial and back-office products
- Payments
- Invoicing
- Payroll
- Contract workflows

### Model-breaking or trust-reducing shortcuts
- Auto-assignment
- AI auto-save
- Force-assign around hard conflicts
- Public detailed availability sharing
- Collapsing separate domain objects for the sake of simplification

These may become valid later, but only after AmIFree demonstrates strong retention, trustworthy staffing behavior, and measurable operator throughput improvements on the current core model.

## 12. Metrics / Signals That Would Validate Each Priority

| Initiative | Validating signals |
|---|---|
| Coverage Action Queue + Staffing Recommendation Panel | Median time from open slot to first request sent; open-slot aging; fill rate per occurrence; operator actions per staffed slot |
| Request Lifecycle Orchestration | DJ response within 24 hours; requests sent per filled slot; expired request rate; withdraw/resend volume reduction |
| Missing Info / Time TBD Resolution Workflow | % of active bookings with unresolved Missing Info or Time TBD older than 24 hours; time-to-resolution; rate of assignments blocked by missing data |
| Conflict Explainability, Override Review, and Audit History | Conflict-related support volume; abandoned save attempts after conflict review; override-review completion rate; reduction in “why is this blocked?” incidents |
| Availability Block Ergonomics and Reusable Patterns | Weekly active DJs managing availability; time to create or edit a block; reduction in candidate-review reversals caused by late availability corrections |
| Mobile PWA Performance, Sync Safety, and Daily-Use Polish | p75 schedule load time; failed mutation rate; stale-view incidents; weekly returning active DJs/operators |
| In-App Notification Center, Preferences, and Actionable Nudges | Notification open-to-action rate; response latency after nudge; mute/disable rate; request-response lift versus no-notification baseline |
| Internal Ops Dashboards and Exception Queues | Weekly dashboard use by ops leads; time to detect stalled occurrences; % exceptions resolved within SLA; faster escalation of aging work |
| Reusable Booking Defaults and Lightweight Venue Profiles | Median booking creation time; % bookings created with complete required fields; reduction in repetitive editing for repeat venues |
| Manager Lite Collaboration and Safe Handoffs | Time to hand off responsibility; duplicate-work incidents; permission-related support tickets; ownership clarity in active staffing flows |

## 13. Main Tradeoffs and Risks

1. **Speed vs. safety**  
   Faster staffing tools can create pressure to assign too quickly. Mitigation: keep recommendations advisory, preserve hard-block rules, and show conflict reasons clearly.

2. **More nudges vs. notification fatigue**  
   Better response rates can turn into over-notification. Mitigation: grouped notifications, throttling, preferences, and action-based relevance.

3. **Availability convenience vs. model drift**  
   Repeating or templating Manual Availability Blocks could accidentally become a second scheduling truth. Mitigation: maintain explicit block objects, previews, and clear edit semantics.

4. **Performance caching vs. stale truth**  
   Faster mobile performance can increase stale-state risk. Mitigation: freshness indicators, safe mutation retries, and server reconciliation for critical actions.

5. **Defaults vs. propagated bad data**  
   Reusable defaults can spread incorrect assumptions. Mitigation: clear provenance, easy override, and review surfaces on save.

6. **Collaboration vs. permission sprawl**  
   Team workflow features can weaken role safety if shipped too broadly. Mitigation: scoped actions, visible ownership, and audit history.

7. **Dashboards vs. local optimization**  
   Teams may chase throughput while ignoring trust quality. Mitigation: pair speed metrics with integrity metrics such as blocked assignments, conflict reversals, and unresolved alerts.

8. **Expansion pressure vs. product coherence**  
   Requests for email, integrations, payments, or broader intake may be tempting after MVP. Mitigation: require metric-based proof that core loop improvements are insufficient first.

## 14. Final Recommended V1 / Post-MVP Prioritization

AmIFree V1 should be a focused optimization of the existing DJ-first scheduling and staffing system, not a diversification release.

### Recommended V1 core scope
Commit to the following as the primary V1 body of work:
1. Coverage Action Queue + Staffing Recommendation Panel  
2. Request Lifecycle Orchestration  
3. Missing Info / Time TBD Resolution Workflow  
4. Conflict Explainability, Override Review, and Audit History  
5. Availability Block Ergonomics and Reusable Patterns  
6. Mobile PWA Performance, Sync Safety, and Daily-Use Polish  

This is the right cut line for a small team because it strengthens the full staffing loop from candidate selection through response, data quality, trust, and daily mobile execution.

### Recommended V1 secondary scope
Only after the six priorities above are stable and measurable:
7. In-App Notification Center, Preferences, and Actionable Nudges  
8. Internal Ops Dashboards and Exception Queues  
9. Reusable Booking Defaults and Lightweight Venue Profiles  
10. Manager Lite Collaboration and Safe Handoffs  

### Explicit recommendation
Do not spend V1 capacity on payments, invoicing, marketplace features, external calendar truth, broad intake expansion, or AI autonomy. Those moves add breadth before AmIFree has fully proven the speed, trust, and retention of its core scheduling loop.

The decision-ready path is clear:
**stabilize → accelerate staffing → improve trust/explainability → harden mobile daily use → add visibility and nudges → defer expansion until the metrics justify it.**