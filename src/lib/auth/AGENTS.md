# Auth library (`src/lib/auth`)

Everything session-related: cookie management, JWT verification, request
schemas, JSend route helpers, and the client-side auth context. Most
modules are server-only — keep the `import "server-only"` guard when
editing them.

## Module map

| Module            | Side    | Role                                                           |
| ----------------- | ------- | -------------------------------------------------------------- |
| `cookie-names.ts` | shared  | Cookie name constants (safe for the edge proxy to import)      |
| `cookies.ts`      | server  | Sets/clears the httpOnly access + refresh cookies              |
| `backend.ts`      | server  | `callBackend`: fetch to `DWELLI_API_URL`, JSend unwrap         |
| `route-utils.ts`  | server  | `jsendSuccess`/`jsendError`/`mapBackendError`                  |
| `jwt.ts`          | edge-ok | Access-JWT verification via remote JWKS (used by `proxy.ts`)   |
| `return-to.ts`    | shared  | `safeReturnTo` open-redirect allowlist                         |
| `schemas.ts`      | shared  | Zod schemas shared by forms and BFF routes                     |
| `errors.ts`       | client  | Maps `ApiError`/`NetworkError` to inline/toast/logout behavior |
| `context.tsx`     | client  | `AuthProvider`/`useAuth` session state                         |
| `storage.ts`      | client  | sessionStorage keys handed between auth screens                |

## Invariants

- **Cookie attributes are deliberate.** Access cookie: `SameSite=Lax`,
  path `/`. Refresh cookie: `SameSite=Strict`, path-scoped to
  `/api/auth` so it is only ever sent to the refresh/logout endpoints.
  Both httpOnly, `secure` controlled by `env.AUTH_COOKIE_SECURE`. Don't
  loosen any of these.
- **`jwt.ts` must stay edge-runtime compatible** — it runs inside
  `src/proxy.ts`. No Node-only APIs, no `server-only`, no `@/lib/env`
  import; it reads its env vars lazily and throws
  `JwtVerifierUnavailableError` (→ 503 upstream) when they're missing,
  distinct from `InvalidJwtError` (→ treated as unauthenticated). Keep the
  algorithm allowlist; never accept `none` or HMAC algorithms.
- **`safeReturnTo` is the only way to consume a `returnTo` value.** Its
  prefix allowlist must match the protected prefixes in `src/proxy.ts`.
  It resolves against a fixed local origin so absolute/protocol-relative
  URLs can't escape — preserve that.
- **Schemas are shared on purpose**: the same Zod schema validates the
  form client-side and the BFF route server-side. Change one place,
  both sides update.
- New sessionStorage keys go in `storage.ts` with a comment saying which
  screen writes and which reads — never inline string literals.
- Client error UX goes through `mapError`/`applyError` in `errors.ts`,
  keyed on backend error codes per `plans/spec-auth-web-frontend.md`.
  Add new codes there, not ad-hoc in components.
