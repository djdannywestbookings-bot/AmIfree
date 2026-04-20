# Next Task

## Immediate (owner action)
Smoke-test the sign-in flow before Wave C lands on top.

### Steps
1. `cd ~/Desktop/AmIfree && npm run dev`
2. Browse to `http://localhost:3000/agenda`
3. Expect redirect → `/login`
4. Enter `djdannywestbookings@gmail.com`, Send sign-in code
5. Retrieve 6-digit code from Gmail inbox (check Promotions / Spam if not in Inbox)
6. Paste, Verify
7. Land on `/agenda`; click through Coverage / Intake / Settings
8. Sign out on Settings → land on `/login`
9. Re-visit `/agenda` → redirect to `/login` (confirms middleware still gates)
10. Ctrl-C dev server

## If pass
Begin Wave C.

## If fail — triage
- No OTP email after 30s → Supabase Authentication → Providers → Email: confirm enabled. Check Gmail Promotions/Spam. Check Supabase rate limits on free tier.
- Email arrives, verification fails → inspect dev-server terminal for Supabase error; most likely `invalid_token` (expired or mistyped code) or cookie domain issue.
- Middleware doesn't redirect → inspect network tab; check `src/middleware.ts` matcher didn't strip the path.

## After smoke test
Wave C (four slices):
- `[22] Phase — Slice 10: Supabase migrations skeleton with schedule_commitments reservation`
- `[22] Phase — Slice 11: Graphile Worker runtime with noop job`
- `[22] Phase — Slice 12: OpenAI adapter wiring`
- `[22] Phase — Slice 13: Health endpoint at /api/health`

Then Wave D (PWA + deploy + acceptance).
