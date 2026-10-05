// --- js/three/core.js ---
// Lazy loader for three.js + the addons we use. Nothing here runs until asked,
// so the wiki still works if the CDN is down or WebGL is unavailable.

let loading = null;

export function hasWebGL() {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
}

export function loadThree() {
    if (!loading) {
        loading = Promise.all([
            import('three'),
            import('three/addons/postprocessing/EffectComposer.js'),
            import('three/addons/postprocessing/RenderPass.js'),
            import('three/addons/postprocessing/ShaderPass.js'),
            import('three/addons/postprocessing/UnrealBloomPass.js'),
            import('three/addons/utils/BufferGeometryUtils.js'),
        ]).then(([THREE, EC, RP, SP, UB, BGU]) => ({
            THREE,
            EffectComposer: EC.EffectComposer,
            RenderPass: RP.RenderPass,
            ShaderPass: SP.ShaderPass,
            UnrealBloomPass: UB.UnrealBloomPass,
            mergeGeometries: BGU.mergeGeometries,
        }));
        loading.catch(() => { loading = null; });
    }
    return loading;
}
