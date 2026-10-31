// Generates the files the site serves but nobody should hand-edit:
//
//   list/<slug>/index.html   one plain, crawlable page per list (search engines,
//                            link previews in texts/Discord/Reddit), each linking
//                            to the interactive version
//   sitemap.xml, robots.txt
//   ads/index.json           the billboard's ad list (no more 404 probing)
//   reddit/wiki.md, reddit/sidebar.md, reddit/wiki-lite.md
//
//   node tools/build.mjs
//
// The GitHub Action in .github/workflows/check.yml runs this on every push.
import fs from 'fs';
import { execFileSync } from 'child_process';

const ROOT = new URL('..', import.meta.url);
const SITE = 'https://james-baunach.github.io/louisville-wiki/';
const D = await import(new URL('js/data.js', ROOT));
const { wikiData, orderedKeys, slugOf, emojiOf, countOf, realItems, PRESETS, presetSections, presetCount, prettyDate, areaOf, alsoIn, practical, featuresOf, nextRuleDate, shortDate, COMPANIONS, linkKind, LINK_LABEL } = D;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const write = (rel, text) => { const u = new URL(rel, ROOT); fs.mkdirSync(new URL('.', u), { recursive: true }); fs.writeFileSync(u, text); };
const today = new Date().toISOString().slice(0, 10);
const gSearch = (n) => `https://www.google.com/search?q=${encodeURIComponent(n + ' Louisville')}`;

// ---------------------------------------------------------------
// ads/index.json
// ---------------------------------------------------------------
const adFiles = fs.readdirSync(new URL('ads/', ROOT)).filter(f => /^\d+\.(png|jpe?g|webp|gif)$/i.test(f)).sort((a, b) => parseInt(a) - parseInt(b));
write('ads/index.json', JSON.stringify({ ads: adFiles }, null, 2) + '\n');

// ---------------------------------------------------------------
// Static list pages
// ---------------------------------------------------------------
const CSS = `
:root{--paper:#f2eee3;--paper-2:#fbf9f3;--ink:#141414;--ink-3:#635e58;--hl:#eaff00}
@media (prefers-color-scheme:dark){:root{--paper:#080b16;--paper-2:#0f1528;--ink:#eef0f6;--ink-3:#9aa3c2;--hl:#d9ff3a}}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 'Space Mono','Courier New',monospace}
@font-face{font-family:'Archivo Black';src:url('../../vendor/fonts/archivo-black-latin-400-normal.woff2') format('woff2');font-display:swap}
@font-face{font-family:'Space Mono';src:url('../../vendor/fonts/space-mono-latin-400-normal.woff2') format('woff2');font-display:swap}
a{color:inherit}main{max-width:820px;margin:0 auto;padding:24px 18px 60px}
.top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:.85rem;margin-bottom:28px}
.brand{font-family:'Archivo Black',Impact,sans-serif;text-transform:uppercase;text-decoration:none;font-size:1.1rem}
h1{font-family:'Archivo Black',Impact,sans-serif;text-transform:uppercase;font-size:clamp(2rem,7vw,3.4rem);line-height:1;margin:0 0 10px}
.desc{border-left:4px solid var(--hl);padding-left:12px;font-style:italic}
.meta{font-size:.78rem;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em}
.cta{display:inline-block;margin:14px 0 26px;background:var(--hl);color:#111;border:2px solid #111;padding:10px 16px;font-weight:700;text-decoration:none;box-shadow:4px 4px 0 #111}
h2{font-family:'Archivo Black',Impact,sans-serif;text-transform:uppercase;font-size:1.15rem;border-bottom:3px solid var(--ink);padding-bottom:4px;margin:30px 0 10px}
ul{list-style:none;padding:0;margin:0}li{padding:10px 0;border-bottom:1px dashed var(--ink-3)}
.n{font-weight:700;text-transform:uppercase}.s{color:var(--ink-3);font-size:.85rem}.note{margin:3px 0 0;font-size:.9rem}
.also{font-size:.75rem;color:var(--ink-3)}footer{margin-top:40px;font-size:.8rem;color:var(--ink-3)}
`;

function entryLine(cat, item, idx) {
    const sub = [item.year && `Est. ${item.year}`, item.cuisine, item.location, item.price, item.month].filter(Boolean).map(esc).join(' · ');
    const when = item.rule ? `Next: ${shortDate(nextRuleDate(item.rule))}. ` : '';
    const note = [when + (item.when || ''), item.dish, item.note].filter(Boolean).map(esc).join(' — ');
    const feats = featuresOf(practical(cat, item)).map(f => f.label).join(', ');
    const link = item.url ? `<a href="${esc(item.url)}" rel="noopener">${esc(LINK_LABEL[linkKind(item.url)])} ↗</a>` : `<a href="${gSearch(item.name)}" rel="noopener nofollow">Search ↗</a>`;
    const also = idx !== undefined ? alsoIn(cat, item.name) : [];
    return `<li><span class="n">${esc(item.name)}</span>${sub ? ` <span class="s">(${sub})</span>` : ''}${item.free ? ' <span class="s">· free</span>' : ''} · ${link}
${note ? `<p class="note">${note}</p>` : ''}${feats ? `<p class="s">${esc(feats)}</p>` : ''}${also.length ? `<p class="also">Also on: ${also.map(o => `<a href="../${slugOf(o.cat)}/">${esc(o.cat)}</a>`).join(', ')}</p>` : ''}</li>`;
}

