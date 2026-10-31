# Tools

Small Node scripts (Node 18+, no installs) for keeping the wiki tidy. Run them from the repo root.

| Command | What it does | When |
|:--|:--|:--|
| `node tools/validate.mjs` | Checks `library_data.js` and friends: required fields, neighborhood names, URLs, duplicate entries, event rules, coordinates, closed places, the ad list and bracket files. Errors fail; warnings (like entries with no note) don't. | Before every commit. GitHub runs it on every push and PR. |
| `node tools/stamp-updated.mjs` | Sets each list's `updated:` date. Lists you changed get today; the rest keep the date of their last commit. | After editing lists, before committing. |
| `node tools/build.mjs` | Rebuilds the generated files: `list/<slug>/` static pages, `sitemap.xml`, `robots.txt`, `ads/index.json`, and the Reddit text (`reddit/wiki.md`, `sidebar.md`, `wiki-lite.md`). | GitHub does this on every push to main. Run it locally to preview. |
| `node tools/geocode.mjs` | Looks up map coordinates for entries that don't have any (OpenStreetMap, ~1 per second) and appends them to `js/coordinates.js`. | On your own computer, whenever you add places. Spot-check the new pins on the map. |
| `node tools/tally-bracket.mjs` | Bracket of the Month: freezes the month's 16 and counts vote codes from the discussion thread for closed rounds. Needs the GitHub CLI (`gh`). | GitHub runs it daily (`.github/workflows/bracket.yml`). |

`tools/icon.svg` is the source for `icon-192.png` and `icon-512.png`. Open it in a browser at 512×512 (and again scaled to 192×192) and screenshot it, or render it headlessly, e.g. `msedge --headless --window-size=512,512 --screenshot=icon-512.png tools/icon.svg`. Keep the lily and banner text inside the center circle so maskable icons don't crop them. After changing the icons, bump `VERSION` in `sw.js` so returning visitors get the new ones.

## Data fields worth knowing

All optional unless noted.

- `closed: "2026"` moves an entry off its list and into Lost Louisville → Recently Closed. Nothing is deleted, and old been-there stamps still work.
- `hours: "24/7"`, `patio: true`, `dogs: true`, `kids: true`, `accessible: true | "partial"`, `cash: true`, `late: true` add the practical badges and the Dining "Extras" filters. They're shared across lists, so marking Burger Boy `late` in Bars also shows on its Dining row.
- Events: `when: "plain-English rule"` plus `rule:` for dates the site can compute. Rules: `derby`, `derby-14` (days before the Derby), `easter-1`, `lent`, `nth-sat:6:3` (3rd Saturday of June), `last-mon:7`, `first-fri:10`, `thanksgiving+1`, `date:7:4`.
- Lost Louisville photos: `then: { src, year, credit }` and `now: { src, credit }` add a draggable then/now slider. Use images you have the rights to (public-domain postcards, your own photos). Local paths like `img/lost/fontaine-then.jpg` or https links both work.
- Dining `location` must be one of the neighborhoods in `AREAS` (`js/data.js`). The validator lists them if you typo one.
- Each list has `updated: "YYYY-MM-DD"`, kept current by `stamp-updated.mjs`.
