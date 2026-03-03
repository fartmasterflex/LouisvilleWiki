// --- js/map.js ---
import { wikiData } from '../library_data.js';
import { openModal } from './utils.js';
import { manualCoords } from './coordinates.js';

let categoryMapInstance = null;
let categoryMarkers = [];

let crawlMapInstance = null;
let crawlMarkers = [];

// Louisville Center
const LOU_LAT = 38.2527;
const LOU_LNG = -85.7585;

// Shared function to geocode a location name
// Checks hardcoded coordinates FIRST, then falls back to Nominatim
async function geocodeLocation(name) {
    // 1. Check hardcoded coordinates first
    if (manualCoords[name]) {
        return { lat: manualCoords[name][0], lng: manualCoords[name][1] };
    }

    // 2. Check sessionStorage cache
    const cacheKey = `geo_${name}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    // 3. Fall back to Nominatim
    try {
        const query = encodeURIComponent(`${name} Louisville KY`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await response.json();

        if (data && data.length > 0) {
            const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            sessionStorage.setItem(cacheKey, JSON.stringify(coords));
            return coords;
        }
    } catch (e) {
        console.error("Geocoding failed for", name, e);
    }
    return null;
}

// --- CATEGORY MAP ---

export async function openCategoryMap(categoryKey) {
    const data = wikiData[categoryKey];
    if (!data || !data.items) return;

    openModal('categoryMapModal');
    document.getElementById('categoryMapTitle').innerText = `${categoryKey} Map`;

    // Initialize map if needed
    if (!categoryMapInstance) {
        categoryMapInstance = L.map('categoryMapContainer').setView([LOU_LAT, LOU_LNG], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors & CARTO'
        }).addTo(categoryMapInstance);
    }

    // Clear existing markers
    categoryMarkers.forEach(m => categoryMapInstance.removeLayer(m));
    categoryMarkers = [];

    // Ensure map displays correctly in modal
    setTimeout(() => categoryMapInstance.invalidateSize(), 100);

    // Get items with their full data (for year/date display)
    const items = data.items.filter(item => item.name && !item.header);

    const bounds = [];

    for (const item of items) {
        const coords = await geocodeLocation(item.name);
        if (coords) {
            // Build popup content — include year if available (for Oldest Restaurants/Landmarks)
            let popupHtml = `<b>${item.name}</b>`;
            if (item.year) {
                popupHtml += `<br><i>Est. ${item.year}</i>`;
            }
            if (item.note) {
                popupHtml += `<br><small>${item.note}</small>`;
            }
            popupHtml += `<br><a href="https://www.google.com/search?q=${encodeURIComponent(item.name + ' Louisville')}" target="_blank">Search</a>`;

            const marker = L.marker([coords.lat, coords.lng])
                .bindPopup(popupHtml)
                .addTo(categoryMapInstance);
            categoryMarkers.push(marker);
            bounds.push([coords.lat, coords.lng]);
        }
    }

    if (bounds.length > 0) {
        categoryMapInstance.fitBounds(bounds, { padding: [30, 30] });
    }
}

// --- DIVE BAR CRAWL MAP ---

export async function initCrawlMap(barNames) {
    const mapContainer = document.getElementById('crawlMap');
    if (!mapContainer) return;

    // Destroy and recreate map to fix refresh issues
    if (crawlMapInstance) {
        crawlMapInstance.remove();
        crawlMapInstance = null;
    }

    crawlMapInstance = L.map('crawlMap').setView([LOU_LAT, LOU_LNG], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors & CARTO'
    }).addTo(crawlMapInstance);

    crawlMarkers = [];

    // Important Leaflet fix for modals
    setTimeout(() => {
        crawlMapInstance.invalidateSize();
    }, 250);

    const bounds = [];
    let polylineCoords = [];

    for (let i = 0; i < barNames.length; i++) {
        const barName = barNames[i];
        if (!barName) continue;

        const coords = await geocodeLocation(barName);
        if (coords) {
            // Create custom numbered icon
            const customIcon = L.divIcon({
                className: 'crawl-marker-icon',
                html: `<div style="background:var(--highlight); color:#000; font-weight:bold; border-radius:50%; width:24px; height:24px; text-align:center; line-height:24px; border:2px solid #000;">${i + 1}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
            });

            const marker = L.marker([coords.lat, coords.lng], { icon: customIcon })
                .bindTooltip(barName, { permanent: true, direction: "top", offset: [0, -10], className: 'crawl-tooltip' })
                .addTo(crawlMapInstance);

            crawlMarkers.push(marker);
            bounds.push([coords.lat, coords.lng]);
            polylineCoords.push([coords.lat, coords.lng]);
        }
    }

    // Draw lines between bars
    if (polylineCoords.length > 1) {
        const line = L.polyline(polylineCoords, { color: '#F5C518', weight: 3, dashArray: '5, 5' }).addTo(crawlMapInstance);
        crawlMarkers.push(line);
    }

    if (bounds.length > 0) {
        crawlMapInstance.fitBounds(bounds, { padding: [50, 50] });
    }
}

window.openCategoryMap = openCategoryMap;
