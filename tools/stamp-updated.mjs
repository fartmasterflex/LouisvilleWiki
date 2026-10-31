// Stamps each list in library_data.js with `updated: "YYYY-MM-DD"`.
//
//   node tools/stamp-updated.mjs
//
// A list whose text differs from the last commit gets today's date. Every
// other list gets the date of the last commit that touched its lines
// (git log -L). Run it before you commit a content change; the validator
// warns when a changed list still carries an old date.
import fs from 'fs';
import { execFileSync } from 'child_process';

const FILE = new URL('../library_data.js', import.meta.url);
const ROOT = new URL('..', import.meta.url).pathname;
const git = (...args) => { try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; } };

const today = new Date().toISOString().slice(0, 10);
const TOP = /^    "(.+?)": \{/;

// [{ name, start, end }] in 1-based line numbers, `updated:` lines excluded from comparisons
function blocks(text) {
    const lines = text.split(/\r?\n/);
    const starts = [];
    lines.forEach((l, i) => { const m = l.match(TOP); if (m) starts.push({ name: m[1], start: i + 1 }); });
    starts.forEach((b, i) => { b.end = i + 1 < starts.length ? starts[i + 1].start - 1 : lines.length - 1; });
    return { lines, list: starts };
}
const body = (lines, b) => lines.slice(b.start - 1, b.end).filter(l => !/^\s+updated: "/.test(l)).join('\n');

const work = fs.readFileSync(FILE, 'utf8');
const EOL = work.includes('\r\n') ? '\r\n' : '\n'; // keep the file's own line endings
const head = git('show', 'HEAD:library_data.js');
const W = blocks(work), H = blocks(head);
const headByName = Object.fromEntries(H.list.map(b => [b.name, b]));

const dates = {};
for (const b of W.list) {
    const hb = headByName[b.name];
    if (!hb || body(W.lines, b) !== body(H.lines, hb)) { dates[b.name] = today; continue; }
    const d = git('log', '-1', '--format=%ad', '--date=short', '-L', `${hb.start},${hb.end}:library_data.js`, 'HEAD', '--no-patch').trim().split('\n')[0];
    dates[b.name] = d || today;
}

// rewrite: drop old `updated:` lines, add a fresh one after each list's `type:` line
let current = null;
const out = [];
for (const line of W.lines) {
    const m = line.match(TOP);
    if (m) current = m[1];
    if (/^        updated: "/.test(line)) continue;
    out.push(line);
    if (current && /^        type: "/.test(line)) {
        out.push(`        updated: "${dates[current]}",`);
        current = null;
    }
}
fs.writeFileSync(FILE, out.join(EOL));
const changed = Object.entries(dates).filter(([, d]) => d === today).map(([k]) => k);
console.log(`Stamped ${W.list.length} lists.` + (changed.length ? ` Changed today: ${changed.join(', ')}` : ''));
