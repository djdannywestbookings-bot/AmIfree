-- 0015_default_calendar_view.sql
-- Per-user default calendar view (1, 3, 6, or 12 months). Powers the
-- "Default calendar view" preference on /settings — the calendar
-- surface uses this as a fallback when the URL has no ?view=… param.
--
-- Idempotent: re-running is safe.

begin;

alter table public.workspace_members
  add column if not exists default_calendar_view smallint;

-- Drop and re-add the check constraint so re-runs are clean.
alter table public.workspace_members
  drop constraint if exists workspace_members_default_calendar_view_check;
alter table public.workspace_members
  add constraint workspace_members_default_calendar_view_check
    check (
      default_calendar_view is null
      or default_calendar_view in (1, 3, 6, 12)
    );

comment on column public.workspace_members.default_calendar_view is
  'User preference for the default /calendar view: 1 (month), 3, 6, '
  'or 12. Null means use the app default (1).';

commit;
