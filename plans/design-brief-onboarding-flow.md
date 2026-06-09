# Design brief — Dwelli onboarding & auth flow (V1)

**Prepared for** Designer
**Prepared by** Bolaji, Dwelli Technologies Limited
**Date** 1 June 2026
**Scope** Public marketing entry → auth → post-auth routing → wizard entry. V1 only.
**Companion to** `design-brief-web-dashboards.md` (which covers the dashboards a user lands in *after* this flow completes)
**Deliverable** Hi-fi Figma mockups, responsive across desktop / tablet / mobile-web

---

## What this brief covers

The dashboards brief assumes the user has already arrived inside the app. This brief covers the upstream half: **how a prospective community manager goes from "I just heard about Dwelli" to "I'm filling in Community details in the wizard"**, and how every other audience (returning admin, resident, superadmin) gets to the right place from the same entry door.

This is the most important user-acquisition surface in the product. If it leaks here, nothing downstream gets a chance.

---

## The full flow, narrated

This is the happy path for a brand-new landlord. Every screen below is in scope for design.

1. **Marketing landing page** at `dwelli.co` — a marketing-site surface (separate from the admin web app proper, but lives at the same root domain). It explains what Dwelli is and has a primary CTA: "**List your property**" or equivalent. The CTA links to `dwelli.co/wizard`.

2. **Auth wall** — `/wizard` is gated. An unauthenticated visitor is redirected to `/auth` (the auth entry), with a returnTo hint that remembers they were heading to the wizard.

3. **Phone-entry screen** at `/auth` — a single field: "Enter your phone number to continue." One screen, not two. (See "The sign-in / sign-up question" below.)

4. **OTP screen** — six-digit input, paste-friendly, with resend timer. On verify, the backend issues a JWT and the admin web sets it as an HTTP-only cookie.

5. **Profile completion** — *only* shown if the verified user is brand new (the backend just created the user record). One field: full name. Maybe email later, not in V1. Existing users skip this screen entirely.

6. **Post-auth routing** — invisible to the user, but happens here. The app reads the user's Memberships and the returnTo hint and decides where to send them. For the brand-new user we've been following, the answer is the wizard.

7. **Wizard step 1** — Community name, intended size, optional context. (Detailed in the dashboards brief.)

8. **Wizard steps 2–4, submit, pending view** — same as the dashboards brief.

The flow has variants depending on who the user turns out to be — covered in "Post-auth routing decision tree" below.

---

## The sign-in / sign-up question

Today's design intuition is to have two screens: a sign-up that captures the user's name and a sign-in that doesn't. **Recommendation: collapse to one screen** — a single phone-entry door.

Why:

- The backend's OTP endpoint is **timing-blind by design** — the response doesn't reveal whether the phone is registered. Splitting "sign in" vs "sign up" at the phone-entry step gives away information the backend deliberately hides.
- A user who doesn't remember whether they've used Dwelli before doesn't have to guess which door to walk through.
- New-vs-returning branching happens naturally one screen later: after OTP verifies, the backend tells us whether it just created the user. We collect the name then, in a dedicated profile-completion step — and only for new users. Returning users get one fewer screen.
- It's one fewer screen for the designer to design and the engineer to build.

The user's name is still captured — just one step later, when we know we need it.

If you'd rather keep two doors for marketing reasons (a "Get started" landing vs a "Welcome back" landing), they can both lead to the same underlying phone-entry component. Design the door surface differently; keep the auth screen one component.

---

## Post-auth routing decision tree

After OTP verification, the app makes one of these landings happen. This is the heart of the flow, and the designer needs to mock the visible outcomes (the decision itself is invisible logic, but each outcome is a real screen).

| Condition | Lands at |
|---|---|
| Profile incomplete (new user, no name yet) | `/onboarding/profile` (name capture) — then re-runs the decision tree |
| `returnTo=/wizard` hint present *and* user has no admin Membership for a draft Community in flight | `/wizard` step 1 |
| User has a draft Community already in flight (any state of `draft`) | `/wizard/{id}` resuming where they left off, with a "continue your draft" header |
| User has admin Memberships in one or more active/pending/rejected Communities | `/communities` list (the admin home) |
| User has only resident or guard Memberships | `/r/home` (the read-only resident surface from the dashboards brief) |
| User is a superadmin (founder) | `/admin/queue` (the approval queue) |
| User has a mix (admin in one Community, resident in another, etc.) | `/communities` list, with the Community/role switcher available to jump |
| Nothing applies (verified user, no Memberships, no draft, no wizard intent) | `/start-here` — a friendly "what do you want to do?" landing offering "Create a Community" and "I'm here to view my Community as a resident" |

The designer should mock the `/start-here` screen specifically — it's the rare-but-real "I signed up but haven't done anything yet" state and shouldn't feel like a dead end.

