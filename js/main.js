// --- js/main.js ---
// Main entry: router, global event wiring, 3D hero boot.
import { initTheme, toggleTheme, currentTheme, renderHome, renderCategory, buildTicker, onBeenClick, surprisePick, pickAgain, toggleFilter, clearFilters, sortTable, toggleCol, onDiningText } from './ui.js';
import { keyOfSlug } from './data.js';
import { bindSearch } from './search.js';
import { openBracketSetup, initBracket } from './bracket.js';
import { openCrawlGenerator, generateCrawl } from './crawl.js';
import { openSlotMachine, initSlot } from './slot.js';
import { openBingo, initBingo } from './bingo.js';
import { openCategoryMap } from './map.js';
import { initEasterEggs, setHero, onHeroEgg } from './easter_eggs.js';
import { updateBadge, openStickerBook, resetSecrets } from './secrets.js';
import { setSound } from './audio.js';
import { state } from './state.js';
import { openModal, closeModal, topModal, prefersReducedMotion } from './utils.js';

let hero = null;

// ---------------------------------------------------------------
// ROUTER  (#/  ·  #/c/<slug>  ·  #/c/<slug>/<itemIndex>)
// ---------------------------------------------------------------
let homeScroll = 0;
let lastRoute = null;

function route() {
    const h = location.hash || '#/';
    const m = h.match(/^#\/c\/([^/]+)(?:\/([^/]+))?/);
    const key = m ? keyOfSlug(decodeURIComponent(m[1])) : null;
    const wasHome = lastRoute === 'home';
    // first paint: jump straight to the right hero size instead of animating
    if (lastRoute === null) {
        document.body.classList.add('no-hero-anim');
        requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('no-hero-anim')));
    }

    if (key) {
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
const TOOLS = { bracket: openBracketSetup, crawl: openCrawlGenerator, slot: openSlotMachine, bingo: openBingo };

let giscusLoaded = false;
function openGiscus() {
    openModal('giscusModal');
    if (giscusLoaded) return;
    giscusLoaded = true;
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    Object.entries({
        'data-repo': 'FartmasterFlex/LouisvilleWiki',
        'data-repo-id': 'R_kgDORVhqTg',
        'data-category': 'Announcements',
        'data-category-id': 'DIC_kwDORVhqTs4C4Lr2',
        'data-mapping': 'pathname',
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

// ---------------------------------------------------------------
// GLOBAL EVENTS
// ---------------------------------------------------------------
document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    switch (a.dataset.action) {
        case 'surprise': surprisePick(); break;
        case 'pick-cat': surprisePick(state.currentCategory); break;
        case 'map': openCategoryMap(state.currentCategory); break;
        case 'been': onBeenClick(a); break;
        case 'filter': toggleFilter(a.dataset.type, a.dataset.value); break;
        case 'clear-filters': clearFilters(); break;
        case 'sort': sortTable(a.dataset.col); break;
        case 'tool': TOOLS[a.dataset.tool]?.(); break;
        case 'giscus': openGiscus(); break;
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

    const d = new Date();
    document.getElementById('issueDate').textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

// ---------------------------------------------------------------
// 3D HERO
// ---------------------------------------------------------------
async function initHero() {
    const heroEl = document.getElementById('hero');
    const canvas = document.getElementById('heroCanvas');
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
            on: {
                egg: onHeroEgg,
                toggleTheme,
                interacted: () => heroEl.classList.add('hint-done'),
            },
        });
        setHero(hero);
        requestAnimationFrame(() => heroEl.classList.add('gl-ready'));
    } catch (e) {
        console.warn('3D hero unavailable — showing the print version.', e);
    }
}

window.addEventListener('wiki:theme', (e) => hero?.setNight(e.detail === 'dark'));

// ---------------------------------------------------------------
// BOOT
// ---------------------------------------------------------------
initTheme();
bindStatic();
buildTicker();
initBracket();
initSlot();
initBingo();
initEasterEggs();
updateBadge();
window.addEventListener('hashchange', route);
route();
initHero();

// Legacy globals for old bookmarks/inline handlers
Object.assign(window, { toggleTheme, openGiscus, openModal, closeModal });
