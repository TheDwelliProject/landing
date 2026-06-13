# App routes (`src/app`)

## Route groups

- `(public)` — marketing pages and `/auth` (sign-in, OTP verify). No auth.
- `(authed)` — `/communities`, `/onboarding`, `/wizard`, … Requires a valid
  access JWT; layout wraps children in `<AuthProvider>`.
- `(superadmin)` — `/admin/*`. Requires the `superadmin` JWT claim on top
  of a valid session.

Enforcement does NOT come from the route group itself — it comes from the
edge middleware in `src/proxy.ts`, which classifies by URL prefix
(`ADMIN_PREFIXES`, `SUPERADMIN_PREFIXES`). A page placed in `(authed)` but
missing from the prefix lists is publicly reachable.

## Adding a protected route

1. Put the page in the right route group.
2. Add its prefix to `ADMIN_PREFIXES` or `SUPERADMIN_PREFIXES` in
   `src/proxy.ts`.
3. Add the same prefix to `ALLOWED_RETURN_PREFIXES` in
   `src/lib/auth/return-to.ts` so post-sign-in redirects can land there.
4. Client-side, use `<RequireAuth>` / `useAuth()` for in-page gating; the
   middleware handles the cookie check, the client context handles UX
   (redirect with `returnTo` once state resolves to unauthenticated).

## Conventions

- Pages export `metadata` with a `"Page — Dwelli"` title.
- Server components by default; `"use client"` only where interaction
  requires it (forms live in `src/components`, pages stay thin).
- Data fetching from the browser goes through `apiFetch` (`@/lib/api`)
  against `/api/*` BFF routes — never to the backend directly.
- Styling uses the design tokens from `tailwind.config.ts`
  (`charcoal`, `cream`, `orange`, `green`, …; `font-display`,
  `font-serif`, `font-mono`) — don't introduce one-off hex values for
  brand colors. Visual references live in `mocks/`.
