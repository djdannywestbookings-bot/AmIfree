-- 0003_grant_workspace_booking_access.sql
-- Phase 24B hotfix — table-level grants for the workspace/booking tables.
--
-- Root cause: when the 0002 migration created workspaces, workspace_members,
-- and bookings inside a transaction via the SQL Editor, Supabase's default
-- privileges did not apply. The three tables ended up with table-level
-- privileges granted only to the `postgres` role and partial privileges
-- (REFERENCES / TRIGGER / TRUNCATE) to `anon` and `authenticated`. The
-- `service_role` role had no direct grants at all.
--
-- Consequence: the createWorkspace server action (which connects with
-- the service-role key via @/lib/supabase/admin) tried to INSERT into
-- workspaces and Postgres returned 42501 "permission denied for table
-- workspaces". Although service_role has BYPASSRLS, it still requires
-- table-level privileges to operate on a relation.
--
-- This migration restores the expected Supabase convention: anon,
-- authenticated, and service_role each get ALL privileges on the three
-- new tables. Row-level filtering for anon/authenticated is still
-- enforced by the RLS policies landed in 0002.
--
-- Applied manually to amifree-dev and amifree-prod 2026-04-24.

begin;

grant all on table public.workspaces
  to anon, authenticated, service_role;

grant all on table public.workspace_members
  to anon, authenticated, service_role;

grant all on table public.bookings
  to anon, authenticated, service_role;

commit;
