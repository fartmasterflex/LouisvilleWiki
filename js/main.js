// --- js/main.js ---
// Main entry: router, global event wiring, 3D hero boot.
import { initTheme, toggleTheme, currentTheme, renderHome, renderCategory, onBeenClick, surprisePick, pickAgain, toggleFilter, clearFilters, sortTable, toggleCol, onDiningText } from './ui.js';
import { keyOfSlug } from './data.js';
// Namespace imports for exports newer than 2026-10-10f, so a cached ui.js/data.js can't break module linking
import * as uiNs from './ui.js';
import * as dataNs from './data.js';
import { bindSearch } from './search.js';
import { openBracketSetup, initBracket } from './bracket.js';
import { openCrawlGenerator, generateCrawl } from './crawl.js';
import { openHistoryWalk, generateWalk } from './walk.js';
import { openMonthly } from './monthly.js';
import { openSlotMachine, initSlot } from './slot.js';
import { openBingo, initBingo } from './bingo.js';
import { openCategoryMap } from './map.js';
import { initEasterEggs, setHero, onHeroEgg } from './easter_eggs.js';
import { updateBadge, openStickerBook, resetSecrets } from './secrets.js';
import { setSound } from './audio.js';
import { state } from './state.js';
import { openModal, closeModal, topModal, prefersReducedMotion, store, toast as toastMsg } from './utils.js';

let hero = null;

// ---------------------------------------------------------------
// ROUTER  (#/  ·  #/c/<slug>  ·  #/c/<slug>/<itemIndex>  ·  #/p/<quick-list>)
// ---------------------------------------------------------------
let homeScroll = 0;
let lastRoute = null;

function route() {
    const h = location.hash || '#/';
    const m = h.match(/^#\/c\/([^/]+)(?:\/([^/]+))?/);
    const key = m ? keyOfSlug(decodeURIComponent(m[1])) : null;
    const pm = h.match(/^#\/p\/([^/]+)/);
    const PRESETS = dataNs.PRESETS || {};
    const preset = pm && PRESETS[pm[1]] && uiNs.renderPreset ? pm[1] : null;
    const wasHome = lastRoute === 'home';
    // first paint: jump straight to the right hero size instead of animating
    if (lastRoute === null) {
        document.body.classList.add('no-hero-anim');
        requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('no-hero-anim')));
    }

    if (preset) {
        if (wasHome) homeScroll = scrollY;
        document.body.classList.add('is-compact');
        hero?.setCompact(true);
        uiNs.renderPreset(preset);
        scrollTo({ top: 0, behavior: 'instant' });
        document.title = `${PRESETS[preset].title} · The Louisville Wiki`;
        lastRoute = 'p/' + preset;
    } else if (key) {
        if (wasHome) homeScroll = scrollY;
        document.body.classList.add('is-compact');
        hero?.setCompact(true);
        const raw = m[2];
        const idx = raw === undefined ? null : (/^\d+$/.test(raw) ? +raw : raw);
        renderCategory(key, idx, { afterHero: wasHome });
        if (idx === null) scrollTo({ top: 0, behavior: 'instant' });
        document.title = `${key} · The Louisville Wiki`;
        lastRoute = key;
    } else {
        if (h !== '#/' && h !== '#' && h !== '') history.replaceState(null, '', '#/');
        document.body.classList.remove('is-compact');
        hero?.setCompact(false);
        renderHome();
        bindSearch();
        document.title = 'The Louisville Wiki';
        if (lastRoute && lastRoute !== 'home') requestAnimationFrame(() => scrollTo({ top: homeScroll, behavior: 'instant' }));
        lastRoute = 'home';
    }
}

// ---------------------------------------------------------------
// TOOLS / COMMUNITY
// ---------------------------------------------------------------
const TOOLS = { bracket: openBracketSetup, crawl: openCrawlGenerator, slot: openSlotMachine, bingo: openBingo, walk: openHistoryWalk, monthly: openMonthly };
// The monthly bracket posts votes in its own thread
window.addEventListener('wiki:board', (e) => openGiscus(e.detail));

