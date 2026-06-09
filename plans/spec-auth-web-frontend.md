# Spec — Authentication on the Dwelli web app

**Prepared for** Frontend engineer (admin web, `dwelli-admin-web`)
**Prepared by** Bolaji, Dwelli Technologies Limited
**Date** 2 June 2026
**Scope** Phone + OTP sign-in, token storage, access-token refresh, logout, route protection. V1.
**Companions** `design-brief-onboarding-flow.md` (the UX flow this implements) and `design-brief-web-dashboards.md` (the surfaces a user lands in after).
**Backend reference** `internal/auth/AGENTS.md` (token model + non-negotiables), `internal/handler/auth.go` (endpoint shapes).

---

## What this spec covers

Everything an admin-web user needs to authenticate against the Dwelli backend and stay authenticated:

- The four backend endpoints (request OTP, verify, refresh, logout) and their contracts.
- The browser ↔ Next.js ↔ backend architecture for handling tokens safely.
- Cookie strategy.
- The Route Handlers / Server Actions on the admin web that mediate auth.
- The client-side primitives (forms, context, fetch wrapper) that other features use to "be authenticated".
- Token refresh, including the reuse-detection edge case.
- Error mapping — what each backend error code becomes in the UI.

What this spec does *not* cover:

- The post-auth routing decision (which surface the user lands on after verify) — that's in `design-brief-onboarding-flow.md`.
- The profile-completion screen — same brief.
- Authorization beyond authentication (is-superadmin, is-admin-of-Community, etc.) — separate spec when needed.
- Any visual / IA decisions — that's the designer's brief.

---

## Backend contract (read this first)

All endpoints live under `/v1/auth/`. Every request and response uses the **JSend envelope**:

```json
// success
{ "status": "success", "data": { ... } }

// error
{ "status": "error", "code": "snake_case_code", "message": "human-readable" }
```

The `code` field is the stable contract the frontend matches on. The `message` is human-readable but not stable — never parse it.

### `POST /v1/auth/otp` — request an OTP

**Request body**

```json
{ "phone": "+2348012345678" }
```

`phone` should be sent in **E.164 format** (leading `+`, country code, national number, digits only). The backend accepts any internationally-valid mobile number via Google libphonenumber, not just Nigerian — see "Phone input" below for how the client should validate and normalise before submitting. The backend also tolerates Nigerian local format (`08012345678`) as a convenience, but the frontend should always send E.164.

**Success** (`200`): `{ "status": "sent" }` — **always identical regardless of whether the phone is registered.** Do not show different copy based on this response; the backend is deliberately timing-blind to prevent phone enumeration.

**Errors**

| HTTP | code | What it means | What the UI should do |
|---|---|---|---|
| 400 | `invalid_body` | Malformed JSON | Treat as developer bug; show generic error |
| 400 | `validation_failed` | Phone missing | Inline form error |
| 400 | `invalid_phone` | Phone not parseable, not a real number, or not SMS-reachable (e.g. landline) | Inline "Please enter a valid mobile number" |
| 429 | `rate_limited` | Per-phone or per-IP rate limit hit | "Too many codes requested. Please wait a few minutes and try again." Do not reveal which limit was hit. |
| 500 | `internal_error` | Backend exploded | Generic "something went wrong" + retry button |

**Rate limits (informational — backend enforces, frontend should anticipate):** 1 per phone per 60s, 10 per phone per 24h, 10 per IP per hour.

### `POST /v1/auth/verify` — verify OTP and exchange for tokens

**Request body**

```json
{
  "phone": "+2348012345678",
  "otp": "123456",
  "device_label": "Chrome on macOS"
}
```

`device_label` is required. Compute it from the User-Agent string client-side (see "Device label" below).

**Success** (`200`)

