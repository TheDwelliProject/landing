# Dwelli — Landing & Web App

Next.js 16 (App Router) frontend for Dwelli: the marketing landing page plus
the authenticated web app (resident, admin, superadmin surfaces). A thin BFF
layer under `src/app/api` proxies to the Dwelli backend — the browser never
talks to the backend directly.

## Commands

Node is pinned via `mise.toml` (24.14.1); the package manager is pnpm.

| Command             | What it does                         |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Dev server (Turbopack) on :3000      |
| `pnpm build`        | Production build (standalone output) |
| `pnpm lint`         | ESLint (next core-web-vitals + ts)   |
| `pnpm typecheck`    | `tsc --noEmit`                       |
| `pnpm test`         | Vitest (jsdom, globals enabled)      |
| `pnpm format:check` | Prettier check (tabs, tabWidth 4)    |
| `pnpm format:fix`   | Prettier write                       |

Before considering a change done, run `pnpm lint`, `pnpm typecheck`, and
`pnpm test`.

## Code style

- TypeScript strict; indent with tabs (`.prettierrc`: `useTabs`, tabWidth 4).
- Import app code via the `@/` alias (maps to `src/`).
- Server-only modules start with `import "server-only"` so a client-side
  import fails the build. Follow this for anything that touches `env`,
  cookies, or the backend.
- All env access goes through `src/lib/env.ts` — never read `process.env`
  directly in app code (exception: `src/lib/auth/jwt.ts`, which must stay
  edge-compatible and reads its own vars lazily).
- Errors are typed classes (`ApiError`, `BackendError`, `InvalidJwtError`,
  …) discriminated with `instanceof`, never string matching on messages.
- Comments explain constraints the code can't show (see `sign-in-form.tsx`,
  `storage.ts`); don't narrate what the code does.

## Architecture

```
src/
  proxy.ts           # Edge middleware: classifies routes, enforces auth
  app/
    (public)/        # Marketing + /auth sign-in/OTP — no auth required
    (authed)/        # /communities, /onboarding, /wizard — needs valid access JWT
    (superadmin)/    # /admin — additionally needs the `superadmin` JWT claim
    api/             # BFF routes: validate, forward to backend, manage cookies
  components/        # Shared UI; shadcn primitives in components/ui
  lib/
    api.ts           # Browser fetch helper: JSend parsing + refresh-on-401
    auth/            # Cookies, JWT verification, schemas, route helpers
    env.ts           # Server-only env access
```

Request flow: browser → `apiFetch` (same-origin, cookies) → BFF route →
`callBackend` (adds bearer/JSON headers) → `DWELLI_API_URL`. Both hops speak
the JSend envelope (`{status: "success", data}` / `{status: "error", code,
message, data?}`).

## Security invariants (do not weaken)

- **Tokens live only in httpOnly cookies** set by the BFF
  (`src/lib/auth/cookies.ts`). Never expose access/refresh tokens to client
  JS, localStorage, or query strings. The refresh cookie is `SameSite=Strict`
  and path-scoped to `/api/auth`; keep it that way.
- **The browser never calls `DWELLI_API_URL`.** New backend interactions get
  a BFF route under `src/app/api`; client code uses `apiFetch` against it.
- **Validate every BFF request body with Zod** (`src/lib/auth/schemas.ts`
  pattern) before forwarding. Return a `validation_failed` JSend error
  (status 400) on failure.
- **`returnTo` values are open-redirect vectors.** Anything user-supplied
  that gets redirected to must pass `safeReturnTo`
  (`src/lib/auth/return-to.ts`), which allowlists known path prefixes.
- **Route protection is centralized in `src/proxy.ts`.** When adding a
  protected route prefix, update BOTH `ADMIN_PREFIXES`/`SUPERADMIN_PREFIXES`
  in `src/proxy.ts` AND `ALLOWED_RETURN_PREFIXES` in
  `src/lib/auth/return-to.ts` — they must stay in sync or users either lose
  protection or can't return after sign-in.
- **JWT verification** (`src/lib/auth/jwt.ts`) pins issuer, audience, and an
  algorithm allowlist (no `none`, no HS\*). Infrastructure failures (JWKS
  unreachable) throw `JwtVerifierUnavailableError` and must surface as 503,
  never as a silent pass or a redirect loop.
- **Never log tokens, OTP codes, or phone numbers.**

## Environment variables

Server-side only; create `.env.local` for development.

| Variable             | Required | Purpose                                                                                                                                                                                                                                               |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DWELLI_API_URL`     | yes      | Backend base URL the BFF proxies to                                                                                                                                                                                                                   |
| `APP_ORIGIN`         | no       | Canonical external origin (e.g. `https://app.dwelli.com`) auth redirects resolve against; prevents the internal container host leaking behind Railway and ignores spoofable `X-Forwarded-*`. Unset in dev falls back to forwarded headers/request URL |
| `AUTH_JWKS_URL`      | yes      | JWKS endpoint for access-JWT verification                                                                                                                                                                                                             |
| `AUTH_JWT_ISSUER`    | yes      | Expected `iss` claim                                                                                                                                                                                                                                  |
| `AUTH_JWT_AUDIENCE`  | yes      | Expected `aud` claim                                                                                                                                                                                                                                  |
| `AUTH_JWT_ALGORITHM` | no       | Defaults to RS256; must be on the allowlist                                                                                                                                                                                                           |
| `AUTH_COOKIE_SECURE` | no       | Set `false` only for local HTTP; default true                                                                                                                                                                                                         |

## Testing

Vitest + Testing Library, jsdom, `globals: true` (`describe`/`it`/`expect`
still imported explicitly today — match the existing style). Tests live in
`__tests__` directories next to the code (e.g.
`src/components/__tests__/navbar.test.tsx`). `vitest.setup.ts` loads
jest-dom matchers.

## Non-shipped directories

- `mocks/` — static HTML/PNG design references; never imported by the app.
- `plans/` — specs and design briefs (`spec-auth-web-frontend.md` is the
  source of truth for auth flows and error-code → UI mapping).
- `.context/` — gitignored agent scratch space; ESLint ignores it.
