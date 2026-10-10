// --- js/ui.js ---
// Home + category rendering, dining table, been-there stamps, surprise picks.
import { wikiData, orderedKeys, PINNED, ANNUAL_EVENTS, COMPANIONS, NO_MAP, MONTHS, slugOf, emojiOf, realItems, countOf, totalCount, areaOf, eventsInMonth, randomEntry, categoryKeys } from './data.js';
// Namespace import: if GitHub Pages serves a cached data.js from before quick lists, this degrades instead of blanking the page
import * as dataNs from './data.js';
const PRESETS = dataNs.PRESETS || {};
const presetSections = (id) => dataNs.presetSections?.(id) || [];
const presetCount = (id) => dataNs.presetCount?.(id) || 0;
// Lists shown inside a parent list's page (a cached older data.js stores a single name, not an array)
const companionsOf = (key) => [].concat(COMPANIONS[key] || []).filter(k => wikiData[k]);
import { state, isBeen, toggleBeen, beenCount } from './state.js';
import { gSearch, gLucky, escapeHtml as esc, openModal, prefersReducedMotion, rand, store, $ } from './utils.js';
import { foundCount, SECRETS } from './secrets.js';
import { sfx } from './audio.js';

const content = () => document.getElementById('content-area');
const catHref = (key, idx) => `#/c/${slugOf(key)}${idx !== undefined ? '/' + idx : ''}`;

// ---------------------------------------------------------------
// THEME
// ---------------------------------------------------------------
export function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme, persist = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) localStorageRaw('wikiTheme', theme);
    const icon = document.getElementById('themeToggleBtn');
    if (icon) icon.textContent = theme === 'light' ? '🌙' : '☀️';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#11110f' : '#141414';
    window.dispatchEvent(new CustomEvent('wiki:theme', { detail: theme }));
}

