// --- js/secrets.js ---
// Registry of easter eggs + "the vault" progress tracker.
import { store, toast, escapeHtml, openModal } from './utils.js';
import { sfx } from './audio.js';

export const SECRETS = [
    { id: 'fleur', emoji: '⚜️', name: 'Fleur Storm', hint: 'The title likes attention. Give it three.' },
    { id: 'derby', emoji: '🏇', name: 'And They’re Off', hint: 'A painted horse is loose on the riverfront. Give it a pat.' },
    { id: 'boat', emoji: '🚢', name: 'Stowaway', hint: 'Something is docked at the very bottom.' },
    { id: 'gems', emoji: '💎', name: 'Hidden Gems', hint: 'Beat Cincinnati on the water.' },
    { id: 'weird', emoji: '🤪', name: 'Kept It Weird', hint: 'Take the footer’s advice.' },
    { id: 'neon', emoji: '💡', name: 'Open Late', hint: 'Every good dive has a switch by the door.' },
    { id: 'cardinal', emoji: '🐦', name: 'State Bird', hint: 'Sit still a minute. Then be quick.' },
    { id: 'thunder', emoji: '🎆', name: 'Thunder', hint: '↑ ↑ ↓ ↓ … you know the rest.' },
    { id: 'gonzo', emoji: '🦇', name: 'Bat Country', hint: 'Type the good doctor’s brand of journalism.' },
    { id: 'ali', emoji: '🦋', name: 'The Greatest', hint: 'Type the Champ’s name. Then catch one.' },
    { id: 'bourbon', emoji: '🥃', name: 'Neat', hint: 'Type what sleeps in the rickhouse.' },
    { id: 'pope', emoji: '🐐', name: 'The Trestle', hint: 'At night, look under the bridge on the hill.' },
    { id: 'bridge', emoji: '🌈', name: 'Light Show', hint: 'The Big Four likes to be poked.' },
    { id: 'belle', emoji: '📯', name: 'All Aboard', hint: 'Say hi to the old steamboat.' },
    { id: 'star', emoji: '🌠', name: 'Make a Wish', hint: 'Night sky. Something streaks by. Catch it.' },
    { id: 'cincy', emoji: '🙃', name: 'Wrong City', hint: 'Type the name of the enemy.' },
    { id: 'skipper', emoji: '🪨', name: 'Six Skipper', hint: 'Skip a stone across the Ohio. Six or better.' },
    { id: '502', emoji: '☎️', name: 'Bad Gateway', hint: 'Dial the area code.' },
    { id: 'highschool', emoji: '🏫', name: 'Two Degrees', hint: 'Type the first thing every Louisvillian asks you. Just the two key words.' },
    { id: 'console', emoji: '🧑‍💻', name: 'View Source', hint: 'Developers: check your console.' },
    { id: 'homerun', emoji: '⚾', name: 'Home Run', hint: 'The world’s biggest bat needs a swing.' }
];

const KEY = 'louSecrets';
let found = store.get(KEY, {}) || {};
const listeners = new Set();

export const isFound = (id) => !!found[id];
export const foundCount = () => SECRETS.filter(s => found[s.id]).length;
export const onSecretsChange = (fn) => listeners.add(fn);

export function unlock(id) {
    const s = SECRETS.find(x => x.id === id);
    if (!s || found[id]) return false;
    found[id] = Date.now();
    store.set(KEY, found);
    const n = foundCount();
    setTimeout(() => {
        sfx.secret();
        toast(`<b>${escapeHtml(s.name)}</b><br><small>${n}/${SECRETS.length} secrets found</small>`, { kicker: 'SECRET FOUND', emoji: s.emoji, secret: true, duration: 4200 });
    }, 250);
    updateBadge();
    listeners.forEach(fn => fn(id, n));
    return true;
}

export function resetSecrets() {
    found = {};
    store.set(KEY, found);
    updateBadge();
    renderStickerBook();
    listeners.forEach(fn => fn(null, 0));
}

export function updateBadge() {
    const n = foundCount();
    const el = document.getElementById('secretCount');
    if (el) el.textContent = `${n}/${SECRETS.length}`;
    const btn = document.getElementById('stickerBookBtn');
    if (btn) btn.firstChild.textContent = n === SECRETS.length ? '🏅 secrets ' : n > 0 ? '🔓 secrets ' : '🔒 secrets ';
    document.querySelectorAll('[data-secret-count]').forEach(e => { e.textContent = `${n}/${SECRETS.length}`; });
}

export function renderStickerBook() {
    const grid = document.getElementById('stickerGrid');
    if (!grid) return;
    const n = foundCount();
    grid.innerHTML = SECRETS.map((s, i) => {
        const f = !!found[s.id];
        const rot = ((i * 37) % 7) - 3;
        return `<div class="egg-sticker ${f ? 'found' : ''}" style="--r:${rot}deg">
            <div class="es-emoji">${f ? s.emoji : '?'}</div>
            <div class="es-name">${f ? escapeHtml(s.name) : '???'}</div>
            <div class="es-hint">${escapeHtml(s.hint)}</div>
        </div>`;
    }).join('');
    const meter = document.getElementById('stickerMeter');
    if (meter) meter.style.width = `${(n / SECRETS.length) * 100}%`;
    const sub = document.getElementById('stickerSub');
    if (sub) {
        sub.textContent = n === 0 ? 'There’s more on this site than meets the eye. Hints below.'
            : n === SECRETS.length ? 'Every last one. You are, officially, a Louisvillian.'
                : `${n} of ${SECRETS.length} found. Keep poking at things.`;
    }
}

export function openStickerBook() {
    renderStickerBook();
    openModal('stickerBookModal');
}
