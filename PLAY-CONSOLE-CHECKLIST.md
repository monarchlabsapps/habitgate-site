# Play Console checklist
URLs (after deploying; replace DOMAIN):
- Privacy policy field: `https://DOMAIN/privacy/`
- Data deletion URL field (App content > Data safety): `https://DOMAIN/delete-account/`
- Developer name and email must match the site footer.

The app's Settings/paywall footers open these same pages automatically once you paste the origin into `LEGAL_BASE_URL` (`solo-leveling-dashboard/lib/legal-external.ts`); until then they show the bundled fallback copies (see SYNC.md).

## Signup consent screen
**Implemented 2026-10-21.** A consent line now sits below the `Initialize` button in `solo-leveling-dashboard/components/auth/step-1-identity.tsx`: "By initializing you agree to our Terms of Service and Privacy Policy", with both docs as inline buttons (`auth.step1.consentPre/Mid/Post` strings in all 8 `locales/*/auth.json`; the doc names reuse the existing `settings.termsOfService` / `settings.privacyPolicy` labels). The buttons route through the existing site-first choke point — `handleOpenLegal` for the `app/page.tsx` auth overlay, and the new `useLegalDoc()` hook (`lib/legal-external.ts`) for the standalone `app/(auth)/onboarding` page, which renders `LegalScreen` while a doc is open — so they open `<site>/terms/` / `<site>/privacy/` once `LEGAL_BASE_URL` is set and fall back to the bundled viewer until then. No accepted-policy version is recorded (deliberately out of scope; the suggestion stays in SYNC.md).

## Data safety draft (verified against DATA-INVENTORY.md; rows marked confirmed vs [[CONFIRM]])
| Data type | Collected | Shared | Optional | Purpose | Encrypted in transit | Deletable |
|---|---|---|---|---|---|---|
| Email / user ID | Yes | No (Supabase and RevenueCat act as processors) | No | Account management | Yes | Yes |
| Hunter name, sigil/emblem avatar id | Yes | No | Yes (name has a default; sigil is selectable) | App functionality | Yes | Yes |
| Avatar photo | **No** — photos stay on the device (`lib/avatar.ts:6-12`) | No | N/A | N/A | N/A | N/A |
| App activity (quests, raids/check-ins, XP, streaks, stats, sprints, items, coins, settings, cloud backup) | Yes | No | No (for sync; guest mode transmits nothing) | App functionality | Yes | Yes (full cascade on delete) |
| Purchase status (product, dates, expiry via Google Play/RevenueCat) | Yes | No (RevenueCat + Google as processors) | No | App functionality | Yes | Partly (our rows cascade; Google/RevenueCat keep their own records) |
| Bug-report content (message, app version, platform, OS, device id) | Yes, only when the user sends one | No | Yes | App functionality | Yes | Yes — cascades with the account once migration 0055 is deployed |
| Crash logs / diagnostics (Sentry) | [[CONFIRM: is a Sentry DSN set in production builds?]] | [[CONFIRM: Sentry as processor?]] | No (sent automatically when enabled) | App functionality (crash fixes) | Yes | [[CONFIRM]] |

Not collected (leave unchecked): location, contacts, microphone, camera permission, photos other than the on-device avatar, health/fitness sensor data, advertising ID, usage/analytical data (no analytics SDK in the APK).

## Pre-submission tests
Open all five URLs in a private window with JavaScript off; confirm no login, no PDF, no third-party requests; both themes; print preview; Lighthouse mobile 95+; send a test deletion email; `node build.js --strict` passes.