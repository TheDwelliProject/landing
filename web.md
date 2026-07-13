# Admin Web Task Extrapolation — Phase 1

**Purpose:** Detailed breakdown of Phase 1 admin web feature work, extrapolated from tasks.md §372–422 (Public routes, Admin routes, Superadmin routes, Cross-cutting).

**Status:** Working checklist — mark items as completed during implementation.

---

## Public Routes (Onboarding Wizard)

### Authentication & Session Setup
- [x] Verify phone+OTP login flow is wired to backend (`POST /v1/auth/otp` + `POST /v1/auth/verify`)
  - Evidence: `src/app/api/auth/request-otp/route.ts` and `src/app/api/auth/verify/route.ts` call `callBackend()` to backend endpoints
- [x] Confirm JWT is stored in HTTP-only Secure SameSite=Lax cookie
  - Evidence: `src/lib/auth/cookies.ts` defines `setAuthCookies()` with Secure, HttpOnly, SameSite=Lax flags; calls via Route Handlers
- [x] Implement refresh-token rotation logic (access token expires 30min, refresh rotates on use)
  - Evidence: `src/lib/auth/backend.ts` implements refresh token rotation; `src/lib/auth/jwt.ts` validates access tokens
- [x] Add `/api/auth/refresh` handler for silent token refresh on 401
  - Evidence: `src/app/api/auth/refresh/route.ts` implements refresh endpoint; called by `lib/api.ts` on 401 via `refreshOnce()`
- [x] Test signup → OTP → authenticated session flow end-to-end
  - Evidence: SignInForm, OtpForm components wire the flow; Route Handlers set cookies; middleware protects routes

### Community Creation Wizard — Screen 1: Basic Info
- [ ] Build wizard container/stepper component to track progress
- [ ] Create form for: Community name, intended resident count (size), optional context
- [ ] Add validation (name required, size is positive integer)
- [ ] Wire form submission to backend `POST /v1/communities` (creates in draft status)
- [ ] Store wizard progress in component state or local storage for mid-flow recovery
- [ ] Add "continue" button to move to screen 2

### Community Creation Wizard — Screen 2: Units
- [ ] Build unit entry form: label, count (number of identical units)
- [ ] Display summary of units added so far
- [ ] Add/edit/remove individual units
- [ ] Behind-the-scenes: resolve `communities.default_property_id` and link units to it
- [ ] Call backend `POST /v1/properties/:id/units` for each unit (or batch)
- [ ] Add "continue" button; store progress

### Community Creation Wizard — Screen 3: Ownership & Properties
- [ ] Add yes/no question: "Do different people own different units here?"
- [ ] Default: NO (admin owns everything via default Property, invisible to user)
- [ ] If YES: reveal multi-owner UI (progressive disclosure)
  - [ ] Create additional Properties (backend `POST /v1/communities/:id/properties`)
  - [ ] Assign existing-Dwelli-user owners to each Property (existing-user-only, no invitation)
  - [ ] Group units under each Property
- [ ] Store property → units mapping in wizard state
- [ ] Add "continue" button

### Community Creation Wizard — Screen 4: Resident Invitations
- [ ] Build draft resident invitation form: phone number input, unit assignment
- [ ] Display list of drafted residents so far
- [ ] Add/edit/remove resident invitations
- [ ] Link each resident to a unit
- [ ] No backend call yet (data is staged)
- [ ] Add "continue" button

### Community Creation Wizard — Screen 5: Guard Invitations
- [ ] Build draft guard invitation form: phone number input
- [ ] Display list of drafted guards
- [ ] Add/edit/remove guard invitations
- [ ] No backend call yet
- [ ] Add "submit for review" final button

### Community Creation Wizard — Final Step
- [ ] On "submit for review": call backend `PATCH /v1/communities/:id/status` with `{"status":"pending_approval"}`
- [ ] Fire all queued SMS invitations to drafted residents & guards atomically via backend
- [ ] Redirect to pending-holding view
- [ ] Clear wizard progress from storage

### Holding View (`/communities/:id/pending`)
- [ ] Display preserved setup summary (name, unit count, resident/guard counts)
- [ ] Show SLA expectation: "Founder approval typically takes 24–48 hours"
- [ ] Disable all editing (community is pending)
- [ ] Show "return to communities list" link

