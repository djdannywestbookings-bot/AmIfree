# [21] Phase - App Shell Audit & Build Rescue Plan

## Current repo inventory

The repo currently appears to be a **mixed docs-first repository with a partial frontend shell footprint**, not yet confirmed as a working private beta application.

Repo-grounded items confirmed from inspection:
- `README.md` states the repo currently contains **project documentation and source-of-truth planning artifacts**, and says application source code was not available in the connected workspace at the time of that push.
- `docs/source-of-truth.md` exists and reflects the locked AmIFree product and architecture truths.
- `package.json` is configured as a **Vite + React + TypeScript** app, not a Next.js app:
  - `dev: vite`
  - `build: tsc -b && vite build`
  - `preview: vite preview`
- `vite.config.ts` exists and uses `@vitejs/plugin-react` with `base: './'`, which fits a static-build-oriented Vite shell.
- `tsconfig.json` and `tsconfig.app.json` are aligned to a Vite/React frontend setup, including `vite/client` types and `src` as the app include path.
- `components.json` exists with shadcn-style aliases and `rsc: false`, so the shell was not set up around React Server Components.
- Compiled frontend assets are present in the repo, including built CSS that contains AmIFree-specific status and conflict tokens.

What is **not yet confirmed** from the inspected repo paths:
- a working Next.js App Router app
- live application source entrypoints for the shell
- Supabase integration
- auth/session handling
- schema migrations
- Graphile Worker jobs
- OpenAI Responses API intake flow
- implemented AmIFree domain objects and scheduling logic

Practical conclusion:
- The current repo is best treated as **source-of-truth docs plus a reusable UI shell direction**, not yet as a reliable online beta base.

## Reusable assets to keep

**Keep as source of truth**
- `README.md`
- `docs/source-of-truth.md`
- roadmap and locked phase documentation

These already preserve the product boundaries that the personal beta must not violate.

**Keep as reusable frontend design/input**
- Tailwind + utility-class styling direction
- shadcn/Radix component setup
- form stack: `react-hook-form`, `zod`
- portable UI dependencies like `lucide-react`, `date-fns`, `sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`

**Keep as recoverable visual language**
The compiled CSS already encodes useful AmIFree-specific tokens for:
- booking states
- conflict states
- shared visual system conventions

That is worth preserving during the rebuild/port even if the compiled files themselves are not the runtime base.

## Mismatches against locked architecture

**1. Runtime/framework mismatch**
Locked architecture is **Next.js App Router PWA**.
The confirmed frontend config is **Vite + React**, which is a direct mismatch.

**2. Current repo state reads as shell/docs first, not private beta first**
The README explicitly frames the repo as documentation/bootstrap state rather than an implemented app state.

**3. Backend stack is not yet confirmed in repo**
Locked architecture requires:
- Supabase Postgres/Auth/Storage
- Graphile Worker
- OpenAI Responses API
- `schedule_commitments` as normalized overlap surface

Those are locked truths, but their implementation is **not yet confirmed** from the inspected repo files.

**4. Domain implementation is not yet confirmed**
The locked separation of:
- Booking
- Manual Availability Block
- Booking Request
- Shift Template
- Shift Occurrence

is preserved in docs, but not yet confirmed as implemented in code or schema from the inspected repo files.

**5. Conflict and sharing rules are not yet confirmed in code**
The personal beta depends on exact enforcement of:
- hard conflict vs possible conflict
- request-linkage integrity
- staffing eligibility using private logic
- public busy filtering rules

Those rules are clearly locked in docs, but their implementation is not yet confirmed in the inspected repo state.

## Missing pieces required for personal online beta

This is the **minimum** needed for the owner to log in and test real workflows online. Nothing broader.

**1. A real locked-stack app foundation**
- Next.js App Router app
- protected owner login
- deployable environment
- stable basic shell routes

**2. Minimum persisted data model**
Working schema and persistence for only the objects needed to test core workflows:
- bookings
- manual availability blocks
- booking requests
- shift occurrences
- shift templates
- `schedule_commitments`
- audit note / hard-conflict override log

**3. Minimum owner workflows**
Only the flows needed for personal online testing:
- sign in
- create/edit booking
- create/edit manual availability block
- create/send booking request
- create/edit one-off shift occurrence
- create/edit shift template with generated occurrences preview
- see operator schedule split correctly:
  - Agenda = bookings only
  - Coverage = shift occurrences only

**4. Minimum schedule/conflict engine**
Enough logic for trustworthy owner testing:
- service day at 6:00 AM local venue time
- cross-midnight booking placement to starting nightlife day
- hard conflict / possible conflict / missing info / time TBD classification
- hard-block on advance to Assigned or Booked where locked rules require it
- limited hard-conflict save only for Inquiry / Hold / Requested, with:
  - explicit reason
  - confirmation
  - audit note

**5. Minimum request-linkage integrity**
The beta cannot be relied on unless this is real:
- draft request may exist without linked booking
- sent request creates or links a Requested booking
- accept does not create a second booking
- conversion/assignment updates the existing linked booking path

**6. Minimum public/private schedule surfaces**
- private owner schedule view
- public Busy view
- public Busy + Region view
- public filtering must include only:
  - Assigned bookings
  - Booked bookings
  - Active Manual Availability Blocks
