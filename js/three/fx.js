// --- js/three/fx.js ---
// Full-screen 3D effects on a transparent overlay canvas.
// One renderer, created on first use; the loop sleeps when nothing is playing.
import * as THREE from 'three';
import { fleurGeometry, batGeometry, softDotTexture } from './shapes.js';

let R = null; // { renderer, scene, camera, canvas, effects, running }

function ensure() {
    if (R) return R;
    const canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9700;transition:background-color .8s ease;';
    document.body.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, .1, 200);
    camera.position.set(0, 0, 30);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 2.2));
    const d = new THREE.DirectionalLight(0xffffff, 2.2);
    d.position.set(5, 10, 12);
    scene.add(d);
    R = { renderer, scene, camera, canvas, effects: new Set(), running: false, last: 0 };
    const size = () => {
        renderer.setSize(innerWidth, innerHeight, false);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
    };
    size();
    addEventListener('resize', size);
    return R;
}

// half extents of the view at z=0
function view() {
    const h = Math.tan(THREE.MathUtils.degToRad(R.camera.fov / 2)) * R.camera.position.z;
    return { hw: h * R.camera.aspect, hh: h };
}

function loop(now) {
    if (!R.running) return;
    const dt = Math.min(.05, (now - R.last) / 1000);
    R.last = now;
    R.effects.forEach(fx => { if (fx.update(dt) === false) { fx.dispose(); R.effects.delete(fx); } });
    R.renderer.render(R.scene, R.camera);
    if (R.effects.size) requestAnimationFrame(loop);
    else { R.running = false; R.renderer.clear(); R.canvas.style.display = 'none'; }
}

function play(fx) {
    ensure();
    R.canvas.style.display = 'block';
    R.effects.add(fx);
    if (!R.running) { R.running = true; R.last = performance.now(); requestAnimationFrame(loop); }
    return new Promise(res => { const d = fx.dispose; fx.dispose = () => { d(); res(); }; });
}

export const isPlaying = () => !!(R && R.effects.size);

// ---------------------------------------------------------------
// FLEUR STORM
// ---------------------------------------------------------------
export function fleurStorm({ count = 130, duration = 9 } = {}) {
    ensure();
    const { hw, hh } = view();
    const geo = fleurGeometry();
    const mat = new THREE.MeshStandardMaterial({ metalness: .35, roughness: .4, transparent: true });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const palette = [0xeaff00, 0xffffff, 0xc8a400, 0xfff6c9, 0x141414, 0xeaff00];
    const P = [];
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
        P.push({
            p: new THREE.Vector3((Math.random() * 2 - 1) * hw * 1.1, hh + 2 + Math.random() * hh * 3, -12 + Math.random() * 20),
            vy: 3 + Math.random() * 6,
            axis: new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(),
            ang: Math.random() * 6, spin: (Math.random() - .5) * 5,
            s: .6 + Math.random() * 1.4, wob: Math.random() * 6, wa: .6 + Math.random() * 1.6,
        });
        mesh.setColorAt(i, c.setHex(palette[i % palette.length]));
    }
    R.scene.add(mesh);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
    let t = 0;
    return play({
        update(dt) {
            t += dt;
            P.forEach((f, i) => {
                f.p.y -= f.vy * dt;
                f.wob += dt * 1.6;
                f.ang += f.spin * dt;
                if (f.p.y < -hh - 3 && t < duration - 2) f.p.y = hh + 3;
                pos.set(f.p.x + Math.sin(f.wob) * f.wa, f.p.y, f.p.z);
                q.setFromAxisAngle(f.axis, f.ang);
                m.compose(pos, q, s.setScalar(f.s));
                mesh.setMatrixAt(i, m);
            });
            mesh.instanceMatrix.needsUpdate = true;
            mat.opacity = Math.min(1, (duration - t) / 1.2);
            return t < duration;
        },
        dispose() { R.scene.remove(mesh); mat.dispose(); mesh.dispose(); }
    });
}

