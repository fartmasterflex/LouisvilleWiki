// Checks library_data.js (and the files that hang off it) for mistakes.
//
//   node tools/validate.mjs            # errors fail (exit 1), warnings don't
//   node tools/validate.mjs --quiet    # errors and the summary only
//
// Runs in GitHub Actions on every push and pull request (.github/workflows/check.yml).
import fs from 'fs';
import { execFileSync } from 'child_process';

const ROOT = new URL('..', import.meta.url);
const quiet = process.argv.includes('--quiet');
const errors = [], warnings = [];
const err = (where, msg) => errors.push(`✖ ${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`⚠ ${where}: ${msg}`);

// Load the raw data first (before data.js moves closed entries around)
let raw;
try { raw = (await import(new URL('library_data.js', ROOT))).wikiData; }
catch (e) { console.error(`✖ library_data.js does not parse:\n${e.message}`); process.exit(1); }
const rawCopy = JSON.parse(JSON.stringify(raw));
const D = await import(new URL('js/data.js', ROOT));
const { AREAS, FEATURES, placeKey, ruleDate, NAMED_REFS, PRESETS, presetCount } = D;
const { manualCoords } = await import(new URL('js/coordinates.js', ROOT));

const TYPES = new Set(['table', 'ranked', 'alpha', 'events', 'custom']);
const FEATURE_KEYS = new Set(FEATURES.map(f => f.key));
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const goodUrl = (u) => { try { const x = new URL(u); return x.protocol === 'https:'; } catch { return false; } };

// ---------------------------------------------------------------
// Lists and entries
// ---------------------------------------------------------------
const allNames = new Map(); // placeKey → [{ cat, item }]
for (const [cat, list] of Object.entries(rawCopy)) {
    if (!list.description) warn(cat, 'no description');
    if (!TYPES.has(list.type)) err(cat, `unknown type "${list.type}"`);
    if (!Array.isArray(list.items)) { err(cat, 'items is not an array'); continue; }
    if (list.updated && !DATE.test(list.updated)) err(cat, `updated "${list.updated}" is not YYYY-MM-DD`);
    if (!list.updated) warn(cat, 'no updated date (run node tools/stamp-updated.mjs)');

    let header = '';
    const seen = new Map();
    const emptyNotes = [];
    for (const item of [...list.items, ...(list.honorableMentions || [])]) {
        if (item.header) { header = item.header; continue; }
        const at = `${cat} › ${item.name || '(no name)'}`;
        if (!item.name || typeof item.name !== 'string') { err(at, 'entry has no name'); continue; }
        if (item.name !== item.name.trim()) err(at, 'name has leading/trailing spaces');
        // the same name twice in one section is a copy-paste slip; across sections it can be on purpose
        const k = placeKey(item.name);
        if (cat === 'Louisville History Timeline') { /* entries are years; several events can share one */ }
        else if (seen.get(k) === header) err(at, `listed twice under "${header || 'the top'}"`);
        else if (seen.has(k)) warn(at, `appears in two sections ("${seen.get(k)}" and "${header}")`);
        seen.set(k, header);
        if (!['Louisville History Timeline', 'Neighborhoods', 'Eats & Lingo'].includes(cat)) (allNames.get(k) || allNames.set(k, []).get(k)).push({ cat, item });

        if (item.url !== undefined && item.url !== '' && !goodUrl(item.url)) err(at, `url "${item.url}" is not a valid https link`);
        if (item.url && /google\.com\/maps/.test(item.url)) warn(at, 'links to a Google Maps search, not the place\'s own site');
        if (item.closed !== undefined && item.closed !== true && !/^\d{4}(-\d{2})?$/.test(String(item.closed))) err(at, `closed "${item.closed}" should be a year like "2026" or "2026-10"`);
        for (const key of Object.keys(item)) if (FEATURE_KEYS.has(key) && !(item[key] === true || item[key] === 'partial')) err(at, `${key} should be true or "partial"`);
        if (item.hours !== undefined && typeof item.hours !== 'string') err(at, 'hours should be text, like "24/7" or "7 AM to 3 PM"');
        if (item.then || item.now) {
            for (const side of ['then', 'now']) {
                const img = item[side];
                if (!img?.src) { err(at, `then/now slider needs both ${side}.src values`); continue; }
                if (!/^https:/.test(img.src) && !fs.existsSync(new URL(img.src, ROOT))) err(at, `${side} image "${img.src}" not found`);
                if (!img.credit) warn(at, `${side} image has no credit line`);
            }
        }

        if (list.type === 'table') {
            for (const f of ['location', 'cuisine', 'dish', 'price']) if (!item[f]) err(at, `missing ${f}`);
            if (item.location && !AREAS.includes(item.location)) err(at, `location "${item.location}" isn't one of the neighborhoods in js/data.js AREAS`);
            if (item.price && !/^\${1,4}$/.test(item.price)) err(at, `price "${item.price}" should be $ to $$$$`);
            if (item.url === undefined) warn(at, 'no url field (use "" if there is no site)');
        } else if (list.type === 'events') {
            if (!(item.monthIndex >= 1 && item.monthIndex <= 13)) err(at, `monthIndex ${item.monthIndex} should be 1-12 (13 = year-round)`);
            if (item.rule && !ruleDate(item.rule, 2026)) err(at, `rule "${item.rule}" isn't understood (see ruleDate in js/data.js)`);
            if (!item.when) emptyNotes.push(item.name);
        } else if (list.type === 'ranked') {
            if (!item.year) warn(at, 'no year');
        } else if (!item.note && !item.closed) emptyNotes.push(item.name);
    }
    if (emptyNotes.length) warn(cat, `${emptyNotes.length} entr${emptyNotes.length === 1 ? 'y has' : 'ies have'} no ${list.type === 'events' ? '"when"' : 'note'}: ${emptyNotes.slice(0, 6).join(', ')}${emptyNotes.length > 6 ? '…' : ''}`);
}

