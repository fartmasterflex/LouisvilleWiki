// Writes reddit/wiki-lite.md: a short, skimmable subreddit wiki page built from
// library_data.js. It keeps the core of every list (names, neighborhoods, years,
// dates, one line of context) and leaves the details to the site.
//
//   node reddit/build-lite.mjs        (tools/build.mjs runs this too)
import fs from 'fs';

const R = new URL('../', import.meta.url);
const D = await import(new URL('js/data.js', R));
const { wikiData, orderedKeys, slugOf, emojiOf, countOf, totalCount, realItems, areaOf, AREAS, PRESETS, presetCount, prettyDate, nextRuleDate, MONTHS, COMPANIONS, ANNUAL_EVENTS, hoodPresets } = D;

const SITE = 'https://james-baunach.github.io/louisville-wiki/';
const page = (k) => `${SITE}list/${slugOf(k)}/`;
const esc = (s) => String(s ?? '').replace(/([*_~^\[\]|\\])/g, '\\$1').trim();
const free = (i) => (i.free ? ' 🆓' : '');
// The first sentence of a note, kept short
function line(t, max = 100) {
    if (!t) return '';
    let s = String(t).split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)[0].trim();
    if (s.length > max) s = s.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
    return esc(s);
}
const out = [];
const push = (...l) => out.push(...l);

// Sections in a sensible reading order: pinned first, companions after their parent, the rest A–Z
const comp = new Set(Object.values(COMPANIONS).flat());
const order = [];
const add = (k) => { if (order.includes(k) || !wikiData[k]) return; order.push(k); (COMPANIONS[k] || []).forEach(add); };
orderedKeys.filter(k => !comp.has(k) && k !== ANNUAL_EVENTS).forEach(add);
add(ANNUAL_EVENTS);

// ---------------------------------------------------------------
push(`# ⚜ The Louisville Wiki: the short version`, '',
    `**${(Math.floor(totalCount / 50) * 50).toLocaleString('en-US')}+ Louisville spots, legends and dates, boiled down to one page.** The full site (search, maps, filters, a been-there tracker, generators and plenty of easter eggs) is at **[${SITE.replace('https://', '').replace(/\/$/, '')}](${SITE})**. Every heading below links to its full list.`, '',
    `🆓 = free · $ to $$$$ = price · lists last updated ${prettyDate(Object.values(wikiData).map(l => l.updated).filter(Boolean).sort().pop())}`, '',
    '---', '',
    '**Jump to a full list:** ' + order.map(k => `[${k}](${page(k)})`).join(' · '), '',
    '---', '');

// A first-timer's dozen: things everybody should do once (only names that are on the wiki)
const STARTERS = [
    ["Brown Hotel Lobby Bar & Grill", "a Hot Brown where it was invented (1926)"],
    ["Big Four Bridge at Sunset", "walk to Indiana and back"],
    ["Cave Hill's Famous Graves", "Ali, the Colonel and the Happy Birthday sisters"],
    ["Louisville Slugger Museum & Factory", "the 120-foot bat out front"],
    ["Muhammad Ali Center", "the Greatest's museum, on the riverfront"],
    ["The Belle of Louisville", "the oldest operating Mississippi-style steamboat"],
    ["Mag Bar", "cheap beer, punk rock and a 4 AM last call"],
    ["Wagner's Pharmacy", "breakfast with the backstretch since 1922"],
    ["Falls of the Ohio State Park", "walk on a 390-million-year-old fossil reef"],
    ["The Witches' Tree", "leave an offering at 6th & Park"],
    ["Iroquois Park North Overlook", "the skyline from the top of the South End"],
    ["Muth's Candies", "a Modjeska, Louisville's caramel marshmallow"],
];
const exists = new Set(Object.values(wikiData).flatMap(l => [...(l.items || []), ...(l.honorableMentions || [])].map(i => i.name)));
const starters = STARTERS.filter(([n]) => exists.has(n));
if (starters.length) push('## 🗝️ New here? Start with these', '', ...starters.map(([n, why]) => `* **${esc(n)}**: ${esc(why)}`), '', '---', '');

