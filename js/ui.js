import { wikiData } from '../library_data.js';
// --- js/ui.js ---
import { state } from './state.js';
import { gSearch, gLucky, openModal } from './utils.js';

// Theme Toggle
export function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('wikiTheme', newTheme);

    const icon = document.getElementById('themeToggleBtn');
    if (icon) {
        icon.innerText = newTheme === 'light' ? '🌙' : '☀️';
    }
}

// Initial Theme Check
export function initTheme() {
    const savedTheme = localStorage.getItem('wikiTheme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = document.getElementById('themeToggleBtn');
        if (icon) icon.innerText = savedTheme === 'light' ? '🌙' : '☀️';
    } else {
        // Auto check preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
            const icon = document.getElementById('themeToggleBtn');
            if (icon) icon.innerText = '☀️';
        }
    }
}

// Core Rendering
export function renderTOC() {
    const app = document.getElementById('content-area');
    let html = '<div class="toc">';

    // Pinned Top Keys
    const topKeys = ["Dining Directory", "Oldest Restaurants", "Oldest Landmarks"];
    const allKeys = Object.keys(wikiData);
    const restKeys = allKeys.filter(k => !topKeys.includes(k)).sort();

    for (const key of topKeys) {
        html += `<button class="toc-btn" style="border-color: var(--highlight);" onclick="renderList('${key.replace(/'/g, "\\'")}')">★ ${key}</button>`;
    }

    html += '<hr style="width:100%; border:1px dotted #999; margin: 5px 0;">';

    // The Rest
    for (const key of restKeys) {
        html += `<button class="toc-btn" onclick="renderList('${key.replace(/'/g, "\\'")}')">➤ ${key}</button>`;
    }

    // Tools Section
    html += `<div class="tools-header">Generators & Tools</div>`;
    html += `<button class="toc-btn" onclick="openBracketSetup()">🏆 Custom Bracket Maker</button>`;
    html += `<button class="toc-btn" onclick="openCrawlGenerator()">🍻 Dive Bar Crawl Generator</button>`;
    html += `<button class="toc-btn" onclick="openSlotMachine()">🎰 Night Out Slot</button>`;
    html += `<button class="toc-btn" onclick="openBingo()">🎱 Louisville Bingo</button>`;

    // Community Section
    html += `<div class="tools-header">Community</div>`;
    html += `<button class="toc-btn" onclick="openGiscus()">💬 Community Board</button>`;

    html += '</div>';
    app.innerHTML = html;
    window.scrollTo(0, 0);
}