// ---------------------------------------------------------------
// CONFETTI (3D paper)
// ---------------------------------------------------------------
export function confetti({ count = 260, colors = [0xeaff00, 0xd7263d, 0xffffff, 0x141414, 0x00c2ff], origin = 'bottom', duration = 5 } = {}) {
    ensure();
    const { hw, hh } = view();
    const geo = new THREE.PlaneGeometry(.42, .26);
    const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: .6, transparent: true });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const c = new THREE.Color();
    const P = [];
    for (let i = 0; i < count; i++) {
        const fromLeft = i % 2 === 0;
        const p = origin === 'center'
            ? new THREE.Vector3((Math.random() - .5) * 2, (Math.random() - .5) * 2, 0)
            : new THREE.Vector3(fromLeft ? -hw * .9 : hw * .9, -hh - 1, (Math.random() - .5) * 6);
        const v = origin === 'center'
            ? new THREE.Vector3((Math.random() - .5) * 34, 8 + Math.random() * 22, (Math.random() - .5) * 14)
            : new THREE.Vector3((fromLeft ? 1 : -1) * (6 + Math.random() * 16), 20 + Math.random() * 16, (Math.random() - .5) * 10);
        P.push({ p, v, axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(), ang: Math.random() * 6, spin: 4 + Math.random() * 10, s: .7 + Math.random() * .8 });
        mesh.setColorAt(i, c.setHex(colors[i % colors.length]));
    }
    R.scene.add(mesh);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    let t = 0;
    return play({
        update(dt) {
            t += dt;
            P.forEach((f, i) => {
                f.v.y -= 22 * dt;
                f.v.multiplyScalar(Math.pow(.2, dt));        // air drag
                f.v.y = Math.max(f.v.y, -5.5);               // flutter terminal velocity
                f.p.addScaledVector(f.v, dt);
                f.p.x += Math.sin(t * 3 + i) * dt * 1.2;
                f.ang += f.spin * dt;
                q.setFromAxisAngle(f.axis, f.ang);
                m.compose(f.p, q, s.setScalar(f.s));
                mesh.setMatrixAt(i, m);
            });
            mesh.instanceMatrix.needsUpdate = true;
            mat.opacity = Math.min(1, (duration - t) / 1);
            return t < duration;
        },
        dispose() { R.scene.remove(mesh); geo.dispose(); mat.dispose(); mesh.dispose(); }
    });
}

// Run for the Roses
export function rosePetals({ count = 170, duration = 7 } = {}) {
    ensure();
    const { hw, hh } = view();
    const shape = new THREE.Shape();
    shape.moveTo(0, -.3); shape.bezierCurveTo(.35, -.2, .35, .3, 0, .32); shape.bezierCurveTo(-.35, .3, -.35, -.2, 0, -.3);
    const geo = new THREE.ShapeGeometry(shape, 6);
    const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: .5, transparent: true });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const c = new THREE.Color();
    const reds = [0xc8102e, 0xa00d24, 0xe0304a, 0x8a0a1d, 0xff4a62];
    const P = [];
    for (let i = 0; i < count; i++) {
        P.push({ p: new THREE.Vector3((Math.random() * 2 - 1) * hw, hh + Math.random() * hh * 2.2, -8 + Math.random() * 14), vy: 1.6 + Math.random() * 2.6, ph: Math.random() * 6, axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(), ang: Math.random() * 6, s: .8 + Math.random() * 1.2 });
        mesh.setColorAt(i, c.setHex(reds[i % reds.length]));
    }
    R.scene.add(mesh);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
    let t = 0;
    return play({
        update(dt) {
            t += dt;
            P.forEach((f, i) => {
                f.p.y -= f.vy * dt;
                f.ph += dt * 2;
                f.ang += dt * 2.5;
                pos.set(f.p.x + Math.sin(f.ph) * 1.4, f.p.y, f.p.z + Math.cos(f.ph * .7));
                q.setFromAxisAngle(f.axis, f.ang);
                m.compose(pos, q, s.setScalar(f.s));
                mesh.setMatrixAt(i, m);
            });
            mesh.instanceMatrix.needsUpdate = true;
            mat.opacity = Math.min(1, (duration - t) / 1.4);
            return t < duration;
        },
        dispose() { R.scene.remove(mesh); geo.dispose(); mat.dispose(); mesh.dispose(); }
    });
}

