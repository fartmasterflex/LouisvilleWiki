// --- js/state.js ---
// Global state

function loadTablePrefs() {
    try {
        const saved = localStorage.getItem('wikiTablePrefs');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
}

function saveTablePrefs() {
    localStorage.setItem('wikiTablePrefs', JSON.stringify({
        sort: state.tableSort,
        cols: state.visibleCols
    }));
}

const savedPrefs = loadTablePrefs();

export const state = {
    tableSort: savedPrefs?.sort || { col: 'name', asc: true },
    visibleCols: savedPrefs?.cols || { location: true, cuisine: true, dish: true },
    filters: {
        cuisine: [],
        price: []
    },
    currentCategory: '',
    
    // Bracket State
    selectedRestaurants: [],
    bracketState: {},
    currentBracketCategory: '',
    
    // Slot Machine State
    slotInterval: null,
    
    // Save helper
    savePrefs: saveTablePrefs
};