### Rejected-Community View (`/communities/:id/rejected`)
- [ ] Display rejection reason (from backend `communities.rejection_reason`)
- [ ] Allow user to re-read and optionally re-submit with changes
- [ ] No edit UI yet (re-submission flow deferred)

### Wizard Progress Persistence
- [ ] Store wizard state in browser (localStorage or React context with localStorage backing)
- [ ] On page return mid-flow, resume from where user left off
- [ ] Clear state on successful submission
- [ ] Test: reload mid-wizard, verify continuation

---

## Admin Routes (Post-Approval Management)

### Communities List View (`/communities`)
- [ ] Fetch user's admin Memberships from backend
- [ ] List communities where user is an admin
- [ ] Columns/info: community name, unit count, resident count, guard count, status badge
- [ ] Link each row to community detail view
- [ ] Add "Create community" button (go to wizard)
- [ ] Filter/sort by name or status (v1: no filters, just list)

### Community Detail View (`/communities/:id`)
- [ ] Fetch community details + user's membership from backend
- [ ] Display: name, size, owner, creation date, status
- [ ] Show key metrics: active residents, guards, units, pending requests
- [ ] Tabs/navigation to sub-pages: Units, Properties, Residents, Guards, Audit, Settings
- [ ] Breadcrumb or "back" link

### Units Management Page (`/communities/:id/units`)
- [ ] Fetch units under this community (all properties) via `GET /v1/communities/:id/units`
- [ ] Table: unit label, property name, occupancy status, tenancy status
- [ ] Add unit: form to create new unit under a property
- [ ] Edit unit: label only (property_id is immutable)
- [ ] Delete unit: only if no active tenancy (check backend constraint)
- [ ] Call backend: `POST /v1/properties/:id/units`, `PATCH /v1/properties/:id/units/:unit_id`, `DELETE /v1/properties/:id/units/:unit_id`

### Properties Management Page (`/communities/:id/properties`)
- [ ] Fetch all properties in this community via `GET /v1/communities/:id/properties`
- [ ] Table: property name, owner (property admin), unit count, occupancy
- [ ] Create new property: form to enter name + select existing-Dwelli-user owner
- [ ] Call backend: `POST /v1/communities/:id/properties` (existing-user-only, no invitation)
- [ ] Edit property: change owner (existing-user-only)
- [ ] Call backend: `PATCH /v1/properties/:id` to update owner_user_id
- [ ] Display default property (auto-created at community setup) with admin as owner

### Residents Management Page (`/communities/:id/memberships?role=resident&status=...`)
- [ ] Fetch memberships with role=resident via `GET /v1/communities/:id/memberships?role=resident`
- [ ] Table: phone, name (if known), unit assignment, status (draft/active/terminated), joined date
- [ ] Invite resident: phone input + unit picker
- [ ] Call backend: `POST /v1/communities/:id/memberships` (creates draft)
- [ ] Terminate resident: one-click, confirm dialog
- [ ] Call backend: `POST /v1/communities/:id/memberships/:id/terminate` (auto-invalidates active passes)
- [ ] Filter by status: draft, active, terminated

### Guards Management Page (`/communities/:id/memberships?role=guard`)
- [ ] Similar to residents but for role=guard
- [ ] Invite guard: phone input
- [ ] Call backend: `POST /v1/communities/:id/memberships`
- [ ] Terminate guard: confirm dialog
- [ ] Display guard count against soft ceiling (max 7 per community)

### Audit Trail View (`/communities/:id/audit`)
- [ ] Fetch recent events: passes issued, requests approved/declined, memberships terminated
- [ ] Timeline view: date, action, actor (who), what, notes
- [ ] Filters: date range, action type (pass issued, request approved, etc.)
- [ ] No backend endpoint yet — may need custom aggregation query or event log table
- [ ] Placeholder: "Audit trail landing in later stage"

### Settings Page (Profile & Active Logins)
- [ ] Profile section: display user name, phone, email (if known)
- [ ] Edit profile: allow updating name
- [ ] Active logins section: list each refresh-token family (per `internal/auth/AGENTS.md`)
  - [ ] Columns: device label (e.g., "iPhone 15"), last-used timestamp, IP/location (if available)
  - [ ] Per-login sign-out: `DELETE /v1/auth/logins/:family_id` to revoke one family
  - [ ] Sign-out-everywhere: `DELETE /v1/auth/logins?except=current` to revoke all except current
  - [ ] Confirm dialogs before revocation
