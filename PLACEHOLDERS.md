# Placeholders
Run `node build.js` to list the ones still present. Config values live in `site.config.json`; `[[CONFIRM: ...]]` items live in `legal/*.md` and `content/support.md`.

The app codebase (`../../solo-leveling-dashboard`) **has been scanned** — DATA-INVENTORY.md records every fact as *confirmed in code* (`file:line`) or *unknown, needs owner confirmation*.

**Owner values filled 2026-10-16:** developerName, contactEmail, supportEmail, domain, effectiveDate (2026-11-01), minimumAge (13), countryOfGovernance (India), supabaseRegion (Southeast Asia (Singapore)), backupRetentionDays (30), logRetentionDays (90), deletionResponseDays (30), reply days (30), inAppDeletePath.
⚠ The domain is now the live deploy **https://habitgate.pages.dev** (Cloudflare Pages, repo `monarchlabsapps/habitgate-site`) — set in `site.config.json` 2026-10-24, so canonical/og:url/sitemap/robots all point at the real site.

| Placeholder | Where | What I need from you |
|---|---|---|
| DEVELOPER_ADDRESS_OR_COUNTRY | config | The developer address (or say "use India" and I will put the country there) |

## [[CONFIRM]] items — all resolved 2026-10-22
Resolved from code this pass (no longer marks): subscription pricing/renewal/refunds and "no other third-party online service" (terms), Sentry-conditional wording (privacy), bug-report data fields (support), bug reports surviving account deletion (delete-account — fixed by app migration 0055).

Owner answers applied to `legal/*.md`:

| # | Where | Owner answer applied |
|---|---|---|
| 1 | privacy (Information we provide) | Google provider **not yet enabled**; Apple exists but is **disabled** (App Store licence later); **no email confirmation** at sign-up. Policy now says sign-in is email + password only until a provider is switched on. |
| 2 | privacy (Regional notices) | Filled with the European Commission's **Standard Contractual Clauses** (the usual GDPR mechanism when a processor moves data outside the EEA/UK). ⚠ Lawyer review: confirm Supabase's SCC coverage before publishing. |
| 3 | terms (Acceptance and eligibility) | Habit tracker anyone can use; minors need parental consent **only** for purchases or system-generated exercise content. |
| 4 | delete-account (What may be kept) | Purchase/billing records kept **up to 1 year**; retention section in privacy.md aligned to the same number. |

Also resolved: `supabaseRegion` — owner says the region is whatever Supabase allocates by availability, not a fixed region, so the config key was **removed** and privacy.md describes hosting in prose ("managed infrastructure… encrypted at rest, so we cannot read the contents").

Sentry is no longer a mark: the pages say "only in builds configured with a DSN", which is exactly what the code shows (`lib/crash.ts:13` no-ops without `NEXT_PUBLIC_SENTRY_DSN`; no DSN in `.env.local`). Say the word if you want that sentence gone instead.

## LOUD BUGS FOUND IN THE APP CODE — read before publishing the delete page
Status: 1–5 **FIXED in code** (1–2 by `supabase/migrations/0055_deletion_completeness.sql`, awaiting `npx supabase db push`; 3–5 by the fix pass of 2026-10-21, see `solo-leveling-dashboard/docs/legal/BUGFIX-PLAN.md`); 6 is an owner confirmation, not a code bug.
1. **Account deletion leaves bug reports behind.** ~~`bug_reports.user_id` is `ON DELETE SET NULL`~~ **FIXED by 0055** — the FK now cascades from `auth.users`, so reports follow their account; the delete page below now states that. Deploy the migration before relying on it.
2. **The `avatars` storage bucket is never cleaned.** **FIXED by 0055** — the never-used bucket's four RLS policies are stripped (with none left, nothing can ever write to it; `STACK.md` §6 now says "no file storage"). Supabase refuses `DELETE` on the storage tables from SQL (SQLSTATE 42501 — the first `db push` failed on this), so the empty bucket row itself is deleted by hand once: Supabase Studio → Storage → `avatars` → Delete bucket.
3. **There is no signup consent screen.** **FIXED (2026-10-21)** — a consent line now sits under the "Initialize" CTA (`components/auth/step-1-identity.tsx`): "By initializing you agree to our Terms of Service and Privacy Policy", with both docs opening through the same site-first/bundled-viewer rule (`useLegalDoc()` in `lib/legal-external.ts`; wired in `app/(auth)/onboarding/page.tsx` and the `app/page.tsx` auth overlay). No accepted-policy version is recorded — that was explicitly out of scope (unrequested feature; suggestion kept in SYNC.md).
4. **Delete-flow copy mismatch (app-internal).** **FIXED (2026-10-21)** — `app/account-deletion/page.tsx` now describes the real flow: type `DELETE`, then re-enter the account password.
5. **The app's bundled Privacy Policy contradicts the code (drift).** **FIXED (2026-10-21)** — `docs/legal/privacy-policy.md` (and terms/data-safety) now state the truth: photo avatars are 256 px on-device data URLs, nothing is ever uploaded, the only avatar data that leaves the device is a sigil id. The bundle now also covers bug reports being deleted with the account.
6. **`site.config.json` `supabaseRegion` is not a region.** ~~It reads `Dadri, UttarPradesh` — not a Supabase region, and not derivable from the repo (only the project ref `rmtjryfryscfrynfffraf` is in code).~~ **RESOLVED 2026-10-22**: the owner confirmed the hosting region is whatever Supabase allocates by availability (and that all data is encrypted at rest, unreadable to us), so the key was removed from `site.config.json` and privacy.md describes hosting in prose.

Parity check (`node build.js --check privacy=<app copy> terms=<app copy>`) currently **MISMATCH, intentional**: the app's `docs/legal/*.md` are older drafts, not byte-copies of these pages. Substance now matches; byte-copy after the last CONFIRM item resolves. Moot in practice since `LEGAL_BASE_URL` is now set — the app opens these pages directly and the bundled viewer is only the offline fallback (see SYNC.md).

Before launch, re-run the deletion audit: verify the in-app deletion removes auth user, profile, related rows, and (after 0055 is deployed) the caller's bug reports. If any is missed, that is a bug: fix it, and keep the delete page from claiming it.