// --- js/audio.js ---
// Tiny Web Audio synth for egg sound effects. No files, no downloads.
import { state } from './state.js';
import { store } from './utils.js';

let ctx = null;

function ac() {
    if (!state.soundOn) return null;
    try {
        if (!ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            ctx = new AC();
        }
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    } catch (e) { return null; }
}

export function setSound(on) {
    state.soundOn = on;
    store.set('wikiSound', on);
}

function tone(a, { f = 440, t = 0, d = .2, type = 'sine', vol = .15, slide = null, attack = .015 }) {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, a.currentTime + t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, a.currentTime + t + d);
    g.gain.setValueAtTime(0.0001, a.currentTime + t);
    g.gain.linearRampToValueAtTime(vol, a.currentTime + t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t + d);
    o.connect(g).connect(a.destination);
    o.start(a.currentTime + t);
    o.stop(a.currentTime + t + d + .05);
}

function noise(a, { t = 0, d = .5, vol = .3, freq = 800, q = .7, type = 'lowpass' }) {
    const len = Math.max(1, Math.floor(a.sampleRate * d));
    const buf = a.createBuffer(1, len, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource();
    src.buffer = buf;
    const filt = a.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = freq;
    filt.Q.value = q;
    const g = a.createGain();
    g.gain.setValueAtTime(vol, a.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t + d);
    src.connect(filt).connect(g).connect(a.destination);
    src.start(a.currentTime + t);
}

export const sfx = {
    // Churchill Downs "Call to Post"-ish bugle
    bugle() {
        const a = ac(); if (!a) return;
        const notes = [[523.25, 0, .3], [659.25, .25, .3], [783.99, .5, .35], [659.25, .85, .2], [783.99, 1.05, .4], [880, 1.45, .5], [783.99, 1.95, .25], [659.25, 2.2, .25], [783.99, 2.45, .6]];
        notes.forEach(([f, t, d]) => tone(a, { f, t, d, type: 'sawtooth', vol: .12 }));
    },
    // steamboat whistle — two detuned saws with a lazy swell
    whistle(len = 1.4) {
        const a = ac(); if (!a) return;
        [311, 370, 466].forEach(f => tone(a, { f, d: len, type: 'sawtooth', vol: .05, attack: .12 }));
        noise(a, { d: len, vol: .05, freq: 1800, type: 'bandpass', q: 2 });
    },
    // train horn for the trestle
    horn() {
        const a = ac(); if (!a) return;
        [196, 233, 294].forEach(f => tone(a, { f, d: 2.2, type: 'sawtooth', vol: .07, attack: .08 }));
    },
    boom(t = 0, vol = .5) {
        const a = ac(); if (!a) return;
        noise(a, { t, d: 1.1, vol, freq: 260 });
        tone(a, { f: 90, slide: 30, t, d: .6, type: 'sine', vol: vol * .7 });
    },
    crackle(t = 0) {
        const a = ac(); if (!a) return;
        noise(a, { t, d: .5, vol: .12, freq: 4000, type: 'highpass' });
    },
    whoosh() {
        const a = ac(); if (!a) return;
        noise(a, { d: .7, vol: .12, freq: 1200, type: 'bandpass', q: 1.5 });
    },
    crack() { // bat on ball
        const a = ac(); if (!a) return;
        noise(a, { d: .12, vol: .5, freq: 2500, type: 'bandpass', q: 1 });
        tone(a, { f: 1200, slide: 400, d: .08, type: 'square', vol: .06 });
    },
    stamp() {
        const a = ac(); if (!a) return;
        noise(a, { d: .09, vol: .35, freq: 500 });
        tone(a, { f: 120, slide: 60, d: .09, vol: .2 });
    },
    pop() {
        const a = ac(); if (!a) return;
        tone(a, { f: 520, slide: 1400, d: .09, type: 'triangle', vol: .12 });
    },
    click() {
        const a = ac(); if (!a) return;
        tone(a, { f: 1800, d: .03, type: 'square', vol: .04 });
    },
    tick() {
        const a = ac(); if (!a) return;
        tone(a, { f: 2400, d: .015, type: 'square', vol: .025 });
    },
    ding() {
        const a = ac(); if (!a) return;
        [1318.5, 1760, 2637].forEach((f, i) => tone(a, { f, t: i * .09, d: .7, type: 'sine', vol: .08 }));
    },
    secret() {
        const a = ac(); if (!a) return;
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(a, { f, t: i * .08, d: .35, type: 'square', vol: .05 }));
    },
    lose() {
        const a = ac(); if (!a) return;
        [392, 370, 349, 262].forEach((f, i) => tone(a, { f, t: i * .28, d: i === 3 ? .9 : .28, type: 'triangle', vol: .12 }));
    },
    chirp() {
        const a = ac(); if (!a) return;
        for (let i = 0; i < 3; i++) tone(a, { f: 3200, slide: 2000, t: i * .14, d: .1, vol: .06 });
    },
    clink() {
        const a = ac(); if (!a) return;
        [2093, 2637, 3136].forEach((f, i) => tone(a, { f, t: i * .12 + Math.random() * .05, d: .5, vol: .05 }));
    },
    lever() {
        const a = ac(); if (!a) return;
        noise(a, { d: .25, vol: .2, freq: 600, type: 'bandpass', q: 3 });
        tone(a, { f: 200, slide: 90, d: .2, type: 'square', vol: .05 });
    },
    punch() {
        const a = ac(); if (!a) return;
        noise(a, { d: .2, vol: .6, freq: 300 });
        tone(a, { f: 150, slide: 50, d: .2, vol: .3 });
    },
    error() {
        const a = ac(); if (!a) return;
        tone(a, { f: 110, d: .5, type: 'square', vol: .06 });
    },
    kazoo() { // weird mode
        const a = ac(); if (!a) return;
        [392, 440, 494, 392].forEach((f, i) => tone(a, { f, t: i * .12, d: .12, type: 'sawtooth', vol: .05 }));
    }
};