// One discussion per page. The site lives on a single URL (#/ routes), so
// giscus's "pathname" mapping put every page in the same thread. The home page
// keeps that original thread; each list or gathered page gets its own, keyed
// by a fixed title, e.g. "Louisville Wiki · Dining Directory".
export const GISCUS_PREFIX = 'Louisville Wiki · ';
let giscusTerm = null;
function currentBoard() {
    const h = location.hash || '#/';
    const m = h.match(/^#\/c\/([^/]+)/);
    const key = m ? keyOfSlug(decodeURIComponent(m[1])) : null;
    if (key) return { term: GISCUS_PREFIX + key, title: key };
    const pm = h.match(/^#\/p\/([^/]+)/);
    const p = pm && (dataNs.PRESETS || {})[pm[1]];
    if (p) return { term: GISCUS_PREFIX + p.title, title: p.title };
    return { term: '', title: '' };
}
function openGiscus(override = null) {
    openModal('giscusModal');
    const { term, title } = override || currentBoard();
    document.getElementById('giscusTitle').textContent = title ? `💬 ${title}` : '💬 Community Board';
    document.getElementById('giscusSub').textContent = title
        ? `Tips, corrections and arguments about ${title}. Requires a GitHub account.`
        : 'Discuss Louisville with fellow wiki visitors. Requires a GitHub account.';
    if (giscusTerm === term) return;
    giscusTerm = term;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    Object.entries({
        'data-repo': 'James-baunach/louisville-wiki',
        'data-repo-id': 'R_kgDOVefAWg',
        'data-category': 'Announcements',
        'data-category-id': 'DIC_kwDOVefAWs4DKGrf',
        ...(term ? { 'data-mapping': 'specific', 'data-term': term } : { 'data-mapping': 'pathname' }),
        'data-strict': '0',
        'data-reactions-enabled': '1',
        'data-emit-metadata': '1',
        'data-input-position': 'top',
        'data-theme': currentTheme() === 'dark' ? 'dark' : 'light',
        'data-lang': 'en',
    }).forEach(([k, v]) => s.setAttribute(k, v));
    s.crossOrigin = 'anonymous';
    s.async = true;
    const mount = document.getElementById('giscusMount');
    mount.innerHTML = '';
    mount.appendChild(s);
}

// Share the list's static page (list/<slug>/): it has real titles and previews,
// and its big button opens this interactive version
async function shareList(slug) {
    const url = new URL(`list/${slug}/`, location.href.split('#')[0]).href;
    const title = document.title;
    try {
        if (navigator.share) { await navigator.share({ title, url }); return; }
        await navigator.clipboard.writeText(url);
        toastMsg(`Link copied. It opens a page that previews nicely in texts and posts.`, { kicker: "🔗 SHARE" });
    } catch (e) { /* share sheet dismissed */ }
}

// ---------------------------------------------------------------
// GLOBAL EVENTS
// ---------------------------------------------------------------
document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    switch (a.dataset.action) {
        case 'surprise': surprisePick(); break;
        case 'pick-cat': surprisePick(state.currentCategory); break;
        case 'map': openCategoryMap(state.currentCategory, state.currentCategory === 'Dining Directory' ? uiNs.diningFilteredItems?.() : null); break;
        case 'toggle-filters': uiNs.toggleFiltersDrawer?.(); break;
        case 'been': onBeenClick(a); break;
        case 'filter': toggleFilter(a.dataset.type, a.dataset.value); break;
        case 'clear-filters': clearFilters(); break;
        case 'sort': sortTable(a.dataset.col); break;
        case 'tool': TOOLS[a.dataset.tool]?.(); break;
        case 'giscus': openGiscus(); break;
        case 'share': shareList(a.dataset.slug); break;
        case 'stickers': openStickerBook(); break;
        case 'jump':
            e.preventDefault();
            document.getElementById(a.dataset.target)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
            break;
    }
});

document.addEventListener('change', (e) => {
    if (e.target.matches('input[data-action="col"]')) toggleCol(e.target.dataset.col);
});

document.addEventListener('input', (e) => {
    if (e.target.id === 'diningText') onDiningText(e.target.value);
    // then/now photo slider
    if (e.target.classList.contains('ba-range')) e.target.closest('.ba')?.style.setProperty('--pos', e.target.value + '%');
});

document.addEventListener('keydown', (e) => {
    const typing = e.target && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
    if (e.key === 'Escape' && topModal()) { closeModal(topModal()); return; }
    if (typing || topModal()) return;
    if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        const focus = () => {
            const s = document.getElementById('globalSearch');
            if (!s) return;
            s.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
            s.focus({ preventScroll: true });
        };
        if (document.getElementById('globalSearch')) focus();
        else { location.hash = '#/'; setTimeout(focus, 80); }
    }
});

