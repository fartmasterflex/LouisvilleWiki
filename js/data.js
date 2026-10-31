// --- js/data.js ---
// Derived data on top of library_data.js: closures, neighborhoods, cross-links,
// gathered lists, seasons, slugs, emoji and the search index.
import { wikiData } from '../library_data.js';
import { slugify } from './utils.js';

export { wikiData };

// The four that lead the home page, in their own bigger cards
export const PINNED = ["Dining Directory", "Oldest Restaurants", "Oldest Landmarks", "Louisville History Timeline"];
// Shown as its own button in the "happening" strip instead of a card
export const ANNUAL_EVENTS = "Notable Annual Events";
export const LOST = "Lost Louisville";
// Lists that live inside another list's page (a banner at the top) instead of in the big grid
export const COMPANIONS = {
    "Louisville History Timeline": ["Neighborhoods", "Lost Louisville"],
    "Notable Annual Events": ["Church Picnics & Fish Fries"],
    "Dining Directory": ["Eats & Lingo"],
};
// Banner line for each companion, given its entry count
export const COMPANION_NOTES = {
    "Neighborhoods": (n) => `The history continues street by street: ${n} neighborhoods →`,
    "Lost Louisville": (n) => `${n} places we still give directions by →`,
    "Church Picnics & Fish Fries": (n) => `${n} parish picnics and Lenten fish fries →`,
    "Eats & Lingo": () => `Hot Browns, Modjeskas, and what "the Watterson" means →`,
};

// ---------------------------------------------------------------
// CLOSED PLACES
// An entry marked `closed: "2026"` leaves its list and joins Lost Louisville
// under "Recently Closed", so nothing is deleted and old stamps still resolve.
// ---------------------------------------------------------------
export const closedEntries = [];
for (const cat of Object.keys(wikiData)) {
    const items = wikiData[cat].items || [];
    const kept = [];
    for (const item of items) {
        if (item.closed && item.name) closedEntries.push({ ...item, from: cat });
        else kept.push(item);
    }
    wikiData[cat].items = kept;
}
if (closedEntries.length && wikiData[LOST]) {
    wikiData[LOST].items.push({ header: "Recently Closed" });
    closedEntries.forEach(e => wikiData[LOST].items.push({
        name: e.name,
        year: `closed ${e.closed === true ? '' : e.closed}`.trim(),
        note: [e.note || (e.dish ? `Known for ${e.dish.toLowerCase()}.` : ''), `It was on ${e.from}.`].filter(Boolean).join(' '),
        from: e.from,
    }));
}

// ---------------------------------------------------------------
// NEIGHBORHOODS — the one fixed list every "location" in Dining must use
// ---------------------------------------------------------------
export const AREAS = [
    "Downtown", "NuLu", "Butchertown", "Smoketown", "Shelby Park", "Paristown", "Irish Hill",
    "Germantown / Schnitzelburg", "Highlands", "Clifton", "Crescent Hill", "Old Louisville",
    "Portland", "West End", "South End", "Okolona", "Preston Hwy", "Poplar Level",
    "Buechel / Hikes Point", "Taylorsville Rd", "St. Matthews", "East End", "Middletown",
    "Jeffersontown", "Fern Creek", "River Road", "Shively", "Southern Indiana", "Multiple Locations",
];
// Older spellings still found in other lists (or old saved filters) → the fixed name
const AREA_ALIASES = {
    "south louisville": "South End", "frankfort ave": "Crescent Hill", "frankfort ave / crescent hill": "Crescent Hill",
    "frankfort ave / clifton": "Clifton", "lexington rd / irish hill": "Irish Hill", "irish hill / clifton": "Irish Hill",
    "germantown": "Germantown / Schnitzelburg", "schnitzelburg": "Germantown / Schnitzelburg",
    "the highlands": "Highlands", "cherokee triangle": "Highlands", "hikes point": "Buechel / Hikes Point", "buechel": "Buechel / Hikes Point",
    "j-town": "Jeffersontown", "lyndon": "East End", "waterfront": "Downtown", "jeffersonville, in": "Southern Indiana",
    "new albany, in": "Southern Indiana", "clarksville, in": "Southern Indiana",
};
const AREA_SET = new Map(AREAS.map(a => [a.toLowerCase(), a]));

