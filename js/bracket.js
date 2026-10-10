// --- js/bracket.js ---
import { wikiData } from './data.js';
import { state } from './state.js';
import { openModal, closeModal, toast, shuffle, escapeHtml as esc, loadScript } from './utils.js';
import { sfx } from './audio.js';
import { celebrate } from './easter_eggs.js';

const EXCLUDED = ['Clubs & Activities', 'Louisville Media', 'Local Business', 'Louisville History Timeline', 'Golf & Disc Golf', 'Eats & Lingo'];

export function openBracketSetup() {
    const select = document.getElementById('bracketCategoryDropdown');
    const prev = state.currentBracketCategory;
    select.innerHTML = '';
    Object.keys(wikiData).forEach(key => {
        if (EXCLUDED.includes(key)) return;
        const valid = wikiData[key].items.filter(i => i.name && !i.header);
        if (valid.length >= 16) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${key} (${valid.length})`;
            select.appendChild(opt);
        }
    });
    if (prev && [...select.options].some(o => o.value === prev)) select.value = prev;
    else if (state.currentCategory && [...select.options].some(o => o.value === state.currentCategory)) select.value = state.currentCategory;
    changeBracketCategory();
    openModal('selectorModal');
}

export function changeBracketCategory() {
    state.currentBracketCategory = document.getElementById('bracketCategoryDropdown').value;
    state.selectedRestaurants = [];
    document.getElementById('selectorFilter').value = '';
    renderSelectorList();
}

function validNames() {
    return wikiData[state.currentBracketCategory].items.filter(i => i.name && !i.header).map(i => i.name).sort((a, b) => a.localeCompare(b));
}

function renderSelectorList() {
    const list = document.getElementById('selectorList');
    const counter = document.getElementById('selectorCounter');
    const q = document.getElementById('selectorFilter').value.trim().toLowerCase();
    const n = state.selectedRestaurants.length;
    counter.textContent = `${n}/16`;
    counter.classList.toggle('full', n === 16);
    document.getElementById('makeBracketArea').hidden = n !== 16;

    list.innerHTML = '';
    validNames().filter(name => !q || name.toLowerCase().includes(q)).forEach(name => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'select-item' + (state.selectedRestaurants.includes(name) ? ' selected' : '');
        b.textContent = name;
        b.onclick = () => toggleSelection(name);
        list.appendChild(b);
    });
}

function toggleSelection(name) {
    if (state.selectedRestaurants.includes(name)) {
        state.selectedRestaurants = state.selectedRestaurants.filter(n => n !== name);
    } else if (state.selectedRestaurants.length < 16) {
        state.selectedRestaurants.push(name);
        sfx.tick();
    } else {
        toast('Sweet 16 means sixteen. Drop one first.', { emoji: '✋', duration: 2200 });
        return;
    }
    renderSelectorList();
}

function randomSixteen() {
    state.selectedRestaurants = shuffle(validNames()).slice(0, 16);
    sfx.pop();
    renderSelectorList();
}

export function generateBracket() {
    closeModal('selectorModal');
    state.selectedRestaurants = shuffle(state.selectedRestaurants);
    state.bracketState = {};
    document.getElementById('shareControls').hidden = true;
    document.getElementById('bracketTitleDisplay').textContent = `${state.currentBracketCategory} · Sweet 16`;
    renderBracketView();
    setTimeout(() => openModal('bracketModal'), 200);
}

// clearing downstream picks when an earlier result changes
const FEEDS = {
    'r1-m0': 'r2-m0', 'r1-m1': 'r2-m0', 'r1-m2': 'r2-m1', 'r1-m3': 'r2-m1',
    'r1-m4': 'r2-m2', 'r1-m5': 'r2-m2', 'r1-m6': 'r2-m3', 'r1-m7': 'r2-m3',
    'r2-m0': 'r3-m0', 'r2-m1': 'r3-m0', 'r2-m2': 'r3-m1', 'r2-m3': 'r3-m1',
    'r3-m0': 'final', 'r3-m1': 'final',
};

export function advanceName(matchId, name) {
    const prev = state.bracketState[matchId];
    state.bracketState[matchId] = name;
    if (prev && prev !== name) {
        let next = FEEDS[matchId];
        while (next) {
            if (state.bracketState[next] === prev) delete state.bracketState[next];
            next = FEEDS[next];
        }
        if (state.bracketState.champion === prev) delete state.bracketState.champion;
    }
    sfx.click();
    let crowned = false;
    if (matchId === 'final') {
        crowned = state.bracketState.champion !== name;
        state.bracketState.champion = name;
        document.getElementById('shareControls').hidden = false;
    }
    renderBracketView();
    if (crowned) {
        const box = document.querySelector('.champ-box');
        box?.classList.add('crowned');
        sfx.ding();
        celebrate({ origin: 'center', count: 220 });
    }
}

function card(id, prev1, prev2, init1 = null, init2 = null) {
    const n1 = init1 || state.bracketState[prev1] || null;
    const n2 = init2 || state.bracketState[prev2] || null;
    const winner = id === 'final' ? state.bracketState.champion : state.bracketState[id];
    const team = (n) => {
        if (!n) return `<div class="b-team empty">---</div>`;
        const cls = winner ? (winner === n ? 'winner' : 'loser') : '';
        return `<div class="b-team ${cls}" data-match="${id}" data-name="${esc(n)}" title="${esc(n)}">${esc(n)}</div>`;
    };
    return `<div class="matchup">${team(n1)}${team(n2)}</div>`;
}

function renderBracketView() {
    const s = state.selectedRestaurants;
    let html = '<div class="bracket-col">';
    for (let i = 0; i < 4; i++) html += card(`r1-m${i}`, null, null, s[i * 2], s[i * 2 + 1]);
    html += '</div><div class="bracket-col">';
    for (let i = 0; i < 2; i++) html += card(`r2-m${i}`, `r1-m${i * 2}`, `r1-m${i * 2 + 1}`);
    html += '</div><div class="bracket-col center">';
    html += card('r3-m0', 'r2-m0', 'r2-m1');
    html += '<div class="finals-wrapper">';
    html += card('final', 'r3-m0', 'r3-m1');
    html += `<div class="champ-box">🏆 CHAMPION<br><span>${esc(state.bracketState.champion || '???')}</span></div></div>`;
    html += card('r3-m1', 'r2-m2', 'r2-m3');
    html += '</div><div class="bracket-col">';
    for (let i = 2; i < 4; i++) html += card(`r2-m${i}`, `r1-m${i * 2}`, `r1-m${i * 2 + 1}`);
    html += '</div><div class="bracket-col">';
    for (let i = 4; i < 8; i++) html += card(`r1-m${i}`, null, null, s[i * 2], s[i * 2 + 1]);
    html += '</div>';
    document.getElementById('bracketView').innerHTML = html;
}

export async function downloadBracket() {
    const btn = document.getElementById('downloadBracketBtn');
    btn.disabled = true;
    btn.textContent = 'Printing…';
    try {
        if (!window.html2canvas) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        const canvas = await window.html2canvas(document.getElementById('bracketCaptureArea'), { backgroundColor: '#1b1b1b', scale: 2 });
        const link = document.createElement('a');
        link.download = 'louisville-bracket.png';
        link.href = canvas.toDataURL();
        link.click();
    } catch (e) {
        toast('Couldn’t save the image (offline?). Screenshot it instead!', { emoji: '📸' });
    }
    btn.disabled = false;
    btn.textContent = 'Save Bracket Image';
}

export function initBracket() {
    document.getElementById('bracketCategoryDropdown').addEventListener('change', changeBracketCategory);
    document.getElementById('selectorFilter').addEventListener('input', renderSelectorList);
    document.getElementById('randomSixteenBtn').addEventListener('click', randomSixteen);
    document.getElementById('clearSixteenBtn').addEventListener('click', () => { state.selectedRestaurants = []; renderSelectorList(); });
    document.getElementById('generateBracketBtn').addEventListener('click', generateBracket);
    document.getElementById('downloadBracketBtn').addEventListener('click', downloadBracket);
    document.getElementById('bracketView').addEventListener('click', (e) => {
        const t = e.target.closest('.b-team[data-match]');
        if (t) advanceName(t.dataset.match, t.dataset.name);
    });
}

// Map globally for legacy inline events
Object.assign(window, { openBracketSetup, changeBracketCategory, generateBracket, advanceName, downloadBracket });
