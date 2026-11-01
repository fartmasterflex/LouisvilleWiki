// Regenerates reddit/wiki.md and reddit/sidebar.md from library_data.js:  node reddit/build.mjs
import fs from 'fs';
const noop=()=>{}; const el=new Proxy(noop,{get:(t,p)=>p===Symbol.toPrimitive?()=>'':el,apply:()=>el}); globalThis.document=el; globalThis.window=el; globalThis.localStorage={getItem:()=>null,setItem:noop};
const R = new URL('../', import.meta.url).href;
const D = await import(R + 'js/data.js');
const { wikiData, orderedKeys, slugOf, emojiOf, COMPANIONS, ANNUAL_EVENTS, PINNED, countOf, totalCount, presetCount, MONTHS } = D;
const SITE = 'https://fartmasterflex.github.io/LouisvilleWiki/';
const link = k => `${SITE}#/c/${slugOf(k)}`;
const esc = s => String(s ?? '').replace(/([*_~^\[\]|])/g, '\$1').trim();
const realUrl = u => u && !/google\.com\/maps/.test(u) ? u : null;
const nm = (i) => { const u = realUrl(i.url); return u ? `**[${esc(i.name)}](${u.replace(/\)/g,'%29')})**` : `**${esc(i.name)}**`; };
const free = i => i.free ? ' 🆓' : '';

// order: pinned, then companions right after their parent, then rest A–Z
const comp = new Set(Object.values(COMPANIONS).flat());
const order = [];
const push = k => { if (order.includes(k) || !wikiData[k]) return; order.push(k); (COMPANIONS[k] || []).forEach(push); };
orderedKeys.filter(k => !comp.has(k) && k !== ANNUAL_EVENTS).forEach(push);
push(ANNUAL_EVENTS);

function section(k) {
  const v = wikiData[k], out = [];
  out.push(`## ${emojiOf(k)} ${k}`, '', `*${esc(v.type==='table'?'The big list, grouped by cuisine. Linked names go to each restaurant’s site or menu.':v.description)}* · ${countOf(k)} entries · [open on the site](${link(k)})`, '');
  if (v.type === 'table') {
    const by = {};
    for (const i of v.items) (by[i.cuisine || 'Other'] ||= []).push(i);
    for (const c of Object.keys(by).sort()) {
      out.push(`### ${esc(c)}`, '');
      by[c].sort((a, b) => a.name.localeCompare(b.name)).forEach(i =>
        out.push(`* ${nm(i)} (${esc(i.location)}${i.price ? ', ' + i.price : ''})${i.dish ? ' – ' + esc(i.dish) : ''}`));
      out.push('');
    }
  } else if (v.type === 'ranked') {
    v.items.forEach((i, n) => out.push(`${n + 1}. **${esc(i.year)}** – ${nm(i)}${free(i)}${i.note ? ' – ' + esc(i.note) : ''}`));
    out.push('');
    if (v.honorableMentions?.length) {
      out.push('**Honorable mentions:**', '');
      v.honorableMentions.forEach(i => out.push(`* ${esc(i.year)} – ${nm(i)}${i.note ? ' – ' + esc(i.note) : ''}`));
      out.push('');
    }
  } else if (v.type === 'events') {
    const by = {};
    for (const i of v.items) (by[i.monthIndex ?? 13] ||= []).push(i);
    for (const m of Object.keys(by).map(Number).sort((a, b) => a - b)) {
      out.push(`### ${MONTHS[m] || by[m][0].month}`, '');
      by[m].forEach(i => out.push(`* ${nm(i)}${free(i)}${i.month && i.month !== MONTHS[m] ? ' – ' + esc(i.month) : ''}${i.note ? ' – ' + esc(i.note) : ''}`));
      out.push('');
    }
  } else {
    let open = false;
    for (const i of v.items) {
      if (i.header) { if (open) out.push(''); out.push(`### ${esc(i.header)}`, ''); open = true; continue; }
      if (!i.name) continue;
      const bits = [i.location && `*${esc(i.location)}*`, i.year && esc(i.year), i.note && esc(i.note)].filter(Boolean);
      out.push(`* ${nm(i)}${free(i)}${bits.length ? ' – ' + bits.join(' – ') : ''}`); open = true;
    }
    out.push('');
  }
  return out.join('\n');
}

