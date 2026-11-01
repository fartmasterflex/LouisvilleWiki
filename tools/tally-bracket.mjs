// Bracket of the Month: freeze the month's 16 and count votes for closed rounds.
//
//   node tools/tally-bracket.mjs            # this month (and finishes last month's final)
//   node tools/tally-bracket.mjs 2026-11    # one month
//   node tools/tally-bracket.mjs --dry      # print, don't write
//
// Reads the month's giscus discussion ("Louisville Wiki · Bracket YYYY-MM") with
// the GitHub CLI, so it needs `gh` signed in (GitHub Actions provides GH_TOKEN).
// Writes data/bracket/YYYY-MM.json, which the site reads.
import fs from 'fs';
import { execFileSync } from 'child_process';
import { newMonth, matchups, countVotes, ROUND_DAYS, TERM_PREFIX, monthKey } from '../js/monthly-core.js';

const REPO = process.env.BRACKET_REPO || 'FartmasterFlex/LouisvilleWiki';
const DIR = new URL('../data/bracket/', import.meta.url);
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const today = new Date();

function gh(query, vars) {
    const flags = Object.entries(vars).flatMap(([k, v]) => ['-F', `${k}=${v}`]);
    const out = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`, ...flags], { encoding: 'utf8' });
    return JSON.parse(out).data;
}

// Every comment and reply in the month's thread: [{ author, body, createdAt }]
function threadComments(term) {
    const found = gh(`query($q: String!) { search(query: $q, type: DISCUSSION, first: 10) { nodes { ... on Discussion { id title } } } }`,
        { q: `"${term}" repo:${REPO} in:title` });
    const disc = found.search.nodes.find(n => n.title === term);
    if (!disc) return [];
    const out = [];
    let after = null;
    do {
        const d = gh(`query($id: ID!, $after: String) { node(id: $id) { ... on Discussion { comments(first: 100, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes { author { login } body createdAt replies(first: 100) { nodes { author { login } body createdAt } } } } } } }`,
            after ? { id: disc.id, after } : { id: disc.id });
        const c = d.node.comments;
        for (const n of c.nodes) {
            out.push({ author: n.author?.login, body: n.body, createdAt: n.createdAt });
            for (const r of n.replies.nodes) out.push({ author: r.author?.login, body: r.body, createdAt: r.createdAt });
        }
        after = c.pageInfo.hasNextPage ? c.pageInfo.endCursor : null;
    } while (after);
    return out.filter(c => c.author);
}

function closed(month, r) {
    const [y, m] = month.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const end = new Date(y, m - 1, Math.min(ROUND_DAYS[r][1], lastDay), 23, 59, 59);
    return today > end;
}

function run(month) {
    const file = new URL(`${month}.json`, DIR);
    const rec = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : newMonth(month);
    rec.results ||= {}; rec.votes ||= {}; rec.voters ||= {};
    let comments = null;
    for (let r = 0; r < 4; r++) {
        const key = `R${r + 1}`;
        if (rec.results[key] || !closed(month, r) || !matchups(rec, r)) continue;
        comments ||= threadComments(TERM_PREFIX + month);
        const c = countVotes(comments, rec, r);
        rec.results[key] = c.picks;
        rec.votes[key] = c.tally;
        rec.voters[key] = c.voters;
        console.log(`${month} ${key}: ${c.picks} from ${c.voters} voter(s)`);
    }
    if (dry) { console.log(JSON.stringify(rec, null, 2)); return; }
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
}

const explicit = args.find(a => /^\d{4}-\d{2}$/.test(a));
if (explicit) run(explicit);
else {
    const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevKey = monthKey(prev);
    if (fs.existsSync(new URL(`${prevKey}.json`, DIR))) run(prevKey);
    run(monthKey(today));
}