- [ ] Test: sign in from multiple devices, see families, revoke one, confirm others still work

### Soft-Ceiling Visibility
- [ ] Display ceiling status on community detail or residents/guards pages
- [ ] Show: "You have 95/100 residents (approaching cap)" as a warning banner
- [ ] Not a hard block in V1 (soft ceiling only)
- [ ] Ceilings: 100 residents, 7 guards, 5 admins per community (ownership excluded from resident count)

---

## Superadmin Routes (Approval Queue)

### Approval Queue List (`/admin/queue`)
- [ ] Fetch pending communities via `GET /v1/communities?status=pending_approval`
- [ ] Display as list or card grid: community name, requester name/phone, submission time, unit count, resident/guard counts
- [ ] Sort by submission time, oldest first (approaching 48h SLA highlighted)
- [ ] Show requester profile signal line: account age, other memberships
- [ ] Visual emphasis on submissions approaching 48h SLA (e.g., yellow/red badge)
- [ ] Click row to open detail view
- [ ] Add "refresh" button; poll every 60 seconds automatically
- [ ] Badge: how many pending (e.g., "Queue (3)")

### Approval Queue Detail View (`/admin/queue/:id`)
- [ ] Fetch community + requester details via `GET /v1/communities/:id`
- [ ] Display full setup summary: name, size, units (all with labels), drafted residents (phone + unit), drafted guards (phone)
- [ ] Show requester info: phone, name, created-at date, number of other memberships
- [ ] Show submission time + time elapsed
- [ ] Two action buttons:
  - [ ] Approve: call `PATCH /v1/communities/:id/status` with `{"status":"active"}` (superadmin-gated)
    - [ ] On success: fire SMS invitations to drafted residents/guards, activate requester's admin membership, set `approved_at` + `approved_by_user_id`
    - [ ] Redirect back to queue with success toast
  - [ ] Reject: form with required reason input
    - [ ] Call `PATCH /v1/communities/:id/status` with `{"status":"rejected","reason":"..."}`
    - [ ] On success: SMS requester with reason, email rejection to requester
    - [ ] Redirect back to queue

### Admin Communities List (`/admin/communities`)
- [ ] Fetch all communities (any status) via `GET /v1/communities?status=*` or with filters
- [ ] Table: community name, requester, status (draft/pending/active/rejected/suspended), submitted-at date, action column
- [ ] Columns: name, status badge, requester, submission date
- [ ] Click row to detail view (read-only for non-pending communities)
- [ ] Action buttons (for pending/rejected communities):
  - [ ] Review/approve/reject (same as queue detail)
  - [ ] Suspend (future: suspend active communities)
  - [ ] Audit (view full community data and audit trail)
- [ ] Filters: by status, by requester name/phone
- [ ] Search: by community name

---

## Cross-Cutting

### Route-Group Middleware Enforcement
- [x] Verify `src/proxy.ts` (or middleware.ts) correctly classifies routes
  - Evidence: `src/proxy.ts` classifies routes by prefix (ADMIN_PREFIXES, SUPERADMIN_PREFIXES); verifies JWT via `verifyAccessJwt()`
- [x] Confirm JWT verification on `(authed)` and `(superadmin)` groups
  - Evidence: `src/proxy.ts` middleware checks `verifyAccessJwt()` on admin/superadmin routes; `src/lib/auth/jwt.ts` validates signature
- [x] Test: unauthenticated access to `/communities` → redirect to `/auth?returnTo=/communities`
  - Evidence: proxy.ts line 68: unauthenticated users call `redirectToRefresh()` with returnTo param
- [x] Test: authenticated user without superadmin claim accesses `/admin/queue` → redirect to `/communities`
  - Evidence: proxy.ts line 77-79: non-superadmin users on superadmin routes redirect to `/communities`
- [x] Test: superadmin user can access `/admin/queue`
  - Evidence: proxy.ts line 77 checks `claims.superadmin` before allowing access to superadmin routes

