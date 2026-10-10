// --- js/easter_eggs.js ---
// Every secret on the site lives here. See secrets.js for the vault.
import { unlock, isFound, foundCount, SECRETS, onSecretsChange } from './secrets.js';
import { sfx } from './audio.js';
import { toast, openModal, closeModal, onModalClose, escapeHtml, rand, isTouch, prefersReducedMotion } from './utils.js';
import { registerSearchEgg } from './search.js';
import { state } from './state.js';

let hero = null;
export function setHero(h) { hero = h; if (hero && state.neonOn) hero.setNeon(true); }

// Lazy 3D effects with graceful fallbacks
let fxMod = null;
async function fx() {
    if (fxMod) return fxMod;
    try { fxMod = await import('./three/fx.js'); } catch (e) { fxMod = null; }
    return fxMod;
}

function overlay(cls = '') {
    const o = document.createElement('div');
    o.className = 'egg-overlay ' + cls;
    document.body.appendChild(o);
    return o;
}

function banner(parent, html, ms = 4200) {
    const b = document.createElement('div');
    b.className = 'egg-banner';
    b.innerHTML = html;
    parent.appendChild(b);
    requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('in')));
    setTimeout(() => b.classList.remove('in'), ms);
    return b;
}

// DOM confetti fallback (no WebGL)
function domConfetti(colors = ['#eaff00', '#d7263d', '#ffffff', '#111111', '#00bbff'], n = 90) {
    const o = overlay();
    for (let i = 0; i < n; i++) {
        const c = document.createElement('div');
        const s = 6 + Math.random() * 10;
        c.style.cssText = `position:absolute;width:${s}px;height:${s * .6}px;background:${rand(colors)};left:${Math.random() * 100}%;top:-20px;`;
        o.appendChild(c);
        c.animate([{ transform: 'translateY(0) rotate(0)', opacity: 1 }, { transform: `translateY(${innerHeight + 40}px) rotate(${Math.random() * 720}deg)`, opacity: .2 }],
            { duration: 1800 + Math.random() * 1800, delay: Math.random() * 500, easing: 'ease-in', fill: 'forwards' });
    }
    setTimeout(() => o.remove(), 4200);
}

export async function celebrate(opts = {}) {
    const m = await fx();
    if (m) m.confetti(opts); else domConfetti();
}

// -----------------------------------------------
// FLEUR STORM (title x3, or click the 3D fleur)
// -----------------------------------------------
let fleurBusy = false;
export async function fleurRain() {
    if (fleurBusy) return;
    fleurBusy = true;
    unlock('fleur');
    sfx.whoosh();
    hero?.spinFleur();
    const m = await fx();
    if (m) await m.fleurStorm();
    else await flatFleurRain();
    fleurBusy = false;
}

function flatFleurRain() {
    return new Promise(res => {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9700;';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = innerWidth; canvas.height = innerHeight;
        const colors = ['#eaff00', '#ffffff', '#c8a400', '#fffbe6', '#111111'];
        const F = Array.from({ length: 150 }, () => ({ x: Math.random() * canvas.width, y: -40 - Math.random() * canvas.height * 1.5, s: 14 + Math.random() * 38, v: 1.2 + Math.random() * 4, w: Math.random() * 6, r: Math.random() * 6, rs: (Math.random() - .5) * .06 }));
        let frame = 0;
        (function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            F.forEach((f, i) => {
                f.y += f.v; f.w += .03; f.r += f.rs; f.x += Math.sin(f.w);
                ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.r);
                ctx.font = `${f.s}px serif`; ctx.fillStyle = colors[i % colors.length]; ctx.textAlign = 'center';
                ctx.fillText('⚜', 0, 0); ctx.restore();
                if (f.y > canvas.height + 40) { f.y = -40; f.x = Math.random() * canvas.width; }
            });
            if (++frame < 540) requestAnimationFrame(draw);
            else { canvas.remove(); res(); }
        })();
    });
}

