# Dwelli — Landing & Web App

Next.js 16 (App Router) frontend for Dwelli. Acts as both the marketing landing
page and the authenticated web app (resident, admin, and superadmin surfaces),
with a thin BFF layer under `src/app/api` that proxies to the Dwelli backend.

## Tech stack

- Next.js 16 (App Router, Turbopack, standalone output)
- React 19 + TypeScript 5
- Tailwind CSS 3
- `react-hook-form` + Zod for forms; `react-phone-number-input` + `input-otp`
  for the auth UI
- `jose` for JWT verification in the edge proxy
- pnpm (workspace) + mise for tool pinning (Node 24.14.1)
- Docker / Railway for deployment

## Prerequisites

- [mise](https://mise.jdx.dev/) (picks up `mise.toml` → Node 24.14.1)
- pnpm (enable via `corepack enable`)

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server runs on http://localhost:3000 with Turbopack.

### Environment variables

Create `.env.local` at the repo root:

| Variable             | Required | Notes                                                              |
| -------------------- | -------- | ------------------------------------------------------------------ |
| `DWELLI_API_URL`     | yes      | Base URL of the Dwelli backend the BFF proxies to.                 |
| `AUTH_COOKIE_SECURE` | no       | Set to `false` for local HTTP development. Defaults to `true`.     |

Server-only env access lives in `src/lib/env.ts`.

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `pnpm dev`     | Start the dev server (Turbopack).    |
| `pnpm build`   | Production build (standalone).       |
| `pnpm start`   | Run the production build locally.    |
| `pnpm lint`    | Run ESLint.                          |

## Project layout

```
src/
  app/
    (public)/        # Marketing + /auth (sign-in, OTP)
    (admin)/         # Authenticated resident/admin: /communities, /onboarding, /wizard
    (superadmin)/    # /admin surfaces, gated on the `superadmin` JWT claim
    api/             # BFF routes (auth refresh, /me, etc.)
  components/        # Shared UI + feature components (forms, navbar, footer)
  lib/
    api.ts           # Browser fetch helper with refresh-on-401
    auth/            # JWT verification, cookie helpers, session storage
    env.ts           # Server-only env access
  proxy.ts           # Edge middleware: classifies routes + enforces auth
mocks/               # Design references and prototype HTML (not shipped)
plans/               # Specs and design briefs
```

Route protection is centralised in `src/proxy.ts`: any path under the admin or
superadmin prefix lists requires a valid access cookie, with superadmin routes
additionally gated on the `superadmin` claim.

## Build & deploy

The app builds as a Next.js [standalone](https://nextjs.org/docs/app/api-reference/next-config-js/output)
bundle and ships in the multi-stage `Dockerfile`. Railway is configured via
`railway.toml` and uses `/` as the healthcheck.

> **Important:** Do not set `NODE_ENV=development` in your shell or CI
> environment before running `pnpm build`. Next.js sets `NODE_ENV=production`
> internally during builds, and overriding it causes cryptic failures such as
> `<Html> should not be imported outside of pages/_document`.
