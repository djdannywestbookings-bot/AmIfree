-- 0013_time_punches.sql
-- Phase 42 — Time clock + timesheet.
--
-- Each shift can collect zero or more time punches: a clock-in / clock-out
-- pair captures the actual time the assigned employee worked. We compare
-- actuals against scheduled (booking.start_at/end_at) to compute actual
-- hours, overtime, and the Sling-style labor % stat.
--
-- One open punch per (workspace_member_id) at a time — enforced as a
-- partial unique index where clocked_out_at IS NULL. That prevents
-- accidentally double-clocking-in.
--
-- A punch belongs to a booking optionally; bookings.id ON DELETE SET
-- NULL preserves the punch history if a booking is later removed
-- (audit / payroll integrity).

begin;

create table if not exists public.time_punches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,
  workspace_member_id uuid not null
    references public.workspace_members(id) on delete cascade,
  booking_id uuid null
    references public.bookings(id) on delete set null,
  clocked_in_at timestamptz not null default now(),
  clocked_out_at timestamptz null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Sanity: end after start when both set.
  constraint time_punches_out_after_in
    check (clocked_out_at is null or clocked_out_at > clocked_in_at)
);

comment on table public.time_punches is
  'Actual clock-in / clock-out records per employee, optionally tied '
  'to a booking. Compared against booking.start_at/end_at at read time '
  'to compute actual hours and overtime.';

create index if not exists time_punches_workspace_idx
  on public.time_punches(workspace_id);
create index if not exists time_punches_member_idx
  on public.time_punches(workspace_member_id);
create index if not exists time_punches_booking_idx
  on public.time_punches(booking_id);

-- One open punch per employee at a time.
create unique index if not exists time_punches_one_open_per_member
  on public.time_punches(workspace_member_id)
  where clocked_out_at is null;

alter table public.time_punches enable row level security;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'time_punches_set_updated_at') then
    create trigger time_punches_set_updated_at
      before update on public.time_punches
      for each row execute function public.set_updated_at();
  end if;
end$$;

-- ---------------------------------------------------------------------
-- RLS — same membership pattern as bookings.
-- ---------------------------------------------------------------------

drop policy if exists time_punches_select_for_members on public.time_punches;
create policy time_punches_select_for_members
  on public.time_punches for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = time_punches.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists time_punches_insert_for_members on public.time_punches;
create policy time_punches_insert_for_members
  on public.time_punches for insert
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = time_punches.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists time_punches_update_for_members on public.time_punches;
create policy time_punches_update_for_members
  on public.time_punches for update
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = time_punches.workspace_id
        and wm.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = time_punches.workspace_id
        and wm.user_id = auth.uid()
    )
  );

drop policy if exists time_punches_delete_for_members on public.time_punches;
create policy time_punches_delete_for_members
  on public.time_punches for delete
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = time_punches.workspace_id
        and wm.user_id = auth.uid()
    )
  );

grant all on table public.time_punches to anon, authenticated, service_role;

commit;