// Normalize a "location" string to one of AREAS ('' if it isn't a neighborhood)
export function areaOf(loc) {
    if (!loc) return '';
    const a = String(loc).trim().replace(/\s*\(.*\)\s*$/, '').toLowerCase();
    if (AREA_SET.has(a)) return AREA_SET.get(a);
    if (AREA_ALIASES[a]) return AREA_ALIASES[a];
    if (/^west end/.test(a)) return 'West End';
    if (/, in$/.test(a)) return 'Southern Indiana';
    return '';
}

// The neighborhood an entry sits in: its location, or a note that opens with one ("Germantown. Dark, friendly…")
export function hoodOf(item) {
    return areaOf(item.location) || (item.note ? areaOf(item.note.split(/[.;]/)[0]) : '');
}

// ---------------------------------------------------------------
// PRESENTATION
// ---------------------------------------------------------------
const EMOJI = {
    "Dining Directory": "🍽️",
    "Oldest Restaurants": "🥘",
    "Oldest Landmarks": "🏛️",
    "Bars & Late Night": "🍺",
    "Shops & Digging": "🛍️",
    "Groceries & Markets": "🧺",
    "Museums & Galleries": "🖼️",
    "Attractions & Outings": "🎡",
    "Active Louisville": "🚴",
    "Parks": "🌳",
    "Notable Annual Events": "📅",
    "Breweries & Distilleries": "🥃",
    "Coffee": "☕",
    "Louisville Media": "📰",
    "Day Trips": "🚗",
    "Neighborhoods": "🏘️",
    "Louisville History Timeline": "⏳",
    "Eats & Lingo": "🗣️",
    "Church Picnics & Fish Fries": "🐟",
    "Lost Louisville": "🕯️",
    "Weird & Wonderful": "🦇",
    "Books, Libraries & Schools": "📚",
    "Sports, Clubs & Activities": "🎳",
    "Music, Stage & Screen": "🎸"
};

// Categories without a sensible map view
export const NO_MAP = new Set(["Louisville History Timeline", "Notable Annual Events", "Louisville Media", "Neighborhoods", "Eats & Lingo", "Lost Louisville"]);

export const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Year-Round"];

export const categoryKeys = Object.keys(wikiData);

// Home and pager ordering: the pinned four first, then A to Z
export const orderedKeys = [...PINNED.filter(k => wikiData[k]), ...categoryKeys.filter(k => !PINNED.includes(k)).sort((a, b) => a.localeCompare(b))];

const slugToKey = {};
const keyToSlug = {};
categoryKeys.forEach(k => { const s = slugify(k); slugToKey[s] = k; keyToSlug[k] = s; });
// old links from before a category was renamed or merged
const RENAMED = {
    'dive-bars': 'Bars & Late Night', 'bars': 'Bars & Late Night', 'late-night-and-24-7': 'Bars & Late Night',
    'thrift-vintage-and-digging': 'Shops & Digging', 'local-business': 'Shops & Digging',
    'bookstores': 'Books, Libraries & Schools', 'libraries': 'Books, Libraries & Schools', 'books-and-libraries': 'Books, Libraries & Schools', 'education': 'Books, Libraries & Schools',
    'theatre-the-stage': 'Music, Stage & Screen', 'cinema-and-drive-ins': 'Music, Stage & Screen', 'stage-and-screen': 'Music, Stage & Screen', 'music-venues': 'Music, Stage & Screen',
    'sports': 'Sports, Clubs & Activities', 'clubs-and-activities': 'Sports, Clubs & Activities',
    'weird-louisville': 'Weird & Wonderful', 'golden-hour-and-night-sky': 'Weird & Wonderful', 'snow-day': 'Weird & Wonderful',
    'grocery': 'Groceries & Markets', 'farmers-markets': 'Groceries & Markets',
    'golf-and-disc-golf': 'Active Louisville', 'bike-shops': 'Active Louisville',
};
for (const [s, k] of Object.entries(RENAMED)) if (wikiData[k] && !slugToKey[s]) slugToKey[s] = k;

