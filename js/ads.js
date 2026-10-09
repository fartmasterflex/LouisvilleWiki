// --- js/ads.js ---
// Billboard ads for the 3D masthead.
//
// HOW TO ADD AN AD: drop an image into /ads named with the next number —
//   ads/1.png, ads/2.png, ads/3.jpg …
// The billboard counts up from 1 and stops at the first missing number, so
// keep the numbers consecutive (no gaps). Make them ADS.width x ADS.height
// pixels (2:1). Other sizes still work — they're letterboxed, never stretched.

export const ADS = {
    folder: 'ads/',
    width: 1024,
    height: 512,
    seconds: 20,          // time each ad stays up
    max: 99,
    exts: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
};

function tryLoad(src) {
    return new Promise(res => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
    });
}

// ---------------------------------------------------------------
// House ads: drawn on canvas, only shown while /ads is empty
// ---------------------------------------------------------------
const DISPLAY = '"Archivo Black", "Arial Black", Impact, sans-serif';
const MONO = '"Space Mono", "Courier New", monospace';

function dots(x, w, h, color, every = 14) {
    x.fillStyle = color;
    for (let y = 0; y < h; y += every) for (let i = (y / every % 2) * every / 2; i < w; i += every) {
        x.beginPath(); x.arc(i, y, 2.2, 0, 7); x.fill();
    }
}

export function makeHouseAds() {
    const ads = [0, 1].map(() => {
        const c = document.createElement('canvas');
        c.width = ADS.width;
        c.height = ADS.height;
        return c;
    });
    drawHouseAds(ads);
    return ads;
}

export function drawHouseAds([a, b]) {
    const W = ADS.width, H = ADS.height;
    let x = a.getContext('2d');
    x.fillStyle = '#f2eee3'; x.fillRect(0, 0, W, H);
    dots(x, W, H, 'rgba(20,20,20,.08)');
    x.strokeStyle = '#141414'; x.lineWidth = 22; x.strokeRect(11, 11, W - 22, H - 22);
    x.fillStyle = '#141414'; x.fillRect(48, 50, 280, 46);
    x.fillStyle = '#eaff00'; x.font = `700 26px ${MONO}`; x.textBaseline = 'middle'; x.fillText('⚜ WIKI OUTDOOR', 64, 74);
    x.fillStyle = '#eaff00'; x.fillRect(52, 300, 760, 92);
    x.fillStyle = '#141414'; x.font = `120px ${DISPLAY}`; x.textBaseline = 'alphabetic';
    x.fillText('THIS SPACE', 50, 250);
    x.fillText('AVAILABLE', 50, 378);
    x.fillStyle = '#d7263d'; x.font = `700 30px ${MONO}`;
    x.fillText('CALL 502-555-WIKI · ASK FOR FARTMASTER', 52, 448);

    x = b.getContext('2d');
    x.fillStyle = '#eaff00'; x.fillRect(0, 0, W, H);
    dots(x, W, H, 'rgba(20,20,20,.12)', 12);
    x.fillStyle = '#141414'; x.fillRect(0, H - 70, W, 70);
    x.font = `150px ${DISPLAY}`; x.textBaseline = 'alphabetic';
    x.fillText('KEEP', 54, 175);
    x.fillText('LOU', 54, 310);
    x.fillText('WEIRD.', 54, 420);
    x.font = `330px serif`; x.textAlign = 'center';
    x.fillText('⚜', 800, 360);
    x.textAlign = 'left';
    x.fillStyle = '#eaff00'; x.font = `700 26px ${MONO}`;
    x.fillText('A MESSAGE FROM NOBODY IN PARTICULAR', 54, H - 26);
}

let found = null;

// Resolves to the loaded <img> elements, in order. Empty if the folder has none.
export function loadAds() {
    if (found) return found;
    found = (async () => {
        const imgs = [];
        let lastExt = ADS.exts[0];
        for (let n = 1; n <= ADS.max; n++) {
            let img = null;
            // try whatever format the previous ad used first, to keep 404s down
            for (const ext of [lastExt, ...ADS.exts.filter(e => e !== lastExt)]) {
                img = await tryLoad(`${ADS.folder}${n}.${ext}`);
                if (img) { lastExt = ext; break; }
            }
            if (!img) break;
            imgs.push(img);
        }
        return imgs;
    })();
    return found;
}
