## 1. Multi-user target shape and scope

The minimum safe multi-user target is a **workspace-based early shared-use model** that supports a small team operating inside one tenant without changing any locked scheduling truths.

This phase should support:
- one workspace owner
- invited Manager Lite users
- invited DJ users
- workspace-scoped schedule operations
- workspace-scoped public busy sharing
- future-safe expansion to a user belonging to multiple workspaces

This phase should not support:
- marketplace behavior
- customer self-serve portals
- cross-tenant collaboration
- cross-tenant search
- public DJ discovery
- multi-brand enterprise hierarchy
- shared raw schedule access across workspaces

The operational goal is to move from a solo personal beta to a tenant-safe shared workspace model while preserving all locked truths:
- Booking remains the only calendar-truth object
- Manual Availability Blocks remain separate objects
- Booking Request, Shift Occurrence, and Booking remain separate objects
- Shift Templates and one-off Shift Occurrences remain separate objects and flows
- Agenda remains Bookings only
- Coverage remains Shift Occurrences only
- schedule_commitments remains the normalized overlap surface

The minimum safe multi-user release shape is:
- one authenticated app user can belong to one or more workspaces
- each workspace has its own members, roles, data, policies, and public-share settings
- all core scheduling and booking records are workspace-owned
- all security, policy, and visibility logic runs through workspace membership, not global user identity alone

## 2. Tenant/workspace model and ownership boundaries

The primary tenant boundary is the **workspace**.

A workspace represents one DJ operation or team boundary and owns all tenant-scoped operational data, including:
- bookings
- booking requests
- manual availability blocks
- shift templates
- shift occurrences
- schedule commitments
- invite records
- audit records
- public share configurations

Rules:
- every operational record must belong to exactly one workspace
- every operational record must have a non-null `workspace_id`
- no operational record may be shared across workspaces
- no foreign key may point from a row in one workspace to a domain row in another workspace
- all app queries, jobs, and mutations must be scoped by workspace

Ownership model:
- a workspace has one required active owner
- owner is the highest workspace authority
- owner can invite users, assign roles, manage workspace settings, and manage public-share settings
- ownership transfer can be added later, but the model should support at least one active owner now

Boundary rule:
- the workspace is the **data ownership boundary**
- workspace membership is the **authorization boundary**
- public share projection is the **external visibility boundary**

## 3. User, profile, and role model

Use a three-layer identity model.

### Global auth user
Represents the human account in Supabase Auth.

Purpose:
- login identity
- email identity
- platform-level authentication

Minimum fields:
- `id`
- `email`
- `created_at`
- `last_sign_in_at`

### Workspace membership
Represents one user’s membership inside one workspace.

Purpose:
- tenant access
- role assignment
- active/suspended state
- workspace-scoped authorization

Minimum fields:
- `id`
- `workspace_id`
- `user_id`
- `role`
- `status`
- `invited_by_membership_id`
- `joined_at`
- `created_at`

Membership statuses:
- `invited`
- `active`
- `suspended`
- `removed`

### Workspace member profile
Represents the operational identity of that member inside that workspace.

Purpose:
- display name
- DJ-specific settings
- staffing identity
- share preferences
- schedule subject identity

Minimum fields:
- `id`
- `workspace_id`
- `membership_id`
- `display_name`
- `stage_name`
- `home_region`
- `timezone`
- `is_schedulable`
- `public_share_mode`
- `public_share_enabled`

Minimum roles:
- `owner`
- `manager_lite`
- `dj_member`

Role intent:
- **owner**
  - full workspace administration
  - can manage members, workspace settings, sharing, bookings, requests, and scheduling objects
  - can perform limited hard-conflict save only where allowed
- **manager_lite**
  - can operate booking and staffing workflows inside approved boundaries
  - can perform limited hard-conflict save only where allowed
  - cannot manage owner-only tenant controls
- **dj_member**
  - can access only self-scoped scheduling surfaces and permitted request actions
  - cannot administer tenant settings or see unrelated private scheduling detail by default

Important modeling rule:
- operational schedule ownership should attach to **workspace member profile or workspace membership**, not to global user alone

## 4. Data ownership and object-scoping rules

Every core table must be tenant-scoped.

Required ownership columns on all core operational tables:
- `workspace_id`
- `created_by_membership_id`
- `updated_by_membership_id`
- `created_at`
- `updated_at`

