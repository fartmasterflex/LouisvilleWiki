// --- js/slot.js ---
import { wikiData } from './data.js';
import { state } from './state.js';
import { openModal, onModalClose, rand, gSearch, escapeHtml as esc } from './utils.js';
import { sfx } from './audio.js';

// Curated activities — things reliably available on any given night out
const curatedActivities = [
    "Walk the Big Four Bridge",
    "Explore NuLu",
    "Stroll through Old Louisville",
    "Visit the Waterfront Park",
    "Tour Whiskey Row",
    "Check out the 21c Museum Hotel art",
    "Bowl at Vernon Lanes",
    "Catch a live set at Zanzabar",
    "Swing at Topgolf",
    "Ride the Belle of Louisville (seasonal)",
    "Walk through Cave Hill Cemetery at dusk",
    "Explore Paristown Pointe murals",
    "Axe throwing at Flying Axes",
    "Trivia night at a local bar",
    "Escape room downtown",
    "Walk St. James Court",
];

const names = (key) => (wikiData[key]?.items || []).filter(i => i.name && !i.header).map(i => i.name);

function pools() {
    return [
        [...curatedActivities, ...names("Attractions & Outings"), ...names("Active Louisville")],
        names("Dining Directory"),
        [...names("Late Night & 24/7"), ...names("Dive Bars")],
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