```json
{
  "user_id": "01931a52-...",
  "access_token": "eyJhbGc...",
  "access_token_expires_at": "2026-06-02T15:23:00Z",
  "refresh_token": "x7Yk2pQ...",
  "refresh_token_expires_at": "2026-06-17T14:23:00Z"
}
```

The refresh token plaintext is returned **exactly once** — never store it anywhere recoverable in plaintext on the browser. Put it straight into an HTTP-only cookie (see "Cookies" below).

**Errors**

| HTTP | code | What the UI should do |
|---|---|---|
| 400 | `invalid_body` / `validation_failed` | Inline form errors |
| 400 | `invalid_phone` | Inline error; rare since the user already passed step 1 |
| 401 | `invalid_otp` | "That code is incorrect or has expired. Try again or request a new code." **Do not distinguish "wrong" from "expired" from "too many attempts" — the backend deliberately collapses these.** |
| 500 | `internal_error` | Generic error + allow retry |

After 5 wrong attempts the OTP is dead; the user must request a new one. The 401 response is the same regardless; design the UI to always offer "request a new code" alongside the retry.

### `POST /v1/auth/refresh` — rotate tokens

**Request body**

```json
{ "refresh_token": "x7Yk2pQ..." }
```

**Success** (`200`): same `TokenPair` shape as verify. **The presented refresh token is now revoked.** Discard it; use only the new one.

**Errors**

| HTTP | code | What the UI should do |
|---|---|---|
| 401 | `invalid_refresh_token` | Force re-login (clear cookies, redirect to `/auth`) |
| 401 | `refresh_token_reuse` | **Force re-login + show a security warning.** This means the user's refresh token was used somewhere else after this client used it — possible compromise. The backend has revoked the entire token family. |
| 401 | `refresh_token_expired` | Force re-login. 15 days have passed since the last fresh sign-in. |
| 500 | `internal_error` | Retry once after backoff; if still failing, force re-login |

### `POST /v1/auth/logout` — revoke the refresh token

**Request body**

```json
{ "refresh_token": "x7Yk2pQ..." }
```

**Success** (`200`): `{ "status": "ok" }`. Idempotent — calling with an unknown or already-revoked token still returns 200. Always clear cookies on the frontend regardless of response.

---

## Architecture

The admin web is a **Backend for Frontend (BFF)** in front of the Go API. The browser never talks to the Go backend directly for auth.

```
Browser  <--HTTP+cookies--> Next.js Route Handlers  <--HTTPS+Bearer--> Go backend (api)
         (HTTP-only)        (BFF layer)                                (issues tokens)
```

Why:

- The Go backend returns tokens in the JSON response body. Cookies are set by Next.js, not the backend, so we need a server-side step between the browser and the API.
- HTTP-only cookies are the right place for these tokens (JavaScript can't read them → XSS can't exfiltrate them).
- The browser sends cookies automatically with same-origin requests; Next.js reads the cookie server-side and adds `Authorization: Bearer <jwt>` when proxying to the Go backend.
- Refresh-token rotation needs server-side handling anyway — the new token must land in a new HTTP-only cookie atomically.

Routes the BFF exposes (all under `/api/auth/...` on the admin-web domain):

| Method | Path | What it does |
|---|---|---|
| `POST` | `/api/auth/request-otp` | Proxy to `POST /v1/auth/otp`; returns JSend response as-is to the browser |
| `POST` | `/api/auth/verify` | Proxy to `POST /v1/auth/verify`; on success, set both auth cookies; return `{ user_id }` to the browser, **never the tokens** |
| `POST` | `/api/auth/refresh` | Read `dwelli_refresh` cookie; proxy to `POST /v1/auth/refresh`; on success, set new cookies; on error, clear cookies + return 401 |
| `POST` | `/api/auth/logout` | Read `dwelli_refresh` cookie; proxy to `POST /v1/auth/logout`; clear both cookies regardless of response |

Implement these as **Next.js Route Handlers** (`app/api/auth/*/route.ts`), not Server Actions — Route Handlers are the standard endpoint surface and play nicely with both server- and client-initiated requests.

