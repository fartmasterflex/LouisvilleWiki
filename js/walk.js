// --- js/walk.js ---
// History Walk: four stops from Oldest Landmarks + the oddities in Weird & Wonderful that you can walk
// in one go. Same idea as the bar crawl: the whole route stays under MAX_MILES.
import { openModal, rand, store, escapeHtml as esc } from './utils.js';
import { wikiData } from './data.js';
import { initCrawlMap } from './map.js';
import { sfx } from './audio.js';

// [list, sections to skip]: no sunsets or sledding hills on a history walk
const SOURCES = [['Oldest Landmarks', []], ['Weird & Wonderful', ['Golden Hour & Night Sky', 'Snow Day Sledding Hills']]];
const SKIP = new Set(['Pope Lick Trestle']);   // stay off the trestle
const STOPS = 4;
const MAX_MILES = 2;
const STREET_FACTOR = 1.25;
const SAME_SPOT = .06;                          // miles: closer than this counts as one stop
const RECENT_KEY = 'louWalkRecent';
const RECENT_MAX = 16;
const RECENT_WEIGHT = .15;

// Label a walk by whichever of these its first stop is closest to
const AREAS = [
    ['Downtown', 38.2545, -85.7575],
    ['Whiskey Row & the Waterfront', 38.2585, -85.7480],
    ['Museum Row', 38.2572, -85.7640],
    ['Broadway & Russell', 38.2445, -85.7690],
    ['Old Louisville', 38.2290, -85.7615],
    ['Belknap & UofL', 38.2160, -85.7590],
    ['NuLu & Butchertown', 38.2545, -85.7370],
    ['Phoenix Hill & Cave Hill', 38.2445, -85.7290],
    ['Cherokee Triangle', 38.2380, -85.7090],
    ['Clifton', 38.2560, -85.7150],
    ['Portland', 38.2700, -85.7900],
    ['Crescent Hill', 38.2560, -85.6900],
];

let pool = null;
let lastKey = '';
let run = 0;

function miles(a, b) {
    const R = 3958.8, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h)) * STREET_FACTOR;
}

async function buildPool() {
    if (pool) return pool;
    const { manualCoords } = await import('./coordinates.js');
    const stops = [];
    for (const [cat, skipSections] of SOURCES) {
        for (const item of itemsOf(cat, skipSections)) {
            const c = manualCoords[item.name];
            if (!Array.isArray(c) || SKIP.has(item.name)) continue;
            const s = { name: item.name, year: item.year || '', note: item.note || '', lat: c[0], lng: c[1] };
            if (stops.some(o => miles(o, s) < SAME_SPOT)) continue;
            stops.push(s);
        }
    }
    pool = stops;
    return pool;
}

// A list's entries, minus whole sections (by header)
function itemsOf(cat, skipSections) {
    let skip = false;
    return (wikiData[cat]?.items || []).filter(i => {
        if (i.header) { skip = skipSections.includes(i.header); return false; }
        return !skip && i.name;
    });
}

function weighted(list, w) {
    const sum = list.reduce((s, x) => s + w(x), 0);
    let r = Math.random() * sum;
    for (const x of list) { r -= w(x); if (r <= 0) return x; }
    return list[list.length - 1];
}

// Start at an evenly-picked stop, then keep stepping to one of the nearest
// unvisited stops until there are four, retrying until the route fits the cap.
function pickWalk(stops) {
    const recent = new Set(store.get(RECENT_KEY, []) || []);
    const w = (s) => (recent.has(s.name) ? RECENT_WEIGHT : 1);
    for (let tries = 0; tries < 200; tries++) {
        const route = [weighted(stops, w)];
        let total = 0;
        while (route.length < STOPS) {
            const here = route[route.length - 1];
            const next = stops.filter(s => !route.includes(s))
                .map(s => ({ s, d: miles(here, s) }))
                .sort((a, b) => a.d - b.d)
                .slice(0, 3);
            if (!next.length) break;
            const step = weighted(next, x => w(x.s) / (x.d + .05));
            total += step.d;
            route.push(step.s);
        }
        const key = route.map(s => s.name).sort().join('|');
        if (route.length === STOPS && total <= MAX_MILES && key !== lastKey) {
            lastKey = key;
            store.set(RECENT_KEY, [...route.map(s => s.name), ...[...recent].filter(n => !route.some(s => s.name === n))].slice(0, RECENT_MAX));
            return { route, total };
        }
    }
    return null;
}

function areaOf(stop) {
    return AREAS.reduce((best, a) => {
        const d = (a[1] - stop.lat) ** 2 + (a[2] - stop.lng) ** 2;
        return d < best.d ? { name: a[0], d } : best;
    }, { name: '', d: Infinity }).name;
}

// First sentence is plenty on the ticket
const short = (note) => (note.match(/^.*?(?<!\b(?:St|Ave|Dr|Mt|Rd|Jr|Sr|Co|vs))[.!?](?=\s|$)/) || [note])[0].trim();

export function openHistoryWalk() {
    generateWalk();
    openModal('walkModal');
}

export async function generateWalk() {
    const my = ++run;
    const areaEl = document.getElementById('walkArea');
    const list = document.getElementById('walkStops');
    const foot = document.getElementById('walkFoot');
    list.innerHTML = '<li class="walk-stop">···</li>';

    let walk;
    try {
        walk = pickWalk(await buildPool());
    } catch (e) { walk = null; }
    if (my !== run) return;
    if (!walk) {
        areaEl.textContent = 'Your Couch';
        list.innerHTML = '<li class="walk-stop"><b>Read the History Timeline instead</b></li>';
        return;
    }

    // shuffle the area name like the crawl ticket
    areaEl.classList.add('shuffling');
    let ticks = 0;
    const iv = setInterval(() => {
        if (my !== run) return clearInterval(iv);
        areaEl.textContent = rand(AREAS)[0];
        sfx.tick();
        if (++ticks > 9) {
            clearInterval(iv);
            areaEl.textContent = areaOf(walk.route[0]);
            areaEl.classList.remove('shuffling');
            list.innerHTML = walk.route.map((s, i) => `
                <li class="walk-stop pop" style="animation-delay:${i * 90}ms">
                    <b>${i + 1}. ${esc(s.name)}</b>${s.year ? ` <span class="walk-year">${esc(s.year)}</span>` : ''}
                    ${s.note ? `<small>${esc(short(s.note))}</small>` : ''}
                </li>`).join('');
            if (foot) foot.textContent = `≈ ${walk.total.toFixed(1)} MI ON FOOT · READ THE PLAQUES`;
            initCrawlMap(walk.route.map(s => s.name), 'walkMap');
        }
    }, 55);
}