// -----------------------------------------------
// CHURCHILL DOWNS (subtitle x3, or type "derby")
// -----------------------------------------------
export async function churchill() {
    if (document.getElementById('churchillOverlay')) return;
    unlock('derby');
    sfx.bugle();
    const o = overlay();
    o.id = 'churchillOverlay';
    const flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;background:linear-gradient(135deg,#c8102e 0%,#fff 50%,#f5c518 100%);opacity:0;transition:opacity .25s;';
    o.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '.28'; setTimeout(() => { flash.style.opacity = '0'; }, 380); });
    banner(o, 'And they’re off! 🏇<small>THE MOST EXCITING TWO MINUTES IN SPORTS</small>', 4600);

    // the field
    for (let i = 0; i < 9; i++) {
        const h = document.createElement('div');
        h.textContent = '🏇';
        const size = 26 + i * 4;
        h.style.cssText = `position:absolute;left:0;top:${46 + i * 5.5}%;font-size:${size}px;transform:scaleX(-1);`;
        o.appendChild(h);
        const dur = 2300 + Math.random() * 900;
        h.animate([{ transform: `translateX(-90px) scaleX(-1)` }, { transform: `translateX(${innerWidth + 120}px) scaleX(-1)` }], { duration: dur, delay: 150 + i * 70, easing: 'linear', fill: 'forwards' });
        h.animate([{ translate: '0 0' }, { translate: '0 -8px' }, { translate: '0 0' }], { duration: 260, iterations: Infinity });
        // dust
        for (let d = 0; d < 3; d++) setTimeout(() => {
            const p = document.createElement('div');
            p.textContent = '💨';
            p.style.cssText = `position:absolute;top:${48 + i * 5.5}%;left:${(d + 1) * 22}%;font-size:${size * .6}px;opacity:.6;`;
            o.appendChild(p);
            p.animate([{ opacity: .7, transform: 'scale(.6)' }, { opacity: 0, transform: 'scale(1.6) translateX(-30px)' }], { duration: 900, fill: 'forwards' });
        }, 400 + d * 500 + i * 60);
    }
    const m = await fx();
    if (m) m.rosePetals();
    else domConfetti(['#c8102e', '#a00d24', '#ffffff', '#f5c518']);
    setTimeout(() => o.remove(), 5200);
}

// -----------------------------------------------
// THUNDER OVER LOUISVILLE (Konami code)
// -----------------------------------------------
let thunderOn = false;
export async function thunder() {
    if (thunderOn) return;
    thunderOn = true;
    unlock('thunder');
    const o = overlay();
    o.style.zIndex = 9750;
    const sky = document.createElement('div');
    sky.className = 'hero-fallback';
    sky.style.cssText = 'position:absolute;inset:auto 0 0 0;height:28vh;background:none;z-index:1;opacity:.95;--ink:#05050b;';
    o.appendChild(sky);
    banner(o, '🎆 Thunder Over Louisville 🎆<small>THE BIGGEST FIREWORKS SHOW ON THE CONTINENT</small>', 5000);
    const skip = document.createElement('button');
    skip.className = 'chip-btn';
    skip.textContent = 'skip ✕';
    skip.style.cssText = 'position:absolute;right:16px;top:16px;pointer-events:auto;background:#111;color:#fff;border-color:#fff;z-index:2;';
    o.appendChild(skip);
    const m = await fx();
    let stop;
    const done = () => { o.remove(); thunderOn = false; };
    skip.onclick = () => { m?.stopAll(); done(); };
    if (m) {
        sfx.boom(0, .4);
        await m.fireworks({
            onBurst: () => {
                const d = .15 + Math.random() * .3;
                sfx.boom(d, .25 + Math.random() * .3);
                if (Math.random() < .5) sfx.crackle(d + .4);
            }
        });
        done();
    } else {
        for (let i = 0; i < 6; i++) setTimeout(() => domConfetti(['#ff4455', '#ffd700', '#44ccff', '#eaff00', '#ffffff'], 40), i * 700);
        stop = setTimeout(done, 5000);
    }
}

// -----------------------------------------------
// BAT COUNTRY (type "gonzo")
// -----------------------------------------------
export async function gonzo() {
    if (document.body.classList.contains('gonzo')) return;
    unlock('gonzo');
    sfx.whoosh();
    document.body.classList.add('gonzo');
    const o = overlay();
    banner(o, '🦇 Welcome to Bat Country 🦇<small>HUNTER S. THOMPSON · LOUISVILLE-BORN · SLUGGER EDITION</small>', 5200);
    const m = await fx();
    if (m) await m.batCountry();
    else await new Promise(r => setTimeout(r, 5000));
    document.body.classList.remove('gonzo');
    o.remove();
}

