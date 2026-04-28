-- 0016_member_availability_token.sql
-- Per-user public-share token. Mirrors the workspace-level
-- calendar_token from migration 0006, but scoped to a single
-- workspace_member so each user can share their own availability
-- without exposing teammates'.
--
-- The /share/[token] route looks up the member by this token,
-- enumerates their busy blocks, and renders an anonymized view
-- (busy/free only — no titles, venues, pay, or notes).
--
-- Treat as a secret. Rotate to invalidate old links.
--
-- Idempotent: re-running is safe.

begin;

alter table public.workspace_members
  add column if not exists availability_token text;

-- Unique partial index — only enforce uniqueness when a token is set.
create unique index if not exists workspace_members_availability_token_unique
  on public.workspace_members (availability_token)
  where availability_token is not null;

comment on column public.workspace_members.availability_token is
  'Per-user public-share token for /share/[token]. Renders an '
  'anonymized availability calendar (busy/free only). Rotate to '
  'invalidate old links.';

commit;
