// --- js/utils.js ---
// Small shared helpers: links, escaping, storage, modals, toasts.

export function gSearch(name) { return `https://www.google.com/search?q=${encodeURIComponent(name + ' Louisville')}`; }
export function gLucky(name) { return `https://www.google.com/search?q=${encodeURIComponent(name + ' Louisville')}&btnI=1`; }

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function slugify(str) {
    return String(str).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Deterministic "random" in [-1, 1] from a string, for stable card tilts
export function hashTilt(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return ((h % 1000) / 1000);
}

export const prefersReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// localStorage that never throws (private windows, blocked storage…)
export const store = {
    get(key, fallback = null) {
        try {
            const v = localStorage.getItem(key);
            return v === null ? fallback : JSON.parse(v);
        } catch (e) { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    },
    remove(key) {
        try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    }
};

export function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) { existing.dataset.loaded ? resolve() : existing.addEventListener('load', resolve); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => { s.dataset.loaded = '1'; resolve(); };
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

export function loadCss(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
}

// ---------------------------------------------------------------
// MODALS
// ---------------------------------------------------------------
const modalStack = [];
const closeHandlers = {};

export function onModalClose(id, fn) { closeHandlers[id] = fn; }

export function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    if (!m.hidden && m.classList.contains('open')) return;
    clearTimeout(m._closeTimer);
    m.hidden = false;
    m._returnFocus = document.activeElement;
    // next frame so the transition runs
    requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('open')));
    if (!modalStack.includes(id)) modalStack.push(id);
    document.documentElement.style.overflow = 'hidden';
    const closeBtn = m.querySelector('.modal-close');
    if (closeBtn) setTimeout(() => closeBtn.focus({ preventScroll: true }), 60);
}

export function closeModal(id) {
    const m = document.getElementById(id);
    if (!m || m.hidden) return;
    m.classList.remove('open');
    const idx = modalStack.indexOf(id);
    if (idx > -1) modalStack.splice(idx, 1);
    if (!modalStack.length) document.documentElement.style.overflow = '';
    m._closeTimer = setTimeout(() => { m.hidden = true; }, 320);
    if (closeHandlers[id]) closeHandlers[id]();
    if (m._returnFocus && m._returnFocus.focus) m._returnFocus.focus({ preventScroll: true });
}

export function topModal() { return modalStack[modalStack.length - 1] || null; }

document.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-close]');
    if (closer) {
        const m = closer.closest('.modal');
        if (m) closeModal(m.id);
    }
});

// ---------------------------------------------------------------
// TOASTS
// ---------------------------------------------------------------
export function toast(html, { kicker = '', emoji = '', secret = false, duration = 3800 } = {}) {
    const wrap = document.getElementById('toasts');
    if (!wrap) return;
    const t = document.createElement('div');
    t.className = 'toast' + (secret ? ' secret' : '');
    t.innerHTML = `${emoji ? `<span class="t-emoji">${emoji}</span>` : ''}${kicker ? `<span class="t-kicker">${kicker}</span>` : ''}${html}`;
    wrap.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    const kill = () => {
        t.classList.add('hide');
        setTimeout(() => t.remove(), 350);
    };
    t.addEventListener('click', kill);
    setTimeout(kill, duration);
    // keep the stack short
    while (wrap.children.length > 4) wrap.firstElementChild.remove();
}

// Legacy globals (older inline handlers / bookmarklets)
window.openModal = openModal;
window.closeModal = closeModal;
