# Auth setup — Apple, Google, password, and long-lived sessions

This is the dashboard work needed to flip the auth buttons from
"renders fine, errors on click" to "actually signs the user in." The
code is already in place:

- `src/app/(public)/login/page.tsx` — UI with Apple + Google + email/password
- `src/app/(public)/login/oauth-actions.ts` — calls
  `supabase.auth.signInWithOAuth` and redirects to the provider
- `src/app/(public)/login/password-actions.ts` — email + password sign-in
- `src/app/(public)/signup/` — create-an-account flow
- `src/app/(public)/forgot-password/` and `src/app/(public)/reset-password/` — recovery flow
- `src/app/auth/callback/route.ts` — receives the OAuth code, exchanges
  it for a session, enforces the owner allowlist + pending-invite check
  (same guard the email OTP path uses)

You only need to do dashboard config below. Order matters: Supabase
redirect URLs first, then Google, then Apple, then session lifetime.

---

## 1. Supabase — redirect URLs

In Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://amifreescheduler.com`
- **Redirect URLs** (add each on its own line):
  - `https://amifreescheduler.com/auth/callback`
  - `https://www.amifreescheduler.com/auth/callback`
  - `https://am-ifree.vercel.app/auth/callback` (legacy host, keep for
    fallback while testing)
  - `http://localhost:3000/auth/callback` (local dev)

Save. Without these, Supabase rejects the OAuth callback as an
"unauthorized redirect" and the user gets bounced back to /login with
"Could not complete sign-in."

---

## 2. Google Sign-In

### 2a. Google Cloud Console

1. Go to <https://console.cloud.google.com/>. Create a new project named
   **AmIFree** (or reuse an existing one).
