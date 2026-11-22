"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import type * as Three from "three";
import { cn } from "@/lib/utils";

export type StickerId = "android" | "devfest" | "vibe-coder" | "attended" | "gemma" | "gemini" | "gdg" | "google-cloud" | "firebase";
export interface StickerSpec {
  /** One of the DevFest 2026 stickers, drawn here; or leave it out and give `src`. */
  id?: StickerId;
  /** URL of your own art (a PNG with transparency is die-cut round its shape). */
  src?: string;
  /** Centre on the sheet in millimetres from its top-left corner, and the sticker's width in millimetres. */
  x: number;
  y: number;
  width: number;
  /** "gloss" is printed vinyl; "holo" is rainbow foil film. */
  finish?: "gloss" | "holo";
}

export interface StickerSheetProps extends Omit<ComponentProps<"div">, "children"> {
  /** The stickers and where they sit on the A5 sheet (148 x 210 mm). Defaults to the DevFest 2026 sheet. */
  stickers?: StickerSpec[];
  /** Stops the loop once nothing moves, so nothing redraws until a sticker is touched. */
  paused?: boolean;
  /** Its own sounds (the vinyl peeling off its liner, a pat as it lands), made with Web Audio. */
  sound?: boolean;
}

// the sheet as photographed: A5, measured off the photo (sheet 905 px wide = 148 mm)
const SHEET = [0.148, 0.21] as const;
export const DEVFEST_STICKERS: StickerSpec[] = [
  { id: "android", x: 34.7, y: 25.4, width: 45 },
  { id: "devfest", x: 105.5, y: 31.4, width: 59 },
  { id: "vibe-coder", x: 36, y: 67, width: 51 },
  { id: "attended", x: 111.5, y: 82, width: 48 },
  { id: "gemma", x: 35.5, y: 112.8, width: 47 },
  { id: "gemini", x: 106.6, y: 122.6, width: 60 },
  { id: "google-cloud", x: 107, y: 153.7, width: 60 },
  { id: "gdg", x: 32.2, y: 173.3, width: 43 },
  { id: "firebase", x: 103, y: 190.8, width: 67 },
];

// ---- the art, each drawn in its own millimetre box (w x h) at PX px/mm, before the die-cut border goes round it
type Ctx = CanvasRenderingContext2D;
const PX = 14, BORDER = 2.2; // mm of white vinyl round every shape (holo.spot's die-cut border)
const INK = "#24201d";
// the GDG mark as printed, deeper than Google's screen palette (sampled off the photo, its warm cast taken out)
const GDG = { red: "#ba4138", blue: "#354691", green: "#457847", yellow: "#d2924a" };
const ART: Record<StickerId, { w: number; h: number; draw: (c: Ctx, font: string) => void }> = {
  android: {
    w: 41, h: 25,
    draw: (c) => {
      // antennae, then the dome shaded like the 3D Android head, then the eyes with their glints
      c.lineCap = "round";
      for (const [x0, x1] of [[11, 7.5], [30, 33.5]]) {
        c.beginPath();
        c.moveTo(x0, 11);
        c.lineTo(x1, 2.4);
        c.lineWidth = 4;
        const g = c.createLinearGradient(x1, 2, x0, 11);
        g.addColorStop(0, "#4f9c56");
        g.addColorStop(1, "#2a7034");
        c.strokeStyle = g;
        c.stroke();
      }
      c.beginPath();
      c.moveTo(1, 24.5);
      c.bezierCurveTo(1, 11, 9.5, 6.5, 20.5, 6.5);
      c.bezierCurveTo(31.5, 6.5, 40, 11, 40, 24.5);
      c.closePath();
      const g = c.createRadialGradient(15, 10, 1, 20.5, 18, 24);
      g.addColorStop(0, "#57a35c");
      g.addColorStop(0.55, "#38843f");
      g.addColorStop(1, "#1f5a29");
      c.fillStyle = g;
      c.fill();
      for (const x of [12, 29]) {
        c.beginPath();
        c.ellipse(x, 17, 2.4, 2.6, 0, 0, Math.PI * 2);
        c.fillStyle = "#16251a";
        c.fill();
        c.beginPath();
        c.arc(x - 0.7, 16.2, 0.6, 0, Math.PI * 2);
        c.fillStyle = "rgba(255,255,255,0.55)";
        c.fill();
      }
    },
  },
  devfest: {
    w: 55, h: 39,
    draw: (c, f) => {
      c.beginPath();
      c.roundRect(0, 0, 55, 39, 4);
      // printed on frosted clear film, so over the white backing it reads as a soft grey with a faint sheen
      const film = c.createLinearGradient(0, 0, 55, 39);
      film.addColorStop(0, "#d3d4d1");
      film.addColorStop(0.5, "#c8c9c6");
      film.addColorStop(1, "#cfd0cd");
      c.fillStyle = film;
      c.fill();
      c.lineWidth = 0.25;
      c.strokeStyle = "#cfcfca";
      c.stroke();
      brace(c, 4.2, 4, 12, "#cfdcb9", false);
      brace(c, 50.8, 4, 12, "#cfdcb9", true);
      text(c, "DevFest", 27.5, 14.3, 10.5, 600, f, INK, "center", 40);
      for (const x of [9, 15, 21]) circle(c, x, 23.5, 3.6, "#b6c4ce");
      c.beginPath();
      c.moveTo(29.5, 21.2);
      c.lineTo(27, 23.5);
      c.lineTo(29.5, 25.8);
      c.lineWidth = 0.35;
      c.strokeStyle = INK;
      c.stroke();
      text(c, "3", 31.6, 25.5, 6, 300, f, INK, "center");
      pill(c, 37.5, 20.6, 13.5, 6, "#e2cdd6");
      text(c, "2026", 44.2, 24.7, 3.4, 500, f, INK, "center");
      text(c, "Google", 4.2, 31.3, 2.3, 500, f, INK, "left");
      text(c, "Developer", 6.2, 33.9, 2.3, 500, f, INK, "left");
      text(c, "Groups", 9.4, 36.5, 2.3, 500, f, INK, "left");
      gdgMark(c, 20.5, 29, 8.4);
      c.lineWidth = 0.35;
      c.strokeStyle = INK;
      c.beginPath();
      c.moveTo(40, 29);
      c.lineTo(38.6, 29);
      c.lineTo(38.6, 37);
      c.lineTo(40, 37);
      c.moveTo(48, 29);
      c.lineTo(49.4, 29);
      c.lineTo(49.4, 37);
      c.lineTo(48, 37);
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 4;
        c.moveTo(44 - Math.cos(a) * 2.8, 33 - Math.sin(a) * 2.8);
        c.lineTo(44 + Math.cos(a) * 2.8, 33 + Math.sin(a) * 2.8);
      }
      c.stroke();
    },
  },
  "vibe-coder": {
    w: 47, h: 26,
    draw: (c, f) => {
      gear(c, 38, 10.6, 7.8);
      text(c, "I am", 0.3, 6.4, 7, 400, f, "#5a69a8", "left");
      text(c, "vibe", 0, 16.3, 11.5, 700, f, "#cf4c93", "left");
      text(c, "coder", 0, 25.6, 11.5, 700, f, "#cf4c93", "left");
    },
  },
  attended: {
    w: 44, h: 28,
    draw: (c, f) => {
      text(c, "I attended", 22, 4.8, 5, 300, f, "#6c6c72", "center");
      text(c, "DevFest", 22, 14.6, 10.5, 700, f, INK, "center", 43);
      gdgMark(c, 1, 17.3, 10);
      pill(c, 24.5, 18.6, 18.8, 8.6, "#e9a43c");
      text(c, "2026", 33.9, 24.3, 4.4, 500, f, INK, "center");
    },
  },
  gemma: {
    w: 43, h: 34,
    draw: (c, f) => {
      c.beginPath();
      c.roundRect(9.5, 0, 24, 16, 3);
      c.roundRect(0, 12, 43, 22, 3.4);
      const g = c.createLinearGradient(0, 0, 0, 34);
      g.addColorStop(0, "#1a2240");
      g.addColorStop(1, "#11172a");
      c.fillStyle = g;
      c.fill();
      // the construction grid and the four-point spark
      c.lineWidth = 0.12;
      c.strokeStyle = "rgba(160,180,240,0.25)";
      c.beginPath();
      c.moveTo(21.5, 1);
      c.lineTo(21.5, 17);
      c.moveTo(13, 8.5);
      c.lineTo(30, 8.5);
      for (const x of [16.9, 26.1]) {
        c.moveTo(x, 1.5);
        c.lineTo(x, 15.5);
      }
      c.moveTo(13, 3.9);
      c.lineTo(30, 3.9);
      c.moveTo(13, 13.1);
      c.lineTo(30, 13.1);
      c.moveTo(25.9, 8.5);
      c.arc(21.5, 8.5, 4.4, 0, Math.PI * 2);
      c.moveTo(29.9, 8.5);
      c.arc(23.5, 8.5, 6.4, 0, Math.PI * 2);
      c.stroke();
      spark(c, 21.5, 8.5, 4.6, (cc) => {
        cc.lineWidth = 0.4;
        cc.strokeStyle = "#a9bdf3";
        cc.stroke();
      });
      const t = c.createLinearGradient(5, 0, 38, 0);
      t.addColorStop(0, "#5c7fd8");
      t.addColorStop(1, "#8aa8ec");
      text(c, "Gemma", 21.5, 28.6, 9, 400, f, t, "center");
    },
  },
  gemini: {
    w: 57, h: 12,
    draw: (c, f) => {
      spark(c, 6, 6, 6, (cc) => {
        const g = cc.createConicGradient(-Math.PI / 2, 6, 6);
        // blue holds most of it, as printed; the warm colours sit on the left
        g.addColorStop(0, "#e9473f");
        g.addColorStop(0.14, "#3b5cc4");
        g.addColorStop(0.5, "#3b5cc4");
        g.addColorStop(0.64, "#2f9e5a");
        g.addColorStop(0.8, "#f2b632");
        g.addColorStop(1, "#e9473f");
        cc.fillStyle = g;
        cc.fill();
      });
      text(c, "Gemini", 13.5, 10, 11.5, 500, f, "#38438a", "left", 43); // a deep indigo, as printed
    },
  },
  "google-cloud": {
    w: 57, h: 9,
    draw: (c, f) => {
      c.font = `500 9px ${f}`;
      c.textBaseline = "alphabetic";
      c.textAlign = "left";
      let x = 0;
      for (const [ch, col] of [["G", "#4a6fdc"], ["o", "#ea4335"], ["o", "#f2b632"], ["g", "#4a6fdc"], ["l", "#34a853"], ["e", "#ea4335"]]) {
        c.fillStyle = col;
        c.fillText(ch, x, 7);
        x += c.measureText(ch).width;
      }
      text(c, "Cloud", x + 1.8, 7, 9, 500, f, "#26262b", "left");
    },
  },
  gdg: {
    w: 39, h: 47,
    draw: (c, f) => {
      gdgMark(c, 2, -0.5, 17.5);
      for (const [i, w] of ["Google", "Developer", "Groups"].entries()) {
        const y = 26 + i * 8.4;
        if (i !== 1) text(c, "(", 0, y, 8, 200, f, "#6b6b70", "left");
        text(c, w, 2.4, y, 7.6, 400, f, INK, "left", 36);
      }
    },
  },
  firebase: {
    w: 63, h: 15,
    draw: (c, f) => {
      c.beginPath();
      c.roundRect(0, 0, 63, 15, 7.5);
      c.fillStyle = "#f6f6f4";
      c.fill();
      // the flame as on the 2024 logo: a rounded drop, crimson, with an amber lobe low on the left
      const drop = new Path2D("M13.6 1.4 C16.6 4.4 18 7.4 18 9.6 C18 12.2 15.9 14 13 14 C10.1 14 8 12.2 8 9.6 C8 6.6 10.6 4.4 13.6 1.4 Z");
      const g = c.createLinearGradient(9, 3, 17, 14);
      g.addColorStop(0, "#e2401f");
      g.addColorStop(1, "#c4231b");
      c.fillStyle = g;
      c.fill(drop);
      c.save();
      c.clip(drop);
      c.beginPath();
      c.ellipse(8.9, 12.2, 3.1, 4.2, -0.5, 0, Math.PI * 2);
      const a = c.createLinearGradient(7, 8, 12, 14);
      a.addColorStop(0, "#f7a52a");
      a.addColorStop(1, "#f0701e");
      c.fillStyle = a;
      c.fill();
      c.restore();
      text(c, "Firebase", 20, 10.6, 8.4, 400, f, "#2f2f33", "left");
    },
  },
};

