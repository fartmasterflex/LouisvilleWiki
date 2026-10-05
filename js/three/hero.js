// --- js/three/hero.js ---
// The masthead: a risograph-printed, clickable Louisville.
// Skyline + Ohio River + Big Four Bridge + the Belle + the Big Bat + a floating fleur.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeRisoPass } from './riso.js';
import { fleurGeometry, batGeometry, beam, mergeBeams, makeSteamboat, softDotTexture, windowTextures, towerBox } from './shapes.js';

function mulberry32(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

export function createHero({ canvas, container, night = false, neon = false, compact = false, reducedMotion = false, on = {} }) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.6);
    renderer.setPixelRatio(DPR);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 700);
    const rnd = mulberry32(502);

    const S = {
        night: night ? 1 : 0, nightT: night ? 1 : 0,
        neon: neon ? 1 : 0, neonT: neon ? 1 : 0,
        compact: compact ? 1 : 0, compactT: compact ? 1 : 0,
        t: 0, px: 0, py: 0, pxS: 0, pyS: 0,
        W: 1, H: 1,
    };

    const C = {
        skyTopD: new THREE.Color(0xbfd6e2), skyHorD: new THREE.Color(0xf7f1e2),
        skyTopN: new THREE.Color(0x020309), skyHorN: new THREE.Color(0x1d1733),
        skyTopX: new THREE.Color(0x0b0022), skyHorX: new THREE.Color(0x4a0c52),
        fogD: new THREE.Color(0xeee8d8), fogN: new THREE.Color(0x0d0c14), fogX: new THREE.Color(0x1a0526),
        groundD: new THREE.Color(0xb9b3a4), groundN: new THREE.Color(0x14131a),
        waterD: new THREE.Color(0xb3d2dc), waterN: new THREE.Color(0x0e1826), waterX: new THREE.Color(0x1a0b30),
        steelD: new THREE.Color(0x5b6166), steelN: new THREE.Color(0x1c1f24),
        tmp: new THREE.Color(), tmp2: new THREE.Color(),
    };

    // ---------------- SKY ----------------
    const skyU = { uTop: { value: C.skyTopD.clone() }, uHor: { value: C.skyHorD.clone() } };
    const sky = new THREE.Mesh(
        new THREE.SphereGeometry(400, 32, 16),
        new THREE.ShaderMaterial({
            side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
            vertexShader: `varying vec3 vP; void main(){ vP = (modelMatrix * vec4(position,1.)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vP,1.); }`,
            fragmentShader: `uniform vec3 uTop; uniform vec3 uHor; varying vec3 vP; void main(){ float h = normalize(vP).y; gl_FragColor = vec4(mix(uHor, uTop, smoothstep(-0.02, 0.45, h)), 1.); }`
        })
    );
    scene.add(sky);
    scene.fog = new THREE.Fog(C.fogD.clone(), 70, 260);

    // ---------------- LIGHTS ----------------
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a8170, 1.6);
    scene.add(hemi);
    const sunLight = new THREE.DirectionalLight(0xfff4d8, 2.4);
    sunLight.position.set(-40, 50, 30);
    scene.add(sunLight);
    const rimLight = new THREE.DirectionalLight(0x8fb8ff, 0.0);
    rimLight.position.set(40, 20, -40);
    scene.add(rimLight);

    // ---------------- SUN / MOON ----------------
    const orbPos = new THREE.Vector3(-34, 30, -110);
    const sun = new THREE.Mesh(new THREE.CircleGeometry(6.5, 40), new THREE.MeshBasicMaterial({ color: 0xeaff00, transparent: true, fog: false }));
    sun.position.copy(orbPos);
    scene.add(sun);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(5, 40), new THREE.MeshBasicMaterial({ color: 0xf5f1e4, transparent: true, opacity: 0, fog: false }));
    moon.position.copy(orbPos).add(new THREE.Vector3(0, 0, 0.1));
    scene.add(moon);
    // crescent bite (sky-colored disc)
    const bite = new THREE.Mesh(new THREE.CircleGeometry(4.6, 40), new THREE.MeshBasicMaterial({ color: 0x06060e, transparent: true, opacity: 0, fog: false }));
    bite.position.copy(orbPos).add(new THREE.Vector3(2.2, 1.4, 0.2));
    scene.add(bite);
    [sun, moon, bite].forEach(m => m.lookAt(0, 8, 40));

    // ---------------- STARS ----------------
    const starGeo = new THREE.BufferGeometry();
    const sp = [];
    for (let i = 0; i < 600; i++) {
        const th = rnd() * Math.PI * 2, ph = rnd() * 0.45 * Math.PI;
        sp.push(Math.cos(th) * Math.sin(ph + 0.35) * 380, 30 + Math.cos(ph) * 330 * rnd(), -Math.abs(Math.sin(th)) * 380 - 40);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2 * DPR, sizeAttenuation: false, transparent: true, opacity: 0, fog: false }));
    scene.add(stars);

    // ---------------- GROUND + WATER ----------------
    const groundMat = new THREE.MeshStandardMaterial({ color: C.groundD.clone(), flatShading: true, roughness: 1 });
    const ground = new THREE.Mesh(new THREE.BoxGeometry(520, 1, 140), groundMat);
    ground.position.set(0, -0.3, -76);
    scene.add(ground);

    const waterU = { uTime: { value: 0 } };
    const waterMat = new THREE.MeshStandardMaterial({ color: C.waterD.clone(), flatShading: true, roughness: .32, metalness: .15 });
    waterMat.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = waterU.uTime;
        sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `
            vec3 transformed = vec3(position);
            vec4 wp0 = modelMatrix * vec4(position, 1.0);
            transformed.y += sin(wp0.x * 0.33 + uTime * 1.1) * 0.13 + sin(wp0.z * 0.52 - uTime * 0.9) * 0.11 + sin((wp0.x + wp0.z) * 0.95 + uTime * 1.8) * 0.05;`);
    };
    const water = new THREE.Mesh(new THREE.PlaneGeometry(520, 110, 180, 44).rotateX(-Math.PI / 2), waterMat);
    water.position.set(0, 0, 48);
    scene.add(water);

    // ---------------- BUILDINGS ----------------
    const tex = windowTextures();
    const bMat = new THREE.MeshStandardMaterial({ map: tex.day, emissiveMap: tex.night, emissive: 0xffffff, emissiveIntensity: 0, flatShading: true, roughness: .9 });
    const pinkMat = bMat.clone(); pinkMat.color = new THREE.Color(0xf0cfc4);
    const darkMat = bMat.clone(); darkMat.color = new THREE.Color(0x9aa0a6);

    const towerGeos = [];
    const edgeGeos = [];
    const occupied = [];
    const addTower = (x, z, w, h, d, { mat = null, lift = 0.2 } = {}) => {
        const g = towerBox(w, h, d);
        g.translate(x, lift + h / 2, z);
        occupied.push({ x, z, w, d });
        const e = new THREE.EdgesGeometry(g, 20);
        edgeGeos.push(e);
        if (mat) { const m = new THREE.Mesh(g, mat); scene.add(m); return m; }
        towerGeos.push(g);
        return null;
    };
    const addPart = (geo, mat, x, y, z) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        scene.add(m);
        const e = new THREE.EdgesGeometry(geo, 20);
        e.translate(x, y, z);
        edgeGeos.push(e);
        return m;
    };

    // Landmarks (loosely, lovingly inaccurate)
    // 400 West Market — the barrel-vault crown
    addTower(-4.5, -21, 3.4, 19, 3.4);
    const vault = new THREE.CylinderGeometry(1.7, 1.7, 3.4, 18, 1, false, 0, Math.PI);
    vault.rotateX(Math.PI / 2); vault.rotateZ(Math.PI / 2);
    addPart(vault, darkMat, -4.5, 19.2, -21);
    // PNC Plaza
    addTower(-9, -18.5, 3, 15.5, 3);
    addPart(new THREE.CylinderGeometry(.06, .06, 3, 4), darkMat, -9, 17.2, -18.5);
    // Humana Building — stepped pink granite
    addTower(0.6, -17.5, 3.4, 11, 3.2, { mat: pinkMat });
    addTower(0.6, -17.5, 2.8, 3.2, 2.6, { mat: pinkMat, lift: 11.2 });
    addTower(0.6, -17.5, 2.0, 2.2, 2.0, { mat: pinkMat, lift: 14.4 });
    const hPyr = new THREE.ConeGeometry(1.35, 1.4, 4); hPyr.rotateY(Math.PI / 4);
    addPart(hPyr, pinkMat, 0.6, 17.3, -17.5);
    // Meidinger Tower
    addTower(4.2, -23, 2.7, 13.5, 2.7);
    addTower(4.2, -23, 2.2, 1.2, 2.2, { lift: 13.7 });
    // Omni
    addTower(-12.5, -25, 2.8, 14, 2.8);
    const oPyr = new THREE.ConeGeometry(1.9, 2.4, 4); oPyr.rotateY(Math.PI / 4);
    addPart(oPyr, darkMat, -12.5, 15.4, -25);
    // Slugger Museum (short) — bat leans on it
    addTower(3.4, -10.2, 3.4, 3.4, 3.0);
    occupied.push({ x: 6.2, z: -8.6, w: 2, d: 2 });          // the bat
    occupied.push({ x: -7.5, z: -9.6, w: 11.4, d: 6.8 });    // Yum! Center

    // Fill buildings, tallest near downtown
    const clear = (x, z, w, d) => occupied.every(o => Math.abs(o.x - x) > (o.w + w) / 2 + .3 || Math.abs(o.z - z) > (o.d + d) / 2 + .3);
    for (let i = 0, tries = 0; i < 95 && tries < 900; tries++) {
        const x = -44 + rnd() * 94;
        const z = -11 - rnd() * 36;
        if (x > 28 && z < -30) continue;            // keep Pope Lick sightline open
        if (x > 9 && x < 16 && z > -14) continue;   // bridge landing
        const w = 1.7 + rnd() * 2.6, d = 1.7 + rnd() * 2.4;
        if (!clear(x, z, w, d)) continue;
        const core = Math.exp(-Math.pow((x + 3) / 13, 2));
        const h = 1.6 + core * (4 + rnd() * 9) + rnd() * 3.2 - Math.max(0, (-z - 30) * .1);
        addTower(x, z, w, Math.max(1.4, h), d);
        i++;
    }
    const city = new THREE.Mesh(mergeGeometries(towerGeos), bMat);
    towerGeos.forEach(g => g.dispose());
    scene.add(city);

    // KFC Yum! Center — the silver shell by the river
    const yumMat = new THREE.MeshStandardMaterial({ color: 0xcfd4d8, metalness: .55, roughness: .35, flatShading: true });
    const yum = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), yumMat);
    yum.scale.set(5.6, 2.1, 3.3);
    yum.position.set(-7.5, 0.2, -9.6);
    scene.add(yum);

    // Waterfront Park trees
    const treeGeo = new THREE.ConeGeometry(0.55, 1.6, 5);
    const trees = new THREE.InstancedMesh(treeGeo, new THREE.MeshStandardMaterial({ color: 0x5c7a52, flatShading: true }), 34);
    const tm = new THREE.Matrix4();
    for (let i = 0; i < 34; i++) {
        const s = .7 + rnd() * .6;
        tm.compose(new THREE.Vector3(-34 + i * 1.3 + rnd() * .5, .2 + .8 * s, -7.4 - rnd() * 1.6), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
        trees.setMatrixAt(i, tm);
    }
    scene.add(trees);

    // Neon outlines (only seen when the neon switch is on)
    const edges = new THREE.LineSegments(mergeGeometries(edgeGeos), new THREE.LineBasicMaterial({ color: 0xff3ea5, transparent: true, opacity: 0, fog: false }));
    edgeGeos.forEach(g => g.dispose());
    edges.visible = false;
    scene.add(edges);

    // ---------------- THE BIG BAT ----------------
    const batPivot = new THREE.Group();
    batPivot.position.set(6.2, 0.2, -8.6);
    const batGeo = batGeometry(11.5, 20);
    batGeo.rotateZ(Math.PI);
    batGeo.translate(0, 11.5, 0);
    const bat = new THREE.Mesh(batGeo, new THREE.MeshStandardMaterial({ color: 0x9a6636, flatShading: true, roughness: .7 }));
    batPivot.add(bat);
    const batHit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 12, 2.6), new THREE.MeshBasicMaterial({ visible: false }));
    batHit.position.y = 6;
    batPivot.add(batHit);
    const batRest = 0.15;
    batPivot.rotation.z = batRest;
    scene.add(batPivot);
    const batSwing = { t: -1 };
    const ball = new THREE.Mesh(new THREE.SphereGeometry(.55, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x333333 }));
    ball.visible = false;
    scene.add(ball);
    const ballV = new THREE.Vector3();

    // ---------------- THE BIG FOUR BRIDGE ----------------
    const bridge = new THREE.Group();
    bridge.position.set(12.5, 0, -7);
    bridge.rotation.y = Math.atan2(22, 33);
    scene.add(bridge);
    const steelMat = new THREE.MeshStandardMaterial({ color: C.steelD.clone(), flatShading: true, roughness: .6, metalness: .3 });
    const pierMat = new THREE.MeshStandardMaterial({ color: 0xa9a293, flatShading: true });
    const SPANS = 7, SPAN = 7, DECK = 4.6, HALF = 1.05, PANELS = 8;
    const beams = [];
    const ledPts = [];
    const topY = (t) => DECK + 0.9 + 2.5 * Math.pow(Math.sin(Math.PI * t), 0.75);
    for (let s = 0; s < SPANS; s++) {
        const z0 = s * SPAN;
        for (const side of [-HALF, HALF]) {
            const top = [], bot = [];
            for (let p = 0; p <= PANELS; p++) {
                const t = p / PANELS, z = z0 + t * SPAN;
                top.push(new THREE.Vector3(side, p === 0 || p === PANELS ? DECK : topY(t), z));
                bot.push(new THREE.Vector3(side, DECK, z));
            }
            for (let p = 0; p < PANELS; p++) {
                beams.push(beam(top[p], top[p + 1], .11));
                beams.push(beam(bot[p], bot[p + 1], .1));
                if (p > 0) beams.push(beam(bot[p], top[p], .06));
                beams.push(p < PANELS / 2 ? beam(top[p], bot[p + 1], .05) : beam(bot[p], top[p + 1], .05));
            }
            for (let k = 0; k <= 30; k++) {
                const t = k / 30;
                ledPts.push({ pos: new THREE.Vector3(side, (t === 0 || t === 1 ? DECK : topY(t)) + .16, z0 + t * SPAN), along: z0 + t * SPAN, side });
            }
        }
        for (let p = 1; p < PANELS; p++) {
            const t = p / PANELS, z = z0 + t * SPAN, y = topY(t);
            beams.push(beam(new THREE.Vector3(-HALF, y, z), new THREE.Vector3(HALF, y, z), .05));
        }
        const pier = new THREE.Mesh(new THREE.BoxGeometry(3.2, DECK + 1.2, 1.4), pierMat);
        pier.position.set(0, (DECK - 1.2) / 2, z0);
        bridge.add(pier);
    }
    const truss = new THREE.Mesh(mergeBeams(beams), steelMat);
    bridge.add(truss);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.3, .28, SPANS * SPAN), steelMat);
    deck.position.set(0, DECK, SPANS * SPAN / 2);
    bridge.add(deck);
    const leds = new THREE.InstancedMesh(new THREE.SphereGeometry(.13, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), ledPts.length);
    ledPts.forEach((l, i) => { tm.makeTranslation(l.pos.x, l.pos.y, l.pos.z); leds.setMatrixAt(i, tm); leds.setColorAt(i, new THREE.Color(1, 1, 1)); });
    bridge.add(leds);
    const bridgeHit = new THREE.Mesh(new THREE.BoxGeometry(4, DECK + 4.5, SPANS * SPAN), new THREE.MeshBasicMaterial({ visible: false }));
    bridgeHit.position.set(0, (DECK + 4.5) / 2, SPANS * SPAN / 2);
    bridge.add(bridgeHit);
    let ledMode = 0;
    const LED_MODES = ['rainbow', 'cards', 'divided', 'sparkle', 'gold'];

    // ---------------- THE BELLE ----------------
    // lane z=2 threads between the bridge piers; the raised deck clears the stacks
    const belle = makeSteamboat({ scale: 1.1 });
    belle.position.set(-4, 0.15, 2);
    scene.add(belle);
    const belleHit = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 3), new THREE.MeshBasicMaterial({ visible: false }));
    belleHit.position.set(0, 1.6, 0);
    belle.add(belleHit);
    let belleToot = 0;

    // smoke puffs
    const puffTex = softDotTexture();
    const puffs = [];
    for (let i = 0; i < 46; i++) {
        const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0x9a968e, transparent: true, opacity: 0, depthWrite: false }));
        spr.visible = false;
        scene.add(spr);
        puffs.push({ spr, life: 0, max: 1, v: new THREE.Vector3() });
    }
    let puffTimer = 0;
    const tmpV = new THREE.Vector3();
    function puff(big = false) {
        const p = puffs.find(q => q.life <= 0);
        if (!p) return;
        belle.localToWorld(tmpV.copy(belle.userData.stackTop));
        p.spr.position.copy(tmpV);
        p.life = p.max = big ? 3.2 : 2.4;
        p.v.set(-.6 + Math.random() * .3, big ? 2.2 : 1.2, (Math.random() - .5) * .4);
        p.big = big;
        p.spr.visible = true;
    }

    // ---------------- FLEUR ----------------
    const fleurMat = new THREE.MeshStandardMaterial({ color: 0xeaff00, emissive: 0x4a5200, metalness: .35, roughness: .35 });
    const fleur = new THREE.Mesh(fleurGeometry(), fleurMat);
    fleur.scale.setScalar(4.2);
    const fleurHome = new THREE.Vector3(15, 20.5, -30);
    fleur.position.copy(fleurHome);
    scene.add(fleur);
    let fleurSpin = 0;

    // ---------------- POPE LICK TRESTLE ----------------
    const hillMat = new THREE.MeshStandardMaterial({ color: 0xbfc7ae, flatShading: true });
    const hillA = new THREE.Mesh(new THREE.IcosahedronGeometry(10, 1), hillMat);
    hillA.scale.set(1.15, 1.3, 1); hillA.position.set(37, -1, -68);
    const hillB = hillA.clone(); hillB.position.set(63, -2, -70); hillB.scale.set(1.1, 1.25, 1);
    scene.add(hillA, hillB);
    const tb = [];
    const TY = 13.5;
    for (let x = 42; x <= 58; x += 1.75) {
        const zc = -66;
        tb.push(beam(new THREE.Vector3(x, TY, zc - .9), new THREE.Vector3(x - .2, -1, zc - 2.6), .12));
        tb.push(beam(new THREE.Vector3(x, TY, zc + .9), new THREE.Vector3(x - .2, -1, zc + 2.6), .12));
        tb.push(beam(new THREE.Vector3(x, TY * .66, zc - 1.35), new THREE.Vector3(x, TY * .33, zc + 2.1), .06));
        tb.push(beam(new THREE.Vector3(x, TY * .66, zc + 1.35), new THREE.Vector3(x, TY * .33, zc - 2.1), .06));
    }
    tb.push(beam(new THREE.Vector3(38, TY, -66.9), new THREE.Vector3(62, TY, -66.9), .2));
    tb.push(beam(new THREE.Vector3(38, TY, -65.1), new THREE.Vector3(62, TY, -65.1), .2));
    const trestle = new THREE.Mesh(mergeBeams(tb), steelMat);
    scene.add(trestle);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1a1a, toneMapped: false, transparent: true, opacity: 0, fog: false });
    const eyes = new THREE.Group();
    [-0.55, 0.55].forEach(dx => { const e = new THREE.Mesh(new THREE.SphereGeometry(.34, 10, 8), eyeMat); e.position.x = dx; eyes.add(e); });
    const EYES_X = 50;
    eyes.position.set(EYES_X, 5.4, -60);
    scene.add(eyes);
    const eyesHit = new THREE.Mesh(new THREE.SphereGeometry(4.2, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    eyesHit.position.copy(eyes.position);
    scene.add(eyesHit);

    // ---------------- CLOUDS ----------------
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: 1, roughness: 1 });
    const clouds = [];
    for (let i = 0; i < 7; i++) {
        const g = new THREE.Group();
        const n = 4 + Math.floor(rnd() * 4);
        for (let k = 0; k < n; k++) {
            const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + rnd() * 2.2, 0), cloudMat);
            m.position.set(k * 2.2 - n, rnd() * 1.4, rnd() * 1.5);
            g.add(m);
        }
        g.position.set(-90 + i * 30 + rnd() * 12, 26 + rnd() * 14, -80 - rnd() * 40);
        g.userData.speed = .5 + rnd() * .8;
        clouds.push(g);
        scene.add(g);
    }

    // ---------------- SHOOTING STAR ----------------
    const shoot = new THREE.Mesh(new THREE.CylinderGeometry(.06, .5, 12, 6), new THREE.MeshBasicMaterial({ color: 0xaaf6ff, toneMapped: false, transparent: true, fog: false }));
    shoot.visible = false;
    scene.add(shoot);
    const shootHit = new THREE.Mesh(new THREE.SphereGeometry(7, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(shootHit);
    const star = { active: false, t: 0, next: 9 + Math.random() * 10, p: new THREE.Vector3(), v: new THREE.Vector3() };
    const sparkles = [];
    for (let i = 0; i < 24; i++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0xaaf6ff, transparent: true, opacity: 0, depthWrite: false, fog: false }));
        s.visible = false; s.scale.setScalar(2);
        scene.add(s);
        sparkles.push({ s, life: 0, v: new THREE.Vector3() });
    }
    function burstSparkles(at, color = 0xaaf6ff) {
        sparkles.forEach(sp => {
            sp.s.position.copy(at);
            sp.s.material.color.setHex(color);
            sp.v.set((Math.random() - .5) * 30, (Math.random() - .3) * 24, (Math.random() - .5) * 10);
            sp.life = 1.2 + Math.random() * .6;
            sp.s.visible = true;
        });
    }

    // ---------------- POST ----------------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .85, .45, .22);
    bloom.enabled = false;
    composer.addPass(bloom);
    const riso = makeRisoPass({ THREE, ShaderPass }, { dot: 5.2 * DPR });
    composer.addPass(riso);

    // ---------------- CAMERA ----------------
    const target = new THREE.Vector3();
    function placeCamera() {
        const aspect = S.W / S.H;
        const portrait = aspect < 1;
        const wantW = lerp(portrait ? 38 : 66, 84, S.compact);
        let dist = 50;
        let fov = 2 * Math.atan((wantW / 2) / (dist * aspect)) * 180 / Math.PI;
        if (fov > 56) { fov = 56; dist = (wantW / 2) / (Math.tan(28 * Math.PI / 180) * aspect); }
        fov = Math.max(fov, 7);
        camera.fov = fov;
        target.set(S.pxS * 1.2, lerp(portrait ? 4.5 : 7.4, 10.5, S.compact), -14);
        camera.position.set(target.x + S.pxS * 2.6, target.y + 1.4 - S.pyS * 1.2 + (portrait ? 2 : 0), target.z + dist);
        camera.lookAt(target);
        camera.updateProjectionMatrix();
    }

    function resize() {
        const r = container.getBoundingClientRect();
        S.W = Math.max(1, Math.round(r.width));
        S.H = Math.max(1, Math.round(r.height));
        renderer.setSize(S.W, S.H, false);
        composer.setSize(S.W, S.H);
        renderer.getDrawingBufferSize(riso.uniforms.uRes.value);
        camera.aspect = S.W / S.H;
        placeCamera();
        if (!running) renderOnce();
    }

    // ---------------- INTERACTION ----------------
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const clickables = [
        { obj: bridgeHit, fn: () => clickBridge() },
        { obj: belleHit, fn: () => clickBelle() },
        { obj: batHit, fn: () => clickBat() },
        { obj: fleur, fn: () => clickFleur() },
        { obj: sun, fn: () => on.toggleTheme?.(), when: () => S.night < .5 },
        { obj: moon, fn: () => on.toggleTheme?.(), when: () => S.night >= .5 },
        { obj: shootHit, fn: () => clickStar(), when: () => star.active },
        { obj: eyesHit, fn: () => clickEyes(), when: () => S.night > .6 },
    ];

    function pick(e) {
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        const live = clickables.filter(c => !c.when || c.when());
        const hits = raycaster.intersectObjects(live.map(c => c.obj), false);
        if (!hits.length) return null;
        // tiny, rare targets win even if a big hitbox (the bridge) is in front
        const hit = hits.find(h => h.object === eyesHit || h.object === shootHit) || hits[0];
        return live.find(c => c.obj === hit.object) || null;
    }

    let hoverQueued = false, lastMove = null;
    const onMove = (e) => {
        const r = container.getBoundingClientRect();
        S.px = ((e.clientX - r.left) / r.width) * 2 - 1;
        S.py = ((e.clientY - r.top) / r.height) * 2 - 1;
        if (e.pointerType === 'mouse') {
            lastMove = e;
            if (!hoverQueued) {
                hoverQueued = true;
                requestAnimationFrame(() => {
                    hoverQueued = false;
                    if (lastMove && lastMove.target === canvas) container.classList.toggle('gl-hover', !!pick(lastMove));
                    else container.classList.remove('gl-hover');
                });
            }
        }
    };
    const onLeave = () => { S.px = 0; S.py = 0; container.classList.remove('gl-hover'); };
    const onClick = (e) => {
        const hit = pick(e);
        if (hit) { hit.fn(); on.interacted?.(); }
    };
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('click', onClick);

    function clickBridge() {
        ledMode = (ledMode + 1) % LED_MODES.length;
        on.egg?.('bridge', LED_MODES[ledMode]);
    }
    function clickBelle() {
        belleToot = 1.6;
        for (let i = 0; i < 7; i++) setTimeout(() => puff(true), i * 110);
        on.egg?.('belle');
    }
    function clickBat() {
        if (batSwing.t >= 0) return;
        batSwing.t = 0;
        batSwing.hit = false;
        on.egg?.('batswing');
    }
    function clickFleur() {
        fleurSpin = 1;
        on.egg?.('fleur3d');
    }
    function clickStar() {
        star.active = false;
        shoot.visible = false;
        burstSparkles(star.p);
        on.egg?.('star');
    }
    function clickEyes() {
        on.egg?.('pope');
    }

    // ---------------- LOOP ----------------
    let running = false, raf = 0, last = performance.now();
    const col = new THREE.Color();
    const q = new THREE.Quaternion();

    function update(dt) {
        const T = S.t += dt;
        const k = reducedMotion ? 0.35 : 1;

        S.night = damp(S.night, S.nightT, 3.2, dt);
        S.neon = damp(S.neon, S.neonT, 3.6, dt);
        S.compact = damp(S.compact, S.compactT, 5, dt);
        S.pxS = damp(S.pxS, reducedMotion ? 0 : S.px, 2.2, dt);
        S.pyS = damp(S.pyS, reducedMotion ? 0 : S.py, 2.2, dt);
        const N = Math.max(S.night, S.neon);
        const X = S.neon;

        // palette
        skyU.uTop.value.copy(C.skyTopD).lerp(C.skyTopN, S.night).lerp(C.skyTopX, X);
        skyU.uHor.value.copy(C.skyHorD).lerp(C.skyHorN, S.night).lerp(C.skyHorX, X);
        scene.fog.color.copy(C.fogD).lerp(C.fogN, S.night).lerp(C.fogX, X);
        groundMat.color.copy(C.groundD).lerp(C.groundN, N);
        hillMat.color.setHex(0xbfc7ae).lerp(C.groundN, N);
        waterMat.color.copy(C.waterD).lerp(C.waterN, S.night).lerp(C.waterX, X);
        steelMat.color.copy(C.steelD).lerp(C.steelN, N);
        hemi.intensity = lerp(1.7, .32, N);
        hemi.color.setHex(0xffffff).lerp(col.setHex(0x6b7cff), N);
        sunLight.intensity = lerp(2.5, .55, N);
        sunLight.color.setHex(0xfff4d8).lerp(col.setHex(0x9fb6ff), N);
        rimLight.intensity = X * 2.2;
        rimLight.color.setHex(0x00c2ff);
        const win = lerp(0, 1.25, N);
        bMat.emissiveIntensity = pinkMat.emissiveIntensity = darkMat.emissiveIntensity = win;
        bMat.emissive.setHex(0xffffff).lerp(col.setHex(0xff7ad0), X * .6);
        pinkMat.emissive.copy(bMat.emissive);
        darkMat.emissive.copy(bMat.emissive);
        sun.material.opacity = 1 - S.night;
        moon.material.opacity = S.night;
        bite.material.opacity = S.night * .98;
        bite.material.color.copy(skyU.uTop.value).lerp(skyU.uHor.value, .35);
        sun.visible = sun.material.opacity > .01;
        moon.visible = bite.visible = moon.material.opacity > .01;
        stars.material.opacity = N * .95;
        stars.visible = N > .02;
        cloudMat.opacity = 1 - N;
        clouds.forEach(c => { c.visible = N < .98; });
        edges.material.opacity = X;
        edges.visible = X > .01;
        bloom.enabled = X > .01;
        bloom.strength = X * .85;
        riso.uniforms.uAmount.value = 1 - X;
        riso.uniforms.uNight.value = S.night;
        eyeMat.opacity = Math.max(0, (N - .55) / .45);
        eyes.visible = eyeMat.opacity > .01;

        // water + clouds
        waterU.uTime.value = T * k;
        clouds.forEach(c => { c.position.x += c.userData.speed * dt * k; if (c.position.x > 120) c.position.x = -120; });

        // Belle cruising upriver
        belle.position.x += dt * 1.25 * k;
        if (belle.position.x > 58) belle.position.x = -58;
        belle.position.y = .15 + Math.sin(T * 1.6) * .07;
        belle.rotation.z = Math.sin(T * 1.1) * .018;
        belle.rotation.x = Math.sin(T * .9) * .012;
        belle.userData.wheel.rotation.z -= dt * 2.4 * k;
        belle.userData.flag.rotation.y = Math.sin(T * 5) * .25;
        puffTimer -= dt;
        if (puffTimer <= 0) { puff(false); puffTimer = .45 + Math.random() * .3; }
        belleToot = Math.max(0, belleToot - dt);
        puffs.forEach(p => {
            if (p.life <= 0) return;
            p.life -= dt;
            const a = 1 - p.life / p.max;
            p.spr.position.addScaledVector(p.v, dt);
            p.v.y *= .985;
            p.spr.scale.setScalar((p.big ? 1.2 : .7) + a * (p.big ? 4.6 : 2.6));
            p.spr.material.opacity = Math.sin(Math.min(1, a * 1.2) * Math.PI) * (p.big ? .85 : .6);
            p.spr.material.color.setHex(N > .5 ? 0x6d6a78 : 0x9a968e);
            if (p.life <= 0) p.spr.visible = false;
        });

        // bridge LEDs
        const ledK = lerp(.62, 1, N) * (1 + X * .8);
        const mode = LED_MODES[ledMode];
        ledPts.forEach((l, i) => {
            const u = l.along;
            if (mode === 'rainbow') col.setHSL(((u * .018 - T * .22) % 1 + 1) % 1, 1, .55);
            else if (mode === 'cards') col.setHex(Math.floor(u * .9 - T * 5) % 3 === 0 ? 0x220000 : 0xff1a2e);
            else if (mode === 'divided') col.setHex(l.side < 0 ? 0xff1a2e : 0x1a5cff).multiplyScalar(.6 + .4 * Math.sin(u * .6 - T * 4));
            else if (mode === 'sparkle') col.setScalar(Math.random() < .08 ? 1.4 : .12);
            else col.setHex(0xffc400).multiplyScalar(.45 + .55 * Math.abs(Math.sin(u * .25 - T * 2)));
            col.multiplyScalar(ledK);
            leds.setColorAt(i, col);
        });
        leds.instanceColor.needsUpdate = true;

        // fleur
        fleurSpin = Math.max(0, fleurSpin - dt * .55);
        fleur.rotation.y += dt * (.45 + fleurSpin * fleurSpin * 18) * k;
        fleur.position.y = fleurHome.y + Math.sin(T * .8) * .6;
        fleur.rotation.z = Math.sin(T * .6) * .06;
        fleurMat.emissive.setHex(0x4a5200).lerp(col.setHex(0xb8c800), Math.max(X, fleurSpin));

        // bat swing
        if (batSwing.t >= 0) {
            batSwing.t += dt;
            const t = batSwing.t;
            let a;
            if (t < .35) a = lerp(batRest, batRest + .35, easeOutBack(t / .35));                 // wind up
            else if (t < .52) a = lerp(batRest + .35, -1.45, Math.pow((t - .35) / .17, 2));       // SWING
            else if (t < 2.2) a = lerp(-1.45, batRest, easeOutBack((t - .52) / 1.68));            // settle
            else { a = batRest; batSwing.t = -1; }
            batPivot.rotation.z = a;
            if (!batSwing.hit && t >= .47) {
                batSwing.hit = true;
                ball.visible = true;
                ball.position.set(batPivot.position.x + 3.8, 5.5, batPivot.position.z + 1.5);
                ballV.set(15, 24, 17);
                on.egg?.('homerun');
            }
        }
        if (ball.visible) {
            ballV.y -= 16 * dt;
            ball.position.addScaledVector(ballV, dt);
            ball.rotation.x += dt * 20;
            if (ball.position.y < -5 || ball.position.z > 60) ball.visible = false;
        }

        // shooting star
        if (N > .6) {
            star.next -= dt;
            if (!star.active && star.next <= 0) {
                star.active = true;
                star.t = 0;
                star.p.set(10 + Math.random() * 40, 34 + Math.random() * 10, -90);
                star.v.set(-(28 + Math.random() * 10), -(6 + Math.random() * 5), 0);
                q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), star.v.clone().normalize().negate());
                shoot.quaternion.copy(q);
                shoot.visible = true;
            }
        }
        if (star.active) {
            star.t += dt;
            star.p.addScaledVector(star.v, dt);
            shoot.position.copy(star.p).addScaledVector(star.v.clone().normalize(), -6);
            shootHit.position.copy(star.p);
            shoot.material.opacity = Math.min(1, star.t * 4) * Math.max(0, 1 - (star.t - 1.6) * 2);
            if (star.t > 2.1) { star.active = false; shoot.visible = false; star.next = 16 + Math.random() * 18; }
        }
        sparkles.forEach(sp => {
            if (sp.life <= 0) return;
            sp.life -= dt;
            sp.s.position.addScaledVector(sp.v, dt);
            sp.v.multiplyScalar(.96);
            sp.s.material.opacity = Math.max(0, sp.life);
            if (sp.life <= 0) sp.s.visible = false;
        });

        // Pope Lick eyes blink + drift
        const blink = (T % 5.3) < .12 ? .1 : 1;
        eyes.scale.set(1, blink, 1);
        eyes.position.x = EYES_X + Math.sin(T * .3) * .8;

        placeCamera();
    }

    function renderOnce() {
        composer.render();
    }

    function frame(now) {
        if (!running) return;
        const dt = Math.min(.05, (now - last) / 1000);
        last = now;
        update(dt);
        composer.render();
        raf = requestAnimationFrame(frame);
    }

    function start() {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
    }
    function stop() {
        running = false;
        cancelAnimationFrame(raf);
    }

    // run only while visible
    let inView = true;
    const io = new IntersectionObserver((ents) => {
        inView = ents[0].isIntersecting;
        inView && !document.hidden ? start() : stop();
    }, { threshold: 0.01 });
    io.observe(container);
    const onVis = () => (!document.hidden && inView ? start() : stop());
    document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    resize();
    update(0.016);
    renderOnce();
    start();

    return {
        setNight(v) { S.nightT = v ? 1 : 0; },
        setNeon(v) { S.neonT = v ? 1 : 0; },
        setCompact(v) { S.compactT = v ? 1 : 0; },
        spinFleur() { fleurSpin = 1; },
        swingBat() { clickBat(); },
        toot() { clickBelle(); },
        dispose() {
            stop();
            io.disconnect();
            ro.disconnect();
            document.removeEventListener('visibilitychange', onVis);
            container.removeEventListener('pointermove', onMove);
            container.removeEventListener('pointerleave', onLeave);
            canvas.removeEventListener('click', onClick);
            renderer.dispose();
        }
    };
}