Where a record belongs to or affects a specific person in the schedule, it must also carry a workspace-scoped subject reference such as:
- `subject_membership_id`
- or `subject_member_profile_id`

Minimum object-scoping rules:

### Booking
- belongs to exactly one workspace
- remains the only calendar-truth object
- may reference one assigned DJ through a workspace-scoped membership/profile reference
- accepting a request does not create a second Booking
- conversion or assignment updates the existing linked Booking path
- one staffed DJ = one linked Booking

### Manual Availability Block
- belongs to exactly one workspace
- belongs to exactly one schedule subject inside that workspace
- remains separate from Booking
- participates in public shared busy only when active
- cannot be saved over Assigned or Booked bookings

### Booking Request
- belongs to exactly one workspace
- may reference one target DJ inside that workspace
- must remain linked to the existing Booking path when applicable
- must never create duplicate Booking truth

### Shift Template
- belongs to exactly one workspace
- remains separate from one-off Shift Occurrence flow and object model

### Shift Occurrence
- belongs to exactly one workspace
- remains separate from Booking
- is a coverage/staffing object only
- capacity logic remains:
  - `open_slots_count = max(slots_needed - filled_slots_count - active_request_count, 0)`

### schedule_commitments
- belongs to exactly one workspace
- is the normalized overlap surface
- stores overlap-relevant schedule segments derived from allowed source objects
- must preserve source-type separation through fields such as:
  - `source_type`
  - `source_id`
  - `subject_membership_id`
  - `workspace_id`

Source-type rule:
- source type must distinguish at minimum:
  - Booking
  - Manual Availability Block
- future approved sources can be added later without collapsing object boundaries

Integrity rule:
- all linked records in a chain must share the same `workspace_id`
- no linked request, booking, occurrence, manual block, or commitment row may cross tenant boundaries

## 5. Access-control and visibility rules

Access control must be enforced at three layers:
- application/service authorization
- database row-level security
- query-level workspace filtering

Core access rule:
- a signed-in user may only access rows for workspaces where they have an active membership
- within that workspace, role determines action scope

### Owner permissions
Owner can:
- manage workspace settings
- invite/remove/suspend members
- assign roles
- manage all bookings, requests, manual blocks, shift templates, and shift occurrences
- manage public-share settings
- perform limited hard-conflict save only for:
  - Inquiry
  - Hold
  - Requested
  with:
  - explicit reason entry
  - confirmation
  - audit note

Owner cannot:
- bypass the rule that hard-conflicted items cannot advance to Assigned or Booked

### Manager Lite permissions
Manager Lite can:
- create and manage bookings, requests, manual blocks, shift templates, and shift occurrences within approved flows
- manage coverage/staffing workflows inside the workspace
- perform limited hard-conflict save only for:
  - Inquiry
  - Hold
  - Requested
  with:
  - explicit reason entry
  - confirmation
  - audit note

Manager Lite cannot:
- change workspace ownership
- weaken tenant policies
- bypass the rule that hard-conflicted items cannot advance to Assigned or Booked

### DJ member permissions
DJ member can access only allowed self-scoped workflow surfaces, such as:
- their own assigned bookings
- their own targeted requests
- their own manual availability blocks
- their own public-share settings
- their own schedule visibility surfaces

DJ member should not, by default, access:
- other DJs’ private schedule details
- unrelated booking request contents
- workspace-wide private booking internals
- member-management settings

Visibility rules that remain unchanged:
- Agenda = Bookings only
- Coverage = Shift Occurrences only
- public sharing uses only approved public-share projection data
- internal staffing eligibility uses private source-of-truth schedule logic
- “not shared” is not the same as “not eligible”

## 6. Cross-workspace isolation and projection rules

Cross-workspace isolation must be strict by default.

Rules:
- a raw operational row from one workspace must never be directly readable by another workspace’s users
- raw cross-workspace joins across bookings, requests, manual blocks, occurrences, or templates are not allowed
- raw public endpoints must never expose tenant rows

A single global auth user may belong to multiple workspaces, but those memberships remain independent. That means:
- same human, multiple memberships
- each membership has separate role, visibility, and profile context
- tenant-scoped operations always run through the active membership

Future-safe projection rule:
- if cross-workspace schedule projection is needed later, it must run through a **redacted projection layer**, not raw domain table access