// -----------------------------------------------
// THE GREATEST (type "ali")
// -----------------------------------------------
export function ali() {
    if (document.getElementById('aliOverlay')) return;
    const o = overlay();
    o.id = 'aliOverlay';
    const b = banner(o, 'Float like a butterfly… 🦋<small>CATCH ONE</small>', 7000);
    let caught = false;
    const flyers = [];
    for (let i = 0; i < 9; i++) {
        const f = document.createElement('div');
        f.className = 'flyer';
        f.textContent = '🦋';
        f.style.fontSize = `${30 + Math.random() * 24}px`;
        o.appendChild(f);
        const st = { x: -60 - Math.random() * 300, y: innerHeight * (.2 + Math.random() * .6), ph: Math.random() * 6, sp: 70 + Math.random() * 70, el: f, dead: false };
        flyers.push(st);
        const hit = () => {
            if (st.dead) return;
            st.dead = true;
            f.textContent = '🐝';
            sfx.punch();
            document.body.classList.remove('shake');
            void document.body.offsetWidth;
            document.body.classList.add('shake');
            f.animate([{ transform: `translate(${st.x}px,${st.y}px) scale(1)` }, { transform: `translate(${st.x + 400}px,${st.y - 500}px) scale(2.4) rotate(40deg)`, opacity: 0 }], { duration: 900, fill: 'forwards' });
            if (!caught) {
                caught = true;
                b.innerHTML = '…sting like a bee! 🐝<small>MUHAMMAD ALI · LOUISVILLE’S OWN · THE GREATEST</small>';
                unlock('ali');
            }
        };
        f.addEventListener('pointerdown', hit);
    }
    let last = performance.now();
    const t0 = last;
    (function tick(now) {
        const dt = (now - last) / 1000; last = now;
        flyers.forEach(s => {
            if (s.dead) return;
            s.ph += dt * 3;
            s.x += s.sp * dt;
            const y = s.y + Math.sin(s.ph) * 40;
            s.el.style.transform = `translate(${s.x}px,${y}px) rotate(${Math.sin(s.ph * 2) * 18}deg) scaleX(${Math.sin(s.ph * 6) > 0 ? 1 : .7})`;
        });
        if (now - t0 < 11000 && flyers.some(s => !s.dead && s.x < innerWidth + 60)) requestAnimationFrame(tick);
        else setTimeout(() => o.remove(), 600);
    })(last);
}

// -----------------------------------------------
// BOURBON (type "bourbon")
// -----------------------------------------------
let bourbonTimer = null;
export function bourbon() {
    unlock('bourbon');
    sfx.clink();
    document.body.classList.add('bourbon');
    toast('One neat pour of Kentucky’s finest. Things may get a little… wavy.', { kicker: 'BOURBON MODE', emoji: '🥃' });
    clearTimeout(bourbonTimer);
    bourbonTimer = setTimeout(() => {
        document.body.classList.remove('bourbon');
        toast('Drink some water, friend.', { kicker: 'SOBERING UP', emoji: '💧' });
    }, 11000);
}

// -----------------------------------------------
// WRONG CITY (type "cincinnati" / "cincy")
// -----------------------------------------------
export function cincy() {
    if (document.body.classList.contains('cincy')) return;
    unlock('cincy');
    sfx.error();
    const o = overlay();
    banner(o, '⚠ Cincinnati detected ⚠<small>REROUTING TO A BETTER CITY…</small>', 2900);
    document.body.classList.add('cincy');
    setTimeout(() => {
        document.body.classList.remove('cincy');
        o.remove();
        toast('Crisis averted. You’re back in Louisville.', { kicker: 'PHEW', emoji: '⚜️' });
    }, 3300);
}