function listBody(cat) {
    const v = wikiData[cat];
    let html = '<ul>';
    let open = true;
    (v.items || []).forEach((item, idx) => {
        if (item.header) { html += `</ul><h2>${esc(item.header)}</h2><ul>`; return; }
        if (item.name) html += entryLine(cat, item, idx);
    });
    html += '</ul>';
    if (v.honorableMentions?.length) html += `<h2>Honorable mentions</h2><ul>${v.honorableMentions.map(i => entryLine(cat, i)).join('')}</ul>`;
    return html.replace('<ul></ul>', '');
}

function page({ slug, title, emoji, desc, count, updated, appHref, body, jsonItems }) {
    const url = `${SITE}list/${slug}/`;
    const ld = { '@context': 'https://schema.org', '@type': 'ItemList', name: `${title} · The Louisville Wiki`, description: desc, url, numberOfItems: count,
        itemListElement: jsonItems.slice(0, 200).map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })) };
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · The Louisville Wiki</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="The Louisville Wiki">
<meta property="og:title" content="${esc(emoji)} ${esc(title)} · The Louisville Wiki">
<meta property="og:description" content="${esc(desc)} ${count} entries.">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../../icon-192.png">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>${CSS.trim()}</style>
</head>
<body>
<main>
<nav class="top"><a class="brand" href="../../">⚜ The Louisville Wiki</a><a href="../">every list</a></nav>
<p class="meta">${esc(emoji)} ${count} entries${updated ? ` · updated ${esc(prettyDate(updated))}` : ''}</p>
<h1>${esc(title)}</h1>
<p class="desc">${esc(desc)}</p>
<a class="cta" href="../../${appHref}">Open the interactive version →</a>
${body}
<footer>The Louisville Wiki: a wiki, directory and toybox for Louisville, KY. Spot something wrong? Use “💬 Discuss” on the <a href="../../${appHref}">interactive page</a>.</footer>
</main>
</body>
</html>
`;
}

const pages = [];
for (const cat of orderedKeys) {
    const slug = slugOf(cat);
    const v = wikiData[cat];
    write(`list/${slug}/index.html`, page({
        slug, title: cat, emoji: emojiOf(cat), desc: v.description || '', count: countOf(cat), updated: v.updated,
        appHref: `#/c/${slug}`, body: listBody(cat), jsonItems: realItems(cat).map(i => i.name),
    }));
    pages.push({ slug, title: cat, emoji: emojiOf(cat), count: countOf(cat), lastmod: v.updated || today });
}
for (const id of Object.keys(PRESETS)) {
    const p = PRESETS[id];
    const n = presetCount(id);
    if (!n || (p.hood && n < 3)) continue;
    const sections = presetSections(id);
    const body = sections.map(s => `<h2><a href="../${slugOf(s.cat)}/">${esc(emojiOf(s.cat))} ${esc(s.cat)}</a></h2><ul>${s.entries.map(e => entryLine(e.cat, e.item, e.idx)).join('')}</ul>`).join('');
    const slug = id;
    write(`list/${slug}/index.html`, page({ slug, title: p.title, emoji: p.emoji, desc: p.desc, count: n, appHref: `#/p/${id}`, body, jsonItems: sections.flatMap(s => s.entries.map(e => e.item.name)) }));
    pages.push({ slug, title: p.title, emoji: p.emoji, count: n, lastmod: today, preset: true });
}

// list/index.html: the index of every static page
write('list/index.html', `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Every list · The Louisville Wiki</title>
<meta name="description" content="Every list on the Louisville Wiki: restaurants, bars, parks, history, oddities, events and neighborhoods in Louisville, KY.">
<link rel="canonical" href="${SITE}list/"><link rel="icon" href="../icon-192.png">
<meta property="og:title" content="Every list · The Louisville Wiki"><meta property="og:image" content="${SITE}og-image.png">
<style>${CSS.trim().replace(/\.\.\/\.\.\//g, '../')}</style></head>
<body><main><nav class="top"><a class="brand" href="../">⚜ The Louisville Wiki</a></nav>
<h1>Every list</h1><p class="desc">${pages.filter(p => !p.preset).reduce((n, p) => n + p.count, 0)} entries across ${pages.filter(p => !p.preset).length} lists, plus gathered lists by neighborhood and season.</p>
<a class="cta" href="../">Open the interactive wiki →</a>
<h2>Lists</h2><ul>${pages.filter(p => !p.preset).map(p => `<li><a class="n" href="${p.slug}/">${esc(p.emoji)} ${esc(p.title)}</a> <span class="s">(${p.count})</span></li>`).join('')}</ul>
<h2>Gathered lists</h2><ul>${pages.filter(p => p.preset).map(p => `<li><a class="n" href="${p.slug}/">${esc(p.emoji)} ${esc(p.title)}</a> <span class="s">(${p.count})</span></li>`).join('')}</ul>
</main></body></html>
`);

// sitemap + robots
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}</loc><lastmod>${today}</lastmod></url>
  <url><loc>${SITE}list/</loc><lastmod>${today}</lastmod></url>
${pages.map(p => `  <url><loc>${SITE}list/${p.slug}/</loc><lastmod>${p.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);

// ---------------------------------------------------------------
// Reddit text
// ---------------------------------------------------------------
for (const script of ['reddit/build.mjs', 'reddit/build-lite.mjs']) {
    if (fs.existsSync(new URL(script, ROOT))) execFileSync(process.execPath, [new URL(script, ROOT).pathname], { stdio: 'inherit' });
}

console.log(`Built ${pages.length} list pages, sitemap, robots.txt, ads/index.json (${adFiles.length} ads).`);