Minimum projection design constraints:
- projection rows may contain only overlap-safe fields
- projection rows must not expose tenant-private detail
- projection rows must be derived from schedule_commitments or a controlled projection built from it

Allowed future projection content:
- interval start/end
- service day
- subject identity reference safe for the projection context
- hard-block / soft-review classification
- share mode classification
- optional coarse region if allowed

Disallowed projection content:
- private notes
- request content
- client names
- venue details beyond approved region sharing
- audit notes
- tenant-private workflow state beyond approved share-safe summaries

For this phase:
- no cross-workspace operator UI is required
- no cross-workspace scheduling console is required
- only the model boundary and projection-safe architecture must be established now

## 7. Public sharing boundary rules in a multi-user system

Public sharing remains projection-only and privacy-minimized.

Public shared viewer modes remain only:
- Busy
- Busy + Region

Public shared busy may include only:
- Assigned bookings
- Booked bookings
- Active Manual Availability Blocks

Public shared busy must exclude:
- Inquiry
- Hold
- Requested
- Booking Request detail
- Shift Templates
- Shift Occurrences
- private notes
- staffing notes
- customer contact info
- exact private venue details unless approved as coarse region in Busy + Region

Public sharing should be configured per workspace member profile or equivalent workspace-scoped schedule subject.

Minimum share model:
- one workspace member can have zero or more share tokens/configs
- one default active public share config is enough for this phase
- share tokens must be revocable
- share tokens must be rotatable
- public share settings must be workspace-scoped, not global-platform-scoped

Important multi-workspace rule:
- if the same human belongs to multiple workspaces, public busy should **not** automatically union across workspaces in this phase
- public sharing remains workspace-scoped unless a future explicit aggregation feature is approved

Public share generation rule:
- public output should be produced from a redacted projection/query over schedule_commitments and approved source objects
- public links must not expose raw table access or tenant-private joins

## 8. Migration path from personal beta to multi-user foundation

The migration path should preserve all existing product truths while introducing tenant structure.

### Step 1: create the first workspace
- create one workspace for the existing personal-beta owner
- create owner membership for the current user
- create workspace member profile for that owner

### Step 2: backfill workspace ownership
Add `workspace_id` to all core operational tables and backfill all current rows to the new owner workspace.

Tables include at minimum:
- bookings
- booking_requests
- manual_availability_blocks
- shift_templates
- shift_occurrences
- schedule_commitments
- public_share_configs
- audit tables

### Step 3: backfill subject identity
Add workspace-scoped subject references to schedule-bearing records.

Examples:
- owner’s existing Bookings assigned to owner membership/profile where applicable
- owner’s existing Manual Availability Blocks linked to owner subject reference
- owner’s schedule_commitments linked to owner subject reference

### Step 4: backfill actor metadata
Add:
- `created_by_membership_id`
- `updated_by_membership_id`

Where historical actor precision is unavailable, default legacy rows to owner membership.

### Step 5: introduce membership-aware auth
- require active workspace context after sign-in
- require membership checks for all authenticated app actions
- require workspace-scoped API execution

### Step 6: introduce row-level security
- apply workspace membership-based RLS to all tenant-owned tables
- block access to rows outside the active member’s workspace
- add role-based mutation checks

### Step 7: migrate public sharing
- move personal public share behavior onto workspace-scoped share configuration
- preserve current public visibility rules exactly
- rotate tokens if needed during migration

### Step 8: enable invite flow
- owner can invite Manager Lite and DJ members into the workspace
- invited users create or connect auth identity, then activate membership
- no tenant data becomes visible before membership activation

### Step 9: validate locked behavior after migration
Confirm that migration did not change:
- booking truth
- request linkage
- staffing integrity
- schedule integrity
- public-share privacy rules
- conflict advancement rules

## 9. Minimum schema, auth, and policy changes

### New tables
Minimum new tables:
- `workspaces`
- `workspace_memberships`
- `workspace_member_profiles`
- `workspace_invites`
- `public_share_configs` if not already modeled cleanly
- `membership_role_audit` or equivalent audit surface if not already covered elsewhere

### Required additions to existing core tables
Add:
- `workspace_id uuid not null`
- `created_by_membership_id uuid null initially, then constrained as appropriate`
- `updated_by_membership_id uuid null initially, then constrained as appropriate`

Where subject ownership exists, add:
- `subject_membership_id` or `subject_member_profile_id`
- `assigned_membership_id` on Bookings where staffing linkage exists
- `target_membership_id` on Booking Requests where a specific DJ is targeted

