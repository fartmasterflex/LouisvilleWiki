// --- js/map.js ---
// Leaflet maps: category map + crawl route. Manual coordinates first, then a
// polite (rate-limited, cached) Nominatim lookup for anything missing.
import { wikiData, emojiOf } from './data.js';
import { openModal, onModalClose, loadScript, loadCss, store, escapeHtml as esc, gSearch } from './utils.js';

let manualCoords = {};
let coordsReady = import('./coordinates.js')
    .then(m => { manualCoords = m.manualCoords || {}; })
    .catch(e => { console.warn('coordinates.js failed to load — falling back to geocoding only.', e); });

const LOU = [38.2527, -85.7585];
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

function loadLeaflet() {
    loadCss(LEAFLET_CSS);
    return loadScript(LEAFLET_JS);
}

const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
const tileUrl = () => isDark()
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

// ---------------------------------------------------------------
// GEOCODING
// ---------------------------------------------------------------
const GEO_KEY = 'louGeo';
const geoCache = store.get(GEO_KEY, {}) || {};
let lastNominatim = 0;
let geoChain = Promise.resolve();

function cached(name) {
    // null in coordinates.js = "no single location" (a club, a city-wide thing): skip the pin, don't geocode
    if (name in manualCoords) return manualCoords[name] ? { lat: manualCoords[name][0], lng: manualCoords[name][1] } : null;
    if (geoCache[name] !== undefined) return geoCache[name];
    return undefined;
}

// Nominatim asks for max 1 request/second — serialize and space them out
function nominatim(name) {
    geoChain = geoChain.then(async () => {
        const wait = Math.max(0, 1100 - (Date.now() - lastNominatim));
        if (wait) await new Promise(r => setTimeout(r, wait));
        lastNominatim = Date.now();
        try {
            const q = encodeURIComponent(`${name} Louisville KY`);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`);
            const data = await res.json();
            const coords = data && data.length ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
            geoCache[name] = coords;
            store.set(GEO_KEY, geoCache);
            return coords;
        } catch (e) {
            return null;
        }
    });
    return geoChain;
}

export async function geocodeLocation(name) {
    await coordsReady;
    const c = cached(name);
    if (c !== undefined) return c;
    return nominatim(name);
}

function pinIcon(label, dark = false) {
    return L.divIcon({
        className: '',
        html: `<div class="zine-pin ${dark ? 'dark' : ''}">${label}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -14],
    });
}

// ---------------------------------------------------------------
// CATEGORY MAP
// ---------------------------------------------------------------
let catMap = null, catLayer = null, catTiles = null, catToken = 0;

export async function openCategoryMap(categoryKey) {
    const data = wikiData[categoryKey];
    if (!data || !data.items) return;
    const token = ++catToken;
    const status = document.getElementById('mapStatus');
    document.getElementById('categoryMapTitle').textContent = `${emojiOf(categoryKey)} ${categoryKey}`;
    status.textContent = 'loading map…';
    openModal('categoryMapModal');

    try { await loadLeaflet(); } catch (e) { status.textContent = 'map failed to load (offline?)'; return; }
    await coordsReady;
    if (token !== catToken) return;

    if (!catMap) {
        catMap = L.map('categoryMapContainer', { zoomControl: true }).setView(LOU, 12);
        catLayer = L.layerGroup().addTo(catMap);
    }
    if (catTiles) catMap.removeLayer(catTiles);
    catTiles = L.tileLayer(tileUrl(), { attribution: '&copy; OpenStreetMap contributors &amp; CARTO', maxZoom: 19 }).addTo(catMap);
    catLayer.clearLayers();
    setTimeout(() => catMap.invalidateSize(), 120);

    const items = data.items.filter(i => i.name && !i.header);
    const bounds = [];
    const pending = [];
    const add = (item, n, coords) => {
        let html = `<b>${esc(item.name)}</b>`;
        if (item.year) html += `<br><i>Est. ${esc(item.year)}</i>`;
        if (item.note) html += `<br><small>${esc(item.note)}</small>`;
        html += `<br><a href="${gSearch(item.name)}" target="_blank" rel="noopener">Search ↗</a>`;
        if (item.url) html += ` · <a href="${esc(item.url)}" target="_blank" rel="noopener">Site ↗</a>`;
        L.marker([coords.lat, coords.lng], { icon: pinIcon(n, isDark()) }).bindPopup(html).addTo(catLayer);
        bounds.push([coords.lat, coords.lng]);
    };

    items.forEach((item, i) => {
        const c = cached(item.name);
        if (c) add(item, i + 1, c);
        else if (c === undefined) pending.push([item, i + 1]);
    });
    if (bounds.length) catMap.fitBounds(bounds, { padding: [34, 34], maxZoom: 15 });

    if (!pending.length) {
        status.textContent = `${bounds.length}/${items.length} pinned`;
        return;
    }
    let done = 0;
    for (const [item, n] of pending) {
        if (token !== catToken) return;
        status.textContent = `locating ${++done}/${pending.length}…`;
        const c = await nominatim(item.name);
        if (token !== catToken) return;
        if (c) {
            add(item, n, c);
            if (bounds.length <= 3 || done === pending.length) catMap.fitBounds(bounds, { padding: [34, 34], maxZoom: 15 });
        }
    }
    status.textContent = `${bounds.length}/${items.length} pinned`;
}

onModalClose('categoryMapModal', () => { catToken++; });

// ---------------------------------------------------------------
// DIVE BAR CRAWL MAP
// ---------------------------------------------------------------
let crawlMap = null;

export async function initCrawlMap(barNames) {
    try { await loadLeaflet(); } catch (e) { return; }
    const el = document.getElementById('crawlMap');
    if (!el) return;
    if (crawlMap) { crawlMap.remove(); crawlMap = null; }
    crawlMap = L.map('crawlMap', { zoomControl: false, attributionControl: true }).setView(LOU, 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &amp; CARTO' }).addTo(crawlMap);
    setTimeout(() => crawlMap && crawlMap.invalidateSize(), 250);

    const pts = [];
    for (let i = 0; i < barNames.length; i++) {
        if (!barNames[i]) continue;
        const c = await geocodeLocation(barNames[i]);
        if (!c || !crawlMap) continue;
        L.marker([c.lat, c.lng], { icon: pinIcon(i + 1) })
            .bindTooltip(esc(barNames[i]), { permanent: true, direction: 'top', offset: [0, -12], className: 'crawl-tooltip' })
            .addTo(crawlMap);
        pts.push([c.lat, c.lng]);
    }
    if (!crawlMap) return;
    if (pts.length > 1) L.polyline(pts, { color: '#eaff00', weight: 4, dashArray: '2, 9', lineCap: 'round' }).addTo(crawlMap);
    if (pts.length) crawlMap.fitBounds(pts, { padding: [50, 50], maxZoom: 16 });
}

window.openCategoryMap = openCategoryMap;