// ---------------------------------------------------------------
// BAT COUNTRY — tumbling Louisville Sluggers
// ---------------------------------------------------------------
export function batCountry({ count = 34, duration = 8 } = {}) {
    ensure();
    const { hw, hh } = view();
    const geo = batGeometry(4.2, 14);
    geo.translate(0, -2.1, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0xa06a3a, roughness: .55, metalness: .05, transparent: true });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const c = new THREE.Color();
    const woods = [0xa06a3a, 0x7a4a24, 0xc9955a, 0x2a1a10, 0xd7b37a];
    const P = [];
    for (let i = 0; i < count; i++) {
        P.push({ p: new THREE.Vector3(hw + 4 + Math.random() * hw * 2.4, (Math.random() * 2 - 1) * hh * .9, -10 + Math.random() * 16), v: -(9 + Math.random() * 12), bob: Math.random() * 6, ang: Math.random() * 6, spin: 3 + Math.random() * 7, axis: new THREE.Vector3(Math.random() - .5, Math.random() - .5, 1).normalize(), s: .7 + Math.random() * .7 });
        mesh.setColorAt(i, c.setHex(woods[i % woods.length]));
    }
    R.scene.add(mesh);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3();
    let t = 0;
    return play({
        update(dt) {
            t += dt;
            P.forEach((f, i) => {
                f.p.x += f.v * dt;
                f.bob += dt * 3;
                f.ang += f.spin * dt;
                if (f.p.x < -hw - 6 && t < duration - 2.5) f.p.x = hw + 6;
                pos.set(f.p.x, f.p.y + Math.sin(f.bob) * 1.2, f.p.z);
                q.setFromAxisAngle(f.axis, f.ang);
                m.compose(pos, q, s.setScalar(f.s));
                mesh.setMatrixAt(i, m);
            });
            mesh.instanceMatrix.needsUpdate = true;
            mat.opacity = Math.min(1, (duration - t) / 1.2);
            return t < duration;
        },
        dispose() { R.scene.remove(mesh); geo.dispose(); mat.dispose(); mesh.dispose(); }
    });
}

