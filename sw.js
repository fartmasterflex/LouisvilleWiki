// The Louisville Wiki — offline support.
//
// Pages, scripts, styles and the data file are fetched NETWORK-FIRST: online,
// you always get the latest deploy (so a stale main.js can never blank the
// page again, the reason the old caching worker was removed); offline, the
// last copy saved here is served instead. Vendored libraries, fonts, icons and
// billboard ads change rarely and are served CACHE-FIRST.
//
// Bump VERSION to drop every old cache on the next visit.
const VERSION = '2026-11-01a';
const CACHE = `louwiki-${VERSION}`;

// The shell: enough to open the wiki, browse every list and search with no signal
const SHELL = [
    './',
    './index.html',
    './style.css',
    './library_data.js',
    './manifest.json',
    './icon-192.png',
    './js/main.js', './js/ui.js', './js/data.js', './js/utils.js', './js/state.js', './js/search.js',
    './js/bracket.js', './js/crawl.js', './js/walk.js', './js/slot.js', './js/bingo.js', './js/map.js',
    './js/easter_eggs.js', './js/secrets.js', './js/audio.js', './js/ads.js', './js/coordinates.js',
    './js/monthly.js', './js/monthly-core.js', './data/bracket/2026-11.json',
    './vendor/fonts/fonts.css',
    './vendor/fonts/archivo-black-latin-400-normal.woff2',
    './vendor/fonts/space-mono-latin-400-normal.woff2',
    './vendor/fonts/space-mono-latin-700-normal.woff2',
];

const CACHE_FIRST = /\/(vendor|ads)\/|\/icon-\d+\.png$|\/og-image\.png$/;

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE)
            // one missing file must not stop the worker from installing
            .then(c => Promise.all(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => { }))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    // only this site's own files; map tiles, giscus and search links go straight to the network
    if (url.origin !== self.location.origin) return;

    if (CACHE_FIRST.test(url.pathname)) {
        event.respondWith(
            caches.match(req).then(hit => hit || fetch(req).then(res => {
                if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
                return res;
            }))
        );
        return;
    }

    event.respondWith(
        fetch(req).then(res => {
            if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
            return res;
        }).catch(() =>
            // ignoreSearch: main.js?v=… still matches the cached main.js
            caches.match(req, { ignoreSearch: true }).then(hit =>
                hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
        )
    );
});