// ---------------------------------------------------------------
// One place on several lists: facts that should agree
// ---------------------------------------------------------------
for (const [, entries] of allNames) {
    if (entries.length < 2) continue;
    for (const field of ['url', 'year']) {
        const vals = [...new Set(entries.map(e => e.item[field]).filter(Boolean))];
        if (vals.length > 1) warn(entries.map(e => e.cat).join(' / ') + ` › ${entries[0].item.name}`, `different ${field}s on different lists: ${vals.join(' vs ')}`);
    }
    const open = entries.filter(e => !e.item.closed), shut = entries.filter(e => e.item.closed);
    if (open.length && shut.length) err(`${entries[0].item.name}`, `closed on ${shut.map(e => e.cat).join(', ')} but still open on ${open.map(e => e.cat).join(', ')}`);
}

// Names the gathered lists (seasons) ask for by hand
for (const name of NAMED_REFS) if (!allNames.has(placeKey(name)) && !Object.values(rawCopy).some(l => l.items?.some(i => i.name === name)))
    warn('js/data.js PRESETS', `"${name}" isn't on any list (renamed or removed?)`);
for (const [id, p] of Object.entries(PRESETS)) if (p.season && !presetCount(id)) warn(`PRESETS.${id}`, 'seasonal list is empty');

