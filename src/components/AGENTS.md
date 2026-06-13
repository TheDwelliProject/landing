# Components (`src/components`)

- `components/ui/` holds shadcn/ui primitives (new-york style, see
  `components.json`). Generate new ones with the shadcn CLI or copy the
  existing pattern (cva variants + `cn()` from `@/lib/utils`); keep app
  logic out of this directory.
- Everything else is feature components. Mark them `"use client"` only
  when they need state/effects/handlers.
- Forms use react-hook-form + `zodResolver` with schemas imported from
  `@/lib/auth/schemas` (shared with the BFF — don't fork validation
  rules into the component). Submit via `apiFetch`; map failures with
  `applyError`/`mapError` from `@/lib/auth/errors` (inline field error,
  toast via sonner, or forced logout) instead of hand-rolled try/catch
  messaging.
- Auth-aware rendering uses `useAuth()` from `@/lib/auth/context`;
  page-level gating uses `<RequireAuth>`. The auth state is
  three-valued (`unknown | unauthenticated | authenticated`) — render the
  fallback during `unknown`, don't flash redirects.
- Tests live in `__tests__/*.test.tsx` next to the components, using
  Testing Library with role/name queries (see `navbar.test.tsx`). Add or
  update a test when changing user-visible behavior.
- Style with Tailwind design tokens from `tailwind.config.ts`; `cn()` for
  conditional classes. Icons come from lucide-react.
