import { wikiData } from '../library_data.js';
// --- js/bracket.js ---
import { state } from './state.js';
import { openModal, closeModal } from './utils.js';

export function openBracketSetup() {
    const select = document.getElementById('bracketCategoryDropdown');
    const excluded = ['Clubs & Activities', 'Louisville Media', 'Local Business', 'Louisville History Timeline'];
    select.innerHTML = '';
    Object.keys(wikiData).forEach(key => {
        if (excluded.includes(key)) return;
        const validItems = wikiData[key].items.filter(i => !i.header);
        if (validItems.length >= 16) {
            const opt = document.createElement('option');
            opt.value = key; opt.innerText = key;
            select.appendChild(opt);
        }
    });
    changeBracketCategory();
    openModal('selectorModal');
}

export function changeBracketCategory() {
    state.currentBracketCategory = document.getElementById('bracketCategoryDropdown').value;
    state.selectedRestaurants = [];
    renderSelectorList();
}

function renderSelectorList() {
    const list = document.getElementById('selectorList');
    const counter = document.getElementById('selectorCounter');
    const bracketBtn = document.getElementById('makeBracketArea');

    const validItems = wikiData[state.currentBracketCategory].items.filter(i => !i.header);
    const sorted = validItems.sort((a, b) => a.name.localeCompare(b.name));

    list.innerHTML = '';
    counter.innerText = `${state.selectedRestaurants.length}/16`;
    bracketBtn.style.display = (state.selectedRestaurants.length === 16) ? 'block' : 'none';

    sorted.forEach(item => {
        const div = document.createElement('div');
        div.className = 'select-item';
        if (state.selectedRestaurants.includes(item.name)) div.classList.add('selected');
        div.innerText = item.name;
        div.onclick = () => { toggleSelection(item.name); };
        list.appendChild(div);
    });
}

function toggleSelection(name) {
    if (state.selectedRestaurants.includes(name)) {
        state.selectedRestaurants = state.selectedRestaurants.filter(n => n !== name);
    } else {
        if (state.selectedRestaurants.length < 16) { state.selectedRestaurants.push(name); }
        else { alert("You can only choose 16!"); return; }
    }
    renderSelectorList();
}

export function generateBracket() {
    closeModal('selectorModal');
    state.selectedRestaurants.sort(() => Math.random() - 0.5);
    state.bracketState = {};
    document.getElementById('shareControls').style.display = 'none';
    document.getElementById('bracketTitleDisplay').innerText = `${state.currentBracketCategory} SWEET 16`;
    renderBracketView();
    openModal('bracketModal');
}

export function advanceName(matchId, name) {
    state.bracketState[matchId] = name;
    if (matchId === 'final') {
        state.bracketState['champion'] = name;
        document.getElementById('shareControls').style.display = 'block';
    }
    renderBracketView();
}

function createMatchCardPlaceholder(id, prevId1, prevId2, initialName1 = null, initialName2 = null) {
    const name1 = initialName1 || state.bracketState[prevId1] || "---";
    const name2 = initialName2 || state.bracketState[prevId2] || "---";
    let winner = (id === 'final') ? state.bracketState['champion'] : state.bracketState[id];

    const click1 = name1 !== "---" ? `onclick="advanceName('${id}', '${name1.replace(/'/g, "\\'")}')"` : "";
    const click2 = name2 !== "---" ? `onclick="advanceName('${id}', '${name2.replace(/'/g, "\\'")}')"` : "";

    return `
    <div class="matchup">
        <div class="b-team ${winner === name1 && name1 !== "---" ? 'winner' : ''}" ${click1}>${name1}</div>
        <div class="b-team ${winner === name2 && name2 !== "---" ? 'winner' : ''}" ${click2}>${name2}</div>
    </div>`;
}

function renderBracketView() {
    const container = document.getElementById('bracketView');
    let html = '<div class="bracket-col">';
    for (let i = 0; i < 4; i++) html += createMatchCardPlaceholder(`r1-m${i}`, null, null, state.selectedRestaurants[i * 2], state.selectedRestaurants[i * 2 + 1]);
    html += '</div><div class="bracket-col">';
    for (let i = 0; i < 2; i++) html += createMatchCardPlaceholder(`r2-m${i}`, `r1-m${i * 2}`, `r1-m${i * 2 + 1}`);
    html += '</div><div class="bracket-col center">';
    html += createMatchCardPlaceholder('r3-m0', 'r2-m0', 'r2-m1');
    html += '<div class="finals-wrapper">';
    html += createMatchCardPlaceholder('final', 'r3-m0', 'r3-m1');
    const champ = state.bracketState['champion'] || "???";
    html += `<div class="champ-box">CHAMPION<br><span style="font-size:0.9em">${champ}</span></div></div>`;
    html += createMatchCardPlaceholder('r3-m1', 'r2-m2', 'r2-m3');
    html += '</div><div class="bracket-col">';
    for (let i = 2; i < 4; i++) html += createMatchCardPlaceholder(`r2-m${i}`, `r1-m${i * 2}`, `r1-m${i * 2 + 1}`);
    html += '</div><div class="bracket-col">';
    for (let i = 4; i < 8; i++) html += createMatchCardPlaceholder(`r1-m${i}`, null, null, state.selectedRestaurants[i * 2], state.selectedRestaurants[i * 2 + 1]);
    html += '</div>';
    container.innerHTML = html;
}

export function downloadBracket() {
    const element = document.getElementById('bracketCaptureArea');
    html2canvas(element, { backgroundColor: "#222" }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'louisville-bracket.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Map globally for inline events
window.openBracketSetup = openBracketSetup;
window.changeBracketCategory = changeBracketCategory;
window.generateBracket = generateBracket;
window.advanceName = advanceName;
window.downloadBracket = downloadBracket;

