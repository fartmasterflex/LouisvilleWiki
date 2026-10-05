// --- js/bingo.js ---
import { openModal, store, shuffle, toast } from './utils.js';
import { sfx } from './audio.js';
import { celebrate } from './easter_eggs.js';

const defaultBingoItems = [
    // === FOOD & DRINK ===
    "Drink Malört at Mag Bar",
    "Eat a Hot Brown",
    "Drink a bourbon neat",
    "Wait in line at Nord's Bakery",
    "Eat a Modjeska candy from Muth's",
    "Get Spinelli's out of someone's car",
    "Try a Benedictine spread sandwich",
    "Eat fried fish from a church fish fry",
    "Double fist bourbons on Whiskey Row",
    "Eat a Derby Pie (don't say the name, it's trademarked)",
    "Drink a Mint Julep unironically",
    "Eat burgoo and pretend to like it",
    "Get Indi's Chicken at midnight",
    "Argue about who has the best pizza",
    "Eat a gas station egg roll on Preston",
    "Have brunch at a place with a 90-minute wait",
    "Drink a beer at Against the Grain",
    "Order the wrong thing at an Ethiopian restaurant",
    "Eat a banana from the Banana Lady",

    // === LANDMARKS & SIGHTINGS ===
    "See the 21c David Statue",
    "Walk the Big Four Bridge",
    "Get lost in Cave Hill Cemetery",
    "See the giant bat on Slugger Museum",
    "Take a photo at the Louisville sign",
    "Visit Waverly Hills and survive",
    "See a riverboat on the Ohio",
    "Find a hidden speakeasy",
    "Find a historic plaque you've never noticed",
    "See the Witch's Tree on 6th & Park",
    "Stand inside the Water Tower",
    "Drive past Churchill Downs on a non-race day",
    "Visit the Thomas Edison House",
    "Find the Castleman statue pedestal",
    "Walk through St. James Court",

    // === ONLY IN LOUISVILLE MOMENTS ===
    "Hear someone say 'Keep Louisville Weird'",
    "Stuck behind a train in Germantown",
    "Survive the Watterson Expressway",
    "Smell the Butchertown plant",
    "Someone mentions Jack Harlow",
    "Spot a UofL/UK divided house flag",
    "See a Heine Bros coffee cup in the wild",
    "Fleur-de-lis tattoo spotted on a stranger",
    "Avoid an electric scooter on the sidewalk",
    "Hear a heated Cards vs. Cats argument",
    "See someone walk a very unusual pet",
    "Find a couch on someone's front porch",
    "See a car with a 502 bumper sticker",
    "Spot a 'Louisville is for Lovers' sticker",
    "Pass a house with a giant skeleton year-round",
    "Witness a thunderstorm appear from nowhere",
    "Get stuck at the train tracks on Lexington Rd",
    "See a horse where there shouldn't be one",

    // === CULTURE & ACTIVITIES ===
    "Go to a basement show",
    "See live music at Zanzabar",
    "Talk about Derby in November",
    "Play Dainty in Schnitzelburg",
    "Take a shot at The Back Door",
    "Watch a roller derby bout",
    "See Shakespeare in the Park for free",
    "Take a ghost tour of Old Louisville",
    "Go to an art hop in NuLu",
    "Bowl at Vernon Lanes",
    "Kayak on Floyds Fork",
    "Attend a Forecastle or Louder Than Life",
    "Buy a record at Guestroom",
    "Read a LEO Weekly cover-to-cover",
    "Attend a First Friday Trolley Hop",
    "Pet a dog at a brewery taproom",
    "Watch the sunset from the Big Four Bridge",
    "See Thunder Over Louisville live"
];