// -----------------------------------------------
// 502 BAD GATEWAY (type "502")
// -----------------------------------------------
export function badGateway() {
    if (document.querySelector('.fake-error')) return;
    unlock('502');
    const o = document.createElement('div');
    o.className = 'fake-error';
    o.innerHTML = `<h1>502 Bad Gateway</h1><hr><p>nginx/1.502.0 (Kentucky)</p><div class="fe-stamp">JK — 502 is our area code.<br>Welcome home.</div>`;
    document.body.appendChild(o);
    sfx.error();
    setTimeout(() => { o.querySelector('.fe-stamp').classList.add('in'); sfx.stamp(); }, 1300);
    const kill = () => { o.remove(); };
    o.addEventListener('click', kill);
    setTimeout(kill, 6500);
}

// -----------------------------------------------
// POPE LICK MONSTER (click the eyes under the trestle at night, or type "popelick")
// -----------------------------------------------
export function popeLick() {
    if (document.querySelector('.popelick')) return;
    unlock('pope');
    sfx.horn();
    const o = document.createElement('div');
    o.className = 'popelick';
    o.innerHTML = `<div class="goat">🐐</div><div class="eyes"><i></i><i></i></div><div class="warn">STAY OFF THE TRESTLE.<small>THE POPE LICK MONSTER IS WATCHING · CLICK TO FLEE</small></div>`;
    document.body.appendChild(o);
    const kill = () => { o.remove(); };
    o.addEventListener('click', kill);
    setTimeout(kill, 6000);
}

// -----------------------------------------------
// WEIRD MODE (footer button)
// -----------------------------------------------
let weirdMode = false;
export function toggleWeird() {
    weirdMode = !weirdMode;
    document.body.classList.toggle('weird', weirdMode);
    const btn = document.getElementById('weirdBtn');
    if (btn) btn.textContent = weirdMode ? 'ok that’s weird enough' : 'keep Louisville weird, pls';
    if (weirdMode) { sfx.kazoo(); unlock('weird'); }
}

// -----------------------------------------------
// NEON SIGN
// -----------------------------------------------
export function toggleNeon() {
    const title = document.getElementById('wikiTitle');
    const sw = document.getElementById('neon-switch');
    if (!title || !sw) return;
    state.neonOn = !state.neonOn;
    const on = state.neonOn;
    sw.classList.toggle('on', on);
    sw.setAttribute('aria-pressed', on);
    sfx.click();
    title.classList.remove('neon-on', 'neon-flicker', 'neon-shutoff');
    void title.offsetWidth;
    if (on) {
        unlock('neon');
        title.classList.add('neon-flicker');
        title.addEventListener('animationend', () => { title.classList.remove('neon-flicker'); if (state.neonOn) title.classList.add('neon-on'); }, { once: true });
        // flicker the city on with the sign
        setTimeout(() => hero?.setNeon(true), 120);
        setTimeout(() => hero?.setNeon(false), 260);
        setTimeout(() => hero?.setNeon(state.neonOn), 420);
    } else {
        title.classList.add('neon-shutoff');
        title.addEventListener('animationend', () => title.classList.remove('neon-shutoff'), { once: true });
        hero?.setNeon(false);
    }
}

// -----------------------------------------------
// SAY IT RIGHT
// -----------------------------------------------
// -----------------------------------------------
// HIDDEN GEMS + BOAT RACE
// -----------------------------------------------
const hiddenGems = [
    { name: "Hillerich & Bradsby Factory Tour", note: "Watch Louisville Sluggers get made on the factory floor. Admission (about $24) comes with a mini bat, and the giant bat out front is free." },
    { name: "Butchertown Market", note: "Sprawling old industrial building on Story Ave full of local shops, with Cellar Door Chocolates as the anchor. Worth the detour every time." },
    { name: "Cave Hill Cemetery", note: "Final resting place of Muhammad Ali, Colonel Sanders & George Rogers Clark. Also genuinely beautiful." },
    { name: "Louisville Waterfront Park at Dawn", note: "The Big Four Bridge at sunrise with nobody on it is a different city entirely." },
    { name: "Iroquois Amphitheater", note: "Outdoor concerts in a hollow in the middle of the park. Great overlook of the city." },
    { name: "Hadley Pottery", note: "Handmade Louisville pottery since 1940, known for its whimsical blue folk designs. Nearly closed in 2022 before a local buyer saved it." },
    { name: "Caperton Swamp", note: "A one-mile loop through a real wetland off River Road. Herons, turtles, and zero crowds." },
    { name: "The Witches' Tree", note: "6th & Park in Old Louisville. A twisted, gnarled maple with a legend tying it to the 1890 tornado." },
    { name: "Columbia Gym", note: "4th St. The gym where a 12-year-old Cassius Clay walked in to report his stolen bike and started boxing." },
    { name: "Caufield's Vampire Bat", note: "A 36-foot bat clings to the costume shop on W Main. Best at night." },
    { name: "Baxter Square", note: "Louisville's first public cemetery, turned into an Olmsted park." },
    { name: "Fairmount Falls", note: "A seasonal waterfall in Jefferson Memorial Forest. Go after a good rain." }
];

