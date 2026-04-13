# [22] Phase - Canonical Beta Foundation

## Target foundation architecture

The canonical foundation should be a **single-repo TypeScript modular monolith** with the **Next.js App Router app as the primary runtime at the repo root**, backed by **Supabase Postgres/Auth/Storage**, **Graphile Worker** for async jobs, and **OpenAI Responses API wiring present but not yet expanded beyond foundation readiness**. This keeps the runtime aligned to the locked architecture while avoiding the extra complexity of a multi-package monorepo for a private owner beta. The current repo state does not yet confirm that this locked-stack runtime exists today; the confirmed frontend runtime in the repo is still Vite-based, and the docs remain ahead of implementation.

The minimum canonical runtime shape should be:
- **Route layer:** `src/app/**` using App Router
- **UI layer:** reusable presentational components and shell primitives
- **Domain layer:** server-only modules for bookings, availability blocks, requests, shifts, sharing, auth, and audit
- **Data layer:** server-only repositories/query services against Postgres
- **Infra layer:** Supabase clients, storage adapter, worker enqueue adapter, OpenAI adapter, config loader
- **Async layer:** standalone Graphile Worker process reading from the same Postgres database
- **Public assets layer:** PWA manifest, icons, service worker assets, install metadata

For the private personal beta foundation, the architecture should support only these runtime surfaces:
- public login surface
- protected owner shell
- server-side auth/session enforcement
- backend wiring for future domain modules
- worker wiring for future async jobs
- deployable environment separation
- observability and health checks

No additional public product breadth is required in this phase.

## Repo restructuring plan

The repo should be restructured from a mixed docs/Vite/static-shell state into a **rooted Next.js application repository**, while preserving docs as source of truth and quarantining the current shell artifacts for reference. The repo docs already acknowledge that documentation is ahead of implementation, and the current root package/runtime is Vite-based rather than Next-based.

Recommended target structure:

- `README.md`
- `docs/`
  - `source-of-truth.md`
  - `roadmap.md`
  - `phases/`
- `src/`
  - `app/`
    - `(public)/login`
    - `(app)/agenda`
    - `(app)/coverage`
    - `(app)/intake`
    - `(app)/settings`
    - `layout.tsx`
    - `globals.css`
  - `components/`
  - `modules/`
    - `auth/`
    - `bookings/`
    - `availability-blocks/`
    - `booking-requests/`
    - `shift-occurrences/`
    - `shift-templates/`
    - `sharing/`
    - `audit/`
  - `server/`
    - `db/`
    - `repositories/`
    - `services/`
    - `policies/`
  - `lib/`
    - `supabase/`
    - `config/`
    - `openai/`
    - `worker/`
- `supabase/`
  - `migrations/`
  - `seed/`
  - `policies/`
- `worker/`
  - `jobs/`
  - `runner/`
- `public/`
  - `manifest.webmanifest`
  - icons/splash assets
- `tests/`
  - smoke
  - auth
  - routing

Recommended handling of current repo contents:
- keep `docs/**` in place
- replace the root Vite runtime with Next.js runtime files
- move current Vite/static shell artifacts into `legacy/vite-shell/` or `archive/vite-shell/`
- do not let compiled `assets/*` remain part of the live runtime path
- keep recoverable design tokens and presentational patterns from the shell as reference input only

This restructuring keeps the repo single-source and implementation-ready without mixing two frontend runtimes.

## Auth and access model for private owner beta

The auth model for the private personal beta should be **owner-only by default**, with role scaffolding that preserves locked future behavior without expanding the beta surface prematurely.

Minimum auth model:
- **Primary active role:** `dj_owner`
- **Reserved but not broadly enabled role:** `manager_lite`
- no public signup
- no self-serve invites
- no anonymous access to protected app routes
- no multi-tenant onboarding flow in this phase

Auth source:
- **Supabase Auth** as the only authentication provider for the beta foundation, matching the locked platform direction.

Access model for Phase 22:
- owner signs in through Supabase-authenticated email-based login
- owner session is required for all `(app)` routes
- server-side route guard checks role and session before rendering protected routes
- reserved public routes are limited to:
  - `/login`
  - minimal auth callback/reset paths
  - health/status endpoints
