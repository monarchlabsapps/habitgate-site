# Keeping the app and website in sync
The **site is now the single source of truth** for the Privacy Policy and Terms
(2026-10-21): the app links out to these pages instead of maintaining its own
copies.

1. Edit `legal/privacy.md` or `legal/terms.md`.
2. Bump `policyVersion` and `effectiveDate` in `site.config.json`.
3. Run `node build.js --strict`.
4. Deploy `site/`. That is the whole sync — the app picks the policies up
   automatically once `LEGAL_BASE_URL` is set (see below). **There is no copy
   step and no second place to edit.**

## The app side
- `solo-leveling-dashboard/lib/legal-external.ts` holds `LEGAL_BASE_URL` — set
  to **https://habitgate.pages.dev** since 2026-10-24, so the Settings footer
  and the paywall footer open `<site>/privacy/` and `<site>/terms/` in the
  system browser. `docs/legal/` is now only the offline fallback plus the
  companion web build's `/legal/*` pages:
  - `legal/embed/privacy.md` -> `solo-leveling-dashboard/docs/legal/privacy-policy.md`
  - `legal/embed/terms.md`   -> `solo-leveling-dashboard/docs/legal/terms.md`
  - Absolute folder: `e:\solo-levelling\solo-leveling-dashboard\docs\legal\`
  - `scripts/copy-legal.mjs` mirrors `docs/legal/` -> `public/legal/` on every
    `npm run dev` / `npm run build`; the in-app viewer
    (`components/hud/legal-screen.tsx:19-23`) fetches
    `legal/privacy-policy.md` / `legal/terms.md`. Edit `docs/legal/`, never
    `public/legal/` (it is a generated copy).
- `subscriptions` (pricing) stays in-app only:
  `solo-leveling-dashboard/docs/legal/subscriptions.md`.
- The signup consent line (under the "Initialize" CTA) also follows this rule:
  site first, bundled viewer as the fallback (`useLegalDoc()` in
  `lib/legal-external.ts`; rendered in `app/(auth)/onboarding/page.tsx` and
  passed `handleOpenLegal` in the `app/page.tsx` overlay).

## Parity (only matters for the offline fallback)
The parity check still works: `node build.js --check privacy=<app copy of
privacy.md> terms=<app copy of terms.md>` prints both sha256 values and exits
non-zero on mismatch (`legal/policy-version.json` holds the hashes). The
app-side paths are `solo-leveling-dashboard/docs/legal/privacy-policy.md` and
`.../terms.md`. Current state: **MISMATCH, intentional** — the app still
carries its own earlier drafts (effective 2026-09-10/29) rather than
byte-copies of these pages. Reason: these pages still carry the owner-decision
CONFIRM items (see PLACEHOLDERS.md) that the app's fallback viewer would
render as literal text, so copying now would ship placeholder noise offline.
The app-side drafts were instead corrected on 2026-10-21 so their **substance**
matches (no avatar upload, bug reports cascade with the account, type-DELETE +
password confirmation). Byte-copy the pages after the last CONFIRM item
resolves — with the site live this is cosmetic, since the app opens these
pages directly and the fallback only shows with no network.

**Suggestion only (not implemented):** record accepted version, and ask again
when it changes materially.
```sql
alter table public.users add column accepted_policy_version text, add column accepted_policy_at timestamptz;
```

Do not change Settings navigation: it keeps opening the same footer entries.
