-- 0010_booking_assigned_employee.sql
-- Phase 40 — Shift assignments.
--
-- Phase 38 added employees (workspace_members rows with profile +
-- pending status). Phase 40 connects bookings to specific employees:
--   - Owner picks an employee on the booking form (or leaves blank)
--   - That employee sees the shift on their My Calendar
--   - Calendar pill shows whose shift it is
--
-- One assignee per booking is enough for the MVP. Multi-assignee
-- (e.g., a Saturday with a DJ AND a sound tech) is a Phase 42+ idea.

begin;

alter table public.bookings
  add column if not exists assigned_employee_id uuid null
    references public.workspace_members(id) on delete set null;

comment on column public.bookings.assigned_employee_id is
  'Optional FK to workspace_members. When set, the booking is assigned '
  'to that employee — they see it on My Calendar and the calendar pill '
  'shows their initials. Owner-only writable in Phase 40.';

create index if not exists bookings_assigned_employee_idx
  on public.bookings (assigned_employee_id)
  where assigned_employee_id is not null;

commit;
