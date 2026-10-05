// --- js/search.js ---
// Global search box with keyboard navigation.
import { search, emojiOf, slugOf } from './data.js';
import { escapeHtml as esc } from './utils.js';

let activeIdx = -1;
let debounce = null;
let eggWords = {};

// Easter eggs can register words that do something when "searched"
export function registerSearchEgg(word, fn) { eggWords[word] = fn; }

function highlight(text, q) {
    const safe = esc(text);
    const words = q.trim().split(/\s+/).filter(w => w.length > 1).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!words.length) return safe;
    return safe.replace(new RegExp(`(${words.join('|')})`, 'gi'), '<mark>$1</mark>');
}

export function bindSearch() {
    const input = document.getElementById('globalSearch');
    const box = document.getElementById('searchResults');
    if (!input || !box) return;

    const close = () => { box.hidden = true; input.setAttribute('aria-expanded', 'false'); activeIdx = -1; };

    const render = () => {
        const q = input.value;
        if (q.trim().length < 2) { close(); return; }
        const { cats, hits, total } = search(q);
        let html = '';
        if (cats.length) {
            html += `<div class="sr-group">Categories</div>`;
            html += cats.map(c => `<a class="sr-item" role="option" href="#/c/${slugOf(c)}"><span>${emojiOf(c)}</span><span class="sr-name">${highlight(c, q)}</span></a>`).join('');
        }
        if (hits.length) {
            html += `<div class="sr-group">Places & things · ${total}${total > hits.length ? ` (top ${hits.length})` : ''}</div>`;
            html += hits.map(h => `
                <a class="sr-item" role="option" href="#/c/${slugOf(h.cat)}/${h.idx}">
                    <span aria-hidden="true">${emojiOf(h.cat)}</span>
                    <span class="sr-name">${highlight(h.item.name, q)}</span>
                    <span class="sr-sub">${esc(h.cat)}${h.sub ? ' · ' + esc(String(h.sub)) : ''}</span>
                </a>`).join('');
        }
        const egg = eggWords[q.trim().toLowerCase()];
        if (!html) {
            html = `<div class="sr-empty">Nothing for <b>“${esc(q)}”</b>. ${egg ? 'Though… try pressing <b>Enter</b>.' : 'Try a neighborhood, a dish, or a year.'}</div>`;
        } else if (egg) {
            html = `<div class="sr-empty">psst — press <b>Enter</b>.</div>` + html;
        }
        box.innerHTML = html;
        box.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        activeIdx = -1;
    };

    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(render, 70);
    });

    input.addEventListener('focus', () => { if (input.value.trim().length >= 2) render(); });

    input.addEventListener('keydown', (e) => {
        const items = Array.from(box.querySelectorAll('.sr-item'));
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (box.hidden || !items.length) return;
            e.preventDefault();
            activeIdx = e.key === 'ArrowDown' ? (activeIdx + 1) % items.length : (activeIdx - 1 + items.length) % items.length;
            items.forEach((it, i) => it.classList.toggle('active', i === activeIdx));
            items[activeIdx].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            const egg = eggWords[input.value.trim().toLowerCase()];
            if (egg) { e.preventDefault(); input.value = ''; close(); input.blur(); egg(); return; }
            const target = items[activeIdx] || items[0];
            if (target) { e.preventDefault(); location.hash = target.getAttribute('href'); close(); input.blur(); }
        } else if (e.key === 'Escape') {
            if (!box.hidden) { e.stopPropagation(); close(); } else input.blur();
        }
    });

    box.addEventListener('click', (e) => { if (e.target.closest('.sr-item')) close(); });
}

// Close results when clicking elsewhere (bound once; the search box is re-rendered per visit)
document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('#searchZone')) return;
    const box = document.getElementById('searchResults');
    const input = document.getElementById('globalSearch');
    if (box && !box.hidden) { box.hidden = true; input?.setAttribute('aria-expanded', 'false'); activeIdx = -1; }
});