### Minimum constraints
- foreign keys from all membership references to workspace membership/profile tables
- check or enforcement logic that referenced membership belongs to same workspace as row
- uniqueness on `(workspace_id, user_id)` for active membership identity
- uniqueness on invite token / public share token
- non-null workspace ownership on all operational rows after migration complete

### Minimum auth changes
- authenticated session must resolve user identity
- app must require active workspace selection when user belongs to more than one workspace
- all mutations must derive acting membership from active workspace context
- service jobs must run with explicit workspace scope, never implicit global scope

### Minimum policy changes
- RLS on all tenant-owned domain tables
- active membership required for read access
- role-safe write policies for owner, manager_lite, and dj_member
- public token-based access only through share-safe projection endpoints
- no direct public access to core domain tables

### Minimum audit/policy events
Must log at minimum:
- membership invites accepted/revoked
- role changes
- workspace ownership changes when supported
- public share token creation/revocation/rotation
- limited hard-conflict saves with:
  - actor membership
  - object type
  - object id
  - reason
  - confirmation
  - timestamp

## 10. Definition of done for Phase [26]

Phase [26] is done when all of the following are true:

- a workspace exists as the enforced tenant boundary
- a global auth user can belong to one or more workspaces through separate memberships
- workspace owner, manager_lite, and dj_member roles are defined with clear action boundaries
- all core operational objects have required workspace ownership
- all schedule-subject references are workspace-scoped
- Booking remains the only calendar-truth object
- Manual Availability Blocks remain separate objects
- Booking Request, Shift Occurrence, and Booking remain separate objects
- Shift Templates and one-off Shift Occurrences remain separate
- Agenda remains Bookings only
- Coverage remains Shift Occurrences only
- schedule_commitments remains the normalized overlap surface
- public share output remains limited to Busy and Busy + Region
- public shared busy includes only:
  - Assigned bookings
  - Booked bookings
  - Active Manual Availability Blocks
- Inquiry, Hold, and Requested remain excluded from public shared busy
- internal staffing eligibility still uses private source-of-truth schedule logic
- “not shared” still does not mean “not eligible”
- hard-conflicted items still cannot advance to Assigned or Booked
- limited hard-conflict save remains restricted to DJ owner / Manager Lite and only for:
  - Inquiry
  - Hold
  - Requested
  with:
  - explicit reason entry
  - confirmation
  - audit note
- personal beta data can be migrated into a first owner workspace without breaking request linkage or schedule integrity
- no raw cross-workspace reads are possible
- future cross-workspace projection can be added later without redesigning core truth objects

## 11. Risks and tenant-boundary traps

### Using global user identity as the only schedule subject
This will blur tenant boundaries, make multi-workspace behavior ambiguous, and complicate future projection safety. Operational scheduling should anchor to workspace membership/profile identity.

### Forgetting to add workspace_id everywhere
Any missing workspace ownership column creates unsafe queries, weakens RLS, and increases the chance of accidental tenant leakage.

### Allowing cross-workspace foreign keys
This breaks isolation, makes migrations fragile, and creates hard-to-detect privacy leaks.

### Collapsing truth objects during multi-user expansion
If Booking, Booking Request, Manual Availability Block, Shift Template, or Shift Occurrence are merged conceptually or structurally, booking truth and staffing integrity will erode.

### Treating public sharing as direct table access
Public sharing must remain a redacted projection. Direct reads from private booking or scheduling tables risk privacy leaks.

### Letting “not shared” affect internal eligibility
This would violate locked product truth. Sharing visibility and staffing eligibility must remain separate systems.

### Allowing privileged users to bypass hard-conflict advancement rules
Owner and Manager Lite may use limited hard-conflict save only for Inquiry, Hold, and Requested. They must never advance hard-conflicted items into Assigned or Booked.

### Auto-aggregating public busy across multiple workspaces
This creates privacy surprises and can leak activity patterns across tenant boundaries. Keep public share workspace-scoped for now.

### Missing actor auditability
Without acting membership attribution, role changes, share changes, and conflict overrides become hard to investigate and unsafe to trust.

### Running background jobs without explicit workspace context
Jobs that generate occurrences, update request state, refresh share projections, or rebuild schedule_commitments must always carry explicit tenant scope or they may mix data across workspaces.
