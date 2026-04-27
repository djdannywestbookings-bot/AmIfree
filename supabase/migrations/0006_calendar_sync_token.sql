-- 0006_calendar_sync_token.sql
-- Phase 34 — Per-workspace iCal subscription token.
--
-- Goal: every workspace gets a stable, hard-to-guess token. The
-- public route /api/calendar/{token} returns a .ics feed of every
-- booking in that workspace. Users paste the URL into Google
-- Calendar, Apple Calendar, or Outlook — those apps poll the URL
-- on a schedule and surface AmIFree bookings as events alongside
-- everything else on their calendar.
--
-- Security model:
--   - The token is a 32-char random hex string. ~128 bits of
--     entropy — practically unguessable.
--   - Anyone with the URL can read the calendar. Treat as a
--     bearer secret. Owners can rotate from Settings if exposed.
--   - The token grants READ ONLY of busy-time data. No mutate
--     surface, no PII beyond what's already in the booking row
--     (title, venue address, notes).
--   - The /api/calendar route uses the service-role admin client
--     to bypass RLS — it has no Supabase session because it's
--     called by Google/Apple/Outlook with no auth header.
--
-- Locked truths references:
--   docs/source-of-truth.md §Locked multi-user and tenant-boundary
--   truths — workspace remains the tenant boundary; the token is
--   workspace-scoped.

begin;

alter table public.workspaces
  add column if not exists calendar_token text;

-- Backfill tokens for any workspace that doesn't have one yet.
-- gen_random_uuid() is built into modern Postgres / Supabase. We
-- strip the dashes to get a 32-char hex.
update public.workspaces
   set calendar_token = replace(gen_random_uuid()::text, '-', '')
 where calendar_token is null;

alter table public.workspaces
  alter column calendar_token set not null,
  alter column calendar_token set default replace(gen_random_uuid()::text, '-', ''),
  add constraint workspaces_calendar_token_unique unique (calendar_token);

comment on column public.workspaces.calendar_token is
  'Per-workspace bearer token for the public iCal feed. '
  'Anyone with the token can subscribe to the workspace calendar. '
  'Rotate from Settings if exposed.';

-- Grants stay as-is (already covered by 0003). The token is read
-- from the admin client (bypasses RLS), so no RLS policy change
-- needed. Owners viewing/rotating their token go through the
-- normal RLS-checked workspaces row.

commit;
