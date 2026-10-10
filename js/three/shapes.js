// --- js/three/shapes.js ---
// Procedural Louisville props: fleur-de-lis, Slugger bat, the Belle, beams, textures.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------------------------------------------------------------
// FLEUR-DE-LIS
// ---------------------------------------------------------------
// Each part is a list of path commands in a ~[-1,1] box; right-hand parts get mirrored.
const FLEUR_PARTS = {
    petal: { mirror: false, cmds: [
        ['m', 0, 1.0],
        ['b', 0.10, 0.88, 0.31, 0.62, 0.27, 0.36],
        ['b', 0.24, 0.20, 0.13, 0.10, 0.11, 0.02],
        ['l', -0.11, 0.02],
        ['b', -0.13, 0.10, -0.24, 0.20, -0.27, 0.36],
        ['b', -0.31, 0.62, -0.10, 0.88, 0, 1.0],
    ] },
    side: { mirror: true, cmds: [
        ['m', 0.13, 0.04],
        ['b', 0.20, 0.38, 0.44, 0.58, 0.67, 0.53],
        ['b', 0.90, 0.48, 0.96, 0.24, 0.82, 0.07],
        ['b', 0.78, 0.02, 0.74, -0.02, 0.71, -0.05],
        ['b', 0.75, 0.08, 0.76, 0.23, 0.65, 0.30],
        ['b', 0.53, 0.37, 0.38, 0.27, 0.31, 0.04],
        ['l', 0.13, 0.04],
    ] },
    band: { mirror: false, cmds: [
        ['m', -0.38, 0.07], ['l', 0.38, 0.07],
        ['b', 0.45, 0.07, 0.45, -0.11, 0.38, -0.11],
        ['l', -0.38, -0.11],
        ['b', -0.45, -0.11, -0.45, 0.07, -0.38, 0.07],
    ] },
    foot: { mirror: false, cmds: [
        ['m', -0.13, -0.10],
        ['b', -0.12, -0.27, -0.05, -0.40, 0, -0.50],
        ['b', 0.05, -0.40, 0.12, -0.27, 0.13, -0.10],
        ['l', -0.13, -0.10],
    ] },
    curl: { mirror: true, cmds: [
        ['m', 0.14, -0.10],
        ['b', 0.18, -0.26, 0.36, -0.36, 0.54, -0.31],
        ['b', 0.44, -0.27, 0.35, -0.19, 0.32, -0.10],
        ['l', 0.14, -0.10],
    ] },
};

function shapeFrom(cmds, sx = 1) {
    const s = new THREE.Shape();
    cmds.forEach(c => {
        const p = c.slice(1).map((v, i) => (i % 2 === 0 ? v * sx : v));
        if (c[0] === 'm') s.moveTo(p[0], p[1]);
        else if (c[0] === 'l') s.lineTo(p[0], p[1]);
        else s.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
    });
    return s;
}

let fleurCache = null;
export function fleurGeometry({ depth = 0.14, bevel = 0.035, curveSegments = 10 } = {}) {
    if (fleurCache && depth === 0.14) return fleurCache;
    const geos = [];
    const opts = { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 2, curveSegments };
    Object.values(FLEUR_PARTS).forEach(part => {
        geos.push(new THREE.ExtrudeGeometry(shapeFrom(part.cmds, 1), opts));
        if (part.mirror) geos.push(new THREE.ExtrudeGeometry(shapeFrom(part.cmds, -1), opts));
    });
    const g = mergeGeometries(geos);
    geos.forEach(x => x.dispose());
    g.center();
    g.computeVertexNormals();
    if (depth === 0.14) fleurCache = g;
    return g;
}

