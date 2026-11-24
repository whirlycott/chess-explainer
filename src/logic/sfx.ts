/** Tiny synthesized sound effects (no audio files to download). */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  ctx ??= new AudioContext();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType, gain: number, delay = 0): void {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export const sfx = {
  move: () => tone(220, 0.08, 'triangle', 0.25),
  capture: () => {
    tone(180, 0.1, 'square', 0.12);
    tone(120, 0.12, 'triangle', 0.2, 0.03);
  },
  success: () => [523, 659, 784].forEach((f, i) => tone(f, 0.18, 'sine', 0.15, i * 0.09)),
  oops: () => tone(196, 0.22, 'sine', 0.15),
};
