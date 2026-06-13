# BFF routes (`src/app/api`)

Thin proxy layer between the browser and the Dwelli backend. Every route
here follows the same shape — copy an existing one
(`auth/verify/route.ts` is a good template) rather than inventing a new
pattern.

## Route checklist

1. `export const runtime = "nodejs"` at the top.
2. Parse the body with `request.json()` in a try/catch →
   `jsendError("invalid_body", 400, "Malformed JSON")` on failure.
3. Validate with a Zod schema from `@/lib/auth/schemas` (or a sibling
   schemas module) → on failure, `jsendError` with code
   `validation_failed`, status 400, and `zodErrorToMessage(parsed.error)`.
4. Call the backend via `callBackend` from `@/lib/auth/backend` — never
   `fetch(env.DWELLI_API_URL...)` directly. Pass the access token with the
   `bearer` option when the endpoint needs auth.
5. Respond with `jsendSuccess(...)` / `jsendError(...)` from
   `@/lib/auth/route-utils`; map thrown backend errors with
   `mapBackendError(err)` in the catch.

## Cookies and tokens

- Routes that mint or rotate tokens call `setAuthCookies(response, pair)`
  on the response; routes that invalidate a session call
  `clearAuthCookies(response)`. Cookie attributes live in
  `@/lib/auth/cookies.ts` — never set auth cookies by hand.
- Token pairs from the backend go straight into cookies. Never include
  `access_token`/`refresh_token` in a JSON response body.
- Only forward to the client the fields it actually needs (see
  `auth/verify`: returns `user_id` and `is_new_user`, not the token pair).

## Error semantics

- Backend error codes pass through verbatim (`mapBackendError` preserves
  `code`, `status`, `message`, `data`) — the client's
  `mapError`/`applyError` in `@/lib/auth/errors.ts` keys off these codes,
  so don't rename or swallow them.
- `BackendNetworkError` → 502 `internal_error`; anything unexpected → 500
  `internal_error`. Don't leak backend internals in messages.
- On refresh failure, clear cookies only for the invalid-token code set
  (see `INVALID_REFRESH_CODES` in `auth/refresh/route.ts`) — a backend
  outage must not log users out.