- all future operational actions remain inaccessible until authenticated

Role handling plan:
- persist application role separately from raw auth identity
- treat app role as an authoritative server-side policy input
- include `manager_lite` in app-role scaffolding now so later phases do not require an auth redesign
- do not expose Manager Lite collaboration flows in Phase 22

Minimum security rules:
- no client-trusted role logic
- no direct client permission decisions for sensitive actions
- server-side policy checks only
- all future consequential actions must be compatible with audit logging from the start

## Environment and secrets plan

Minimum required environments:
- **local**
- **preview**
- **private-beta-production**

The private beta should not rely on one shared all-purpose environment. At minimum, local and live beta must be separated, and preview deployments should exist only if they can be isolated from live owner data.

Minimum environment variables and secrets:

**App/runtime**
- `NEXT_PUBLIC_APP_URL`
- `NODE_ENV`

**Supabase**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

**Auth/session/site config**
- `SUPABASE_PROJECT_ID`
- `APP_ALLOWED_EMAILS` or equivalent owner allowlist for beta gating
- `APP_ENV` (`local`, `preview`, `private_beta`)

**Worker**
- `GRAPHILE_WORKER_DATABASE_URL`
- `GRAPHILE_WORKER_SCHEMA` if separated
- `WORKER_CONCURRENCY`

**OpenAI**
- `OPENAI_API_KEY`

**Storage and file handling**
- storage bucket names or equivalents for beta-safe uploads
- max upload size and allowed mime config as app config, not hardcoded in routes

**Observability**
- error tracking DSN
- app log drain or structured logging endpoint
- deployment/environment label

Secrets handling rules:
- no secrets committed to repo
- no `.env` files in version control
- local uses `.env.local`
- preview and production use platform-managed encrypted secrets
- service role key is server-only
- database URL is server-only
- OpenAI key is server-only
- public variables limited to browser-safe values only

## Deploy/hosting plan

For the private personal beta foundation, the simplest deployable shape is:

- **Next.js App Router app:** hosted on a managed Next-compatible platform
- **Supabase:** hosted Postgres/Auth/Storage project
- **Graphile Worker:** separate long-running worker process deployed independently against the same Postgres database
- **Docs:** stay in repo, not separately deployed as the product runtime

Recommended deployment topology:
- web app and auth callbacks on one canonical beta domain
- worker on separate service/process
- one private-beta database/project
- one development database/project
- preview deployments isolated from live owner data or disabled if isolation is not reliable

Minimum operational hosting requirements:
- environment-variable management
- deployment rollback
- health endpoint support
- background worker process support
- persistent logs
- secure HTTPS
- domain + subdomain readiness for future public share routes

The key principle for this phase is not hosting breadth; it is that the owner can access a stable protected shell online, and the worker/runtime split already matches the locked architecture.

## Protected route/app shell plan

The protected shell should exist as a **real authenticated application frame**, even if the underlying scheduling workflows are not implemented until later phases.

Minimum route plan:

**Public**
- `/login`
- auth callback/reset paths
- `/api/health` or equivalent status endpoint

**Protected**
- `/agenda`
- `/coverage`
- `/intake`
- `/settings`

Protected shell behavior:
- all protected routes render inside one authenticated app layout
- unauthenticated access redirects to login
- authenticated owner lands on `/agenda` by default
- shell navigation explicitly preserves the locked split:
  - Agenda
  - Coverage
  - Intake
  - Settings

Protected shell requirements:
- mobile-first nav and layout
- persistent session handling
- loading and unauthorized states
- error boundary at shell level
- server-side session validation on route entry
- reserved internal layout space for future notification entry point
- reserved account context for current actor and current role

Important constraint:
- the shell can include page placeholders in Phase 22, but it must not blur object boundaries or merge Agenda and Coverage semantics. The docs already lock Agenda as bookings-only and Coverage as shift-occurrences-only, so the shell navigation and page labels must enforce that from day one.

## PWA foundation requirements

The private owner beta foundation should include the **minimum real PWA baseline**, not a fake or decorative install layer.