// The pre-paint script in index.html reads the raw string, not JSON
function localStorageRaw(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

export function toggleTheme() {
    setTheme(currentTheme() === 'light' ? 'dark' : 'light');
}

export function initTheme() {
    setTheme(currentTheme(), false);
}

// ---------------------------------------------------------------
// HOME
// ---------------------------------------------------------------
export function renderHome() {
    state.currentCategory = '';
    const month = new Date().getMonth() + 1;
    const months = [month, month % 12 + 1].map(m => ({ m, events: eventsInMonth(m) }));
    const evHref = (e) => catHref(ANNUAL_EVENTS, wikiData[ANNUAL_EVENTS].items.indexOf(e));

    const card = (key, i, featured) => {
        const data = wikiData[key];
        const n = countOf(key);
        const been = beenCount(key, data.items);
        return `
        <a class="cat-card ${featured ? 'featured' : ''}" href="${catHref(key)}" style="--i:${i}" data-tilt>
            ${featured ? '<span class="star-badge">★</span>' : ''}
            <span class="cc-count">${n} ${n === 1 ? 'ENTRY' : 'ENTRIES'}</span>
            <span class="cc-emoji" aria-hidden="true">${emojiOf(key)}</span>
            <span class="cc-name">${esc(key)}</span>
            <span class="cc-desc">${esc(data.description || '')}</span>
            ${been ? `<span class="cc-been"><span>been ${been}</span><span class="meter"><i style="width:${Math.round(been / n * 100)}%"></i></span></span>` : ''}
        </a>`;
    };

    // Gathered lists (Free Louisville) ride in the grid like any other list
    const presetCard = (id, i) => {
        const p = PRESETS[id], n = presetCount(id);
        return `
        <a class="cat-card" href="#/p/${id}" style="--i:${i}" data-tilt>
            <span class="cc-count">${n} ${n === 1 ? 'ENTRY' : 'ENTRIES'}</span>
            <span class="cc-emoji" aria-hidden="true">${p.emoji}</span>
            <span class="cc-name">${esc(p.title)}</span>
            <span class="cc-desc">${esc(p.desc)}</span>
        </a>`;
    };

    const featured = PINNED.filter(k => wikiData[k]);
    // companions (Neighborhoods, Lost Louisville, …) live inside their parent's page only
    const companions = Object.keys(COMPANIONS).flatMap(companionsOf);
    const rest = [
        ...orderedKeys.filter(k => !PINNED.includes(k) && k !== ANNUAL_EVENTS && !companions.includes(k)).map(k => ({ name: k, html: (i) => card(k, i, false) })),
        ...Object.keys(PRESETS).map(id => ({ name: PRESETS[id].title, html: (i) => presetCard(id, i) })),
    ].sort((a, b) => a.name.localeCompare(b.name));
    const nFound = foundCount();

    content().innerHTML = `
    <div class="view home">
        <section class="search-zone" id="searchZone">
            <div class="search-row">
                <label class="searchbar">
                    <span class="glass" aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><circle cx="10" cy="10" r="7"/><path d="M15.5 15.5 22 22"/></svg>
                    </span>
                    <input id="globalSearch" type="search" placeholder="Search ${totalCount}+ spots, bars, parks, dates…" autocomplete="off" spellcheck="false"
                        role="combobox" aria-expanded="false" aria-controls="searchResults" aria-label="Search the wiki">
                    <span class="kbd" aria-hidden="true">press /</span>
                </label>
                <button type="button" class="surprise-btn" data-action="surprise"><span class="die">🎲</span> Surprise Me</button>
            </div>
            <div id="searchResults" class="search-results" role="listbox" hidden></div>
        </section>

        ${wikiData[ANNUAL_EVENTS] ? `
        <section class="month-strip" aria-label="Happening this month and next">
            <div class="month-rows">
                ${months.map(({ m, events }) => `
                <div class="month-row">
                    <div class="month-label"><small>HAPPENING IN</small><strong>${MONTHS[m]}</strong></div>
                    <div class="month-items">
                        ${events.length ? events.map(e => `<a href="${evHref(e)}">${esc(e.name)}</a>`).join('') : '<span class="month-none">Nothing on the calendar yet.</span>'}
                    </div>
                </div>`).join('')}
            </div>
            <a class="annual-btn" href="${catHref(ANNUAL_EVENTS)}">
                <span class="ab-emoji" aria-hidden="true">${emojiOf(ANNUAL_EVENTS)}</span>
                <span class="ab-name">Annual Events</span>
                <span class="ab-desc">The whole year, month by month →</span>
            </a>
        </section>` : ''}

        <div class="divider"></div>

        <div class="section-head">
            <h2 class="section-title">The <span class="hl">Directory</span></h2>
        </div>
        <div class="featured-grid">${featured.map((k, i) => card(k, i, true)).join('')}</div>
        <div class="divider"></div>

        <div class="section-head">
            <h2 class="section-title">Generators <span class="hl">&amp; Tools</span></h2>
            <span class="scrawl">for when you can't decide</span>
        </div>
        <div class="tool-grid">
            <button type="button" class="tool-card" data-action="tool" data-tool="bracket" style="--i:0">
                <span class="tc-badge">SWEET 16</span>
                <span class="tc-emoji">🏆</span>
                <span class="tc-name">Bracket Maker</span>
                <span class="tc-desc">Pick 16 favorites from any list. Fight to the death. Save the carnage as an image.</span>
                <span class="tc-cta">START A BRACKET →</span>
            </button>
            <button type="button" class="tool-card" data-action="tool" data-tool="crawl" style="--i:1">
                <span class="tc-badge">MAPPED</span>
                <span class="tc-emoji">🍻</span>
                <span class="tc-name">Bar Crawl</span>
                <span class="tc-desc">Three bars, all within a 2-mile walk, plotted on a map. Actually walkable.</span>
                <span class="tc-cta">PLOT A ROUTE →</span>
            </button>
            <button type="button" class="tool-card" data-action="tool" data-tool="slot" style="--i:2">
                <span class="tc-badge">3D</span>
                <span class="tc-emoji">🎰</span>
                <span class="tc-name">Night Out Slot</span>
                <span class="tc-desc">Activity, dinner, late-night. Pull the lever and let the reels decide.</span>
                <span class="tc-cta">PULL THE LEVER →</span>
            </button>
            <button type="button" class="tool-card" data-action="tool" data-tool="bingo" style="--i:3">
                <span class="tc-badge">SAVES</span>
                <span class="tc-emoji">🃏</span>
                <span class="tc-name">Louisville Bingo</span>
                <span class="tc-desc">Only-in-Louisville moments. Your card remembers you. Five in a row wins.</span>
                <span class="tc-cta">GET A CARD →</span>
            </button>
            <button type="button" class="tool-card" data-action="tool" data-tool="walk" style="--i:4">
                <span class="tc-badge">ON FOOT</span>
                <span class="tc-emoji">🏛️</span>
                <span class="tc-name">History Walk</span>
                <span class="tc-desc">Four old landmarks and local oddities, one stroll under 2 miles, with the stories on the way.</span>
                <span class="tc-cta">TAKE A WALK →</span>
            </button>
        </div>

        <div class="divider"></div>

        <div class="section-head">
            <h2 class="section-title">Every <span class="hl">List</span></h2>
            <span class="scrawl">all ${rest.length} of them, A to Z</span>
        </div>
        <div class="cat-grid">${rest.map((r, i) => r.html(i + 4)).join('')}</div>

        <div class="divider"></div>

        <div class="section-head">
            <h2 class="section-title">Community</h2>
            <span class="scrawl">be nice ♥</span>
        </div>
        <div class="community-grid">
            <button type="button" class="big-link" data-action="giscus">
                <span class="bl-emoji">💬</span>
                <span><span class="bl-name">Community Board</span><span class="bl-desc">Tips, corrections, hot takes about Hot Browns. Requires GitHub.</span></span>
            </button>
            <button type="button" class="big-link secrets" data-action="stickers">
                <span class="bl-emoji">${nFound === SECRETS.length ? '🏅' : nFound ? '🔓' : '🔒'}</span>
                <span><span class="bl-name">Secrets: <span data-secret-count>${nFound}/${SECRETS.length}</span></span><span class="bl-desc">This site is full of easter eggs. The vault keeps track of the ones you've found.</span></span>
            </button>
        </div>
    </div>`;

    bindTilt();
}

// Pointer-driven card tilt
function bindTilt() {
    if (prefersReducedMotion() || window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - .5;
            const y = (e.clientY - r.top) / r.height - .5;
            card.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
            card.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`);
        });
        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });
}

// ---------------------------------------------------------------
// CATEGORY
// ---------------------------------------------------------------
export function renderCategory(key, focusIdx = null, { afterHero = false } = {}) {
    const data = wikiData[key];
    if (!data) return renderHome();
    if (state.currentCategory !== key) {
        state.filters = { cuisine: [], price: [], area: [], text: '' };
    }
    state.currentCategory = key;

    const n = countOf(key);
    const been = beenCount(key, data.items);
    const i = orderedKeys.indexOf(key);
    const prev = orderedKeys[(i - 1 + orderedKeys.length) % orderedKeys.length];
    const next = orderedKeys[(i + 1) % orderedKeys.length];

    let body = '';
    if (data.type === 'table') body = diningShell(key);
    else if (data.type === 'ranked') body = renderRanked(key, data);
    else if (data.type === 'alpha') body = renderAlpha(key, data);
    else if (data.type === 'events') body = renderEvents(key, data);
    else if (key === 'Louisville History Timeline') body = renderTimeline(key, data);
    else body = renderSections(key, data, key === 'Neighborhoods' ? 'hood-grid' : '');
    const subs = companionsOf(key);
    const parent = Object.keys(COMPANIONS).find(k => companionsOf(k).includes(key));
    const banner = (href, emoji, title, line) => `<a class="companion-banner" href="${href}"><span class="cb-emoji" aria-hidden="true">${emoji}</span><span><b>${esc(title)}</b><small>${esc(line)}</small></span></a>`;
    if (subs.length) body = `<div class="companion-row">${subs.map(s => banner(catHref(s), emojiOf(s), s, (dataNs.COMPANION_NOTES?.[s] || (n => `${n} entries →`))(countOf(s)))).join('')}</div>` + body;
    if (parent && wikiData[parent]) body = `<div class="companion-row">${banner(catHref(parent), emojiOf(parent), `Part of ${parent}`, `← Back to ${parent}`)}</div>` + body;

    content().innerHTML = `
    <div class="view cat-page">
        <nav class="crumbs" aria-label="Breadcrumb">
            <a class="back-btn" href="#/">← INDEX</a>
            <span class="crumb-trail">/ ${esc(key)}</span>
            <span class="crumb-actions">
                ${!NO_MAP.has(key) ? `<button type="button" class="btn-map" data-action="map">🗺️ Map View</button>` : ''}
                <button type="button" class="btn-map" data-action="pick-cat">🎲 Pick One</button>
            </span>
        </nav>

        <header class="cat-hero">
            <div class="ch-emoji" aria-hidden="true">${emojiOf(key)}</div>
            <h2 class="cat-title">${esc(key)}</h2>
            <div class="cat-sub">
                <span class="stamp ink">${n} entries</span>
                <span class="stamp">${esc(typeLabel(data.type, key))}</span>
                ${PINNED.includes(key) ? '<span class="stamp hl">★ staff pick</span>' : ''}
            </div>
        </header>
        <p class="cat-desc">${esc(data.description || '')}</p>
        ${data.type !== 'events' && key !== 'Louisville History Timeline' ? `
        <div class="been-meter">
            <span>BEEN THERE: <b id="beenNum">${been}</b>/${n}</span>
            <span class="meter"><i id="beenBar" style="width:${n ? Math.round(been / n * 100) : 0}%"></i></span>
        </div>` : ''}

        <div class="cat-body">${body}</div>

        <nav class="pager" aria-label="More categories">
            <a class="prev" href="${catHref(prev)}"><small>← PREVIOUS</small><strong>${emojiOf(prev)} ${esc(prev)}</strong></a>
            <a class="home chip-btn" href="#/">⌂ index</a>
            <a class="next" href="${catHref(next)}"><small>NEXT →</small><strong>${esc(next)} ${emojiOf(next)}</strong></a>
        </nav>
    </div>`;

    if (data.type === 'table') renderDining(focusIdx !== null);

    if (focusIdx !== null) {
        // when arriving from home the hero is still shrinking; wait so we land in the right spot
        setTimeout(() => {
            const el = document.getElementById(`e-${slugOf(key)}-${focusIdx}`);
            if (el) {
                el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
                el.classList.add('flash');
            }
        }, afterHero && !prefersReducedMotion() ? 850 : 40);
    }
}

function typeLabel(type, key) {
    if (key === 'Louisville History Timeline') return 'timeline';
    return { table: 'sortable table', ranked: 'ranked by age', alpha: 'a → z', events: 'calendar', custom: 'curated list' }[type] || 'list';
}

const freeTag = (item) => item.free ? '<span class="free-tag" title="Free to get in">FREE</span>' : '';

function entryHTML(cat, item, idx, { rank = null, extraClass = '', i = 0 } = {}) {
    const been = isBeen(cat, item.name);
    const site = item.url ? item.url : gLucky(item.name);
    const meta = [item.year ? `(${esc(item.year)})` : '', item.month ? `(${esc(item.month)})` : ''].join('');
    return `
    <li class="entry ${been ? 'is-been' : ''} ${extraClass}" id="e-${slugOf(cat)}-${idx}" data-cat="${esc(cat)}" data-name="${esc(item.name)}" style="--i:${Math.min(i, 40)}">
        <div class="entry-main">
            ${rank !== null ? `<span class="rank">#${rank}</span>` : ''}
            <a class="entry-name" href="${gSearch(item.name)}" target="_blank" rel="noopener">${esc(item.name)}</a>
            ${meta ? `<span class="entry-meta">${meta}</span>` : ''}${freeTag(item)}
            ${item.note ? `<p class="entry-note">${esc(item.note)}</p>` : ''}
        </div>
        <div class="entry-actions">
            <a class="btn-site" href="${esc(site)}" target="_blank" rel="noopener">Site ↗</a>
            <button type="button" class="been-btn" data-action="been" aria-pressed="${been}" title="Been there?" aria-label="Mark ${esc(item.name)} as been there">✓</button>
        </div>
        <span class="been-stamp" aria-hidden="true">BEEN THERE</span>
    </li>`;
}

function renderSections(key, data, extraGridClass) {
    let html = `<ul class="entries ${extraGridClass}">`;
    let i = 0;
    data.items.forEach((item, idx) => {
        if (item.header) { html += `<li class="entry-header"><h3>${esc(item.header)}</h3></li>`; return; }
        html += entryHTML(key, item, idx, { i: i++ });
    });
    return html + '</ul>';
}

function renderAlpha(key, data) {
    const items = data.items.map((item, idx) => ({ item, idx })).filter(x => x.item.name && !x.item.header)
        .sort((a, b) => a.item.name.localeCompare(b.item.name));
    const letterOf = (name) => { const c = name.replace(/^the\s+/i, '').charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };
    const groups = {};
    items.forEach(x => { (groups[letterOf(x.item.name)] ||= []).push(x); });
    const letters = Object.keys(groups).sort();
    const useBar = items.length > 14;

    let html = '';
    if (useBar) {
        html += `<nav class="alpha-bar" aria-label="Jump to letter">${'#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(L =>
            groups[L] ? `<a href="#" data-action="jump" data-target="L-${L}">${L}</a>` : `<span>${L}</span>`).join('')}</nav>`;
    }
    // long lists get letter headers; short ones stay a tight grid with a letter tab on the first entry
    const useHeads = items.length > 40;
    html += '<ul class="entries">';
    let i = 0;
    letters.forEach(L => {
        if (useHeads) html += `<li class="letter-head" id="L-${L}">${L}</li>`;
        groups[L].forEach((x, j) => {
            let h = entryHTML(key, x.item, x.idx, { i: i++ });
            if (!useHeads && useBar && j === 0) h = h.replace('<li class="entry', `<li data-letter="${L}" class="entry`).replace('<div class="entry-main">', `<span class="letter-badge" id="L-${L}">${L}</span><div class="entry-main">`);
            html += h;
        });
    });
    return html + '</ul>';
}

