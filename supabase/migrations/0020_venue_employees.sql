-- 0020_venue_employees.sql
-- Many-to-many between venues and employees. When a booking has a
-- venue, the Assigned-to dropdown filters to employees who are
-- eligible at that venue.
--
-- Idempotent: re-running is safe.

begin;

create table if not exists public.venue_employees (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  venue_id uuid not null references public.venues(id) on delete cascade,
  employee_id uuid not null references public.workspace_members(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists venue_employees_venue_employee_unique
  on public.venue_employees (venue_id, employee_id);
create index if not exists venue_employees_employee_idx
  on public.venue_employees (employee_id);
create index if not exists venue_employees_workspace_idx
  on public.venue_employees (workspace_id);

alter table public.venue_employees enable row level security;

drop policy if exists venue_employees_member_select on public.venue_employees;
create policy venue_employees_member_select
  on public.venue_employees for select
  using (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = venue_employees.workspace_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists venue_employees_owner_write on public.venue_employees;
create policy venue_employees_owner_write
  on public.venue_employees for all
  using (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = venue_employees.workspace_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'manager_lite')
    )
  )
  with check (
    exists (
      select 1 from public.workspace_members m
      where m.workspace_id = venue_employees.workspace_id
        and m.user_id = auth.uid()
        and m.role in ('owner', 'manager_lite')
    )
  );

comment on table public.venue_employees is
  'Eligibility join — which employees can be assigned to which venue. '
  'The booking form''s assignee dropdown filters by this when a venue '
  'is selected.';

commit;
