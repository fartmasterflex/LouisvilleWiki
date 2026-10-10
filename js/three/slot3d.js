// --- js/three/slot3d.js ---
// A three-drum 3D slot machine. Drums roll toward you; faces are relabeled
// while they're hidden round the back, so the reels never repeat and always
// land on the pre-picked result.
import * as THREE from 'three';
import { sfx } from '../audio.js';

const N = 10;                 // faces per drum
const FACE_W = 7.2, FACE_H = 1.6;
const R = (FACE_H / 2) / Math.tan(Math.PI / N);
const STEP = (Math.PI * 2) / N;
const ROWS = [2.2, 0, -2.2];
const LABELS = ['THE ACTIVITY', 'THE DINNER', 'THE LATE NIGHT'];
const TW = 768, TH = Math.round(768 * FACE_H / FACE_W);

const FONT = '"Archivo Black", "Arial Black", Impact, sans-serif';
const MONO = '"Space Mono", "Courier New", monospace';

function drawFace(ctx, text, row) {
    ctx.fillStyle = '#f2eee3';
    ctx.fillRect(0, 0, TW, TH);
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, 14, TH);
    ctx.fillRect(TW - 14, 0, 14, TH);
    const t = String(text || '???').toUpperCase();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // fit: one line if possible, else two
    let size = 66;
    ctx.font = `${size}px ${FONT}`;
    const maxW = TW - 70;
    if (ctx.measureText(t).width <= maxW) {
        ctx.fillText(t, TW / 2, TH / 2 + 3);
    } else {
        const words = t.split(' ');
        let best = [t, ''], bestDiff = 1e9;
        for (let i = 1; i < words.length; i++) {
            const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
            const diff = Math.abs(ctx.measureText(a).width - ctx.measureText(b).width);
            if (diff < bestDiff) { bestDiff = diff; best = [a, b]; }
        }
        size = 50;
        ctx.font = `${size}px ${FONT}`;
        while (size > 22 && Math.max(ctx.measureText(best[0]).width, ctx.measureText(best[1]).width) > maxW) {
            size -= 2;
            ctx.font = `${size}px ${FONT}`;
        }
        if (!best[1]) ctx.fillText(best[0], TW / 2, TH / 2 + 3);
        else {
            ctx.fillText(best[0], TW / 2, TH / 2 - size * .52);
            ctx.fillText(best[1], TW / 2, TH / 2 + size * .58);
        }
    }
    ctx.font = `700 15px ${MONO}`;
    ctx.fillStyle = '#d7263d';
    ctx.textAlign = 'left';
    ctx.fillText(['🎳', '🍽', '🌙'][row] || '', 24, 22);
}

function panelTexture() {
    const W = 1024, H = Math.round(1024 * 8.6 / 9.8);
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const sx = W / 9.8, sy = H / 8.6;               // world→px
    // panel mesh is centred at y=0.4, so it spans world y -3.9 … 4.7
    const px = (wx) => (wx + 4.9) * sx, py = (wy) => (4.7 - wy) * sy;
    x.fillStyle = '#141414';
    x.fillRect(0, 0, W, H);
    // title
    x.fillStyle = '#eaff00';
    x.font = `${Math.round(sy * .62)}px ${FONT}`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText('PERFECT NIGHT OUT', W / 2, py(3.95));
    // windows (cut out) + labels
    ROWS.forEach((wy, i) => {
        x.fillStyle = '#eaff00';
        x.font = `700 ${Math.round(sy * .27)}px ${MONO}`;
        x.fillText(`— ${LABELS[i]} —`, W / 2, py(wy + 1.07));
        x.clearRect(px(-3.7), py(wy + .85), 7.4 * sx, 1.7 * sy);
        x.strokeStyle = '#eaff00';
        x.lineWidth = 5;
        x.strokeRect(px(-3.7) - 4, py(wy + .85) - 4, 7.4 * sx + 8, 1.7 * sy + 8);
    });
    x.fillStyle = '#8f897d';
    x.font = `700 ${Math.round(sy * .2)}px ${MONO}`;
    x.fillText('LOUISVILLE, KY · NO REFUNDS · PLAY RESPONSIBLY', W / 2, py(-3.75));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
}

function shadeTexture() {
    const c = document.createElement('canvas');
    c.width = 4; c.height = 128;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(0,0,0,.78)');
    g.addColorStop(.3, 'rgba(0,0,0,0)');
    g.addColorStop(.7, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,.78)');
    x.fillStyle = g;
    x.fillRect(0, 0, 4, 128);
    return new THREE.CanvasTexture(c);
}

