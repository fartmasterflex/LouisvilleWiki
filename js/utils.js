// --- js/utils.js ---

export function gSearch(name) { return `https://www.google.com/search?q=${encodeURIComponent(name + ' Louisville')}`; }
export function gLucky(name) { return `https://www.google.com/search?q=${encodeURIComponent(name + ' Louisville')}&btnI=1`; }

// MODAL FUNCTIONS
export function openModal(id) { document.getElementById(id).style.display = 'flex'; }
export function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// Export to attach to window for inline onclicks
window.closeModal = closeModal;
