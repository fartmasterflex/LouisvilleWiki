// --- js/easter_eggs.js ---

// -----------------------------------------------
// BOAT RACE (secret footer button)
// -----------------------------------------------
export function startBoatRace() {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const raceHtml = `
        <div id="raceModal" class="modal-overlay" style="display:flex;">
            <div class="modal-box" style="width:90%; max-width:500px; text-align:center; background:#fff; color:#000;">
                <div class="modal-close" onclick="this.parentElement.parentElement.remove()">×</div>
                <h2 style="margin-top:0;">THE GREAT STEAMBOAT RACE</h2>
                <p style="font-size:0.8rem; font-weight:bold;">${isMobile ? 'TAP THE BUTTON BELOW TO ROW!' : 'MASH THE \'SPACE\' KEY TO BEAT CINCINNATI!'}</p>
                <div id="raceTrack" style="border:4px solid #000; height:120px; position:relative; overflow:hidden; background:cyan; margin:20px 0; border-radius:10px; user-select:none; -webkit-user-select:none;">
                    <div id="playerBoat" style="position:absolute; left:0; top:20px; font-size:40px; transition: left 0.1s linear; z-index:2; transform: scaleX(-1);">🚢</div>
                    <div id="rivalBoat" style="position:absolute; left:0; top:65px; font-size:40px; transition: left 0.1s linear; opacity:0.7; z-index:1; transform: scaleX(-1);">🚤</div>
                    <div style="position:absolute; right:0; top:0; bottom:0; width:15px; background:red; border-left:2px dashed white; z-index:3;"></div>
                </div>
                <div id="raceStatus" style="font-weight:900; font-size:1.2rem; min-height:1.5em;">READY... SET...</div>
                ${isMobile ? '<button id="rowButton" style="width:100%; padding:18px; font-size:1.3rem; font-weight:900; background:#F5C518; border:3px solid #000; border-radius:10px; cursor:pointer; margin-top:10px; user-select:none; -webkit-user-select:none;">🚢 ROW! ROW! ROW! 🚢</button>' : ''}
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', raceHtml);

    let playerPos = 0; let rivalPos = 0; let racing = false;
    const finishLine = 380;

    setTimeout(() => { document.getElementById('raceStatus').innerText = "GO GO GO!"; racing = true; }, 1500);

    const rivalDrive = setInterval(() => {
        if (!racing) return;
        rivalPos += Math.random() * 14;
        const rBoat = document.getElementById('rivalBoat');
        if (rBoat) rBoat.style.left = rivalPos + 'px';
        if (rivalPos > finishLine) {
            racing = false;
            document.getElementById('raceStatus').innerText = "CINCINNATI WON. DISGRACEFUL.";
            clearInterval(rivalDrive);
        }
    }, 100);

    function movePlayer() {
        if (!racing) return;
        playerPos += 12;
        const pBoat = document.getElementById('playerBoat');
        if (pBoat) pBoat.style.left = playerPos + 'px';
        if (playerPos > finishLine) {
            racing = false;
            document.getElementById('raceStatus').innerText = "THE BELLE WINS! CHAMPION OF THE OHIO!";
            document.getElementById('raceStatus').style.color = "green";
            clearInterval(rivalDrive);
            window.removeEventListener('keydown', raceHandler);
        }
    }

    const raceHandler = function (e) {
        if (e.code === "Space" && racing) { e.preventDefault(); movePlayer(); }
    };
    window.addEventListener('keydown', raceHandler);

    const rowBtn = document.getElementById('rowButton');
    if (rowBtn) {
        rowBtn.addEventListener('touchstart', function (e) { e.preventDefault(); movePlayer(); });
        rowBtn.addEventListener('mousedown', function (e) { e.preventDefault(); movePlayer(); });
    }

    const raceTrack = document.getElementById('raceTrack');
    if (raceTrack && isMobile) {
        raceTrack.addEventListener('touchstart', function (e) { e.preventDefault(); movePlayer(); });
    }

    const checkClosed = setInterval(() => {
        if (!document.getElementById('raceModal')) {
            window.removeEventListener('keydown', raceHandler);
            clearInterval(rivalDrive);
            clearInterval(checkClosed);
        }
    }, 500);
}

window.startBoatRace = startBoatRace;

// -----------------------------------------------
// FLEUR-DE-LIS RAIN (click title 5x)
// — More fleurs, longer animation
// -----------------------------------------------
let titleClickCount = 0;
let titleClickTimer = null;

export function titleClick() {
    titleClickCount++;
    clearTimeout(titleClickTimer);
    titleClickTimer = setTimeout(() => { titleClickCount = 0; }, 1000);
    if (titleClickCount >= 5) {
        titleClickCount = 0;
        startFleurRain();
    }
}

function startFleurRain() {
    if (document.getElementById('fleurCanvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'fleurCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 150 fleurs, varied sizes and speeds
    const fleurs = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: -40 - Math.random() * canvas.height * 1.5,
        size: 14 + Math.random() * 38,
        speed: 1.2 + Math.random() * 4,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.05,
        wobbleAmp: 0.5 + Math.random() * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.06,
        opacity: 0.5 + Math.random() * 0.5,
    }));

    // Run for 600 frames (~10 seconds at 60fps) then fade
    let frame = 0;
    const totalFrames = 600;
    const colors = ['#eaff00', '#ffffff', '#c8a400', '#fffbe6', '#111111'];

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fleurs.forEach((f, i) => {
            f.y += f.speed;
            f.wobble += f.wobbleSpeed;
            f.rotation += f.rotSpeed;
            f.x += Math.sin(f.wobble) * f.wobbleAmp;

            ctx.save();
            ctx.globalAlpha = f.opacity;
            ctx.translate(f.x, f.y);
            ctx.rotate(f.rotation);
            ctx.font = `${f.size}px serif`;
            ctx.fillStyle = colors[i % colors.length];
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('\u269C', 0, 0);
            ctx.restore();

            if (f.y > canvas.height + 40) {
                f.y = -40;
                f.x = Math.random() * canvas.width;
            }
        });

        frame++;
        if (frame < totalFrames) {
            requestAnimationFrame(draw);
        } else {
            let alpha = 1;
            const fadeOut = setInterval(() => {
                alpha -= 0.04;
                canvas.style.opacity = Math.max(0, alpha);
                if (alpha <= 0) { clearInterval(fadeOut); canvas.remove(); }
            }, 30);
        }
    }

    draw();
}

window.titleClick = titleClick;

// -----------------------------------------------
// GLOBAL PRESS & HOLD (3 sec) → Hidden Gems
// Works on mouse and touch anywhere on the page
// -----------------------------------------------
let globalHoldTimer = null;
let holdDidFire = false;

function startGlobalHold() {
    holdDidFire = false;
    globalHoldTimer = setTimeout(() => {
        holdDidFire = true;
        openHiddenGems();
    }, 3000);
}

function cancelGlobalHold() {
    if (globalHoldTimer) {
        clearTimeout(globalHoldTimer);
        globalHoldTimer = null;
    }
}

// Attach to document — fires on any press/touch
document.addEventListener('mousedown', startGlobalHold);
document.addEventListener('mouseup', cancelGlobalHold);
document.addEventListener('mousemove', cancelGlobalHold);
document.addEventListener('touchstart', startGlobalHold, { passive: true });
document.addEventListener('touchend', cancelGlobalHold);
document.addEventListener('touchmove', cancelGlobalHold, { passive: true });

const hiddenGems = [
    { name: "Hillerich & Bradsby Factory Tour", note: "See Louisville Sluggers get made by hand. Free tour, wildly underrated." },
    { name: "Butchertown Market", note: "Tiny indoor market tucked off Story Ave. Worth the detour every time." },
    { name: "Cave Hill Cemetery", note: "Final resting place of Colonel Sanders & George Rogers Clark. Also genuinely beautiful." },
    { name: "The Nachbar", note: "Tiny Germantown dive with the best jukebox in the city. Cash only." },
    { name: "Paristown Pointe", note: "Emerging arts district with murals, live music, and zero tourist foot traffic." },
    { name: "Louisville Waterfront Park at Dawn", note: "The Big Four Bridge at sunrise with nobody on it is a different city entirely." },
    { name: "Sunergos Coffee (Berry Blvd)", note: "Better than the downtown location. Locals know." },
    { name: "Iroquois Amphitheater", note: "Outdoor concerts in a hollow in the middle of the park. Absurdly good vibes." },
    { name: "The Silver Dollar", note: "Honky-tonk bar on Frankfort Ave that should be twice as famous as it is." },
    { name: "Shawnee Park Boat Ramp", note: "Underrated West End park with a direct Ohio River view and real history." },
    { name: "Hadley Pottery", note: "Handmade Louisville pottery since 1940. The rooster mugs are iconic." },
    { name: "Mellwood Arts Center", note: "Massive converted industrial building full of artist studios. First Fridays only." },
];

function openHiddenGems() {
    const list = document.getElementById('hiddenGemsList');
    if (list) {
        list.innerHTML = hiddenGems.map(g => `
            <li>
                <div class="item-left">
                    <span class="item-name">${g.name}</span>
                    ${g.note ? `<div class="item-note">${g.note}</div>` : ''}
                </div>
            </li>`).join('');
    }
    if (typeof openModal === 'function') openModal('hiddenGemsModal');
}

// -----------------------------------------------
// SUBTITLE CLICK x3 → Churchill Downs Moment
// Horses face left (direction of travel), Call to Post audio
// -----------------------------------------------
let subtitleClickCount = 0;
let subtitleClickTimer = null;

export function subtitleClick() {
    subtitleClickCount++;
    clearTimeout(subtitleClickTimer);
    subtitleClickTimer = setTimeout(() => { subtitleClickCount = 0; }, 1000);
    if (subtitleClickCount >= 3) {
        subtitleClickCount = 0;
        startChurchillMoment();
    }
}

function startChurchillMoment() {
    if (document.getElementById('churchillOverlay')) return;

    // --- Call to Post audio via Web Audio API (bugle fanfare tones) ---
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            const actx = new AudioCtx();
            // Classic "Call to Post" note sequence (approximate pitches in Hz)
            const notes = [
                { f: 523.25, t: 0.0,  d: 0.3  },
                { f: 659.25, t: 0.25, d: 0.3  },
                { f: 783.99, t: 0.5,  d: 0.35 },
                { f: 659.25, t: 0.85, d: 0.2  },
                { f: 783.99, t: 1.05, d: 0.4  },
                { f: 880.00, t: 1.45, d: 0.5  },
                { f: 783.99, t: 1.95, d: 0.25 },
                { f: 659.25, t: 2.2,  d: 0.25 },
                { f: 783.99, t: 2.45, d: 0.6  },
            ];
            notes.forEach(({ f, t, d }) => {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.type = 'sawtooth';
                osc.frequency.value = f;
                gain.gain.setValueAtTime(0, actx.currentTime + t);
                gain.gain.linearRampToValueAtTime(0.18, actx.currentTime + t + 0.03);
                gain.gain.linearRampToValueAtTime(0, actx.currentTime + t + d);
                osc.start(actx.currentTime + t);
                osc.stop(actx.currentTime + t + d + 0.05);
            });
        }
    } catch(e) { /* audio not available, silent fallback */ }

    const overlay = document.createElement('div');
    overlay.id = 'churchillOverlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 9998; overflow: hidden;
    `;
    document.body.appendChild(overlay);

    // Flash
    const flash = document.createElement('div');
    flash.style.cssText = `
        position:absolute; inset:0;
        background: linear-gradient(135deg, #c8102e 0%, #fff 50%, #f5c518 100%);
        opacity: 0; transition: opacity 0.2s;
    `;
    overlay.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '0.25'; }, 10);
    setTimeout(() => { flash.style.opacity = '0'; }, 400);

    // Banner
    const banner = document.createElement('div');
    banner.style.cssText = `
        position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
        background: #c8102e; color: #fff; font-family: 'Courier New', monospace;
        font-weight: 900; font-size: 1.3rem; text-transform: uppercase;
        padding: 12px 30px; border: 4px solid #f5c518;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5); white-space: nowrap;
        transition: top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        letter-spacing: 2px; text-align:center;
    `;
    banner.innerHTML = '🏇 AND THEY\'RE OFF! 🏇<br><span style="font-size:0.75rem; color:#f5c518;">THE GREATEST TWO MINUTES IN SPORTS</span>';
    overlay.appendChild(banner);
    setTimeout(() => { banner.style.top = '40px'; }, 50);

    // Horses — scaleX(1) so they face left (direction of travel = left to right but emoji naturally faces left)
    const horseCount = 7;
    for (let i = 0; i < horseCount; i++) {
        const el = document.createElement('div');
        el.style.cssText = `
            position: absolute;
            font-size: ${20 + i * 2}px;
            top: ${48 + i * 7}%;
            left: -70px;
            transition: left ${1.6 + i * 0.12}s linear;
        `;
        el.textContent = '🐎';
        overlay.appendChild(el);
        setTimeout(() => { el.style.left = (window.innerWidth + 100) + 'px'; }, 150 + i * 60);
    }

    // Confetti
    const colors = ['#c8102e', '#ffffff', '#f5c518', '#000000'];
    for (let i = 0; i < 100; i++) {
        const c = document.createElement('div');
        const size = 5 + Math.random() * 9;
        c.style.cssText = `
            position: absolute;
            width: ${size}px; height: ${size}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -20px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            opacity: ${0.7 + Math.random() * 0.3};
        `;
        overlay.appendChild(c);
        c.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight * 0.7 + Math.random() * 100}px) rotate(${360 + Math.random()*360}deg)`, opacity: 0 }
        ], {
            duration: 1500 + Math.random() * 2000,
            delay: Math.random() * 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        });
    }

    // Cleanup
    setTimeout(() => {
        banner.style.top = '-100px';
        setTimeout(() => overlay.remove(), 600);
    }, 4500);
}

window.subtitleClick = subtitleClick;

// -----------------------------------------------
// FOOTER CLICK → Comic Sans Toggle
// Applies to body + all toc-btn / category-header elements
// -----------------------------------------------
let weirdMode = false;

export function toggleWeird() {
    weirdMode = !weirdMode;
    const comicSans = '"Comic Sans MS", "Comic Sans", cursive';
    const normal = '';

    document.body.style.fontFamily = weirdMode ? comicSans : normal;

    // Force override on elements that have their own font-family set via CSS vars
    const targets = document.querySelectorAll(
        '.toc-btn, .category-header, .list-header, .tools-header, h1, h2, h3, .btn-tool, .btn-map, .btn-site, .slot-box'
    );
    targets.forEach(el => {
        el.style.fontFamily = weirdMode ? comicSans : normal;
    });

    // Re-apply on future renders by patching the CSS variable approach
    if (weirdMode) {
        document.documentElement.style.setProperty('--font-stack', comicSans);
    } else {
        document.documentElement.style.setProperty('--font-stack', "'Courier New', Courier, monospace");
    }

    const btn = document.getElementById('weirdBtn');
    if (btn) btn.style.fontFamily = weirdMode ? comicSans : normal;
}

window.toggleWeird = toggleWeird;

// -----------------------------------------------
// NEON SIGN TOGGLE
// -----------------------------------------------
let neonOn = false;

export function toggleNeon() {
    const title = document.getElementById('wikiTitle');
    const sw = document.getElementById('neon-switch');
    if (!title || !sw) return;

    neonOn = !neonOn;
    sw.classList.toggle('on', neonOn);

    // Clear any running animation classes
    title.classList.remove('neon-on', 'neon-flicker', 'neon-shutoff');

    if (neonOn) {
        // Flicker on, then settle into RGB cycle
        void title.offsetWidth; // force reflow to restart animation
        title.classList.add('neon-flicker');
        title.addEventListener('animationend', () => {
            title.classList.remove('neon-flicker');
            title.classList.add('neon-on');
        }, { once: true });
    } else {
        // Shutoff flicker then back to normal
        void title.offsetWidth;
        title.classList.add('neon-shutoff');
        title.addEventListener('animationend', () => {
            title.classList.remove('neon-shutoff');
            title.style.color = '';
            title.style.textShadow = '';
        }, { once: true });
    }
}

window.toggleNeon = toggleNeon;

// -----------------------------------------------
// IDLE 2 MINUTES → Red Cardinal walks across
// -----------------------------------------------
let idleTimer = null;
let cardinalActive = false;

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(spawnCardinal, 2 * 60 * 1000);
}

function spawnCardinal() {
    if (cardinalActive) return;
    cardinalActive = true;

    const el = document.createElement('div');
    el.style.cssText = `
        position: fixed; bottom: 60px; left: -80px;
        font-size: 52px; z-index: 9997; pointer-events: none;
        transition: left 14s linear;
    `;
    el.textContent = '\uD83D\uDC26';
    el.style.filter = 'sepia(1) saturate(8) hue-rotate(320deg) drop-shadow(0 0 3px #c8102e)';

    el.animate([
        { transform: 'translateY(0px) scaleX(-1)' },
        { transform: 'translateY(-10px) scaleX(-1)' },
        { transform: 'translateY(0px) scaleX(-1)' },
    ], { duration: 350, iterations: Infinity });

    document.body.appendChild(el);
    setTimeout(() => { el.style.left = (window.innerWidth + 120) + 'px'; }, 50);

    setTimeout(() => {
        el.remove();
        cardinalActive = false;
        resetIdleTimer();
    }, 15000);
}

['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
});
resetIdleTimer();
