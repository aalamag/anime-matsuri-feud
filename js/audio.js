// Tiny WebAudio synth — every sound is generated, no audio files.
let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, { type = 'sine', gain = 0.18, slideTo = null } = {}) {
  const c = ac(); if (!c || muted) return;
  const t = c.currentTime + start;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + dur + 0.05);
}

export const sfx = {
  unlock() { ac(); },
  setMuted(m) { muted = m; },
  isMuted: () => muted,
  ding()   { tone(988, 0, 0.18, { type: 'triangle', gain: 0.25 }); tone(1480, 0.09, 0.5, { type: 'triangle', gain: 0.22 }); },
  buzz()   { tone(110, 0, 0.7, { type: 'sawtooth', gain: 0.16 }); tone(117, 0, 0.7, { type: 'square', gain: 0.08 }); },
  tick()   { tone(1200, 0, 0.05, { type: 'square', gain: 0.06 }); },
  whoosh() { tone(300, 0, 0.35, { type: 'sine', gain: 0.12, slideTo: 1200 }); },
  award()  { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, { type: 'triangle', gain: 0.2 })); },
  fanfare() {
    [[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45], [784, 0.7], [1047, 0.85]]
      .forEach(([f, s]) => tone(f, s, 0.4, { type: 'triangle', gain: 0.22 }));
    tone(1319, 1.05, 1.2, { type: 'triangle', gain: 0.2 });
  },
};
