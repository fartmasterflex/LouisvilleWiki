// --- js/monthly-core.js ---
// Bracket of the Month: the parts shared by the site and tools/tally-bracket.mjs.
// No DOM here, so Node can import it.
//
// How a month works
//   • Everyone gets the same 16 entries, drawn from that month's list with a
//     seed of "YYYY-MM". tools/tally-bracket.mjs freezes them into
//     data/bracket/YYYY-MM.json on the 1st, so later edits to the data can't
//     reshuffle a bracket that's already running.
//   • Four rounds, about a week each (ROUND_DAYS). People pick winners on the
//     site, which turns their picks into a short vote code like
//       #LWB 2026-11 R1 ABBAABAB
//     and they post it in the month's discussion thread (giscus, term
//     "Louisville Wiki · Bracket 2026-11"). One vote per GitHub account per
//     round; a later comment replaces an earlier one.
//   • tools/tally-bracket.mjs (run by .github/workflows/bracket.yml every day)
//     counts the codes for each closed round and writes the winners into the
//     month's JSON. The site reads that file and moves to the next round.
import { wikiData } from '../library_data.js';

// Which list feeds the bracket, by month (1-12). Lists with 16+ entries.
export const MONTH_LISTS = {
    1: "Coffee", 2: "Dining Directory", 3: "Bars & Late Night", 4: "Parks",
    5: "Oldest Restaurants", 6: "Breweries & Distilleries", 7: "Attractions & Outings", 8: "Groceries & Markets",
    9: "Shops & Digging", 10: "Weird & Wonderful", 11: "Dining Directory", 12: "Music, Stage & Screen",
};
export const ROUND_NAMES = ["Sweet 16", "Elite 8", "Final Four", "Championship"];
// Round r (0-3) is open for votes on these days of the month
export const ROUND_DAYS = [[1, 7], [8, 14], [15, 21], [22, 31]];
// The first month with voting; before it, the site shows a preview of this month's field
export const LAUNCH = '2026-11';
export const TERM_PREFIX = 'Louisville Wiki · Bracket ';
export const CODE_RE = /#LWB\s+(\d{4}-\d{2})\s+R([1-4])\s+([AB]{1,8})\b/i;
// Classic seeding: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
const ORDER = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// The month's 16, in seed order (seed 1 first)
export function drawSeeds(month) {
    const m = +month.slice(5);
    const list = MONTH_LISTS[m] || "Dining Directory";
    const names = [...new Set((wikiData[list]?.items || []).filter(i => i.name && !i.header).map(i => i.name))].sort((a, b) => a.localeCompare(b));
    const rnd = mulberry32(hash(month));
    for (let i = names.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [names[i], names[j]] = [names[j], names[i]]; }
    return { list, seeds: names.slice(0, 16) };
}

// A fresh month record (what tools/tally-bracket.mjs saves on day 1)
export function newMonth(month) {
    const { list, seeds } = drawSeeds(month);
    return { month, list, seeds, results: {}, votes: {} };
}

// Matchups for round r (0-3) as [[a, b], ...] of names, or null if the round
// before it hasn't been decided yet. results.R1 = "ABBA…" (A = first-listed won).
export function matchups(rec, r) {
    let field = ORDER.map(n => rec.seeds[n - 1]);
    for (let k = 0; k < r; k++) {
        const res = rec.results?.[`R${k + 1}`];
        if (!res || res.length !== field.length / 2) return null;
        field = field.filter((_, i) => i % 2 === 0).map((a, i) => (res[i] === 'B' ? field[i * 2 + 1] : a));
    }
    const out = [];
    for (let i = 0; i < field.length; i += 2) out.push([field[i], field[i + 1]]);
    return out;
}

// Round open for voting on this date (0-3), or -1
export function roundOn(date = new Date()) {
    const d = date.getDate();
    return ROUND_DAYS.findIndex(([a, b]) => d >= a && d <= b);
}

export const seedOf = (rec, name) => rec.seeds.indexOf(name) + 1;
export const champion = (rec) => { const f = matchups(rec, 3); const r = rec.results?.R4; return f && r ? (r[0] === 'B' ? f[0][1] : f[0][0]) : null; };

// Count vote codes for round r. comments: [{ author, body, createdAt }]
// → { picks: "ABAB…", tally: [[votesA, votesB], …], voters }
export function countVotes(comments, rec, round) {
    const pairs = matchups(rec, round);
    if (!pairs) return null;
    const latest = new Map();
    [...comments].sort((x, y) => new Date(x.createdAt) - new Date(y.createdAt)).forEach(c => {
        const m = String(c.body || '').match(CODE_RE);
        if (!m || m[1] !== rec.month || +m[2] !== round + 1 || m[3].length !== pairs.length) return;
        latest.set(c.author, m[3].toUpperCase());
    });
    const tally = pairs.map(() => [0, 0]);
    for (const code of latest.values()) [...code].forEach((ch, i) => { tally[i][ch === 'B' ? 1 : 0]++; });
    // a tie goes to the better (lower-numbered) seed
    const picks = tally.map(([a, b], i) => (b > a || (b === a && seedOf(rec, pairs[i][1]) < seedOf(rec, pairs[i][0])) ? 'B' : 'A')).join('');
    return { picks, tally, voters: latest.size };
}