// ---------------------------------------------------------------
// THUNDER OVER LOUISVILLE — fireworks
// ---------------------------------------------------------------
export function fireworks({ duration = 17, onBurst = null } = {}) {
    ensure();
    const { hw, hh } = view();
    const MAX = 9000;
    const pos = new Float32Array(MAX * 3), colr = new Float32Array(MAX * 3), size = new Float32Array(MAX), alpha = new Float32Array(MAX);
    const vel = new Float32Array(MAX * 3), life = new Float32Array(MAX), maxLife = new Float32Array(MAX), kind = new Uint8Array(MAX);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colr, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { uScale: { value: innerHeight * .9 } },
        vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aAlpha; uniform float uScale; varying vec3 vC; varying float vA;
            void main(){ vC = aColor; vA = aAlpha; vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `varying vec3 vC; varying float vA;
            void main(){ vec2 c = gl_PointCoord - .5; float d = length(c); if (d > .5) discard; float core = smoothstep(.5, .0, d); gl_FragColor = vec4(vC * (0.6 + core), core * vA); }`
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    R.scene.add(points);
    R.canvas.style.backgroundColor = 'rgba(4,4,16,.72)';

    let cursor = 0;
    const alloc = () => { for (let n = 0; n < MAX; n++) { const i = (cursor + n) % MAX; if (life[i] <= 0) { cursor = i + 1; return i; } } return -1; };
    const palettes = [[1, .15, .25], [1, .85, .2], [.3, .8, 1], [.92, 1, .1], [1, 1, 1], [.75, .35, 1], [.2, 1, .5]];
    const spawn = (x, y, z, vx, vy, vz, c, l, s, k) => {
        const i = alloc(); if (i < 0) return;
        pos.set([x, y, z], i * 3); vel.set([vx, vy, vz], i * 3); colr.set(c, i * 3);
        life[i] = maxLife[i] = l; size[i] = s; kind[i] = k; alpha[i] = 1;
    };

    const rockets = [];
    const launch = (x = (Math.random() * 2 - 1) * hw * .8) => {
        rockets.push({ x, y: -hh - 1, z: -6 + Math.random() * 8, vx: (Math.random() - .5) * 3, vy: 19 + Math.random() * 7, c: palettes[Math.floor(Math.random() * palettes.length)], type: Math.floor(Math.random() * 4) });
    };
    const burst = (r) => {
        const n = 130 + Math.floor(Math.random() * 90);
        const speed = 7 + Math.random() * 5;
        const c2 = palettes[Math.floor(Math.random() * palettes.length)];
        for (let k = 0; k < n; k++) {
            let u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
            let sp = speed * (r.type === 1 ? 1 : (.75 + Math.random() * .3));
            let dx = Math.sqrt(1 - u * u) * Math.cos(th), dy = u, dz = Math.sqrt(1 - u * u) * Math.sin(th);
            if (r.type === 2) { const a = (k / n) * Math.PI * 2; dx = Math.cos(a); dy = Math.sin(a); dz = (Math.random() - .5) * .2; } // ring
            const c = r.type === 3 && k % 2 ? c2 : r.c;
            spawn(r.x, r.y, r.z, dx * sp, dy * sp, dz * sp, c, 1.6 + Math.random() * 1.1, r.type === 0 ? 1.1 : .85, 1);
        }
        spawn(r.x, r.y, r.z, 0, 0, 0, [1, 1, 1], .25, 9, 2); // flash
        onBurst && onBurst();
    };

    let t = 0, next = .2, finaleFired = false;
    return play({
        update(dt) {
            t += dt;
            next -= dt;
            if (t < duration - 5 && next <= 0) { launch(); if (Math.random() < .35) launch(); next = .35 + Math.random() * .6; }
            if (!finaleFired && t > duration - 5) { finaleFired = true; for (let k = 0; k < 14; k++) setTimeout(() => launch(), k * 110); }

            for (let j = rockets.length - 1; j >= 0; j--) {
                const r = rockets[j];
                r.vy -= 9.5 * dt;
                r.x += r.vx * dt; r.y += r.vy * dt;
                spawn(r.x, r.y, r.z, (Math.random() - .5), -2 - Math.random(), 0, [1, .75, .4], .45, .5, 0);
                if (r.vy < 3) { burst(r); rockets.splice(j, 1); }
            }
            for (let i = 0; i < MAX; i++) {
                if (life[i] <= 0) continue;
                life[i] -= dt;
                const i3 = i * 3;
                const drag = kind[i] === 1 ? Math.pow(.35, dt) : 1;
                vel[i3] *= drag; vel[i3 + 1] = vel[i3 + 1] * drag - (kind[i] === 1 ? 4.2 : 0) * dt; vel[i3 + 2] *= drag;
                pos[i3] += vel[i3] * dt; pos[i3 + 1] += vel[i3 + 1] * dt; pos[i3 + 2] += vel[i3 + 2] * dt;
                const a = Math.max(0, life[i] / maxLife[i]);
                alpha[i] = kind[i] === 1 ? a * (Math.random() < .08 && a < .5 ? 0.2 : 1) : a;
                if (life[i] <= 0) alpha[i] = 0;
            }
            geo.attributes.position.needsUpdate = true;
            geo.attributes.aColor.needsUpdate = true;
            geo.attributes.aSize.needsUpdate = true;
            geo.attributes.aAlpha.needsUpdate = true;
            if (t > duration - 1.2) R.canvas.style.backgroundColor = 'rgba(4,4,16,0)';
            return t < duration + 1.2;
        },
        dispose() { R.scene.remove(points); geo.dispose(); mat.dispose(); R.canvas.style.backgroundColor = 'transparent'; }
    });
}

export function stopAll() {
    if (!R) return;
    R.effects.forEach(fx => fx.dispose());
    R.effects.clear();
}
