// Usage: node build.js [--strict] | node build.js --check privacy=path/in/app.md terms=path/in/app.md
const fs = require('fs'), cr = require('crypto'), R = __dirname, S = R + '/site/';
const cfg = JSON.parse(fs.readFileSync(R + '/site.config.json', 'utf8'));
const sha = s => cr.createHash('sha256').update(s).digest('hex');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
cfg.year = new Date().getFullYear();
const em = cfg.contactEmail;
cfg.mailto = 'mailto:' + (em.includes('[[') ? encodeURIComponent(em) : em) + '?subject=' + encodeURIComponent('Delete my ' + cfg.appName + ' account');
const sub = s => s.replace(/\{\{(\w+)\}\}/g, (_, k) => cfg[k] ?? '');
const ph = new Set();
const inl = s => esc(s).replace(/\[([^\]\[]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[\[([^\[\]]+)\]\]/g, m => { ph.add(m); return '<mark class="ph">' + m + '</mark>' });
function md(src) {
    const o = [], toc = []; let list = 0, tbl = 0, title = '';
    const cl = () => { if (list) { o.push('</ul>'); list = 0 } if (tbl) { o.push('</table></div>'); tbl = 0 } };
    for (const l of sub(src).split('\n')) {
        if (/^\|/.test(l)) {
            if (/^\|[\s\-|]+\|?$/.test(l)) continue; const c = l.replace(/^\||\|$/g, '').split('|').map(x => x.trim());
            if (!tbl) { if (list) { o.push('</ul>'); list = 0 } o.push('<div class="tw"><table>'); tbl = 1; o.push('<tr>' + c.map(x => '<th>' + inl(x) + '</th>').join('') + '</tr>') } else o.push('<tr>' + c.map(x => '<td>' + inl(x) + '</td>').join('') + '</tr>'); continue
        }
        if (tbl) { o.push('</table></div>'); tbl = 0 }
        let m;
        if (m = l.match(/^# (.+)/)) { cl(); title = m[1]; o.push('<h1>' + inl(m[1]) + '</h1>') }
        else if (m = l.match(/^## (.+)/)) { cl(); const id = m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); toc.push([id, m[1]]); o.push('<h2 id="' + id + '">' + inl(m[1]) + '</h2>') }
        else if (m = l.match(/^(?:- |\d+\. )(.+)/)) { if (!list) { o.push('<ul>'); list = 1 } o.push('<li>' + inl(m[1]) + '</li>') }
        else if (m = l.match(/^> (.+)/)) { cl(); o.push('<blockquote><p>' + inl(m[1]) + '</p></blockquote>') }
        else if (l.trim()) { cl(); o.push('<p>' + inl(l) + '</p>') }
    }
    cl(); return { html: o.join('\n'), toc, title }
}
const THEME = "try{var t=localStorage.getItem('hg-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}";
const NAV = [['/privacy/', 'Privacy'], ['/terms/', 'Terms'], ['/support/', 'Support']];
const page = (p, title, desc, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${cfg.domain}${p}">
<meta name="color-scheme" content="light dark"><meta name="theme-color" media="(prefers-color-scheme: light)" content="#F7F5FC"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0B0A12">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${cfg.domain}${p}"><meta property="og:image" content="${cfg.domain}/assets/og-placeholder.svg"><meta name="twitter:card" content="summary">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
<script>${THEME}</script><link rel="stylesheet" href="/css/styles.css">
${p === '/' ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", name: cfg.appName, url: cfg.domain }, { "@type": "MobileApplication", name: cfg.appName, operatingSystem: "Android" }] })}</script>` : ''}</head><body>
<a class="skip" href="#main">Skip to content</a><header><div class="wrap"><a class="logo" href="/">${cfg.appName}</a><nav aria-label="Main">${NAV.map(n => `<a href="${n[0]}">${n[1]}</a>`).join('')}</nav><span id="theme"></span></div></header>
<main id="main"><div class="wrap">${body}</div></main>
<footer><div class="wrap"><nav aria-label="Footer"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/delete-account/">Delete account</a><a href="/support/">Support</a></nav><p>© ${cfg.year} ${inl(cfg.developerName)} · ${inl(cfg.contactEmail)}</p></div></footer><script src="/js/site.js" defer></script></body></html>`;
const W = (f, s) => { fs.mkdirSync(require('path').dirname(S + f), { recursive: true }); fs.writeFileSync(S + f, s) };
const docs = {};
function legal(name, src, path, desc, upd) {
    const r = md(fs.readFileSync(R + src, 'utf8')); docs[name] = r;
    const toc = `<details class="toc" open><summary>Contents</summary>${r.toc.map(t => `<a href="#${t[0]}">${esc(t[1])}</a>`).join('')}</details>`;
    const body = r.html.replace('</h1>', `</h1><p class="meta">Last updated: ${inl(cfg.effectiveDate)} · Version ${cfg.policyVersion}</p>`);
    W(path + 'index.html', page('/' + path, r.title + ' | ' + cfg.appName, desc, `<div class="layout">${r.toc.length > 2 ? toc : ''}<article class="doc">${body}</article></div>`)); return fs.readFileSync(R + src, 'utf8')
}
if (process.argv[2] === '--check') {
    let bad = 0; for (const a of process.argv.slice(3)) { const [n, p] = a.split('='); const web = sha(sub(fs.readFileSync(R + '/legal/' + n + '.md', 'utf8')).trim()); const app = sha(fs.readFileSync(p, 'utf8').trim()); console.log(n, 'web', web, 'app', app); if (web !== app) bad = 1 }
    console.log(bad ? 'MISMATCH' : 'OK'); process.exit(bad)
}
const raw = {};
raw.privacy = legal('privacy', '/legal/privacy.md', 'privacy/', `How ${cfg.appName} collects, uses and protects your data.`);
raw.terms = legal('terms', '/legal/terms.md', 'terms/', `The terms for using ${cfg.appName}.`);
legal('del', '/legal/delete-account.md', 'delete-account/', `How to delete your ${cfg.appName} account and data.`);
const sup = md(fs.readFileSync(R + '/content/support.md', 'utf8'));
W('support/index.html', page('/support/', 'Support | ' + cfg.appName, `Get help with ${cfg.appName}.`, `<article class="doc">${sup.html}</article>`));
const cta = cfg.playStoreUrl ? `<a class="btn" href="${cfg.playStoreUrl}">Get it on Google Play</a>` : `<span class="badge">Coming soon</span>`;
W('index.html', page('/', cfg.appName + ' | Habits as an RPG', cfg.tagline, `<section class="hero"><div><h1>${esc(cfg.tagline)}</h1><p class="meta">${cfg.appName} is a habit and self-improvement app with an RPG theme.</p>${cta}</div><img class="phone" src="/assets/phone-mockup.png" width="1008" height="1883" alt="${esc(cfg.appName)} shown on a phone" fetchpriority="high"></section>
<section class="cards"><div class="card"><h3>Daily quests and streaks</h3><img class="shot" src="/assets/phone-mockup-quests.png" width="1008" height="1883" alt="Daily quests and streaks screen" loading="lazy"></div><div class="card"><h3>Focus sprints</h3><img class="shot" src="/assets/phone-mockup-sprints.png" width="1008" height="1883" alt="Focus sprints screen" loading="lazy"></div><div class="card"><h3>Avatars and rewards</h3><img class="shot" src="/assets/phone-mockup-store.png" width="1008" height="1883" alt="Avatars and rewards screen" loading="lazy"></div></section>
<section class="cta"><h2>Ready to start your quest?</h2>${cta}</section>`));
W('404.html', page('/404.html', 'Page not found | ' + cfg.appName, 'Page not found.', '<h1>Page not found</h1><p>Check the address, or <a href="/">go to the home page</a>.</p>'));
W('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${cfg.domain}/sitemap.xml\n`);
W('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/privacy/', '/terms/', '/delete-account/', '/support/'].map(u => `<url><loc>${cfg.domain}${u}</loc></url>`).join('')}</urlset>\n`);
W('site.webmanifest', JSON.stringify({ name: cfg.appName, short_name: cfg.appName, icons: [{ src: '/assets/favicon.svg', sizes: 'any', type: 'image/svg+xml' }, { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' }], theme_color: '#0B0A12', background_color: '#0B0A12', display: 'browser' }));
const h = cr.createHash('sha256').update(THEME).digest('base64');
W('_headers', `/*\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-${h}'; style-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'none'; frame-ancestors 'none'\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`);
// embed + version
fs.mkdirSync(R + '/legal/embed', { recursive: true }); const ver = { policyVersion: cfg.policyVersion, effectiveDate: cfg.effectiveDate, sha256: {} };
for (const n of ['privacy', 'terms']) {
    const html = docs[n].html.replace(/<table>/g, '<table style="border-collapse:collapse;width:100%">').replace(/<(th|td)>/g, '<$1 style="border:1px solid rgba(128,128,128,.5);padding:6px;text-align:left">').replace(/<blockquote>/g, '<blockquote style="margin:1rem 0;padding:10px 14px;border:1px solid currentColor;border-radius:12px">');
    fs.writeFileSync(R + `/legal/embed/${n}.html`, `<div style="font:16px/1.6 system-ui,sans-serif;max-width:70ch;margin:auto;padding:16px;color:inherit;background:transparent">${html}</div>\n`);
    const m = sub(raw[n]).trim(); fs.writeFileSync(R + `/legal/embed/${n}.md`, m + '\n'); ver.sha256[n] = sha(m)
}
fs.writeFileSync(R + '/legal/policy-version.json', JSON.stringify(ver, null, 2) + '\n');
if (ph.size) { console.warn('\n!! ' + ph.size + ' placeholders still present (highlighted on pages):\n' + [...ph].join('\n')); if (process.argv.includes('--strict')) process.exit(1) } else console.log('No placeholders left.');
