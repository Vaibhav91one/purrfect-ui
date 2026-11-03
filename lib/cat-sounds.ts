// Cat sounds, all synthesized with Web Audio (no audio files). Tune by ear with the constants below.
const RUMBLE_HZ = 24; // purr: how fast the rumble pulses (a real purr is ~22-26Hz)
const RUMBLE_DEPTH = 0.4; // purr: gain swings between 1 - 2*depth and 1
const CUTOFF_HZ = 180; // purr: warmth (lower = darker)
const PURR_GAIN = 0.15; // purr: peak level
const FADE_IN = 0.25; // seconds
const FADE_OUT = 0.5; // seconds
const STEP_GAIN = 0.16;

let ctx: AudioContext | null = null;
let stopCurrent: (() => void) | null = null;

/** Browsers keep audio locked until a gesture, so the context is only created from one (and only then can steps and purrs play). */
export function primeAudio() {
  ctx ??= new AudioContext();
  void ctx.resume();
  return ctx;
}

const ready = () => (ctx && ctx.state === "running" ? ctx : null);

/** A paw tap: a very short, dull thump. Silent until audio has been unlocked. */
export function step() {
  const c = ready();
  if (!c) return;
  const now = c.currentTime;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * 0.06), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2;
  const src = c.createBufferSource();
  src.buffer = buf;
  const low = c.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 420;
  const g = c.createGain();
  g.gain.value = STEP_GAIN;
  src.connect(low).connect(g).connect(c.destination);
  src.start(now);
}

/**
 * A soft purr lasting `ms`: lowpassed brown noise pulsing at RUMBLE_HZ, swelling once or twice like breathing in and
 * out, with exponential fades so it never clicks. A new purr fades the previous one out first. Call from a click.
 */
export function purr(ms: number, { gain = PURR_GAIN }: { gain?: number } = {}) {
  stopCurrent?.();
  const c = primeAudio();
  const now = c.currentTime + 0.01;
  const dur = ms / 1000;

  // brown noise (each sample drifts a little from the last), long enough not to loop, normalised to an RMS of 0.4
  // so every purr is about as loud (peaks land around PURR_GAIN)
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * (dur + 0.3)), c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += (data[i] = last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02) ** 2;
  const k = 0.4 / Math.sqrt(sum / data.length);
  for (let i = 0; i < data.length; i++) data[i] *= k;
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const low = c.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = CUTOFF_HZ;
  low.Q.value = 0.7;

  // the rumble: a gain that swings with a sine at RUMBLE_HZ
  const rumble = c.createGain();
  rumble.gain.value = 1 - RUMBLE_DEPTH;
  const lfo = c.createOscillator();
  lfo.frequency.value = RUMBLE_HZ;
  const depth = c.createGain();
  depth.gain.value = RUMBLE_DEPTH;
  lfo.connect(depth).connect(rumble.gain);

  // breathing: one swell (short purrs) or two (inhale, exhale), times exponential fade in and out, from 0 back to 0
  const swells = dur >= 1.4 ? 2 : 1;
  const curve = new Float32Array(Math.ceil(dur * 200));
  for (let i = 0; i < curve.length; i++) {
    const t = (i / (curve.length - 1)) * dur;
    const fade = (1 - Math.exp((-3 * t) / FADE_IN)) * (1 - Math.exp((-3 * (dur - t)) / FADE_OUT)) / (1 - Math.exp(-3));
    curve[i] = gain * Math.min(1, fade) * (0.6 + 0.4 * Math.sin((Math.PI * swells * t) / dur) ** 2);
  }
  curve[curve.length - 1] = 0;
  const breath = c.createGain();
  breath.gain.value = 0;
  breath.gain.setValueCurveAtTime(curve, now, dur);
  const out = c.createGain(); // a separate gain for stopping early, so the breathing curve never has to be cancelled

  noise.connect(low).connect(rumble).connect(breath).connect(out).connect(c.destination);
  [noise, lfo].forEach((n) => (n.start(now), n.stop(now + dur + 0.05)));

  const stop = () => {
    out.gain.setTargetAtTime(0, c.currentTime, 0.02);
    [noise, lfo].forEach((n) => n.stop(c.currentTime + 0.15));
    if (stopCurrent === stop) stopCurrent = null;
  };
  stopCurrent = stop;
}