export function openHiddenGems() {
    const list = document.getElementById('hiddenGemsList');
    if (list) {
        list.innerHTML = hiddenGems.map((g, i) => `
            <li style="animation-delay:${i * 60}ms">
                <div class="gem-name">💎 ${escapeHtml(g.name)}</div>
                <div class="gem-note">${escapeHtml(g.note)}</div>
            </li>`).join('');
    }
    openModal('hiddenGemsModal');
}

let raceCtl = null;
export async function startBoatRace() {
    unlock('boat');
    const touch = isTouch();
    document.getElementById('raceInstructions').textContent = touch ? 'TAP THE BUTTON (OR THE RIVER) TO ROW!' : 'MASH SPACE (OR THE BUTTON) TO BEAT CINCINNATI!';
    const status = document.getElementById('raceStatus');
    status.className = 'race-status';
    status.textContent = 'READY… SET…';
    const stage = document.getElementById('raceStage');
    stage.innerHTML = '';
    openModal('raceModal');

    const callbacks = {
        status: (txt, cls = '') => { status.textContent = txt; status.className = 'race-status ' + cls; },
        win: () => {
            sfx.whistle(1.8);
            celebrate();
            unlock('gems');
            setTimeout(() => { closeModal('raceModal'); openHiddenGems(); }, 1800);
        },
        lose: () => sfx.lose(),
        go: () => sfx.bugle(),
        bind: (row) => bindRowing(row, stage),
    };

    raceCtl?.dispose();
    raceCtl = null;
    try {
        const { hasWebGL } = await import('./three/core.js');
        if (!hasWebGL()) throw new Error('no webgl');
        const mod = await import('./three/boatrace.js');
        raceCtl = mod.createBoatRace(stage, callbacks);
    } catch (e) {
        raceCtl = domRace(stage, callbacks);
    }
}

onModalClose('raceModal', () => { raceCtl?.dispose(); raceCtl = null; });

// Row input shared by 3D + DOM races
function bindRowing(row, stage) {
    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); row(); } };
    const onBtn = (e) => { e.preventDefault(); row(); };
    const btn = document.getElementById('rowButton');
    window.addEventListener('keydown', onKey);
    btn.addEventListener('pointerdown', onBtn);
    stage.addEventListener('pointerdown', onBtn);
    return () => {
        window.removeEventListener('keydown', onKey);
        btn.removeEventListener('pointerdown', onBtn);
        stage.removeEventListener('pointerdown', onBtn);
    };
}

function domRace(stage, cb) {
    stage.innerHTML = `<div class="race-lane" id="playerBoat" style="top:20%">🚢</div><div class="race-lane" id="rivalBoat" style="top:58%;opacity:.75">🚤</div><div class="race-finish"></div>`;
    const W = () => stage.clientWidth - 70;
    let p = 0, r = 0, racing = false, done = false;
    const pb = stage.querySelector('#playerBoat'), rb = stage.querySelector('#rivalBoat');
    const go = setTimeout(() => { racing = true; cb.status('GO GO GO!'); cb.go(); }, 1500);
    const rival = setInterval(() => {
        if (!racing) return;
        r += Math.random() * 14 * (W() / 380);
        rb.style.left = r + 'px';
        if (r > W()) { racing = false; done = true; cb.status('CINCINNATI WON. DISGRACEFUL.', 'lose'); cb.lose(); clearInterval(rival); }
    }, 100);
    const row = () => {
        if (!racing) return;
        p += 12 * (W() / 380);
        pb.style.left = p + 'px';
        if (p > W()) { racing = false; done = true; cb.status('THE BELLE WINS! CHAMPION OF THE OHIO!', 'win'); clearInterval(rival); cb.win(); }
    };
    const unbind = bindRowing(row, stage);
    return { dispose() { clearTimeout(go); clearInterval(rival); unbind(); } };
}