export function renderList(categoryKey) {
    state.currentCategory = categoryKey;
    const data = wikiData[categoryKey];
    if (!data) return;

    const app = document.getElementById('content-area');
    let displayItems = [...data.items];

    let navBarHtml = `<span class="back-btn" onclick="renderTOC()">← back to index</span>`;

    // Update Map View button to hook into our new internal Leaflet map
    if (categoryKey !== "Dining Directory") {
        navBarHtml += `<button class="btn-map" onclick="openCategoryMap('${categoryKey.replace(/'/g, "\\'")}')">🗺️ Map View</button>`;
    }

    let html = `
        <div class="view-container">
            <div class="nav-bar">${navBarHtml}</div>
            <div class="category-header">${categoryKey}</div>
            <div class="category-desc">${data.description}</div>
    `;

    if (data.type === 'table') {
        displayItems = applyFilters(displayItems);
        html += renderFilterChips(displayItems);
        displayItems.sort((a, b) => {
            let valA = a[state.tableSort.col] || ''; let valB = b[state.tableSort.col] || '';
            if (state.tableSort.col === 'price') { valA = valA.length; valB = valB.length; }
            if (valA < valB) return state.tableSort.asc ? -1 : 1;
            if (valA > valB) return state.tableSort.asc ? 1 : -1;
            return 0;
        });
        html += `
            <div class="table-controls">
                <div class="toggle-group">
                    <label><input type="checkbox" onchange="toggleCol('location')" ${state.visibleCols.location ? 'checked' : ''}> Location</label>
                    <label><input type="checkbox" onchange="toggleCol('cuisine')" ${state.visibleCols.cuisine ? 'checked' : ''}> Cuisine</label>
                    <label><input type="checkbox" onchange="toggleCol('dish')" ${state.visibleCols.dish ? 'checked' : ''}> Dish</label>
                </div>
            </div>
            <div class="zine-table-container">
                <table class="zine-table">
                    <thead>
                        <tr>
                            <th onclick="sortTable('name')">Name ${state.tableSort.col === 'name' ? (state.tableSort.asc ? '↓' : '↑') : ''}</th>
                            <th onclick="sortTable('price')">Price ${state.tableSort.col === 'price' ? (state.tableSort.asc ? '↓' : '↑') : ''}</th>
                            ${state.visibleCols.dish ? `<th onclick="sortTable('dish')">Dish ${state.tableSort.col === 'dish' ? (state.tableSort.asc ? '↓' : '↑') : ''}</th>` : ''}
                            ${state.visibleCols.location ? `<th onclick="sortTable('location')">Location ${state.tableSort.col === 'location' ? (state.tableSort.asc ? '↓' : '↑') : ''}</th>` : ''}
                            ${state.visibleCols.cuisine ? `<th onclick="sortTable('cuisine')">Cuisine ${state.tableSort.col === 'cuisine' ? (state.tableSort.asc ? '↓' : '↑') : ''}</th>` : ''}
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
                    ${state.visibleCols.dish ? `<td>${item.dish || ''}</td>` : ''}
                    ${state.visibleCols.location ? `<td>${item.location || ''}</td>` : ''}
                    ${state.visibleCols.cuisine ? `<td>${item.cuisine || ''}</td>` : ''}
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
            html += `</ul><div class="honorable-mention" style="margin-top:20px; font-weight:bold;">Honorable Mentions</div><ul>`;
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
    window.scrollTo(0, 0);
}

export function sortTable(column) {
    if (state.tableSort.col === column) state.tableSort.asc = !state.tableSort.asc;
    else { state.tableSort.col = column; state.tableSort.asc = true; }
    state.savePrefs();
    renderList(state.currentCategory);
}

export function toggleCol(column) {
    state.visibleCols[column] = !state.visibleCols[column];
    state.savePrefs();
    renderList(state.currentCategory);
}

function getUniqueValues(items, key) {
    const values = new Set();
    items.forEach(item => {
        if (item[key]) values.add(item[key]);
    });
    return Array.from(values).sort();
}

function renderFilterChips(items) {
    const cuisines = getUniqueValues(items, 'cuisine');
    const prices = getUniqueValues(items, 'price');
    
    let html = `<div class="filter-chips">`;
    
    html += `<div class="filter-group"><span class="filter-label">Cuisine:</span>`;
    cuisines.forEach(c => {
        const active = state.filters.cuisine.includes(c) ? 'active' : '';
        html += `<span class="filter-chip ${active}" onclick="toggleFilter('cuisine', '${c.replace(/'/g, "\\'")}')">${c}</span>`;
    });
    html += `</div>`;
    
    html += `<div class="filter-group"><span class="filter-label">Price:</span>`;
    prices.forEach(p => {
        const active = state.filters.price.includes(p) ? 'active' : '';
        html += `<span class="filter-chip ${active}" onclick="toggleFilter('price', '${p}')">${p}</span>`;
    });
    html += `</div>`;
    
    const hasFilters = state.filters.cuisine.length > 0 || state.filters.price.length > 0;
    if (hasFilters) {
        const count = items.length;
        html += `<button class="filter-clear" onclick="clearFilters()">Clear Filters</button>`;
        html += `<span class="filter-count">${count} result${count !== 1 ? 's' : ''}</span>`;
    }
    
    html += `</div>`;
    return html;
}

export function toggleFilter(type, value) {
    const arr = state.filters[type];
    const idx = arr.indexOf(value);
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(value);
    renderList(state.currentCategory);
}

export function clearFilters() {
    state.filters.cuisine = [];
    state.filters.price = [];
    renderList(state.currentCategory);
}

function applyFilters(items) {
    let result = items;
    if (state.filters.cuisine.length > 0) {
        result = result.filter(item => item.cuisine && state.filters.cuisine.includes(item.cuisine));
    }
    if (state.filters.price.length > 0) {
        result = result.filter(item => item.price && state.filters.price.includes(item.price));
    }
    return result;
}

// Attach to window 
window.renderTOC = renderTOC;
window.renderList = renderList;
window.sortTable = sortTable;
window.toggleCol = toggleCol;
window.toggleTheme = toggleTheme;
window.toggleFilter = toggleFilter;
window.clearFilters = clearFilters;

export function openGiscus() {
    openModal('giscusModal');
}

window.openGiscus = openGiscus;