const toc = order.map(k => `* ${emojiOf(k)} [${k}](${link(k)}) (${countOf(k)})`).join('\n');
const head = `# ⚜ The Louisville Wiki

**${totalCount} Louisville places, events, legends and local knowledge in ${order.length} lists.** The full interactive version lives at **[${SITE.replace('https://','').replace(/\/$/,'')}](${SITE})**, with search, maps, a been-there tracker, generators and a pile of easter eggs. This page is the plain-text copy of everything on it.

🆓 = free to get into ( [see every free thing](${SITE}#/p/free), ${presetCount('free')} entries ). Linked names go to the place's own site.

---

## Contents

${toc}

## 🎲 Generators & Tools (on the site)

* **🏆 Bracket Maker** – pick 16 favorites from any list, fight it out, save the bracket as an image.
* **🍻 Bar Crawl** – three bars, all within a 2-mile walk, plotted on a map.
* **🎰 Night Out Slot** – activity, dinner, late night. Pull the lever and let the reels decide.
* **🃏 Louisville Bingo** – only-in-Louisville moments. Your card saves. Five in a row wins.
* **🏛️ History Walk** – four old landmarks and local oddities, one stroll under 2 miles, with the stories on the way.
* **💬 Community Board** – tips, corrections and hot takes (needs a GitHub account).
* **🔒 The Vault** – the site is full of easter eggs, and the vault tracks the ones you've found. No spoilers here.

---
`;
const wiki = head + '\n' + order.map(section).join('\n---\n\n') +
  `\n---\n\n*Something closed, moved or missing? Post it here or on the site's [Community Board](${SITE}). Everything is checked before it's added.*\n`;
fs.writeFileSync(new URL('wiki.md', import.meta.url), wiki.replace(/\r/g, ''));

// sidebar (old reddit limit 10,240 chars; new reddit text widget ~10,000)
const WIKI = process.env.WIKIURL || '/r/YOURSUB/wiki/louisvillewiki';
const sidebar = `## ⚜ The Louisville Wiki

**[${SITE.replace('https://','').replace(/\/$/,'')}](${SITE})**

${totalCount} places, events and legends in ${order.length} lists. Search it, map it, track where you've been. [Read the whole thing as text](${WIKI}).

**The Directory**

${order.filter(k => PINNED.includes(k)).map(k => `* ${emojiOf(k)} [${k}](${link(k)})`).join('\n')}

**Every List**

${order.filter(k => !PINNED.includes(k)).map(k => `* ${emojiOf(k)} [${k}](${link(k)}) (${countOf(k)})`).join('\n')}
* 🆓 [Free Louisville](${SITE}#/p/free) (${presetCount('free')})

**Can't decide?**

* 🏆 Bracket Maker · 🍻 Bar Crawl · 🎰 Night Out Slot · 🃏 Louisville Bingo · 🏛️ History Walk

**Need it fast**

* 🌙 [Bars & Late Night](${link('Bars & Late Night')}): what's open after 2 AM
* 🗣️ [Eats & Lingo](${link('Eats & Lingo')}): Hot Browns, Modjeskas, "the Watterson"
* 📅 [Annual Events](${link(ANNUAL_EVENTS)}): what's on this month

*Spot something closed or wrong? Post it and it gets fixed.*
`;
fs.writeFileSync(new URL('sidebar.md', import.meta.url), sidebar);
console.log('wiki', wiki.length, 'sidebar', sidebar.length, 'order', order.join(' / '));
