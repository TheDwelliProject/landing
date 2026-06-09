# Design brief — Dwelli web dashboards (V1)

**Prepared for** Designer
**Prepared by** Bolaji, Dwelli Technologies Limited
**Date** 1 June 2026
**Scope** V1 gate access only — no rent, no payments, no ledger
**Deliverable** Hi-fi Figma mockups, responsive across desktop / tablet / mobile-web

---

## What Dwelli is

Dwelli is a property-management platform for Nigerian landlords. The first thing it does for any Community is gate access: residents issue visitor passes from their phone, guards scan them at the gate, visitors who don't have the app can pull a pass by texting a resident.

This brief covers the **web app** (Next.js admin web). The mobile app (Kotlin Multiplatform, iOS + Android) is a separate surface and not part of this brief — but it covers the same gate-access flows, so the resident web experience should feel like a parallel cousin to mobile, not a different product.

Brand system (logo, colours, type, primitives) should follow existing patterns we already have.

---

## The three audiences

The web app serves three distinct people with very different jobs. Their dashboards must feel like three different products tied together by the same brand.

### 1. Superadmin (the founder)

There is currently one superadmin: the founder. Their job is to review and approve incoming Communities within a 24–48h SLA, and to occasionally suspend or audit existing ones. Their day-to-day on the web is **the approval queue** — that is the primary surface, full stop.

What they need to do well, in order:
- Triage the approval queue at a glance — what's oldest, what's approaching the SLA, what looks risky.
- Drill into a single submission, see the requester's profile signal, see the prepared Community setup (Units, drafted residents, drafted guards), and either approve in one tap or reject with a reason.
- Browse all Communities across all states (active, pending, rejected, suspended) to audit or intervene.

What they don't need: dense analytics, charts, configuration. This is an operations console for a small number of high-stakes decisions per day.

### 2. Community admin (the landlord)

A landlord who has been approved and runs their Community day-to-day. This is the **largest and most visually demanding** of the three audiences — they spend the most time here.

What they need to do well, in order:
- See the health of their Community at a glance (residents count, guards count, passes issued recently, requests pending).
- Manage the people: invite residents, invite guards, terminate Memberships, see who's active.
- Manage the physical layout: add / edit / delete Units.
- Audit what's happened: passes issued, requests approved or declined, terminations.
- Manage their own account: profile, active sessions, logout-everywhere.

Community admins have **three distinct lifecycle states** that need distinct treatments:

- **Pending approval** — they've submitted the wizard, can't operate yet, are waiting on the superadmin. The view should reassure (SLA expectation, preserved setup) without feeling empty.
- **Rejected** — they were rejected. Show the reason clearly, preserved setup, a path forward (resubmit / contact).
- **Active** — the full operating dashboard.

There is also the **onboarding wizard** — the four-step flow a new landlord takes from "I just signed up" to "I've submitted my Community for approval." This sits in the public route group, before there's a Community to manage.

### 3. Resident (web)

A resident is someone with an active Membership in one or more Communities. The mobile app is the primary surface for residents — pass issuance, approving incoming requests, managing blocks all live there. The web app gives the same resident a **read-only complementary view** for the times they're not at their phone: pull up the laptop, see what's going on in your Community, review your own history.

What the resident web surface gives them:
- See the Communities they belong to.
- See Community details — name, Units, Membership-level information appropriate to a resident's eyes.
- See their own audit log — passes they've issued, requests they've responded to, with timestamps and outcomes.
- See the count of incoming pass requests waiting on them, with a clear "open the mobile app to respond" affordance — because responding lives on mobile.

What the resident web surface deliberately does **not** give them:
- Pass issuance. **No QR codes are generated on web**, ever.
- Approving or declining incoming pass requests.
- Block-list management.

The visual cue throughout should be calm and informational, not action-heavy — this is a read surface, not a control surface. Buttons that would mutate state belong on mobile and should be absent or replaced with "open in mobile app" affordances on web.

Guards are explicitly **not** in scope for the web app — guards work at the gate with a phone and use the dedicated mobile scanner.

---

## Key flows and screens (prioritised)

The designer should treat the bolded screens as the spine — these are the ones that most need to be right. Sub-bullets are supporting screens.

### Superadmin

- **Approval queue list** — sorted oldest first, visual emphasis on items approaching the 48h SLA, compact per-row summary (requester, account age, Units / residents / guards drafted counts), one-tap Approve.
- **Approval queue detail** — full prepared setup, requester profile signal, Approve button, Reject form with a free-text reason.
- All-Communities list — any status, filterable, with suspend and audit actions.

### Community admin (onboarding — pre-approval)

- Phone + OTP login.
- **Wizard step 1** — Community name, intended size, optional context.
- **Wizard step 2** — add Units (label, count).
- Wizard step 3 — draft resident invitations (phone numbers).
- Wizard step 4 — draft guard invitations.
- Submit-for-review screen.
- **Pending / holding view** — preserved setup, SLA expectation, what happens next.
- Rejected view — rejection reason, preserved setup, path forward.

