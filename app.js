// --- PWA SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

function gSearch(name) { return `https://www.google.com/search?q=${encodeURIComponent(name + ' Louisville')}`; }
function gLucky(name) { return `https://www.google.com/search?q=${encodeURIComponent(name + ' Louisville')}&btnI=1`; }

// --- MAIN APP LOGIC ---
const app = document.getElementById('content-area');
let tableSort = { col: 'name', asc: true };
let visibleCols = { location: true, cuisine: true, dish: true }; 
let currentCategory = '';

function renderTOC() {
    let html = '<div class="toc">';
    
    // Pinned Top Keys
    const topKeys = ["Dining Directory", "Oldest Restaurants", "Oldest Landmarks"];
    const allKeys = Object.keys(wikiData);
    const restKeys = allKeys.filter(k => !topKeys.includes(k)).sort();
    
    for (const key of topKeys) { 
        html += `<button class="toc-btn" style="border-color: var(--highlight);" onclick="renderList('${key}')">★ ${key}</button>`; 
    }
    
    html += '<hr style="width:100%; border:1px dotted #999; margin: 5px 0;">';
    
    // The Rest
    for (const key of restKeys) { 
        html += `<button class="toc-btn" onclick="renderList('${key}')">➤ ${key}</button>`; 
    }

    // Tools Section
    html += `<div class="tools-header">Generators & Tools</div>`;
    html += `<button class="toc-btn" onclick="openBracketSetup()">🏆 Custom Bracket Maker</button>`;
    html += `<button class="toc-btn" onclick="openCrawlGenerator()">🍻 Dive Bar Crawl Generator</button>`;
    html += `<button class="toc-btn" onclick="openSlotMachine()">🎰 Perfect Night Out Slot</button>`;
    html += `<button class="toc-btn" onclick="openBingo()">🎱 Weird Louisville Bingo</button>`;

    html += '</div>';
    app.innerHTML = html;
    window.scrollTo(0,0);
}

function generateMapUrl(categoryKey) {
    const data = wikiData[categoryKey];
    if (!data) return;
    const locations =[];
    if (data.items) {
        data.items.forEach(item => { if(item.name && !item.header) locations.push(item.name) });
    }
    if (locations.length === 0) { alert("No locations to map!"); return; }
    const baseUrl = 'https://www.google.com/maps/dir/';
    const encodedLocations = locations.map(loc => encodeURIComponent(loc + ', Louisville KY')).join('/');
    window.open(baseUrl + encodedLocations, '_blank');
}

