// --- js/main.js ---
// Main Entry Point
import { renderTOC, initTheme, toggleTheme, renderList, sortTable, toggleCol } from './ui.js';

// Import modules and expose to window for inline HTML onclick handlers
import { gSearch, gLucky, openModal, closeModal } from './utils.js';
import { openBracketSetup, changeBracketCategory, generateBracket, advanceName, downloadBracket } from './bracket.js';
import { openCrawlGenerator, generateCrawl } from './crawl.js';
import { openSlotMachine, spinSlots } from './slot.js';
import { openBingo, generateBingo, addBingoItem, resetCustomBingo } from './bingo.js';
import { openCategoryMap, initCrawlMap } from './map.js';
import { startBoatRace } from './easter_eggs.js';

Object.assign(window, {
    toggleTheme: toggleTheme,
    renderList: renderList,
    sortTable: sortTable,
    toggleCol: toggleCol,
    gSearch, gLucky, openModal, closeModal,
    openBracketSetup, changeBracketCategory, generateBracket, advanceName, downloadBracket,
    openCrawlGenerator, generateCrawl,
    openSlotMachine, spinSlots,
    openBingo, generateBingo, addBingoItem, resetCustomBingo,
    openCategoryMap, initCrawlMap,
    startBoatRace
});


// Initialization
initTheme();
renderTOC();
