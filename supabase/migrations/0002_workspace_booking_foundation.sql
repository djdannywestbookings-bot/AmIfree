-- 0002_workspace_booking_foundation.sql
-- Phase 24A — Workspace + Booking data layer.
--
-- Three tables:
--   workspaces           — tenant boundary, per-workspace service_day_mode
--   workspace_members    — membership (role: owner | manager_lite)
--   bookings             — the only calendar-truth object
--
-- RLS: every row is workspace-scoped. Reads/writes are gated by
-- workspace_members membership of the authenticated user. Policies are
-- additive; future migrations can layer extra gates (manager_lite read
-- restrictions, public sharing projections, etc.) without rewriting
-- these.
--
-- Not in this migration (deferred to later Phase 24 slices):
--   - schedule_commitments population (Phase 22 reservation stub remains
--     empty; 24D wires bookings → schedule_commitments)
--   - booking_requests, shift_templates, shift_occurrences
--   - manual_availability_blocks
--   - audit log table
--
-- Locked source-of-truth references:
--   docs/source-of-truth.md §Locked multi-user and tenant-boundary truths
--   docs/source-of-truth.md §Booking lifecycle states
--   docs/source-of-truth.md §Locked role truths
--   docs/source-of-truth.md §Locked technical, data, and platform truths
--     (service_day_mode)

begin;

-- ---------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service_day_mode text not null
    check (service_day_mode in ('standard', 'nightlife'))
    default 'standard',
  -- When service_day_mode = 'nightlife', the service day ends at this hour
  -- (local venue time). Ignored when service_day_mode = 'standard'.
  nightlife_cutoff_hour smallint not null
    check (nightlife_cutoff_hour between 0 and 12)
    default 6,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.workspaces is
  'Tenant boundary. Every operational row is workspace-owned. '
  'service_day_mode determines calendar anchoring for cross-midnight '
  'bookings (standard = midnight cutoff, nightlife = configurable '
  'nightlife_cutoff_hour, default 6am local).';

create index workspaces_owner_idx on public.workspaces(owner_user_id);

alter table public.workspaces enable row level security;

-- ---------------------------------------------------------------------
-- workspace_members
-- ---------------------------------------------------------------------

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null
    check (role in ('owner', 'manager_lite')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

comment on table public.workspace_members is
  'Membership grants access to a workspace. role matches AppRole in '
  'src/server/policies/roles.ts. Phase 24A has owner only; manager_lite '
  'is reserved scaffolding and not assignable via app flows yet.';

create index workspace_members_user_idx on public.workspace_members(user_id);
create index workspace_members_workspace_idx on public.workspace_members(workspace_id);

alter table public.workspace_members enable row level security;

-- ---------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,

  title text not null,

  -- Lifecycle per docs/source-of-truth.md §Booking lifecycle states.
  -- Alert states (Hard Conflict / Possible Conflict / Missing Info /
  -- Time TBD) are NOT stored here — they are computed.
  status text not null
    check (status in ('inquiry','hold','requested','assigned','booked','completed','cancelled'))
    default 'inquiry',

  -- start_at and end_at can both be null — represents Time TBD alert
  -- state at the app layer. When both are set, end_at must be > start_at.
  start_at timestamptz null,
  end_at timestamptz null,
  all_day boolean not null default false,

  -- service_day is the date this booking anchors to per the workspace's
  -- service_day_mode. Stored (not computed) so queries stay simple and
  -- the app-layer anchoring rule is the single source of truth.
  -- Null until the booking has a start_at the app can anchor.
  service_day date null,

  notes text null,

  -- Who created the booking, for audit purposes. null if created by a
  -- system process (intake pipeline, etc. — not in 24A).
  created_by uuid null references auth.users(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_time_range_ok
    check (start_at is null or end_at is null or end_at > start_at)
);

comment on table public.bookings is
  'The only calendar-truth object. Phase 24A supports manual create. '
  'Intake Drafts (Phase 24+) stage Booking creation via review-before-'
  'save. Alert states (Hard Conflict, Possible Conflict, Missing Info, '
  'Time TBD) are computed at the app layer, not stored.';

create index bookings_workspace_idx on public.bookings(workspace_id);
create index bookings_workspace_status_idx on public.bookings(workspace_id, status);
create index bookings_workspace_service_day_idx on public.bookings(workspace_id, service_day);
create index bookings_workspace_start_at_idx on public.bookings(workspace_id, start_at);

alter table public.bookings enable row level security;

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

create trigger workspace_members_set_updated_at
  before update on public.workspace_members
  for each row execute function public.set_updated_at();

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------
--
-- Pattern: every read/write requires the authenticated user to be a
-- member of the row's workspace. Membership is evaluated via an EXISTS
-- subquery on workspace_members. Policies avoid recursion by never
-- applying a workspace_members policy that references workspace_members.

-- workspace_members: members can read their own membership rows. Owner
-- membership is created as part of createWorkspace in the app layer
-- (uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS for the first insert).
-- No direct insert/update/delete from authenticated role in 24A.
create policy workspace_members_select_self
  on public.workspace_members
  for select
  using (user_id = auth.uid());

-- workspaces: any member of the workspace can read it. Only the owner
-- can update workspace settings (service_day_mode etc). Deletes are
-- disabled from the authenticated role (destructive ops go through
-- service role + audit).
create policy workspaces_select_for_members
  on public.workspaces
  for select
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = workspaces.id
        and wm.user_id = auth.uid()
    )
  );

create policy workspaces_update_for_owner
  on public.workspaces
  for update
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = workspaces.id
        and wm.user_id = auth.uid()
        and wm.role = 'owner'
    )
  )
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = workspaces.id
        and wm.user_id = auth.uid()
        and wm.role = 'owner'
    )
  );

-- bookings: any member of the workspace can read and write. Future
-- migrations will split read/write by role (e.g., manager_lite cannot
-- move bookings out of certain states) but 24A is owner-only in
-- practice so the simpler policy is fine.
create policy bookings_select_for_members
  on public.bookings
  for select
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = bookings.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy bookings_insert_for_members
  on public.bookings
  for insert
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = bookings.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy bookings_update_for_members
  on public.bookings
  for update
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = bookings.workspace_id
        and wm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = bookings.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy bookings_delete_for_members
  on public.bookings
  for delete
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = bookings.workspace_id
        and wm.user_id = auth.uid()
    )
  );

commit;
