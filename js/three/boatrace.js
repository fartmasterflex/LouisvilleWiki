// --- js/three/boatrace.js ---
// The Great Steamboat Race, in riso-printed 3D. Mash to paddle.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { makeRisoPass } from './riso.js';
import { makeSteamboat, softDotTexture } from './shapes.js';

const L = 120;              // course length
const IMPULSE = 4.3, DRAG = 1.6;
const RIVAL_BASE = 14;

export function createBoatRace(stage, cb) {
    const night = document.documentElement.getAttribute('data-theme') === 'dark';
    const canvas = document.createElement('canvas');
    stage.appendChild(canvas);
    const DPR = Math.min(devicePixelRatio || 1, 1.75);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(DPR);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(night ? 0x0d1020 : 0xe9f0ee);
    scene.fog = new THREE.Fog(night ? 0x0d1020 : 0xe9f0ee, 40, 130);
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 400);

    scene.add(new THREE.HemisphereLight(night ? 0x8090ff : 0xffffff, 0x556644, night ? .7 : 1.8));
    const sunL = new THREE.DirectionalLight(night ? 0xaabbff : 0xfff2d6, night ? .8 : 2.4);
    sunL.position.set(-20, 40, 30);
    scene.add(sunL);

    // water
    const wu = { uTime: { value: 0 } };
    const waterMat = new THREE.MeshStandardMaterial({ color: night ? 0x13233a : 0x7fb4c4, flatShading: true, roughness: .3, metalness: .1 });
    waterMat.onBeforeCompile = (sh) => {
        sh.uniforms.uTime = wu.uTime;
        sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `
            vec3 transformed = vec3(position);
            vec4 wp0 = modelMatrix * vec4(position, 1.0);
            transformed.y += sin(wp0.x * .5 + uTime * 1.6) * .14 + sin(wp0.z * .8 - uTime * 1.2) * .1;`);
    };
    const water = new THREE.Mesh(new THREE.PlaneGeometry(420, 26, 210, 13).rotateX(-Math.PI / 2), waterMat);
    water.position.x = L / 2;
    scene.add(water);

    // banks, trees, buoys
    const bankMat = new THREE.MeshStandardMaterial({ color: night ? 0x1c2a1c : 0x93a878, flatShading: true });
    [-1, 1].forEach(s => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(420, 1.2, 30), bankMat);
        b.position.set(L / 2, 0, s * 28);
        scene.add(b);
    });
    const tree = new THREE.InstancedMesh(new THREE.ConeGeometry(.9, 3, 6), new THREE.MeshStandardMaterial({ color: night ? 0x18301c : 0x4f7a47, flatShading: true }), 140);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 140; i++) {
        const far = i % 2;
        const s = .7 + Math.random() * .8;
        m4.compose(new THREE.Vector3(-60 + Math.random() * 300, .6 + 1.5 * s, (far ? -1 : 1) * (14.5 + Math.random() * 10)), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
        tree.setMatrixAt(i, m4);
    }
    scene.add(tree);
    const buoyMat = [new THREE.MeshStandardMaterial({ color: 0xd7263d }), new THREE.MeshStandardMaterial({ color: 0xffffff })];
    const buoys = [];
    for (let x = 0, k = 0; x <= L; x += 10, k++) {
        [-5.5, 0, 5.5].forEach(z => {
            const b = new THREE.Mesh(new THREE.CylinderGeometry(.25, .35, .9, 10), buoyMat[k % 2]);
            b.position.set(x, .3, z);
            scene.add(b);
            buoys.push(b);
        });
    }

    // finish arch
    const ck = document.createElement('canvas');
    ck.width = 512; ck.height = 96;
    const cx = ck.getContext('2d');
    for (let y = 0; y < 2; y++) for (let x = 0; x < 16; x++) { cx.fillStyle = (x + y) % 2 ? '#111' : '#fff'; cx.fillRect(x * 32, y * 16, 32, 16); cx.fillRect(x * 32, 64 + y * 16, 32, 16); }
    cx.fillStyle = '#eaff00'; cx.fillRect(0, 32, 512, 32);
    cx.fillStyle = '#111'; cx.font = '900 28px "Archivo Black", Impact, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('FINISH · LOUISVILLE WINS · FINISH', 256, 49);
    const bannerTex = new THREE.CanvasTexture(ck);
    bannerTex.colorSpace = THREE.SRGBColorSpace;
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    [-7.5, 7.5].forEach(z => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, 8, 8), poleMat); p.position.set(L, 4, z); scene.add(p); });
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(15, 2.8), new THREE.MeshBasicMaterial({ map: bannerTex, side: THREE.DoubleSide }));
    banner.position.set(L, 6.6, 0);
    banner.rotation.y = Math.PI / 2 - .25;
    scene.add(banner);

    // boats
    const player = makeSteamboat({ scale: 1 });
    player.position.set(0, .15, 2.7);
    const rival = makeSteamboat({ scale: 1, trim: 0x1f4e9c, wheel: 0x1f4e9c, hull: 0xe6e6e6, name: 'cincy' });
    rival.position.set(0, .15, -2.7);
    scene.add(player, rival);

    // smoke + wake
    const dot = softDotTexture();
    const parts = [];
    for (let i = 0; i < 90; i++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, transparent: true, depthWrite: false, opacity: 0 }));
        s.visible = false;
        scene.add(s);
        parts.push({ s, life: 0, max: 1, v: new THREE.Vector3(), grow: 1 });
    }
    const tmp = new THREE.Vector3();
    function emit(boat, kind) {
        const p = parts.find(q => q.life <= 0);
        if (!p) return;
        if (kind === 'smoke') {
            boat.localToWorld(tmp.copy(boat.userData.stackTop));
            p.s.material.color.setHex(night ? 0x77758a : 0x8f8b84);
            p.v.set(-3 - Math.random() * 2, 1.6, (Math.random() - .5));
            p.life = p.max = 1.8; p.grow = 3;
        } else {
            tmp.set(boat.position.x - 3.4, .2, boat.position.z + (Math.random() - .5) * 1.4);
            p.s.material.color.setHex(0xffffff);
            p.v.set(-1, .4, (Math.random() - .5) * 2);
            p.life = p.max = .9; p.grow = 1.6;
        }
        p.s.position.copy(tmp);
        p.s.visible = true;
    }

    // post
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const riso = makeRisoPass({ THREE, ShaderPass }, { dot: 4.4 * DPR });
    riso.uniforms.uAmount.value = .9;
    riso.uniforms.uNight.value = night ? 1 : 0;
    composer.addPass(riso);

    function resize() {
        const w = stage.clientWidth || 700, h = stage.clientHeight || 340;
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        renderer.getDrawingBufferSize(riso.uniforms.uRes.value);
        camera.aspect = w / h;
        camera.fov = camera.aspect < 1.2 ? 58 : 42;
        camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    // race state
    const R = { phase: 'countdown', t: 0, pv: 0, rv: 0, shake: 0, lastStatus: '' };
    const status = (s, cls) => { if (s !== R.lastStatus) { R.lastStatus = s; cb.status(s, cls); } };
    const row = () => {
        if (R.phase !== 'race') return;
        R.pv += IMPULSE;
        R.shake = .12;
        emit(player, 'wake');
    };
    const unbind = cb.bind(row);

    let raf = 0, last = performance.now(), T = 0, smokeT = 0, wakeT = 0;
    const camPos = new THREE.Vector3(-8, 7, 17), camLook = new THREE.Vector3(4, .5, 0);

    function frame(now) {
        const dt = Math.min(.05, (now - last) / 1000);
        last = now;
        tick(dt);
        raf = requestAnimationFrame(frame);
    }

    function tick(dt) {
        T += dt;
        R.t += dt;

        if (R.phase === 'countdown') {
            const n = 3 - Math.floor(R.t / .7);
            status(n > 0 ? `${n}…` : 'GO GO GO!');
            if (R.t > 2.1) { R.phase = 'race'; R.t = 0; cb.go(); }
        } else if (R.phase === 'race') {
            R.pv *= Math.exp(-DRAG * dt);
            const surge = Math.sin(R.t * 1.3) * 2.6 + Math.sin(R.t * 3.1 + 1) * 1.4 + (Math.random() - .5) * 4;
            R.rv = THREE.MathUtils.damp(R.rv, RIVAL_BASE + surge, 2.5, dt);
            player.position.x += R.pv * dt;
            rival.position.x += R.rv * dt;
            const gap = player.position.x - rival.position.x;
            status(Math.abs(gap) < 2 ? 'NECK AND NECK!' : gap > 0 ? 'THE BELLE LEADS! KEEP ROWING!' : 'CINCINNATI PULLS AHEAD! MASH!');
            if (player.position.x >= L || rival.position.x >= L) {
                const won = player.position.x >= rival.position.x;
                R.phase = 'done';
                if (won) { status('THE BELLE WINS! CHAMPION OF THE OHIO!', 'win'); cb.win(); }
                else { status('CINCINNATI WON. DISGRACEFUL.', 'lose'); cb.lose(); }
            }
        } else {
            R.pv *= Math.exp(-1.2 * dt);
            R.rv *= Math.exp(-1.2 * dt);
            player.position.x += R.pv * dt;
            rival.position.x += R.rv * dt;
        }

        // boats bob + wheels
        [[player, R.pv], [rival, R.rv]].forEach(([b, v], i) => {
            b.position.y = .15 + Math.sin(T * 2 + i) * .08;
            b.rotation.z = Math.sin(T * 1.4 + i) * .02 - Math.min(v, 20) * .002;
            b.userData.wheel.rotation.z -= dt * (1 + v * .45);
            b.userData.flag.rotation.y = Math.sin(T * 6 + i) * .3;
        });
        smokeT -= dt; wakeT -= dt;
        if (smokeT <= 0) { emit(player, 'smoke'); emit(rival, 'smoke'); smokeT = .22; }
        if (wakeT <= 0) { if (R.pv > 3) emit(player, 'wake'); if (R.rv > 3) emit(rival, 'wake'); wakeT = .08; }
        parts.forEach(p => {
            if (p.life <= 0) return;
            p.life -= dt;
            const a = 1 - p.life / p.max;
            p.s.position.addScaledVector(p.v, dt);
            p.s.scale.setScalar(.6 + a * p.grow);
            p.s.material.opacity = Math.sin(Math.min(1, a * 1.3) * Math.PI) * .75;
            if (p.life <= 0) p.s.visible = false;
        });
        buoys.forEach((b, i) => { b.position.y = .3 + Math.sin(T * 2 + i) * .08; });
        wu.uTime.value = T;

        // chase cam
        const mid = Math.max(player.position.x, rival.position.x) * .6 + Math.min(player.position.x, rival.position.x) * .4;
        R.shake = Math.max(0, R.shake - dt);
        const narrow = camera.aspect < 1.2;
        camPos.lerp(tmp.set(mid - (narrow ? 12 : 8), narrow ? 10 : 7, narrow ? 22 : 16.5), 1 - Math.exp(-3 * dt));
        camLook.lerp(tmp.set(mid + 5, .5, 0), 1 - Math.exp(-3 * dt));
        camera.position.copy(camPos).add(tmp.set((Math.random() - .5) * R.shake, (Math.random() - .5) * R.shake, 0));
        camera.lookAt(camLook);

        composer.render();
    }
    raf = requestAnimationFrame(frame);

    return {
        dispose() {
            cancelAnimationFrame(raf);
            unbind();
            ro.disconnect();
            renderer.dispose();
            canvas.remove();
        }
    };
}
