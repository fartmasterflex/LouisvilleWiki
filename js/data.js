// --- js/data.js ---
// Derived data on top of library_data.js: slugs, emoji, search index.
import { wikiData } from '../library_data.js';
import { slugify } from './utils.js';

export { wikiData };

// The four that lead the home page, in their own bigger cards
export const PINNED = ["Dining Directory", "Oldest Restaurants", "Oldest Landmarks", "Louisville History Timeline"];
// Shown as its own button in the "happening" strip instead of a card
export const ANNUAL_EVENTS = "Notable Annual Events";
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

// Presentation only — content lives in library_data.js
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
export const NO_MAP = new Set(["Dining Directory", "Louisville History Timeline", "Notable Annual Events", "Louisville Media", "Neighborhoods", "Eats & Lingo", "Lost Louisville"]);

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

// Normalize the messy "location" strings for area filtering
export function areaOf(loc) {
    if (!loc) return '';
    let a = loc.trim().replace(/\s*\(.*\)\s*$/, '');
    if (/^west end/i.test(a)) a = 'West End';
    if (/^frankfort ave/i.test(a)) a = 'Frankfort Ave';
    return a;
}

// ---------------------------------------------------------------
// SEARCH INDEX
// ---------------------------------------------------------------
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'");

export const searchIndex = [];
categoryKeys.forEach(cat => {
    (wikiData[cat].items || []).forEach((item, idx) => {
        if (!item.name || item.header) return;
        const extra = [item.cuisine, item.location, item.dish, item.year, item.month, item.note].filter(Boolean).join(' · ');
        searchIndex.push({
            cat, idx, item,
            n: norm(item.name),
            x: norm(extra),
            sub: item.dish || item.note || item.cuisine || item.year || item.month || ''
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

export function eventsInMonth(m) {
    return realItems("Notable Annual Events").filter(i => i.monthIndex === m);
}

// ---------------------------------------------------------------
// GATHERED LISTS  (#/p/<id>) — built from entries across the wiki, shown as
// cards in the Every List grid. "free" collects every entry tagged free: true.
// ---------------------------------------------------------------
export const PRESETS = {
    free: {
        title: "Free Louisville",
        emoji: "🆓",
        desc: "Everything on the wiki that costs nothing to get into. Parks, libraries, legends, sunsets and a summer of parish picnics.",
        test: (item) => item.free,
    },
};

// [{ header, cat, entries: [{ cat, idx, item }] }], one section per category
export function presetSections(id) {
    const p = PRESETS[id];
    if (!p) return [];
    return categoryKeys
        .map(cat => ({ header: cat, cat, entries: (wikiData[cat].items || []).map((item, idx) => ({ cat, idx, item })).filter(e => e.item.name && !e.item.header && p.test(e.item)) }))
        .filter(s => s.entries.length);
}

export const presetCount = (id) => presetSections(id).reduce((n, s) => n + s.entries.length, 0);
