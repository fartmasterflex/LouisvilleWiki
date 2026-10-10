// --- js/slot.js ---
import { wikiData } from './data.js';
import { state } from './state.js';
import { openModal, onModalClose, rand, gSearch, escapeHtml as esc } from './utils.js';
import { sfx } from './audio.js';

// Curated activities: local, mostly free, reliably there on any given night out. No chains.
const curatedActivities = [
    "Walk the Big Four Bridge",
    "Watch the Big Four light show from the Great Lawn",
    "Explore NuLu",
    "Stroll through Old Louisville",
    "Find the Witches' Tree at 6th & Park",
    "Walk St. James Court",
    "Tour Whiskey Row",
    "Check out the 21c Museum Hotel art",
    "Bowl at Vernon Lanes",
    "Catch a live set at Zanzabar",
    "Pinball league night at Zanzabar",
    "Ride the Belle of Louisville (seasonal)",
    "Walk Cave Hill Cemetery before the gates close",
    "Catch the sunset at the Iroquois Park overlook",
    "Visit the Thinker at UofL",
    "Spot the giant vampire bat on Caufield's",
    "Free Shakespeare in Central Park (summer)",
    "Star party with the Louisville Astronomical Society",
    "Dig for records at Guestroom",
    "Browse Carmichael's Bookstore",
    "Skate (or watch) at David Armstrong Extreme Park",
    "Trivia night at a local bar",
    "Pickleball at GoodBounce",
    "Tiki drinks & mini golf at South Seas",
    "Arcade games at Recbar"
];

// Chains and corporate spots stay off the reels even when a list carries them
// (and the slot never sends anyone to the Pope Lick trestle at night)
const NOT_ON_REELS = new Set(["Topgolf", "Waffle House", "Insomnia Cookies", "Pope Lick Trestle"]);

// Names from a list, optionally skipping whole sections (by header)
function names(key, skipSections = []) {
    let skip = false;
    return (wikiData[key]?.items || []).filter(i => {
        if (i.header) { skip = skipSections.includes(i.header); return false; }
        return !skip && i.name && !NOT_ON_REELS.has(i.name);
    }).map(i => i.name);
}

function pools() {
    return [
        [...curatedActivities, ...names("Attractions & Outings"), ...names("Active Louisville", ["Ball Golf Courses", "Disc Golf Courses", "Bike Shops"]), ...names("Weird Louisville")],
        names("Dining Directory"),
        names("Bars & Late Night"),
    ];
}

let slot3d = null;
let loading3d = null;
let busy = false;

async function ensure3d() {
    if (slot3d) return slot3d;
    if (!loading3d) {
        loading3d = (async () => {
            const { hasWebGL, loadThree } = await import('./three/core.js');
            if (!hasWebGL()) throw new Error('no webgl');
            await loadThree();
            const mod = await import('./three/slot3d.js');
            const stage = document.getElementById('slotStage');
            stage.classList.add('on');
            const s = await mod.createSlot(stage, { onLever: () => spinSlots() });
            s.seed(pools());
            return s;
        })().catch(e => { console.warn('3D slot unavailable, using the classic reels.', e); document.getElementById('slotStage').classList.remove('on'); return null; });
    }
    slot3d = await loading3d;
    return slot3d;
}

export async function openSlotMachine() {
    if (!busy) {
        ['slot1', 'slot2', 'slot3'].forEach(id => { document.getElementById(id).textContent = '???'; });
        document.getElementById('spinBtn').textContent = 'Pull Lever';
    }
    openModal('slotModal');
    const s = await ensure3d();
    s?.resume();
}

onModalClose('slotModal', () => slot3d?.pause());

function showResults(results) {
    ['slot1', 'slot2', 'slot3'].forEach((id, i) => {
        document.getElementById(id).innerHTML = `<a href="${gSearch(results[i])}" target="_blank" rel="noopener">${esc(results[i])}</a>`;
    });
}

export async function spinSlots() {
    if (busy) return;
    busy = true;
    const btn = document.getElementById('spinBtn');
    btn.textContent = 'Spinning…';
    btn.disabled = true;
    const P = pools();
    const results = P.map(p => rand(p));
    const finish = () => {
        showResults(results);
        sfx.ding();
        btn.textContent = 'Spin Again';
        btn.disabled = false;
        busy = false;
    };

    const s = slot3d;
    if (s) {
        ['slot1', 'slot2', 'slot3'].forEach(id => { document.getElementById(id).textContent = '· · ·'; });
        s.spin(results, P, finish);
        return;
    }

    // classic text reels
    clearInterval(state.slotInterval);
    let ticks = 0;
    const els = ['slot1', 'slot2', 'slot3'].map(id => document.getElementById(id));
    state.slotInterval = setInterval(() => {
        ticks++;
        if (ticks < 15) els[0].textContent = rand(P[0]);
        if (ticks < 25) els[1].textContent = rand(P[1]);
        if (ticks < 35) els[2].textContent = rand(P[2]);
        if (ticks % 2) sfx.tick();
        if (ticks >= 35) {
            clearInterval(state.slotInterval);
            finish();
        }
    }, 60);
}

export function initSlot() {
    document.getElementById('spinBtn').addEventListener('click', spinSlots);
}

Object.assign(window, { openSlotMachine, spinSlots });
