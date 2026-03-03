// --- js/crawl.js ---
import { openModal } from './utils.js';
import { initCrawlMap } from './map.js'; // Will be defined in next steps

const diveNeighborhoods = {
    "Germantown / Schnitzelburg": ["Nachbar", "Seidenfaden's", "The Merryweather", "Hauck's Corner", "Four Pegs"],
    "Highlands": ["Bambi Bar", "The Outlook Inn", "Hideaway Saloon", "Left Field Lounge", "Kern's Korner", "Barret Bar"],
    "Clifton / Crescent Hill": ["Mellwood Tavern", "Frankfort Ave Beer Depot", "Spring Street Bar", "High Horse"],
    "Old Louisville / Downtown": ["Mag Bar", "Granville Pub", "Third Street Dive", "Air Devils Inn"]
};

export function openCrawlGenerator() {
    generateCrawl();
    openModal('crawlModal');
}

export function generateCrawl() {
    const hoods = Object.keys(diveNeighborhoods);
    const randomHood = hoods[Math.floor(Math.random() * hoods.length)];
    const bars = [...diveNeighborhoods[randomHood]].sort(() => 0.5 - Math.random());

    document.getElementById('crawlNeighborhood').innerText = randomHood;
    const barSpans = document.getElementById('crawlBars').children;
    for (let i = 0; i < 3; i++) {
        barSpans[i].innerText = `${i + 1}. ${bars[i] || "Waffle House"}`; // fallback if short
    }

    // Defer triggering the map until the browser has rendered the modal
    setTimeout(() => {
        initCrawlMap(bars.slice(0, 3));
    }, 100);
}

window.openCrawlGenerator = openCrawlGenerator;
window.generateCrawl = generateCrawl;