// -----------------------------------------------
// IDLE CARDINAL (sit still 60s)
// -----------------------------------------------
let idleTimer = null;
let cardinalActive = false;
function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(spawnCardinal, 60 * 1000);
}
function spawnCardinal() {
    if (cardinalActive || document.hidden) return resetIdle();
    cardinalActive = true;
    const el = document.createElement('div');
    el.className = 'cardinal';
    el.textContent = '🐦';
    el.title = 'the Kentucky state bird';
    document.body.appendChild(el);
    const hop = el.animate([
        { transform: 'translate(-80px, 0) scaleX(-1)' },
        { transform: `translate(${innerWidth + 100}px, 0) scaleX(-1)` }
    ], { duration: 15000, easing: 'linear', fill: 'forwards' });
    el.animate([{ translate: '0 0' }, { translate: '0 -14px' }, { translate: '0 0' }], { duration: 380, iterations: Infinity, easing: 'ease-out' });
    el.addEventListener('pointerdown', () => {
        sfx.chirp();
        if (unlock('cardinal')) toast('The northern cardinal: Kentucky’s state bird, and our favorite team color.', { kicker: 'BIRD WATCHING', emoji: '🐦' });
        hop.pause();
        el.animate([{ transform: getComputedStyle(el).transform, opacity: 1 }, { transform: `translate(${innerWidth * .6}px, -${innerHeight}px) scaleX(-1) rotate(-20deg)`, opacity: 0 }], { duration: 1400, fill: 'forwards' });
        setTimeout(() => el.remove(), 1400);
    }, { once: true });
    hop.onfinish = () => el.remove();
    setTimeout(() => { cardinalActive = false; resetIdle(); }, 16000);
}

// -----------------------------------------------
// HERO (3D) CALLBACKS
// -----------------------------------------------
const WISHES = ['No construction on Bardstown Road.', 'A parking spot in NuLu.', 'Derby tickets. Good ones.', 'A Hot Brown that doesn’t put you to sleep.', 'The Watterson, but empty.', 'Cards AND Cats both win. (impossible)', 'Spring that lasts longer than a week.'];
const LED_NAMES = { rainbow: 'rainbow chase', cards: 'Cardinal red', divided: 'house divided (Cards vs. Cats)', sparkle: 'twinkle', gold: 'fleur gold' };

const SKIP_MEH = [
    'Plunk. The Ohio keeps it.',
    'That one’s halfway to Jeffersonville. Straight down.',
    'Flatter rock. Lower arm.',
    'The catfish thank you for your donation.',
];
const SKIP_BRAG = [
    'Indiana felt that one.',
    'The Belle’s captain saluted.',
    'Your granddad would be proud.',
];
export function onHeroEgg(id, payload) {
    switch (id) {
        case 'bridge':
            sfx.pop();
            if (!unlock('bridge')) toast(`Big Four light show: <b>${LED_NAMES[payload] || payload}</b>`, { duration: 1800 });
            break;
        case 'belle':
            sfx.whistle();
            if (!unlock('belle')) toast('The Belle of Louisville: 1914, still paddling. Oldest operating steamboat of her kind.', { emoji: '📯', duration: 3000 });
            break;
        case 'homerun':
            sfx.crack();
            setTimeout(() => toast('HOME RUN! That one’s landing in Indiana.', { kicker: 'CRACK!', emoji: '⚾' }), 250);
            unlock('homerun');
            break;
        case 'fleur3d':
            fleurRain();
            break;
        case 'star':
            sfx.ding();
            unlock('star');
            toast(`Wish granted: ${rand(WISHES)}`, { kicker: 'SHOOTING STAR', emoji: '🌠' });
            break;
        case 'pope':
            popeLick();
            break;
        case 'splash':
            sfx.tick();
            break;
        case 'skip': {
            const n = payload;
            if (n >= 6 && unlock('skipper')) break;
            sfx.pop();
            toast(`<b>${n} skip${n === 1 ? '' : 's'}.</b> ${n >= 6 ? rand(SKIP_BRAG) : rand(SKIP_MEH)}`, { emoji: '🪨', duration: 2200 });
            break;
        }
    }
}

