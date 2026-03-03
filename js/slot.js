import { wikiData } from '../library_data.js';
// --- js/slot.js ---
import { state } from './state.js';
import { openModal } from './utils.js';

export function openSlotMachine() {
    document.getElementById('slot1').innerText = "???";
    document.getElementById('slot2').innerText = "???";
    document.getElementById('slot3').innerText = "???";
    document.getElementById('spinBtn').innerText = "Pull Lever";
    openModal('slotModal');
}

export function spinSlots() {
    clearInterval(state.slotInterval);
    document.getElementById('spinBtn').innerText = "Spinning...";

    // Gather data pools
    const activities = [
        ...wikiData["Attractions & Outings"].items,
        ...wikiData["Active Louisville"].items,
        ...wikiData["Clubs & Activities"].items
    ].filter(i => !i.header).map(i => i.name);

    const dinners = wikiData["Dining Directory"].items.map(i => i.name);

    const lateNights = [
        ...wikiData["Late Night & 24/7"].items,
        ...wikiData["Dive Bars"].items
    ].filter(i => !i.header).map(i => i.name);

    let ticks = 0;
    const s1 = document.getElementById('slot1');
    const s2 = document.getElementById('slot2');
    const s3 = document.getElementById('slot3');

    state.slotInterval = setInterval(() => {
        ticks++;
        if (ticks < 15) s1.innerText = activities[Math.floor(Math.random() * activities.length)];
        if (ticks < 25) s2.innerText = dinners[Math.floor(Math.random() * dinners.length)];
        if (ticks < 35) s3.innerText = lateNights[Math.floor(Math.random() * lateNights.length)];

        if (ticks >= 35) {
            clearInterval(state.slotInterval);
            document.getElementById('spinBtn').innerText = "Spin Again";
        }
    }, 60);
}

window.openSlotMachine = openSlotMachine;
window.spinSlots = spinSlots;

