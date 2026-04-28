-- 0014_member_home_address.sql
-- Add a free-form home_address column to workspace_members so the
-- profile section in /settings can persist it.
--
-- Idempotent: re-running is safe.

begin;

alter table public.workspace_members
  add column if not exists home_address text;

comment on column public.workspace_members.home_address is
  'Free-form home/mailing address. Optional. Used on the profile '
  'settings page; not surfaced anywhere public.';

commit;
