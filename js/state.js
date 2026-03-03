// --- js/state.js ---
// Global state

export const state = {
    tableSort: { col: 'name', asc: true },
    visibleCols: { location: true, cuisine: true, dish: true },
    currentCategory: '',
    
    // Bracket State
    selectedRestaurants: [],
    bracketState: {},
    currentBracketCategory: '',
    
    // Slot Machine State
    slotInterval: null
};
