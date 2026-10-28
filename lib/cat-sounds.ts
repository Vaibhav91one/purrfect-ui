// Not wired in for now: the cat purr/meow/step sounds are parked until they get another pass.
// Cat sounds, all synthesized with Web Audio (no audio files). Tune by ear with the constants below.
const RUMBLE_HZ = 25; // purr: how fast the rumble pulses
const CUTOFF_HZ = 240; // purr: brightness
const HUM_HZ = 110;
const FADE = 0.15; // seconds
const PEAK = 0.55;
const MEOW_GAIN = 0.35;
const STEP_GAIN = 0.16;
const PURR_DELAY = 0.45; // seconds between the meow and the purr starting

let ctx: AudioContext | null = null;
let stopCurrent: (() => void) | null = null;

/** Browsers keep audio locked until a gesture, so the context is only created from one (and only then can steps/meows play). */
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

/** A meow: a sawtooth that swoops up and down, shaped by two moving vowel-like filters. */
export function meow() {
  const c = ready();
  if (!c) return;
  const now = c.currentTime;
  const dur = 0.6;
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.linearRampToValueAtTime(820, now + dur * 0.35);
  osc.frequency.linearRampToValueAtTime(520, now + dur);
  const vib = c.createOscillator();
  vib.frequency.value = 6;
  const vibDepth = c.createGain();
  vibDepth.gain.value = 9;
  vib.connect(vibDepth).connect(osc.frequency);

  const f1 = c.createBiquadFilter();
  f1.type = "bandpass";
  f1.Q.value = 5;
  f1.frequency.setValueAtTime(650, now);
  f1.frequency.linearRampToValueAtTime(1000, now + dur * 0.4);
  f1.frequency.linearRampToValueAtTime(700, now + dur);
  const f2 = c.createBiquadFilter();
  f2.type = "bandpass";
  f2.Q.value = 7;
  f2.frequency.setValueAtTime(1500, now);
  f2.frequency.linearRampToValueAtTime(2100, now + dur * 0.4);
  f2.frequency.linearRampToValueAtTime(1600, now + dur);

  const g = c.createGain();
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(MEOW_GAIN, now + 0.07);
  g.gain.linearRampToValueAtTime(MEOW_GAIN * 0.8, now + dur * 0.6);
  g.gain.linearRampToValueAtTime(0, now + dur);
  osc.connect(f1).connect(g);
  osc.connect(f2).connect(g);
  g.connect(c.destination);
  [osc, vib].forEach((n) => {
    n.start(now);
    n.stop(now + dur + 0.05);
  });
}

/** Starts a purr that lasts `ms`, beginning `delay` seconds from now. Returns a function that ends it early. */
export function startPurr(ms: number, delay = 0) {
  stopCurrent?.();
  const c = primeAudio();
  const now = c.currentTime + delay;
  const end = now + ms / 1000;

  // brown noise: each sample drifts a little from the last
  const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) data[i] = last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
  const noise = c.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const low = c.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = CUTOFF_HZ;

  // the rumble: a gain that swings between 0.35 and 1 at RUMBLE_HZ
  const wobble = c.createGain();
  wobble.gain.value = 0.65;
  const lfo = c.createOscillator();
  lfo.frequency.value = RUMBLE_HZ;
  const depth = c.createGain();
  depth.gain.value = 0.35;
  lfo.connect(depth).connect(wobble.gain);

  const hum = c.createOscillator();
  hum.frequency.value = HUM_HZ;
  const humGain = c.createGain();
  humGain.gain.value = 0.05;

  const master = c.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(PEAK, now + FADE);
  master.gain.setValueAtTime(PEAK, end - FADE);
  master.gain.linearRampToValueAtTime(0, end);

  noise.connect(low).connect(wobble).connect(master);
  hum.connect(humGain).connect(master);
  master.connect(c.destination);
  const nodes = [noise, lfo, hum];
  nodes.forEach((n) => n.start(now));
  nodes.forEach((n) => n.stop(end + 0.05));

  const stop = () => {
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setValueAtTime(master.gain.value, c.currentTime);
    master.gain.linearRampToValueAtTime(0, c.currentTime + 0.1);
    nodes.forEach((n) => n.stop(c.currentTime + 0.12));
    if (stopCurrent === stop) stopCurrent = null;
  };
  stopCurrent = stop;
  return stop;
}

/** Petting the cat: a meow, then the purr. Call from a click. */
export function pet(ms: number) {
  primeAudio();
  meow();
  return startPurr(ms, PURR_DELAY);
}
