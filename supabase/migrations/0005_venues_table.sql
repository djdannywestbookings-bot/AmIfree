-- 0005_venues_table.sql
-- Phase 28 — Venues as a structured first-class concept.
--
-- Phase 24 stored venue/location as a free-form `bookings.location`
-- text column. Phase 28 owner feedback: a working scheduler needs a
-- saved venue list with name + address that the owner picks from a
-- dropdown, not a re-typed text field on every booking.
--
-- This migration adds:
--   venues                — workspace-scoped venue records
--   bookings.venue_id     — nullable FK to venues
--
-- The legacy bookings.location text column stays in place. It serves
-- two purposes:
--   1) Backwards compatibility for bookings already created without
--      venue linkage.
--   2) A free-form fallback for one-off events that don't justify a
--      saved venue (corporate gigs in random hotels, etc.).
--
-- The app form prefers venue_id when present and falls back to
-- displaying location text otherwise.
--
-- Locked truths references:
--   docs/source-of-truth.md §Locked multi-user and tenant-boundary
--   truths — workspace is the tenant boundary; venues are
--   workspace-owned.

begin;

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  address text null,
  -- Optional brand color per venue, stored as a 7-char hex string.
  -- Renders as a dot/swatch on schedule views to tell venues apart.
  color text null check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Within a workspace, venue names should be unique so the dropdown
  -- doesn't show duplicates. Case-insensitive enforcement.
  unique (workspace_id, name)
);

comment on table public.venues is
  'Workspace-scoped venue records. Bookings link to venues via '
  'bookings.venue_id when the venue is from the saved list; one-off '
  'events use the legacy bookings.location text field instead.';

create index venues_workspace_idx on public.venues(workspace_id);

alter table public.venues enable row level security;

-- updated_at trigger reuses the function from 0002.
create trigger venues_set_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- bookings.venue_id
-- ---------------------------------------------------------------------

alter table public.bookings
  add column if not exists venue_id uuid null
    references public.venues(id) on delete set null;

comment on column public.bookings.venue_id is
  'Optional FK to venues. When set, takes precedence over the legacy '
  'bookings.location text field. When null, bookings.location holds '
  'the freeform venue string.';

create index bookings_venue_idx on public.bookings(venue_id);

-- ---------------------------------------------------------------------
-- RLS policies — same membership pattern as workspaces / bookings
-- ---------------------------------------------------------------------

create policy venues_select_for_members
  on public.venues
  for select
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = venues.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy venues_insert_for_members
  on public.venues
  for insert
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = venues.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy venues_update_for_members
  on public.venues
  for update
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = venues.workspace_id
        and wm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = venues.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy venues_delete_for_members
  on public.venues
  for delete
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = venues.workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Grants — same fix pattern as 0003 (default privileges don't always
-- apply to tables created via SQL Editor inside a transaction).
-- ---------------------------------------------------------------------

grant all on table public.venues
  to anon, authenticated, service_role;

commit;
