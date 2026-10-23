# Hosting habitgate-site — step by step (free)

The site is **finished static output**: `site/` contains plain HTML/CSS/JS +
images. Hosting = uploading that folder to a static host. Free, no server, no
database. Last updated 2026-10-22.

**Yes, you can edit everything later** — privacy policy, terms, changelogs,
pictures, text — and redeploy in under a minute. How is in section 4.

---

## 1. Which platform — Cloudflare Pages (Recommended)

| | Cloudflare Pages (Recommended) | Netlify | GitHub Pages |
|---|---|---|---|
| Monthly price | free | free | free |
| Bandwidth | **unlimited** | 100 GB | 100 GB |
| Speed (global CDN) | fastest of the three | fast | fast |
| Honours `_headers` (your CSP/HSTS security headers) | **yes** | yes | **no** |
| Custom domain + free HTTPS | yes, automatic | yes | yes |
| Edit → live | push to GitHub (auto-rebuild), or drag the folder | same | same |

**Choose Cloudflare Pages.** It is already the first option in the README, it
honours the security headers `build.js` writes to `site/_headers` (the other
two either cap bandwidth or silently drop those headers), and a
`*.pages.dev` URL is free forever. The steps below are for it; Netlify is
nearly identical if you ever switch.

---

## 2. Before you deploy — 2 one-time fixes

1. **Set the real domain.** `site.config.json` still has the placeholder
   `"domain": "https://habitgate.example.com"`. Decide your Cloudflare project
   name now (the URL will be `https://<project-name>.pages.dev`) and set it,
   e.g. `"domain": "https://habitgate.pages.dev"`. This value is baked into the
   canonical link, sitemap, Open Graph tags and the legal links — wrong here =
   wrong everywhere.
2. **Rebuild and check:**
   ```
   cd habitgate-site/habitgate
   node build.js --strict
   ```
   `--strict` fails the build if any `[[PLACEHOLDER]]` is left, so you never
   publish a half-written page. (Plain `node build.js` just writes `site/`.)

The output folder you will upload is **`site/`** — it is already committed, so
nothing new is generated on the host unless you want it to be (section 4).

---

## 3. Deploy on Cloudflare Pages — git-connected (recommended)

Your repo already exists: `github.com/Divyapratap-369/solo-levelling`, with the
site at `habitgate-site/habitgate/`. No new repo needed.

1. Push any uncommitted work: from the repo root, `git add -A && git commit -m
   "site: prepare hosting" && git push`.
2. Sign up at **dash.cloudflare.com** (free, email + password; no card).
3. **Workers & Pages → Create application → Pages → Connect to Git.**
4. Authorise GitHub, pick the `solo-levelling` repo.
5. Set the build:
   - **Project name:** `habitgate` → URL becomes `https://habitgate.pages.dev`
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Root directory:** `habitgate-site/habitgate`
   - **Build command:** `node build.js`
   - **Build output directory:** `site`
6. **Save and Deploy.** ~1 minute. Open the URL — you should see the home page;
   `/privacy/`, `/terms/`, `/support/`, `/delete-account/` all work.

Optional later: **Custom domains → Set up a custom domain** (e.g.
`habitgate.app`). Buy the name anywhere (~₹700–1000/yr from any registrar),
point it at Cloudflare, HTTPS is automatic. Then update `domain` in
`site.config.json` to the custom domain and redeploy once.

### Fallback: drag-and-drop deploy (no GitHub needed)
Pages → your project → **Create deployment → drag the `site/` folder** in.
Useful for a hotfix when you cannot push, or from a machine without git.

---

## 4. Editing later — every common case

The rule: **edit the source, never `site/` by hand** — except images, which
live directly in `site/assets/`. Then rebuild and redeploy. Total time: about a
minute.

### A. Privacy policy / terms / delete-account / support text
1. Edit `legal/privacy.md` (or `legal/terms.md`, `legal/delete-account.md`,
   `content/support.md`) — text only, Markdown.
2. Bump `policyVersion` and `effectiveDate` in `site.config.json` (e.g.
   `"0.2"`, `"2026-12-01"`). The page shows "Last updated · Version".
3. `node build.js --strict`
4. Commit + push → Cloudflare rebuilds automatically. (Or drag the `site/`
   folder for a manual deploy.)

### B. Pictures (hero phone mockup, icons, OG image)
- **Replace a picture:** drop the new file into `site/assets/` **with the same
  filename** (e.g. `phone-mockup.png`, `og-placeholder.svg`). Rebuild/redeploy.
  1200×630 PNG for the social-share image — replace `og-placeholder.svg` and
  update the `og:image` line in `build.js` if you rename it.
- **Add a picture:** put it in `site/assets/`, reference it as
  `/assets/your-file.png` in a Markdown file or `build.js`.
- Icons used by the site: `favicon.svg`, `favicon-32.png`,
  `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` in `site/assets/`.

### C. Changelog / a brand-new page
1. Create `content/changelog.md` (Markdown; `# Title` is the page title).
2. Add it to the nav and footer lists in `build.js` (`NAV` and the footer
   `<nav>`), and to the `sitemap.xml` URL list in the same file.
3. Add the build call — copy the `support/index.html` line:
   `W('changelog/index.html', page('/changelog/', 'Changelog | ' + cfg.appName, 'What changed in ' + cfg.appName, '<article class="doc">' + md(fs.readFileSync(R + '/content/changelog.md','utf8')).html + '</article>'))`
4. Rebuild, push.
(Adding a page is the only edit that touches `build.js`; day-to-day text and
image edits never do.)

### D. Facts (email, address, retention days, Play Store link)
All in `site.config.json` — one place, everything updates. Set `playStoreUrl`
when the app is live to flip the "Coming soon" badge into a real Play button.

### E. Turn the app's legal links on
Once the site is live, the app should link to it instead of its bundled copies:
paste the origin into `LEGAL_BASE_URL` in
`solo-leveling-dashboard/lib/legal-external.ts` (e.g.
`https://habitgate.pages.dev`). Full details and the parity check are in
`SYNC.md`.

---

## 5. Go-live checklist

- [ ] `domain` in `site.config.json` = the real Pages URL
- [ ] `node build.js --strict` passes
- [ ] Site opens; all 5 pages + 404 work
- [ ] `site/_headers` active — check with
      `curl -sI https://habitgate.pages.dev/ | grep -i content-security` (you
      should see the CSP line)
- [ ] `robots.txt` + `sitemap.xml` reachable
- [ ] Legal pages reviewed by a lawyer (README warning: drafts only)
- [ ] `LEGAL_BASE_URL` set in the app (section 4E)
- [ ] Lighthouse run on the live URL (README "not included" list)
- [ ] Replace `og-placeholder.svg` with a real 1200×630 share image

## 6. Notes and limits

- Cloudflare Pages free: unlimited sites, unlimited requests, 500 builds/month
  (a push you never make doesn't count) — effectively unlimited for this site.
- If you ever leave Cloudflare: `site/` is portable. Netlify = publish dir
  `site`, no build command. GitHub Pages works but **cannot send `_headers`**,
  so the security headers would be lost — see README.
- Drafts-only legal warning still applies until a lawyer reviews.