// small drawing helpers (all in millimetres)
function text(c: Ctx, s: string, x: number, y: number, size: number, weight: number, font: string, fill: string | CanvasGradient, align: CanvasTextAlign, maxW = Infinity) {
  c.font = `${weight} ${size}px ${font}`;
  const w = c.measureText(s).width;
  if (w > maxW) c.font = `${weight} ${(size * maxW) / w}px ${font}`;
  c.textAlign = align;
  c.textBaseline = "alphabetic";
  c.fillStyle = fill;
  c.fillText(s, x, y);
}
function pill(c: Ctx, x: number, y: number, w: number, h: number, fill: string) {
  c.beginPath();
  c.roundRect(x, y, w, h, h / 2);
  c.fillStyle = fill;
  c.fill();
  c.lineWidth = 0.35;
  c.strokeStyle = INK;
  c.stroke();
}
function circle(c: Ctx, x: number, y: number, r: number, fill: string) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  c.lineWidth = 0.3;
  c.strokeStyle = INK;
  c.stroke();
}
function brace(c: Ctx, x: number, y: number, h: number, fill: string, right: boolean) {
  const s = right ? -1 : 1;
  c.beginPath();
  c.moveTo(x + s * 2.6, y);
  c.lineTo(x + s * 0.9, y);
  c.lineTo(x + s * 0.9, y + h * 0.45);
  c.lineTo(x - s * 0.6, y + h * 0.5);
  c.lineTo(x + s * 0.9, y + h * 0.55);
  c.lineTo(x + s * 0.9, y + h);
  c.lineTo(x + s * 2.6, y + h);
  c.lineJoin = "round";
  c.lineWidth = 1.9;
  c.strokeStyle = INK;
  c.stroke();
  c.lineWidth = 1.4;
  c.strokeStyle = fill;
  c.stroke();
}
// the GDG mark: two chevrons of two capsules each, outlined in ink as printed. s is its height
function gdgMark(c: Ctx, x: number, y: number, s: number) {
  const bar = (x0: number, y0: number, x1: number, y1: number, fill: string) => {
    c.beginPath();
    c.moveTo(x + x0 * s, y + y0 * s);
    c.lineTo(x + x1 * s, y + y1 * s);
    c.lineCap = "round";
    c.lineWidth = s * 0.37;
    c.strokeStyle = INK;
    c.stroke();
    c.lineWidth = s * 0.32;
    c.strokeStyle = fill;
    c.stroke();
  };
  // measured off the print: shallow capsules, the long blue and green ones lying over short red and yellow ones
  bar(0.26, 0.42, 0.64, 0.16, GDG.red);
  bar(0.2, 0.47, 0.62, 0.8, GDG.blue);
  bar(1.12, 0.84, 1.5, 0.58, GDG.yellow);
  bar(1.14, 0.2, 1.56, 0.53, GDG.green);
}
// a four-point spark with concave sides (Gemini, Gemma)
function spark(c: Ctx, x: number, y: number, r: number, paint: (c: Ctx) => void) {
  c.beginPath();
  c.moveTo(x, y - r);
  const k = r * 0.14; // the sides bow in, but not to a hairline
  c.quadraticCurveTo(x + k, y - k, x + r, y);
  c.quadraticCurveTo(x + k, y + k, x, y + r);
  c.quadraticCurveTo(x - k, y + k, x - r, y);
  c.quadraticCurveTo(x - k, y - k, x, y - r);
  c.closePath();
  paint(c);
}
function gear(c: Ctx, x: number, y: number, r: number) {
  c.beginPath();
  const teeth = 8;
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r * 0.8 : r;
    c.arc(x, y, rr, a0, a1);
  }
  c.closePath();
  c.moveTo(x + r * 0.46, y);
  c.arc(x, y, r * 0.46, 0, Math.PI * 2, true);
  c.fillStyle = "#d6dcbd";
  c.fill("evenodd");
  c.lineWidth = 0.45;
  c.strokeStyle = "#5c6146";
  c.stroke();
}