// The fleur's silhouette as line segments on both faces, lined up with
// fleurGeometry() (same centering). Used as the neon-tube version.
export function fleurOutline({ depth = 0.14, bevel = 0.035 } = {}) {
    const loops = [];
    Object.values(FLEUR_PARTS).forEach(part => {
        loops.push(shapeFrom(part.cmds, 1).getPoints(14));
        if (part.mirror) loops.push(shapeFrom(part.cmds, -1).getPoints(14));
    });
    const box = new THREE.Box2();
    loops.flat().forEach(p => box.expandByPoint(p));
    const c = box.getCenter(new THREE.Vector2());
    const pos = [];
    const zf = depth / 2 + bevel + .01;
    for (const z of [zf, -zf]) {
        loops.forEach(pts => {
            for (let i = 0; i < pts.length; i++) {
                const a = pts[i], b = pts[(i + 1) % pts.length];
                pos.push(a.x - c.x, a.y - c.y, z, b.x - c.x, b.y - c.y, z);
            }
        });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
}

// ---------------------------------------------------------------
// LOUISVILLE SLUGGER (knob at y=0, barrel end at y=len)
// ---------------------------------------------------------------
export function batGeometry(len = 1, segments = 24) {
    const prof = [
        [0.0, 0.0], [0.062, 0.0], [0.078, 0.012], [0.072, 0.03], [0.042, 0.046], [0.031, 0.07],
        [0.031, 0.34], [0.035, 0.44], [0.048, 0.58], [0.066, 0.72], [0.08, 0.85], [0.085, 0.93],
        [0.08, 0.975], [0.058, 0.995], [0.0, 1.0]
    ].map(([r, y]) => new THREE.Vector2(r * len, y * len));
    return new THREE.LatheGeometry(prof, segments);
}

// ---------------------------------------------------------------
// BEAMS (cylinders between two points, merged)
// ---------------------------------------------------------------
const UP = new THREE.Vector3(0, 1, 0);
export function beam(a, b, r = 0.08, radial = 5) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r, r, len, radial, 1, true);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()));
    g.translate(a.x, a.y, a.z);
    return g;
}

export function mergeBeams(list) {
    const g = mergeGeometries(list);
    list.forEach(x => x.dispose());
    return g;
}

// ---------------------------------------------------------------
// THE BELLE OF LOUISVILLE (bow faces +x)
// ---------------------------------------------------------------
export function makeSteamboat({ hull = 0xf4f1ea, trim = 0xd7263d, stack = 0x1a1a1a, wheel = 0xd7263d, scale = 1, name = 'belle' } = {}) {
    const g = new THREE.Group();
    g.name = name;
    const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .75, ...extra });
    const white = mat(hull), red = mat(trim), black = mat(stack), wood = mat(0x6b4a2b);

    // Hull: side profile extruded across the beam
    const hs = new THREE.Shape();
    hs.moveTo(-2.6, 0.55); hs.lineTo(2.2, 0.55); hs.quadraticCurveTo(3.2, 0.5, 3.3, 0.7);
    hs.lineTo(3.0, 0.1); hs.quadraticCurveTo(2.6, -0.25, 2.0, -0.25); hs.lineTo(-2.5, -0.25); hs.lineTo(-2.6, 0.55);
    const hullGeo = new THREE.ExtrudeGeometry(hs, { depth: 1.5, bevelEnabled: false });
    hullGeo.translate(0, 0, -0.75);
    const hullMesh = new THREE.Mesh(hullGeo, white);
    g.add(hullMesh);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.12, 1.54), red);
    stripe.position.set(0.1, 0.42, 0);
    g.add(stripe);

    const deck1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.55, 1.45), white);
    deck1.position.set(-0.1, 0.85, 0);
    g.add(deck1);
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.06, 1.5), red);
    rail1.position.set(-0.1, 1.14, 0);
    g.add(rail1);

    const deck2 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.48, 1.25), white);
    deck2.position.set(-0.4, 1.4, 0);
    g.add(deck2);

    const pilot = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.8), white);
    pilot.position.set(0.7, 1.86, 0);
    g.add(pilot);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.07, 1.0), red);
    roof.position.set(0.7, 2.12, 0);
    g.add(roof);

    // twin stacks with feathered crowns
    [-0.34, 0.34].forEach(z => {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.3, 8), black);
        s.position.set(1.55, 2.3, z);
        g.add(s);
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.26, 8), black);
        crown.position.set(1.55, 3.5, z);
        g.add(crown);
    });
    const stackTop = new THREE.Vector3(1.55, 3.65, 0);

    // stern paddlewheel
    const wheelG = new THREE.Group();
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.3, 12, 1, true), mat(wheel, { side: THREE.DoubleSide }));
    drum.rotation.x = Math.PI / 2;
    wheelG.add(drum);
    for (let i = 0; i < 8; i++) {
        const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 1.34), wood);
        const a = (i / 8) * Math.PI * 2;
        paddle.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0);
        paddle.rotation.z = a;
        wheelG.add(paddle);
    }
    wheelG.position.set(-3.15, 0.45, 0);
    g.add(wheelG);

    // little pennant
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4), black);
    pole.position.set(-1.6, 2.0, 0);
    g.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.26), mat(0xeaff00, { side: THREE.DoubleSide, emissive: 0x3a4000 }));
    flag.position.set(-1.35, 2.28, 0);
    g.add(flag);

    g.scale.setScalar(scale);
    g.userData = { wheel: wheelG, stackTop, flag };
    return g;
}

