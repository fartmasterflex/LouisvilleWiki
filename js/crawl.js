// --- js/crawl.js ---
// Bar Crawl: three bars from the "Bars" list that you can actually walk between.
// The whole route (bar 1 → 2 → 3) is capped at MAX_MILES of estimated walking.
import { openModal, rand, store } from './utils.js';
import { wikiData, realItems } from './data.js';
import { initCrawlMap } from './map.js';
import { sfx } from './audio.js';

const MAX_MILES = 2;
const STREET_FACTOR = 1.25;       // straight-line → street-grid walking estimate
const RECENT_KEY = 'louCrawlRecent';
const RECENT_MAX = 12;            // bars shown lately get pushed to the back of the line
const RECENT_WEIGHT = .12;

// Label a crawl by whichever of these its middle is closest to
const HOODS = [
    ['Baxter Ave / Highlands', 38.2410, -85.7245],
    ['Bardstown Rd / Highlands', 38.2350, -85.7175],
    ['Douglass Loop / Bonnycastle', 38.2245, -85.6930],
    ['Germantown / Schnitzelburg', 38.2280, -85.7380],
    ['NuLu / Butchertown', 38.2530, -85.7385],
    ['Downtown / Whiskey Row', 38.2560, -85.7530],
    ['Old Louisville', 38.2280, -85.7590],
    ['Irish Hill / Clifton', 38.2540, -85.7160],
    ['Frankfort Ave / Crescent Hill', 38.2535, -85.6950],
];

let run = 0;
let pool = null;      // { bars: [{name, lat, lng}], triples: [[i, j, k, miles, order]] }
let lastKey = '';

function miles(a, b) {
    const R = 3958.8, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h)) * STREET_FACTOR;
}

// Every trio of bars whose shortest route (skip the longest leg) fits the cap
async function buildPool() {
    if (pool) return pool;
    const { manualCoords } = await import('./coordinates.js');
    const bars = realItems('Bars')
        .map(i => ({ name: i.name, c: manualCoords[i.name] }))
        .filter(b => Array.isArray(b.c))
        .map(b => ({ name: b.name, lat: b.c[0], lng: b.c[1] }));
    const n = bars.length, d = [];
    for (let i = 0; i < n; i++) { d[i] = []; for (let j = 0; j < n; j++) d[i][j] = i === j ? 0 : miles(bars[i], bars[j]); }
    const triples = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
        const legs = [[d[i][j], k], [d[j][k], i], [d[i][k], j]];          // [leg length, the bar not on that leg]
        legs.sort((x, y) => y[0] - x[0]);
        const total = legs[1][0] + legs[2][0];
        if (total > MAX_MILES) continue;
        const mid = legs[0][1];                                             // walk around the longest leg
        const ends = [i, j, k].filter(x => x !== mid);
        triples.push({ order: [ends[0], mid, ends[1]], total });
    }
    pool = { bars, triples };
    return pool;
}

function weighted(list, w) {
    const sum = list.reduce((s, x) => s + w(x), 0);
    let r = Math.random() * sum;
    for (const x of list) { r -= w(x); if (r <= 0) return x; }
    return list[list.length - 1];
}

// Pick an anchor bar evenly (so dense strips like Baxter Ave don't hog every crawl),
// then a walkable trio around it, steering away from recently shown bars.
function pickCrawl({ bars, triples }) {
    const recent = new Set(store.get(RECENT_KEY, []) || []);
    const wBar = (i) => (recent.has(bars[i].name) ? RECENT_WEIGHT : 1);
    const anchors = [...new Set(triples.flatMap(t => t.order))];
    const anchor = weighted(anchors, wBar);
    let options = triples.filter(t => t.order.includes(anchor));
    const fresh = options.filter(t => t.order.join() !== lastKey);
    if (fresh.length) options = fresh;
    const t = weighted(options, x => x.order.reduce((p, i) => p * wBar(i), 1));
    lastKey = t.order.join();
    const shown = t.order.map(i => bars[i]);
    store.set(RECENT_KEY, [...shown.map(b => b.name), ...[...recent].filter(n => !shown.some(b => b.name === n))].slice(0, RECENT_MAX));
    // start from the western end so the map reads left to right
    if (shown[0].lng > shown[2].lng) shown.reverse();
    return { bars: shown, total: t.total };
}

function hoodOf(bars) {
    const lat = bars.reduce((s, b) => s + b.lat, 0) / bars.length;
    const lng = bars.reduce((s, b) => s + b.lng, 0) / bars.length;
    return HOODS.reduce((best, h) => {
        const dist = (h[1] - lat) ** 2 + (h[2] - lng) ** 2;
        return dist < best.d ? { name: h[0], d: dist } : best;
    }, { name: '', d: Infinity }).name;
}

export function openCrawlGenerator() {
    generateCrawl();
    openModal('crawlModal');
}

export async function generateCrawl() {
    const my = ++run;
    const hoodEl = document.getElementById('crawlNeighborhood');
    const barEls = document.getElementById('crawlBars').children;
    const foot = document.getElementById('crawlFoot');
    for (let i = 0; i < 3; i++) barEls[i].textContent = '···';

    let crawl;
    try {
        const p = await buildPool();
        if (my !== run) return;
        if (!p.triples.length || !wikiData.Bars) throw new Error('no walkable trios');
        crawl = pickCrawl(p);
    } catch (e) {
        hoodEl.textContent = 'Somewhere';
        show(['Waffle House', 'Waffle House', 'Waffle House']);
        return;
    }
    const finalHood = hoodOf(crawl.bars);
    const names = crawl.bars.map(b => b.name);

    // slot-machine the neighborhood name
    hoodEl.classList.add('shuffling');
    let ticks = 0;
    const iv = setInterval(() => {
        if (my !== run) return clearInterval(iv);
        hoodEl.textContent = rand(HOODS)[0];
        sfx.tick();
        if (++ticks > 9) {
            clearInterval(iv);
            hoodEl.textContent = finalHood;
            hoodEl.classList.remove('shuffling');
            show(names);
            if (foot) foot.textContent = `≈ ${crawl.total.toFixed(1)} MI WALK · HYDRATE`;
            initCrawlMap(names);
        }
    }, 55);
}

function show(names) {
    const barEls = document.getElementById('crawlBars').children;
    names.forEach((n, i) => {
        const el = barEls[i];
        el.textContent = `${i + 1}. ${n}`;
        el.classList.remove('pop');
        void el.offsetWidth;
        el.style.animationDelay = `${i * 90}ms`;
        el.classList.add('pop');
    });
}

window.openCrawlGenerator = openCrawlGenerator;
window.generateCrawl = generateCrawl;
