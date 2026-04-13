# [29] Phase — Early Multi-User Collaboration Safety

## 1. Early collaboration target shape and scope

The target shape is a **single workspace with a small number of authenticated internal users** collaborating safely on the same operational data without creating alternate truth. Early shared use is limited to the minimum set of multi-user behaviors needed for owner-led operations: shared visibility where operationally necessary, role-scoped editing, safe handoffs, duplicate-work prevention, attribution, and privacy-safe internal coordination. Booking remains the only calendar-truth object; Manual Availability Block, Booking Request, Shift Occurrence, and Shift Template remain distinct objects and distinct workflows. `schedule_commitments` remains the normalized overlap surface used for private source-of-truth schedule logic.

This phase covers only **within-workspace collaboration safety**. It does not expand public sharing, tenant boundaries, public launch behavior, or cross-workspace collaboration. Shared use must preserve the locked rules that public sharing is projection-only, workspace-scoped, and limited to Busy or Busy + Region, with only Assigned bookings, Booked bookings, and active Manual Availability Blocks exposed publicly. Inquiry, Hold, and Requested remain non-public.

## 2. Shared-workspace actor model and collaboration boundaries

The minimum actor model for early shared use is:

- **Workspace Owner**  
  Full workspace-scoped authority over bookings, requests, shift occurrences, shift templates, manual availability blocks, membership, and operational settings. May perform the limited hard-conflict save on Inquiry, Hold, and Requested only, with reason, confirmation, and audit note.

- **Manager Lite**  
  Day-to-day internal collaborator for bookings, requests, availability, and staffing inside the workspace. May use Booking-only intake and may perform the same limited hard-conflict save as the owner, subject to the same guardrails.

- **DJ Member**  
  A participating DJ inside the workspace with self-scoped access only. May view and act on records directly involving them, such as their own linked bookings, their own requests, their own Manual Availability Blocks, and shift/coverage items specifically sent to, assigned to, or involving them. They do not gain broad workspace browsing rights.

- **Public Viewer**  
  Not a workspace collaborator. Receives only public projection output and never receives raw internal records.

Boundaries:
- Only Workspace Owner and Manager Lite can use intake because intake is Booking-only and DJ / Manager Lite only unless re-approved later.
- Only Workspace Owner and Manager Lite can perform operational actions that can reshape linked-booking paths, staffing decisions, or override soft-state conflict warnings.
- DJ Members cannot browse other DJs’ private schedule details, internal eligibility logic, or unrelated soft-state bookings.
- Internal admin/ops/support users, if present, are not separate truth owners; they must act only through the same canonical, workspace-scoped application paths and cannot bypass workflow rules.

## 3. Cross-user visibility and privacy rules inside a workspace

Inside a workspace, visibility must follow **need-to-operate**, not blanket transparency.

For **Workspace Owner** and **Manager Lite**:
- full workspace visibility to Bookings, Booking Requests, Shift Occurrences, Shift Templates, and Manual Availability Blocks
- full operational visibility to request linkage, staffing state, and conflict state
- access to private source-of-truth schedule logic results needed for staffing decisions.

For **DJ Members**:
- visible: their own linked bookings, their own request states, their own manual availability blocks, and coverage/request records where they are the addressed or assigned DJ
- hidden: unrelated bookings, other DJs’ private availability reasons, other DJs’ request history, internal staffing-eligibility calculations for others, and internal-only review or conflict notes
- partially visible when necessary: a region label or operational summary on records directly involving them, but not broad workspace schedule detail.

Privacy rules:
- “Not shared” affects public visibility only and must not suppress internal eligibility calculations.
- Internal staffing logic may consider private commitments, but the UI shown to a non-privileged user must not reveal private reasons beyond the minimum needed action state, such as “not eligible now” or “conflict present.”
- Inquiry, Hold, and Requested remain invisible in public share output and should also be internally scoped so DJs do not see other DJs’ soft-state pipeline unless directly involved.
- `schedule_commitments` is not a general-purpose browsing surface; it is an internal overlap surface exposed only through authorized product views.

## 4. Concurrent editing, locking, and stale-state safeguards

Every high-risk record type must support **optimistic concurrency** with stale-write rejection:
- Booking
- Booking Request
- Manual Availability Block
- Shift Occurrence
- Shift Template.

Minimum safeguards:
- each editable record carries a version token or revision number plus `updated_at`
- save requests must include the client’s last-seen version
- if the server version has changed, the save is rejected and the user must refresh before retrying
- all state-transition actions re-evaluate current server truth at commit time, not client-cached truth.

