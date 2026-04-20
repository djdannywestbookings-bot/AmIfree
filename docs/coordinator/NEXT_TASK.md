# Next Task

_Phase 22 code foundation complete (slices 1–16). Owner operational steps remain before merge._

## Immediate (owner, in order)

1. **Apply the schedule_commitments migration** to `amifree-dev`.
   - Supabase dashboard → SQL Editor → paste contents of `supabase/migrations/0001_reserve_schedule_commitments.sql` → Run.
2. **Rotate leaked credentials** on `amifree-dev`.
   - Settings → Database → Reset database password. Update `DATABASE_URL` / `GRAPHILE_WORKER_DATABASE_URL` in `.env.local`.
   - Settings → API → Generate new `service_role` secret. Update `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
3. **Swap `GRAPHILE_WORKER_DATABASE_URL` to the Session pooler URI** so the worker can use LISTEN/NOTIFY. Settings → Database → Connection string → Direct tab → Session pooler.
4. **Execute `docs/ops/deploy-runbook.md`** to stand up `amifree-prod` on Vercel + Railway + second Supabase project. Closes DoD items 3 and 6.
5. **Smoke-test production.** Sign in at the Vercel URL, click through the four app surfaces, hit `/api/health` → expect `{"ok":true,"env":"private_beta"}`.
6. **Merge `feat/v0.1-rebuild` → `main`.** Reference `docs/phases/22-acceptance-memo.md` in the merge note.

## After merge

Phase 23 can begin planning. Runtime, auth, deployment, and directory structure are settled. The foundation supports domain work without re-deciding infra.

Suggested Phase 23 framing (non-binding): domain implementation wave — start with `schedule_commitments` schema expansion plus the first Booking CRUD surface on `/agenda`. Source-of-truth for scope: `docs/source-of-truth.md` + `docs/phases/12-v1-post-mvp-prioritization.md`.