function renderList(categoryKey) {
    currentCategory = categoryKey;
    const data = wikiData[categoryKey];
    if (!data) return;
    let displayItems =[...data.items];

    let navBarHtml = `<span class="back-btn" onclick="renderTOC()">← back to index</span>`;
    if (categoryKey !== "Dining Directory") {
        navBarHtml += `<button class="btn-map" onclick="generateMapUrl('${categoryKey}')">🗺️ Map View</button>`;
    }
    
    let html = `
        <div class="view-container">
            <div class="nav-bar">${navBarHtml}</div>
            <div class="category-header">${categoryKey}</div>
            <div class="category-desc">${data.description}</div>
    `;
    
    if (data.type === 'table') {
        displayItems.sort((a, b) => {
            let valA = a[tableSort.col] || ''; let valB = b[tableSort.col] || '';
            if (tableSort.col === 'price') { valA = valA.length; valB = valB.length; }
            if (valA < valB) return tableSort.asc ? -1 : 1;
            if (valA > valB) return tableSort.asc ? 1 : -1;
            return 0;
        });
        html += `
            <div class="table-controls">
                <div class="toggle-group">
                    <label><input type="checkbox" onchange="toggleCol('location')" ${visibleCols.location ? 'checked' : ''}> Location</label>
                    <label><input type="checkbox" onchange="toggleCol('cuisine')" ${visibleCols.cuisine ? 'checked' : ''}> Cuisine</label>
                    <label><input type="checkbox" onchange="toggleCol('dish')" ${visibleCols.dish ? 'checked' : ''}> Dish</label>
                </div>
            </div>
            <div class="zine-table-container">
                <table class="zine-table">
                    <thead>
                        <tr>
                            <th onclick="sortTable('name')">Name ${tableSort.col === 'name' ? (tableSort.asc ? '↓' : '↑') : ''}</th>
                            <th onclick="sortTable('price')">Price ${tableSort.col === 'price' ? (tableSort.asc ? '↓' : '↑') : ''}</th>
                            ${visibleCols.dish ? `<th onclick="sortTable('dish')">Dish ${tableSort.col === 'dish' ? (tableSort.asc ? '↓' : '↑') : ''}</th>` : ''}
                            ${visibleCols.location ? `<th onclick="sortTable('location')">Location ${tableSort.col === 'location' ? (tableSort.asc ? '↓' : '↑') : ''}</th>` : ''}
                            ${visibleCols.cuisine ? `<th onclick="sortTable('cuisine')">Cuisine ${tableSort.col === 'cuisine' ? (tableSort.asc ? '↓' : '↑') : ''}</th>` : ''}
                        </tr>
                    </thead>
                    <tbody>
        `;
        displayItems.forEach(item => {
            const linkUrl = item.url ? item.url : gLucky(item.name);
            html += `
                <tr>
                    <td><a href="${linkUrl}" target="_blank" class="table-link">${item.name}</a></td>
                    <td>${item.price || ''}</td>
                    ${visibleCols.dish ? `<td>${item.dish || ''}</td>` : ''}
                    ${visibleCols.location ? `<td>${item.location || ''}</td>` : ''}
                    ${visibleCols.cuisine ? `<td>${item.cuisine || ''}</td>` : ''}
                </tr>
            `;
        });
        html += `</tbody></table></div>`;

    } else {
        if (data.type === 'alpha') { displayItems.sort((a, b) => a.name.localeCompare(b.name)); } 
        else if (data.type === 'events') { displayItems.sort((a, b) => a.monthIndex - b.monthIndex); }

        html += `<ul>`;
        displayItems.forEach((item, index) => {
            if (item.header) { html += `<li style="border-bottom:none; margin-bottom:0;"><div class="list-header">${item.header}</div></li>`; return; }
            const googleUrl = gSearch(item.name);
            const siteUrl = item.url ? item.url : gLucky(item.name);
            html += `
                <li>
                    <div class="item-row">
                        <div class="item-left">
                            <a href="${googleUrl}" target="_blank" class="item-link">
                                ${data.type === 'ranked' ? `<span class="rank">#${index + 1}</span>` : ''}
                                <span class="item-name">${item.name}</span>
                                <span class="item-meta">${item.year ? `(${item.year})` : ''}${item.month ? `(${item.month})` : ''}</span>
                            </a>
                            ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
                        </div>
                        <a href="${siteUrl}" target="_blank" class="btn-site">Site</a>
                    </div>
                </li>
            `;
        });
        if (data.honorableMentions) {
            html += `</ul><div class="honorable-mention">Honorable Mentions</div><ul>`;
            data.honorableMentions.forEach((item) => {
                html += `
                <li>
                    <div class="item-row">
                        <div class="item-left">
                            <a href="${gSearch(item.name)}" target="_blank" class="item-link">
                                <span class="item-name">${item.name}</span>
                                <span class="item-meta">(${item.year})</span>
                            </a>
                            ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
                        </div>
                        <a href="${gLucky(item.name)}" target="_blank" class="btn-site">Site</a>
                    </div>
                </li>`;
            });
        }
        html += `</ul>`;
    }
    
    html += `<div class="bottom-nav"><button class="btn-big-back" onclick="renderTOC()">back to index</button></div></div>`;
    app.innerHTML = html;
    window.scrollTo(0,0);
}

function sortTable(column) {
    if (tableSort.col === column) tableSort.asc = !tableSort.asc; 
    else { tableSort.col = column; tableSort.asc = true; }
    renderList(currentCategory); 
}
function toggleCol(column) {
    visibleCols[column] = !visibleCols[column];
    renderList(currentCategory);
}

// MODAL FUNCTIONS
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- BRACKET MAKER ---
let selectedRestaurants =[];
let bracketState = {}; 
let currentBracketCategory = '';

function openBracketSetup() { 
    const select = document.getElementById('bracketCategoryDropdown');
    select.innerHTML = '';
    Object.keys(wikiData).forEach(key => {
        const validItems = wikiData[key].items.filter(i => !i.header);
        if(validItems.length >= 16) {
            const opt = document.createElement('option');
            opt.value = key; opt.innerText = key;
            select.appendChild(opt);
        }
    });
    changeBracketCategory();
    openModal('selectorModal'); 
}

function changeBracketCategory() {
    currentBracketCategory = document.getElementById('bracketCategoryDropdown').value;
    selectedRestaurants =[];
    renderSelectorList();
}

function renderSelectorList() {
    const list = document.getElementById('selectorList');
    const counter = document.getElementById('selectorCounter');
    const bracketBtn = document.getElementById('makeBracketArea');
    
    const validItems = wikiData[currentBracketCategory].items.filter(i => !i.header);
    const sorted = validItems.sort((a,b) => a.name.localeCompare(b.name));
    
    list.innerHTML = '';
    counter.innerText = `${selectedRestaurants.length}/16`;
    bracketBtn.style.display = (selectedRestaurants.length === 16) ? 'block' : 'none';
    
    sorted.forEach(item => {
        const div = document.createElement('div');
        div.className = 'select-item';
        if (selectedRestaurants.includes(item.name)) div.classList.add('selected');
        div.innerText = item.name;
        div.onclick = () => { toggleSelection(item.name); };
        list.appendChild(div);
    });
}

function toggleSelection(name) {
    if (selectedRestaurants.includes(name)) { 
        selectedRestaurants = selectedRestaurants.filter(n => n !== name); 
    } else {
        if (selectedRestaurants.length < 16) { selectedRestaurants.push(name); } 
        else { alert("You can only choose 16!"); return; }
    }
    renderSelectorList();
}

function generateBracket() {
    closeModal('selectorModal');
    selectedRestaurants.sort(() => Math.random() - 0.5);
    bracketState = {}; 
    document.getElementById('shareControls').style.display = 'none'; 
    document.getElementById('bracketTitleDisplay').innerText = `${currentBracketCategory} SWEET 16`;
    renderBracketView();
    openModal('bracketModal');
}

function advanceName(matchId, name) {
    bracketState[matchId] = name; 
    if (matchId === 'final') {
         bracketState['champion'] = name;
         document.getElementById('shareControls').style.display = 'block';
    }
    renderBracketView();
}

function createMatchCardPlaceholder(id, prevId1, prevId2, initialName1=null, initialName2=null) {
    const name1 = initialName1 || bracketState[prevId1] || "---";
    const name2 = initialName2 || bracketState[prevId2] || "---";
    let winner = (id === 'final') ? bracketState['champion'] : bracketState[id];
    
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
    for(let i=0; i<4; i++) html += createMatchCardPlaceholder(`r1-m${i}`, null, null, selectedRestaurants[i*2], selectedRestaurants[i*2+1]);
    html += '</div><div class="bracket-col">';
    for(let i=0; i<2; i++) html += createMatchCardPlaceholder(`r2-m${i}`, `r1-m${i*2}`, `r1-m${i*2+1}`);
    html += '</div><div class="bracket-col center">';
    html += createMatchCardPlaceholder('r3-m0', 'r2-m0', 'r2-m1');
    html += '<div class="finals-wrapper">';
    html += createMatchCardPlaceholder('final', 'r3-m0', 'r3-m1');
    const champ = bracketState['champion'] || "???";
    html += `<div class="champ-box">CHAMPION<br><span style="font-size:0.9em">${champ}</span></div></div>`;
    html += createMatchCardPlaceholder('r3-m1', 'r2-m2', 'r2-m3');
    html += '</div><div class="bracket-col">';
    for(let i=2; i<4; i++) html += createMatchCardPlaceholder(`r2-m${i}`, `r1-m${i*2}`, `r1-m${i*2+1}`);
    html += '</div><div class="bracket-col">';
    for(let i=4; i<8; i++) html += createMatchCardPlaceholder(`r1-m${i}`, null, null, selectedRestaurants[i*2], selectedRestaurants[i*2+1]);
    html += '</div>';
    container.innerHTML = html;
}

function downloadBracket() {
    const element = document.getElementById('bracketCaptureArea');
    html2canvas(element, { backgroundColor: "#222" }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'louisville-bracket.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

// --- DIVE BAR CRAWL GENERATOR ---
const diveNeighborhoods = {
    "Germantown / Schnitzelburg":["Nachbar", "Seidenfaden's", "The Merryweather", "Hauck's Corner", "Four Pegs"],
    "Highlands":["Bambi Bar", "The Outlook Inn", "Hideaway Saloon", "Left Field Lounge", "Kern's Korner", "Barret Bar"],
    "Clifton / Crescent Hill":["Mellwood Tavern", "Frankfort Ave Beer Depot", "Spring Street Bar", "High Horse"],
    "Old Louisville / Downtown":["Mag Bar", "Granville Pub", "Third Street Dive", "Air Devils Inn"]
};

function openCrawlGenerator() {
    generateCrawl();
    openModal('crawlModal');
}

function generateCrawl() {
    const hoods = Object.keys(diveNeighborhoods);
    const randomHood = hoods[Math.floor(Math.random() * hoods.length)];
    const bars = [...diveNeighborhoods[randomHood]].sort(() => 0.5 - Math.random());
    
    document.getElementById('crawlNeighborhood').innerText = randomHood;
    const barSpans = document.getElementById('crawlBars').children;
    for(let i=0; i<3; i++) {
        barSpans[i].innerText = `${i+1}. ${bars[i] || "Waffle House"}`; // fallback if short
    }
}

// --- PERFECT NIGHT OUT SLOT MACHINE ---
let slotInterval;
function openSlotMachine() {
    document.getElementById('slot1').innerText = "???";
    document.getElementById('slot2').innerText = "???";
    document.getElementById('slot3').innerText = "???";
    document.getElementById('spinBtn').innerText = "Pull Lever";
    openModal('slotModal');
}

function spinSlots() {
    clearInterval(slotInterval);
    document.getElementById('spinBtn').innerText = "Spinning...";
    
    // Gather data pools
    const activities = [
        ...wikiData["Attractions & Outings"].items, 
        ...wikiData["Active Louisville"].items, 
        ...wikiData["Clubs & Activities"].items
    ].filter(i => !i.header).map(i => i.name);
    
    const dinners = wikiData["Dining Directory"].items.map(i => i.name);
    
    const lateNights =[
        ...wikiData["Late Night & 24/7"].items,
        ...wikiData["Dive Bars"].items
    ].filter(i => !i.header).map(i => i.name);

    let ticks = 0;
    const s1 = document.getElementById('slot1');
    const s2 = document.getElementById('slot2');
    const s3 = document.getElementById('slot3');

    slotInterval = setInterval(() => {
        ticks++;
        if(ticks < 15) s1.innerText = activities[Math.floor(Math.random() * activities.length)];
        if(ticks < 25) s2.innerText = dinners[Math.floor(Math.random() * dinners.length)];
        if(ticks < 35) s3.innerText = lateNights[Math.floor(Math.random() * lateNights.length)];
        
        if(ticks >= 35) {
            clearInterval(slotInterval);
            document.getElementById('spinBtn').innerText = "Spin Again";
        }
    }, 60);
}

// --- WEIRD LOUISVILLE BINGO ---
const defaultBingoItems =[
    "Drink Malört at Mag Bar", "Eat a Hot Brown", "Stuck behind a train in Germantown", 
    "See the 21c David Statue", "Fleur-de-lis tattoo spotted", "Wait in line at Nord's", 
    "Avoid an electric scooter", "Hear 'Keep Louisville Weird'", "Get lost in Cave Hill", 
    "Take a shot at The Back Door", "See a giant bat", "Walk the Big Four Bridge", 
    "Find a hidden speakeasy", "Spinelli's out of a car", "Survive the Watterson", 
    "Go to a basement show", "See a riverboat", "Smell the Butchertown plant", 
    "Someone mentions Jack Harlow", "Find a historic plaque", "Drink a bourbon neat", 
    "Talk about Derby in Nov", "Spot a UofL/UK divided house", "Heine Bros Coffee cup"
];

function openBingo() {
    generateBingo();
    openModal('bingoModal');
}

function getBingoPool() {
    const custom = JSON.parse(localStorage.getItem('userBingo')) || [];
    return[...defaultBingoItems, ...custom];
}

function generateBingo() {
    const board = document.getElementById('bingoBoard');
    board.innerHTML = '';
    
    let pool = getBingoPool().sort(() => 0.5 - Math.random());
    while(pool.length < 24) pool.push("Drink Bourbon"); 
    
    const selected = pool.slice(0, 24);
    selected.splice(12, 0, "FREE SPACE\n(Local Weirdo)"); 

    selected.forEach((text, i) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell' + (i === 12 ? ' free stamped' : '');
        cell.innerText = text;
        if(i !== 12) {
            cell.onclick = () => cell.classList.toggle('stamped');
        }
        board.appendChild(cell);
    });
}

function addBingoItem() {
    const input = document.getElementById('customBingoInput');
    const val = input.value.trim();
    if(val.length > 0) {
        let custom = JSON.parse(localStorage.getItem('userBingo')) ||[];
        custom.push(val);
        localStorage.setItem('userBingo', JSON.stringify(custom));
        input.value = '';
        generateBingo();
    }
}

function resetCustomBingo() {
    if(confirm("Clear your custom bingo squares?")) {
        localStorage.removeItem('userBingo');
        generateBingo();
    }
}

// Initialize
renderTOC();

// --- EASTER EGGS ---
function startBoatRace() {
    const raceHtml = `
        <div id="raceModal" class="modal-overlay" style="display:flex;">
            <div class="modal-box" style="width:90%; max-width:500px; text-align:center; background:#fff; color:#000;">
                <div class="modal-close" onclick="this.parentElement.parentElement.remove()">×</div>
                <h2 style="margin-top:0;">THE GREAT STEAMBOAT RACE</h2>
                <p style="font-size:0.8rem; font-weight:bold;">MASH THE 'SPACE' KEY TO BEAT CINCINNATI!</p>
                <div style="border:4px solid #000; height:120px; position:relative; overflow:hidden; background:cyan; margin:20px 0; border-radius:10px;">
                    <div id="playerBoat" style="position:absolute; left:0; top:20px; font-size:40px; transition: left 0.1s linear; z-index:2; transform: scaleX(-1);">🚢</div>
                    <div id="rivalBoat" style="position:absolute; left:0; top:65px; font-size:40px; transition: left 0.1s linear; opacity:0.7; z-index:1; transform: scaleX(-1);">🚤</div>
                    <div style="position:absolute; right:0; top:0; bottom:0; width:15px; background:red; border-left:2px dashed white; z-index:3;"></div>
                </div>
                <div id="raceStatus" style="font-weight:900; font-size:1.2rem; min-height:1.5em;">READY... SET...</div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', raceHtml);
    
    let playerPos = 0; let rivalPos = 0; let racing = false;
    const finishLine = 380;

    setTimeout(() => { document.getElementById('raceStatus').innerText = "GO GO GO!"; racing = true; }, 1500);

    const rivalDrive = setInterval(() => {
        if(!racing) return;
        rivalPos += Math.random() * 8; 
        const rBoat = document.getElementById('rivalBoat');
        if(rBoat) rBoat.style.left = rivalPos + 'px';
        
        if(rivalPos > finishLine) { 
            racing = false; 
            document.getElementById('raceStatus').innerText = "CINCINNATI WON. DISGRACEFUL.";
            clearInterval(rivalDrive);
        }
    }, 100);

    const raceHandler = function(e) {
        if(e.code === "Space" && racing) {
            e.preventDefault();
            playerPos += 12; 
            const pBoat = document.getElementById('playerBoat');
            if(pBoat) pBoat.style.left = playerPos + 'px';
            
            if(playerPos > finishLine) {
                racing = false;
                document.getElementById('raceStatus').innerText = "THE BELLE WINS! CHAMPION OF THE OHIO!";
                document.getElementById('raceStatus').style.color = "green";
                clearInterval(rivalDrive);
                window.removeEventListener('keydown', raceHandler);
            }
        }
    };

    window.addEventListener('keydown', raceHandler);
    const checkClosed = setInterval(() => {
        if (!document.getElementById('raceModal')) {
            window.removeEventListener('keydown', raceHandler);
            clearInterval(rivalDrive);
            clearInterval(checkClosed);
        }
    }, 500);
}