// --- js/three/hero.js ---
// The masthead: a clickable 3D Louisville. Daylight by day; neon noir with the switch on.
// Skyline + Ohio River + Big Four Bridge + the Belle + the Big Bat + a floating fleur.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { makeRisoPass, printClean } from './riso.js';
import { ADS, loadAds, makeHouseAds, drawHouseAds } from '../ads.js';
import { fleurGeometry, fleurOutline, batGeometry, beam, mergeBeams, makeSteamboat, softDotTexture, windowTextures, towerBox } from './shapes.js';

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
const easeInOutCubic = (x) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
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
        skyTopX: new THREE.Color(0x03050f), skyHorX: new THREE.Color(0x1a1846),
        fogD: new THREE.Color(0xeee8d8), fogN: new THREE.Color(0x0d0c14), fogX: new THREE.Color(0x0b1030),
        groundD: new THREE.Color(0xb9b3a4), groundN: new THREE.Color(0x14131a),
        waterD: new THREE.Color(0xb3d2dc), waterN: new THREE.Color(0x0e1826), waterX: new THREE.Color(0x060b1c),
        steelD: new THREE.Color(0x5b6166), steelN: new THREE.Color(0x1c1f24),
        glowA: new THREE.Color(0xff4fa3), glowB: new THREE.Color(0x2fd4ff),
        tmp: new THREE.Color(), tmp2: new THREE.Color(),
    };

    // ---------------- SKY ----------------
    const skyU = { uTop: { value: C.skyTopD.clone() }, uHor: { value: C.skyHorD.clone() }, uGlowA: { value: C.glowA }, uGlowB: { value: C.glowB }, uGlow: { value: 0 } };
    const sky = new THREE.Mesh(
        new THREE.SphereGeometry(400, 32, 16),
        new THREE.ShaderMaterial({
            side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
            vertexShader: `varying vec3 vP; void main(){ vP = (modelMatrix * vec4(position,1.)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vP,1.); }`,
            fragmentShader: `uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uGlowA; uniform vec3 uGlowB; uniform float uGlow; varying vec3 vP; void main(){ vec3 d = normalize(vP); float h = d.y; vec3 c = mix(uHor, uTop, smoothstep(-0.02, 0.45, h)); vec3 g = mix(uGlowA, uGlowB, smoothstep(-0.1, 0.5, d.x)); c += g * uGlow * (1. - smoothstep(0.0, 0.2, h)) * smoothstep(-0.06, 0.0, h); gl_FragColor = vec4(c, 1.); }`
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
    const orbPos = new THREE.Vector3(-27, 30, -110);
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

    // A skipping stone + splash rings (click the river)
    const stone = { m: new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8d8a84, roughness: .8, flatShading: true })), hops: null, i: 0, t: 0, n: 0 };
    stone.m.scale.set(1, .45, 1);
    stone.m.visible = false;
    scene.add(stone.m);
    const rings = [];
    for (let i = 0; i < 10; i++) {
        const m = new THREE.Mesh(new THREE.RingGeometry(.28, .4, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false }));
        m.visible = false;
        scene.add(m);
        rings.push({ m, life: 0 });
    }
    function ring(at) {
        const r = rings.find(x => x.life <= 0) || rings[0];
        r.m.position.set(at.x, .34, at.z);
        r.life = 1;
        r.m.visible = true;
    }

    // Neon reflections: soft coloured streaks on the river under the bright stuff.
    // Additive and kept below the bloom threshold, so they shimmer without flaring.
    const fadeC = document.createElement('canvas');
    fadeC.width = 8; fadeC.height = 128;
    const fx = fadeC.getContext('2d');
    const fg = fx.createLinearGradient(0, 0, 0, 128);
    fg.addColorStop(0, '#fff'); fg.addColorStop(.35, '#888'); fg.addColorStop(1, '#000');
    fx.fillStyle = fg; fx.fillRect(0, 0, 8, 128);
    const fadeTex = new THREE.CanvasTexture(fadeC);
    const rr = mulberry32(77);           // own seed so the city layout (rnd) is unchanged
    const ripC = document.createElement('canvas');
    ripC.width = 32; ripC.height = 128;
    const rx = ripC.getContext('2d');
    for (let y = 0; y < 128; y += 2) {
        const a = .25 + rr() * .75;
        rx.fillStyle = `rgba(255,255,255,${a})`;
        const w = 10 + rr() * 22;
        rx.fillRect(16 - w / 2, y, w, 1 + Math.floor(rr() * 2));
    }
    const ripTex = new THREE.CanvasTexture(ripC);
    ripTex.wrapT = THREE.RepeatWrapping;
    const streaks = [];
    [
        [-16, 0xffc46b, .9], [-12.5, 0xff4fa3, 1.1], [-9, 0xffc46b, .8], [-4.5, 0x2fd4ff, 1], [-1, 0xffc46b, .9],
        [.6, 0xff4fa3, .8], [4.2, 0xb06bff, .9], [7.5, 0xffc46b, .7], [15, 0xd9ff3a, 1.2],
        [19, 0xff4fa3, 1.3], [24, 0xb06bff, 1.3], [29, 0x2fd4ff, 1.4], [-27, 0xffc46b, .8], [-22, 0x2fd4ff, .8],
    ].forEach(([x, c, w], i) => {
        const len = 9 + (i % 4) * 2.2;
        const map = ripTex.clone();
        map.offset.y = i * .37;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: c, map, alphaMap: fadeTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
        m.position.set(x, .3, -7 + len / 2);
        m.visible = false;
        scene.add(m);
        streaks.push({ m, base: .38 + (i % 3) * .1, ph: i * 1.7 });
    });

    // ---------------- BUILDINGS ----------------
    const tex = windowTextures();
    const bMat = new THREE.MeshStandardMaterial({ map: tex.day, emissiveMap: tex.night, emissive: 0xffffff, emissiveIntensity: 0, flatShading: true, roughness: .9 });
    const pinkMat = bMat.clone(); pinkMat.color = new THREE.Color(0xf0cfc4);
    const darkMat = bMat.clone(); darkMat.color = new THREE.Color(0x9aa0a6);

    const towerGeos = [];
    const occupied = [];
    const NEON = [0xff4fa3, 0x2fd4ff, 0xb06bff, 0xffb347, 0x3dffb0].map(h => new THREE.Color(h).multiplyScalar(1.9));
    const neonPos = [], neonCol = [];
    let neonIdx = 0;
    const addNeon = (g, topOnly) => {
        const e = new THREE.EdgesGeometry(g, 20), p = e.attributes.position;
        let top = -Infinity;
        for (let i = 0; i < p.count; i++) top = Math.max(top, p.getY(i));
        const c = NEON[neonIdx++ % NEON.length];
        for (let i = 0; i < p.count; i += 2) {
            let y0 = p.getY(i), y1 = p.getY(i + 1);
            if (topOnly && (y0 < top - .01 || y1 < top - .01)) {
                // corner posts: keep just the top of the vertical edge, so the crown reads from below
                const vertical = Math.abs(p.getX(i) - p.getX(i + 1)) < .01 && Math.abs(p.getZ(i) - p.getZ(i + 1)) < .01;
                if (!vertical || Math.max(y0, y1) < top - .01) continue;
                y0 = top; y1 = top - Math.min(1.3, Math.abs(p.getY(i) - p.getY(i + 1)) * .25);
            }
            neonPos.push(p.getX(i), y0, p.getZ(i), p.getX(i + 1), y1, p.getZ(i + 1));
            neonCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
        }
        e.dispose();
    };
    const addTower = (x, z, w, h, d, { mat = null, lift = 0.2, neon = true } = {}) => {
        const g = towerBox(w, h, d);
        g.translate(x, lift + h / 2, z);
        occupied.push({ x, z, w, d });
        if (neon) addNeon(g, true);
        if (mat) { const m = new THREE.Mesh(g, mat); scene.add(m); return m; }
        towerGeos.push(g);
        return null;
    };
    const addPart = (geo, mat, x, y, z) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        scene.add(m);
        addNeon(geo.clone().translate(x, y, z), false);
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
    occupied.push({ x: -20.5, z: -12, w: 2.4, d: 2.4 });     // billboard pole

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
        addTower(x, z, w, Math.max(1.4, h), d, { neon: h > 4.5 && i % 3 !== 2 });
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

    // ---------------- THE BILLBOARD ----------------
    // Parody ads from /ads (see js/ads.js). Tri-vision slats flip to the next ad every ADS.seconds.
    const BB_W = 14, BB_H = BB_W * ADS.height / ADS.width, SLATS = 14, SLAT_W = BB_W / SLATS;
    const SLAT_R = SLAT_W / (2 * Math.sqrt(3));              // prism inradius (circumradius is 2x)
    const TRI = Math.PI * 2 / 3;
    const BB_SPOTS = {
        wide: { x: -20.5, y: 0.2, z: -12, faceY: 16, scale: 1 },
        tall: { x: -6, y: 0.2, z: -34, faceY: 30, scale: 1.3 },
    };
    const billboard = new THREE.Group();
    const bbFace = new THREE.Group();
    billboard.add(bbFace);
    scene.add(billboard);

    // three sides per slat; every slat's side p shares one canvas, sliced by UV
    const bbSides = [0, 1, 2].map(() => {
        const c = document.createElement('canvas');
        c.width = ADS.width;
        c.height = ADS.height;
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        return { ctx: c.getContext('2d'), tex, mat: printClean(new THREE.MeshBasicMaterial({ map: tex, fog: false })) };
    });
    const bbSlats = [];
    for (let j = 0; j < SLATS; j++) {
        const slat = new THREE.Group();
        slat.position.x = -BB_W / 2 + SLAT_W * (j + .5);
        for (let p = 0; p < 3; p++) {
            const g = new THREE.PlaneGeometry(SLAT_W * 1.004, BB_H);
            const uv = g.attributes.uv;
            for (let i = 0; i < uv.count; i++) uv.setX(i, (j + uv.getX(i)) / SLATS);
            const m = new THREE.Mesh(g, bbSides[p].mat);
            m.rotation.y = p * TRI;
            m.position.set(Math.sin(p * TRI) * SLAT_R, 0, Math.cos(p * TRI) * SLAT_R);
            slat.add(m);
        }
        bbFace.add(slat);
        bbSlats.push({ g: slat, from: 0, to: 0 });
    }

    // frame, catwalk, lamps
    const bbDark = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: .6, metalness: .35, flatShading: true });
    const bbSteel = new THREE.MeshStandardMaterial({ color: 0x585e63, roughness: .55, metalness: .45, flatShading: true });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, emissive: 0xfff1c2, emissiveIntensity: .15 });
    const bbBox = (w, h, d, x, y, z, mat) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        bbFace.add(m);
        return m;
    };
    const DEPTH = SLAT_R * 3 + .5, ZC = -SLAT_R * .5, FRONT = ZC + DEPTH / 2;
    bbBox(BB_W + .3, BB_H + .3, .3, 0, 0, -SLAT_R * 2 - .2, bbDark);                 // back panel
    bbBox(BB_W + 1, .5, DEPTH, 0, BB_H / 2 + .25, ZC, bbDark);                       // bezel
    bbBox(BB_W + 1, .5, DEPTH, 0, -BB_H / 2 - .25, ZC, bbDark);
    bbBox(.5, BB_H + 1, DEPTH, -BB_W / 2 - .25, 0, ZC, bbDark);
    bbBox(.5, BB_H + 1, DEPTH, BB_W / 2 + .25, 0, ZC, bbDark);
    const plateC = document.createElement('canvas');
    plateC.width = 256; plateC.height = 32;
    const plateX = plateC.getContext('2d');
    const paintPlate = () => {
        plateX.fillStyle = '#eaff00'; plateX.fillRect(0, 0, 256, 32);
        plateX.fillStyle = '#141414'; plateX.font = '700 19px "Space Mono", monospace'; plateX.textAlign = 'center'; plateX.textBaseline = 'middle';
        plateX.fillText('\u269C WIKI OUTDOOR', 128, 17);
        plateTex.needsUpdate = true;
    };
    const plateTex = new THREE.CanvasTexture(plateC);
    plateTex.colorSpace = THREE.SRGBColorSpace;
    paintPlate();
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(3.2, .4), printClean(new THREE.MeshBasicMaterial({ map: plateTex, fog: false })));
    plate.position.set(0, -BB_H / 2 - .25, FRONT + .01);
    bbFace.add(plate);
    const catY = -BB_H / 2 - .62;
    bbBox(BB_W + .6, .1, 1.3, 0, catY, FRONT + .5, bbSteel);                        // catwalk
    bbBox(BB_W + .6, .06, .06, 0, catY + .62, FRONT + 1.1, bbSteel);                 // rail
    for (let k = 0; k <= 6; k++) bbBox(.06, .62, .06, -BB_W / 2 + k * BB_W / 6, catY + .31, FRONT + 1.1, bbSteel);
    bbBox(BB_W * .62, .45, .45, 0, catY - .35, ZC, bbSteel);                         // header beam
    for (let k = 0; k < 4; k++) {
        const x = -BB_W / 2 + BB_W * (k + .5) / 4;
        bbBox(.06, .06, 1.1, x, catY + .1, FRONT + 1.6, bbSteel);                    // lamp arm
        bbBox(.55, .22, .32, x, catY + .24, FRONT + 2.15, lampMat).rotation.x = -.6;
    }
    const bbPole = new THREE.Mesh(new THREE.CylinderGeometry(.42, .55, 1, 10).translate(0, .5, 0), bbSteel);
    billboard.add(bbPole);
    const bbHit = bbBox(BB_W + 1, BB_H + 1, DEPTH, 0, 0, ZC, new THREE.MeshBasicMaterial({ visible: false }));

    let bbSpot = null;
    function placeBillboard(portrait) {
        const s = BB_SPOTS[portrait ? 'tall' : 'wide'];
        if (bbSpot === s) return;
        bbSpot = s;
        billboard.position.set(s.x, s.y, s.z);
        billboard.scale.setScalar(s.scale);
        const localY = (s.faceY - s.y) / s.scale;
        bbFace.position.y = localY;
        bbPole.scale.y = Math.max(.1, localY + catY - .58);
        billboard.rotation.y = Math.atan2(-s.x, 40 - s.z) * .9;                     // angle it at the viewer
    }

    const houseAds = makeHouseAds();
    const bb = { ads: houseAds, idx: 0, side: 0, timer: 0, flip: -1, shown: null };
    function paintSide(side, img) {
        const { ctx, tex } = bbSides[side];
        const W = ADS.width, H = ADS.height;
        const k = Math.min(W / img.width, H / img.height);      // letterbox, never stretch
        const w = img.width * k, h = img.height * k;
        ctx.fillStyle = '#141414';
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
        tex.needsUpdate = true;
    }
    paintSide(0, houseAds[0]);
    bb.shown = houseAds[0];
    function nextAd(force = false) {
        if (bb.flip >= 0) return;
        const i = (bb.idx + 1) % bb.ads.length;
        const img = bb.ads[i];
        bb.timer = 0;
        if (!force && img === bb.shown) return;
        bb.idx = i;
        bb.side = (bb.side + 1) % 3;
        paintSide(bb.side, img);
        bb.shown = img;
        bbSlats.forEach(s => { s.from = s.g.rotation.y; s.to = s.from - TRI; });
        if (reducedMotion) bbSlats.forEach(s => { s.g.rotation.y = s.to; });
        else bb.flip = 0;
    }
    loadAds().then(imgs => {
        if (!imgs.length) return;
        bb.ads = imgs;
        bb.idx = imgs.length - 1;       // next flip lands on ad #1
        bb.timer = ADS.seconds;         // ...right away
    });
    document.fonts?.ready.then(() => {
        drawHouseAds(houseAds);
        paintPlate();
        if (houseAds.includes(bb.shown)) paintSide(bb.side, bb.shown);
    });

    // Neon crown outlines (only seen when the neon switch is on)
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(neonPos, 3));
    edgeGeo.setAttribute('color', new THREE.Float32BufferAttribute(neonCol, 3));
    const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, fog: false, toneMapped: false }));
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
    const fleurTube = new THREE.LineSegments(fleurOutline(), new THREE.LineBasicMaterial({ color: new THREE.Color(0xd9ff3a).multiplyScalar(2.2), transparent: true, opacity: 0, fog: false, toneMapped: false }));
    fleurTube.visible = false;
    fleur.add(fleurTube);
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
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .55, .25, 1.0);
    bloom.enabled = false;
    composer.addPass(bloom);
    const riso = makeRisoPass({ THREE, ShaderPass }, { dot: 5.2 * DPR });  // halftone off (uAmount 0); still does the sRGB output
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
        placeBillboard(portrait);
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
        { obj: bbHit, fn: () => nextAd(true) },
        { obj: belleHit, fn: () => clickBelle() },
        { obj: batHit, fn: () => clickBat() },
        { obj: fleur, fn: () => clickFleur() },
        { obj: water, fn: () => skipStone(lastPoint), quiet: true },
        { obj: sun, fn: () => on.toggleTheme?.(), when: () => S.night < .5 },
        { obj: moon, fn: () => on.toggleTheme?.(), when: () => S.night >= .5 },
        { obj: shootHit, fn: () => clickStar(), when: () => star.active },
        { obj: eyesHit, fn: () => clickEyes(), when: () => S.night > .6 },
    ];

    let lastPoint = null;
    function pick(e, hover = false) {
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        const live = clickables.filter(c => (!c.when || c.when()) && !(hover && c.quiet));
        const hits = raycaster.intersectObjects(live.map(c => c.obj), false);
        if (!hits.length) return null;
        // tiny, rare targets win even if a big hitbox (the bridge) is in front
        const hit = hits.find(h => h.object === eyesHit || h.object === shootHit) || hits[0];
        lastPoint = hit.point;
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
                    if (lastMove && lastMove.target === canvas) container.classList.toggle('gl-hover', !!pick(lastMove, true));
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
    function skipStone(at) {
        if (stone.hops || !at) return;
        // most throws are short; 6+ skips is roughly one in five
        const n = 1 + Math.floor(Math.pow(Math.random(), 1.6) * 8);
        const dir = new THREE.Vector3((Math.random() - .5) * .5, 0, -1).normalize();
        stone.hops = [];
        let p = new THREE.Vector3(at.x, .3, Math.max(at.z, -2)), len = 3.6, h = 1.3, d = .42;
        for (let i = 0; i < n; i++) {
            const q = p.clone().addScaledVector(dir, len);
            if (q.z < -6.5) { stone.hops.push({ a: p, b: q.setZ(-6.5), h, d }); break; }
            stone.hops.push({ a: p, b: q, h, d });
            p = q; len *= .78; h *= .72; d *= .84;
        }
        stone.n = stone.hops.length;
        stone.i = 0; stone.t = 0;
        stone.m.visible = true;
        ring(stone.hops[0].a);
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
        scene.fog.near = lerp(70, 140, X);
        scene.fog.far = lerp(260, 420, X);
        skyU.uGlow.value = X * .22;
        waterMat.roughness = lerp(.32, .14, X);
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
        const win = lerp(0, 1.25, N) * (1 - X * .3);     // windows stay under the bloom threshold
        bMat.emissiveIntensity = pinkMat.emissiveIntensity = darkMat.emissiveIntensity = win;
        bMat.emissive.setHex(0xffffff).lerp(col.setHex(0xffc46b), X * .55);
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
        fleurTube.material.opacity = X;
        fleurTube.visible = X > .01;
        fleurMat.color.setHex(0xeaff00).lerp(col.setHex(0x1c2410), X * .85);
        bloom.enabled = X > .01;
        bloom.strength = X * .45;
        riso.uniforms.uAmount.value = 0;
        riso.uniforms.uNight.value = S.night;
        eyeMat.opacity = Math.max(0, (N - .55) / .45);
        eyes.visible = eyeMat.opacity > .01;

        // water + clouds
        waterU.uTime.value = T * k;
        const ref = X + S.night * (1 - X) * .3;
        streaks.forEach(st => {
            st.m.visible = ref > .01;
            if (!st.m.visible) return;
            st.m.material.opacity = ref * st.base * (.8 + .2 * Math.sin(T * 1.9 + st.ph));
            st.m.material.map.offset.y -= dt * .08 * k;
        });
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
        fleurMat.emissive.setHex(0x4a5200).lerp(col.setHex(0xb8c800), fleurSpin).multiplyScalar(1 - X * .9);

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

        // billboard: flip every ADS.seconds (only counts while the hero is on screen)
        bb.timer += dt;
        if (bb.timer >= ADS.seconds) nextAd();
        if (bb.flip >= 0) {
            bb.flip += dt;
            let done = true;
            bbSlats.forEach((s, j) => {
                const t = Math.min(1, Math.max(0, (bb.flip - j * .055) / .75));
                if (t < 1) done = false;
                s.g.rotation.y = s.from + (s.to - s.from) * easeInOutCubic(t);
            });
            if (done) bb.flip = -1;
        }
        lampMat.emissiveIntensity = lerp(.15, 1.3, N);
        const adLevel = 1 - X * .3;
        bbSides.forEach(sd => sd.mat.color.setScalar(adLevel));

        // skipping stone: hop along, a splash ring at every touchdown
        if (stone.hops) {
            stone.t += dt;
            const hop = stone.hops[stone.i];
            const u = Math.min(1, stone.t / hop.d);
            stone.m.position.lerpVectors(hop.a, hop.b, u);
            stone.m.position.y = .3 + Math.sin(u * Math.PI) * hop.h;
            stone.m.rotation.y += dt * 14;
            if (u >= 1) {
                ring(hop.b);
                on.egg?.('splash');
                stone.i++;
                stone.t = 0;
                if (stone.i >= stone.hops.length) {
                    stone.m.visible = false;
                    stone.hops = null;
                    on.egg?.('skip', stone.n);
                }
            }
        }
        rings.forEach(r => {
            if (r.life <= 0) return;
            r.life -= dt;
            const a = 1 - r.life;
            r.m.scale.setScalar(1 + a * 4);
            r.m.material.opacity = Math.max(0, r.life) * .8;
            if (r.life <= 0) r.m.visible = false;
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