// art plus its white die-cut border: the art's alpha dilated by stamping a white copy round a circle
function dieCut(art: HTMLCanvasElement | HTMLImageElement, w: number, h: number) {
  const b = BORDER * PX, W = Math.ceil(w * PX + b * 2), H = Math.ceil(h * PX + b * 2);
  const white = document.createElement("canvas");
  white.width = W;
  white.height = H;
  const wc = white.getContext("2d")!;
  wc.drawImage(art, b, b, w * PX, h * PX);
  wc.globalCompositeOperation = "source-in";
  wc.fillStyle = "#fdfdfb";
  wc.fillRect(0, 0, W, H);
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const oc = out.getContext("2d")!;
  // (no grey ring at the cut: anything under half alpha is dropped by alphaTest, and stamped rings left dots)
  for (let i = 0; i < 72; i++) {
    const a = (i < 48 ? i / 48 : (i - 48) / 24) * Math.PI * 2, r = i < 48 ? b : b / 2; // the outer ring, and a half ring so small dots leave no hole
    oc.drawImage(white, Math.cos(a) * r, Math.sin(a) * r);
  }
  oc.drawImage(white, 0, 0); // fill pinholes inside the outline
  // a die cannot cut a gap narrower than ~5 mm (between the GDG chevrons, inside letters): close the outline by growing it
  // 2.5 mm and shrinking it back (the shrink is the outside grown and cut away), on a canvas with room round it
  const c = 2.5 * PX, P = Math.ceil(c) + 2;
  const layer = () => {
    const cv = document.createElement("canvas");
    cv.width = W + P * 2;
    cv.height = H + P * 2;
    return [cv, cv.getContext("2d")!] as const;
  };
  const grow = (x: Ctx, src: HTMLCanvasElement, ox: number, oy: number) => {
    for (let i = 0; i < 64; i++) {
      const a = (i < 48 ? i / 48 : (i - 48) / 16) * Math.PI * 2, r = i < 48 ? c : c / 2;
      x.drawImage(src, ox + Math.cos(a) * r, oy + Math.sin(a) * r);
    }
  };
  const [g, gc] = layer(), [inv, ic] = layer(), [out2, oc2] = layer();
  grow(gc, out, P, P);
  gc.drawImage(out, P, P);
  ic.fillStyle = "#000";
  ic.fillRect(0, 0, inv.width, inv.height);
  ic.globalCompositeOperation = "destination-out";
  ic.drawImage(g, 0, 0);
  grow(oc2, inv, 0, 0);
  gc.globalCompositeOperation = "destination-out";
  gc.drawImage(out2, 0, 0);
  oc.clearRect(0, 0, W, H);
  oc.drawImage(g, -P, -P);
  oc.drawImage(art, b, b, w * PX, h * PX);
  // the art alone, registered to the cut: printed over foil on a holo sticker, so the border is the foil itself
  const ink = document.createElement("canvas");
  ink.width = W;
  ink.height = H;
  ink.getContext("2d")!.drawImage(art, b, b, w * PX, h * PX);
  return { canvas: out, ink };
}

// ---- sound: vinyl tearing off its liner (filtered noise, brighter as it goes faster) and a soft pat on landing
type Sounds = { peel: (speed: number) => void; pat: () => void; close: () => void };
function createSounds(): Sounds | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ac = new AC();
  const noise = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.3 ? 1 : 0.3); // crackly
  const burst = (len: number, freq: number, q: number, gain: number) => {
    if (ac.state === "suspended") ac.resume();
    const t = ac.currentTime, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noise;
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(1e-4, t + len);
    src.connect(f).connect(g).connect(ac.destination);
    src.start(t, Math.random() * 0.2);
    src.stop(t + len);
  };
  return {
    peel: (s) => burst(0.06, 1800 + Math.min(1, s) * 3000, 0.9, 0.05 + Math.min(1, s) * 0.08),
    pat: () => burst(0.08, 380, 1.4, 0.25),
    close: () => void ac.close(),
  };
}