Required in Phase 22:
- valid web app manifest
- app icons for install
- mobile-safe viewport/meta configuration
- theme color and basic install metadata
- service worker approach defined and environment-safe
- offline/fallback behavior explicitly scoped

Minimum PWA behavior for this phase:
- installable shell on supported devices
- no aggressive offline caching of mutable operational data yet
- cache static assets and shell safely
- avoid stale-client behavior that could hide route/auth updates
- versioned service worker strategy defined before launch
- safe update path that favors correctness over offline breadth

The locked stack explicitly prioritizes a Next.js App Router PWA, and the broader project docs also describe the product as mobile-first/PWA. The foundation should therefore include the install/runtime basics now, while deferring advanced offline workflow behavior until the scheduling flows are real.

## Data access and backend wiring plan

The data/backend plan for Phase 22 should wire the application so later phases can add domain logic without replacing the foundation.

Minimum backend wiring:
- server-only database access layer
- Supabase browser client for session-aware UI needs only
- Supabase server client for authenticated server operations
- service-role access restricted to server/admin paths only
- Graphile Worker process connected to same database
- OpenAI adapter created as server-only infrastructure module
- config loader validating required env vars at startup

Recommended backend write policy:
- no core domain writes directly from client components
- protected routes call server-side actions/handlers only
- repositories and services live in server-only modules
- domain rules will later live above repositories, not inside UI code

Minimum backend artifacts to define in foundation:
- database connection strategy
- migration strategy under `supabase/migrations`
- server-only repository interfaces
- domain service entrypoints for later use
- worker enqueue interface
- audit/event emission interface
- health check endpoint covering:
  - app boot
  - database reachability
  - auth config presence
  - worker config presence

Critical data-layer decision:
- `schedule_commitments` must be treated as a first-class normalized backend surface from the start, even if its full business logic lands in later phases. The locked architecture already defines it as the normalized overlap surface, so the foundation must reserve its place in the schema and service boundaries now.

## Definition of done for Phase [22]

Phase 22 is done only when all of the following are true:

- the repo has been restructured so the **Next.js App Router app is the primary runtime**
- the prior Vite/static shell artifacts are removed from the live runtime path and archived or quarantined
- the live app is deployable online from the AmIfree repo
- owner-only authentication works against Supabase Auth
- unauthenticated users cannot access protected app routes
- authenticated owner can sign in and reach a protected shell online
- protected shell includes the canonical navigation surfaces:
  - Agenda
  - Coverage
  - Intake
  - Settings
- route structure preserves the locked Agenda/Coverage separation
- environment variables and secrets are defined for local and private-beta environments
- database connectivity is wired server-side
- Graphile Worker runtime is defined and deployable as a separate process
- OpenAI server adapter/config is wired at infrastructure level
- PWA manifest/install baseline exists and is valid
- health/status checks exist for app and foundational dependencies
- the foundation is documented clearly enough that Phase 23 can begin without re-deciding runtime, auth, deployment, or directory structure

## Risks and setup blockers

- **Current repo/runtime mismatch:** the confirmed runtime files in the repo are Vite-based, so moving to the locked Next foundation is a real migration step, not a small config tweak.
- **Docs are ahead of implementation:** this is acknowledged in the repo, so Phase 22 must avoid assuming backend/auth/runtime pieces already exist.
- **Shell source recoverability is not yet fully confirmed:** design assets and compiled artifacts exist, but not all application source entrypoints were confirmed during repo inspection, so some shell UI may need reconstruction rather than direct porting.
- **Worker hosting may be the first operational blocker:** the private beta foundation requires a separate Graphile Worker runtime, and that cannot be faked inside a static or purely frontend deployment.
- **Auth policy drift risk:** if role logic is pushed into the client or public signup is left open during bootstrap, the foundation will already be off-spec.
- **PWA stale-client risk:** enabling installability without a cautious update strategy can make the owner beta less trustworthy instead of more usable.
- **Environment leakage risk:** preview and private-beta environments must be separated cleanly or preview deploys should not touch live owner data.
- **Premature breadth risk:** adding extra pages, public onboarding, team management, or partial workflow features during Phase 22 would slow the exact goal of this phase, which is only to establish the real protected online foundation.