const FREE = "FREE SPACE\n(Local Weirdo)";
const LINES = [
    [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
];

// board persists: { cells: [25 strings], stamped: [indices] }
let board = store.get('bingoBoard');
let wonLines = new Set();

export function openBingo() {
    if (!board || !Array.isArray(board.cells) || board.cells.length !== 25) newBoard();
    renderBoard();
    openModal('bingoModal');
}

function getPool() {
    return [...defaultBingoItems, ...(store.get('userBingo', []) || [])];
}

function newBoard() {
    const pool = shuffle(getPool());
    while (pool.length < 24) pool.push("Drink Bourbon");
    const cells = pool.slice(0, 24);
    cells.splice(12, 0, FREE);
    board = { cells, stamped: [12] };
    wonLines = new Set();
    store.set('bingoBoard', board);
}

export function generateBingo() {
    newBoard();
    renderBoard();
    sfx.pop();
}

function renderBoard() {
    const el = document.getElementById('bingoBoard');
    el.innerHTML = '';
    wonLines = new Set(LINES.map((l, i) => l.every(k => board.stamped.includes(k)) ? i : -1).filter(i => i >= 0));
    const inWin = new Set([...wonLines].flatMap(i => LINES[i]));
    board.cells.forEach((text, i) => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'bingo-cell' + (i === 12 ? ' free' : '') + (board.stamped.includes(i) ? ' stamped' : '') + (inWin.has(i) ? ' win-line' : '');
        cell.style.setProperty('--dab-rot', `${(i * 47) % 40 - 20}deg`);
        const span = document.createElement('span');
        span.textContent = text;
        span.style.position = 'relative';
        span.style.zIndex = '1';
        const dab = document.createElement('i');
        dab.className = 'dab';
        cell.append(dab, span);
        cell.setAttribute('aria-pressed', board.stamped.includes(i));
        if (i !== 12) cell.addEventListener('click', () => stamp(i));
        el.appendChild(cell);
    });
}

function stamp(i) {
    const k = board.stamped.indexOf(i);
    if (k > -1) board.stamped.splice(k, 1);
    else { board.stamped.push(i); sfx.stamp(); }
    store.set('bingoBoard', board);
    const before = wonLines.size;
    renderBoard();
    if (wonLines.size > before) triggerBingoWin();
}

function triggerBingoWin() {
    if (document.getElementById('bingoWinOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'bingoWinOverlay';
    overlay.className = 'egg-overlay';
    overlay.style.display = 'grid';
    overlay.style.placeItems = 'center';
    const b = document.createElement('div');
    b.style.cssText = `font:400 clamp(3rem,15vw,7rem)/1 var(--f-display);text-transform:uppercase;color:#eaff00;text-shadow:4px 4px 0 #111,8px 8px 0 #d7263d;transform:scale(0) rotate(-10deg);transition:transform .45s cubic-bezier(.175,.885,.32,1.6);letter-spacing:4px;`;
    b.textContent = 'BINGO!';
    overlay.appendChild(b);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => requestAnimationFrame(() => { b.style.transform = 'scale(1) rotate(-3deg)'; }));
    sfx.ding();
    celebrate();
    setTimeout(() => { b.style.transform = 'scale(0) rotate(10deg)'; setTimeout(() => overlay.remove(), 500); }, 2600);
}

export function addBingoItem() {
    const input = document.getElementById('customBingoInput');
    const val = input.value.trim();
    if (!val) return;
    const custom = store.get('userBingo', []) || [];
    custom.push(val);
    store.set('userBingo', custom);
    input.value = '';
    toast(`Added “${val.replace(/</g, '&lt;')}” — reshuffling your card.`, { emoji: '🃏', duration: 2200 });
    generateBingo();
}

export function resetCustomBingo() {
    if (confirm("Clear your custom bingo squares?")) {
        store.remove('userBingo');
        generateBingo();
    }
}

export function initBingo() {
    document.getElementById('addBingoBtn').addEventListener('click', addBingoItem);
    document.getElementById('customBingoInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') addBingoItem(); });
    document.getElementById('reshuffleBingoBtn').addEventListener('click', generateBingo);
    document.getElementById('clearBingoBtn').addEventListener('click', resetCustomBingo);
}

Object.assign(window, { openBingo, generateBingo, addBingoItem, resetCustomBingo });