// ---------------------------------------------------------------
// TEXTURES
// ---------------------------------------------------------------
export function softDotTexture(size = 64) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    const gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(.35, 'rgba(255,255,255,.8)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr;
    x.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

// Building facades: one repeat = 8 world units wide x 16 tall
export function windowTextures() {
    const W = 256, H = 512, cols = 8, rows = 20;
    const day = document.createElement('canvas');
    const night = document.createElement('canvas');
    day.width = night.width = W;
    day.height = night.height = H;
    const d = day.getContext('2d');
    const n = night.getContext('2d');
    d.fillStyle = '#d8d3c7'; d.fillRect(0, 0, W, H);
    n.fillStyle = '#000'; n.fillRect(0, 0, W, H);
    const cw = W / cols, rh = H / rows;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = c * cw + cw * .22, y = r * rh + rh * .25, w = cw * .56, h = rh * .5;
            d.fillStyle = Math.random() < .15 ? '#6f6c66' : '#8f8b83';
            d.fillRect(x, y, w, h);
            if (Math.random() < .34) {
                n.fillStyle = Math.random() < .8 ? '#ffcf6b' : (Math.random() < .5 ? '#9fe8ff' : '#ffffff');
                n.fillRect(x, y, w, h);
            }
        }
    }
    // keep the top-left texel plain wall so roofs sample a flat color
    d.fillStyle = '#d8d3c7'; d.fillRect(0, 0, 4, 4);
    n.fillStyle = '#000'; n.fillRect(0, 0, 4, 4);
    const mk = (cv, srgb) => {
        const t = new THREE.CanvasTexture(cv);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        if (srgb) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        return t;
    };
    return { day: mk(day, true), night: mk(night, true) };
}

// Box with UVs scaled to world size, so a tiling facade texture keeps its scale
export function towerBox(w, h, d, unitW = 8, unitH = 16) {
    const g = new THREE.BoxGeometry(w, h, d);
    const uv = g.attributes.uv;
    // face order: +x, -x, +y, -y, +z, -z (4 verts each)
    const dims = [[d, h], [d, h], null, null, [w, h], [w, h]];
    for (let f = 0; f < 6; f++) {
        for (let v = 0; v < 4; v++) {
            const i = f * 4 + v;
            if (!dims[f]) { uv.setXY(i, 0.004, 0.996); continue; }
            uv.setXY(i, uv.getX(i) * dims[f][0] / unitW + (w * 0.37 % 1), uv.getY(i) * dims[f][1] / unitH);
        }
    }
    uv.needsUpdate = true;
    return g;
}
