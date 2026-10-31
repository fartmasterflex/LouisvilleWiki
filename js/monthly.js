// --- js/monthly.js ---
// Bracket of the Month: the modal. Rules and vote counting live in monthly-core.js.
import { newMonth, matchups, roundOn, monthKey, seedOf, champion, ROUND_NAMES, ROUND_DAYS, TERM_PREFIX, LAUNCH } from './monthly-core.js';
import { openModal, store, toast, escapeHtml as esc } from './utils.js';
import { emojiOf } from './data.js';

let rec = null;          // this month's record (frozen file, or drawn locally until the 1st's freeze lands)
let picks = {};          // { R1: "AB…" } what this visitor picked, saved per month
let preview = false;     // before LAUNCH: show the first field, no voting

async function loadMonth(month) {
    try {
        const res = await fetch(`data/bracket/${month}.json`, { cache: 'no-cache' });
        if (res.ok) return await res.json();
    } catch (e) { /* offline or not frozen yet */ }
    return newMonth(month);
}

export async function openMonthly() {
    const now = monthKey();
    preview = now < LAUNCH;
    const month = preview ? LAUNCH : now;
    if (!rec || rec.month !== month) rec = await loadMonth(month);
    picks = store.get('lwbPicks-' + month, {}) || {};
    render();
    openModal('monthlyModal');
}

function render() {
    const now = new Date();
    const open = preview ? -1 : roundOn(now);
    const [, end] = ROUND_DAYS[open] || [];
    const monthName = new Date(+rec.month.slice(0, 4), +rec.month.slice(5) - 1, 1).toLocaleDateString('en-US', { month: 'long' });
    document.getElementById('monthlyTitle').textContent = `🏆 ${monthName}'s Bracket`;
    document.getElementById('monthlyMeta').innerHTML = `${emojiOf(rec.list)} ${esc(rec.list)} · ${preview ? `the first bracket: voting opens ${esc(monthName)} 1` : open >= 0 ? `${esc(ROUND_NAMES[open])} voting closes ${esc(monthName)} ${Math.min(end, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}` : 'between rounds'}`;

    const champ = champion(rec);
    let html = champ ? `<div class="mb-champ">👑 ${esc(champ)}</div>` : '';
    for (let r = 0; r < 4; r++) {
        const pairs = matchups(rec, r);
        const res = rec.results?.[`R${r + 1}`];
        const votes = rec.votes?.[`R${r + 1}`];
        const live = r === open && pairs && !res;
        let body;
        if (!pairs) body = `<p class="modal-sub">${preview ? `Opens ${esc(monthName)} ${ROUND_DAYS[r][0]}.` : r <= open ? 'Counting the last round’s votes. Check back tomorrow.' : `Opens ${esc(monthName)} ${ROUND_DAYS[r][0]}.`}</p>`;
        else body = `<div class="mb-matches">${pairs.map(([a, b], i) => {
            const mine = (picks[`R${r + 1}`] || '')[i];
            const btn = (name, side) => {
                const won = res && res[i] === side, lost = res && res[i] !== side;
                const v = votes?.[i]?.[side === 'A' ? 0 : 1];
                return `<button type="button" class="mb-pick ${won ? 'won' : ''} ${lost ? 'lost' : ''}" data-mb="${r}:${i}:${side}" aria-pressed="${mine === side}" ${live ? '' : 'disabled'}>
                    <span>${esc(name)}</span><small>#${seedOf(rec, name)}${v !== undefined ? ` · ${v} vote${v === 1 ? '' : 's'}` : ''}</small></button>`;
            };
            return `<div class="mb-match">${btn(a, 'A')}${btn(b, 'B')}</div>`;
        }).join('')}</div>`;
        html += `<section class="mb-round"><h3>${esc(ROUND_NAMES[r])}<small>${res ? 'decided' : live ? 'voting now' : preview && pairs ? `opens ${esc(monthName)} 1` : pairs ? 'up next' : ''}</small></h3>${body}</section>`;
    }
    document.getElementById('monthlyRounds').innerHTML = html;

    // the vote code for the open round, once every matchup has a pick
    const pairs = open >= 0 ? matchups(rec, open) : null;
    const mine = pairs ? (picks[`R${open + 1}`] || '') : '';
    const done = pairs && !rec.results?.[`R${open + 1}`] && mine.length === pairs.length && !mine.includes(' ');
    const box = document.getElementById('monthlyVote');
    box.hidden = !done;
    if (done) document.getElementById('monthlyCode').value = `#LWB ${rec.month} R${open + 1} ${mine}`;
}

document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mb]');
    if (b && !b.disabled) {
        const [r, i, side] = b.dataset.mb.split(':');
        const key = `R${+r + 1}`;
        const n = matchups(rec, +r).length;
        const cur = (picks[key] || ' '.repeat(n)).padEnd(n, ' ').split('');
        cur[+i] = side;
        picks[key] = cur.join('');
        store.set('lwbPicks-' + rec.month, picks);
        render();
        return;
    }
    if (e.target.closest('#monthlyCopy')) {
        const code = document.getElementById('monthlyCode').value;
        navigator.clipboard?.writeText(code).then(() => toast('Vote code copied. Paste it in the thread.'), () => { });
        document.getElementById('monthlyCode').select();
        // the month's own thread on the community board
        window.dispatchEvent(new CustomEvent('wiki:board', { detail: { term: TERM_PREFIX + rec.month, title: `Bracket ${rec.month}` } }));
    }
});