---

## Cookies

Two cookies, both HTTP-only.

### `dwelli_access`

- **Value:** the JWT from the backend
- **HttpOnly:** `true`
- **Secure:** `true` (always; if running locally over `http`, allow an env-gated relaxation)
- **SameSite:** `Lax`
- **Path:** `/`
- **Max-Age:** matches `access_token_expires_at` (1 hour at the time of writing)
- **Domain:** unset (host-only)

### `dwelli_refresh`

- **Value:** the refresh-token plaintext from the backend
- **HttpOnly:** `true`
- **Secure:** `true`
- **SameSite:** `Strict` — more restrictive than the access cookie because this token never needs to be sent on cross-site navigations; it's only used by `/api/auth/refresh`
- **Path:** `/api/auth` — narrows the cookie to the auth endpoints; pages and other API calls don't see it, which is fine because they only need the access cookie
- **Max-Age:** matches `refresh_token_expires_at` (15 days)
- **Domain:** unset (host-only)

### Clearing cookies

Logout, refresh failure (reuse / expired / invalid), and any forced re-login path must clear both cookies by setting them with `Max-Age=0` and the same name/path/attributes used at set time. Browsers won't delete a cookie if path or attributes don't match — write a single helper `clearAuthCookies(response)` and use it everywhere.

---

## Device label

Required at verify, optional metadata thereafter. Derive on the client from `navigator.userAgent` and pass to the verify Route Handler in the request body. Simple is fine — `"Chrome on macOS"`, `"Safari on iPhone"`. Don't ship a full UA string.

A small `lib/device-label.ts` helper:

- Parse browser name (Chrome / Safari / Firefox / Edge / Other) from UA.
- Parse OS (macOS / Windows / Linux / iOS / Android / Other) from UA.
- Compose `"<browser> on <os>"`. If either is unknown, fall back to `"Web"`.

Don't pull in `ua-parser-js` for this — a 30-line regex is plenty.

---

## Forms