### Community admin (post-approval — operating)

- **Communities list** — filtered to the user's admin Memberships.
- **Community detail / overview** — header with key health metrics, navigation into sub-pages, soft-ceiling warnings when approaching the resident or guard cap.
- **Residents page** — list, invite, terminate.
- **Guards page** — list, invite, terminate.
- Units page — add, edit, delete (delete disabled if there's an active Tenancy).
- **Audit trail** — chronological list of passes issued, requests approved or declined, Memberships terminated.
- Settings — profile, active sessions list, logout-everywhere.

### Resident (web) — read-only

- Phone + OTP login (same as admin).
- **Resident home** — Communities they belong to, recent passes they've issued, incoming-requests count with an "open in mobile app" affordance.
- **Community detail** — Community metadata, Units, relevant Membership-level info.
- **My audit log** — chronological list of passes they've issued and pass requests they've responded to.
- Settings — profile view, session management. No block-list management here.

### Cross-cutting

These apply to all three audiences. The designer should produce templates / components for each:

- **Community / role switcher** — a user can hold Memberships in multiple Communities and can be an admin in one and a resident in another. The switcher needs to live in a persistent location (likely the top bar) and make the current context unambiguous at all times. Where the user lands at login when they have more than one Membership is part of this design.
- **Empty states** — a brand-new admin with no Units yet; a resident with no recent passes; an empty approval queue. These should feel inviting, not broken.
- **Error states** — API errors surfaced from the backend (every error has a stable `code` field), no-connectivity, permission-denied. Nigerian network conditions are uneven; the design should accommodate that.
- **Loading / skeleton states** — for any list view or detail fetch.
- **Auth gate** — what an unauthenticated user sees if they hit a protected route directly.
- **Wrong-role landing** — a resident who hits a `/admin` URL, a non-superadmin who hits `/admin/queue`.

---

## Constraints and conventions

- **Built in Next.js + Tailwind.** The designer should think in reusable components. A `shadcn/ui` foundation is likely — the designer is welcome to assume Radix-style primitives exist.
- **Mobile-first product, desktop-first admin.** The mobile app is the primary surface for everyday gate access. The admin web is desktop-first because landlords doing setup are at a laptop — but every surface, including the superadmin approval queue, needs to work on tablet and mobile-web. Approvals can happen anywhere; the founder will sometimes be on a phone.
- **Tablet breakpoint should be real, not just "shrunk desktop"** — landlords commonly use iPads. Pixel-perfection on tablet is not required, but the layout decisions should be deliberate.
- **No QR codes are generated on web** — this is reserved for the mobile app where the pass actually gets used. The resident web pass-related views are read-only history, not issuance.
- **Phone numbers are international (E.164)** — country picker visible and switchable, defaulted to NG since most users are Nigerian. Forms accept any internationally-valid mobile number, not Nigerian-only. This applies to every place a phone is captured (resident invites, guard invites, admin profile, etc.).
- **Money is never shown in V1 but the design system should anticipate it for V1.5** — reserve typographic and component patterns for amounts (always paired with a currency code, integer minor units in the model but formatted to two decimal places in display).
- **Trust matters.** This handles residents' identity, eventually rent. The visual register should feel calm, professional, not playful. Closer to a bank than a consumer app.
- **The brand system is authoritative** — colours, type, logo usage, iconography come from the shared brand kit, not the designer's invention. Where the brand kit is silent, the designer proposes within the spirit of it.

---

## Out of scope

So the designer doesn't waste effort on the wrong things:

- Rent, payment flows, ledger views, agreements, settlement destinations — all V1.5, designed later.
- The mobile app screens (iOS + Android) — separate brief, separate cycle.
- The guard scanner — mobile only, full-screen, has its own UX constraints (outdoor sunlight, haptics, audible feedback) that don't apply on web.
- Marketing site / landing page — separate.
- Push-notification UI — V1 uses SMS only; push lands in Phase 2.

---

## Deliverables

- Hi-fi Figma frames for every spine screen listed above, with the supporting screens at a reasonable fidelity.
- Responsive variants for each: **desktop (≥ 1280px)**, **tablet (768–1279px)**, **mobile web (≤ 767px)**. The resident surfaces especially need to work on mobile web.
- A component library inside the Figma file — buttons, inputs, form fields, modals, tables, list rows, empty states, badges, status pills — reusable, with variants for state (default, hover, active, disabled, error).
- Documented use of the brand system — type scale, colour roles (background, surface, text, accent, success, warning, error), spacing scale.
- A short Loom or written walkthrough of the IA decisions, especially anywhere the designer deviated from the spine described above.

---

*Dwelli Technologies Limited — Design brief — 1 June 2026 — Internal*