function bindStatic() {
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    document.getElementById('stickerBookBtn').addEventListener('click', openStickerBook);
    document.getElementById('resetSecretsBtn').addEventListener('click', () => {
        if (confirm('Forget every secret you’ve found?')) resetSecrets();
    });
    document.getElementById('pickAgainBtn').addEventListener('click', pickAgain);
    document.getElementById('crawlAgainBtn').addEventListener('click', generateCrawl);
    document.getElementById('walkAgainBtn').addEventListener('click', generateWalk);

    const soundBtn = document.getElementById('soundBtn');
    const paintSound = () => {
        soundBtn.textContent = state.soundOn ? '🔊 sound on' : '🔇 sound off';
        soundBtn.setAttribute('aria-pressed', state.soundOn);
    };
    soundBtn.addEventListener('click', () => { setSound(!state.soundOn); paintSound(); });
    paintSound();

    // letter spans for the title wiggle
    const lou = document.querySelector('.t-lou');
    if (lou) lou.innerHTML = [...lou.textContent.trim()].map(c => `<span class="ch">${c}</span>`).join('');
}

// ---------------------------------------------------------------
// 3D HERO
// ---------------------------------------------------------------
// Lite 3D: 1x pixels, no bloom, 30 fps. On by itself for Save-Data, slow
// connections, small devices and low battery; the footer chip overrides.
async function wantsLite() {
    const saved = store.get('wikiLite', null);
    if (saved !== null) return saved;
    const c = navigator.connection;
    if (c && (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || ''))) return true;
    if ((navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)) return true;
    try {
        const b = await navigator.getBattery?.();
        if (b && !b.charging && b.level < 0.2) return true;
    } catch (e) { /* no battery API */ }
    return false;
}
let liteOn = false;
function paintLite() {
    const b = document.getElementById('liteBtn');
    if (!b) return;
    b.textContent = liteOn ? '⚡ lite 3D: on' : '⚡ lite 3D: off';
    b.setAttribute('aria-pressed', liteOn);
}

async function initHero() {
    const heroEl = document.getElementById('hero');
    const canvas = document.getElementById('heroCanvas');
    liteOn = await wantsLite();
    paintLite();
    try {
        const { hasWebGL, loadThree } = await import('./three/core.js');
        if (!hasWebGL()) return;
        await loadThree();
        const { createHero } = await import('./three/hero.js');
        hero = createHero({
            canvas,
            container: heroEl,
            night: currentTheme() === 'dark',
            neon: state.neonOn,
            compact: document.body.classList.contains('is-compact'),
            reducedMotion: prefersReducedMotion(),
            lite: liteOn,
            on: {
                egg: onHeroEgg,
                toggleTheme,
                interacted: () => heroEl.classList.add('hint-done'),
            },
        });
        setHero(hero);
        requestAnimationFrame(() => heroEl.classList.add('gl-ready'));
    } catch (e) {
        console.warn('3D hero unavailable — showing the flat skyline.', e);
    }
}

window.addEventListener('wiki:theme', (e) => hero?.setNight(e.detail === 'dark'));

// ---------------------------------------------------------------
// BOOT
// ---------------------------------------------------------------
// Keyboard / screen-reader buttons for the skyline's clickable things
document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-hero]');
    if (!b) return;
    if (b.dataset.hero === 'night') toggleTheme();
    else hero?.act?.(b.dataset.hero);
});

document.getElementById('liteBtn')?.addEventListener('click', () => {
    liteOn = !liteOn;
    store.set('wikiLite', liteOn);
    paintLite();
    // rebuild the scene at the new quality
    if (hero) { hero.dispose(); hero = null; initHero(); }
});

// Offline support (sw.js caches the shell; network-first so deploys show up right away)
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => { }));
}

initTheme();
bindStatic();
initBracket();
initSlot();
initBingo();
initEasterEggs();
updateBadge();
window.addEventListener('hashchange', route);
route();
// The 3D skyline (three.js + the scene, ~700 KB) waits until the page is up and the browser is idle,
// so the lists and search are usable first. The flat skyline shows until then.
const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
if (document.readyState === 'complete') idle(initHero, { timeout: 2500 });
else window.addEventListener('load', () => idle(initHero, { timeout: 2500 }), { once: true });

// Legacy globals for old bookmarks/inline handlers
Object.assign(window, { toggleTheme, openGiscus, openModal, closeModal });