Two forms, both with `react-hook-form` + `zod`, built from `shadcn/ui` primitives (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Button`). Don't hand-roll inputs — install the shadcn `form` and `input` recipes and compose from there. The OTP input specifically should use shadcn's `input-otp` recipe (wraps `input-otp` library) — it handles per-digit focus, paste, and accessibility correctly out of the box.

### Phone entry (`/auth`)

The input must accept **any valid E.164 international mobile number**, not just Nigerian. The backend uses Google libphonenumber and accepts anything libphonenumber considers a valid SMS-reachable number; the client should mirror that validation locally so users see issues inline instead of round-tripping through `invalid_phone`.

Use **`libphonenumber-js/max`** (the JS port of the same library the backend uses) for parse + validate. Use **`react-phone-number-input`** for the input component — it ships with libphonenumber-js, gives you a country picker, and outputs E.164 directly.

```ts
import { isValidPhoneNumber } from 'libphonenumber-js/max';

const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine(isValidPhoneNumber, "Please enter a valid mobile number"),
});
```

**Country defaulting:** default the country picker to `NG` (most users are Nigerian), but let users change it. Don't hide the country picker; international users need it visible to switch.

**What to send:** `react-phone-number-input` already outputs E.164 (e.g. `+2348012345678`, `+447700900123`). Pass it straight to the BFF. No further normalisation needed.

**Why `libphonenumber-js/max` and not `/min` or `/mobile`:** `/max` includes the full metadata bundle and validates correctly across every country libphonenumber knows. `/min` is smaller but less strict; `/mobile` rejects everything except mobile but also drops some valid carriers. `/max` matches the backend's `phonenumbers.IsValidNumber` + mobile-type check most closely. The bundle is ~145KB gzipped — fine for an auth screen.

On submit → `POST /api/auth/request-otp` → on success, navigate to OTP screen passing the phone in router state (don't put it in URL — it's PII).

### OTP entry

```ts
const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});
```

The phone comes from router state (or, if state is lost, redirect back to `/auth`). On submit → `POST /api/auth/verify` with `{ phone, otp, device_label }`. On success, the cookies are set server-side; navigate to the post-auth router (a `/post-auth` page or whatever the routing brief settles on) — see `design-brief-onboarding-flow.md`.

UX details (per design brief):

- Resend timer (60s lockout matches backend per-phone rate limit).
- "Wrong number?" link → back to `/auth`.
- After backend returns `invalid_otp`, offer both "try again" and "request a new code".

---

## Client primitives

### `lib/api.ts` — fetch wrapper for everything-except-auth

A single fetch wrapper used by the rest of the app for any call to the BFF or the Go API. Behaviour:

1. Always uses same-origin requests to the Next.js side (`/api/...`), so cookies are sent automatically.
2. On `401` with code `unauthorized` (access token expired), call `POST /api/auth/refresh` once and retry the original request.
3. On the *retry* failing with `401`, propagate the failure — the auth context will detect it and redirect to `/auth`.
4. Returns parsed JSend success body, or throws a typed `ApiError(code, message, status)` on JSend error.

Pseudocode shape:

```ts
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, credentials: 'same-origin' });
  if (res.status === 401) {
    const body = await res.json();
    if (body.code === 'unauthorized') {
      const refreshed = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' });
      if (refreshed.ok) {
        return apiFetch<T>(path, init); // retry once
      }
      // refresh failed → fall through to throw
    }
  }
  // ... parse JSend, throw ApiError on { status: 'error' } ...
}
```

**One retry maximum.** Don't loop. If refresh fails, throw; the AuthContext catches and redirects.

### `AuthContext` — minimal client-side auth state

Because tokens live in HTTP-only cookies, the React tree can't read them. Instead the AuthContext holds:

```ts
type AuthState =
  | { status: 'unknown' }              // initial server-render state
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; userID: string };
```

Provided by a `<AuthProvider>` wrapping the app. The provider reads an `/api/auth/me` Route Handler on mount (BFF endpoint that returns `{ user_id }` if the access cookie is valid, 401 otherwise) to seed the state. `useAuth()` hook exposes the state and an imperative `signOut()` method that hits `/api/auth/logout` and updates state to `unauthenticated`.

Add `/api/auth/me` to the BFF Route Handlers list above. It calls a simple backend `GET /v1/me` if that exists, or just decodes the JWT server-side to extract `user_id` without a backend roundtrip.

**Why a Route Handler instead of decoding the JWT in middleware:** middleware runs at the edge and decoding is fine, but the user-id is the only thing we need; keeping the BFF as the single source of truth for "is this user authenticated?" is cleaner and means the access cookie can be a totally opaque token to all client code.

### Route protection

Use **Next.js middleware** (`middleware.ts`) to enforce route-group authorization per arch §7B.2. Three route groups:

| Group | Requires | Behaviour on failure |
|---|---|---|
| `(public)` | Nothing | n/a |
| `(admin)` | Valid `dwelli_access` cookie | Redirect to `/auth?returnTo=<original-path>` |
| `(superadmin)` | Valid `dwelli_access` cookie AND `superadmin: true` claim | Redirect to `/communities` (not back to start; they're authed, just not authorised) |

Middleware decodes the JWT (no backend call) to read claims. If the access cookie is missing or the JWT is malformed, treat as unauthenticated. If the JWT is *expired*, also treat as unauthenticated — the retry-with-refresh logic only runs in the data-fetch path, not in middleware. The user lands at `/auth`, signs in again, comes back via `returnTo`.

---

## Token refresh

Two places where refresh happens:

1. **Reactively**, in `lib/api.ts`, when a backend call returns `401 unauthorized`. Single retry; if refresh fails, propagate.
2. **Proactively** — *not in V1*. Don't build a timer that refreshes before expiry. Let access tokens expire naturally and rely on the reactive path. Background refresh adds complexity (cross-tab coordination, race conditions) for no V1 user benefit.

Concurrency edge case (worth designing for): two API calls fire in parallel, both hit a fresh `401`, both kick off a refresh. The second refresh will hit the backend with an already-rotated token and trigger `refresh_token_reuse` → force re-login. **Wrong.**

Fix: serialise refresh calls in `lib/api.ts` with a module-level `Promise<void> | null` lock:

```ts
let refreshInFlight: Promise<Response> | null = null;
function refreshOnce() {
  if (!refreshInFlight) {
    refreshInFlight = fetch('/api/auth/refresh', { method: 'POST' })
      .finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}
```

All in-flight 401s share the same refresh promise; only one network call goes out, and only one rotation happens.

Cross-tab is a separate concern. Two tabs each refreshing within the same second can still trigger reuse. Two options:

- **Accept it for V1** — uncommon, the user lands at `/auth` and signs in again. Cheapest.
- **Coordinate via `BroadcastChannel`** — a "refresh started" message, listeners wait for "refresh complete" before retrying. Worth doing only if real users hit this.

Recommend option 1 for V1; revisit if telemetry shows it happening.

---

## Logout

Two flavours:

- **User-initiated** (clicking "Sign out" in settings): call `POST /api/auth/logout`, BFF revokes the refresh token, clears both cookies, redirect to `/auth`.
- **Forced** (refresh failed with `reuse` / `expired` / `invalid_refresh_token`, or middleware caught an unauthenticated state): clear both cookies, redirect to `/auth?returnTo=<current-path>` (so a session-expiry doesn't lose the user's place).

Reuse detection (`refresh_token_reuse`) is a security event. Show a one-time toast on the next `/auth` render: "For your security, you've been signed out. If you didn't sign in elsewhere, please contact support." Don't be alarmist, but don't hide it.

---

## Error mapping reference

Single table the engineer can read top-to-bottom:

| Endpoint | code | UI treatment |
|---|---|---|
| any | `invalid_body` | Generic error toast; this is a bug |
| any | `validation_failed` | Inline form error using the `message` |
| `/otp` | `invalid_phone` | Inline "valid Nigerian phone please" |
| `/otp` | `rate_limited` | Toast: "Too many codes requested. Try again in a few minutes." |
| `/verify` | `invalid_otp` | Inline: "Code incorrect or expired. Try again or request a new code." |
| `/refresh` | `invalid_refresh_token` | Force re-login; no toast |
| `/refresh` | `refresh_token_reuse` | Force re-login; security toast (see Logout above) |
| `/refresh` | `refresh_token_expired` | Force re-login; toast: "Session ended. Please sign in again." |
| any | `internal_error` | Toast: "Something went wrong on our end. Please try again." with retry CTA where applicable |
| any | 429 with no body | Same as `rate_limited` above |
| any | network error | Toast: "Connection trouble. Check your network and try again." |

---

## UI components

Use **`shadcn/ui`** for all UI primitives in this spec. Specifically:

- `form`, `input`, `button`, `label` — phone-entry and OTP forms.
- `input-otp` — OTP entry (use this, not a hand-rolled six-input grid).
- `toast` (via `sonner` if you're on the new shadcn default, or `toast` if you're on the legacy one) — every error-toast and security-toast surface listed in the error-mapping table.
- `alert` — the inline `refresh_token_reuse` security notice on `/auth`.

If a component the brief implies isn't already installed in the project, install the shadcn recipe rather than reaching for Radix directly or hand-rolling. Stick to the default shadcn variants; visual deviation belongs in the design system, not in per-form overrides.

---

## Files to create

Suggested layout in the admin-web repo. The engineer can adjust to match existing conventions.

```
app/
  (public)/
    auth/page.tsx                 # phone-entry form
    auth/verify/page.tsx          # OTP-entry form
  api/auth/
    request-otp/route.ts          # BFF: POST /v1/auth/otp
    verify/route.ts               # BFF: POST /v1/auth/verify (sets cookies)
    refresh/route.ts              # BFF: POST /v1/auth/refresh (rotates cookies)
    logout/route.ts               # BFF: POST /v1/auth/logout (clears cookies)
    me/route.ts                   # BFF: returns { user_id } from access cookie
middleware.ts                     # route-group auth enforcement
lib/
  api.ts                          # fetch wrapper with refresh retry
  auth/
    context.tsx                   # <AuthProvider> + useAuth()
    cookies.ts                    # set / clear auth-cookie helpers (server-only)
    device-label.ts               # UA -> "Chrome on macOS"
    schemas.ts                    # zod schemas for phone & otp
```

---

## Testing

Required tests (the engineer should write these before the UI is "done"):

- **Unit:** `device-label.ts` against a battery of UA strings.
- **Unit:** zod schemas accept good inputs and reject bad ones.
- **Unit:** `lib/api.ts` refresh-on-401 path with a mocked fetch — happy path, refresh-fails path, parallel-401 concurrency path.
- **Integration:** Route Handlers — assert cookies are set with the right attributes (HttpOnly, Secure, SameSite, path) on verify success; assert cookies are cleared on logout and on refresh-error.
- **Integration:** middleware — protected route without `dwelli_access` redirects to `/auth` with the right `returnTo`; superadmin route without superadmin claim redirects to `/communities`.
- **E2E** (Playwright or similar): full sign-in happy path against the staging backend; full sign-in with wrong OTP; full sign-in with rate-limited phone.

Logout, refresh, and reuse-detection paths are worth E2E too, but they can lag the happy path if the team is small.

---

## Security non-negotiables (do not skip)

- Tokens **never** appear in JavaScript-accessible storage (no `localStorage`, no `sessionStorage`, no in-memory globals beyond a transient refresh-in-flight promise).
- Tokens **never** appear in URLs (no query strings, no hash fragments).
- Tokens **never** appear in logs (browser console or server-side). The BFF Route Handlers must not log request or response bodies.
- BFF Route Handlers **never** echo the access or refresh token back to the browser in a response body. The verify Route Handler returns `{ user_id }` only.
- The refresh cookie's `Path=/api/auth` is load-bearing — don't widen it.
- Phone numbers are sensitive (and now international). Don't put them in URL params or analytics events.

---

## Out of scope

- Post-auth routing (where to send the user after verify) — see `design-brief-onboarding-flow.md`.
- Profile completion screen — same brief.
- Manage-devices UI (`/v1/me/devices`) — separate spec when needed.
- Social / email auth — V1 is phone + OTP only.
- Server-side rendering of authenticated pages with user data — possible later; for V1 fetch client-side.

---

## Open questions

1. **Does the backend expose a `GET /v1/me` endpoint** that the BFF's `/api/auth/me` Route Handler can proxy? If not, the Route Handler will decode the JWT server-side to extract `user_id`. Confirm preference.
2. **Cookie domain across subdomains.** Spec assumes admin web and API live on the same host (or the admin web is the only consumer of the cookie). If `dwelli.co` is the admin web and the API is on `api.dwelli.co`, the BFF proxy pattern still works fine because cookies are scoped to the admin-web host; confirm.
3. **CSRF.** `SameSite=Lax` on the access cookie and `SameSite=Strict` on the refresh cookie give us baseline CSRF protection for the verify and refresh flows. If we ever expose a mutating endpoint on a `GET` (we shouldn't), we'll need explicit CSRF tokens. For V1 the SameSite defaults are sufficient. Confirm we agree.

---

*Dwelli Technologies Limited — Engineering spec — 2 June 2026 — Internal*