// -----------------------------------------------
// CERTIFICATE (all secrets)
// -----------------------------------------------
function certificate() {
    const c = document.createElement('div');
    c.className = 'cert';
    c.innerHTML = `<div class="cert-card">
        <div class="seal">🏅</div>
        <div class="stamp hl">OFFICIAL-ISH DOCUMENT</div>
        <h2>Honorary Louisvillian</h2>
        <p>Having located all ${SECRETS.length} secrets of The Louisville Wiki, the bearer is hereby entitled to say “LUH-vul” with total confidence, argue about Hot Browns, and complain about the Watterson forever.</p>
        <button type="button" class="btn-tool">Accept with honor ⚜</button>
    </div>`;
    document.body.appendChild(c);
    c.querySelector('button').onclick = () => c.remove();
    thunderOn = false;
    setTimeout(() => thunder(), 400);
}

// -----------------------------------------------
// CONSOLE
// -----------------------------------------------
function consoleEgg() {
    const art = [
        '        ⚜        ',
        '   THE LOUISVILLE WIKI',
        '   hand-made in the 502',
    ].join('\n');
    try {
        console.log(`%c${art}`, 'font:900 14px monospace;color:#eaff00;background:#141414;padding:10px 14px;line-height:1.6');
        console.log('%cpsst — you found the back room. type:  %clouisville.secret()', 'font:12px monospace;color:#888', 'font:bold 12px monospace;color:#d7263d');
    } catch (e) { /* ignore */ }
    window.louisville = {
        secret() {
            const fresh = unlock('console');
            fleurRain();
            return fresh ? '⚜ secret unlocked. check the vault.' : '⚜ you already found this one, hacker.';
        },
        eggs: () => `${foundCount()}/${SECRETS.length} found. no spoilers here.`,
    };
}

// -----------------------------------------------
// INIT
// -----------------------------------------------
export function initEasterEggs() {
    // title x3
    let titleClicks = 0, titleTimer = null;
    document.getElementById('wikiTitle')?.addEventListener('click', (e) => {
        if (!document.body.classList.contains('is-compact')) e.preventDefault();
        titleClicks++;
        clearTimeout(titleTimer);
        titleTimer = setTimeout(() => { titleClicks = 0; }, 900);
        if (titleClicks >= 3) { titleClicks = 0; fleurRain(); }
    });

    // subtitle x3
    let subClicks = 0, subTimer = null;
    document.getElementById('subtitleBtn')?.addEventListener('click', () => {
        subClicks++;
        clearTimeout(subTimer);
        subTimer = setTimeout(() => { subClicks = 0; }, 900);
        if (subClicks >= 3) { subClicks = 0; churchill(); }
    });

    document.getElementById('neon-switch')?.addEventListener('click', toggleNeon);
    document.getElementById('weirdBtn')?.addEventListener('click', toggleWeird);
    document.getElementById('secretBoat')?.addEventListener('click', startBoatRace);

    // typed words + konami
    const WORDS = { gonzo, ali, bourbon, cincinnati: cincy, cincy, '502': badGateway, derby: churchill, popelick: popeLick, thunder, fleur: fleurRain };
    Object.entries(WORDS).forEach(([w, fn]) => registerSearchEgg(w, fn));
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let kIdx = 0, buf = '';
    document.addEventListener('keydown', (e) => {
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        kIdx = key === KONAMI[kIdx] ? kIdx + 1 : (key === KONAMI[0] ? 1 : 0);
        if (kIdx === KONAMI.length) { kIdx = 0; thunder(); return; }
        if (e.key.length === 1) {
            buf = (buf + key).slice(-16);
            for (const w in WORDS) if (buf.endsWith(w)) { buf = ''; WORDS[w](); break; }
        }
    });

    ['pointermove', 'pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt => addEventListener(evt, resetIdle, { passive: true }));
    resetIdle();

    onSecretsChange((id, n) => {
        if (id && n === SECRETS.length) setTimeout(certificate, 1600);
    });

    consoleEgg();
}

// Legacy globals
Object.assign(window, { startBoatRace, toggleWeird, toggleNeon });
