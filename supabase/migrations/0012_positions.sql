-- 0012_positions.sql
-- Phase 39 — Positions (job titles employees can hold).
--
-- A position is a job title — DJ, Bartender, Sound Tech, MC, etc.
-- Positions are workspace-scoped. Each employee can hold multiple
-- positions (a person can be both Bartender + MC). Each position
-- can be held by multiple employees. → many-to-many.
--
-- Future (deferred):
--   - Position-required slot on bookings ("this gig needs a DJ")
--   - Position-default pay rate (overrides employee.default_pay_rate)
--   - Filter assignee dropdown by position-required
--   - Groups: ad-hoc tags orthogonal to positions

begin;

-- ---------------------------------------------------------------------
-- positions
-- ---------------------------------------------------------------------

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  -- 7-char hex like the venue color, used for pill backgrounds.
  color text null check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, name)
);

comment on table public.positions is
  'Workspace-scoped job titles. Employees may hold many positions; '
  'positions may be held by many employees (m2m via employee_positions). '
  'Phase 39+ will add position-required slot to bookings.';

create index if not exists positions_workspace_idx on public.positions(workspace_id);

alter table public.positions enable row level security;

-- updated_at trigger reuses set_updated_at function from 0002.
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'positions_set_updated_at'
  ) then
    create trigger positions_set_updated_at
      before update on public.positions
      for each row execute function public.set_updated_at();
  end if;
end$$;

-- ---------------------------------------------------------------------
-- employee_positions (m2m)
-- ---------------------------------------------------------------------

create table if not exists public.employee_positions (
  workspace_member_id uuid not null
    references public.workspace_members(id) on delete cascade,
  position_id uuid not null
    references public.positions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (workspace_member_id, position_id)
);

comment on table public.employee_positions is
  'Join table: which employees hold which positions. Both sides cascade '
  'on delete so removing an employee or a position cleans up cleanly.';

create index if not exists employee_positions_member_idx
  on public.employee_positions(workspace_member_id);
create index if not exists employee_positions_position_idx
  on public.employee_positions(position_id);

alter table public.employee_positions enable row level security;

-- ---------------------------------------------------------------------
-- RLS — same membership pattern as venues / bookings.
-- ---------------------------------------------------------------------

drop policy if exists positions_select_for_members on public.positions;
create policy positions_select_for_members
  on public.positions
  for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = positions.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists positions_insert_for_members on public.positions;
create policy positions_insert_for_members
  on public.positions
  for insert
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = positions.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists positions_update_for_members on public.positions;
create policy positions_update_for_members
  on public.positions
  for update
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = positions.workspace_id
        and wm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = positions.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists positions_delete_for_members on public.positions;
create policy positions_delete_for_members
  on public.positions
  for delete
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = positions.workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- employee_positions doesn't have its own workspace_id; we gate by
-- joining to positions.workspace_id.

drop policy if exists employee_positions_select_for_members on public.employee_positions;
create policy employee_positions_select_for_members
  on public.employee_positions
  for select
  using (
    exists (
      select 1
      from public.positions p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = employee_positions.position_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists employee_positions_write_for_members on public.employee_positions;
create policy employee_positions_write_for_members
  on public.employee_positions
  for all
  using (
    exists (
      select 1
      from public.positions p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = employee_positions.position_id
        and wm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.positions p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = employee_positions.position_id
        and wm.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Grants — same fix pattern as 0003 / 0005.
-- ---------------------------------------------------------------------

grant all on table public.positions
  to anon, authenticated, service_role;
grant all on table public.employee_positions
  to anon, authenticated, service_role;

commit;
