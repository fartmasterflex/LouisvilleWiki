// --- js/three/riso.js ---
// Risograph / newsprint post-process: a rotated halftone "ink" screen plus a
// misregistered spot-color layer for anything saturated. Crossfades between
// light paper (black ink) and dark paper (light ink), and can fade out to full
// colour (neon mode).

export const RisoShader = {
    uniforms: {
        tDiffuse: { value: null },
        uRes: { value: null },
        uDot: { value: 6.0 },
        uAmount: { value: 1.0 },
        uNight: { value: 0.0 },
        uPaperL: { value: null },
        uInkL: { value: null },
        uPaperD: { value: null },
        uInkD: { value: null },
    },
    vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform vec2 uRes;
        uniform float uDot;
        uniform float uAmount;
        uniform float uNight;
        uniform vec3 uPaperL;
        uniform vec3 uInkL;
        uniform vec3 uPaperD;
        uniform vec3 uInkD;
        varying vec2 vUv;

        vec3 toSRGB(vec3 c) {
            c = clamp(c, 0.0, 1.0);
            return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
        }
        float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

        // Rotated dot screen. v = ink coverage 0..1
        float screen(vec2 frag, float ang, float size, float v) {
            float s = sin(ang), c = cos(ang);
            vec2 p = mat2(c, -s, s, c) * frag / size;
            vec2 cell = fract(p) - 0.5;
            float r = sqrt(clamp(v, 0.0, 1.0)) * 0.74;
            float aa = 1.0 / size;                       // one pixel, in cell units
            return clamp((r - length(cell)) / aa + 0.35, 0.0, 1.0) * smoothstep(0.0, 0.035, v);
        }

        void main() {
            vec2 frag = vUv * uRes;
            vec3 col = toSRGB(texture2D(tDiffuse, vUv).rgb);
            vec2 off = vec2(1.4, -1.1) * (uDot / 6.0) / uRes;           // misregistration
            vec3 colB = toSRGB(texture2D(tDiffuse, vUv + off).rgb);

            float l = luma(col);
            float mxB = max(colB.r, max(colB.g, colB.b));
            float mnB = min(colB.r, min(colB.g, colB.b));
            float satB = (mxB - mnB) / (mxB + 1e-4);
            vec3 hueB = colB / max(mxB, 1e-3);
            float spot = smoothstep(0.26, 0.6, satB) * smoothstep(0.12, 0.4, mxB);

            float grain = hash(floor(frag));

            // light paper, black ink
            float inkL = pow(1.0 - l, 1.3) * (1.0 - 0.8 * spot);
            float kL = screen(frag, 0.785, uDot, inkL);
            vec3 outL = mix(uPaperL, uInkL, kL);
            float sL = screen(frag, 0.26, uDot * 0.82, spot * 0.95);
            outL *= mix(vec3(1.0), hueB, sL);

            // dark paper, light ink
            float inkD = pow(l, 1.15) * (1.0 - 0.65 * spot);
            float kD = screen(frag, 0.785, uDot, inkD);
            vec3 outD = mix(uPaperD, uInkD, kD);
            float sD = screen(frag, 0.26, uDot * 0.82, spot * clamp(mxB * 1.2, 0.0, 1.0));
            outD = max(outD, hueB * sD);

            vec3 riso = mix(outL, outD, uNight);
            riso += (grain - 0.5) * 0.045;

            gl_FragColor = vec4(mix(col, riso, uAmount), 1.0);
        }`
};

// sRGB hex -> raw vec3 (the shader works in display space)
export function hexVec(THREE, hex) {
    return new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);
}

export function makeRisoPass(T, { dot = 6, paperL = 0xf2eee3, inkL = 0x141414, paperD = 0x11110f, inkD = 0xefe9dc } = {}) {
    const { THREE, ShaderPass } = T;
    const pass = new ShaderPass(RisoShader);
    const u = pass.uniforms;
    u.uRes.value = new THREE.Vector2(1, 1);
    u.uDot.value = dot;
    u.uPaperL.value = hexVec(THREE, paperL);
    u.uInkL.value = hexVec(THREE, inkL);
    u.uPaperD.value = hexVec(THREE, paperD);
    u.uInkD.value = hexVec(THREE, inkD);
    return pass;
}
