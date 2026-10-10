// --- js/crawl.js ---
import { openModal, shuffle, rand } from './utils.js';
import { initCrawlMap, geocodeLocation } from './map.js';
import { sfx } from './audio.js';

const diveNeighborhoods = {
    "Germantown / Schnitzelburg": ["Nachbar", "Seidenfaden's", "The Merryweather", "The Pearl"],
    "Highlands": ["Bambi Bar", "The Outlook Inn", "Hideaway Saloon", "Left Field Lounge", "Kern's Korner", "Barret Bar"],
    "Clifton / Crescent Hill": ["Mellwood Tavern", "Frankfort Ave Beer Depot", "Dive Bar on Frankfort"],
    "Old Louisville / Downtown": ["Mag Bar", "Granville Pub", "Third Street Dive"]
};

let run = 0;

export function openCrawlGenerator() {
    generateCrawl();
    openModal('crawlModal');
}

export function generateCrawl() {
    const my = ++run;
    const hoods = Object.keys(diveNeighborhoods);
    const hoodEl = document.getElementById('crawlNeighborhood');
    const barEls = document.getElementById('crawlBars').children;
    const finalHood = rand(hoods);
    const bars = shuffle(diveNeighborhoods[finalHood]);
    const picked = [0, 1, 2].map(i => bars[i] || "Waffle House");

    // slot-machine the neighborhood name
    hoodEl.classList.add('shuffling');
    let ticks = 0;
    const iv = setInterval(() => {
        if (my !== run) return clearInterval(iv);
        hoodEl.textContent = rand(hoods);
        sfx.tick();
        if (++ticks > 9) {
            clearInterval(iv);
            hoodEl.textContent = finalHood;
            hoodEl.classList.remove('shuffling');
            show(picked);
            route(my, picked);
        }
    }, 55);
    for (let i = 0; i < 3; i++) barEls[i].textContent = '···';
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

// Order bars west→east so the route doesn't zigzag
async function route(my, picked) {
    try {
        const coords = await Promise.all(picked.map(n => geocodeLocation(n)));
        if (my !== run) return;
        const withC = picked.map((name, i) => ({ name, c: coords[i] })).filter(b => b.c);
        if (withC.length === 3) {
            withC.sort((a, b) => a.c.lng - b.c.lng);
            show(withC.map(b => b.name));
            initCrawlMap(withC.map(b => b.name));
        } else {
            initCrawlMap(picked);
        }
    } catch (e) {
        initCrawlMap(picked);
    }
}

window.openCrawlGenerator = openCrawlGenerator;
window.generateCrawl = generateCrawl;