- Inquiry / Hold / Requested must not appear in public shared busy output

**7. Minimum AI intake implementation**
Because AI extraction is locked as review-before-save:
- intake parsing using Responses API
- review screen
- explicit save step
- no direct auto-save into booking records

**8. Minimum operational readiness for owner testing**
- seeded owner account
- sample data or fixture creation path
- basic logging/error visibility
- ability to recover from bad test data without corrupting schedule truth

## Keep / rebuild / delete recommendations

**Keep**
- all locked docs and source-of-truth artifacts
- the current visual language and status/conflict tokens
- the portable UI dependency set
- any shell components that are purely presentational and can be ported cleanly into Next

**Rebuild**
- the runtime app foundation in Next.js App Router
- auth and data access layer
- all domain persistence and scheduling logic
- public share logic
- request-linkage logic
- conflict enforcement logic
- AI review-before-save flow

**Delete or quarantine**
- do not use the compiled `assets/*` files as application source of truth
- do not continue building on the Vite runtime as the primary beta base
- quarantine legacy/static shell artifacts into a reference area if they help port UI, but do not let them drive architecture

Practical recommendation:
- **keep the docs and design system**
- **port only reusable presentation**
- **rebuild the minimum working product path on the locked stack**

## Ordered build backlog for phases [22]–[25]

**[22] Phase - Canonical Beta Foundation**
- Create the real Next.js App Router app in this repo
- Port the shell styling/design tokens into the new app
- Add Supabase auth for owner-only login
- Set up protected routes and deployable env config
- Deliverable outcome: owner can sign in to a stable protected app shell online

**[23] Phase - Core Data Model for Personal Testing**
- Implement schema/migrations for:
  - bookings
  - manual availability blocks
  - booking requests
  - shift occurrences
  - shift templates
  - `schedule_commitments`
  - audit notes
- Add service-day and cross-midnight normalization
- Deliverable outcome: core AmIFree objects persist correctly and can be queried consistently

**[24] Phase - Core Workflows and Conflict Integrity**
- Implement owner workflows for:
  - bookings
  - manual availability blocks
  - requests
  - one-off shift occurrences
  - shift templates with preview
- Implement:
  - Agenda = bookings only
  - Coverage = shift occurrences only
- Implement conflict logic, assignment blocking, and limited hard-conflict save path
- Implement request-linkage integrity
- Deliverable outcome: owner can run real end-to-end scheduling tests without breaking locked truths

**[25] Phase - Personal Beta Reliability Layer**
- Implement public Busy and Busy + Region sharing rules
- Implement review-before-save AI intake
- Add seed data / fixture support
- Add basic observability and recovery safeguards
- Deliverable outcome: owner can rely on the beta online for personal testing without hidden schedule-truth failures

## Personal beta launch gate

The owner can rely on the private personal online beta **only when all of the following are true at the same time**:

1. **Owner authentication works online** and protects all private app routes.
2. **Bookings, Manual Availability Blocks, Booking Requests, Shift Templates, and Shift Occurrences are all persisted as separate objects** in the live beta.
3. **`schedule_commitments` is functioning as the normalized overlap surface** used by the live schedule/conflict logic.
4. **Agenda shows Bookings only** and **Coverage shows Shift Occurrences only** in the live app.
5. **Service-day and cross-midnight behavior are working correctly** in the live schedule UI.
6. **Hard-conflicted items cannot advance to Assigned or Booked**.
7. **Limited hard-conflict save works only for Inquiry / Hold / Requested** and requires:
   - explicit reason entry
   - confirmation
   - audit note
8. **Request-linkage path is verified live**:
   - sent request creates or links a Requested booking
   - accept does not create a second booking
   - conversion/assignment updates the existing linked booking path
9. **Public shared Busy / Busy + Region outputs are verified live** and include only:
   - Assigned bookings
   - Booked bookings
   - Active Manual Availability Blocks
   while excluding Inquiry / Hold / Requested
10. **AI intake is review-before-save in production behavior**, with no automatic direct write into booking truth.
11. **Basic logs and error visibility exist**, so the owner can detect and trust failures instead of silently corrupting schedule data.

If any one of those conditions is missing, the product is still a build candidate or internal test app, **not yet a dependable personal online beta**.

## Top implementation risks

**1. Treating the current shell as more complete than it is**
The repo has enough shell/config/assets to create false confidence, while the actual locked-stack beta implementation is not yet confirmed.

**2. Continuing on Vite instead of porting**
That would speed short-term UI work but directly increase migration debt against the locked architecture.

**3. Missing shell source recoverability**
The inspected repo confirms compiled assets and config, but not enough source structure to assume a clean port without some reconstruction.

**4. Conflict engine mistakes**
The owner beta becomes unsafe fast if hard conflict, possible conflict, service-day, or public busy logic is even slightly wrong.

**5. Request-linkage duplication bugs**
This is one of the easiest ways to break booking truth during personal testing.

**6. Privacy leakage in shared busy**
If soft-state bookings appear publicly, the beta violates a locked truth immediately.

**7. Object-boundary collapse during fast implementation**
Merging booking/request/shift/block concepts for convenience would make the beta faster to mock but invalid to rely on.

**8. Shipping without auditability**
Without audit notes and visible override tracking, limited hard-conflict save would exist in name only and would not be trustworthy for real owner use.
