// --- js/state.js ---
// Global state
import { store } from './utils.js';

const savedPrefs = store.get('wikiTablePrefs');

export const state = {
    tableSort: savedPrefs?.sort || { col: 'name', asc: true },
    visibleCols: savedPrefs?.cols || { location: true, cuisine: true, dish: true },
    filters: {
        cuisine: [],
        price: [],
        area: [],
        text: ''
    },
    currentCategory: '',

    // Bracket State
    selectedRestaurants: [],
    bracketState: {},
    currentBracketCategory: '',

    // Slot Machine State
    slotInterval: null,

    // Fun state
    neonOn: false,
    soundOn: store.get('wikiSound', true),

    // Save helper
    savePrefs() {
        store.set('wikiTablePrefs', { sort: state.tableSort, cols: state.visibleCols });
    }
};

// "Been there" stamps: { "Category::Name": 1 }
const BEEN_KEY = 'louBeen';
let been = store.get(BEEN_KEY, {}) || {};

// Stamps saved under lists that were merged (2026-10-10) move to their new home
const MERGED = {
    'Bars': 'Bars & Late Night', 'Late Night & 24/7': 'Bars & Late Night',
    'Thrift, Vintage & Digging': 'Shops & Digging', 'Local Business': 'Shops & Digging',
    'Bookstores': 'Books & Libraries', 'Libraries': 'Books & Libraries',
    'Theatre / The Stage': 'Stage & Screen', 'Cinema & Drive-Ins': 'Stage & Screen',
    'Grocery': 'Groceries & Markets', 'Farmers Markets': 'Groceries & Markets',
    'Golf & Disc Golf': 'Active Louisville', 'Bike Shops': 'Active Louisville',
};
// Local Business entries that landed somewhere else (or were duplicates of a longer name)
const MOVED = {
    'Local Business::Louisville Nature Center': 'Parks::Louisville Nature Center',
    'Local Business::Idlewild Butterfly Farm': 'Attractions & Outings::Idlewild Butterfly Farm',
    'Local Business::Logan Street Market': 'Groceries & Markets::Logan Street Market',
    'Local Business::Fat Rabbit Thrift': 'Shops & Digging::Fat Rabbit Thrift & Vintage',
    'Local Business::Fleur de Flea': 'Shops & Digging::Fleur de Flea Vintage Urban Market',
    'Local Business::LVL1 Hackerspace': 'Clubs & Activities::LVL1 Hackerspace',
    'Local Business::Waverly Hills Sanatorium': 'Clubs & Activities::Waverly Hills Sanatorium',
};
{
    let changed = false;
    for (const k of Object.keys(been)) {
        const [cat, ...rest] = k.split('::');
        const to = MOVED[k] || (MERGED[cat] && `${MERGED[cat]}::${rest.join('::')}`);
        if (!to) continue;
        been[to] = 1;
        delete been[k];
        changed = true;
    }
    if (changed) store.set(BEEN_KEY, been);
}

export const beenKey = (cat, name) => `${cat}::${name}`;
export const isBeen = (cat, name) => !!been[beenKey(cat, name)];

export function toggleBeen(cat, name) {
    const k = beenKey(cat, name);
    if (been[k]) delete been[k];
    else been[k] = 1;
    store.set(BEEN_KEY, been);
    return !!been[k];
}

export function beenCount(cat, items) {
    return items.reduce((n, i) => n + (i.name && !i.header && been[beenKey(cat, i.name)] ? 1 : 0), 0);
}
