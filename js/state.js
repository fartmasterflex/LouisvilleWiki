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
