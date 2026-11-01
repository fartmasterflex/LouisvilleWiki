// Finds map coordinates for entries that don't have any yet and saves them
// into js/coordinates.js, so the map never has to look them up live.
//
//   node tools/geocode.mjs                       # every list with a map view
//   node tools/geocode.mjs "Dining Directory"    # one list
//   node tools/geocode.mjs --limit 20 --dry      # try 20, print, don't save
//
// Run it on your own computer (it needs the open internet). It asks
// OpenStreetMap's Nominatim one place at a time, a little over a second apart,
// as their usage policy requires, so ~230 restaurants take about 5 minutes.
// Anything it can't place is listed at the end: add those by hand
// ("Name": [lat, lng]) or as null if there's no single spot to pin.
import fs from 'fs';

const ROOT = new URL('..', import.meta.url);
const FILE = new URL('js/coordinates.js', ROOT);
const { wikiData, NO_MAP, areaOf } = await import(new URL('js/data.js', ROOT));
const { manualCoords } = await import(new URL('js/coordinates.js', ROOT));

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const limit = +(args[args.indexOf('--limit') + 1] || 0) || Infinity;
const only = args.find(a => wikiData[a]);

// Louisville metro plus the Southern Indiana riverfront
const VIEWBOX = '-86.05,38.45,-85.35,37.95';
const UA = 'LouisvilleWiki-geocoder/1.0 (https://github.com/FartmasterFlex/LouisvilleWiki)';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const todo = [];
for (const [cat, list] of Object.entries(wikiData)) {
    if (only && cat !== only) continue;
    if (NO_MAP.has(cat) || cat === 'Day Trips') continue;
    for (const item of list.items || []) {
        if (!item.name || item.header || item.name in manualCoords) continue;
        if (item.location === 'Multiple Locations') continue;
        if (!todo.some(t => t.name === item.name)) todo.push({ name: item.name, cat, hint: areaOf(item.location) || item.location || '' });
    }
}
console.log(`${todo.length} without coordinates${only ? ` in ${only}` : ''}. Looking up ${Math.min(todo.length, limit)}…`);

async function lookup(q) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&viewbox=${VIEWBOX}&bounded=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const [hit] = await res.json();
    return hit ? { lat: +(+hit.lat).toFixed(5), lng: +(+hit.lon).toFixed(5), label: hit.display_name } : null;
}

const found = [], missed = [];
for (const t of todo.slice(0, limit)) {
    let hit = null;
    // the name alone first (most specific); then with the neighborhood
    for (const q of [`${t.name}, Louisville, KY`, t.hint && !/Southern Indiana/.test(t.hint) ? `${t.name}, ${t.hint}, Louisville` : null, /Southern Indiana/.test(t.hint) ? `${t.name}, Indiana` : null].filter(Boolean)) {
        try { hit = await lookup(q); } catch (e) { console.warn(`  ! ${t.name}: ${e.message}`); }
        await sleep(1100);
        if (hit) break;
    }
    if (hit) { found.push({ ...t, ...hit }); console.log(`  ✓ ${t.name} → ${hit.lat}, ${hit.lng}`); }
    else { missed.push(t); console.log(`  · ${t.name}: no match`); }
}

if (found.length && !dry) {
    const src = fs.readFileSync(FILE, 'utf8');
    const date = new Date().toISOString().slice(0, 10);
    const lines = found.map(f => {
        const key = `    ${JSON.stringify(f.name)}: [${f.lat.toFixed(5)}, ${f.lng.toFixed(5)}],`;
        return `${key.padEnd(62)} // OSM (${f.cat}): ${f.label.slice(0, 90)}`;
    });
    const block = `\n    // ===== GEOCODED by tools/geocode.mjs on ${date}: spot-check these on the map =====\n${lines.join('\n')}\n`;
    const end = src.lastIndexOf('};');
    fs.writeFileSync(FILE, src.slice(0, end) + block + '\n' + src.slice(end));
}
console.log(`\n${found.length} found${dry ? ' (dry run, nothing saved)' : ' and saved to js/coordinates.js'}, ${missed.length} not found.`);
if (missed.length) console.log('Not found (add by hand, or null for "no single spot"):\n' + missed.map(m => `  "${m.name}": null,   // ${m.cat}`).join('\n'));