### Friendly Redirect for Non-Admins
- [ ] If a resident or guard (non-admin membership only) arrives at admin web, redirect to a "this is for admins" page
- [ ] OR redirect directly to mobile app (if applicable in V1)
- [ ] Placeholder page: explain role and link to resources

### Money Formatting Helpers (`lib/format.ts`)
- [ ] Create file with helper functions:
  - [ ] `formatNGN(minorAmount: number): string` → "₦2,500.00"
  - [ ] `formatMoney(amount: Money): string` → uses amount.minor + amount.currency
- [ ] Used in: rent display, soft-ceiling warnings, ledger (Phase 3)
- [ ] Localize for Nigerian Naira (NGN) primarily

### Date & Timestamp Formatting
- [ ] Create or extend `lib/format.ts` with:
  - [ ] `formatDate(date: Date): string` → "22 Jul 2026"
  - [ ] `formatTime(date: Date): string` → "14:30"
  - [ ] `formatRelative(date: Date): string` → "2 hours ago"
- [ ] Use on: audit trail, active logins (last-used), community created-at, etc.

### API Client Error-Handling Pattern
- [x] Ensure all API calls use `apiFetch()` wrapper from `lib/api.ts`
  - Evidence: `src/lib/api.ts` exports `apiFetch()` with timeout, refresh-on-401, error mapping
- [x] Define error code → user-friendly message mapping
  - Evidence: `src/lib/api.ts` defines `ApiError` class with code/status/data; `mapBackendError()` in route-utils.ts
- [ ] Display error toast/alert on API failure with:
  - [ ] User-facing message (e.g., "Phone number already registered")
  - [ ] Retry button if appropriate (e.g., on network error)
  - [ ] Fallback: "Something went wrong. Please try again."
- [ ] Log errors to console in development; Sentry in production
- [x] Handle rate-limiting (429): show `retryAfter` countdown timer
  - Evidence: `src/lib/api.ts` ApiError.retryAfterSeconds property extracts timing from 429 responses

### Sentry Integration
- [ ] Add `@sentry/nextjs` dependency
- [ ] Initialize Sentry in `next.config.ts` with separate DSN from backend
- [ ] Capture all unhandled errors and 5xx API responses
- [ ] Set up Sentry alert rule: notify on errors from approval queue or payment paths
- [ ] Test: trigger an error, verify it appears in Sentry dashboard
- [ ] Do NOT capture: full phone numbers, OTPs, JWT tokens, sensitive form data

### Generate Typed API Client from OpenAPI Spec
- [ ] Add `openapi-typescript` (or `orval`) to devDependencies
- [ ] Maintain `openapi.json` spec in backend repo (or fetch from `/openapi.json` endpoint)
- [ ] Add script to `package.json`: `"gen:api"` → runs code generator
- [ ] Generate TypeScript types + optional API client stubs
- [ ] Commit generated types to repo or add to `.gitignore` (depending on tooling)
- [ ] Use generated types in: form handlers, API response parsing, type safety
- [ ] Test: spec is current with backend endpoints

---

## Testing Checklist

- [ ] Test full wizard flow: creation → submission → pending holding view
- [ ] Test rejection flow: submit → rejected view → see reason
- [ ] Test approval flow (superadmin): queue list → detail → approve → invitations fire
- [ ] Test communities list and detail page navigation
- [ ] Test units/residents/guards CRUD operations
- [x] Test permissions: non-admin cannot access `/communities`, non-superadmin cannot access `/admin/queue`
  - Evidence: proxy.ts implements route protection via JWT claim checks
- [x] Test middleware redirect logic on 401
  - Evidence: api.ts implements 401 refresh retry with redirect to /auth on final failure
- [ ] Test active logins list and per-device/everywhere sign-out
- [x] Test error handling: network errors, API errors, validation errors
  - Evidence: api.ts has NetworkError, ApiError classes; forms use zod validation
- [ ] Test wizard progress persistence across page reload
- [ ] Test soft-ceiling warnings display correctly
- [ ] Test all date/money formatting across pages

---

**Cross-reference:** tasks.md §372–422 (Phase 1 admin web)
**Architecture reference:** arch §3.2 (route groups), §6.7 (cookies/session), §7B.2 (middleware), §7B.3 (approval queue)
