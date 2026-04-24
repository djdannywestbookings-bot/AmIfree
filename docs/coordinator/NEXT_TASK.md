# Next Task

_Phase 22 code foundation complete (slices 1–16). Post-slice ops steps 1–3 completed 2026-04-20. Steps 4–6 remain before merge._

## Completed (2026-04-20)
- ✅ `schedule_commitments` migration applied to `amifree-dev` via SQL Editor
- ✅ Database password rotated; new value written to `.env.local` (`DATABASE_URL` + `GRAPHILE_WORKER_DATABASE_URL`)
- ✅ `GRAPHILE_WORKER_DATABASE_URL` swapped to Supabase Session pooler URI (port 5432)

## Remaining

1. **Verify the dev loop still works** with the new password. Run `npm run dev`, sign in, land on `/agenda`. If it fails, the new password didn't propagate somewhere.
2. **Execute `docs/ops/deploy-runbook.md`** to provision `amifree-prod` + Vercel + Railway. Closes DoD items 3 and 6. Rotate the `service_role` key *during* this step by migrating to the new `sb_publishable_` / `sb_secret_` keys (see `OPEN_RISKS.md` — SDK compatibility check required).
3. **Smoke-test production.** Sign in at the Vercel URL, click through Agenda / Coverage / Intake / Settings, hit `/api/health` → expect `{"ok":true,"env":"private_beta"}`.
4. **Merge `feat/v0.1-rebuild` → `main`.** Reference `docs/phases/22-acceptance-memo.md` in the merge note.

## After merge

Phase 23 can begin planning. Runtime, auth, deployment, and directory structure are settled. The foundation supports domain work without re-deciding infra.

Suggested Phase 23 framing (non-binding): domain implementation wave — start with `schedule_commitments` schema expansion plus the first Booking CRUD surface on `/agenda`. Source-of-truth for scope: `docs/source-of-truth.md` + `docs/phases/12-v1-post-mvp-prioritization.md`.