export async function createSlot(stage, { onLever } = {}) {
    try { await Promise.all([document.fonts.load(`40px ${FONT}`), document.fonts.load(`700 20px ${MONO}`)]); } catch (e) { /* fallback fonts */ }

    const canvas = document.createElement('canvas');
    stage.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x151515, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x333333, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 6, 10);
    scene.add(key);
    const fill = new THREE.PointLight(0xeaff00, 30, 30);
    fill.position.set(-6, 0, 8);
    scene.add(fill);

    const machine = new THREE.Group();
    scene.add(machine);

    // drums
    const drums = ROWS.map((y, row) => {
        const g = new THREE.Group();
        g.position.y = y;
        const faces = [];
        for (let i = 0; i < N; i++) {
            const cv = document.createElement('canvas');
            cv.width = TW; cv.height = TH;
            const ctx = cv.getContext('2d');
            drawFace(ctx, '???', row);
            const tex = new THREE.CanvasTexture(cv);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = 4;
            const m = new THREE.Mesh(new THREE.PlaneGeometry(FACE_W, FACE_H), new THREE.MeshStandardMaterial({ map: tex, roughness: .85 }));
            const a = i * STEP;
            m.position.set(0, R * Math.sin(a), R * Math.cos(a));
            m.rotation.x = -a;
            g.add(m);
            faces.push({ mesh: m, ctx, tex, a, inBack: false, locked: false });
        }
        // end caps hide the inside
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.02, R * 1.02, FACE_W + .04, N, 1), new THREE.MeshStandardMaterial({ color: 0x0c0c0c }));
        cap.rotation.z = Math.PI / 2;
        cap.scale.set(.985, 1, .985);
        g.add(cap);
        machine.add(g);
        return { g, faces, row, phi: 0, from: 0, to: 0, t: 0, dur: 0, spinning: false, target: -1, result: '', pool: [], lastStep: 0 };
    });

    // front panel with windows
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(9.8, 8.6), new THREE.MeshStandardMaterial({ map: panelTexture(), transparent: true, alphaTest: .5, roughness: .6, metalness: .2 }));
    panel.position.set(0, .4, R + .25);
    machine.add(panel);
    const shade = shadeTexture();
    ROWS.forEach(y => {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 1.7), new THREE.MeshBasicMaterial({ map: shade, transparent: true, depthWrite: false }));
        s.position.set(0, y, R + .08);
        machine.add(s);
    });
    // bezel + back box
    const bez = new THREE.MeshStandardMaterial({ color: 0xeaff00, roughness: .4, metalness: .3 });
    const edge = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .5), bez); m.position.set(x, y, R + .2); machine.add(m); };
    edge(10.2, .22, 0, 4.8); edge(10.2, .22, 0, -4.0); edge(.22, 8.8, -5, .4); edge(.22, 8.8, 5, .4);
    const box = new THREE.Mesh(new THREE.BoxGeometry(9.8, 8.6, 2 * R + .4), new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: .7, side: THREE.BackSide }));
    box.position.set(0, .4, 0);
    machine.add(box);

    // marquee bulbs
    const bulbPts = [];
    for (let i = 0; i < 16; i++) bulbPts.push([-4.7 + i * (9.4 / 15), 4.8]);
    for (let i = 0; i < 16; i++) bulbPts.push([4.7 - i * (9.4 / 15), -4.0]);
    for (let i = 1; i < 12; i++) bulbPts.push([5, 4.8 - i * (8.8 / 12)]);
    for (let i = 1; i < 12; i++) bulbPts.push([-5, -4.0 + i * (8.8 / 12)]);
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(.13, 8, 6), new THREE.MeshBasicMaterial({ toneMapped: false }), bulbPts.length);
    const m4 = new THREE.Matrix4();
    bulbPts.forEach(([x, y], i) => { m4.makeTranslation(x, y, R + .5); bulbs.setMatrixAt(i, m4); bulbs.setColorAt(i, new THREE.Color(1, 1, 1)); });
    machine.add(bulbs);

    // lever
    const lever = new THREE.Group();
    lever.position.set(5.5, .2, 0);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .6, 16), new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: .8, roughness: .3 }));
    base.rotation.z = Math.PI / 2;
    lever.add(base);
    const arm = new THREE.Group();
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 3.6, 10), base.material);
    rod.position.y = 1.8;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(.42, 18, 12), new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: .25, metalness: .1 }));
    knob.position.y = 3.7;
    arm.add(rod, knob);
    arm.position.x = .35;
    lever.add(arm);
    machine.add(lever);
    const leverHit = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5, 1.6), new THREE.MeshBasicMaterial({ visible: false }));
    leverHit.position.set(5.9, 2.2, 0);
    machine.add(leverHit);
    let leverT = -1;

    // ---------- sizing ----------
    function resize() {
        const w = stage.clientWidth || 600, h = stage.clientHeight || 330;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // fit the cabinet (~11.6 x 9.2) in view
        const needH = Math.max(9.4, 12.4 / camera.aspect);
        camera.fov = 2 * Math.atan((needH / 2) / 26) * 180 / Math.PI;
        camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    // ---------- interaction ----------
    let px = 0, py = 0;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onMove = (e) => {
        const r = stage.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width) * 2 - 1;
        py = ((e.clientY - r.top) / r.height) * 2 - 1;
        ndc.set(px, -py);
        raycaster.setFromCamera(ndc, camera);
        stage.style.cursor = raycaster.intersectObject(leverHit).length ? 'grab' : '';
    };
    const onDown = (e) => {
        const r = stage.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        if (raycaster.intersectObject(leverHit).length) onLever && onLever();
    };
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerdown', onDown);

    // ---------- spin ----------
    let doneCb = null;
    const rand = (a) => a[Math.floor(Math.random() * a.length)];
    const norm = (x) => { x = (x + Math.PI) % (Math.PI * 2); if (x < 0) x += Math.PI * 2; return x - Math.PI; };

    function spin(results, pools, onDone) {
        doneCb = onDone;
        leverT = 0;
        sfx.lever();
        drums.forEach((d, i) => {
            d.result = results[i];
            d.pool = pools[i];
            d.from = d.phi;
            // pick the face currently round the back as the one that lands
            let best = 0, bestAbs = -1;
            d.faces.forEach((f, k) => { const w = Math.abs(norm(f.a - d.phi)); if (w > bestAbs) { bestAbs = w; best = k; } });
            d.target = best;
            const turns = 3 + i;
            let delta = norm(d.faces[best].a - d.phi);
            if (delta < 0) delta += Math.PI * 2;
            d.to = d.phi + turns * Math.PI * 2 + delta;
            d.t = 0;
            d.dur = 2.1 + i * .75;
            d.spinning = true;
            d.faces.forEach(f => { f.locked = false; });
        });
    }

    // ---------- loop ----------
    let raf = 0, running = false, last = performance.now(), T = 0;
    const col = new THREE.Color();
    const ease = (x) => { const c1 = .9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

    function frame(now) {
        if (!running) return;
        const dt = Math.min(.05, (now - last) / 1000);
        last = now;
        tick(dt);
        raf = requestAnimationFrame(frame);
    }

    function tick(dt) {
        T += dt;
        let anySpinning = false;
        drums.forEach(d => {
            if (d.spinning) {
                anySpinning = true;
                d.t += dt;
                const x = Math.min(1, d.t / d.dur);
                d.phi = d.from + (d.to - d.from) * ease(x);
                const step = Math.floor(d.phi / STEP);
                if (step !== d.lastStep) { d.lastStep = step; if (d.row === 0 || Math.random() < .5) sfx.tick(); }
                if (x >= 1) {
                    d.spinning = false;
                    d.phi = d.to;
                    sfx.stamp();
                    if (drums.every(q => !q.spinning)) { const cb = doneCb; doneCb = null; cb && cb(); }
                }
            }
            d.g.rotation.x = d.phi;
            // relabel faces as they pass round the back
            d.faces.forEach((f, k) => {
                const w = Math.abs(norm(f.a - d.phi));
                const back = w > Math.PI * .62;
                if (back && !f.inBack && !f.locked && d.pool.length) {
                    if (k === d.target && d.spinning && (d.to - d.phi) < Math.PI * 1.5) {
                        drawFace(f.ctx, d.result, d.row);
                        f.locked = true;
                    } else {
                        drawFace(f.ctx, rand(d.pool), d.row);
                    }
                    f.tex.needsUpdate = true;
                }
                f.inBack = back;
            });
        });

        // bulbs chase
        for (let i = 0; i < bulbPts.length; i++) {
            const on = anySpinning ? ((i + Math.floor(T * 14)) % 3 === 0) : ((i + Math.floor(T * 3)) % 2 === 0);
            col.setHex(on ? 0xeaff00 : 0x4a4a3a);
            if (on && anySpinning && i % 5 === 0) col.setHex(0xffffff);
            bulbs.setColorAt(i, col);
        }
        bulbs.instanceColor.needsUpdate = true;

        // lever
        if (leverT >= 0) {
            leverT += dt;
            const k = leverT < .18 ? leverT / .18 : Math.max(0, 1 - (leverT - .18) / .5);
            arm.rotation.x = k * 1.25;
            if (leverT > .7) { leverT = -1; arm.rotation.x = 0; }
        }

        // camera sway
        camera.position.set(1.3 + px * 1.6, .6 - py * 1.2, 26);
        camera.lookAt(.5, .3, 0);

        renderer.render(scene, camera);
    }

    function resume() {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
    }
    function pause() { running = false; cancelAnimationFrame(raf); }

    // seed faces with real content
    return {
        seed(pools) {
            drums.forEach((d, i) => {
                d.pool = pools[i];
                d.faces.forEach(f => { drawFace(f.ctx, rand(pools[i]), i); f.tex.needsUpdate = true; });
            });
        },
        spin, resume, pause,
        isSpinning: () => drums.some(d => d.spinning),
        dispose() {
            pause();
            ro.disconnect();
            stage.removeEventListener('pointermove', onMove);
            stage.removeEventListener('pointerdown', onDown);
            renderer.dispose();
            canvas.remove();
        }
    };
}