// ---------------------------------------------------------------
for (const k of order) {
    const v = wikiData[k];
    push(`## ${emojiOf(k)} ${k}`, '', `*${esc(v.type === 'table' ? 'Every restaurant on the site, by neighborhood. The full list has dishes, prices, cuisines, filters and a map.' : v.description)}* **[Full list (${countOf(k)}) →](${page(k)})**`, '');

    if (v.type === 'table') {
        // Dining: one line per neighborhood, names only
        const byArea = {};
        realItems(k).forEach(i => (byArea[areaOf(i.location) || 'Elsewhere'] ||= []).push(i));
        push('| Neighborhood | Spots |', '|:--|:--|');
        AREAS.concat('Elsewhere').filter(a => byArea[a]).forEach(a =>
            push(`| **${esc(a)}** | ${byArea[a].sort((x, y) => x.name.localeCompare(y.name)).map(i => esc(i.name)).join(' · ')} |`));
        push('');
    } else if (v.type === 'ranked') {
        push(realItems(k).map(i => `${esc(i.year)} **${esc(i.name)}**${free(i)}`).join(' · '), '');
    } else if (v.type === 'events') {
        push('| Month | What\'s on |', '|:--|:--|');
        const by = {};
        realItems(k).forEach(i => (by[D.eventMonth(i)] ||= []).push(i));
        Object.keys(by).map(Number).sort((a, b) => a - b).forEach(m => {
            push(`| **${MONTHS[m] || 'Year-round'}** | ${by[m].map(i => {
                const d = i.rule ? nextRuleDate(i.rule) : null;
                return `${esc(i.name)}${free(i)}${d ? ` (${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})` : ''}`;
            }).join(' · ')} |`);
        });
        push('', '*Dates in parentheses follow a rule (Thunder is two Saturdays before the Derby, the Dainty is the last Monday in July) and are the next one coming up.*', '');
    } else if (k === 'Louisville History Timeline') {
        let era = null;
        for (const i of v.items) {
            if (i.header) { era = i.header; push(`**${esc(era)}**`, ''); continue; }
            if (i.name) push(`* **${esc(i.name)}**: ${line(i.note, 140)}`);
        }
        push('');
    } else {
        // Custom lists: keep the section headers; one line of context per entry
        const lines = [];
        for (const i of v.items) {
            if (i.header) { lines.push('', `**${esc(i.header)}**`, ''); continue; }
            if (!i.name) continue;
            const ctx = line(i.note) || (i.year ? esc(i.year) : '');
            lines.push(`* **${esc(i.name)}**${i.year && k === 'Lost Louisville' ? ` (${esc(i.year)})` : ''}${free(i)}${ctx && !(k === 'Lost Louisville' && ctx === esc(i.year)) ? ` – ${ctx}` : ''}`);
        }
        push(...lines.slice(lines[0] === '' ? 1 : 0), '');
    }
    push('---', '');
}

// ---------------------------------------------------------------
const hoods = hoodPresets(8);
push('## 📍 Everything in one neighborhood', '',
    hoods.map(id => `[${esc(PRESETS[id].hood)}](${SITE}list/${id}/) (${presetCount(id)})`).join(' · '), '',
    '## 🎲 On the site, not on this page', '',
    '* **Search & maps.** Every list is searchable and most have a map.',
    '* **Bracket of the Month.** Same 16 for everyone; a round a week, voted on the community board.',
    '* **Generators.** Bar Crawl (3 bars, one walk), History Walk, Night Out Slot, Louisville Bingo, a bracket maker.',
    `* **Seasonal lists.** [Derby Season](${SITE}list/derby/), [Fish Fry Fridays](${SITE}list/lent/), [Picnic Season](${SITE}list/picnics/), [Spooky Louisville](${SITE}list/spooky/), [Lights & Snow Days](${SITE}list/winter/).`,
    '* **Been-there tracker** and a vault of easter eggs.', '',
    '*Something closed, moved or missing? Post it here or hit 💬 Discuss on that list. Every change is checked before it goes in.*', '');

const md = out.join('\n').replace(/\n{3,}/g, '\n\n');
fs.writeFileSync(new URL('wiki-lite.md', import.meta.url), md);
console.log('wiki-lite', md.length, 'chars');