export const slugOf = (key) => keyToSlug[key] || slugify(key);
export const keyOfSlug = (slug) => slugToKey[slug] || null;
export const emojiOf = (key) => EMOJI[key] || '📍';

export const realItems = (key) => (wikiData[key]?.items || []).filter(i => i.name && !i.header);
export const countOf = (key) => realItems(key).length;

export const totalCount = categoryKeys.reduce((n, k) => n + countOf(k), 0);

// "2026-10-10" → "Oct 10, 2026"
export function prettyDate(d) {
    if (!d) return '';
    const [y, m, day] = String(d).split('-').map(Number);
    const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][(m || 1) - 1];
    return day ? `${mon} ${day}, ${y}` : `${mon} ${y}`;
}

// What kind of page an entry's url is, so we can label it honestly
export function linkKind(url) {
    if (!url) return 'search';
    if (/facebook\.com/i.test(url)) return 'facebook';
    if (/instagram\.com/i.test(url)) return 'instagram';
    if (/google\.com\/maps/i.test(url)) return 'map';
    if (/menu/i.test(url)) return 'menu';
    return 'site';
}
export const LINK_LABEL = { site: 'Site', menu: 'Menu', facebook: 'Facebook', instagram: 'Instagram', map: 'Map', search: 'Search' };

// ---------------------------------------------------------------
// PRACTICAL DETAILS (optional fields on any entry)
//   hours: "24/7" · cash: true · kids: true · dogs: true · patio: true · accessible: true | "partial"
// ---------------------------------------------------------------
export const FEATURES = [
    { key: 'patio', label: 'Patio', icon: '☀️' },
    { key: 'dogs', label: 'Dog friendly', icon: '🐕' },
    { key: 'kids', label: 'Kid friendly', icon: '🧒' },
    { key: 'accessible', label: 'Wheelchair access', icon: '♿' },
    { key: 'cash', label: 'Cash only', icon: '💵' },
    { key: 'late', label: 'Open late', icon: '🌙' },
];
export function featuresOf(item) {
    return FEATURES.filter(f => item[f.key]).map(f => ({ ...f, partial: item[f.key] === 'partial' }));
}

