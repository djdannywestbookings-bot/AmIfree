-- 0007_workspace_timezone.sql
-- Phase 36.5 — Workspace-level timezone.
--
-- The Phase 24 booking schema stored start_at as ISO 8601 with offset.
-- Manual form entry worked correctly because browsers convert local
-- wall-clock to UTC automatically. AI extraction broke it because
-- gpt-4o-mini, given a booking text like "10pm at Bucks", had no
-- timezone context and emitted "T22:00:00Z" (UTC). When subscribed
-- to Google Calendar the times shifted backwards by 5–6 hours.
--
-- This migration adds a workspace-level timezone string. Phase 36.5
-- code:
--   - Tells the AI extractor which timezone to anchor ambiguous
--     times to.
--   - Surfaces a timezone picker in Settings.
--
-- Default: America/Chicago (current owner is in TX). Future: pick on
-- onboarding from the user's browser-detected timezone.

begin;

alter table public.workspaces
  add column if not exists timezone text not null default 'America/Chicago'
    check (timezone <> '');

comment on column public.workspaces.timezone is
  'IANA timezone name (e.g. America/Chicago, America/New_York). Used '
  'by the AI extractor to anchor ambiguous times in pasted booking '
  'text, and by display logic when the viewer is not in the same TZ '
  'as the workspace.';

commit;
