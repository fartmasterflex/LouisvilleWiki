// --- js/data.js ---
// Derived data on top of library_data.js: slugs, emoji, search index.
import { wikiData } from '../library_data.js';
import { slugify } from './utils.js';

export { wikiData };

export const PINNED = ["Dining Directory", "Oldest Restaurants", "Oldest Landmarks", "Louisville History Timeline"];
// Shown as its own button in the "happening" strip instead of a card
export const ANNUAL_EVENTS = "Notable Annual Events";

// Presentation only — content lives in library_data.js
const EMOJI = {
    "Dining Directory": "🍽️",
    "Oldest Restaurants": "🥘",
    "Oldest Landmarks": "🏛️",
    "Late Night & 24/7": "🌙",
    "Museums & Galleries": "🖼️",
    "Attractions & Outings": "🎡",
    "Thrift, Vintage & Digging": "🧥",
    "Active Louisville": "🚴",
    "Clubs & Activities": "🎳",
    "Parks": "🌳",
    "Grocery": "🥕",
    "Music Venues": "🎸",
    "Theatre / The Stage": "🎭",
    "Golf & Disc Golf": "⛳",
    "Notable Annual Events": "📅",
    "Bars": "🍺",
    "Breweries & Distilleries": "🥃",
    "Coffee": "☕",
    "Sports": "🏟️",
    "Education": "🎓",
    "Libraries": "📚",
    "Louisville Media": "📰",
    "Local Business": "🛍️",
    "Bike Shops": "🚲",
    "Bookstores": "📖",
    "Cinema & Drive-Ins": "🎬",
    "Day Trips": "🚗",
    "Farmers Markets": "🧺",
    "Neighborhoods": "🏘️",
    "Louisville History Timeline": "⏳"
};

// Categories without a sensible map view
export const NO_MAP = new Set(["Dining Directory", "Louisville History Timeline", "Notable Annual Events", "Louisville Media", "Neighborhoods"]);

export const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "Year-Round"];

export const categoryKeys = Object.keys(wikiData);

// Home ordering: pinned first, then alphabetical
export const orderedKeys = [...PINNED.filter(k => wikiData[k]), ...categoryKeys.filter(k => !PINNED.includes(k)).sort((a, b) => a.localeCompare(b))];

const slugToKey = {};
const keyToSlug = {};
categoryKeys.forEach(k => { const s = slugify(k); slugToKey[s] = k; keyToSlug[k] = s; });
// old links from before a category was renamed
const RENAMED = { 'dive-bars': 'Bars' };
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
