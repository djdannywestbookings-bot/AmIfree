# Asset Index

## Coordinator documents (this set)
- `docs/coordinator/MASTER_BRIEF.md`
- `docs/coordinator/LOCKED_DECISIONS.md`
- `docs/coordinator/OPEN_RISKS.md`
- `docs/coordinator/ASSET_INDEX.md`
- `docs/coordinator/NEXT_TASK.md`
- `docs/coordinator/EXECUTION_LOG.md`

## Project-level planning docs
- `docs/source-of-truth.md`
- `docs/roadmap.md`
- `docs/phases/22-canonical-beta-foundation.md`
- `docs/phases/v0.1-rebuild-execution-plan.md`

## Runtime code (Phase 22 foundation, as of slice 9)

### Routes
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `src/app/(public)/login/page.tsx` + `actions.ts`
- `src/app/(app)/layout.tsx`, `loading.tsx`, `error.tsx`
- `src/app/(app)/agenda/page.tsx`
- `src/app/(app)/coverage/page.tsx`
- `src/app/(app)/intake/page.tsx`
- `src/app/(app)/settings/page.tsx` + `actions.ts`

### Middleware
- `src/middleware.ts`
- `src/lib/supabase/middleware.ts`

### Lib
- `src/lib/config/env.server.ts`
- `src/lib/config/env.public.ts`
- `src/lib/supabase/{browser,server,admin}.ts`
- `src/server/policies/roles.ts`
- `src/server/policies/current-actor.ts`
- `src/server/policies/index.ts`

### Empty barrels awaiting later phases
- `src/modules/{auth,bookings,availability-blocks,booking-requests,shift-occurrences,shift-templates,sharing,audit}/index.ts`
- `src/server/{db,repositories,services}/index.ts`
- `src/lib/{openai,worker}/index.ts`

### Infra scaffolds (awaiting Wave C/D)
- `supabase/{migrations,seed,policies}/`
- `worker/{jobs,runner}/`
- `tests/{smoke,auth,routing}/`
- `public/`

### Config
- `package.json`, `package-lock.json`, `tsconfig.json`
- `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`
- `.gitignore`
- `.env.local.example` (committed)
- `.env.local` (gitignored, populated with real values)

### Archived
- `archive/vite-shell/` — full Vite + React SPA preserved as design and domain-type reference

## Supabase project (dev)
- Name: `amifree-dev`
- Ref: `ljvafxkitrfwydtvfhmf`
- Region: `us-west-2`
- URL: `https://ljvafxkitrfwydtvfhmf.supabase.co`
- Connection: Transaction pooler, port 6543

## Deferred assets (not yet created)
- `supabase/migrations/0001_reserve_schedule_commitments.sql` — slice 10
- `worker/runner/index.ts`, `worker/jobs/noop.ts` — slice 11
- `src/lib/openai/client.ts` — slice 12
- `src/app/api/health/route.ts` — slice 13
- `public/manifest.webmanifest` + icons — slice 14
