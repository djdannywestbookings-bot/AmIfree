-- 0009_employees_extension.sql
-- Phase 38 — Multi-user employees + invitations.
--
-- Phase 24A locked workspace_members as a thin grant table: just
-- workspace_id + user_id + role. Phase 38 needs richer profile data
-- (name, email, phone) and an invitation lifecycle (pending → joined)
-- so an owner can add an employee before that person has signed up.
--
-- We extend workspace_members in place rather than spinning up a new
-- table. One row per person per workspace; pending invites have
-- email but no user_id, joined members have both.
--
-- New role: 'employee'. Existing 'owner' and 'manager_lite' stay
-- valid. App-side policy treats manager_lite ≈ manager for now;
-- we'll rename later if needed.
--
-- Locked truths references:
--   docs/source-of-truth.md §Locked role truths — additive only.
--   docs/source-of-truth.md §Locked multi-user and tenant-boundary
--   truths — workspace remains the tenant boundary.

begin;

-- 1. Allow user_id to be nullable (pending invites have email only).
alter table public.workspace_members
  alter column user_id drop not null;

-- 2. Add profile + lifecycle columns.
alter table public.workspace_members
  add column if not exists email text,
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists status text not null default 'joined'
    check (status in ('pending', 'joined', 'disabled')),
  add column if not exists invited_at timestamptz,
  add column if not exists joined_at timestamptz default now();

-- 3. Update role check to include 'employee'. Drop old constraint
--    and re-add. (Postgres doesn't support adding to an existing
--    check constraint in place.)
alter table public.workspace_members
  drop constraint if exists workspace_members_role_check;
alter table public.workspace_members
  add constraint workspace_members_role_check
    check (role in ('owner', 'manager_lite', 'employee'));

-- 4. Backfill: existing rows are joined owners with no email.
update public.workspace_members
   set status = 'joined',
       joined_at = coalesce(joined_at, created_at)
 where status is null or joined_at is null;

-- 5. Either user_id is set (joined or disabled) or email is set
--    (pending). Both can be set once accepted.
alter table public.workspace_members
  drop constraint if exists workspace_members_user_or_email_required;
alter table public.workspace_members
  add constraint workspace_members_user_or_email_required
    check (user_id is not null or email is not null);

-- 6. Per-workspace email uniqueness so we don't double-invite.
--    Partial index — only enforce when email is non-null.
create unique index if not exists workspace_members_workspace_email_unique
  on public.workspace_members (workspace_id, lower(email))
  where email is not null;

-- 7. Drop the old (workspace_id, user_id) unique. Replace with a
--    partial unique that only kicks in when user_id is non-null,
--    so multiple pending email-only invites don't collide on
--    (workspace_id, null).
alter table public.workspace_members
  drop constraint if exists workspace_members_workspace_id_user_id_key;
create unique index if not exists workspace_members_workspace_user_unique
  on public.workspace_members (workspace_id, user_id)
  where user_id is not null;

-- 8. Helpful indexes for the /employees list query.
create index if not exists workspace_members_workspace_status_idx
  on public.workspace_members (workspace_id, status);

comment on column public.workspace_members.email is
  'Required for pending invites (no user_id yet). Set on joined '
  'members too so the /employees list can render contact info.';
comment on column public.workspace_members.status is
  'pending = invited but not signed in yet; joined = active; '
  'disabled = revoked but kept for audit.';

commit;
