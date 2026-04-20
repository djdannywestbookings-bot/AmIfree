# Execution Log

## Branch: feat/v0.1-rebuild (from feat/mvp-shell)

### Pre-rebuild prep (on feat/mvp-shell)
- `248c5e9` Tear down shadcn scaffold; rewrite README as SPA prototype

### Support (on feat/v0.1-rebuild, before slice 1)
- `3d346dd` chore: add wrangler 4.84.0 as devDependency — superseded by slice 1
- `c53d91c` docs: add v0.1 rebuild execution plan

### Wave A — Repo restructure
- `b386cf2` Slice 1: uninstall wrangler (not in locked stack)
- `f8473cd` Slice 2: archive Vite SPA to `archive/vite-shell/` (30 files renamed via git mv, 100% similarity preserved)
- `0ace296` Slice 3: scaffold Next.js App Router at repo root (Next 15 + React 19 + TS 5 + Tailwind 3)
- `a4d3bd2` Slice 4: canonical folder structure (16 barrels + 14 .gitkeep placeholders)

### Wave B — Config + Auth + Shell
- `8fe4f3f` Slice 5: config loader (env.server + env.public zod-validated) + `.env.local.example`
- `c6bb6ae` Slice 6: Supabase clients (browser / server / admin)
- `59a408f` Slice 7: owner-only email OTP auth — middleware, login page, server actions, `/agenda` placeholder
- `1ead658` Slice 8: protected shell — `(app)/layout.tsx`, Coverage / Intake / Settings placeholders, loading + error boundaries, Settings sign-out
- `d927c58` Slice 9: role scaffolding — `roles.ts` (dj_owner active, manager_lite reserved), `current-actor.ts`, layout refactor

### Pending
- **Smoke test:** owner runs sign-in flow end-to-end against `amifree-dev` Supabase project
- **Wave C:** slices 10–13 (migrations, worker, OpenAI adapter, health endpoint)
- **Wave D:** slices 14–16 (PWA baseline, deploy + env separation, Phase 22 DoD acceptance pass)

### Notable snags during execution (for pattern tracking)
- Sandbox filesystem mount cannot delete files → every git op from sandbox left stale `.lock` files. Resolved by owner running git ops from own terminal and clearing locks before each invocation.
- Supabase rolled out new `publishable` / `secret` API keys; `@supabase/ssr@0.10.2` still uses legacy `anon` / `service_role`. Owner pointed at Legacy tab in API settings.
- Next.js inferred `~/pnpm-lock.yaml` as workspace root. Fixed by pinning `outputFileTracingRoot: __dirname` in `next.config.ts`.
- Initial `npm install -g wrangler` hit EACCES on `/usr/local/lib/node_modules` (system Node owned by root). Switched to devDependency install, then removed entirely in slice 1.
- Owner pasted database password and `service_role` key into chat. Rotation recommended; deferred by owner until post-Phase-22.