// ---- HoloSpot (github.com/dmitrykurash/holospot, MIT): not an npm dependency, because bundlers choke on its default
// `new URL("../assets/", import.meta.url)`. It is fetched from jsDelivr when a holo sticker first mounts and its "three"
// imports are pointed at this page's own three, through a tiny module that re-exports it, so there is one three.
// ponytail: a page whose CSP blocks blob: modules or jsDelivr gets three's iridescent film instead
const HOLOSPOT = "https://cdn.jsdelivr.net/gh/dmitrykurash/holospot@v0.1.0";
type HoloObject = { ready: Promise<void>; remove: () => void };
type HoloKit = {
  apply: (mesh: Three.Object3D, options: Record<string, unknown>) => HoloObject;
  render: (scene: Three.Scene, camera: Three.Camera) => void;
  ready: () => Promise<void>; // resolves once every applied foil has settled (its bump maps are in)
  dispose: () => void;
};
let holoModule: Promise<{ Holo: new (renderer: Three.WebGLRenderer, options: Record<string, unknown>) => HoloKit }> | null = null;
function loadHoloSpot(THREE: typeof Three) {
  holoModule ??= (async () => {
    const g = globalThis as unknown as { __holospotThree?: typeof Three };
    g.__holospotThree = THREE;
    const names = Object.keys(THREE).filter((k) => /^[A-Za-z_$][\w$]*$/.test(k) && k !== "default");
    const shim = URL.createObjectURL(new Blob([`const T = globalThis.__holospotThree; export default T; export const { ${names.join(", ")} } = T;`], { type: "text/javascript" }));
    const src = await (await fetch(`${HOLOSPOT}/dist/holo.js`)).text();
    const mod = URL.createObjectURL(new Blob([src.replace(/from\s*["']three["']/g, `from "${shim}"`)], { type: "text/javascript" }));
    return import(/* webpackIgnore: true */ /* turbopackIgnore: true */ mod);
  })();
  holoModule.catch(() => (holoModule = null)); // a failed fetch can be retried by the next sheet
  return holoModule;
}


const DEFAULT_FONT = '"Google Sans", "Product Sans", system-ui, sans-serif';
const TILT = -0.2; // the sheet leans back from the camera, so a peeled flap is seen standing up off it

// ---- the peel, after holo.spot's Stickers scene: the flap is a strip bent along the pull. From the peel front its angle
// follows the elastica psi(s) = pi - 4 atan(exp(-s / 2 r0)) (flat on the liner, a tight curl, then lying back over the
// vinyl still stuck), and from the point where the curl's tangent meets the hand it runs straight to the hand.
const STIFFNESS = 0.31, ADHESION = 1;
const R0 = 0.0036 * (STIFFNESS / 0.6) ** 0.35 * (0.6 / ADHESION) ** 0.35; // the curl's radius, ~2.4 mm (m)
const GRIP = 0.0003 * ADHESION; // how hard the flap must pull (as stretch, m) before the front lets go of the liner
const DS = 0.00005, CURL_N = Math.ceil((16 * R0) / DS);
const CURL = (() => {
  // the curl as a table along its arc: its angle, and how far it has come back toward the edge (x) and up (z)
  const psi = new Float32Array(CURL_N + 1), x = new Float32Array(CURL_N + 1), z = new Float32Array(CURL_N + 1);
  const at = (s: number) => Math.PI - 4 * Math.atan(Math.exp(-s / (2 * R0)));
  for (let i = 1; i <= CURL_N; i++) {
    const p = at((i - 0.5) * DS);
    psi[i] = at(i * DS);
    x[i] = x[i - 1] - Math.cos(p) * DS;
    z[i] = z[i - 1] + Math.sin(p) * DS;
  }
  return { psi, x, z };
})();
// for a hand at (hx along the pull from the front, hz up): the first point of the curl whose tangent aims at the hand,
// the straight run from there, the flap's whole length to the hand, and the cosine of the straight run's angle
function reach(hx: number, hz: number) {
  const { psi, x, z } = CURL;
  // (a hand held lower than the curl's top never lines up: the curl stops where it comes closest to aiming at it)
  let k = 0, miss = Infinity;
  for (; k < CURL_N; k++) {
    let a = Math.atan2(hz - z[k], x[k] - hx);
    if (a < -Math.PI / 2) a += Math.PI * 2;
    if (a <= psi[k]) break;
    if (a - psi[k] > miss) {
      k--;
      break;
    }
    miss = a - psi[k];
  }
  const vx = hx - x[k], vz = hz - z[k], l = Math.hypot(vx, vz);
  return { k, l, len: k * DS + l, c: l > 1e-9 ? -vx / l : -Math.cos(psi[k]), ex: l > 1e-9 ? vx / l : -Math.cos(psi[k]), ez: l > 1e-9 ? vz / l : Math.sin(psi[k]) };
}
// the front where the flap from it to the hand is exactly as long as the vinyl peeled (plus `grip` of stretch)
function settle(f: number, edge: number, ha: number, hz: number, grip: number) {
  for (let i = 0; i < 8; i++) {
    const r = reach(ha - f, hz), g = r.len - (f - edge) - grip;
    if (Math.abs(g) < 1e-7) break;
    f += g / Math.max(0.3, 1 - r.c); // moving the front by d shortens the gap by (1 - c) d
  }
  return f;
}
// the view drifts toward the pointer (holo.spot's cursor parallax 0.5: a 2.5 degree tilt and 1.5 degree orbit), on a
// critically damped spring that rises in 0.15 s
const PARALLAX = { tilt: (2.5 * Math.PI) / 180, orbit: (1.5 * Math.PI) / 180, rise: 2.1462 / 0.15 };
const glide = (x: number, v: number, to: number, dt: number) => {
  const o = x - to, s = v + PARALLAX.rise * o, c = Math.exp(-PARALLAX.rise * dt);
  return [to + (o + s * dt) * c, (v - PARALLAX.rise * s * dt) * c] as const;
};
function seeded(n: number) {
  return () => {
    n = (n + 0x6d2b79f5) | 0;
    let t = Math.imul(n ^ (n >>> 15), 1 | n);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Sticker = {
  foil: Three.Mesh | null; // the bending holo film (holo finish)
  back: Three.Mesh; // the white backing, seen on a flap
  sil: HTMLCanvasElement; // white-on-black cut-out
  ink: HTMLCanvasElement; // the art alone
  holoMesh: Three.Mesh | null; // the cut-out as real triangles, for HoloSpot, which ignores alpha
  holo: { remove: () => void } | null; // HoloSpot's foil on holoMesh while the sticker lies flat
  spec: StickerSpec;
  mesh: Three.Mesh;
  shade: Three.Mesh<Three.PlaneGeometry, Three.ShaderMaterial>; // its soft shadow and contact line on whatever is under it
  rest: Float32Array; // flat vertex positions, sticker-local
  bump: Float32Array; // the hand-applied lumps per vertex: a bubble or two, an edge not pressed down (z, m)
  lump: (x: number, y: number) => number; // the same lumps anywhere on the sticker
  pts: Float32Array; // points inside the cut, 1 mm apart (x, y pairs, sticker-local)
  w: number;
  h: number;
  pos: Three.Vector2; // centre on the sheet plane (m, x right, y up)
  rot: number;
  state: "flat" | "peel" | "carry" | "drop";
  dir: Three.Vector2; // the peel's direction (sticker-local)
  edge: number; // where along it the cut begins, and ends
  end: number;
  front: number; // the peel front: the vinyl before it along dir is off the liner
  tip: Three.Vector2; // the cut's first point along dir, where the flap is held
  hand: Three.Vector3; // where the flap is held now, easing toward handT (sticker-local, z up)
  handT: Three.Vector3;
  pull: Three.Vector2; // the hand's offset from the tip when this grab began
  dirty: boolean; // a flat sticker whose shape needs writing once
  lift: number;
  layer: number; // stacking order: each one dropped lies a hair above the rest, so overlaps never z-fight
  liftV: number;
  vel: Three.Vector2; // the carry spring's velocity (m/s)
  tilt: Three.Vector2; // how far the carried vinyl leans into its motion, eased (rad about x, y)
  target: Three.Vector2;
  stuck0: number; // above 0 while the last of it lets go: the share still stuck when it began
  f0: number; // the front when it began, and the seconds since
  rt: number;
  hand0: Three.Vector3; // where the hand was when it was let go early, and the seconds it has been lying back
  lay: number;
  free: number; // 0..1 through that: the vinyl morphing from the peel's shape into the carried one
};

/**
 * The DevFest Bengaluru 2026 sticker sheet in three.js, peeling like holo.spot's Stickers. Pinch any sticker and pull:
 * the edge you hold lifts off its liner and the peel front follows only as hard as you pull, the vinyl rolling round a
 * tight elastica curl with its white back showing and running straight on to your finger. Let go early and it lies back
 * down; peel most of it and it comes away, hangs off the pointer as you carry it, and sticks down wherever you drop it
 * (where it can be peeled again). Double-click puts every sticker back. The art is drawn here at print resolution with a
 * white die-cut border, a soft shadow and contact line, and a few hand-applied bumps; a sticker can be your own image.
 */
export function StickerSheet({ stickers = DEVFEST_STICKERS, paused = false, sound = true, className, ...rest }: StickerSheetProps) {
  const root = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const live = useRef({ paused, sound });
  const kick = useRef(() => {});
  const audio = useRef<Sounds | null>(null);
  useEffect(() => {
    live.current = { paused, sound };
    kick.current();
  }, [paused, sound]);
  useEffect(() => () => audio.current?.close(), []);
  const key = JSON.stringify(stickers);

  useEffect(() => {
    const box = root.current;
    if (!box) return;
    let dead = false;
    let cleanup = () => {};
    const specs: StickerSpec[] = JSON.parse(key);
    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const font = getComputedStyle(box).getPropertyValue("--sticker-sheet-font").trim() || DEFAULT_FONT;
      await Promise.all([300, 400, 500, 600, 700].map((w) => document.fonts?.load(`${w} 40px ${font}`).catch(() => [])));
      // each sticker's art, die-cut (own images load first; one that fails is left out)
      // one sticker per task (a die-cut is ~72 full-canvas draws), so setting up a sheet never blocks the page for long
      const arts = await Promise.all(
        specs.map(async (s, i) => {
          await new Promise((r) => setTimeout(r, i));
          if (s.id && ART[s.id]) {
            const a = ART[s.id];
            const cv = document.createElement("canvas");
            cv.width = a.w * PX;
            cv.height = a.h * PX;
            const c = cv.getContext("2d")!;
            c.scale(PX, PX);
            a.draw(c, font);
            return { ...dieCut(cv, a.w, a.h), w: a.w, h: a.h };
          }
          if (!s.src) return null;
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = s.src;
          try {
            await img.decode();
          } catch {
            return null;
          }
          const w = s.width - BORDER * 2, h = (w * img.naturalHeight) / img.naturalWidth;
          return { ...dieCut(img, w, h), w, h };
        }),
      );
      if (dead) return;
      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setFailed(true);
        return;
      }
      setFailed(false);
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1.6;
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.VSMShadowMap;
      const canvas = renderer.domElement;
      canvas.className = "absolute inset-0 size-full touch-none";
      box.prepend(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      // the room's light kept faint and the sun doing the work: a bright room lays a grey film over dark ink (Gemma turns slate)
      scene.environmentIntensity = 0.08;
      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambient);
      const sun = new THREE.DirectionalLight(0xffffff, 1.3);
      sun.position.set(-0.08, 0.25, 0.3);
      // only a lifted flap casts through the shadow map (a sticker lying flat has its own baked shadow, below): kept soft
      // and light, as a flap held over white vinyl lets most of the light round it
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      Object.assign(sun.shadow.camera, { left: -0.14, right: 0.14, top: 0.16, bottom: -0.16, near: 0.05, far: 1 });
      sun.shadow.bias = -0.0004;
      sun.shadow.radius = 8;
      sun.shadow.blurSamples = 16;
      sun.shadow.intensity = 0.4;
      scene.add(sun);
      // layer 1 is the ink pass (see `render`): the lights and the stickers are on it
      sun.layers.enable(1);
      ambient.layers.enable(1);
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 2); // a tight near/far: HoloSpot depth-tests its foil 40 um above the vinyl

      // everything lies in this group, tilted back; its local XY plane is the sheet
      const table = new THREE.Group();
      table.rotation.x = TILT;
      scene.add(table, sun.target);
      const textures: Three.Texture[] = [env];
      const tex = (cv: HTMLCanvasElement) => {
        const t = new THREE.CanvasTexture(cv);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        textures.push(t);
        return t;
      };
      const mm = (x: number, y: number) => new THREE.Vector2(x / 1000 - SHEET[0] / 2, SHEET[1] / 2 - y / 1000);

      // the liner: glossy white, with the kiss-cut lines left round every sticker's outline
      const liner = document.createElement("canvas");
      liner.width = 1480;
      liner.height = 2100;
      const lc = liner.getContext("2d")!;
      lc.fillStyle = "#e9e7e1"; // the silicone liner, a shade greyer than the white vinyl
      lc.fillRect(0, 0, 1480, 2100);
      arts.forEach((a, i) => {
        if (!a) return;
        const s = specs[i], cw = a.canvas.width / PX, ch = a.canvas.height / PX;
        lc.save();
        lc.translate((s.x - cw / 2) * 10, (s.y - ch / 2) * 10);
        lc.scale(10 / PX, 10 / PX);
        // the cut line: the outline's edge, drawn as a faint grey rim
        lc.filter = "blur(1px)";
        lc.globalAlpha = 0.35;
        lc.drawImage(a.canvas, 0, 0);
        lc.restore();
      });
      // grey out the inside of each cut so only a rim remains: paint the liner colour back over a slightly shrunk copy
      lc.globalCompositeOperation = "source-over";
      arts.forEach((a, i) => {
        if (!a) return;
        const s = specs[i], cw = a.canvas.width / PX, ch = a.canvas.height / PX;
        const t = document.createElement("canvas");
        t.width = a.canvas.width;
        t.height = a.canvas.height;
        const tc = t.getContext("2d")!;
        tc.drawImage(a.canvas, 0, 0);
        tc.globalCompositeOperation = "source-in";
        tc.fillStyle = "#e9e7e1";
        tc.fillRect(0, 0, t.width, t.height);
        lc.drawImage(t, (s.x - cw / 2) * 10 + 3, (s.y - ch / 2) * 10 + 3, cw * 10 - 6, ch * 10 - 6);
      });
      const sheet = new THREE.Mesh(
        new THREE.BoxGeometry(SHEET[0], SHEET[1], 0.0003),
        new THREE.MeshPhysicalMaterial({ map: tex(liner), roughness: 0.5, specularIntensity: 0.4 }),
      );
      sheet.position.z = -0.00015;
      sheet.receiveShadow = true;
      table.add(sheet);
      // an invisible floor round the sheet, so a sticker dropped off it still lands somewhere
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShadowMaterial({ opacity: 0.18 }));
      floor.position.z = -0.0004;
      floor.receiveShadow = true;
      table.add(floor);

      // the stickers: front (printed vinyl or holo film) and back (white backing paper), sharing one bending geometry
      const list: Sticker[] = [];
      // the bending holo film's print, painted to look like HoloSpot's "stickers" foil (prism rainbow bands round a centre,
      // flakes and fine scratches), so grabbing a holo sticker, when the film takes over from HoloSpot, does not switch looks
      let film: Three.Texture | null = null;
      if (specs.some((s) => s.finish === "holo")) {
        const fc = document.createElement("canvas");
        fc.width = fc.height = 256;
        const f = fc.getContext("2d")!;
        const g = f.createConicGradient(0.6, 128, 128);
        for (let i = 0; i <= 12; i++) g.addColorStop(i / 12, i % 2 ? "hsl(40 45% 62%)" : `hsl(${[200, 290, 170, 330, 60, 230][(i / 2) % 6]} 85% 62%)`); // silver-gold between the colours
        f.fillStyle = g;
        f.fillRect(0, 0, 256, 256);
        f.globalAlpha = 0.5;
        f.lineWidth = 0.6;
        const r = seeded(7);
        for (let i = 0; i < 220; i++) {
          const x = r() * 256, y = r() * 256, a = r() * Math.PI, l = 8 + r() * 30;
          f.strokeStyle = `hsl(${r() * 360} 80% ${70 + r() * 20}%)`;
          f.beginPath();
          f.moveTo(x, y);
          f.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
          f.stroke();
        }
        f.globalAlpha = 1;
        for (let i = 0; i < 900; i++) {
          f.fillStyle = `hsl(${r() * 360} 90% ${65 + r() * 30}%)`;
          f.fillRect(r() * 256, r() * 256, 1.2, 1.2);
        }
        film = tex(fc);
      }
      // the soft shadow (holo.spot's shadow 0.14 at softness 1: wide and faint, a little below) and the contact line (a
      // thin dark rim right at the cut), baked from the sticker's own outline and drawn on whatever lies under it
      const SHADE_PAD = 8, SHADE_PX = 6; // mm round the cut, px per mm
      const shadeMaterial = (t: Three.Texture) =>
        new THREE.ShaderMaterial({
          uniforms: { map: { value: t }, opacity: { value: 1 }, dir: { value: new THREE.Vector2() }, front: { value: -1 } },
          vertexShader: "varying vec2 vUv, vP; void main() { vUv = uv; vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
          // the vinyl peeled off (before the front) lays no shadow here: the shadow map draws the flap's
          fragmentShader:
            "uniform sampler2D map; uniform float opacity, front; uniform vec2 dir; varying vec2 vUv, vP; void main() { float m = smoothstep(front - 0.001, front + 0.004, dot(vP, dir)); gl_FragColor = vec4(0.0, 0.0, 0.0, texture2D(map, vUv).a * opacity * m); }",
          transparent: true,
          depthWrite: false,
        });
      arts.forEach((a, i) => {
        if (!a) return;
        const s = specs[i];
        const w = a.canvas.width / PX / 1000, h = a.canvas.height / PX / 1000;
        const geo = new THREE.PlaneGeometry(w, h, Math.ceil(w / 0.0008), Math.ceil(h / 0.0008)); // fine enough that the 2.4 mm curl has no sawtooth
        const holoFinish = s.finish === "holo";
        const map = tex(a.canvas);
        // a glossy laminate over the print: a clear coat with its own sharp highlight, which the lumps below make play
        const front = new THREE.MeshPhysicalMaterial({
          map: holoFinish ? tex(a.ink) : map,
          alphaTest: 0.5,
          roughness: 0.45,
          specularIntensity: 0.25,
          // ponytail: a thin coat; a full one mirrors the room as a grey film over dark ink (Gemma turns slate)
          clearcoat: 0.3,
          clearcoatRoughness: 0.08,
        });
        const mesh = new THREE.Mesh(geo, front);
        // the backing's cut-out: alphaMap reads green, not alpha, so it gets a white-on-black silhouette of the shape
        const sil = document.createElement("canvas");
        sil.width = a.canvas.width;
        sil.height = a.canvas.height;
        const sc = sil.getContext("2d")!;
        sc.drawImage(a.canvas, 0, 0);
        sc.globalCompositeOperation = "source-in";
        sc.fillStyle = "#fff";
        sc.fillRect(0, 0, sil.width, sil.height);
        sc.globalCompositeOperation = "destination-over";
        sc.fillStyle = "#000";
        sc.fillRect(0, 0, sil.width, sil.height);
        const silTex = new THREE.CanvasTexture(sil);
        textures.push(silTex);
        // the back is the white liner side (the adhesive's paper), seen on the flap as it curls over
        const back = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xf4f3ef, alphaMap: silTex, alphaTest: 0.5, side: THREE.BackSide, roughness: 0.85 }));
        // alpha-cut shadows: the depth pass must drop the same pixels the colour pass does
        mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map, alphaTest: 0.5 });
        mesh.receiveShadow = true; // a flap's shadow falls on the stickers under it too
        mesh.add(back);
        for (const o of [mesh, back]) o.layers.enable(1);
        // holo film under the ink: a painted foil with three's iridescence, which bends with the sticker; HoloSpot's foil draws
        // over it while the sticker lies flat (see below)
        let foil: Three.Mesh | null = null;
        if (holoFinish) {
          foil = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ map: film, metalness: 0.3, roughness: 0.35, specularIntensity: 0.5, iridescence: 0.35, iridescenceIOR: 1.9, iridescenceThicknessMinimum: 200, iridescenceThicknessMaximum: 1100, clearcoat: 0.7, clearcoatRoughness: 0.12, alphaMap: silTex, alphaTest: 0.5 }));
          foil.position.z = -0.00003;
          mesh.add(foil);
          foil.layers.enable(1);
        }
        table.add(mesh);
        // its shadow
        const pad = SHADE_PAD, k = SHADE_PX, cw = a.canvas.width / PX, ch = a.canvas.height / PX;
        const shc = document.createElement("canvas");
        shc.width = Math.ceil((cw + pad * 2) * k);
        shc.height = Math.ceil((ch + pad * 2) * k);
        const xc = shc.getContext("2d")!;
        xc.filter = `blur(${3.2 * k}px)`;
        xc.globalAlpha = 0.42;
        xc.drawImage(a.canvas, pad * k, (pad + 0.9) * k, cw * k, ch * k);
        xc.filter = `blur(${0.25 * k}px)`;
        xc.globalAlpha = 0.5;
        xc.drawImage(a.canvas, pad * k, pad * k, cw * k, ch * k);
        const shTex = new THREE.CanvasTexture(shc);
        textures.push(shTex);
        const shade = new THREE.Mesh(new THREE.PlaneGeometry(w + pad / 500, h + pad / 500), shadeMaterial(shTex));
        table.add(shade);
        // points inside the cut, and the lumps of a sticker pressed on by hand (seeded, so a sheet looks the same each load)
        const px = sil.getContext("2d")!.getImageData(0, 0, sil.width, sil.height).data, pts: number[] = [];
        for (let y = 0.0005; y < h; y += 0.001)
          for (let x = 0.0005; x < w; x += 0.001) if (px[(Math.floor((y / h) * sil.height) * sil.width + Math.floor((x / w) * sil.width)) * 4] > 128) pts.push(x - w / 2, h / 2 - y);
        const r = seeded(i * 7919 + 13), bubbles: number[][] = [];
        for (let j = 0; j < 2 + Math.floor(r() * 2); j++) {
          const p = Math.floor(r() * (pts.length / 2)) * 2;
          bubbles.push([pts[p] ?? 0, pts[p + 1] ?? 0, 0.00003 + r() * 0.00006, 0.0012 + r() * 0.0015]);
        }
        const ea = r() * Math.PI * 2, ex = Math.cos(ea), ey = Math.sin(ea), eLift = 0.0002 + r() * 0.0005;
        let eMax = 0;
        for (let j = 0; j < pts.length; j += 2) eMax = Math.max(eMax, pts[j] * ex + pts[j + 1] * ey);
        const lump = (x: number, y: number) => {
          let z = eLift * Math.max(0, (x * ex + y * ey - eMax + 0.005) / 0.005) ** 2;
          for (const [bx, by, amp, sig] of bubbles) z += amp * Math.exp(-((x - bx) ** 2 + (y - by) ** 2) / (2 * sig * sig));
          return z;
        };
        const restPos = (geo.attributes.position.array as Float32Array).slice(), bump = new Float32Array(restPos.length / 3);
        for (let j = 0; j < bump.length; j++) bump[j] = lump(restPos[j * 3], restPos[j * 3 + 1]);
        const pos = mm(s.x, s.y);
        list.push({
          foil, back, sil, ink: a.ink, holoMesh: null, holo: null, spec: s, mesh, shade, rest: restPos, bump, lump, pts: Float32Array.from(pts),
          w, h, pos, rot: 0, state: "flat", dir: new THREE.Vector2(0, -1), edge: 0, end: 0, front: 0, tip: new THREE.Vector2(),
          hand: new THREE.Vector3(), handT: new THREE.Vector3(), pull: new THREE.Vector2(), dirty: true,
          lift: 0, layer: list.length, liftV: 0, vel: new THREE.Vector2(), tilt: new THREE.Vector2(), target: pos.clone(), stuck0: 0, f0: 0, rt: 0, hand0: new THREE.Vector3(), lay: 0, free: 0,
        });
      });
      const home = list.map((s) => s.pos.clone());
      let top = list.length;

      // the cut's extent along the peel direction, and its first point (the tip, where the flap is held)
      const aim = (s: Sticker) => {
        let lo = Infinity, hi = -Infinity;
        for (let j = 0; j < s.pts.length; j += 2) {
          const a = s.pts[j] * s.dir.x + s.pts[j + 1] * s.dir.y;
          if (a < lo) {
            lo = a;
            s.tip.set(s.pts[j], s.pts[j + 1]);
          }
          hi = Math.max(hi, a);
        }
        s.edge = lo; // ponytail: the points sit 0.5 mm in from the cut, so the outermost half millimetre counts as the tip
        s.end = hi;
      };
      // how much of the sticker is still stuck to the liner
      const stuck = (s: Sticker) => {
        let n = 0;
        for (let j = 0; j < s.pts.length; j += 2) if (s.pts[j] * s.dir.x + s.pts[j + 1] * s.dir.y > s.front) n++;
        return n / Math.max(1, s.pts.length / 2);
      };

      // ---- the shape: every point keeps its place across the pull; along it, the vinyl before the front is laid on the curl
      // (by its arc length from the front) and then on the straight run to the hand
      const bend = (s: Sticker) => {
        const pos = s.mesh.geometry.attributes.position as Three.BufferAttribute;
        const arr = pos.array as Float32Array, rest = s.rest;
        if (s.state === "carry" || s.state === "drop") {
          // a carried sticker sags into a gentle curve along its width (floppy vinyl)
          const sag = 0.006 * Math.min(1, Math.max(0, s.lift / 0.025));
          for (let i = 0; i < arr.length; i += 3) {
            const x = rest[i] / (s.w / 2);
            arr[i] = rest[i];
            arr[i + 1] = rest[i + 1];
            arr[i + 2] = -sag * x * x;
          }
        } else if (s.state === "flat") {
          for (let i = 0, j = 0; i < arr.length; i += 3, j++) {
            arr[i] = rest[i];
            arr[i + 1] = rest[i + 1];
            arr[i + 2] = s.bump[j];
          }
        } else {
          const u = s.dir, f = s.front, { x: cx, z: cz } = CURL;
          const r = reach(s.hand.x * u.x + s.hand.y * u.y - f, s.hand.z), sk = r.k * DS;
          for (let i = 0, j = 0; i < arr.length; i += 3, j++) {
            const a = rest[i] * u.x + rest[i + 1] * u.y, sa = f - a; // arc length past the front
            let along = a, z: number;
            if (sa <= 0) z = s.bump[j] * Math.min(1, -sa / 0.003); // still stuck (its lumps pressed out right at the front)
            else if (sa < sk) {
              const q = sa / DS, i0 = Math.floor(q), t = q - i0;
              along = f + cx[i0] + (cx[i0 + 1] - cx[i0]) * t;
              z = cz[i0] + (cz[i0 + 1] - cz[i0]) * t;
            } else {
              const t = sa - sk;
              along = f + cx[r.k] + r.ex * t;
              z = cz[r.k] + r.ez * t;
            }
            arr[i] = rest[i] + u.x * (along - a);
            arr[i + 1] = rest[i + 1] + u.y * (along - a);
            arr[i + 2] = z;
          }
          if (s.free > 0) {
            // letting go: each point eases from where the peel holds it to where the carried sticker has it
            const e = s.free, sag = 0.006 * e;
            for (let i = 0; i < arr.length; i += 3) {
              const x = rest[i] / (s.w / 2);
              arr[i] += (rest[i] - arr[i]) * e;
              arr[i + 1] += (rest[i + 1] - arr[i + 1]) * e;
              arr[i + 2] = arr[i + 2] * (1 - e) - sag * x * x;
            }
          }
        }
        pos.needsUpdate = true;
        s.mesh.geometry.computeVertexNormals();
        const base = 0.0001 + s.layer * 0.00005;
        s.mesh.position.set(s.pos.x, s.pos.y, base + s.lift);
        // (the lean fades in with the lift, so a sticker falling back never tips an edge into the sheet)
        const lean = Math.min(1, s.lift / 0.025);
        s.mesh.rotation.set(s.tilt.x * lean, s.tilt.y * lean, s.rot);
        s.mesh.castShadow = s.state === "peel";
        // the baked shadow: under a lifted sticker it spreads, fades and slides away from the light
        const lift = Math.min(1, s.lift / 0.025), sh = s.shade, uni = sh.material.uniforms;
        // (a lifted one's shadow lies over every sticker on the sheet, not at its own layer)
        sh.position.set(s.pos.x + lift * 0.002, s.pos.y - lift * 0.006, s.lift > 0 ? 0.0001 + (top + 1) * 0.00005 : base - 0.00002);
        sh.rotation.z = s.rot;
        sh.scale.setScalar(1 + lift * 0.15);
        uni.opacity.value = 1 - lift * 0.7;
        uni.front.value = s.state === "peel" ? s.front : -1;
        uni.dir.value.copy(s.dir);
      };

      // ---- frame
      let camDist = 1;
      const view = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, hold: 0 }; // the pointer, -1..1 across the canvas (y down)
      const place = () => {
        table.rotation.set(TILT + view.y * PARALLAX.tilt, view.x * PARALLAX.tilt, 0);
        camera.position.set(0, 0, camDist).applyEuler(new THREE.Euler(view.y * PARALLAX.orbit, view.x * PARALLAX.orbit, 0));
        camera.lookAt(0, 0, 0);
      };
      const resize = () => {
        const { width, height } = box.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // back the camera off until the whole tilted sheet fits with a small margin (its near edge projects larger)
        const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        let d = Math.max(0.215 / 2 / tan, 0.165 / 2 / tan / camera.aspect);
        table.rotation.set(TILT, 0, 0);
        table.updateMatrixWorld();
        for (let i = 0; i < 3; i++) {
          camera.position.set(0, 0, d);
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld();
          let m = 0;
          for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
            const v = table.localToWorld(new THREE.Vector3((x * SHEET[0]) / 2, (y * SHEET[1]) / 2, 0)).project(camera);
            m = Math.max(m, Math.abs(v.x), Math.abs(v.y));
          }
          d *= m / 0.92; // a little more room than the sheet needs, for the parallax
        }
        camDist = d;
        place();
        camera.updateProjectionMatrix();
        render();
      };
      // ---- HoloSpot, loaded only for a sheet with holo stickers: its spectral foil draws on each one while it lies flat.
      // It copies a mesh's shape once and ignores alpha, so each gets a mesh of only the triangles inside its cut, and the
      // foil is lifted off (the painted film takes over) the moment the sticker starts to bend.
      // compile the shaders off the main thread where the browser can (KHR_parallel_shader_compile) before the first frame
      list.forEach(bend);
      await renderer.compileAsync(scene, camera);
      if (dead) {
        renderer.dispose();
        canvas.remove();
        return;
      }
      let holo: HoloKit | null = null;
      if (list.some((s) => s.foil)) {
        try {
          const { Holo } = await loadHoloSpot(THREE);
          if (dead) return;
          holo = new Holo(renderer, { assets: `${HOLOSPOT}/assets/`, compose: "over" });
        } catch {
          holo = null; // the painted film stays: still a holo sticker, just not HoloSpot's
        }
      }
      const cutMesh = (s: Sticker) => {
        const cell = 0.0004, nx = Math.ceil(s.w / cell), ny = Math.ceil(s.h / cell);
        const plane = new THREE.PlaneGeometry(s.w, s.h, nx, ny);
        const sx = s.sil.width, sy = s.sil.height;
        const px = s.sil.getContext("2d")!.getImageData(0, 0, sx, sy).data;
        const at = (u: number, v: number) => (Math.min(sy - 1, Math.max(0, Math.floor((1 - v) * sy))) * sx + Math.min(sx - 1, Math.max(0, Math.floor(u * sx)))) * 4;
        // the whole cut, ink and all: the ink is printed back over the foil afterwards (see `render`)
        const inside = (u: number, v: number) => px[at(u, v)] >= 128; // ponytail: 0.4 mm cells, so the foil's edge steps a little
        const uv = plane.attributes.uv, idx = plane.index!.array, keep: number[] = [];
        for (let i = 0; i < idx.length; i += 3) {
          const [a, b, c] = [idx[i], idx[i + 1], idx[i + 2]];
          if (inside((uv.getX(a) + uv.getX(b) + uv.getX(c)) / 3, (uv.getY(a) + uv.getY(b) + uv.getY(c)) / 3)) keep.push(a, b, c);
        }
        plane.setIndex(keep);
        // the same lumps as the vinyl under it, so the foil sits on them
        const p = plane.attributes.position;
        for (let i = 0; i < p.count; i++) p.setZ(i, s.lump(p.getX(i), p.getY(i)));
        plane.computeVertexNormals();
        const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
        m.position.z = 0.00004; // a hair above the vinyl: HoloSpot draws over the scene (depth-tested)
        return m;
      };
      let settling = 0, warmUntil = 0, holoLit = false; // foils HoloSpot is still building, and a few frames after the last one
      const foilOn = (s: Sticker) => {
        if (!holo || !s.foil || s.holo) return;
        s.holoMesh ??= cutMesh(s);
        s.mesh.add(s.holoMesh);
        s.holoMesh.updateWorldMatrix(true, false); // HoloSpot reads the pose once, here: parents too, or a re-applied foil keeps a stale one
        // the first foil also takes the look's studio (its lamps and exposure): that is what makes holo.spot's prism rainbow
        const obj = holo.apply(s.holoMesh, { look: "stickers", material: "prism", sizeMm: s.w * 1000, scene: !holoLit, doubleSided: false });
        holoLit = true;
        s.holo = obj;
        // the film stays under it, showing in the hairline round the ink. obj.ready only means compiled: the foil's bump
        // maps arrive later from a worker, and HoloSpot draws nothing new until a frame after that, so keep the loop
        // running until the kit says every foil has settled, plus a few frames
        const kit = holo;
        settling++;
        Promise.race([obj.ready.then(() => kit.ready()), new Promise((r) => setTimeout(r, 5000))])
          .catch(() => {})
          .then(() => {
            settling--;
            warmUntil = performance.now() + 250;
            kick.current();
          });
      };
      const foilOff = (s: Sticker) => {
        if (!s.holo) return;
        s.holo.remove();
        s.holo = null;
      };
      list.forEach(foilOn);
      // HoloSpot lays its foil over the whole cut, ink included, so a holo sticker's print is drawn again on top: the stickers
      // on layer 1 over a cleared depth buffer, those with foil showing only their ink (the rest, and the painted film, write
      // depth alone, so a flap held over a foil still hides the ink under it)
      const render = () => {
        if (!holo) return renderer.render(scene, camera);
        holo.render(scene, camera);
        if (!list.some((s) => s.holo)) return;
        const mats = list.flatMap((s) => [s.mesh, s.back, ...(s.foil ? [s.foil] : [])].map((o) => [o, o.material as Three.Material, s] as const));
        for (const [o, m, s] of mats) m.colorWrite = !!s.holo && o === s.mesh;
        camera.layers.set(1);
        renderer.autoClear = false;
        renderer.clearDepth();
        renderer.render(scene, camera);
        renderer.autoClear = true;
        camera.layers.set(0);
        for (const [, m] of mats) m.colorWrite = true;
      };
      const reduce = matchMedia("(prefers-reduced-motion: reduce)");
      // a sticker hung off the pointer follows it on a damped spring (a little lag, a little overshoot, leaning into its
      // motion); `k` scales how hard the spring pulls (it starts from 0 as the vinyl lets go of the liner)
      const spring = (s: Sticker, dt: number, k: number) => {
        const prev = s.pos.clone();
        if (reduce.matches) s.pos.lerp(s.target, (1 - Math.exp(-dt * 40)) * k);
        else {
          const W = 22, Z = 0.75, n = Math.ceil(dt / 0.006), h = dt / n;
          for (let i = 0; i < n; i++) {
            s.vel.x += (W * W * k * (s.target.x - s.pos.x) - 2 * Z * W * s.vel.x) * h;
            s.vel.y += (W * W * k * (s.target.y - s.pos.y) - 2 * Z * W * s.vel.y) * h;
            s.pos.x += s.vel.x * h;
            s.pos.y += s.vel.y * h;
          }
        }
        if (reduce.matches) s.vel.copy(s.pos).sub(prev).divideScalar(Math.max(dt, 1e-3));
        const down = s.state === "drop", lean = down ? 0 : 2;
        s.tilt.x += (THREE.MathUtils.clamp(-s.vel.y * lean, -0.5, 0.5) - s.tilt.x) * (1 - Math.exp(-dt * (down ? 10 : 14)));
        s.tilt.y += (THREE.MathUtils.clamp(s.vel.x * lean, -0.5, 0.5) - s.tilt.y) * (1 - Math.exp(-dt * (down ? 10 : 14)));
      };
      // the hand on the line from the tip out to `to`, as far along as a flap of vinyl `len` long reaches (the flap's reach
      // grows with the distance, so this is found by halving)
      const reined = (s: Sticker, to: Three.Vector3, len: number) => {
        const at = (l: number) => reach((s.tip.x + (to.x - s.tip.x) * l) * s.dir.x + (s.tip.y + (to.y - s.tip.y) * l) * s.dir.y - s.front, to.z * l).len;
        let lo = 0, hi = 1;
        if (at(1) <= len) lo = 1;
        else for (let i = 0; i < 12; i++) if (at((lo + hi) / 2) < len) lo = (lo + hi) / 2; else hi = (lo + hi) / 2;
        return new THREE.Vector3(s.tip.x + (to.x - s.tip.x) * lo, s.tip.y + (to.y - s.tip.y) * lo, to.z * lo);
      };
      let raf = 0, last = 0, seen = false, still = 0;
      let held: Sticker | null = null, grabAt = new THREE.Vector2(), lastPeelSound = 0, lastFront = 0;
      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        let busy = !!held || settling > 0 || now < warmUntil;
        if (view.hold > 0 && (view.hold -= dt) <= 0) view.tx = view.ty = 0;
        const tx = reduce.matches ? 0 : view.tx, ty = reduce.matches ? 0 : view.ty;
        [view.x, view.vx] = glide(view.x, view.vx, tx, dt);
        [view.y, view.vy] = glide(view.y, view.vy, ty, dt);
        if (Math.abs(view.x - tx) + Math.abs(view.y - ty) + Math.abs(view.vx) + Math.abs(view.vy) > 1e-4 || view.hold > 0) busy = true;
        place();
        for (const s of list) {
          if (s.state === "peel") {
            const ease = (k: number) => 1 - Math.exp(-dt * (reduce.matches ? 60 : k));
            if (s.stuck0 > 0) {
              // it is coming away, whether or not the finger is still down. The front sweeps on through what is left on an
              // eased clock; the hand keeps following the pointer, but never farther than the peeled flap reaches, so it
              // eases back toward the sticker as the vinyl lets go. As the stuck share shrinks the vinyl morphs from the
              // peel's shape into the carried one and rises, and the spring takes it to the pointer: no frame jumps
              s.rt += dt;
              const u = Math.min(1, s.rt / (reduce.matches ? 0.1 : 0.4));
              s.front = s.f0 + (s.end - s.f0) * u * u * (3 - 2 * u);
              s.hand.lerp(reined(s, s.handT, s.front - s.edge + GRIP), ease(14));
              const x = 1 - stuck(s) / s.stuck0;
              s.free = x * x * (3 - 2 * x);
              s.lift = 0.025 * s.free;
              spring(s, dt, s.free * s.free);
              if (u >= 1) {
                s.state = held === s ? "carry" : "drop";
                s.free = 0;
                s.stuck0 = 0;
                if (s.state === "drop") {
                  s.liftV = 0;
                  s.layer = ++top;
                }
              }
            } else if (s === held) {
              // the hand catches up with the pointer; the front moves only once the flap pulls harder than the liner holds
              s.hand.lerp(s.handT, ease(22));
              const ha = s.hand.x * s.dir.x + s.hand.y * s.dir.y;
              s.front = Math.min(s.end, Math.max(s.front, settle(s.front, s.edge, ha, s.hand.z, GRIP)));
              if (live.current.sound && s.front > lastFront + 0.0015 && now - lastPeelSound > 45) {
                (audio.current ??= createSounds())?.peel(((s.front - lastFront) / Math.max(dt, 0.008)) * 4);
                lastPeelSound = now;
                lastFront = s.front;
              }
              if (stuck(s) < 0.3) {
                // it is about to come away: carried under the finger from here on, once the front has swept the rest
                s.stuck0 = Math.max(stuck(s), 1e-3);
                s.f0 = s.front;
                s.rt = 0;
                s.vel.set(0, 0);
                lastFront = 0;
              }
            } else {
              // let go mid-peel: the flap lies back down, sticking again as it meets the liner. The front retreats on an eased
              // clock and the hand drops along the line to the tip as far as the shorter flap reaches
              if (s.lay === 0) {
                s.f0 = s.front;
                s.hand0.copy(s.hand);
              }
              s.lay += dt;
              const u = Math.min(1, s.lay / (reduce.matches ? 0.08 : 0.3));
              s.front = s.edge + (s.f0 - s.edge) * (1 - u * u * (3 - 2 * u));
              s.hand.copy(reined(s, s.hand0, s.front - s.edge));
              if (u >= 1) {
                s.state = "flat";
                s.lay = 0;
                s.dirty = true;
                foilOn(s);
              }
            }
            busy = true;
          } else if (s.state === "carry") {
            spring(s, dt, 1);
            s.lift += (0.025 - s.lift) * (1 - Math.exp(-dt * 12));
            busy = true;
          } else if (s.state === "drop") {
            spring(s, dt, 1); // still sliding in over the spot it is let go at, as it falls
            if (s.lift > 0) {
              s.liftV += -9.81 * 0.4 * dt;
              s.lift += s.liftV * dt;
              if (s.lift <= 0) {
                s.lift = s.liftV = 0;
                if (live.current.sound) (audio.current ??= createSounds())?.pat();
              }
            }
            // it lands once it is down and has stopped sliding
            if (s.lift === 0 && s.pos.distanceTo(s.target) < 1e-4 && s.vel.length() < 0.01) {
              s.pos.copy(s.target);
              s.vel.set(0, 0);
              s.tilt.set(0, 0);
              s.state = "flat";
              s.dirty = true;
              foilOn(s);
            }
            busy = true;
          }
          if (s.state !== "flat" || s.dirty) {
            bend(s);
            s.dirty = false;
          }

        }
        render();
        still = busy ? 0 : still + dt;
        raf = seen && !(still > 0.3) ? requestAnimationFrame(frame) : 0;
      };
      const start = () => {
        if (raf || !seen || dead) return;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };
      kick.current = start;

      // ---- pointer: everything happens on the sheet's plane
      const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
      const plane = new THREE.Plane(), hit = new THREE.Vector3();
      const onSheet = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        table.updateMatrixWorld();
        plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1).applyQuaternion(table.quaternion), new THREE.Vector3());
        if (!ray.ray.intersectPlane(plane, hit)) return null;
        const l = table.worldToLocal(hit.clone());
        return new THREE.Vector2(l.x, l.y);
      };
      const toLocal = (s: Sticker, p: Three.Vector2) => p.clone().sub(s.pos).rotateAround(new THREE.Vector2(), -s.rot);
      const onDown = (e: PointerEvent) => {
        const p = onSheet(e);
        if (!p) return;
        const hits = ray.intersectObjects(list.map((s) => s.mesh), false);
        const s = list.find((x) => x.mesh === hits[0]?.object);
        if (!s || s.state === "drop") return;
        held = s;
        foilOff(s);
        grabAt = p;
        if (s.state === "flat") {
          // the peel starts at the edge nearest the finger, heading in across the sticker
          const l = toLocal(s, p);
          s.dir.set(-l.x / s.w, -l.y / s.h);
          if (s.dir.lengthSq() < 1e-6) s.dir.set(0, -1);
          s.dir.normalize();
          aim(s);
          s.front = s.edge;
          s.hand.set(s.tip.x, s.tip.y, 0);
          s.handT.copy(s.hand);
          s.state = "peel";
        }
        s.lay = 0;
        s.pull.set(s.hand.x - s.tip.x, s.hand.y - s.tip.y); // picked up again as it lies back down: from where it is
        lastFront = s.front;
        s.mesh.renderOrder = 1;
        table.remove(s.mesh);
        table.add(s.mesh); // drawn last, over its neighbours
        canvas.setPointerCapture(e.pointerId);
        start();
      };
      const onMove = (e: PointerEvent) => {
        canvas.style.cursor = held ? "grabbing" : "";
        if (e.pointerType === "mouse") {
          const r = canvas.getBoundingClientRect();
          view.tx = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
          view.ty = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
          view.hold = 0;
          start();
        }
        if (!held) {
          // a hand over a sticker says it can be picked
          const p = onSheet(e);
          if (p) canvas.style.cursor = ray.intersectObjects(list.map((s) => s.mesh), false).length ? "grab" : "";
          return;
        }
        const p = onSheet(e);
        if (!p) return;
        const s = held;
        // a sticker can be put down round the sheet, never carried out of view
        s.target.set(THREE.MathUtils.clamp(p.x, -0.085, 0.085), THREE.MathUtils.clamp(p.y, -0.115, 0.115));
        if (s.state === "peel") {
          const pull = p.clone().sub(grabAt).rotateAround(new THREE.Vector2(), -s.rot).add(s.pull);
          const n = pull.length();
          // while only the edge is up, the peel turns to follow the pull
          if (s.front - s.edge < 0.003 && n > 0.0015 && pull.dot(s.dir) > 0) {
            const peeled = s.front - s.edge;
            s.dir.lerp(pull.clone().divideScalar(n), 0.25).normalize();
            aim(s);
            s.front = s.edge + peeled;
          }
          s.handT.set(s.tip.x + pull.x, s.tip.y + pull.y, Math.min(4.2 * R0, 0.3 * n)); // held low, so the flap lies back over the sticker
        }
        start();
      };
      const onUp = (e: PointerEvent) => {
        if (held?.state === "carry") {
          held.state = "drop";
          held.liftV = 0;
          held.layer = ++top;
        }
        held = null;
        lastFront = 0;
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
        start();
      };
      const onLeave = () => {
        view.hold = 0.5; // the view stays turned a moment, then settles back
        start();
      };
      const onReset = () => {
        top = list.length;
        list.forEach((s, i) => {
          s.pos.copy(home[i]);
          s.rot = 0;
          s.layer = i;
          s.state = "flat";
          s.lift = s.free = s.stuck0 = s.lay = 0;
          s.vel.set(0, 0);
          s.tilt.set(0, 0);
          s.dirty = true;
          foilOn(s);
        });
        start();
      };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("dblclick", onReset);
      const onMq = () => start();
      reduce.addEventListener("change", onMq);
      const ro = new ResizeObserver(resize);
      ro.observe(box);
      const io = new IntersectionObserver(([e]) => {
        seen = e.isIntersecting;
        if (seen) start();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      });
      io.observe(box);
      const onLost = (e: Event) => {
        e.preventDefault();
        setFailed(true);
      };
      canvas.addEventListener("webglcontextlost", onLost);
      resize();

      cleanup = () => {
        cancelAnimationFrame(raf);
        kick.current = () => {};
        ro.disconnect();
        io.disconnect();
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        canvas.removeEventListener("pointerleave", onLeave);
        canvas.removeEventListener("dblclick", onReset);
        reduce.removeEventListener("change", onMq);
        canvas.removeEventListener("webglcontextlost", onLost);
        const done = new Set<unknown>();
        scene.traverse((o) => {
          const m = o as Three.Mesh;
          for (const r of [m.geometry, m.customDepthMaterial, ...([] as Three.Material[]).concat(m.material ?? [])]) {
            if (r && !done.has(r)) {
              done.add(r);
              r.dispose();
            }
          }
        });
        textures.forEach((t) => t.dispose());
        holo?.dispose();
        pmrem.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })().catch(() => {
      if (!dead) setFailed(true);
    });
    return () => {
      dead = true;
      cleanup();
    };
  }, [key]);

  return (
    <div
      ref={root}
      role="img"
      aria-label={`A sheet of ${stickers.length} stickers. Drag a sticker to peel it off and drop it anywhere; double-click to put them all back.`}
      className={cn("relative aspect-[3/4] w-full overflow-hidden", className)}
      {...rest}
    >
      {failed && <span className="absolute inset-0 grid place-items-center text-muted-foreground">Stickers</span>}
    </div>
  );
}
