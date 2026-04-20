-- 0001_reserve_schedule_commitments.sql
-- Phase 22 — Canonical Beta Foundation.
--
-- Reserves `schedule_commitments` as a first-class normalized overlap
-- surface. Phase 22 §Data access and backend wiring is explicit that this
-- surface "must be treated as a first-class normalized backend surface
-- from the start, even if its full business logic lands in later phases."
--
-- This migration reserves the name, primary key, timestamp columns, and
-- enables row-level security with a deny-by-default posture (no policies
-- yet). Subsequent phases add:
--   • workspace scoping (workspace_id FK to workspaces)
--   • source linkage (source_type enum + source_id pointing at the
--     originating Booking / Manual Availability Block / future surfaces)
--   • effective window (starts_at / ends_at as timestamptz)
--   • hardness flag distinguishing hard-assignment blockers from
--     possible-conflict review signals
--   • workspace-scoped policies on read + write paths
--
-- See:
--   docs/source-of-truth.md          §Locked technical, data, and platform truths
--   docs/phases/22-canonical-beta-foundation.md §Data access and backend wiring
--   docs/phases/v0.1-rebuild-execution-plan.md  Wave C slice 10

create extension if not exists "pgcrypto";

create table public.schedule_commitments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.schedule_commitments is
  'Normalized overlap surface. Phase 22 reservation stub. Full schema '
  'evolves in Phase 23+. See docs/source-of-truth.md for locked truths.';

alter table public.schedule_commitments enable row level security;

-- No policies defined here. The table is inaccessible to clients until
-- later phases add workspace-scoped read and write policies.