For shared operations, add a lightweight **edit presence / working lease**:
- opening an edit screen places a short-lived “being edited by X” marker
- the marker is advisory, not a source of truth
- the marker expires automatically if the user leaves or the lease times out
- any destructive or state-changing save still depends on server-side validation, not just the lease.  

This reduces accidental overlap without creating deadlocks.

For linked workflows:
- accept, convert, assign, withdraw, and decline actions must be idempotent
- each action must validate the current linked-booking path before commit
- actions that affect counts, linkage, or availability must run in a transaction or equivalent atomic unit so users cannot partially save a request update without the linked booking or occurrence updates.

## 5. Collaboration-safe workflow rules for bookings, requests, availability, and coverage

**Bookings**
- Booking remains the only calendar-truth object.
- Booking creation through intake is limited to Workspace Owner and Manager Lite.
- Any cross-user update to a Booking must preserve its identity and linked relations; users may update the existing booking path, but may not fork it into a second booking to “make collaboration easier.”
- Advancement to Assigned or Booked always runs fresh hard-conflict validation against the current normalized overlap surface.

**Booking Requests**
- Draft request may exist without a linked Booking.
- Sent request must create or link a Requested Booking on the same canonical path.
- Accepting, converting, assigning, declining, expiring, or withdrawing always acts on the same linked request + linked-booking path.
- A second Booking must never be created by a collaboration race or repeated click.
- Only one terminal request outcome may be committed; once one user completes it, another user’s stale action must fail safely.

**Manual Availability Blocks**
- Manual Availability Blocks stay separate objects.
- DJs may create or edit only their own blocks.
- Workspace Owner and Manager Lite may create or edit blocks for operational reasons, but the actor and reason must be attributed.
- A block save must re-check current Assigned and Booked commitments at commit time and reject overlap.
- Editing or deleting a block must never silently alter a Booking.

**Coverage / Shift Occurrences**
- Coverage is Shift Occurrences only; Agenda is Bookings only.
- Shift Templates and one-off Shift Occurrences remain separate flows and must never be collapsed for convenience.
- Staffing an occurrence must update occurrence staffing state and the linked Booking path without creating duplicate capacity claims.
- `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)` must remain correct after every collaborative action.
- One staffed DJ equals one linked Booking.
- Requests remain per occurrence and per slot of capacity, not generic workspace invitations.

**Hard-conflict override**
- Only Workspace Owner and Manager Lite may perform the limited hard-conflict save.
- It is valid only for Inquiry, Hold, or Requested.
- It requires explicit reason entry, explicit confirmation, and an audit note.
- It never permits Assigned or Booked to bypass hard-conflict rules.

## 6. Notifications, handoff, and awareness rules for shared use

Because MVP notifications are in-app first, early shared use needs targeted in-app awareness rather than broad messaging. Minimum notification events:
- record assigned to you
- request sent to you
- request accepted / declined / withdrawn / expired / converted
- coverage/occurrence assignment affecting you
- stale-save rejection because another user changed the record
- conflict or capacity change that invalidates an in-progress action
- handoff of operational ownership for a record.

Each high-risk record should show a minimal shared-work indicator:
- current status
- last updated by
- last updated at
- currently being edited by, if applicable
- operational owner / working assignee, if claimed
- unresolved conflict banner, if present.  

This gives enough awareness to coordinate without exposing unrelated private detail.

Handoff rules:
- a record can be explicitly claimed by one internal operator at a time for workflow ownership
- claiming a record does not block view access, but it signals “I am actively handling this”
- reassignment or release of the claim should trigger a notification to the new responsible person
- handoff notes must live on the canonical record or its activity feed, not in an off-system channel that becomes hidden operational truth.

## 7. Conflict-prevention and duplicate-work prevention rules

To prevent two users from doing the same work or committing contradictory actions:

- every high-risk action must be idempotent
- buttons for terminal actions must disable after submit until the server responds
- stale responses must not be applied over fresher server truth
- linked-booking actions must check for an existing linked booking before creation
- staffing actions must check current slot availability before commit
- repeat retries after timeout must use an idempotency key or equivalent server-side dedupe.

Minimum anti-duplication rules by workflow:
- no second Booking may be created from the same accepted/converted request path
- no more than one active staffing claim may fill the same slot
- no duplicate active request should exist for the same occurrence-slot-target combination
- no template resume or generation action may duplicate future occurrences already materialized
- no two users may silently overwrite each other’s manual availability edits.