function renderRanked(key, data) {
    const nowYear = new Date().getFullYear();
    const row = (item, idx, rank, i) => {
        const age = parseInt(item.year, 10) ? nowYear - parseInt(item.year, 10) : null;
        const been = isBeen(key, item.name);
        const site = item.url ? item.url : gLucky(item.name);
        return `
        <li class="entry ${been ? 'is-been' : ''}" id="e-${slugOf(key)}-${idx}" data-cat="${esc(key)}" data-name="${esc(item.name)}" style="--i:${Math.min(i, 40)}">
            <div class="yr">${esc(item.year || '—')}</div>
            <div class="entry-main">
                ${rank ? `<span class="rank">#${rank}</span>` : ''}
                <a class="entry-name" href="${gSearch(item.name)}" target="_blank" rel="noopener">${esc(item.name)}</a>${freeTag(item)}
                ${item.note ? `<p class="entry-note">${esc(item.note)}</p>` : ''}
                ${age !== null ? `<span class="age">${age} years & counting</span>` : ''}
            </div>
            <div class="entry-actions">
                <a class="btn-site" href="${esc(site)}" target="_blank" rel="noopener">Site ↗</a>
                <button type="button" class="been-btn" data-action="been" aria-pressed="${been}" title="Been there?" aria-label="Mark ${esc(item.name)} as been there">✓</button>
            </div>
            <span class="been-stamp" aria-hidden="true">BEEN THERE</span>
        </li>`;
    };
    let html = '<ul class="entries single ranked">';
    let rank = 0;
    data.items.forEach((item, idx) => {
        if (item.header) { html += `<li class="entry-header"><h3>${esc(item.header)}</h3></li>`; return; }
        rank++;
        html += row(item, idx, rank, rank);
    });
    html += '</ul>';
    if (data.honorableMentions?.length) {
        html += `<div class="honorable"><ul class="entries single ranked">
            <li class="entry-header"><h3>Honorable Mentions</h3></li>
            ${data.honorableMentions.map((item, j) => row(item, `hm${j}`, null, j)).join('')}
        </ul></div>`;
    }
    return html;
}

function renderEvents(key, data) {
    const now = new Date().getMonth() + 1;
    const byMonth = {};
    data.items.forEach((item, idx) => {
        if (!item.name) return;
        (byMonth[item.monthIndex] ||= []).push({ item, idx });
    });
    const months = Object.keys(byMonth).map(Number).sort((a, b) => a - b);
    return `<div class="months">${months.map(m => `
        <section class="month-card ${m === now ? 'now' : ''}">
            ${m === now ? '<span class="now-note">you are here ↓</span>' : ''}
            <h3>${MONTHS[m] || 'Sometime'} <small>${byMonth[m].length} EVENT${byMonth[m].length > 1 ? 'S' : ''}</small></h3>
            <ul>${byMonth[m].map(({ item, idx }) => `
                <li id="e-${slugOf(key)}-${idx}" class="entry-lite">
                    <a href="${gSearch(item.name)}" target="_blank" rel="noopener">${esc(item.name)}</a>${freeTag(item)}
                    <a class="btn-site" href="${esc(item.url || gLucky(item.name))}" target="_blank" rel="noopener">↗</a>
                </li>`).join('')}
            </ul>
        </section>`).join('')}
    </div>`;
}

function renderTimeline(key, data) {
    let html = '<ol class="timeline">';
    let side = 0;
    let i = 0;
    data.items.forEach((item, idx) => {
        if (item.header) { html += `<li class="tl-era"><span>${esc(item.header)}</span></li>`; side = 0; return; }
        html += `
        <li class="tl-item ${side++ % 2 ? 'right' : 'left'}" id="e-${slugOf(key)}-${idx}" style="--i:${Math.min(i++, 40)}">
            <div class="tl-card">
                <div class="tl-year">${esc(item.name)}</div>
                ${item.note ? `<p>${esc(item.note)}</p>` : ''}
            </div>
        </li>`;
    });
    return html + '</ol>';
}

// ---------------------------------------------------------------
// GATHERED LISTS  (#/p/<id>) — entries pulled from across the wiki
// ---------------------------------------------------------------
export function renderPreset(id) {
    const p = PRESETS[id];
    if (!p) return renderHome();
    state.currentCategory = '';
    const sections = presetSections(id);
    const n = sections.reduce((s, x) => s + x.entries.length, 0);
    let i = 0;
    const list = sections.map(s => `
        <li class="entry-header"><h3><a href="${catHref(s.cat)}">${emojiOf(s.cat)} ${esc(s.header)} →</a></h3></li>
        ${s.entries.map(e => entryHTML(e.cat, e.item, e.idx, { i: i++ })).join('')}`).join('');

    content().innerHTML = `
    <div class="view cat-page">
        <nav class="crumbs" aria-label="Breadcrumb">
            <a class="back-btn" href="#/">← INDEX</a>
            <span class="crumb-trail">/ ${esc(p.title)}</span>
        </nav>

        <header class="cat-hero">
            <div class="ch-emoji" aria-hidden="true">${p.emoji}</div>
            <h2 class="cat-title">${esc(p.title)}</h2>
            <div class="cat-sub">
                <span class="stamp ink">${n} entries</span>
                <span class="stamp">from ${sections.length} lists</span>
            </div>
        </header>
        <p class="cat-desc">${esc(p.desc)}</p>

        <div class="cat-body"><ul class="entries">${list}</ul></div>
    </div>`;
}

// ---------------------------------------------------------------
// DINING TABLE
// ---------------------------------------------------------------
function diningShell() {
    return `
    <div class="dining-tools">
        <div class="dining-top">
            <input type="search" id="diningText" class="text-input" placeholder="filter by name, dish, cuisine…" autocomplete="off" value="${esc(state.filters.text)}" aria-label="Filter restaurants">
            <button type="button" class="btn-map" data-action="pick-cat">🎲 Pick for me</button>
        </div>
        <div id="diningChips"></div>
    </div>
    <div id="diningTable"></div>`;
}

function diningFiltered() {
    const f = state.filters;
    const q = f.text.trim().toLowerCase();
    return wikiData["Dining Directory"].items
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => item.name && !item.header)
        .filter(({ item }) => !f.cuisine.length || f.cuisine.includes(item.cuisine))
        .filter(({ item }) => !f.price.length || f.price.includes(item.price))
        .filter(({ item }) => !f.area.length || f.area.includes(areaOf(item.location)))
        .filter(({ item }) => !q || [item.name, item.dish, item.cuisine, item.location].join(' ').toLowerCase().includes(q));
}

function renderDining(clearForFocus = false) {
    if (clearForFocus) state.filters = { cuisine: [], price: [], area: [], text: '' };
    renderDiningChips();
    renderDiningTable();
}

function renderDiningChips() {
    const all = realItems("Dining Directory");
    const tally = (fn) => { const o = {}; all.forEach(i => { const v = fn(i); if (v) o[v] = (o[v] || 0) + 1; }); return o; };
    const cuisines = tally(i => i.cuisine);
    const prices = tally(i => i.price);
    const areas = tally(i => areaOf(i.location));
    const f = state.filters;
    const chips = (type, obj, sortFn) => Object.keys(obj).sort(sortFn).map(v =>
        `<button type="button" class="filter-chip ${f[type].includes(v) ? 'active' : ''}" data-action="filter" data-type="${type}" data-value="${esc(v)}">${esc(v)} <small>${obj[v]}</small></button>`).join('');
    const has = f.cuisine.length || f.price.length || f.area.length || f.text;

    document.getElementById('diningChips').innerHTML = `
        <div class="filter-group"><span class="filter-label">Price</span>${chips('price', prices, (a, b) => a.length - b.length)}</div>
        <div class="filter-group"><span class="filter-label">Cuisine</span>${chips('cuisine', cuisines)}</div>
        <div class="filter-group scroll"><span class="filter-label">Area</span>${chips('area', areas)}</div>
        <div class="dining-foot">
            <div class="toggle-group">
                ${['location', 'cuisine', 'dish'].map(c => `<label><input type="checkbox" data-action="col" data-col="${c}" ${state.visibleCols[c] ? 'checked' : ''}> ${c}</label>`).join('')}
            </div>
            <div>
                ${has ? `<button type="button" class="filter-clear" data-action="clear-filters">clear filters</button>` : ''}
                <span class="filter-count" id="diningCount"></span>
            </div>
        </div>`;
}

function renderDiningTable() {
    const rows = diningFiltered();
    const { col, asc } = state.tableSort;
    const val = (item) => {
        if (col === 'price') return (item.price || '').length;
        if (col === 'location') return areaOf(item.location).toLowerCase();
        return String(item[col] || '').toLowerCase();
    };
    rows.sort((a, b) => {
        const A = val(a.item), B = val(b.item);
        if (A < B) return asc ? -1 : 1;
        if (A > B) return asc ? 1 : -1;
        return a.item.name.localeCompare(b.item.name);
    });
    const vc = state.visibleCols;
    const th = (c, label) => `<th scope="col" data-action="sort" data-col="${c}" aria-sort="${col === c ? (asc ? 'ascending' : 'descending') : 'none'}">${label} <span class="arrow">${col === c ? (asc ? '↓' : '↑') : ''}</span></th>`;

    const count = document.getElementById('diningCount');
    if (count) count.textContent = `${rows.length} result${rows.length !== 1 ? 's' : ''}`;

    document.getElementById('diningTable').innerHTML = rows.length ? `
    <div class="zine-table-container">
        <table class="zine-table">
            <thead><tr>
                ${th('name', 'Name')}${th('price', 'Price')}
                ${vc.dish ? th('dish', 'Dish') : ''}${vc.location ? th('location', 'Location') : ''}${vc.cuisine ? th('cuisine', 'Cuisine') : ''}
            </tr></thead>
            <tbody>
                ${rows.map(({ item, idx }) => `
                <tr id="e-${slugOf('Dining Directory')}-${idx}">
                    <td><a href="${esc(item.url || gLucky(item.name))}" target="_blank" rel="noopener" class="table-link">${esc(item.name)}</a></td>
                    <td data-label="Price"><span class="price-tag">${esc(item.price || '')}</span></td>
                    ${vc.dish ? `<td data-label="Dish">${esc(item.dish || '')}</td>` : ''}
                    ${vc.location ? `<td data-label="Where">${esc((item.location || '').trim())}</td>` : ''}
                    ${vc.cuisine ? `<td data-label="Cuisine"><span class="cuisine-tag">${esc(item.cuisine || '')}</span></td>` : ''}
                </tr>`).join('')}
            </tbody>
        </table>
    </div>` : `<div class="empty-note">nothing matches. loosen up a little. ¯\\_(ツ)_/¯</div>`;
}

export function onDiningText(value) {
    state.filters.text = value;
    const clear = !!(state.filters.cuisine.length || state.filters.price.length || state.filters.area.length || value);
    if (!!document.querySelector('.filter-clear') !== clear) renderDiningChips();
    renderDiningTable();
}

export function toggleFilter(type, value) {
    const arr = state.filters[type];
    const i = arr.indexOf(value);
    if (i > -1) arr.splice(i, 1); else arr.push(value);
    renderDiningChips();
    renderDiningTable();
}

export function clearFilters() {
    state.filters = { cuisine: [], price: [], area: [], text: '' };
    const t = document.getElementById('diningText');
    if (t) t.value = '';
    renderDiningChips();
    renderDiningTable();
}

export function sortTable(column) {
    if (state.tableSort.col === column) state.tableSort.asc = !state.tableSort.asc;
    else { state.tableSort.col = column; state.tableSort.asc = true; }
    state.savePrefs();
    renderDiningTable();
}

export function toggleCol(column) {
    state.visibleCols[column] = !state.visibleCols[column];
    state.savePrefs();
    renderDiningTable();
}

// ---------------------------------------------------------------
// BEEN THERE
// ---------------------------------------------------------------
export function onBeenClick(btn) {
    const entry = btn.closest('.entry');
    if (!entry) return;
    const { cat, name } = entry.dataset;
    const on = toggleBeen(cat, name);
    entry.classList.toggle('is-been', on);
    btn.setAttribute('aria-pressed', on);
    if (on) {
        entry.classList.remove('just-stamped');
        void entry.offsetWidth;
        entry.classList.add('just-stamped');
        sfx.stamp();
    }
    const n = countOf(cat);
    const b = beenCount(cat, wikiData[cat].items);
    const num = document.getElementById('beenNum');
    const bar = document.getElementById('beenBar');
    if (num) num.textContent = b;
    if (bar) bar.style.width = `${Math.round(b / n * 100)}%`;
}

// ---------------------------------------------------------------
// SURPRISE / PICK
// ---------------------------------------------------------------
let lastPickSource = null;

export function surprisePick(cat = null) {
    lastPickSource = cat;
    let entry;
    if (cat === 'Dining Directory') {
        const pool = diningFiltered();
        const pick = pool.length ? rand(pool) : rand(realItems(cat).map((item) => ({ item, idx: wikiData[cat].items.indexOf(item) })));
        entry = { cat, idx: pick.idx, item: pick.item };
    } else if (cat) {
        const items = wikiData[cat].items.map((item, idx) => ({ item, idx })).filter(x => x.item.name && !x.item.header);
        const pick = rand(items);
        entry = { cat, idx: pick.idx, item: pick.item };
    } else {
        entry = randomEntry();
    }
    const { item } = entry;
    const site = item.url || gLucky(item.name);
    const sub = item.note || item.dish || [item.cuisine, item.location].filter(Boolean).join(' · ') || (item.year ? `Est. ${item.year}` : '') || (item.month ? `Every ${item.month}` : '');
    document.getElementById('pickBody').innerHTML = `
        <div class="pick-emoji">${emojiOf(entry.cat)}</div>
        <div class="pick-cat">${esc(entry.cat)}</div>
        <div class="pick-name">${esc(item.name)}</div>
        ${sub ? `<div class="pick-note">${esc(sub)}</div>` : ''}
        <div class="pick-links">
            <a class="btn-map" href="${gSearch(item.name)}" target="_blank" rel="noopener">Google it</a>
            <a class="btn-map" href="${esc(site)}" target="_blank" rel="noopener">Site ↗</a>
            ${entry.cat !== 'Louisville History Timeline' ? `<a class="btn-map" href="${catHref(entry.cat, entry.idx)}" data-close>Find in wiki →</a>` : ''}
        </div>`;
    sfx.pop();
    openModal('pickModal');
}

export function pickAgain() { surprisePick(lastPickSource); }

// Legacy globals (bookmarklets / old inline handlers)
Object.assign(window, { renderTOC: () => { location.hash = '#/'; }, renderList: (k) => { location.hash = catHref(k); }, sortTable, toggleCol, toggleTheme, toggleFilter, clearFilters });

export { catHref, $ };