// ---------------------------------------------------------------
// Coordinates
// ---------------------------------------------------------------
const known = new Set(Object.values(rawCopy).flatMap(l => [...(l.items || []), ...(l.honorableMentions || [])].filter(i => i.name).map(i => i.name)));
const dayTrips = new Set((rawCopy['Day Trips']?.items || []).map(i => i.name));
for (const [name, c] of Object.entries(manualCoords)) {
    if (!known.has(name)) warn('js/coordinates.js', `"${name}" isn't on any list any more`);
    if (c === null) continue;
    if (!Array.isArray(c) || c.length !== 2) { err('js/coordinates.js', `"${name}" should be [lat, lng] or null`); continue; }
    const [lat, lng] = c;
    // day trips can be 3 hours out; everything else should be in the metro
    const box = dayTrips.has(name) ? [35.5, 40.5, -89.5, -82.5] : [37.6, 38.8, -86.4, -85.0];
    if (!(lat > box[0] && lat < box[1] && lng > box[2] && lng < box[3])) err('js/coordinates.js', `"${name}" [${lat}, ${lng}] is outside the Louisville area`);
}
const dining = rawCopy['Dining Directory']?.items.filter(i => i.name && !i.closed && i.location !== 'Multiple Locations') || [];
const pinned = dining.filter(i => manualCoords[i.name]).length;
if (pinned < dining.length) warn('Dining map', `${dining.length - pinned} of ${dining.length} restaurants have no saved coordinates (run node tools/geocode.mjs on your computer)`);

// ---------------------------------------------------------------
// Billboard ads and the monthly bracket
// ---------------------------------------------------------------
const adFiles = fs.readdirSync(new URL('ads/', ROOT)).filter(f => /^\d+\.(png|jpe?g|webp|gif)$/i.test(f)).sort((a, b) => parseInt(a) - parseInt(b));
const nums = adFiles.map(f => parseInt(f));
nums.forEach((n, i) => { if (n !== i + 1) err('ads/', `ads should be numbered 1, 2, 3… with no gaps (found ${adFiles.join(', ')})`); });
try {
    const idx = JSON.parse(fs.readFileSync(new URL('ads/index.json', ROOT), 'utf8'));
    if (JSON.stringify(idx.ads) !== JSON.stringify(adFiles)) warn('ads/index.json', 'out of date (run node tools/build.mjs)');
} catch { warn('ads/index.json', 'missing (run node tools/build.mjs)'); }

const bdir = new URL('data/bracket/', ROOT);
if (fs.existsSync(bdir)) for (const f of fs.readdirSync(bdir).filter(f => f.endsWith('.json'))) {
    try {
        const b = JSON.parse(fs.readFileSync(new URL(f, bdir), 'utf8'));
        if (b.seeds?.length !== 16 || new Set(b.seeds).size !== 16) err(`data/bracket/${f}`, 'needs 16 different seeds');
        for (const [r, len] of [['R1', 8], ['R2', 4], ['R3', 2], ['R4', 1]]) if (b.results?.[r] && !new RegExp(`^[AB]{${len}}$`).test(b.results[r])) err(`data/bracket/${f}`, `${r} result should be ${len} A/B letters`);
    } catch (e) { err(`data/bracket/${f}`, 'is not valid JSON'); }
}

// ---------------------------------------------------------------
// "updated" dates that didn't move with the content (local runs with git)
// ---------------------------------------------------------------
try {
    const changed = execFileSync('git', ['diff', '--quiet', 'HEAD', '--', 'library_data.js'], { cwd: new URL('.', ROOT).pathname, stdio: 'ignore' });
} catch (e) {
    if (e.status === 1) {
        const today = new Date().toISOString().slice(0, 10);
        const stale = Object.entries(rawCopy).filter(([, l]) => l.updated && l.updated < today).length;
        if (stale) warn('library_data.js', 'has uncommitted changes; run node tools/stamp-updated.mjs so the changed lists show today\'s date');
    }
}

// ---------------------------------------------------------------
const total = Object.values(rawCopy).reduce((n, l) => n + (l.items || []).filter(i => i.name).length, 0);
if (!quiet) warnings.forEach(w => console.log(w));
errors.forEach(e => console.log(e));
console.log(`\n${Object.keys(rawCopy).length} lists, ${total} entries · ${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`);
process.exit(errors.length ? 1 : 0);