Conflict-prevention rules:
- every assignment or booking-state advancement must re-run hard-conflict and possible-conflict logic at commit time
- internal eligibility must use private schedule truth, but user-facing explanations should remain minimally revealing
- soft-state bookings may warn and route to review, but they do not hard-block assignment
- Assigned, Booked, and active Manual Availability Blocks remain the hard assignment-blocking surfaces.

## 8. Audit, attribution, and accountability rules for multi-user actions

Every meaningful multi-user action must produce an immutable audit event with:
- workspace_id
- actor_user_id
- actor_role
- object_type
- object_id
- action_type
- before state summary
- after state summary
- timestamp
- linked object identifiers where relevant
- reason / note when required.

Audit is mandatory for:
- booking state changes
- request state changes
- staffing / unstaffing actions
- manual availability create/edit/delete
- shift template create/pause/resume/archive
- shift occurrence create/edit/cancel
- hard-conflict override attempts and successes
- membership/role changes
- any repair or admin-assisted action.

Attribution rules:
- records must show who created them and who last materially changed them
- override and repair actions must always name the acting user, even if performed by owner or support
- background jobs may update derived state, but the audit trail must distinguish system actor vs human actor
- internal admin/ops actions must be attributable to the human who initiated them; “system” cannot be used to hide responsibility for manual interventions.

## 9. Minimum product, schema, and policy implications

**Minimum product implications**
- role-scoped workspace membership model
- record-level visibility filtering by actor role and relationship to the record
- edit-presence banner for high-risk records
- stale-write rejection UI
- record claim / handoff indicator
- record activity feed with audit-visible transitions
- in-app notification center for shared operational events
- conflict banners that distinguish hard-block vs review-needed without leaking private third-party details.

**Minimum schema implications**
- workspace membership table with role enum at minimum: owner, manager_lite, dj_member
- actor attribution fields such as `created_by`, `updated_by`, and `last_material_change_by`
- revision/version field on editable canonical records
- short-lived edit-session / work-claim table or equivalent presence model
- audit log table for immutable action history
- linked-object foreign keys preserving Booking Request ↔ Booking and Shift Occurrence ↔ Booking relationships
- uniqueness or dedupe protections that prevent duplicate linked bookings, duplicate active slot fills, and duplicate active request paths
- workspace-scoped row access controls on every canonical and derived table
- explicit distinction between canonical records and projection tables/surfaces.

**Minimum policy implications**
- only owner and manager_lite may use intake
- only owner and manager_lite may use the limited hard-conflict save
- DJ members are self-scoped participants, not broad operators
- no raw cross-workspace reads
- no admin or support workflow may bypass canonical app rules
- public sharing stays projection-only and workspace-scoped
- internal eligibility and public visibility remain separate policy axes.

## 10. Definition of done for Phase [29]

Phase [29] is done when the early multi-user collaboration foundation is defined clearly enough that implementation can enforce all of the following:

- a minimal shared-workspace actor model with explicit boundaries
- role-scoped internal visibility that protects privacy while allowing safe collaboration
- stale-state, concurrent-edit, and duplicate-action safeguards on all high-risk records
- collaboration-safe rules for Bookings, Booking Requests, Manual Availability Blocks, Shift Templates, and Shift Occurrences
- in-app awareness, claim/handoff, and accountability patterns that do not create off-system shadow truth
- audit and attribution requirements for all multi-user state changes
- minimum schema and policy requirements that preserve workspace tenancy, request linkage, staffing integrity, and public-share privacy rules.

## 11. Risks and collaboration-safety traps

- Giving DJ Members broad workspace browsing rights and accidentally exposing private schedule or pipeline detail.
- Treating internal visibility and public sharing as the same policy surface.
- Letting two users accept, convert, or assign from the same request path and creating duplicate bookings.
- Letting two users fill the same occurrence slot through stale UI state.
- Allowing edit-presence indicators to become relied-on truth instead of server-side validation.
- Using chat, email, or side spreadsheets as the real handoff system, creating shadow truth outside the app.
- Allowing Manager Lite or support tools to bypass canonical workflow rules for convenience.
- Showing private eligibility reasons instead of a minimal action outcome, leaking information about another DJ’s schedule.
- Collapsing Agenda and Coverage into one shared surface and blurring Booking vs Shift Occurrence truth.
- Treating Manual Availability Blocks like booking metadata instead of separate schedule objects.
- Failing to audit override actions, which removes accountability for the highest-risk collaborative decisions.
- Implementing collaboration without hard workspace scoping and opening the door to unsafe cross-user or cross-workspace visibility.