// ---------------------------------------------------------------
// ONE PLACE, MANY LISTS
// The same spot can sit on several lists (Kern's Korner is a restaurant, an
// old-timer and a bar). placeKey() ties them together so each entry can say
// where else it appears, and the validator can catch copies that drift apart.
// ---------------------------------------------------------------
const NO_CROSSLINK = new Set(["Louisville History Timeline", "Neighborhoods", "Eats & Lingo"]);
// Different spellings of the same place → one key
const PLACE_ALIASES = {
    "burger boy diner": "burger boy",
    "kingsley meats catering": "kingsley meats",
    "impellizzeris pizza": "impellizzeris",
    "lees korean restaurant": "lees korean",
    "spring street bar and grill": "spring street bar",
    "spinellis pizzeria": "spinellis",
};
export function placeKey(name) {
    const k = String(name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[’']/g, '').replace(/^the /, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    return PLACE_ALIASES[k] || k;
}
export const placeIndex = new Map(); // key → [{ cat, idx, item }]
categoryKeys.forEach(cat => {
    if (NO_CROSSLINK.has(cat)) return;
    (wikiData[cat].items || []).forEach((item, idx) => {
        if (!item.name || item.header) return;
        const k = placeKey(item.name);
        if (!placeIndex.has(k)) placeIndex.set(k, []);
        placeIndex.get(k).push({ cat, idx, item });
    });
});
// Practical details for an entry, pooled across every list the place is on
// (the bar list knows Burger Boy is 24/7, the dining list knows its menu)
export function practical(cat, item) {
    const out = {};
    const keys = [...FEATURES.map(f => f.key), 'hours'];
    const sources = NO_CROSSLINK.has(cat) ? [{ item }] : (placeIndex.get(placeKey(item.name)) || [{ item }]);
    for (const { item: it } of [{ item }, ...sources]) for (const k of keys) if (it[k] && out[k] === undefined) out[k] = it[k];
    return out;
}

// The other lists this entry also appears on: [{ cat, idx }]
export function alsoIn(cat, name) {
    if (NO_CROSSLINK.has(cat)) return [];
    const seen = new Set([cat]);
    return (placeIndex.get(placeKey(name)) || []).filter(e => !seen.has(e.cat) && seen.add(e.cat));
}

// ---------------------------------------------------------------
// SEARCH INDEX
// ---------------------------------------------------------------
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'");

export const searchIndex = [];
categoryKeys.forEach(cat => {
    (wikiData[cat].items || []).forEach((item, idx) => {
        if (!item.name || item.header) return;
        const extra = [item.cuisine, item.location, areaOf(item.location), item.dish, item.year, item.month, item.when, item.note].filter(Boolean).join(' · ');
        searchIndex.push({
            cat, idx, item,
            n: norm(item.name),
            x: norm(extra),
            sub: item.dish || item.note || item.cuisine || item.year || item.when || item.month || ''
        });
    });
});

export function search(query, limit = 40) {
    const q = norm(query).trim();
    if (q.length < 2) return { cats: [], hits: [] };
    const words = q.split(/\s+/).filter(Boolean);

    const cats = categoryKeys.filter(k => norm(k).includes(q)).slice(0, 4);

    const hits = [];
    for (const e of searchIndex) {
        let score = 0;
        let ok = true;
        for (const w of words) {
            if (e.n.startsWith(w)) score += 10;
            else if (e.n.includes(' ' + w)) score += 7;
            else if (e.n.includes(w)) score += 5;
            else if (e.x.includes(w)) score += 2;
            else if (norm(e.cat).includes(w)) score += 1;
            else { ok = false; break; }
        }
        if (ok) hits.push({ ...e, score });
    }
    hits.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
    return { cats, hits: hits.slice(0, limit), total: hits.length };
}

export function randomEntry() {
    return searchIndex[Math.floor(Math.random() * searchIndex.length)];
}

// The month an event lands in next time: its rule's date if it has one (the
// Pegasus Parade moves between April and May with the Derby), else monthIndex
export function eventMonth(item, from = new Date()) {
    const d = item.rule && nextRuleDate(item.rule, from);
    return d ? d.getMonth() + 1 : item.monthIndex;
}
export function eventsInMonth(m) {
    return realItems("Notable Annual Events").filter(i => eventMonth(i) === m);
}

// ---------------------------------------------------------------
// DATES THAT MOVE — used by seasons and the events calendar
// ---------------------------------------------------------------
// Western (Gregorian) Easter, anonymous algorithm
export function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// The first Saturday in May
export function derbyDay(y) { const d = new Date(y, 4, 1); return addDays(d, (6 - d.getDay() + 7) % 7); }
// Thunder is the Saturday two weeks before the Derby
export const thunderDay = (y) => addDays(derbyDay(y), -14);
const dayOnly = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// nth weekday (0 = Sun) of a month (1-12); n = -1 for the last one
function nthWeekday(y, month, weekday, n) {
    if (n > 0) { const d = new Date(y, month - 1, 1); return addDays(d, (weekday - d.getDay() + 7) % 7 + 7 * (n - 1)); }
    const d = new Date(y, month, 0); return addDays(d, -((d.getDay() - weekday + 7) % 7));
}

// The day an event's `rule` lands on in year y (null if the rule is unknown)
//   derby · derby-14 · easter-1 · lent · nth-sat:6:3 · last-mon:7 · first-fri:10 · thanksgiving+1 · date:7:4
export function ruleDate(rule, y) {
    if (!rule) return null;
    let m;
    if (rule === 'derby') return derbyDay(y);
    if ((m = rule.match(/^derby-(\d+)$/))) return addDays(derbyDay(y), -m[1]);
    if ((m = rule.match(/^easter([+-]\d+)?$/))) return addDays(easter(y), +(m[1] || 0));
    if (rule === 'lent') return addDays(easter(y), -44); // the first Friday of Lent
    if ((m = rule.match(/^nth-(sun|mon|tue|wed|thu|fri|sat):(\d+):(\d+)$/))) return nthWeekday(y, +m[2], ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(m[1]), +m[3]);
    if ((m = rule.match(/^last-(sun|mon|tue|wed|thu|fri|sat):(\d+)$/))) return nthWeekday(y, +m[2], ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(m[1]), -1);
    if ((m = rule.match(/^first-(sun|mon|tue|wed|thu|fri|sat):(\d+)$/))) return nthWeekday(y, +m[2], ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(m[1]), 1);
    if (rule === 'thanksgiving+1') return addDays(nthWeekday(y, 11, 4, 4), 1);
    if ((m = rule.match(/^date:(\d+):(\d+)$/))) return new Date(y, m[1] - 1, +m[2]);
    return null;
}
// The next time a rule comes around, today included
export function nextRuleDate(rule, from = new Date()) {
    const t = ruleDate(rule, from.getFullYear());
    if (!t) return null;
    if (rule === 'lent' && dayOnly(from) >= t && dayOnly(from) < easter(from.getFullYear())) // it's on now: the next Friday
        return addDays(dayOnly(from), (5 - from.getDay() + 7) % 7);
    return dayOnly(t) >= dayOnly(from) ? t : ruleDate(rule, from.getFullYear() + 1);
}
export const shortDate = (d) => d ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
const between = (d, a, b) => dayOnly(d) >= dayOnly(a) && dayOnly(d) <= dayOnly(b);

// ---------------------------------------------------------------
// GATHERED LISTS  (#/p/<id>) — built from entries across the wiki.
//   grid: shown as a card in the Every List grid
//   season(date): only offered on the home page while it returns true
// ---------------------------------------------------------------
// Every name a gathered list asks for by hand, so tools/validate.mjs can flag typos and renames
export const NAMED_REFS = [];
const named = (...names) => { NAMED_REFS.push(...names); const s = new Set(names.map(placeKey)); return (item) => s.has(placeKey(item.name)); };

export const PRESETS = {
    free: {
        title: "Free Louisville",
        emoji: "🆓",
        desc: "Everything on the wiki that costs nothing to get into. Parks, libraries, legends, sunsets and a summer of parish picnics.",
        test: (item) => item.free,
        grid: true,
    },
    derby: {
        title: "Derby Season",
        emoji: "🏇",
        desc: "Thunder to the Twin Spires: the two weeks when the whole city wears a hat. Fireworks, balloons, parades, Hot Browns and what Oaks Day means.",
        test: named("Thunder Over Louisville", "Great Balloon Race", "Kentucky Derby Festival Marathon & miniMarathon", "Pegasus Parade", "Steamboat Race",
            "Kentucky Derby & Kentucky Oaks", "Churchill Downs", "Kentucky Derby Museum", "Waterfront Park", "Big Four Station Park", "Big Four Bridge at Sunset",
            "Hot Brown", "Mint Julep", "That Chocolate-Walnut Pie", "Thunder", "Oaks Day", "Gallopalooza Horses", "Brown Hotel Lobby Bar & Grill"),
        season: (d) => between(d, addDays(thunderDay(d.getFullYear()), -10), derbyDay(d.getFullYear())),
    },
    lent: {
        title: "Fish Fry Fridays",
        emoji: "🐟",
        desc: "From Ash Wednesday to Easter, parish halls all over town fry cod on Fridays. Here's where, plus the year-round fish legends.",
        test: (item, cat) => (cat === "Church Picnics & Fish Fries" && /fish|frynder/i.test(item.name)) || /^Lenten Fish Fry/.test(item.name)
            || named("Mike Linnig's", "Suburban Social Club Fish Fry", "Hungry Pelican", "The Fishery", "Moby Dick")(item),
        season: (d) => between(d, addDays(easter(d.getFullYear()), -46), easter(d.getFullYear())),
    },
    picnics: {
        title: "Picnic Season",
        emoji: "🎡",
        desc: "Parish picnics run nearly every summer weekend: rides, bingo, beer booths and a good cause. Check the parish for this year's dates.",
        test: (item, cat) => (cat === "Church Picnics & Fish Fries" && /picnic/i.test(item.name)) || /picnic/i.test(item.name) && cat === "Notable Annual Events",
        season: (d) => between(d, new Date(d.getFullYear(), 4, 15), new Date(d.getFullYear(), 8, 20)),
    },
    spooky: {
        title: "Spooky Louisville",
        emoji: "🎃",
        desc: "October in a city of cursed trees, goat-men and the most haunted hospital in America. Jack-o'-lanterns, ghosts and where the bodies are.",
        test: named("The Witches' Tree", "Pope Lick Trestle", "Waverly Hills Sanatorium", "Eastern Cemetery", "Cave Hill Cemetery", "Cave Hill's Famous Graves",
            "Jack O'Lantern Spectacular", "Caufield's Vampire Bat", "Caufield's Novelty", "Hunter S. Thompson's Boyhood Home"),
        season: (d) => d.getMonth() === 9 || (d.getMonth() === 10 && d.getDate() <= 2),
    },
    winter: {
        title: "Lights & Snow Days",
        emoji: "❄️",
        desc: "Holiday lights, house tours, Christmas cookies and, if we get the 2 to 3 inches, the hills worth dragging a sled to.",
        test: (item, cat) => named("Light Up Louisville", "Lights Under Louisville", "Fete de Noel", "Old Louisville Holiday Home Tour", "Plehns Bakery", "Plehn's Bakery")(item)
            || (cat === "Weird & Wonderful" && /Dog Hill|Creason|Rogers Clark|McNeely|Vettiner/.test(item.name)),
        season: (d) => (d.getMonth() === 10 && d.getDate() >= 20) || d.getMonth() === 11 || d.getMonth() <= 1,
    },
};

// One gathered list per neighborhood: "everything in Germantown"
AREAS.filter(a => a !== 'Multiple Locations').forEach(a => {
    PRESETS['hood-' + slugify(a)] = {
        title: `Everything in ${a}`,
        emoji: "📍",
        desc: `Every spot on the wiki filed under ${a}: restaurants, bars, parks, shops and oddities.`,
        test: (item) => hoodOf(item) === a,
        hood: a,
    };
});

// [{ header, cat, entries: [{ cat, idx, item }] }], one section per category
// A place on several lists shows up once, under the first list it's on (pinned lists first).
export function presetSections(id) {
    const p = PRESETS[id];
    if (!p) return [];
    const seen = new Set();
    return orderedKeys
        .map(cat => ({ header: cat, cat, entries: (wikiData[cat].items || []).map((item, idx) => ({ cat, idx, item }))
            .filter(e => e.item.name && !e.item.header && p.test(e.item, cat))
            .filter(e => { const k = NO_CROSSLINK.has(cat) ? cat + '::' + e.item.name : placeKey(e.item.name); return !seen.has(k) && seen.add(k); }) }))
        .filter(s => s.entries.length);
}

export const presetCount = (id) => presetSections(id).reduce((n, s) => n + s.entries.length, 0);

// Seasonal lists that are switched on today
export const activeSeasons = (d = new Date()) => Object.keys(PRESETS).filter(id => PRESETS[id].season?.(d) && presetCount(id));
// Neighborhood lists with at least `min` entries, biggest first
export const hoodPresets = (min = 3) => Object.keys(PRESETS).filter(id => PRESETS[id].hood && presetCount(id) >= min)
    .sort((a, b) => presetCount(b) - presetCount(a));