2. Enable the OAuth consent screen: **APIs & Services → OAuth consent
   screen**. Choose **External** (you're not in a Google Workspace).
   Fill in:
   - App name: `AmIFree`
   - User support email: `support@amifreescheduler.com` (or your
     personal Gmail — you can change later)
   - App logo: upload `public/icon.svg` (convert to PNG first; Google
     wants 120×120)
   - App domain: `amifreescheduler.com`
   - Authorized domains: `amifreescheduler.com`,
     `supabase.co` (Supabase exchanges the token, so its domain must
     be authorized)
   - Developer contact: your email
   - Scopes: leave defaults (email, profile, openid)
   - Test users: add your Gmail and any invitee Gmails until you publish
3. **APIs & Services → Credentials → Create Credentials → OAuth client
   ID**:
   - Application type: **Web application**
   - Name: `AmIFree web`
   - Authorized JavaScript origins:
     - `https://amifreescheduler.com`
     - `https://www.amifreescheduler.com`
     - `https://am-ifree.vercel.app`
     - `http://localhost:3000`
   - Authorized redirect URIs (this is the **Supabase callback**, not
     ours — copy it exactly from the Supabase dashboard, see below):
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Click **Create**. Copy the **Client ID** and **Client secret** that
   pop up.

### 2b. Wire Google into Supabase

Supabase dashboard → **Authentication → Providers → Google**:

- Toggle **Enable Sign in with Google** ON
- Paste the **Client ID** and **Client Secret** you just generated
- Copy the **Callback URL (for OAuth)** Supabase displays here — that's
  the value you needed in step 2a's "Authorized redirect URIs"
- **Skip nonce check**: leave OFF
- Save

### 2c. Publish the OAuth consent screen

While the consent screen is in **Testing**, only test users you
explicitly added can sign in. To open it up:

- Go back to **OAuth consent screen → Publishing status → Publish app**
- Google may ask for verification if you use sensitive scopes; AmIFree
  only uses email + profile + openid, which is non-sensitive — no
  verification needed for the published app.

---

## 3. Apple Sign-In

Apple's setup is the most involved part. Plan ~30 minutes the first
time. You'll need an **Apple Developer Program** membership ($99/yr,
<https://developer.apple.com/programs/>).

### 3a. Apple Developer — App ID

1. Go to <https://developer.apple.com/account/resources/identifiers/list>
2. Click **+ → App IDs → App**
   - Description: `AmIFree`
   - Bundle ID: explicit, e.g. `com.amifreescheduler.web`
   - Capabilities: check **Sign In with Apple**
   - Continue → Register

### 3b. Apple Developer — Services ID (the OAuth client ID)

3. In Identifiers, click **+ → Services IDs**
   - Description: `AmIFree Web Auth`
   - Identifier: `com.amifreescheduler.web.auth`
   - Continue → Register
4. Click the new Services ID → enable **Sign In with Apple** → Configure:
   - Primary App ID: `com.amifreescheduler.web` (the App ID from 3a)
   - Domains and Subdomains:
     - `<your-project-ref>.supabase.co`
   - Return URLs:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Save → Continue → Save again (Apple has two save steps, both
     required)

### 3c. Apple Developer — Sign In with Apple Key

5. **Keys → +**
   - Name: `AmIFree Sign In Key`
   - Enable **Sign In with Apple**, click **Configure**, choose your
     Primary App ID (`com.amifreescheduler.web`), Save
   - Continue → Register
   - Click **Download** to grab the `.p8` file. **You can only download
     it once.** Note the **Key ID** shown after download.

### 3d. Generate the client secret JWT

Apple wants a signed JWT as the client secret, not a plain string.
Supabase's docs walk through this, but easiest path: use the
[supabase-community/apple-client-secret-generator](https://github.com/supabase-community/apple-client-secret-generator)
script, or this one-liner with `openssl` + `node`:

```bash
node -e '
const jwt = require("jsonwebtoken");
const fs = require("fs");
const privateKey = fs.readFileSync("AuthKey_<KEY_ID>.p8");
console.log(jwt.sign({}, privateKey, {
  algorithm: "ES256",
  expiresIn: "180d",
  audience: "https://appleid.apple.com",
  issuer: "<TEAM_ID>",
  subject: "com.amifreescheduler.web.auth",
  keyid: "<KEY_ID>",
}));
'
```

You'll need:

- `<TEAM_ID>` from <https://developer.apple.com/account> (top right)
- `<KEY_ID>` from the key you downloaded
- `AuthKey_<KEY_ID>.p8` file in the same directory

The output is a long JWT. That's your **Client Secret** for Supabase.

> Heads-up: Apple's secret JWTs expire (you set `expiresIn` above —
> 180 days is the max). Set a calendar reminder to regenerate before
> expiry, or use Supabase's **Generate Secret** helper if it's available
> in your project's plan.

### 3e. Wire Apple into Supabase

Supabase dashboard → **Authentication → Providers → Apple**:

- Toggle **Enable Sign in with Apple** ON
- **Services ID**: `com.amifreescheduler.web.auth`
- **Secret Key (for OAuth)**: paste the JWT from 3d
- Save

---

## 3.5. Email + password auth

Same Supabase project, separate provider toggle. Both can coexist with
OAuth and magic-link.

### 3.5a. Enable the Email provider

Supabase dashboard → **Authentication → Providers → Email**:

- **Enable Email provider**: ON (it's likely already on for magic-link)
- **Enable email signup**: ON
- **Confirm email**: your call. Two options —
  - **OFF (recommended for beta)**: signups complete immediately and the
    user lands on `/calendar`. Faster funnel, fine for an allow-listed
    audience. The signup action falls through directly to redirect.
  - **ON**: signups send a confirmation email. The user has to click it
    before they can sign in. The signup page detects this case and
    shows a "check your email" state.
- **Secure email change**: ON
- **Secure password change**: ON
- Save.

### 3.5b. Password requirements

Supabase dashboard → **Authentication → Policies → Password**:

- **Minimum length**: 8
- All complexity toggles (uppercase / lowercase / number / symbol):
  **leave OFF**. The app's own validation (8+ chars) is the single
  source of truth — extra rules just frustrate users.

### 3.5c. Password reset email template

Supabase dashboard → **Authentication → Email Templates → Reset
Password**:

- **Subject**: `Reset your AmIFree password`
- **Body** (HTML):

```html
<p>Hi,</p>
<p>Click the link below to set a new password for your AmIFree account.
The link expires in 1 hour.</p>
<p><a href="{{ .ConfirmationURL }}">Set a new password</a></p>
<p>If you didn't request this, ignore the email — your password stays
unchanged.</p>
<p>— AmIFree</p>
```

The `{{ .ConfirmationURL }}` variable is the Supabase recovery URL
that lands on `/auth/callback?code=...&next=/reset-password`. Our
callback route exchanges the code, signs the user in temporarily, and
redirects to `/reset-password` where they choose a new password.

### 3.5d. Rate limits

Supabase dashboard → **Authentication → Rate Limits** — leave defaults
during beta. If you start seeing brute-force attempts, lower the
"sign-ins" limit per IP.

---

## 4. Long-lived sessions

Supabase dashboard → **Authentication → Sessions**:

- **JWT expiry limit**: 3600 (1 hour — keep short, the access token gets
  refreshed automatically)
- **Refresh token reuse interval**: 10 (seconds, default)
- **Inactivity timeout**: leave blank (no inactivity timeout)
- **Session max duration**: **7776000** (90 days — bumped from the
  previous 30-day setting to match the "Stay signed in for 90 days"
  checkbox on /login)

The `@supabase/ssr` middleware in `src/lib/supabase/middleware.ts`
already calls `supabase.auth.getUser()` on every request, which silently
refreshes the access token using the refresh token. So a session that
sits unused for 25 days still wakes up cleanly.

> The "Stay signed in for 90 days" checkbox on `/login` is checked by
> default. When the user unchecks it (e.g., on a shared computer), we
> write a `staySignedIn=0` cookie. Today the Supabase session length
> is global (90 days for everyone). To enforce a shorter 7-day window
> when the cookie is `0`, add a check in
> `src/lib/supabase/middleware.ts` that signs the user out if
> `staySignedIn=0` and the session was issued more than 7 days ago.
> Mark this as a follow-up; the UI is wired and the preference is
> recorded — we just don't enforce the short-session ceiling yet.

---

## 5. Magic link improvements

These are existing-flow polish items, configured in Supabase dashboard:

- **Authentication → Email Templates → Magic Link**
  - Subject: `Your AmIFree sign-in code`
  - Body: replace the default with copy that mentions the code
    explicitly: "Your sign-in code is `{{ .Token }}`. It expires in 5
    minutes."
- **Authentication → Rate Limits**
  - Email signups: leave default
  - Token verifications: leave default
  - Email OTP: lower the per-hour limit if you want to throttle abuse;
    default is generous

The "click the link to sign in" auto-detection (deliverable 2d) works
out of the box — Supabase magic-link emails contain a confirmation URL
that lands on `/auth/callback` (same route OAuth uses) with a `code`
query param. Our route handler exchanges it for a session
automatically. The user never sees the OTP if they click the link on
the same device.

---

## 6. Environment variables

No new env vars needed. The OAuth client IDs and secrets live in the
Supabase dashboard, not in the app. The only existing vars used:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_ALLOWED_EMAILS` — comma-separated list of owner emails. OAuth
  sign-ins are checked against this same list (plus pending invites)
  in `/auth/callback`.

---

## 7. Testing checklist

After config:

1. Open <https://amifreescheduler.com/login> in an incognito window.
2. Click **Continue with Google**. You should bounce to Google,
   approve, bounce back, land on `/calendar`. ✓
3. Sign out (Settings → Sign out — confirm one exists; if not, that's
   a follow-up). Click **Continue with Apple**. Same flow. ✓
4. Sign out. Use the email magic link with an allow-listed address.
   Should still work. ✓
5. Try the email magic link with an email that's NOT on the allowlist
   AND has no pending invite. The OTP form should still appear (anti-
   enumeration), but the code in the email should let you in only if
   you're allowed. ✓
6. Wait 31 days and refresh. You should still be signed in. (Skip in
   practice — trust the Supabase session config.)

---

## 8. Owner allowlist behavior

The `/auth/callback` route enforces the same allowlist as the email
flow: a user is signed out and bounced to `/login?error=...` if their
email is neither in `APP_ALLOWED_EMAILS` nor has a pending
`workspace_members` invite. This means an unknown person hitting
"Continue with Google" with their personal Gmail will see an error,
not a partially-created account.

To open up signups (e.g. when AmIFree goes public-beta), remove the
allowlist enforcement in `src/app/auth/callback/route.ts` and
`src/app/(public)/login/actions.ts`. Both check `allowedEmails` and
`hasPendingInvite` — drop those guards and any authenticated user gets
in.
