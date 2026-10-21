# Placeholders
Run `node build.js` to list the ones still present. Config values live in `site.config.json`; `[[CONFIRM: ...]]` items live in `legal/*.md` and `content/support.md`.

The app codebase (`../../solo-leveling-dashboard`) **has been scanned** — DATA-INVENTORY.md records every fact as *confirmed in code* (`file:line`) or *unknown, needs owner confirmation*.

**Owner values filled 2026-10-16:** developerName, contactEmail, supportEmail, domain, effectiveDate (2026-11-01), minimumAge (13), countryOfGovernance (India), supabaseRegion (Southeast Asia (Singapore)), backupRetentionDays (30), logRetentionDays (90), deletionResponseDays (30), reply days (30), inAppDeletePath.
⚠ The domain `https://habitgate.example.com` is a reserved documentation domain — replace it with the real domain before deploying or Play will reject the URLs.

| Placeholder | Where | What I need from you |
|---|---|---|
| DEVELOPER_ADDRESS_OR_COUNTRY | config | The developer address (or say "use India" and I will put the country there) |

## Remaining [[CONFIRM]] items (4 marks on the built pages)
Resolved from code this pass (no longer marks): subscription pricing/renewal/refunds and "no other third-party online service" (terms), Sentry-conditional wording (privacy), bug-report data fields (support), bug reports surviving account deletion (delete-account — fixed by app migration 0055).

| # | Where | Question |
|---|---|---|
| 1 | privacy (Information we provide) | Are Google/Apple sign-in providers enabled on the Supabase project, and is email confirmation required at sign-up? (The buttons exist in code — `components/auth/login-modal.tsx:133,232,241`, `components/auth/auth-flow.tsx:147` — and the code already handles "provider not enabled", so either answer is safe to publish) |
| 2 | privacy (Regional notices) | EEA/UK transfer mechanism (e.g. EU Standard Contractual Clauses), or delete the sentence |
| 3 | terms (Acceptance and eligibility) | Parental-consent rule for minors (the app enforces no age gate — DATA-INVENTORY.md — so this is policy, not code) |
| 4 | delete-account (What may be kept) | Which purchase/billing records are kept by law (or "none beyond Google's own records") |

Sentry is no longer a mark: the pages say "only in builds configured with a DSN", which is exactly what the code shows (`lib/crash.ts:13` no-ops without `NEXT_PUBLIC_SENTRY_DSN`; no DSN in `.env.local`). Say the word if you want that sentence gone instead.

## LOUD BUGS FOUND IN THE APP CODE — read before publishing the delete page
Status: 1–5 **FIXED in code** (1–2 by `supabase/migrations/0055_deletion_completeness.sql`, awaiting `npx supabase db push`; 3–5 by the fix pass of 2026-10-21, see `solo-leveling-dashboard/docs/legal/BUGFIX-PLAN.md`); 6 is an owner confirmation, not a code bug.
1. **Account deletion leaves bug reports behind.** ~~`bug_reports.user_id` is `ON DELETE SET NULL`~~ **FIXED by 0055** — the FK now cascades from `auth.users`, so reports follow their account; the delete page below now states that. Deploy the migration before relying on it.
2. **The `avatars` storage bucket is never cleaned.** **FIXED by 0055** — the never-used bucket's four RLS policies are stripped (with none left, nothing can ever write to it; `STACK.md` §6 now says "no file storage"). Supabase refuses `DELETE` on the storage tables from SQL (SQLSTATE 42501 — the first `db push` failed on this), so the empty bucket row itself is deleted by hand once: Supabase Studio → Storage → `avatars` → Delete bucket.
3. **There is no signup consent screen.** **FIXED (2026-10-21)** — a consent line now sits under the "Initialize" CTA (`components/auth/step-1-identity.tsx`): "By initializing you agree to our Terms of Service and Privacy Policy", with both docs opening through the same site-first/bundled-viewer rule (`useLegalDoc()` in `lib/legal-external.ts`; wired in `app/(auth)/onboarding/page.tsx` and the `app/page.tsx` auth overlay). No accepted-policy version is recorded — that was explicitly out of scope (unrequested feature; suggestion kept in SYNC.md).
4. **Delete-flow copy mismatch (app-internal).** **FIXED (2026-10-21)** — `app/account-deletion/page.tsx` now describes the real flow: type `DELETE`, then re-enter the account password.
5. **The app's bundled Privacy Policy contradicts the code (drift).** **FIXED (2026-10-21)** — `docs/legal/privacy-policy.md` (and terms/data-safety) now state the truth: photo avatars are 256 px on-device data URLs, nothing is ever uploaded, the only avatar data that leaves the device is a sigil id. The bundle now also covers bug reports being deleted with the account.
6. **`site.config.json` `supabaseRegion` is not a region.** It reads `Dadri, UttarPradesh` — not a Supabase region, and not derivable from the repo (only the project ref `rmtjryfryscfrynfffraf` is in code). It also contradicts the earlier owner fill "Southeast Asia (Singapore)". Confirm the region in the Supabase dashboard before publishing.

Parity check (`node build.js --check privacy=<app copy> terms=<app copy>`) currently **MISMATCH, intentional**: the app's `docs/legal/*.md` are older drafts, not byte-copies of these pages — these pages still carry 4 `[[CONFIRM]]` marks that the fallback viewer would render as literal text. Substance now matches; byte-copy after the last mark resolves. Only matters while `LEGAL_BASE_URL` is blank — see SYNC.md.

Before launch, re-run the deletion audit: verify the in-app deletion removes auth user, profile, related rows, and (after 0055 is deployed) the caller's bug reports. If any is missed, that is a bug: fix it, and keep the delete page from claiming it.