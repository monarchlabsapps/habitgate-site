# habitGate website
**Drafts only: have a lawyer review the Privacy Policy and Terms before publishing. Nothing here is legal advice.**

- Edit text ONLY in `legal/*.md` and `content/support.md`; edit facts in `site.config.json` (set `playStoreUrl` to switch "Coming soon" to a Play button).
- Build: `node build.js` (writes `site/`). Publish-gate: `node build.js --strict` fails while any `[[PLACEHOLDER]]` remains.
- Preview: `cd site && python3 -m http.server 8000`
- Deploy folder: `site/` (commit the built output).
  - **Cloudflare Pages:** connect repo, build command empty, output dir `site`. Custom domain: Pages > Custom domains; HTTPS is automatic. `_headers` is honoured.
  - **Netlify:** publish dir `site`, no build command. Domain settings > Add domain; enable "Force HTTPS". `_headers` is honoured.
  - **GitHub Pages:** Settings > Pages > deploy from branch, serve `site/` (use an Actions deploy or copy `site/` to the publish branch root). Use a custom domain or a `user.github.io` repo, because links are root-relative. Tick "Enforce HTTPS". `_headers` is ignored; GitHub Pages cannot set headers, so rely on the strict-origin referrer default.
- Play Console URLs: see PLAY-CONSOLE-CHECKLIST.md.
- Not included: Open Graph PNG (add `site/assets/og.png`, 1200x630, and update the URL in build.js), PNG icon set, Lighthouse run (do it on your deployed URL), app screenshots.