---

## Screens to design

In addition to anything already covered in the dashboards brief, this brief adds:

### Public (unauthenticated)

- **Marketing landing page** (`dwelli.co/`) — if this lives in the same Figma file, design it; if it's a separate marketing-site project, just align on the handoff point (the CTA destination). This already exists today so feel free to skip.
- **Phone-entry screen** (`/auth`) — phone input with a visible country picker (defaulted to NG, switchable to any country), a clear CTA. The country picker is a first-class control so international users can use the app. This is the one screen replacing the sign-in / sign-up split.
- **OTP entry screen** — 6-digit input, resend timer, "wrong number?" back link.

### First-time only

- **Profile completion** (`/onboarding/profile`) — minimal: full name. The screen should feel like a one-line formality, not a profile form.

### Post-auth landings (visible outcomes of the routing decision)

- **Routing transition state** — the brief moment where the app is reading Memberships and deciding. Likely a branded splash, not a generic spinner. Even if it's <500ms, design it so it doesn't feel like a flash.
- **"Continue your draft" entry** — when a user has a `draft` Community in flight and lands at the wizard, the wizard top should clearly say "Continuing your draft Community — *Community Name*" with an option to discard and start over. This is a small but important component.
- **`/start-here` landing** — the "you're logged in but undecided" screen described above.

### Returning destinations (already covered in dashboards brief)

These don't need re-design here, but the flow lands users on them — the designer should make sure the entry feels coherent:

- `/communities` (admin home)
- `/r/home` (read-only resident home)
- `/admin/queue` (superadmin approval queue)

---

## Constraints and conventions

- **Single domain, multiple routes** — `dwelli.co` is the marketing site root; `dwelli.co/wizard`, `/auth`, `/communities`, `/r/home`, `/admin/queue` are the app routes. The transition from marketing-page chrome to app-shell chrome should be deliberate — don't bleed marketing nav into the app or vice versa.
- **Phone numbers are international (E.164)** — country picker visible and switchable, defaulted to NG (most users are Nigerian). Validation accepts any internationally-valid mobile number, not Nigerian-only. The input should make the country selector a first-class control, not a hidden detail.
- **The returnTo hint must survive auth** — a user clicking "List your property" on the marketing page should end up in the wizard after OTP, not on a generic admin home. The designer doesn't implement this, but the flow assumes it works; if it doesn't survive, the "user arrived via marketing CTA" path is broken.
- **Mobile-web matters here more than anywhere** — many landlords will tap a marketing link on their phone first. Phone-entry, OTP, and profile completion all need to feel native on a phone browser.
- **No QR codes anywhere in this flow** (consistent with the dashboards brief). This is auth and onboarding only.
- **Resend, error, and rate-limit states are real** — the backend rate-limits OTP requests (1 per 60s per phone, 10 per 24h, 10 per IP per hour) and OTP attempts (max 5 verification attempts). The OTP screen should design for the "you've tried too many times" and "wait 45s before resending" states explicitly.

---

## Edge cases the designer should mock

- **Wrong number** on OTP screen → go back, change phone.
- **Expired OTP** → "this code has expired, request a new one" inline state.
- **Rate-limited** → "we've sent too many codes to this number recently — try again in X minutes" without revealing whether the phone is registered.
- **Profile-completion abandonment** → if a brand-new verified user closes the tab before finishing the profile step, returning to the app should re-prompt for profile completion on next login. The profile screen should be designed so abandoning it doesn't lose the auth session.
- **User clicks "List your property" but is actually only a resident** — after auth, the post-auth router sees no admin Memberships and the user has no intent-to-create draft. The `/start-here` screen should handle this gracefully (offer "Create a Community" as the primary action while making the "I'm a resident" path clearly available).

---

## Out of scope

- Marketing-site content design (copy, hero illustration, landing-page hero) unless the same designer is doing the marketing site. This brief focuses on the auth-and-routing surfaces and the wizard entry, not the marketing pitch.
- Email-based auth, social login, password flows — V1 is phone + OTP only.
- Multi-factor beyond OTP, biometric login, "remember this device" — not in V1.
- The wizard's internal steps 1–4 (covered in the dashboards brief).
- Push notifications, in-app messaging — not in V1.

---

## Deliverables

- Hi-fi Figma frames for every screen listed under "Screens to design".
- Responsive variants: desktop, tablet, mobile-web — with explicit care on mobile-web for the auth screens.
- Component-level work for the OTP input (it's a small but tricky control — paste handling, per-digit focus, error states).
- Documented mapping of routing-decision outcomes to landing screens, so the engineer building the router knows exactly which Figma frame each branch ends at.

---

*Dwelli Technologies Limited — Design brief — 1 June 2026 — Internal*
