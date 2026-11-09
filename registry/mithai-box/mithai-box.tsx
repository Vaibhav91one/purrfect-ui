"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import type * as Three from "three";
import { cn } from "@/lib/utils";

export type Sweet = "laddoo" | "katli" | "jalebi" | "barfi" | "gulabjamun" | "milkcake" | "sandesh";

export interface MithaiBoxProps extends Omit<ComponentProps<"button">, "children" | "ref"> {
  /** Controlled open state. Leave it out and the box toggles itself on click. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The finish: maroon with a gold-foil mandala, peacock blue with foil feathers, blind-embossed kraft or velvet with zari. */
  variant?: "royal" | "peacock" | "kraft" | "velvet";
  /** The box's plan: square (9 cups), long (8, the kaju katli box), hexagon, octagon or round (7 each, round a centre cup). */
  shape?: Shape;
  /** The box itself: the classic hinged box (finish and shape apply to it), or a shop format copied from real Diwali boxes:
   * a net-covered tray, a diamond box whose flaps unfold, a Rajwadi carry box, an arch-window hamper, a filigree dabba, a
   * rigid box with a ribbon. */
  format?: Format;
  /** What sits in the paper cups, row by row from the back (ring boxes: the centre, then round). Extras are dropped; fewer leave empty cups. */
  sweets?: Sweet[];
  /** Written inside the lid, seen once it opens. */
  message?: string;
  /** Stops the idle float, so nothing redraws until the box is touched. */
  paused?: boolean;
  /** Its own sounds (click, hinge creak, thuds, a chime with reverb), made with Web Audio. They start on the first click. */
  sound?: boolean;
  /** A hand-written note with a scribbled arrow pointing at the box whenever it is shut. false hides it. */
  hint?: string | false;
}

// the note writes itself in once the lid has landed, then the arrow keeps drawing itself on, fading and drawing again
const HINT_CSS = `
@keyframes mb-write { from { clip-path: inset(0 100% 0 0) } to { clip-path: inset(0 0 0 0) } }
@keyframes mb-redraw { 0% { stroke-dashoffset: 1; opacity: 1 } 22% { stroke-dashoffset: 0 } 78% { stroke-dashoffset: 0; opacity: 1 } 92%, 100% { stroke-dashoffset: 0; opacity: 0 } }
@keyframes mb-in { from { opacity: 0 } to { opacity: 1 } }
.mb-hint { animation: mb-in .3s .6s both }
.mb-write { animation: mb-write .8s .7s steps(12, end) both }
.mb-shaft { stroke-dasharray: 1; animation: mb-redraw 3.2s 1.5s cubic-bezier(.23, 1, .32, 1) infinite both }
.mb-head { stroke-dasharray: 1; animation: mb-redraw 3.2s 1.75s cubic-bezier(.23, 1, .32, 1) infinite both }
.mb-pick { animation: mb-in .2s both }
.mb-pick .mb-write { animation-delay: 0s }
@media (prefers-reduced-motion: reduce) { .mb-write, .mb-shaft, .mb-head { animation: none } }
`;

// The surface art, drawn in white onto a mask: each finish turns the mask into foil (or ink), raised by a bump map.
// Motifs from real mithai boxes: a foil mandala, paisleys, jharokha arches with diyas, peacock eyes, jaali and zari borders.
type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const ring = (c: Ctx, x: number, y: number, r: number, width: number) => {
  c.lineWidth = width;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.stroke();
};
const dots = (c: Ctx, x: number, y: number, r: number, n: number, size: number) => {
  for (let i = 0; i < n; i++) {
    c.beginPath();
    c.arc(x + r * Math.cos((i * TAU) / n), y + r * Math.sin((i * TAU) / n), size, 0, TAU);
    c.fill();
  }
};
const petals = (c: Ctx, x: number, y: number, r: number, n: number, len: number, wid: number, fill: boolean, turn = 0) => {
  for (let i = 0; i < n; i++) {
    c.save();
    c.translate(x, y);
    c.rotate(turn + (i * TAU) / n);
    c.beginPath();
    c.moveTo(0, -r);
    c.quadraticCurveTo(wid, -r - len * 0.5, 0, -r - len); // a pointed petal
    c.quadraticCurveTo(-wid, -r - len * 0.5, 0, -r);
    if (fill) c.fill();
    else c.stroke();
    c.restore();
  }
};
const mandala = (c: Ctx, x: number, y: number, R: number) => {
  ring(c, x, y, R, R * 0.014);
  ring(c, x, y, R * 0.95, R * 0.006);
  dots(c, x, y, R * 0.9, 56, R * 0.012);
  c.lineWidth = R * 0.01;
  petals(c, x, y, R * 0.58, 16, R * 0.3, R * 0.1, false);
  petals(c, x, y, R * 0.58, 16, R * 0.18, R * 0.04, true);
  petals(c, x, y, R * 0.58, 16, R * 0.22, R * 0.07, false, TAU / 32);
  ring(c, x, y, R * 0.56, R * 0.012);
  dots(c, x, y, R * 0.5, 32, R * 0.014);
  petals(c, x, y, R * 0.2, 8, R * 0.26, R * 0.12, true);
  ring(c, x, y, R * 0.16, R * 0.012);
  c.beginPath();
  c.arc(x, y, R * 0.07, 0, TAU);
  c.fill();
};
const paisley = (c: Ctx, x: number, y: number, s: number, turn: number) => {
  c.save();
  c.translate(x, y);
  c.rotate(turn);
  c.scale(s, s);
  c.lineWidth = 0.05;
  for (const k of [1, 0.62]) {
    c.beginPath();
    c.moveTo(0.25 * k, 0.45 * k);
    c.bezierCurveTo(-0.55 * k, 0.55 * k, -0.6 * k, -0.35 * k, 0, -0.55 * k); // the round belly
    c.bezierCurveTo(0.45 * k, -0.7 * k, 0.8 * k, -0.3 * k, 0.55 * k, 0.05 * k); // over the top
    c.quadraticCurveTo(0.95 * k, 0.75 * k, 0.25 * k, 0.45 * k); // the curled tail
    c.stroke();
  }
  c.beginPath();
  c.arc(-0.02, -0.08, 0.1, 0, TAU);
  c.fill();
  c.restore();
};
const peacockEye = (c: Ctx, x: number, y: number, s: number, turn: number) => {
  c.save();
  c.translate(x, y);
  c.rotate(turn);
  c.lineWidth = s * 0.04;
  for (let i = -6; i <= 6; i++) {
    c.beginPath(); // the barbs fanning out behind the eye
    c.moveTo(0, s * 0.9);
    c.lineTo(Math.sin(i * 0.12) * s * 1.1, -Math.cos(i * 0.12) * s * 0.9);
    c.stroke();
  }
  c.beginPath();
  c.ellipse(0, -s * 0.15, s * 0.42, s * 0.55, 0, 0, TAU);
  c.stroke();
  c.beginPath();
  c.ellipse(0, -s * 0.1, s * 0.22, s * 0.3, 0, 0, TAU);
  c.fill();
  c.restore();
};
// the box's floor plan, grown by g (world units) so every inset and offset is exact: a flat back edge (or the backmost
// point) sits at min z, where the hinge goes. Points are (x, z), counter-clockwise seen from above.
export type Shape = "square" | "long" | "hexagon" | "octagon" | "round";
type Pt = [number, number];
const outlineOf = (shape: Shape, g = 0): Pt[] => {
  if (shape === "square" || shape === "long") {
    const hx = (shape === "long" ? 2 : 1.5) + g, hz = (shape === "long" ? 1.1 : 1.5) + g;
    return [[-hx, -hz], [-hx, hz], [hx, hz], [hx, -hz]];
  }
  const n = shape === "hexagon" ? 6 : shape === "octagon" ? 8 : 64, R = (1.5 + g) / Math.cos(Math.PI / n); // apothem 1.5
  return Array.from({ length: n }, (_, k) => {
    const a = Math.PI / n + (k * TAU) / n; // an edge centred straight behind: the flat back
    return [-R * Math.sin(a), -R * Math.cos(a)] as Pt;
  });
};
const boundsOf = (o: Pt[]) => {
  const xs = o.map((p) => p[0]), zs = o.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) };
};
const pathOf = (c: Ctx, poly: Pt[]) => {
  c.beginPath();
  poly.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
};
// walk a closed polygon every `step`, calling fn with the point and the outward normal's angle
const along = (poly: Pt[], step: number, fn: (x: number, y: number, normal: number) => void) => {
  const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
  let carry = step / 2;
  poly.forEach(([x0, y0], i) => {
    const [x1, y1] = poly[(i + 1) % poly.length], len = Math.hypot(x1 - x0, y1 - y0);
    let nx = (y1 - y0) / len, ny = -(x1 - x0) / len;
    if (nx * ((x0 + x1) / 2 - cx) + ny * ((y0 + y1) / 2 - cy) < 0) {
      nx = -nx;
      ny = -ny;
    }
    for (let d = carry; d < len; d += step) fn(x0 + ((x1 - x0) * d) / len, y0 + ((y1 - y0) * d) / len, Math.atan2(ny, nx));
    carry = (carry - len) % step;
    if (carry < 0) carry += step;
  });
};
// a lid's canvas: px per world unit, its size, and the outline at any inset, in canvas px (canvas top = the lid's back)
type Lid = { w: number; h: number; s: number; at: (g: number) => Pt[]; msg: string; corners: boolean };
// the border: a rule, a fine rule, and a row of beads between them, following the lid's own outline
const frame = (c: Ctx, L: Lid) => {
  c.lineWidth = L.s * 0.018;
  pathOf(c, L.at(-0.15));
  c.stroke();
  c.lineWidth = L.s * 0.008;
  pathOf(c, L.at(-0.22));
  c.stroke();
  const b = L.s * 0.019;
  along(L.at(-0.185), L.s * 0.08, (x, y) => c.fillRect(x - b / 2, y - b / 2, b, b));
};
// one jharokha arch (a double outline, pointed on top) with a diya inside, between x l..r and y apex..base
const arch = (c: Ctx, l: number, r: number, apex: number, base: number) => {
  const aw = r - l, h = base - apex, mid = (l + r) / 2, spring = apex + h * 0.4;
  c.lineWidth = aw * 0.045;
  for (const k of [0, aw * 0.11]) {
    c.beginPath();
    c.moveTo(l + k, base - k * 0.3);
    c.lineTo(l + k, spring);
    c.quadraticCurveTo(l + k, apex + k * 1.6, mid, apex + k * 1.4);
    c.quadraticCurveTo(r - k, apex + k * 1.6, r - k, spring);
    c.lineTo(r - k, base - k * 0.3);
    c.stroke();
  }
  c.beginPath(); // the diya: a bowl and a flame
  c.ellipse(mid, apex + h * 0.775, aw * 0.22, h * 0.085, 0, 0, Math.PI);
  c.fill();
  c.beginPath();
  c.moveTo(mid, apex + h * 0.49);
  c.quadraticCurveTo(mid + aw * 0.094, apex + h * 0.66, mid, apex + h * 0.72);
  c.quadraticCurveTo(mid - aw * 0.094, apex + h * 0.66, mid, apex + h * 0.49);
  c.fill();
};
// a row of jharokha arches: the box walls, drawn below the band the closed lid's skirt covers
const arches = (c: Ctx, w: number, full: number) => {
  const cover = full * 0.3, h = full - cover;
  c.translate(0, cover);
  const n = 7, cw = w / n;
  c.lineWidth = h * 0.02;
  c.strokeRect(0, h * 0.05, w, h * 0.9);
  for (let i = 0; i < n; i++) arch(c, i * cw + cw * 0.18, (i + 1) * cw - cw * 0.18, h * 0.13, h * 0.84);
};
// a toran, the Diwali door garland: mango leaves hanging between marigolds, under a rule, for the lid's skirt
const toran = (c: Ctx, w: number, h: number) => {
  c.fillRect(0, h * 0.06, w, h * 0.08);
  const step = h * 0.95;
  for (let x = step / 2; x < w + step; x += step) {
    c.beginPath(); // the leaf, with its midrib cut out
    c.moveTo(x, h * 0.14);
    c.quadraticCurveTo(x + h * 0.24, h * 0.5, x, h * 0.92);
    c.quadraticCurveTo(x - h * 0.24, h * 0.5, x, h * 0.14);
    c.fill();
    c.save();
    c.globalCompositeOperation = "destination-out";
    c.lineWidth = h * 0.035;
    c.beginPath();
    c.moveTo(x, h * 0.26);
    c.lineTo(x, h * 0.8);
    c.stroke();
    c.restore();
    const m = x + step / 2; // the marigold: a ring of petals round a bead, on a short string
    c.fillRect(m - h * 0.012, h * 0.14, h * 0.024, h * 0.12);
    dots(c, m, h * 0.36, h * 0.08, 8, h * 0.045);
    c.beginPath();
    c.arc(m, h * 0.36, h * 0.05, 0, TAU);
    c.fill();
  }
};
// a greeting plate: a pointed cartouche with the message, like the brand plate on a sweet shop's box
const plaque = (c: Ctx, w: number, y: number, msg: string, s: number) => {
  const pw = s * 1.37, ph = s * 0.23, x = w / 2 - pw / 2;
  c.lineWidth = s * 0.013;
  for (const k of [0, ph * 0.12]) {
    c.beginPath();
    c.moveTo(x + k, y);
    c.lineTo(x + ph * 0.5 + k, y - ph / 2 + k);
    c.lineTo(x + pw - ph * 0.5 - k, y - ph / 2 + k);
    c.lineTo(x + pw - k, y);
    c.lineTo(x + pw - ph * 0.5 - k, y + ph / 2 - k);
    c.lineTo(x + ph * 0.5 + k, y + ph / 2 - k);
    c.closePath();
    c.stroke();
  }
  let size = ph * 0.5;
  c.font = `600 ${size}px Georgia, serif`;
  const fit = (pw * 0.72) / Math.max(1, c.measureText(msg).width);
  if (fit < 1) c.font = `600 ${(size *= fit)}px Georgia, serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(msg, w / 2, y + size * 0.05);
};
// laser-cut jaali: a lattice of eight-point stars
const jaali = (c: Ctx, L: Lid) => {
  frame(c, L);
  c.save();
  pathOf(c, L.at(-0.3));
  c.clip();
  const s = L.s * 0.29;
  c.lineWidth = s * 0.06;
  for (let y = s * 0.5; y < L.h; y += s)
    for (let x = s * 0.5; x < L.w; x += s)
      for (const t of [0, Math.PI / 4]) {
        c.save();
        c.translate(x, y);
        c.rotate(t);
        c.strokeRect(-s * 0.28, -s * 0.28, s * 0.56, s * 0.56);
        c.restore();
      }
  c.restore();
};

// ---- printed art for the shop formats, copied from the listing photos ------------------------------------------------
// Each painter gets an `ink` that resolves a colour name: in the colour pass it is the colour, in the foil pass gold is
// white and every other ink black, so one drawing yields both the print and a mask of where the foil is.
type Ink = (name: string) => string;
export type Format = "classic" | "tray" | "diamond" | "rajwadi" | "arch" | "dabba" | "rigid";
const PALETTE: Record<string, string> = {
  gold: "#d8a637", goldDark: "#9c6c1c", goldLight: "#f1d27a", red: "#a91c22", redDeep: "#7a0f15", redMid: "#d4383c", cream: "#f8e4ae", crimson: "#8c2232",
  blush: "#eab4ab", blushDeep: "#c98579", ribbonPink: "#eab3b6",
  pink: "#ef9ea4", yellow: "#e9a62e", yellowDeep: "#c98a1c", green: "#2d5530", greenLight: "#5d8a46", blue: "#2c4f7c", orange: "#e0552a",
  orangeLine: "#d8892f", white: "#fbf7ec", maroon: "#6c1424", ivory: "#f3eadb", inner: "#f7f2ea",
};
// a pointed petal or leaf from (x, y) along `ang` (0 points up), `len` long and `wid` wide at its belly
const petal = (c: Ctx, x: number, y: number, len: number, wid: number, ang: number, fill: string, stroke?: string) => {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  c.beginPath();
  c.moveTo(0, 0);
  c.bezierCurveTo(wid, -len * 0.28, wid * 0.62, -len * 0.82, 0, -len);
  c.bezierCurveTo(-wid * 0.62, -len * 0.82, -wid, -len * 0.28, 0, 0);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = Math.max(1, len * 0.035);
    c.stroke();
  }
  c.restore();
};
const leafV = (c: Ctx, x: number, y: number, len: number, wid: number, ang: number, ink: Ink, fill = "gold", vein = "goldDark") => {
  petal(c, x, y, len, wid, ang, ink(fill));
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  c.strokeStyle = ink(vein);
  c.lineWidth = Math.max(1, len * 0.03);
  c.beginPath();
  c.moveTo(0, -len * 0.08);
  c.quadraticCurveTo(wid * 0.12, -len * 0.5, 0, -len * 0.9);
  for (let i = 1; i < 4; i++) for (const sg of [-1, 1]) {
    c.moveTo(0, -len * (0.2 + i * 0.17));
    c.lineTo(sg * wid * 0.45, -len * (0.32 + i * 0.17));
  }
  c.stroke();
  c.restore();
};
const disc = (c: Ctx, x: number, y: number, r: number, fill: string) => {
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fillStyle = fill;
  c.fill();
};
// the hamper's lotus: gold leaves out to the sides, five red petals fanned behind a cream bud outlined in gold
const lotus = (c: Ctx, x: number, y: number, s: number, ink: Ink, petals = "redMid", bud = "cream") => {
  leafV(c, x - s * 0.08, y + s * 0.02, s * 0.95, s * 0.3, -1.25, ink);
  leafV(c, x + s * 0.08, y + s * 0.02, s * 0.95, s * 0.3, 1.25, ink);
  for (const [a, l] of [[-0.95, 0.72], [0.95, 0.72], [-0.5, 0.92], [0.5, 0.92], [0, 1.02]] as const) petal(c, x, y, s * l * 1.07, s * 0.35, a, ink("gold"));
  for (const [a, l] of [[-0.95, 0.72], [0.95, 0.72], [-0.5, 0.92], [0.5, 0.92], [0, 1.02]] as const) {
    petal(c, x, y, s * l, s * 0.3, a, ink(petals), ink("redDeep"));
    c.strokeStyle = ink("redDeep"); // the petal's midrib
    c.lineWidth = Math.max(1, s * 0.025);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.sin(a) * s * l * 0.75, y - Math.cos(a) * s * l * 0.75);
    c.stroke();
  }
  for (const a of [-0.5, 0.5]) petal(c, x, y - s * 0.04, s * 0.62, s * 0.14, a, ink("red"));
  petal(c, x, y - s * 0.02, s * 0.78, s * 0.27, 0, ink(bud), ink("gold"));
  petal(c, x, y - s * 0.1, s * 0.5, s * 0.13, 0, ink("goldLight"));
  c.beginPath(); // the calyx
  c.ellipse(x, y, s * 0.16, s * 0.08, 0, 0, Math.PI);
  c.fillStyle = ink("gold");
  c.fill();
};
const beads = (c: Ctx, x: number, y0: number, y1: number, r: number, ink: Ink) => {
  for (let y = y0; y <= y1; y += r * 2.6) disc(c, x, y, r, ink("gold"));
};
const pendant = (c: Ctx, x: number, y: number, s: number, ink: Ink) => {
  c.beginPath();
  c.moveTo(x, y - s);
  c.lineTo(x + s * 0.55, y);
  c.lineTo(x, y + s);
  c.lineTo(x - s * 0.55, y);
  c.closePath();
  c.fillStyle = ink("gold");
  c.fill();
  c.beginPath();
  c.moveTo(x, y - s * 0.5);
  c.lineTo(x + s * 0.27, y);
  c.lineTo(x, y + s * 0.5);
  c.lineTo(x - s * 0.27, y);
  c.closePath();
  c.fillStyle = ink("goldLight");
  c.fill();
};
const rosette8 = (c: Ctx, x: number, y: number, r: number, ink: Ink) => {
  for (let i = 0; i < 8; i++) petal(c, x, y, r, r * 0.32, (i * TAU) / 8, ink(i % 2 ? "goldLight" : "gold"), ink("goldDark"));
  disc(c, x, y, r * 0.22, ink("goldDark"));
};
// an onion-dome arch: straight jambs from the base, cusped shoulders, a bulb and a point
const onionPath = (c: Ctx, cx: number, base: number, w: number, h: number) => {
  const l = cx - w / 2, r = cx + w / 2, jamb = base - h * 0.5, sh = base - h * 0.62;
  c.beginPath();
  c.moveTo(l, base);
  c.lineTo(l, jamb);
  c.quadraticCurveTo(l, sh, l + w * 0.1, sh);
  c.bezierCurveTo(l + w * 0.1, base - h * 0.78, l + w * 0.3, base - h * 0.76, cx - w * 0.14, base - h * 0.82);
  c.bezierCurveTo(cx - w * 0.05, base - h * 0.86, cx - w * 0.02, base - h * 0.95, cx, base - h);
  c.bezierCurveTo(cx + w * 0.02, base - h * 0.95, cx + w * 0.05, base - h * 0.86, cx + w * 0.14, base - h * 0.82);
  c.bezierCurveTo(r - w * 0.3, base - h * 0.76, r - w * 0.1, base - h * 0.78, r - w * 0.1, sh);
  c.quadraticCurveTo(r, sh, r, jamb);
  c.lineTo(r, base);
  c.closePath();
};
// the Rajwadi florals: six round petals round a dark eye
const flower6 = (c: Ctx, x: number, y: number, r: number, fill: string, ink: Ink) => {
  for (let i = 0; i < 6; i++) disc(c, x + Math.cos((i * TAU) / 6) * r * 0.62, y + Math.sin((i * TAU) / 6) * r * 0.62, r * 0.42, fill);
  disc(c, x, y, r * 0.3, ink("yellowDeep"));
  disc(c, x, y, r * 0.12, ink("redDeep"));
};
const lily = (c: Ctx, x: number, y: number, r: number, ink: Ink) => {
  for (let i = 0; i < 6; i++) petal(c, x, y, r, r * 0.3, (i * TAU) / 6 + 0.26, ink("orange"), ink("redDeep"));
  disc(c, x, y, r * 0.16, ink("yellow"));
  c.strokeStyle = ink("redDeep");
  c.lineWidth = Math.max(1, r * 0.04);
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos((i * TAU) / 6) * r * 0.45, y + Math.sin((i * TAU) / 6) * r * 0.45);
    c.stroke();
  }
};
const blossom = (c: Ctx, x: number, y: number, r: number, ink: Ink, fill = "white") => {
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.arc(x + Math.cos((i * TAU) / 5 - 1.57) * r * 0.55, y + Math.sin((i * TAU) / 5 - 1.57) * r * 0.55, r * 0.42, 0, TAU);
    c.fillStyle = ink(fill);
    c.fill();
    c.strokeStyle = ink("green");
    c.lineWidth = Math.max(1, r * 0.08);
    c.stroke();
  }
  disc(c, x, y, r * 0.2, ink("yellowDeep"));
};
const stem = (c: Ctx, pts: number[][], w: number, ink: Ink) => {
  c.strokeStyle = ink("green");
  c.lineWidth = w;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.stroke();
};
// a vine border, as printed: the stem weaves between flowers set on alternate sides (red and blue in turn), each on a
// short stalk, with a pair of leaves at every swing and a red bud between
const vine = (c: Ctx, x: number, y0: number, y1: number, amp: number, ink: Ink) => {
  const n = 13, pts: number[][] = [];
  for (let i = 0; i <= 260; i++) {
    const t = i / 260;
    pts.push([x + Math.sin(t * n * Math.PI) * amp, y0 + (y1 - y0) * t]);
  }
  stem(c, pts, amp * 0.16, ink);
  const step = (y1 - y0) / n;
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1, yy = y0 + step * (i + 0.5), crest = x + side * amp;
    // leaves: a pair at the swing and a pair either side of it, dark and light in turn
    for (const [dy, a, l] of [[0, 0.5, 1.1], [0, 2.5, 0.95], [-0.3, 0.9, 0.8], [0.3, 2.2, 0.8], [-0.3, -0.6, 0.7], [0.3, 3.6, 0.7]] as const)
      leafV(c, crest - side * amp * Math.abs(dy) * 0.6, yy + step * dy, amp * l, amp * 0.34 * l, side * a, ink, l > 0.9 ? "green" : "greenLight", l > 0.9 ? "greenLight" : "green");
    // a tendril curling in the hollow
    c.strokeStyle = ink("green");
    c.lineWidth = amp * 0.07;
    c.beginPath();
    c.arc(x - side * amp * 0.2, yy - step * 0.3, amp * 0.22, 0, Math.PI * 1.6);
    c.stroke();
    const fx = x - side * amp * 0.95, fy = yy + step * 0.05;
    stem(c, [[x - side * amp * 0.35, yy - step * 0.18], [fx, fy]], amp * 0.09, ink);
    flower6(c, fx, fy, amp * 0.72, ink(i % 2 ? "blue" : "redMid"), ink);
    disc(c, crest + side * amp * 0.35, yy - step * 0.36, amp * 0.17, ink("redMid"));
  }
};
// a spray of small flowers along a curving stem: from its foot it heads along `dir` (radians, 0 = up) and bends by
// `lean`, the way the arch's sprays curl inward and the spandrel sprays follow the shoulders
const spray = (c: Ctx, x: number, y: number, h: number, lean: number, ink: Ink, fill: string, dir = 0) => {
  const pts: number[][] = [], cs = Math.cos(dir), sn = Math.sin(dir);
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, lx = lean * h * t * t, ly = -h * t;
    pts.push([x + lx * cs - ly * sn, y + lx * sn + ly * cs]);
  }
  stem(c, pts, h * 0.012, ink);
  const f = h * 0.026;
  for (let i = 2; i < 40; i += 2) {
    const [px, py] = pts[i], [qx, qy] = pts[i + 1], tx = qx - px, ty = qy - py, tl = Math.hypot(tx, ty) || 1;
    const side = i % 4 ? 1 : -1, reach = h * (0.07 + 0.03 * Math.sin(i)), nx = (-ty / tl) * side, ny = (tx / tl) * side, bx = px + nx * reach, by = py + ny * reach;
    stem(c, [[px, py], [bx, by]], h * 0.008, ink);
    leafV(c, px, py, h * 0.06, h * 0.02, Math.atan2(nx, -ny) + side * 0.6, ink, "green", "greenLight");
    flower6(c, bx, by, f, ink(fill), ink);
    if (i % 4 === 2) flower6(c, bx + nx * f * 1.6 + (tx / tl) * f, by + ny * f * 1.6 + (ty / tl) * f, f * 0.8, ink(fill), ink);
  }
  flower6(c, pts[40][0], pts[40][1], f * 1.2, ink(fill), ink);
};
// the tray's foil: rows of V stripes, gold and pale gold on white
const chevrons = (c: Ctx, w: number, h: number, ink: Ink) => {
  // the tray's foil, as in the photo: bold 45-degree chevron stripes, gold and white of equal width, about three rows deep
  c.fillStyle = ink("white");
  c.fillRect(0, 0, w, h);
  const p = h * 0.7, a = p / 2, band = h * 0.17;
  for (let y0 = -a - band; y0 < h + band; y0 += band * 2) {
    c.beginPath();
    for (let x = -p, k = 0; x <= w + p; x += a, k++) c.lineTo(x, y0 + (k % 2 ? a : 0));
    for (let x = w + p - ((w + 2 * p) % a), k = Math.round((w + 2 * p) / a); x >= -p; x -= a, k--) c.lineTo(x, y0 + band + (k % 2 ? a : 0));
    c.closePath();
    c.fillStyle = ink("gold");
    c.fill();
  }
};

// ---- whole faces, laid out as on the boxes in the photos --------------------------------------------------------------
// the arch hamper: the window's outline, shared by the print and by the cut that opens it
const archWindow = (c: Ctx, w: number, h: number) => onionPath(c, w / 2, h * 0.8, w * 0.49, h * 0.565);
// the hamper's corner cluster, as printed: a big gold leaf rising outward, gold leaves sweeping out along the bottom, a
// red leaf reaching in, berries on fine stalks, and the lotus in the middle of it all
const cluster = (c: Ctx, x: number, y: number, s: number, inward: number, ink: Ink) => {
  leafV(c, x - inward * s * 0.25, y + s * 0.05, s * 1.75, s * 0.4, -inward * 0.42, ink);
  leafV(c, x - inward * s * 0.15, y + s * 0.18, s * 1.25, s * 0.32, -inward * 1.62, ink);
  leafV(c, x - inward * s * 0.05, y + s * 0.22, s * 0.95, s * 0.26, -inward * 2.1, ink, "goldLight", "gold");
  leafV(c, x + inward * s * 0.35, y + s * 0.2, s * 1.2, s * 0.3, inward * 1.62, ink, "redMid", "redDeep");
  leafV(c, x + inward * s * 0.25, y + s * 0.05, s * 0.95, s * 0.26, inward * 0.8, ink);
  c.strokeStyle = ink("gold");
  c.lineWidth = Math.max(1, s * 0.03);
  for (const [bx, by] of [[0.25, -1.25], [0.62, -1.08], [0.95, -0.82], [1.18, -0.5], [-0.08, -1.32]]) {
    const ex = x + inward * s * bx, ey = y + s * by;
    c.beginPath();
    c.moveTo(x + inward * s * 0.15, y - s * 0.35);
    c.quadraticCurveTo(x + inward * s * bx * 0.4, ey + s * 0.35, ex, ey);
    c.stroke();
    disc(c, ex, ey, s * 0.075, ink("gold"));
    disc(c, ex - s * 0.02, ey - s * 0.02, s * 0.03, ink("goldLight"));
  }
  lotus(c, x, y, s, ink);
};
// the arch hamper's front, every position measured as a share of the printed face in the listing photo
const paintArchFront = (c: Ctx, w: number, h: number, ink: Ink) => {
  c.fillStyle = ink("red");
  c.fillRect(0, 0, w, h);
  c.strokeStyle = ink("gold");
  c.lineWidth = w * 0.005;
  c.strokeRect(w * 0.012, h * 0.012, w * 0.976, h * 0.976);
  c.lineWidth = w * 0.0025;
  c.strokeRect(w * 0.025, h * 0.025, w * 0.95, h * 0.95);
  // the dot band at the foot, between two rules
  for (const y of [0.935, 0.965]) {
    c.beginPath();
    c.moveTo(w * 0.025, h * y);
    c.lineTo(w * 0.975, h * y);
    c.stroke();
  }
  for (let x = w * 0.045; x < w * 0.96; x += w * 0.0175) disc(c, x, h * 0.95, w * 0.0042, ink("gold"));
  // the two strands: beads, a diamond pendant, a drop, the lotus with its berry triplet, beads, a rosette, beads
  for (const sx of [0.135, 0.865]) {
    const x = w * sx;
    beads(c, x, h * 0.032, h * 0.21, w * 0.0052, ink);
    pendant(c, x, h * 0.23, w * 0.016, ink);
    beads(c, x, h * 0.252, h * 0.27, w * 0.0048, ink);
    petal(c, x, h * 0.288, w * 0.022, w * 0.012, Math.PI, ink("gold"));
    lotus(c, x, h * 0.435, w * 0.085, ink);
    for (const [dx, dy] of [[0, 0.457], [-0.008, 0.469], [0.008, 0.469]]) disc(c, x + w * dx, h * dy, w * 0.0058, ink("gold"));
    beads(c, x, h * 0.487, h * 0.635, w * 0.0048, ink);
    rosette8(c, x, h * 0.665, w * 0.026, ink);
    beads(c, x, h * 0.695, h * 0.715, w * 0.0048, ink);
    cluster(c, w * (sx < 0.5 ? 0.2 : 0.8), h * 0.835, w * 0.078, sx < 0.5 ? 1 : -1, ink);
  }
  // the little pink lotus under the window
  lotus(c, w * 0.5, h * 0.922, w * 0.038, ink, "redMid", "pink");
  archWindow(c, w, h);
  c.lineWidth = w * 0.009;
  c.strokeStyle = ink("gold");
  c.stroke();
};
const paintArchSide = (c: Ctx, w: number, h: number, ink: Ink) => {
  c.fillStyle = ink("red");
  c.fillRect(0, 0, w, h);
  c.strokeStyle = ink("gold");
  c.lineWidth = w * 0.005;
  c.strokeRect(w * 0.018, h * 0.018, w * 0.964, h * 0.964);
  c.lineWidth = w * 0.0025;
  c.strokeRect(w * 0.03, h * 0.03, w * 0.94, h * 0.94);
  beads(c, w / 2, h * 0.04, h * 0.188, w * 0.0052, ink);
  pendant(c, w / 2, h * 0.205, w * 0.016, ink);
  lotus(c, w / 2, h * 0.382, w * 0.082, ink);
  beads(c, w / 2, h * 0.43, h * 0.555, w * 0.0048, ink);
  rosette8(c, w / 2, h * 0.585, w * 0.026, ink);
  for (let x = w * 0.045; x < w * 0.96; x += w * 0.0175) disc(c, x, h * 0.87, w * 0.0042, ink("gold"));
};
// a rounded handle flap: the card's shape and its slot, for prints and for the cut
const handleShape = (c: Ctx, w: number, h: number) => {
  const r = h * 0.35;
  c.beginPath();
  c.moveTo(0, h);
  c.lineTo(0, r);
  c.quadraticCurveTo(0, 0, r, 0);
  c.lineTo(w - r, 0);
  c.quadraticCurveTo(w, 0, w, r);
  c.lineTo(w, h);
  c.closePath();
};
const handleSlot = (c: Ctx, w: number, h: number) => {
  const sw = w * 0.3, sh = h * 0.32, x = (w - sw) / 2, y = h * 0.22, r = sh / 2;
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + sw - r, y);
  c.arc(x + sw - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  c.lineTo(x + r, y + sh);
  c.arc(x + r, y + r, r, Math.PI / 2, (3 * Math.PI) / 2);
  c.closePath();
};
// the Rajwadi front: vine borders between fine orange rules, a printed arch with sprays in its spandrels, and inside it a
// spray of red flowers on each side of an orange-lily stem with white blossoms
const paintRajwadiFront = (c: Ctx, w: number, h: number, ink: Ink) => {
  c.fillStyle = ink("yellow");
  c.fillRect(0, 0, w, h);
  c.strokeStyle = ink("goldLight");
  c.lineWidth = w * 0.004;
  for (const x of [0.018, 0.162, 0.838, 0.982]) {
    c.beginPath();
    c.moveTo(w * x, h * 0.012);
    c.lineTo(w * x, h * 0.99);
    c.stroke();
  }
  vine(c, w * 0.09, h * 0.03, h * 0.975, w * 0.036, ink);
  vine(c, w * 0.91, h * 0.03, h * 0.975, w * 0.036, ink);
  // the printed arch, a fine double orange line from foot to finial
  c.strokeStyle = ink("orangeLine");
  for (const [k, lw] of [[0, 0.004], [0.014, 0.0022]] as const) {
    onionPath(c, w / 2, h * 0.995, w * (0.66 - k * 2), h * (0.9 - k * 2));
    c.lineWidth = w * lw;
    c.stroke();
  }
  // spandrel sprays: from under the bow, out and down along the arch's shoulders
  spray(c, w * 0.46, h * 0.045, h * 0.34, -0.55, ink, "orange", -2.25);
  spray(c, w * 0.54, h * 0.045, h * 0.34, 0.55, ink, "orange", 2.25);
  // inside the arch: dense red sprays, each bending in at the top like a bracket
  spray(c, w * 0.33, h * 0.985, h * 0.56, 0.2, ink, "redMid");
  spray(c, w * 0.67, h * 0.985, h * 0.56, -0.2, ink, "redMid");
  // the centre: an upright stem with three big orange lilies and clusters of white blossoms on side shoots
  const sx = w / 2;
  stem(c, [[sx, h * 0.985], [sx - w * 0.012, h * 0.82], [sx + w * 0.012, h * 0.66], [sx, h * 0.48]], w * 0.006, ink);
  for (const [dx, y] of [[-1, 0.9], [1, 0.8], [-1, 0.7], [1, 0.6]] as const) {
    leafV(c, sx, h * y, w * 0.06, w * 0.016, dx * 1.0, ink, "green", "greenLight");
    stem(c, [[sx, h * y], [sx + dx * w * 0.06, h * (y - 0.06)]], w * 0.0025, ink);
    for (const [bx, by, r] of [[0.06, 0.06, 0.011], [0.075, 0.09, 0.009], [0.045, 0.1, 0.008], [0.08, 0.04, 0.008]]) blossom(c, sx + dx * w * bx, h * (y - by), w * r, ink);
  }
  lily(c, sx, h * 0.5, w * 0.055, ink);
  lily(c, sx - w * 0.05, h * 0.74, w * 0.05, ink);
  lily(c, sx + w * 0.045, h * 0.9, w * 0.05, ink);
};
const paintRajwadiPlain = (c: Ctx, w: number, h: number, ink: Ink) => {
  c.fillStyle = ink("yellow");
  c.fillRect(0, 0, w, h);
  c.strokeStyle = ink("orangeLine");
  c.lineWidth = Math.max(1, w * 0.003);
  c.strokeRect(w * 0.035, h * 0.04, w * 0.93, h * 0.92);
};
// the diamond box's lid flap: cream card, gold-foil edges and the greeting in gold script
// blush marble, as on the diamond box: soft deeper clouds, pale highlights and thin white veins
const marble = (c: Ctx, w: number, h: number, ink: Ink) => {
  c.fillStyle = ink("blush");
  c.fillRect(0, 0, w, h);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 46; i++) {
    const x = rnd() * w, y = rnd() * h, r = (0.08 + rnd() * 0.22) * w, g = c.createRadialGradient(x, y, 0, x, y, r);
    const tone = i % 3 ? ink("blushDeep") : "rgba(255,240,236,1)";
    g.addColorStop(0, tone);
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.globalAlpha = 0.13;
    c.fillStyle = g;
    c.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  c.globalAlpha = 0.7;
  c.strokeStyle = "rgba(255,248,245,1)";
  for (let i = 0; i < 9; i++) {
    let x = rnd() * w, y = rnd() * h;
    c.lineWidth = w * (0.0015 + rnd() * 0.003);
    c.beginPath();
    c.moveTo(x, y);
    for (let k = 0; k < 12; k++) {
      x += (rnd() - 0.3) * w * 0.09;
      y += (rnd() - 0.5) * h * 0.07;
      c.lineTo(x, y);
    }
    c.stroke();
  }
  c.globalAlpha = 1;
};
const paintDiamondFlap = (c: Ctx, w: number, h: number, ink: Ink, msg: string) => {
  marble(c, w, h, ink);
  c.strokeStyle = ink("gold");
  c.lineWidth = w * 0.04;
  c.beginPath();
  c.moveTo(0, h);
  c.lineTo(w / 2, 0);
  c.lineTo(w, h);
  c.closePath();
  c.stroke();
  // the gem's facets: fine gold lines from the base corners up to points on the far edges
  c.lineWidth = w * 0.011;
  c.beginPath();
  c.moveTo(w * 0.06, h * 0.97);
  c.lineTo(w * 0.36, h * 0.86);
  c.lineTo(w * 0.72, h * 0.56);
  c.moveTo(w * 0.36, h * 0.86);
  c.lineTo(w * 0.5, h * 0.98);
  c.moveTo(w * 0.94, h * 0.97);
  c.lineTo(w * 0.8, h * 0.62);
  c.moveTo(w * 0.5, h * 0.02);
  c.lineTo(w * 0.36, h * 0.86);
  c.moveTo(w * 0.5, h * 0.02);
  c.lineTo(w * 0.8, h * 0.62);
  c.moveTo(w * 0.2, h * 0.6);
  c.lineTo(w * 0.72, h * 0.56);
  c.stroke();
  c.fillStyle = ink("goldDark");
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `italic 600 ${w * 0.075}px "Snell Roundhand", "Segoe Script", "Brush Script MT", cursive`;
  const words = msg.split(" ");
  words.forEach((wd, i) => c.fillText(wd, w * 0.46, h * (0.6 + i * 0.1), w * 0.4));
};
const paintDiamondBase = (c: Ctx, w: number, h: number, ink: Ink) => {
  marble(c, w, h, ink);
  c.fillStyle = ink("gold");
  c.fillRect(0, 0, w, h * 0.04);
  c.fillRect(0, h * 0.965, w, h * 0.035);
};
// the rigid box's lid: crimson card, one fine gold rule inset, L-shaped accents inside each corner and three small
// diamonds at every corner of the rule
const paintRigidLid = (c: Ctx, w: number, h: number, ink: Ink) => {
  c.fillStyle = ink("crimson");
  c.fillRect(0, 0, w, h);
  c.strokeStyle = c.fillStyle = ink("gold");
  const m = Math.min(w, h) * 0.075, k = m * 0.55;
  c.lineWidth = m * 0.06;
  c.strokeRect(m, m, w - 2 * m, h - 2 * m);
  c.lineWidth = m * 0.045;
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [w - m, m, -1, 1], [w - m, h - m, -1, -1], [m, h - m, 1, -1]]) {
    c.beginPath();
    c.moveTo(x + sx * k, y + sy * k + sy * w * 0.1);
    c.lineTo(x + sx * k, y + sy * k);
    c.lineTo(x + sx * k + sx * w * 0.1, y + sy * k);
    c.stroke();
    for (const [dx, dy] of [[0, 0], [sx * m * 0.38, 0], [0, sy * m * 0.38]]) {
      const px = x + dx, py = y + dy, r = m * 0.13;
      c.beginPath();
      c.moveTo(px, py - r);
      c.lineTo(px + r, py);
      c.lineTo(px, py + r);
      c.lineTo(px - r, py);
      c.closePath();
      c.fill();
    }
  }
};

type Finish = {
  base: number;
  /** the motifs: foil (shiny metal) or ink (matte print, for kraft's blind emboss) */
  ink: string;
  foil: boolean;
  bump: number;
  sheen?: boolean;
  lid: (c: Ctx, L: Lid) => void;
  lining: string;
  note: string;
  bow?: { color: number; width: number };
};
const VARIANTS: Record<"royal" | "peacock" | "kraft" | "velvet", Finish> = {
  // matte maroon card in the sweet-shop style: a gold-foil mandala, a greeting plate, and jharokha arches in the corners
  royal: {
    base: 0x5a1222, ink: "#e2b85c", foil: true, bump: 3, lining: "#7a1d2c", note: "#f3d27a",
    lid: (c, L) => {
      frame(c, L);
      const top = L.s * 0.49; // the plate's centre, under the back edge
      plaque(c, L.w, top, L.msg, L.s);
      const cy = (top + L.s * 0.2 + L.h - L.s * 0.25) / 2;
      mandala(c, L.w / 2, cy, Math.min(L.w / 2 - L.s * 0.3, cy - top - L.s * 0.17) * 0.95);
      if (L.corners)
        for (const [x, y] of [[0.53, 0.63], [-0.53, 0.63], [0.53, -0.55], [-0.53, -0.55]]) {
          const ax = x > 0 ? x * L.s : L.w + x * L.s, ay = y > 0 ? y * L.s : L.h + y * L.s;
          arch(c, ax - L.s * 0.19, ax + L.s * 0.19, ay - L.s * 0.31, ay + L.s * 0.25);
        }
    },
  },
  // peacock blue with a ring of gold-foil feather eyes around the mandala
  peacock: {
    base: 0x0b4652, ink: "#e6c46a", foil: true, bump: 3, lining: "#e7c77a", note: "#0b4652",
    lid: (c, L) => {
      frame(c, L);
      const m = Math.min(L.w, L.h), rx = L.w / 2 - L.s * 0.48, ry = L.h / 2 - L.s * 0.48;
      mandala(c, L.w / 2, L.h / 2, m * 0.22);
      for (let i = 0; i < 8; i++) {
        const a = (i * TAU) / 8;
        peacockEye(c, L.w / 2 + Math.sin(a) * rx, L.h / 2 - Math.cos(a) * ry, m * 0.085, a);
      }
    },
  },
  // kraft card blind-embossed with a jaali lattice, tied with jute twine
  kraft: { base: 0xb5865a, ink: "#9c6d43", foil: false, bump: 5, lining: "#f1e6d2", note: "#8a5a32", lid: jaali, bow: { color: 0xcdb48a, width: 0.05 } },
  // velvet with a zari paisley border and a gold satin ribbon
  velvet: {
    base: 0x3d0a1c, ink: "#dcb65e", foil: true, bump: 2, sheen: true, lining: "#e7c77a", note: "#3d0a1c", bow: { color: 0xc8962f, width: 0.3 },
    lid: (c, L) => {
      frame(c, L);
      along(L.at(-0.4), L.s * 0.36, (x, y, n) => paisley(c, x, y, L.s * 0.14, n + Math.PI / 2));
    },
  },
};

const KINDS: Sweet[] = ["laddoo", "katli", "jalebi", "gulabjamun", "milkcake", "sandesh", "barfi"];
const NAMES: Record<string, string> = { laddoo: "Laddoo", katli: "Kaju katli", jalebi: "Jalebi", gulabjamun: "Gulab jamun", milkcake: "Milk cake", sandesh: "Sandesh", barfi: "Barfi", almond: "Almond", pistachio: "Pistachio" };

// box sizes in scene units: walls H tall and T thick, the lid's skirt LH deep and clear of the walls by a hairline
const H = 0.9, T = 0.06, LH = 0.32, LIFT = H + 0.03;
// the hinge: the lid turns about the bottom back edge of its skirt (as a real hinged box does), so nothing swings into the base
const OPEN_MAX = 1.92; // the stop, about 110deg back
const PEEK = 0.1;
const G = 30, FRICTION = 2.5, HAND = 120, HAND_MAX = 30, LET_GO = 0.5; // gravity, hinge friction, the hand's spring and grip
const REST = 1; // rad/s: slower than this into a stop is resting contact, not an impact

type Sounds = { click: () => void; hit: (speed: number, pitch: number, gain: number) => void; chime: () => void; creak: (level: number) => void; close: () => void };

/** Every sound is made here, no files: noise and sine voices into a dry bus plus a generated-impulse reverb. */
function createSounds(): Sounds | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ac = new AC();
  const out = ac.createGain();
  out.gain.value = 0.6;
  out.connect(ac.destination);
  const len = Math.round(ac.sampleRate * 1.6);
  const ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  const verb = ac.createConvolver();
  verb.buffer = ir;
  const wet = ac.createGain();
  wet.gain.value = 0.25;
  verb.connect(wet).connect(out);
  const bus = ac.createGain();
  bus.connect(out);
  bus.connect(verb);
  const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const env = (gain: number, at: number, dur: number) => {
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    g.connect(bus);
    return g;
  };
  const burst = (dur: number, type: BiquadFilterType, freq: number, gain: number, at = ac.currentTime) => {
    const src = ac.createBufferSource(), f = ac.createBiquadFilter();
    src.buffer = noise;
    f.type = type;
    f.frequency.value = freq;
    src.connect(f).connect(env(gain, at, dur));
    src.start(at);
    src.stop(at + dur + 0.02);
  };
  const tone = (from: number, to: number, dur: number, gain: number, at = ac.currentTime) => {
    const o = ac.createOscillator();
    o.frequency.setValueAtTime(from, at);
    o.frequency.exponentialRampToValueAtTime(to, at + dur);
    o.connect(env(gain, at, dur));
    o.start(at);
    o.stop(at + dur + 0.02);
  };
  // the hinge creak: looping noise through a narrow band whose centre a sawtooth drags about; its level follows the lid's speed
  const cs = ac.createBufferSource(), cf = ac.createBiquadFilter(), cg = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
  cs.buffer = noise;
  cs.loop = true;
  cf.type = "bandpass";
  cf.frequency.value = 900;
  cf.Q.value = 18;
  lfo.type = "sawtooth";
  lfo.frequency.value = 7;
  lg.gain.value = 250;
  lfo.connect(lg).connect(cf.frequency);
  cg.gain.value = 0;
  cs.connect(cf).connect(cg).connect(bus);
  cs.start();
  lfo.start();
  return {
    click: () => burst(0.03, "highpass", 2500, 0.3),
    hit: (speed, pitch, gain) => {
      const v = Math.min(1, speed / 8) * gain;
      if (v < 0.04) return;
      tone(pitch * 2, pitch, 0.25, 0.9 * v);
      burst(0.12, "lowpass", 600, 0.7 * v);
    },
    chime: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, f * 0.999, 1.4, 0.1, ac.currentTime + i * 0.09)),
    creak: (level) => {
      cg.gain.setTargetAtTime(Math.min(0.1, level * 0.012), ac.currentTime, 0.04);
      lfo.frequency.setTargetAtTime(5 + level, ac.currentTime, 0.1);
    },
    close: () => void ac.close(),
  };
}

/**
 * A 3D sweet box for Diwali, drawn with three.js: a gold, kraft or velvet box tied with a satin ribbon. The lid is a real
 * hinge with weight: hover lifts it a touch, a click (or Enter / Space) raises it past upright and lets it fall onto its stop
 * with a small bounce, and closing lowers it until it drops shut with a thud that jolts the box. As it opens a warm light
 * comes up, a chime rings, the sweets hop in turn and gold dust bursts out; the hinge creaks with its speed. Sounds are
 * synthesized with Web Audio (with a reverb tail) and start on the first click. Every shape is built in code (no model
 * files). three loads only once the box mounts, the canvas draws only while something moves and while on screen, and
 * everything is freed on unmount. No WebGL: the message shows as text. Reduced motion: the lid glides open and shut on a
 * stiff spring, with no bounce, jolt, float, tilt, hop or dust.
 */
// an outgoing canvas keeps its last frame on screen while it fades; its WebGL context is let go only once it is removed
const releases = new WeakMap<HTMLCanvasElement, () => void>();
const drop = (c: HTMLCanvasElement) => {
  c.remove();
  releases.get(c)?.();
  releases.delete(c);
};

export function MithaiBox({ open, defaultOpen = false, onOpenChange, variant = "royal", shape = "square", format = "classic", sweets, message = "Shubh Deepavali", paused = false, sound = true, hint = "Open the box", className, onClick, ...rest }: MithaiBoxProps) {
  const root = useRef<HTMLButtonElement>(null);
  const [inner, setInner] = useState(defaultOpen);
  const [failed, setFailed] = useState(false);
  const [closes, setCloses] = useState(0); // each close replays the hint's write-in
  // the sweet picked with a click or tap: its name is written in like the hint (n replays the write-in on every pick)
  const [picked, setPicked] = useState<{ name: string; n: number; on: boolean } | null>(null);
  const tapped = useRef(false); // a click the box spent on a sweet, so it does not also open or shut
  const [wasOpen, setWasOpen] = useState(defaultOpen || !!open);
  // a new box arrives shut, so it can still be opened
  const build = `${format}|${variant}|${shape}|${sweets?.slice(0, 9).join(",") ?? ""}`;
  const [built, setBuilt] = useState(build);
  if (build !== built) {
    setBuilt(build);
    setInner(false);
  }
  const isOpen = open ?? inner;
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setCloses((n) => n + 1);
  }
  const live = useRef({ open: isOpen, paused, sound });
  const kick = useRef(() => {});
  const audio = useRef<Sounds | null>(null);
  // the float and the lean, handed from one scene to the next so a switched box picks up where the last one was
  const carry = useRef({ floatT: 0, x: 0, y: 0, tx: 0, ty: 0 });
  useEffect(() => {
    live.current = { open: isOpen, paused, sound };
    kick.current();
  }, [isOpen, paused, sound]);
  useEffect(() => () => audio.current?.close(), []);

  const sweetsKey = sweets ? sweets.slice(0, 9).join(",") : "";
  useEffect(() => {
    const box = root.current;
    if (!box) return;
    let dead = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const { RoundedBoxGeometry } = await import("three/examples/jsm/geometries/RoundedBoxGeometry.js");
      if (dead) return;
      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        box.querySelectorAll<HTMLCanvasElement>("canvas[data-stale]").forEach(drop);
        setFailed(true);
        return;
      }
      setFailed(false);
      const v = VARIANTS[variant];
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      const canvas = renderer.domElement;
      canvas.className = "absolute inset-0 size-full";
      box.prepend(canvas); // under the outgoing canvas, which fades off it
      // until the scene is built: if building throws, this is what the catch below tears down
      cleanup = () => {
        renderer.dispose();
        canvas.remove();
      };

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      scene.environmentIntensity = 0.45;
      scene.add(new THREE.HemisphereLight(0xfff4e0, 0x3a2a20, 0.35));
      const sun = new THREE.DirectionalLight(0xfff1dc, 1.8);
      sun.position.set(3, 6, 4);
      scene.add(sun);
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);

      const textures: Three.Texture[] = [env];
      const sheet = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        draw(c.getContext("2d")!);
        return c;
      };
      const toTex = (c: HTMLCanvasElement, color = true, wrap = false) => {
        const t = new THREE.CanvasTexture(c);
        if (color) t.colorSpace = THREE.SRGBColorSpace;
        if (wrap) t.wrapS = THREE.RepeatWrapping; // wall art tiles round the ring a whole number of times
        t.anisotropy = renderer.capabilities.getMaxAnisotropy(); // the lid is seen at a slant: keep the fine lines sharp
        textures.push(t);
        return t;
      };
      const canvasTex = (size: number, draw: (c: CanvasRenderingContext2D) => void) => toTex(sheet(size, size, draw));

      // a soft blob shadow on the floor: it stays put while the box floats
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(5.2, 5.2),
        new THREE.MeshBasicMaterial({
          transparent: true,
          depthWrite: false,
          map: canvasTex(256, (c) => {
            const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
            g.addColorStop(0, "rgba(0,0,0,0.45)");
            g.addColorStop(0.55, "rgba(0,0,0,0.2)");
            g.addColorStop(1, "rgba(0,0,0,0)");
            c.fillStyle = g;
            c.fillRect(0, 0, 256, 256);
          }),
        }),
      );
      shadow.rotation.x = -Math.PI / 2;
      scene.add(shadow);

      const group = new THREE.Group();
      scene.add(group);
      // the finish: the motifs are drawn once as a white mask, then become the colour (base + foil or ink), the
      // roughness/metalness map (foil: smooth metal; card: matte) and a softened bump map, so they shine and stand up
      const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
      const sheen = v.sheen ? { sheen: 1, sheenColor: 0x8a2a48, sheenRoughness: 0.5 } : {}; // velvet: a soft rim of its own colour
      const surface = (w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, wrap = false) => {
        const mask = sheet(w, h, (c) => {
          c.fillStyle = c.strokeStyle = "#fff";
          draw(c, w, h);
        });
        const tinted = (fill: string) => sheet(w, h, (c) => {
          c.drawImage(mask, 0, 0);
          c.globalCompositeOperation = "source-in";
          c.fillStyle = fill;
          c.fillRect(0, 0, w, h);
        });
        const layer = (bg: string, fill: string, blur = 0) => sheet(w, h, (c) => {
          c.fillStyle = bg;
          c.fillRect(0, 0, w, h);
          if (blur) c.filter = `blur(${blur}px)`;
          c.drawImage(tinted(fill), 0, 0);
        });
        // green = roughness, blue = metalness (three's channels)
        const orm = toTex(layer(`rgb(0,${v.sheen ? 200 : 215},0)`, v.foil ? "rgb(0,70,255)" : "rgb(0,235,0)"), false, wrap);
        return new THREE.MeshPhysicalMaterial({ map: toTex(layer(hex(v.base), v.ink), true, wrap), roughnessMap: orm, metalnessMap: orm, bumpMap: toTex(layer("#000", "#fff", Math.max(1, w / 600)), false, wrap), bumpScale: v.bump, roughness: 1, metalness: 1, ...sheen });
      };
      const outside = new THREE.MeshPhysicalMaterial({ color: v.base, roughness: v.sheen ? 0.8 : 0.85, ...sheen });
      // the plan: the base, its inside face, the lid (offset by the wall and the hairline), and the lid's bounds
      const base = outlineOf(shape), inner = outlineOf(shape, -T), lidLine = outlineOf(shape, T + 0.01), lb = boundsOf(lidLine);
      const lw = lb.x1 - lb.x0, ld = lb.z1 - lb.z0, reach = Math.max(lw, ld) / 3.14; // the camera's distance and the shadow, 1 for the square
      const A0 = Math.atan2(0.2, ld / 2); // the lid's centre of mass above the hinge line
      const UPRIGHT = Math.PI / 2 - A0; // past this, gravity pulls the lid open onto its stop
      const LS = 1024 / lw, LCH = Math.round(ld * LS); // the lid's canvas: px per unit, height
      const lidAt = (flip: boolean) => (g: number) => outlineOf(shape, T + 0.01 + g).map(([x, z]) => [(x - lb.x0) * LS, (flip ? lb.z1 - z : z - lb.z0) * LS] as Pt);
      const top = surface(1024, LCH, (c) => v.lid(c, { w: 1024, h: LCH, s: LS, at: lidAt(false), msg: message, corners: shape === "square" || shape === "long" }));
      const wall = surface(1024, 300, arches, true);
      const skirt = surface(1024, 104, toran, true);
      const lining = new THREE.MeshStandardMaterial({ color: v.lining, roughness: 0.85 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xd6aa4c, metalness: 0.85, roughness: 0.3 }); // tray, trim and findings
      // a thin rod from a to b: the cords of the tassel and the tag
      const cord = (parent: Three.Object3D, a: Three.Vector3, b: Three.Vector3, radius: number, mat: Three.Material) => {
        const d = b.clone().sub(a);
        const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, d.length(), 6), mat);
        m.position.copy(a).addScaledVector(d, 0.5);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
        parent.add(m);
      };
      const ribbon = new THREE.MeshPhysicalMaterial({ color: v.bow?.color ?? 0, roughness: v.bow && v.bow.width < 0.1 ? 0.95 : 0.35, metalness: v.bow && v.bow.width < 0.1 ? 0 : 0.4, sheen: 0.6, sheenColor: v.bow?.color ?? 0, sheenRoughness: 0.35 });
      const perimeter = (o: Pt[]) => o.reduce((a, p, i) => a + Math.hypot(o[(i + 1) % o.length][0] - p[0], o[(i + 1) % o.length][1] - p[1]), 0);
      // a wall that follows an outline from y0 up h: its outer face (material 0, the art wrapping round a whole number of
      // tiles), its inner face (1) and a rim (2) on top or underneath. Round outlines shade smooth, polygons by facet.
      const ring = (outer: Pt[], inside: Pt[] | null, y0: number, h: number, tile: number, mats: Three.Material[], rimBelow = false) => {
        const P: number[] = [], N: number[] = [], U: number[] = [], geo = new THREE.BufferGeometry(), smooth = outer.length > 16;
        const tri = (a: number[], b: number[], c: number[], n: number[][], uv: number[][], want: number[]) => {
          const g = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
          const ok = g[0] * want[0] + g[1] * want[1] + g[2] * want[2] > 0, order = ok ? [0, 1, 2] : [0, 2, 1], vs = [a, b, c];
          for (const i of order) {
            P.push(...vs[i]);
            N.push(...n[i]);
            U.push(...uv[i]);
          }
        };
        const band = (line: Pt[], out: number, group: number) => {
          const start = P.length / 3, len = perimeter(line), reps = Math.max(1, Math.round(len / tile));
          let u = 0;
          line.forEach(([x0, z0], i) => {
            const [x1, z1] = line[(i + 1) % line.length], l = Math.hypot(x1 - x0, z1 - z0), u1 = u + (l / len) * reps;
            let en = [(z1 - z0) / l, 0, -(x1 - x0) / l];
            if (en[0] * (x0 + x1) + en[2] * (z0 + z1) < 0) en = en.map((e) => -e);
            const nAt = (x: number, z: number) => (smooth ? [x / Math.hypot(x, z), 0, z / Math.hypot(x, z)] : en).map((e) => e * out);
            const A = [x0, y0, z0], B = [x1, y0, z1], C = [x1, y0 + h, z1], Dd = [x0, y0 + h, z0], want = en.map((e) => e * out);
            const na = nAt(x0, z0), nb = nAt(x1, z1);
            tri(A, B, C, [na, nb, nb], [[u, 0], [u1, 0], [u1, 1]], want);
            tri(A, C, Dd, [na, nb, na], [[u, 0], [u1, 1], [u, 1]], want);
            u = u1;
          });
          geo.addGroup(start, P.length / 3 - start, group);
        };
        band(outer, 1, 0);
        if (inside) {
          band(inside, -1, 1);
          const start = P.length / 3, y = rimBelow ? y0 : y0 + h, up = [0, rimBelow ? -1 : 1, 0];
          outer.forEach(([x0, z0], i) => {
            const [x1, z1] = outer[(i + 1) % outer.length], [a0, c0] = inside[i], [a1, c1] = inside[(i + 1) % inside.length];
            tri([x0, y, z0], [x1, y, z1], [a1, y, c1], [up, up, up], [[0, 0], [0, 0], [0, 0]], up);
            tri([x0, y, z0], [a1, y, c1], [a0, y, c0], [up, up, up], [[0, 0], [0, 0], [0, 0]], up);
          });
          geo.addGroup(start, P.length / 3 - start, 2);
        }
        geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
        geo.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
        geo.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
        return new THREE.Mesh(geo, mats);
      };
      // a flat face filling an outline at height y, facing up or down, its texture spread over the outline's bounds; the
      // top's canvas top is the back edge, the underside's the front edge, so the note reads upright with the lid open
      const cap = (line: Pt[], y: number, up: boolean, mat: Three.Material) => {
        const b = boundsOf(line), g = new THREE.ShapeGeometry(new THREE.Shape(line.map(([x, z]) => new THREE.Vector2(x, up ? -z : z))));
        g.rotateX(up ? -Math.PI / 2 : Math.PI / 2);
        g.translate(0, y, 0);
        const p = g.attributes.position, uv = g.attributes.uv;
        for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - b.x0) / (b.x1 - b.x0), up ? (b.z1 - p.getZ(i)) / (b.z1 - b.z0) : (p.getZ(i) - b.z0) / (b.z1 - b.z0));
        return new THREE.Mesh(g, mat);
      };
      // the inside: a warm light that comes up as the lid opens, and nine paper cups
      const glow = new THREE.PointLight(0xffc68a, 0, 5, 2); // warm, but not so orange it stains the sweets
      glow.position.set(0, H * 1.5, 0); // high enough that the centre cup is not burnt out
      group.add(glow);
      const cupGeo = new THREE.CylinderGeometry(0.42, 0.34, 0.24, 72, 1, true);
      const cp = cupGeo.attributes.position;
      for (let i = 0; i < cp.count; i++) {
        const a = Math.atan2(cp.getZ(i), cp.getX(i)), k = 1 + 0.035 * Math.sin(a * 24); // the crimped paper
        cp.setXYZ(i, cp.getX(i) * k, cp.getY(i), cp.getZ(i) * k);
      }
      cupGeo.computeVertexNormals();
      const cupBottom = new THREE.CircleGeometry(0.34, 40);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xd8b25a, metalness: 0.6, roughness: 0.45, side: THREE.DoubleSide });

      const rhombus = new THREE.Shape([new THREE.Vector2(0, 0.38), new THREE.Vector2(0.18, 0), new THREE.Vector2(0, -0.38), new THREE.Vector2(-0.18, 0)]);
      const katliGeo = new THREE.ExtrudeGeometry(rhombus, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 });
      katliGeo.rotateX(-Math.PI / 2);
      // the sweets, each modelled on the real thing: a grain hash for crumb and sugar, vertex colour for browning
      const grain = (x: number, y: number, z: number) => {
        const v = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
        return v - Math.floor(v);
      };
      const paint = (g: Three.BufferGeometry, tone: (x: number, y: number, z: number) => [number, number, number]) => {
        const p = g.attributes.position, c: number[] = [];
        for (let i = 0; i < p.count; i++) c.push(...tone(p.getX(i), p.getY(i), p.getZ(i)));
        g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
        return g;
      };
      // vertex colours are linear: THREE.Color converts the sRGB hex
      const mix = (a: number, b: number, t: number) => {
        const c = new THREE.Color(a).lerp(new THREE.Color(b), Math.min(1, Math.max(0, t)));
        return [c.r, c.g, c.b] as [number, number, number];
      };
      const rough = (g: Three.BufferGeometry, amp: number) => {
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = (grain(x, y, z) - 0.5) * amp;
          p.setXYZ(i, x * (1 + n), y * (1 + n), z * (1 + n));
        }
        g.computeVertexNormals();
        return g;
      };
      // motichoor laddoo: a ball pressed from tiny fried boondi beads; the beads are a texture, the lumps are geometry
      const laddooGeo = rough(new THREE.SphereGeometry(0.27, 64, 48), 0.035);
      laddooGeo.scale(1, 0.94, 1);
      const boondi = canvasTex(256, (c) => {
        c.fillStyle = "#b8460a";
        c.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1400; i++) {
          const x = grain(i, 2, 3) * 256, y = grain(i, 4, 5) * 256, r = 4 + grain(i, 6, 7) * 3;
          const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
          g.addColorStop(0, "#ffb048");
          g.addColorStop(0.6, "#f07a14");
          g.addColorStop(1, "#c4520c");
          c.fillStyle = g;
          c.beginPath();
          c.arc(x, y, r, 0, TAU);
          c.fill();
        }
      });
      boondi.wrapS = boondi.wrapT = THREE.RepeatWrapping;
      boondi.repeat.set(5, 2.5);
      // silver vark: beaten foil laid in torn, crinkled patches over the cashew fudge, which shows through the gaps
      const varkTex = canvasTex(256, (c) => {
        c.fillStyle = "#cfc6ae";
        c.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 70; i++) {
          const x = grain(i, 11, 1) * 256, y = grain(i, 12, 2) * 256, r = 14 + grain(i, 13, 3) * 26;
          c.fillStyle = `rgb(${226 + grain(i, 14, 4) * 26 | 0},${226 + grain(i, 14, 4) * 26 | 0},${222 + grain(i, 14, 4) * 26 | 0})`;
          c.beginPath();
          for (let k = 0; k < 7; k++) {
            const a = (k / 7) * TAU, rr = r * (0.6 + grain(i, k, 5) * 0.6);
            c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
          }
          c.fill();
        }
        c.strokeStyle = "rgba(120,116,104,0.35)";
        for (let i = 0; i < 160; i++) {
          c.lineWidth = 0.5 + grain(i, 15, 6);
          c.beginPath();
          const x = grain(i, 16, 7) * 256, y = grain(i, 17, 8) * 256;
          c.moveTo(x, y);
          c.lineTo(x + (grain(i, 18, 9) - 0.5) * 30, y + (grain(i, 19, 1) - 0.5) * 30);
          c.stroke();
        }
      });
      varkTex.wrapS = varkTex.wrapT = THREE.RepeatWrapping;
      varkTex.repeat.set(2, 2);
      // jalebi: a fried batter coil of uneven loops, ridged from the piping cloth, crisp orange under a syrup gloss
      const coil = Array.from({ length: 120 }, (_, i) => {
        const t = i / 119, a = t * 1.6 * TAU, r = 0.07 + 0.25 * t + 0.02 * Math.sin(t * 17);
        return new THREE.Vector3(r * Math.cos(a) + 0.02 * Math.sin(t * 9), 0.03 * Math.sin(a * 1.7) + 0.04 * t, r * Math.sin(a) * 0.9);
      });
      const jalebiGeo = rough(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 300, 0.055, 10), 0.015);
      // the fried batter's crust: orange, mottled darker, crusted with sugar crystals (a texture, so they stay specks)
      const sugar = canvasTex(256, (c) => {
        c.fillStyle = "#f07d1c";
        c.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 900; i++) {
          const x = grain(i, 1, 2) * 256, y = grain(i, 3, 4) * 256, r = 1.5 + grain(i, 5, 6) * 4;
          c.fillStyle = i % 3 ? `rgba(200,84,16,${0.15 + grain(i, 7, 8) * 0.3})` : `rgba(255,232,180,${0.6 + grain(i, 9, 1) * 0.4})`;
          c.fillRect(x, y, r, r);
        }
      });
      sugar.wrapS = sugar.wrapT = THREE.RepeatWrapping;
      sugar.repeat.set(14, 1);
      // gulab jamun: a soft ball fried deep brown, darker where it sat in the pan, wet with syrup
      const jamunGeo = paint(rough(new THREE.IcosahedronGeometry(0.22, 6), 0.04), (x, y, z) => mix(0xa65a16, 0x5e2606, Math.max(0, -y / 0.22) * 0.7 + grain(x, y, z) * 0.2));
      // an icosphere has no poles to pinch; its faces are unshared, so smooth it with normals straight out from the centre
      const jn = jamunGeo.attributes.normal, jp = jamunGeo.attributes.position, nv = new THREE.Vector3();
      for (let i = 0; i < jn.count; i++) jn.setXYZ(i, ...nv.fromBufferAttribute(jp, i).normalize().toArray());
      jamunGeo.scale(1.04, 0.9, 0.98); // hand-rolled, never quite round
      // the fried crust's fine pits, under the syrup
      const pits = canvasTex(256, (c) => {
        c.fillStyle = "#808080";
        c.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1800; i++) {
          c.fillStyle = i % 2 ? "rgba(40,40,40,0.35)" : "rgba(220,220,220,0.25)";
          c.beginPath();
          c.arc(grain(i, 8, 1) * 256, grain(i, 9, 2) * 256, 1 + grain(i, 7, 3) * 2.2, 0, TAU);
          c.fill();
        }
      });
      pits.wrapS = pits.wrapT = THREE.RepeatWrapping;
      pits.repeat.set(5, 5);
      // milk cake: a crumbly block, caramel brown at its heart grading to pale cream at its top and bottom
      const cakeGeo = paint(rough(new THREE.BoxGeometry(0.44, 0.22, 0.36, 20, 10, 16), 0.02), (x, y, z) => {
        const core = Math.max(0, 1 - Math.abs(y + 0.01) / 0.13) * (1 - Math.max(Math.abs(x) / 0.22, Math.abs(z) / 0.18) * 0.3);
        return mix(0xc4955a, 0x6a3410, core * 0.95 + (grain(x, y, z) - 0.5) * 0.4);
      });
      // sandesh: fresh chhena rolled into a ball, its surface granular; pistachio crumbs and saffron strands on top
      const shellGeo = rough(new THREE.SphereGeometry(0.2, 48, 36), 0.03);
      shellGeo.scale(1, 0.92, 1);
      const chhenaTex = canvasTex(256, (c) => {
        c.fillStyle = "#f4efe2";
        c.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 2600; i++) {
          c.fillStyle = i % 2 ? `rgba(255,255,255,${0.5 + grain(i, 1, 1) * 0.5})` : `rgba(196,182,150,${0.2 + grain(i, 2, 2) * 0.3})`;
          c.fillRect(grain(i, 3, 3) * 256, grain(i, 4, 4) * 256, 1.5 + grain(i, 5, 5) * 2.5, 1.5 + grain(i, 6, 6) * 2.5);
        }
      });
      chhenaTex.wrapS = chhenaTex.wrapT = THREE.RepeatWrapping;
      chhenaTex.repeat.set(5, 2.5);
      const barfiGeo = new RoundedBoxGeometry(0.46, 0.17, 0.46, 2, 0.012);
      // khoa barfi: milk solids cooked down to a crumbly fudge, cream-yellow and grainy
      const khoa = canvasTex(256, (c) => {
        c.fillStyle = "#ead39c";
        c.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 2200; i++) {
          c.fillStyle = i % 2 ? `rgba(255,246,214,${0.4 + grain(i, 21, 1) * 0.5})` : `rgba(176,140,80,${0.15 + grain(i, 22, 2) * 0.3})`;
          c.fillRect(grain(i, 23, 3) * 256, grain(i, 24, 4) * 256, 1.5 + grain(i, 25, 5) * 3, 1.5 + grain(i, 26, 6) * 3);
        }
      });
      const sweetMat = (o: Three.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial({ vertexColors: true, ...o });
      const one = (geo: Three.BufferGeometry, mat: Three.Material | Three.Material[], y: number) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.y = y;
        return m;
      };
      const mats = {
        laddoo: new THREE.MeshStandardMaterial({ color: 0xffa060, map: boondi, bumpMap: boondi, bumpScale: 2, roughness: 0.85 }),
        almond: new THREE.MeshStandardMaterial({ color: 0xe8d6b4, roughness: 0.6 }),
        vark: new THREE.MeshStandardMaterial({ color: 0xc4c8d0, map: varkTex, bumpMap: varkTex, bumpScale: 1, metalness: 0.6, roughness: 0.4 }),
        cashew: new THREE.MeshStandardMaterial({ color: 0xd9cdb0, roughness: 0.85 }),
        jalebi: new THREE.MeshPhysicalMaterial({ color: 0xffb04a, map: sugar, bumpMap: sugar, bumpScale: 1.5, roughness: 0.7, clearcoat: 0.35, clearcoatRoughness: 0.5 }),
        jamun: sweetMat({ bumpMap: pits, bumpScale: 2.2, roughness: 0.6, clearcoat: 0.8, clearcoatRoughness: 0.45 }),
        syrup: new THREE.MeshPhysicalMaterial({ color: 0xc9781e, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.7 }),
        cake: sweetMat({ bumpMap: khoa, bumpScale: 3, roughness: 0.95 }),
        chhena: new THREE.MeshStandardMaterial({ map: chhenaTex, bumpMap: chhenaTex, bumpScale: 2.5, roughness: 0.95 }),
        pista: new THREE.MeshStandardMaterial({ color: 0x86b04a, roughness: 0.7 }),
        saffron: new THREE.MeshStandardMaterial({ color: 0xc4280c, roughness: 0.6 }),
        barfi: new THREE.MeshStandardMaterial({ map: khoa, bumpMap: khoa, bumpScale: 2, roughness: 0.92 }),
      };
      // slivers pressed onto a top: almond on laddoo, pistachio on barfi and sandesh, saffron strands
      const flakes = (g: Three.Group, mat: Three.Material, n: number, y: number, spread: number, size: [number, number, number]) => {
        for (let i = 0; i < n; i++) {
          const f = one(new THREE.BoxGeometry(...size), mat, y + 0.004 * (i % 2));
          f.position.x = spread * Math.cos(i * 2.4) * ((i % 3) + 1) / 3;
          f.position.z = spread * Math.sin(i * 2.4) * ((i % 3) + 1) / 3;
          f.rotation.set(0.2 * Math.sin(i), i * 1.9, 0.25 * Math.cos(i));
          g.add(f);
        }
        return g;
      };
      // the room's reflections tint everything warm; on the sweets keep them low so their own colour reads
      Object.values(mats).forEach((m) => (m.envMapIntensity = 0.6));
      const SWEET: Record<Sweet, () => Three.Object3D> = {
        laddoo: () => flakes(new THREE.Group().add(one(laddooGeo, mats.laddoo, 0.27)), mats.almond, 2, 0.53, 0.07, [0.07, 0.012, 0.022]),
        // ExtrudeGeometry groups: 0 the faces (silver vark on top), 1 the sides
        katli: () => {
          // two diamonds stacked a little askew, as a shop packs them
          const g = new THREE.Group(), top = one(katliGeo, [mats.vark, mats.cashew], 0.085);
          top.rotation.y = 0.5;
          return g.add(one(katliGeo, [mats.vark, mats.cashew], 0.01), top);
        },
        jalebi: () => one(jalebiGeo, mats.jalebi, 0.06),
        gulabjamun: () => {
          const g = new THREE.Group(), pool = one(new THREE.CircleGeometry(0.3, 40), mats.syrup, 0.012);
          pool.rotation.x = -Math.PI / 2;
          g.add(pool, one(jamunGeo, mats.jamun, 0.19));
          return g;
        },
        milkcake: () => one(cakeGeo, mats.cake, 0.12),
        sandesh: () => {
          const g = new THREE.Group().add(one(shellGeo, mats.chhena, 0.18));
          flakes(g, mats.pista, 6, 0.36, 0.03, [0.04, 0.026, 0.034]);
          return flakes(g, mats.saffron, 3, 0.37, 0.035, [0.09, 0.006, 0.006]);
        },
        barfi: () => flakes(new THREE.Group().add(one(barfiGeo, mats.barfi, 0.1)), mats.pista, 9, 0.188, 0.15, [0.03, 0.014, 0.024]),
      };
      // no sweets given: every kind once, the rest at random, shuffled, so each box holds a fresh mix
      const mixed = [...KINDS, ...Array.from({ length: 5 }, () => KINDS[(Math.random() * 7) | 0])]; // 12: enough for the biggest box
      for (let i = mixed.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
      }
      const fill = sweets ?? mixed;
      const treats: Three.Object3D[] = [];
      // a cell per cup: the crimped paper cup, and the sweet in it on its own group, so the hop moves it and not its pose
      const addCups = (parent: Three.Object3D, at: Pt[], y: number, k = 1) =>
        at.forEach(([cx, cz], i) => {
          const cell = new THREE.Group();
          cell.position.set(cx, y, cz);
          cell.scale.setScalar(k);
          const cup = new THREE.Mesh(cupGeo, cupMat);
          cup.position.y = 0.12;
          const bottom = new THREE.Mesh(cupBottom, cupMat);
          bottom.rotation.x = -Math.PI / 2;
          bottom.position.y = 0.002;
          cell.add(cup, bottom);
          const kind = fill[i];
          if (kind && SWEET[kind]) {
            const m = SWEET[kind]();
            m.rotation.y = i * 1.3;
            const hop = new THREE.Group();
            hop.add(m);
            cell.add(hop);
            hop.userData.kind = kind;
            treats.push(hop);
          }
          parent.add(cell);
        });
      // what the frame loop drives: the opening's pose, how far it opens, where the reveal fires, the camera's framing
      let pose = (t: number) => void t;
      let ribbonPose: ((u: number) => void) | null = null; // set by a box tied with a ribbon; the loop runs its own clock
      // a satin bow in a frame whose +y is the surface it sits on, made of flat ribbon like the real thing: two wide loops
      // standing up from the knot, two tails lying out over the surface, and a knot. Its geometry is live: pull(u) unties it
      // the way hands do, one tail drawn out so its loop slides back through the knot, then the other, then the knot gives.
      const stripInto = (g: Three.BufferGeometry, pts: Three.Vector3[], side: (i: number) => Three.Vector3, w: number) => {
        const P: number[] = [], idx: number[] = [];
        pts.forEach((p, i) => {
          const o = side(i).multiplyScalar(w / 2);
          P.push(p.x - o.x, p.y - o.y, p.z - o.z, p.x + o.x, p.y + o.y, p.z + o.z);
          if (i) idx.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i);
        });
        const at = g.getAttribute("position") as Three.BufferAttribute | undefined;
        if (at && at.count === P.length / 3) {
          (at.array as Float32Array).set(P);
          at.needsUpdate = true;
        } else {
          g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
          g.setIndex(idx);
        }
        g.computeVertexNormals();
        g.computeBoundingSphere();
        return g;
      };
      const ease = (a: number, b: number, x: number) => {
        const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
      };
      // `faceOn`: a bow on an upright face (its +z the face's normal): the loops lie along the face, the tails hang down
      const bowOn = (parent: Three.Object3D, k: number, mat: Three.Material, faceOn = false, width = 0.24 * k) => {
        const b = new THREE.Group(), w = width, V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
        (mat as Three.MeshPhysicalMaterial).side = THREE.DoubleSide;
        const sides = [-1, 1].map((sg) => {
          const loopGeo = new THREE.BufferGeometry(), tailGeo = new THREE.BufferGeometry();
          const loop = faceOn ? new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), mat) : new THREE.Mesh(loopGeo, mat);
          const tail = new THREE.Mesh(tailGeo, mat);
          b.add(loop, tail);
          // r: how much of the loop is still out of the knot (1 whole, 0 pulled through); grow: the extra length that went
          // into the tail; lift: the pulled tail rising in the hand; part: the tails spreading once the knot gives
          const set = (r: number, grow: number, lift: number, part: number) => {
            loop.visible = r > 0.02;
            if (faceOn) {
              loop.scale.set(0.3 * k * r, 0.16 * k * (0.4 + 0.6 * r), 0.07 * k);
              loop.position.set(sg * 0.3 * k * r, 0.15 * k, 0.05 * k);
              loop.rotation.z = sg * 0.22 * r;
              const len = 1 + grow;
              stripInto(tailGeo, [V(sg * 0.04 * k, 0.05 * k, 0.04), V(sg * (0.16 + part) * k, -0.25 * k * len + lift * 0.3 * k, 0.05 + lift * 0.1), V(sg * (0.3 + part * 1.6) * k, -0.6 * k * len + lift * 0.9 * k, 0.03 + lift * 0.3)], () => V(1, sg * 0.4, 0).normalize(), w * 0.9);
            } else {
              // a teardrop from the knot out and back, its width across the bow, twisted a little toward the tip; pulled,
              // it shortens along its own path toward the knot
              if (loop.visible)
                stripInto(loopGeo, Array.from({ length: 41 }, (_, i) => {
                  const a = Math.PI + (i / 40) * TAU;
                  return V(sg * (0.25 * k + Math.cos(a) * 0.25 * k) * r, 0.1 * k + (0.05 * k + Math.sin(a) * 0.19 * k * (1 + 0.25 * Math.cos(a))) * (0.35 + 0.65 * r), 0);
                }), (i) => V(0, -0.15 * sg * Math.sin((i / 40) * Math.PI), 1).normalize(), w);
              const len = 1 + grow;
              stripInto(tailGeo, [V(sg * 0.03 * k, 0.03 + lift * 0.1 * k, 0.02 * k), V(sg * (0.18 + part) * k, 0.02 + lift * 0.45 * k, 0.3 * k * len), V(sg * (0.3 + part * 1.8) * k, 0.012 + lift * 0.8 * k, 0.62 * k * len)], () => V(1, 0, -sg * 0.45).normalize(), w * 0.9);
            }
          };
          set(1, 0, 0, 0);
          return set;
        });
        const knot = new THREE.Mesh(new THREE.SphereGeometry(0.09 * k, 20, 12), mat);
        knot.position.y = 0.1 * k;
        knot.scale.set(1.15, 0.85, 1);
        b.add(knot);
        parent.add(b);
        // u 0..1: the left tail is drawn up and out and its loop slides through, then the right; the knot slackens and
        // flattens, and the loose ends part
        b.userData.pull = (u: number) => {
          const a = ease(0, 0.4, u), c = ease(0.25, 0.65, u), g = ease(0.5, 0.8, u);
          sides[0](1 - a, a * 0.9, a * (1 - c * 0.6), g * 0.25);
          sides[1](1 - c, c * 0.9, c * (1 - g * 0.6), g * 0.25);
          knot.scale.set(1.15 + g * 0.5, 0.85 * (1 - g * 0.75), 1 + g * 0.3);
          knot.position.y = 0.1 * k * (1 - g * 0.7);
        };
        return b;
      };
      const satin = (color: number) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.35, sheen: 0.7, sheenColor: color, sheenRoughness: 0.3, transparent: true });
      // a ribbon coming undone over u = 0..1: the bow unties itself (its pull), then the bands go slack, lift off the box
      // with a little sag, slip off past its edges and fade. All a function of u, so closing the box ties it again.
      const untie = (bow: Three.Object3D, bands: Three.Mesh[], mat: Three.Material) => {
        const pull = (bow.userData.pull ?? bow.children.find((c) => c.userData.pull)?.userData.pull) as ((u: number) => void) | undefined;
        const rest = bands.map((b) => b.position.clone()), at = bow.position.clone();
        // each band lifts along its thinnest axis (away from the box) and slips along its longest (off the edge)
        const axes = bands.map((b) => {
          const { width, height, depth } = (b.geometry as Three.BoxGeometry).parameters, d = [width, height, depth];
          const thin = d.indexOf(Math.min(...d)), long = d.indexOf(Math.max(...d)), out = new THREE.Vector3(), slip = new THREE.Vector3();
          out.setComponent(thin, Math.sign(b.position.getComponent(thin)) || 1);
          slip.setComponent(long, long === 1 ? -1 : Math.sign(b.position.getComponent(long)) || (thin === 1 ? 1 : -1));
          return { out, slip, len: d[long] };
        });
        mat.transparent = true;
        return (u: number) => {
          pull?.(Math.min(1, u / 0.75));
          const slack = ease(0.55, 0.85, u), off = ease(0.7, 1, u);
          bow.position.set(at.x, at.y + off * 0.12, at.z);
          bands.forEach((m, i) => {
            const { out, slip, len } = axes[i];
            m.position.copy(rest[i]).addScaledVector(out, slack * 0.05 + Math.sin(slack * Math.PI) * 0.03).addScaledVector(slip, off * len * 0.35);
          });
          mat.opacity = 1 - ease(0.7, 0.95, u);
          const on = mat.opacity > 0.01;
          bow.visible = on;
          bands.forEach((m) => (m.visible = on));
        };
      };
      let maxT = OPEN_MAX, revealAt = 0.6, dustY = H, creaky = true, glowAt = 12;
      let view: { r: number; y: number; up?: number; openUp?: number; turn?: number; key?: [number, number, number]; back?: number } | null = null;
      if (format === "classic") {
        // the base: walls with the art outside, lining inside and a gold rim, on a lined floor; each panel meets the next
        // edge to edge, never on a shared plane (that z-fights and flickers)
        group.add(ring(base, inner, 0, H, 3, [wall, lining, gold]), cap(inner, T, true, lining));

        // the lid hangs from a hinge on the bottom back edge of its skirt; its children sit relative to the lid's top
        const hinge = new THREE.Group();
        hinge.position.set(0, LIFT + T - LH, lb.z0);
        group.add(hinge);
        const lid = new THREE.Group();
        lid.position.set(0, LH - T, -lb.z0);
        hinge.add(lid);
        const noteAt = lidAt(true);
        const note = new THREE.MeshStandardMaterial({
          roughness: 0.85,
          map: toTex(
            sheet(1024, LCH, (c) => {
              c.fillStyle = v.lining;
              c.fillRect(0, 0, 1024, LCH);
              c.strokeStyle = c.fillStyle = v.note;
              c.lineWidth = LS * 0.018;
              pathOf(c, noteAt(-0.2));
              c.stroke();
              c.lineWidth = LS * 0.006;
              pathOf(c, noteAt(-0.27));
              c.stroke();
              c.textAlign = "center";
              c.textBaseline = "middle";
              const words = message.split(" "), size = Math.min(LS * 0.43, (LS * 4.9) / Math.max(...words.map((w) => w.length), 1), LCH / (words.length + 1.5));
              c.font = `600 ${size}px Georgia, serif`;
              words.forEach((w, i) => c.fillText(w, 512, LCH / 2 + (i - (words.length - 1) / 2) * size * 1.15, 1024 * 0.7));
            }),
          ),
        });
        const skirtY = T - LH / 2; // the ribbon's centre down the skirt (plate and skirt together)
        // the lid: its top and the note underneath, the plate's edge, a gold edging, and the skirt hanging below the plate
        lid.add(cap(lidLine, T, true, top), cap(lidLine, 0, false, note), ring(lidLine, null, 0, T, 3.14, [outside]));
        lid.add(ring(outlineOf(shape, T + 0.013), null, T - 0.024, 0.024, 3.14, [gold]));
        lid.add(ring(lidLine, outlineOf(shape, 0.01), T - LH, LH - T, 3.14, [skirt, lining, outside], true));
        // the ribbon (or twine): a cross over the top and down every skirt, then a bow. The foil finishes show their lid instead.
        if (v.bow) {
          const bw = v.bow.width, k = bw < 0.1 ? 0.55 : 1; // twine: a thin cord and a smaller bow
          const bands: Three.Mesh[] = [], bowG = new THREE.Group();
          bowG.position.y = T;
          lid.add(bowG);
          const band = (w: number, h: number, d: number, x: number, y: number, z: number) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ribbon);
            m.position.set(x, y, z);
            lid.add(m);
            bands.push(m);
          };
          // each band stands a hair off the face it lies on: a shared plane z-fights and flickers as the box moves
          band(bw, 0.012, ld + 0.02, 0, T + 0.009, 0);
          band(lw + 0.02, 0.012, bw, 0, T + 0.011, 0);
          band(bw, LH, 0.012, 0, skirtY, ld / 2 + 0.009);
          band(bw, LH, 0.012, 0, skirtY, -ld / 2 - 0.009);
          if (shape !== "hexagon") {
            // down the sides too, where the side is flat (a hexagon has a corner there)
            band(0.012, LH, bw, lw / 2 + 0.009, skirtY, 0);
            band(0.012, LH, bw, -lw / 2 - 0.009, skirtY, 0);
          }
          // flat satin loops and tails like the shop formats' bows; twine ties a narrow cord bow
          bowOn(bowG, k, ribbon, false, bw < 0.1 ? 0.035 : 0.22 * k);
          ribbonPose = untie(bowG, bands, ribbon);
          const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
          if (variant === "velvet") {
            // a latkan: a cord from the knot to a gold bead and a fringed cone, lying on the lid
            cord(lid, V(0, T + 0.06, 0.05), V(0.32, T + 0.04, 0.72), 0.012, ribbon);
            const bead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 10), gold);
            bead.position.set(0.32, T + 0.045, 0.72);
            lid.add(bead);
            const fringe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.09, 0.26, 24, 1), ribbon);
            fringe.position.set(0.38, T + 0.05, 0.86);
            fringe.rotation.set(Math.PI / 2, 0, -0.4);
            lid.add(fringe);
          }
          if (variant === "kraft") {
            // a kraft tag on a loop of twine, printed with the message
            const tag = new THREE.Mesh(
              new THREE.BoxGeometry(0.62, 0.006, 0.34),
              new THREE.MeshStandardMaterial({
                roughness: 0.9,
                map: canvasTex(512, (c) => {
                  c.fillStyle = "#e9dcc2";
                  c.fillRect(0, 0, 512, 512);
                  c.fillStyle = c.strokeStyle = v.note;
                  c.lineWidth = 6;
                  c.strokeRect(24, 24, 464, 464);
                  c.beginPath();
                  c.arc(70, 256, 22, 0, TAU);
                  c.stroke();
                  c.font = "600 64px Georgia, serif";
                  c.textAlign = "center";
                  c.textBaseline = "middle";
                  const words = message.split(" ");
                  words.forEach((w, i) => c.fillText(w, 290, 256 + (i - (words.length - 1) / 2) * 76, 360));
                }),
              }),
            );
            tag.position.set(0.55, T + 0.012, 0.6);
            tag.rotation.y = -0.45;
            lid.add(tag);
            cord(lid, V(0, T + 0.05, 0.02), V(0.31, T + 0.016, 0.47), 0.01, ribbon);
          }
        }

        // the cups: a grid in the square and long boxes, a centre cup and a ring of six in the others
        const radial = shape !== "square" && shape !== "long";
        const cells: Pt[] = shape === "square"
          ? Array.from({ length: 9 }, (_, i) => [((i % 3) - 1) * 0.95, (Math.floor(i / 3) - 1) * 0.95])
          : shape === "long"
            ? Array.from({ length: 8 }, (_, i) => [((i % 4) - 1.5) * 0.95, (Math.floor(i / 4) - 0.5) * 0.95])
            : [[0, 0], ...Array.from({ length: 6 }, (_, k) => [-0.95 * Math.sin(Math.PI / 6 + (k * Math.PI) / 3), -0.95 * Math.cos(Math.PI / 6 + (k * Math.PI) / 3)] as Pt)];
        addCups(group, cells, T + 0.005);
        // the gold tray's dividers between the cups, as real boxes hold each sweet in its own place: a grid, or six spokes
        // from a ring round the centre cup out to the wall
        const reachOf = (dx: number, dz: number) => {
          let best = Infinity; // how far a ray from the centre runs before it meets the inside of the wall
          inner.forEach(([x0, z0], i) => {
            const [x1, z1] = inner[(i + 1) % inner.length], ex = x1 - x0, ez = z1 - z0, den = dx * ez - dz * ex;
            if (Math.abs(den) < 1e-9) return;
            const t = (x0 * ez - z0 * ex) / den, u = (x0 * dz - z0 * dx) / den;
            if (t > 0 && u >= 0 && u <= 1) best = Math.min(best, t);
          });
          return best;
        };
        const divider = (x0: number, z0: number, x1: number, z1: number) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(x1 - x0, z1 - z0), 0.22, 0.025), gold);
          m.position.set((x0 + x1) / 2, T + 0.11, (z0 + z1) / 2);
          m.rotation.y = Math.atan2(-(z1 - z0), x1 - x0);
          group.add(m);
        };
        const ix = boundsOf(inner).x1, iz = boundsOf(inner).z1;
        if (shape === "square")
          for (const p of [-0.475, 0.475]) {
            divider(p, -iz, p, iz);
            divider(-ix, p, ix, p);
          }
        if (shape === "long") {
          for (const p of [-0.95, 0, 0.95]) divider(p, -iz, p, iz);
          divider(-ix, 0, ix, 0);
        }
        if (radial) {
          for (let k = 0; k < 6; k++) {
            const a = (k * Math.PI) / 3, dx = -Math.sin(a), dz = -Math.cos(a);
            divider(dx * 0.5125, dz * 0.5125, dx * reachOf(dx, dz), dz * reachOf(dx, dz));
          }
          const circle = (rad: number) => Array.from({ length: 48 }, (_, k) => [rad * Math.cos((k * TAU) / 48), rad * Math.sin((k * TAU) / 48)] as Pt);
          group.add(ring(circle(0.5125), circle(0.4875), T, 0.22, 1, [gold, gold, gold]));
        }

        pose = (t) => {
          hinge.rotation.x = -t;
        };
      } else {
        // ---- the shop formats: each builds its box, its contents and a pose for the opening p (0 shut, 1 open) ----------
        // a printed card face: the painting in colour, its gold as a foil mask (smooth metal, a little raised), and an
        // optional alpha cut for windows, slots and shaped flaps
        const lumaToAlpha = (cv: HTMLCanvasElement) => {
          const cx = cv.getContext("2d")!, d = cx.getImageData(0, 0, cv.width, cv.height);
          for (let i = 0; i < d.data.length; i += 4) {
            d.data[i + 3] = d.data[i];
            d.data[i] = d.data[i + 1] = d.data[i + 2] = 255;
          }
          cx.putImageData(d, 0, 0);
          return cv;
        };
        const printMat = (w: number, h: number, draw: (c: Ctx, w: number, h: number, ink: Ink) => void, o: { cut?: (c: Ctx, w: number, h: number) => void; rough?: number; bump?: number; double?: boolean } = {}) => {
          const color = sheet(w, h, (c) => draw(c, w, h, (n) => PALETTE[n] ?? n));
          const mask = lumaToAlpha(sheet(w, h, (c) => {
            c.fillStyle = "#000";
            c.fillRect(0, 0, w, h);
            draw(c, w, h, (n) => (n.startsWith("gold") ? "#fff" : "#000"));
          }));
          const tint = (fill: string) => sheet(w, h, (c) => {
            c.drawImage(mask, 0, 0);
            c.globalCompositeOperation = "source-in";
            c.fillStyle = fill;
            c.fillRect(0, 0, w, h);
          });
          const orm = toTex(sheet(w, h, (c) => {
            c.fillStyle = `rgb(0,${Math.round((o.rough ?? 0.78) * 255)},0)`;
            c.fillRect(0, 0, w, h);
            c.drawImage(tint("rgb(0,72,235)"), 0, 0);
          }), false);
          const bump = toTex(sheet(w, h, (c) => {
            c.fillStyle = "#000";
            c.fillRect(0, 0, w, h);
            c.filter = `blur(${Math.max(1, w / 700)}px)`;
            c.drawImage(tint("#fff"), 0, 0);
          }), false);
          const alpha = o.cut ? toTex(sheet(w, h, (c) => {
            c.fillStyle = "#fff";
            c.fillRect(0, 0, w, h);
            o.cut!(c, w, h);
          }), false) : null;
          const mat = new THREE.MeshPhysicalMaterial({ map: toTex(color), roughnessMap: orm, metalnessMap: orm, bumpMap: bump, bumpScale: o.bump ?? 1.4, roughness: 1, metalness: 1, alphaMap: alpha, alphaTest: alpha ? 0.5 : 0, side: o.double ? THREE.DoubleSide : THREE.FrontSide });
          return { mat, alpha };
        };
        const plain = (color: string, alpha: Three.Texture | null = null, double = false) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, alphaMap: alpha, alphaTest: alpha ? 0.5 : 0, side: double ? THREE.DoubleSide : THREE.FrontSide });
        // a box's lining: printed card, not flat white. A faint lattice of gold butis under a gold rule at the rim, darker
        // toward the floor and into the corners (cheap ambient occlusion), with a paper grain in the bump
        const grainTex = toTex(sheet(256, 256, (c) => {
          c.fillStyle = "#808080";
          c.fillRect(0, 0, 256, 256);
          for (let i = 0; i < 3000; i++) {
            c.fillStyle = i % 2 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";
            c.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1);
          }
        }), false);
        const lining = (base: string, alpha: Three.Texture | null = null) => {
          const map = toTex(sheet(512, 512, (c) => {
            c.fillStyle = base;
            c.fillRect(0, 0, 512, 512);
            c.fillStyle = "rgba(176,132,52,0.32)";
            for (let y = 40; y < 512; y += 56)
              for (let x = (y / 56) % 2 ? 28 : 0; x < 540; x += 56) {
                for (let k = 0; k < 4; k++) {
                  c.beginPath();
                  c.ellipse(x + Math.cos((k * TAU) / 4) * 4, y + Math.sin((k * TAU) / 4) * 4, 4, 2.2, (k * TAU) / 4, 0, TAU);
                  c.fill();
                }
              }
            c.fillStyle = "rgba(196,150,60,0.9)";
            c.fillRect(0, 10, 512, 4);
            c.fillRect(0, 20, 512, 1.5);
            const floor = c.createLinearGradient(0, 0, 0, 512);
            floor.addColorStop(0, "rgba(80,50,20,0)");
            floor.addColorStop(1, "rgba(80,50,20,0.3)");
            c.fillStyle = floor;
            c.fillRect(0, 0, 512, 512);
            for (const [x0, x1] of [[0, 46], [512, 466]]) {
              const corner = c.createLinearGradient(x0, 0, x1, 0);
              corner.addColorStop(0, "rgba(80,50,20,0.22)");
              corner.addColorStop(1, "rgba(80,50,20,0)");
              c.fillStyle = corner;
              c.fillRect(Math.min(x0, x1), 0, 46, 512);
            }
          }));
          return new THREE.MeshStandardMaterial({ map, bumpMap: grainTex, bumpScale: 0.6, roughness: 0.88, alphaMap: alpha, alphaTest: alpha ? 0.5 : 0 });
        };
        const slab = (parent: Three.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, mats: Three.Material | Three.Material[]) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
          m.position.set(x, y, z);
          parent.add(m);
          return m;
        };
        const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
        const smooth = (a: number, b: number, x: number) => {
          const t = clamp01((x - a) / (b - a));
          return t * t * (3 - 2 * t);
        };
        const grid = (nx: number, nz: number, sx: number, sz: number): Pt[] => Array.from({ length: nx * nz }, (_, i) => [((i % nx) - (nx - 1) / 2) * sx, (Math.floor(i / nx) - (nz - 1) / 2) * sz]);
        const rect = (hx: number, hz: number): Pt[] => [[-hx, -hz], [-hx, hz], [hx, hz], [hx, -hz]];
        maxT = 1;
        revealAt = 0.35;
        glowAt = 7;
        creaky = false;

        if (format === "arch") {
          // the red arch-window hamper: open top, a handle panel, the window cut through with clear acetate behind it
          const S = 2.8, half = S / 2, th = 0.03, white = lining(PALETTE.inner);
          const front = printMat(1024, 1024, paintArchFront, { cut: (c, w, h) => { c.fillStyle = "#000"; archWindow(c, w, h); c.fill(); } });
          const side = printMat(1024, 1024, paintArchSide), back = printMat(1024, 1024, paintArchSide);
          const cutInner = lining(PALETTE.inner, front.alpha);
          slab(group, S, S, th, 0, S / 2, half - th / 2, [white, white, white, white, front.mat, cutInner]);
          slab(group, S, S, th, 0, S / 2, -half + th / 2, [white, white, white, white, white, back.mat]);
          slab(group, th, S, S - 2 * th, half - th / 2, S / 2, 0, [side.mat, white, white, white, white, white]);
          slab(group, th, S, S - 2 * th, -half + th / 2, S / 2, 0, [white, side.mat, white, white, white, white]);
          slab(group, S - 2 * th, th, S - 2 * th, 0, th / 2, 0, white);
          // the top: two flaps hinged at the middle; shut they lie flat over the box, open they stand back to back and
          // their slots make the handle, as in the photo
          const Lf = half - th - 0.015;
          const ruled = (c: Ctx, w: number, h: number, ink: Ink) => {
            c.fillStyle = ink("red");
            c.fillRect(0, 0, w, h);
            c.strokeStyle = ink("gold");
            c.lineWidth = w * 0.004;
            c.strokeRect(w * 0.025, h * 0.05, w * 0.95, h * 0.95);
            c.strokeRect(w * 0.035, h * 0.075, w * 0.93, h * 0.95);
          };
          const flapArt = printMat(1024, Math.round((1024 * Lf) / S), ruled, { cut: (c, w, h) => { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; handleShape(c, w, h * 0.5); c.fill(); c.fillRect(0, h * 0.4, w, h); c.fillStyle = "#000"; handleSlot(c, w, h * 0.55); c.fill(); }, double: true });
          const flaps = [1, -1].map((sg) => {
            const hinge = new THREE.Group();
            hinge.position.set(0, S + 0.016, sg * 0.008); // clear of the wall tops, or they fight and flicker
            hinge.rotation.y = sg > 0 ? 0 : Math.PI;
            group.add(hinge);
            const swing = new THREE.Group();
            hinge.add(swing);
            const m = new THREE.Mesh(new THREE.PlaneGeometry(S - 0.05, Lf), flapArt.mat);
            m.position.y = Lf / 2;
            swing.add(m);
            return swing;
          });
          // the acetate behind the window
          const glass = new THREE.Mesh(new THREE.PlaneGeometry(S * 0.5, S * 0.58), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false }));
          glass.position.set(0, S * (1 - 0.5175), half - th - 0.014);
          group.add(glass);
          // a card insert raises the cups to window height, so the sweets show through the arch and over the rim
          const deck = 1.3;
          slab(group, S - 2 * th - 0.01, deck - th, S - 2 * th - 0.01, 0, th + (deck - th) / 2, 0, white);
          addCups(group, grid(3, 3, 0.85, 0.85), deck + 0.004, 0.8);
          pose = (t) => {
            // the back flap folds up first, the front a beat behind; standing, they lean back together as the handle so
            // the front of the box stays open
            const lean = 0.22 * smooth(0.45, 1, t) + 0.15 * Math.max(0, t - 1);
            flaps.forEach((s, i) => (s.rotation.x = (Math.PI / 2) * (1 - smooth(i ? 0 : 0.1, i ? 0.5 : 0.62, t)) + (i ? lean : -lean)));
          };
          creaky = true;
          dustY = S;
          view = { r: 2.8, y: (S + Lf) / 2, up: 3.2, openUp: 8, turn: 0.5, key: [-3, 6, 5], back: 0.14 };
        }

        if (format === "rajwadi") {
          // the yellow Rajwadi carry box, as in the photo: the front runs straight up into the handle, the back slopes in to
          // meet it, the side gussets fold into triangles; a bow under the handle
          const W = 2.85, D = 1.05, Hb = 2.9, th = 0.03, rise = 0.4, gap = 0.04;
          const front = printMat(1024, Math.round((1024 * Hb) / W), paintRajwadiFront);
          const flat = printMat(512, 512, paintRajwadiPlain);
          const inside = lining(PALETTE.inner), yellow = plain(PALETTE.yellow, null, true);
          slab(group, W, Hb, th, 0, Hb / 2, D / 2 - th / 2, [yellow, yellow, yellow, yellow, front.mat, inside]);
          slab(group, W, Hb, th, 0, Hb / 2, -D / 2 + th / 2, [yellow, yellow, yellow, yellow, inside, front.mat]);
          slab(group, th, Hb, D - 2 * th, W / 2 - th / 2, Hb / 2, 0, [flat.mat, inside, yellow, yellow, yellow, yellow]);
          slab(group, th, Hb, D - 2 * th, -W / 2 + th / 2, Hb / 2, 0, [inside, flat.mat, yellow, yellow, yellow, yellow]);
          slab(group, W - 2 * th, th, D - 2 * th, 0, th / 2, 0, inside);
          // the side gussets: a yellow triangle standing on each end wall
          for (const sg of [-1, 1]) {
            const tri = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(-(D / 2 - gap), rise * 0.97)])), yellow);
            tri.rotation.y = Math.PI / 2;
            tri.position.set(sg * (W / 2 - th), Hb, 0);
            group.add(tri);
          }
          const hand = printMat(1024, 340, (c, w, h, ink) => {
            c.fillStyle = ink("yellow");
            c.fillRect(0, 0, w, h);
          }, { cut: (c, w, h) => { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; handleShape(c, w, h); c.fill(); c.fillStyle = "#000"; handleSlot(c, w, h); c.fill(); }, double: true });
          const flaps: Three.Group[] = [];
          for (const sg of [1, -1]) {
            // the front stands upright; the back leans in across the box's depth to meet it under the handle
            const tilt = sg > 0 ? 0 : Math.atan2(D - 2 * gap, rise), L = sg > 0 ? rise : Math.hypot(D - 2 * gap, rise);
            const hinge = new THREE.Group();
            hinge.position.set(0, Hb, (sg * D) / 2);
            hinge.rotation.y = sg > 0 ? 0 : Math.PI;
            group.add(hinge);
            const swing = new THREE.Group();
            swing.userData.tilt = tilt;
            hinge.add(swing);
            slab(swing, W, L, th, 0, L / 2, -th / 2, [yellow, yellow, yellow, yellow, flat.mat, inside]);
            const top = new THREE.Group();
            top.position.set(0, L, 0);
            swing.add(top);
            const hp = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.92, 0.62), hand.mat);
            hp.position.set(0, 0.31, sg > 0 ? -th - 0.004 : -th);
            top.add(hp);
            swing.userData.top = top;
            if (sg > 0) {
              const silk = satin(0xd9a84e), b = bowOn(swing, 0.78, silk, true);
              b.position.set(0, L * 0.72, 0.03);
              ribbonPose = untie(b, [], silk);
            }
            flaps.push(swing);
          }
          // a card insert holds the cups just under the rim, where they show once the top opens (the box is tall)
          slab(group, W - 2 * th - 0.01, Hb - 0.34, D - 2 * th - 0.01, 0, th + (Hb - 0.34) / 2, 0, inside);
          addCups(group, grid(3, 1, 0.9, 0.56), Hb - 0.32, 0.7);
          pose = (t) => {
            flaps.forEach((f) => {
              const tilt = f.userData.tilt as number;
              f.rotation.x = -tilt + t * (tilt + (tilt ? 0.75 : 2.75)); // the front folds right down its face, the back stands
              // the front's half of the handle (longer than its flap) carries straight on down the face with it
              (f.userData.top as Three.Group).rotation.x = tilt ? tilt * (1 - clamp01(t) * 0.6) : 0;
            });
          };
          creaky = true;
          dustY = Hb;
          view = { r: 2.6, y: 2.0, up: 3.2, openUp: 6.4, turn: 0.55, key: [-3, 6, 5], back: 0.14 };
        }

        if (format === "tray") {
          // the folding tray: chevron foil walls, a white base, sweets in rows, and tulle gathered into a rosette over it
          const hx = 1.8, hz = 1.3, Ht = 0.5, out = rect(hx, hz), inn = rect(hx - 0.04, hz - 0.04);
          const chev = printMat(512, 160, (c, w, h, ink) => chevrons(c, w, h, ink), { bump: 1, rough: 0.5 });
          (chev.mat.map as Three.Texture).wrapS = THREE.RepeatWrapping;
          group.add(ring(out, inn, 0, Ht, 1.6, [chev.mat, lining(PALETTE.white), gold]), cap(inn, 0.03, true, lining(PALETTE.white)));
          addCups(group, grid(4, 3, 0.82, 0.78), 0.035, 0.74);
          // the net: a dome over the tray, pinched to the centre at the top, draped over the walls, a little wrinkled
          const ng = new THREE.PlaneGeometry(3.74, 2.74, 72, 56);
          ng.rotateX(-Math.PI / 2);
          const np = ng.attributes.position;
          for (let i = 0; i < np.count; i++) {
            const x = np.getX(i), z = np.getZ(i), u = x / 1.87, v = z / 1.37, e = Math.max(Math.abs(u), Math.abs(v)), rr = Math.hypot(u, v);
            const rim = 1, lift = Ht + 0.03 + 0.62 * Math.pow(1 - Math.min(1, e / rim), 1.6);
            const pinch = 1 - 0.55 * Math.max(0, 1 - rr / 0.42);
            np.setXYZ(i, x * pinch, lift + 0.07 * Math.abs(Math.sin(Math.atan2(v, u) * 9)) * Math.min(1, rr * 2) * (1 - e * 0.6), z * pinch);
          }
          ng.computeVertexNormals();
          const mesh = toTex(sheet(64, 64, (c) => {
            c.fillStyle = "#ececec";
            c.fillRect(0, 0, 64, 64);
            c.strokeStyle = "#fff";
            c.lineWidth = 7;
            c.strokeRect(0, 0, 64, 64);
          }), false);
          mesh.wrapS = mesh.wrapT = THREE.RepeatWrapping;
          mesh.repeat.set(150, 116);
          // the gathers: fine pale folds running from the rim in to the rosette
          const folds = toTex(sheet(1024, 760, (c) => {
            c.fillStyle = "#f6e8b6";
            c.fillRect(0, 0, 1024, 760);
            for (let i = 0; i < 160; i++) {
              const a = (i / 160) * TAU;
              c.strokeStyle = i % 3 ? "rgba(255,252,236,0.9)" : "rgba(200,170,90,0.5)";
              c.lineWidth = 1 + (i % 5);
              c.beginPath();
              c.moveTo(512, 380);
              c.lineTo(512 + Math.cos(a) * 900, 380 + Math.sin(a) * 700);
              c.stroke();
            }
          }));
          const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: folds, emissive: 0x2a2416, roughness: 0.75, transparent: true, opacity: 0.94, alphaMap: mesh, side: THREE.DoubleSide, depthWrite: false });
          const net = new THREE.Group();
          net.add(new THREE.Mesh(ng, netMat));
          // the rosette: gathered tulle petals
          const petalMat = new THREE.MeshStandardMaterial({ color: 0xf3dc86, emissive: 0x3a2e10, roughness: 0.7, transparent: true, opacity: 0.94, side: THREE.DoubleSide });
          for (let i = 0; i < 30; i++) {
            const pm = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), petalMat);
            const a = i * 2.39996, r = 0.05 + (i % 7) * 0.05;
            pm.position.set(Math.cos(a) * r, Ht + 0.68 + (i % 4) * 0.08, Math.sin(a) * r);
            pm.scale.set(1, 0.4, 0.62);
            pm.rotation.set(i * 0.7, a, i * 0.37);
            net.add(pm);
          }
          group.add(net);
          pose = (t) => {
            const a = clamp01(t);
            net.position.y = smooth(0, 1, a) * 1.6;
            netMat.opacity = 0.94 * (1 - smooth(0.25, 0.95, a));
            petalMat.opacity = 0.92 * (1 - smooth(0.35, 1, a));
            net.visible = petalMat.opacity > 0.01;
          };
          dustY = Ht;
          view = { r: 2.45, y: 0.55 };
        }

        if (format === "diamond") {
          // the diamond box: blush marble, a gold band, four triangle flaps that meet in a point and unfold like petals
          const B = 2.4, Hb = 1.2, th = 0.03, Hp = 1.85, slant = Math.hypot(Hp, B / 2), beta = Math.atan2(B / 2, Hp);
          const base = printMat(512, Math.round((512 * Hb) / B), paintDiamondBase);
          const inside = lining(PALETTE.ivory);
          slab(group, B, Hb, th, 0, Hb / 2, B / 2 - th / 2, [inside, inside, inside, inside, base.mat, inside]);
          slab(group, B, Hb, th, 0, Hb / 2, -B / 2 + th / 2, [inside, inside, inside, inside, inside, base.mat]);
          slab(group, th, Hb, B - 2 * th, B / 2 - th / 2, Hb / 2, 0, [base.mat, inside, inside, inside, inside, inside]);
          slab(group, th, Hb, B - 2 * th, -B / 2 + th / 2, Hb / 2, 0, [inside, base.mat, inside, inside, inside, inside]);
          slab(group, B - 2 * th, th, B - 2 * th, 0, th / 2, 0, inside);
          const flapPrint = printMat(512, 512, (c, w, h, ink) => paintDiamondFlap(c, w, h, ink, message), { double: true, bump: 1 });
          const tri = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-B / 2, 0), new THREE.Vector2(B / 2, 0), new THREE.Vector2(0, slant)]));
          const tuv = tri.attributes.uv, tpos = tri.attributes.position;
          for (let i = 0; i < tuv.count; i++) tuv.setXY(i, (tpos.getX(i) + B / 2) / B, tpos.getY(i) / slant);
          const flaps: Three.Group[] = [];
          for (let k = 0; k < 4; k++) {
            const turn = new THREE.Group();
            turn.rotation.y = (k * Math.PI) / 2;
            group.add(turn);
            const hinge = new THREE.Group();
            hinge.position.set(0, Hb, B / 2 - 0.005);
            turn.add(hinge);
            hinge.add(new THREE.Mesh(tri, flapPrint.mat));
            flaps.push(hinge);
          }
          const ribbon = satin(0xe8aeb2);
          const bow = new THREE.Group();
          bow.position.y = Hb + Hp;
          bowOn(bow, 1.35, ribbon);
          group.add(bow);
          ribbonPose = untie(bow, [], ribbon);
          // a card insert lifts the cups toward the rim so they show over the walls
          slab(group, B - 2 * th - 0.01, 0.45, B - 2 * th - 0.01, 0, th + 0.225, 0, inside);
          addCups(group, grid(2, 2, 0.95, 0.95), th + 0.454, 0.85);
          pose = (t) => {
            flaps.forEach((f, k) => {
              const pk = (t - k * 0.06) / 0.82;
              f.rotation.x = -beta + Math.max(0, pk) * (beta + 1.85);
            });
          };
          creaky = true;
          dustY = Hb;
          view = { r: 2.6, y: 1.4, openUp: 6.2 };
        }

        if (format === "dabba") {
          // the golden filigree dabba: a pierced band round the tin, a lid with an eight-petal flower in two layers
          const R = 1.45, Hb = 0.95, gold2 = new THREE.MeshStandardMaterial({ color: 0xffd04e, metalness: 0.8, roughness: 0.26, envMapIntensity: 2.8, emissive: 0x3a2800 });
          // the side's filigree as relief: a row of leaf arches with chevrons inside, between bead rows
          const relief = (w: number, h: number, draw: (c: Ctx) => void) => {
            const hgt = sheet(w, h, (c) => {
              c.fillStyle = "#b4b4b4";
              c.fillRect(0, 0, w, h);
              c.fillStyle = c.strokeStyle = "#fff";
              draw(c);
            });
            const col = sheet(w, h, (c) => {
              c.fillStyle = "#ffd65a";
              c.fillRect(0, 0, w, h);
              c.globalCompositeOperation = "multiply";
              c.filter = "blur(1px)";
              c.drawImage(hgt, 0, 0);
            });
            const ct = toTex(col), bt = toTex(hgt, false);
            ct.wrapS = bt.wrapS = THREE.RepeatWrapping;
            return new THREE.MeshStandardMaterial({ map: ct, bumpMap: bt, bumpScale: 3, metalness: 0.6, roughness: 0.32, envMapIntensity: 2.6, emissive: 0x3a2800 });
          };
          const band = relief(2048, 256, (c) => {
            const n = 24, u = 2048 / n;
            c.lineWidth = 7;
            for (let i = 0; i < n; i++) {
              const x = i * u;
              c.beginPath();
              c.moveTo(x + u * 0.08, 236);
              c.lineTo(x + u * 0.08, 120);
              c.quadraticCurveTo(x + u * 0.08, 34, x + u * 0.5, 22);
              c.quadraticCurveTo(x + u * 0.92, 34, x + u * 0.92, 120);
              c.lineTo(x + u * 0.92, 236);
              c.stroke();
              for (let k = 0; k < 3; k++) {
                c.beginPath();
                c.moveTo(x + u * 0.22, 200 - k * 45);
                c.lineTo(x + u * 0.5, 150 - k * 45);
                c.lineTo(x + u * 0.78, 200 - k * 45);
                c.stroke();
              }
              petal(c, x + u * 0.5, 86, 50, 15, 0, "#fff");
              // the leaf scrolls filling the gap between arches
              petal(c, x, 150, 70, 14, -0.45, "#fff");
              petal(c, x, 150, 70, 14, 0.45, "#fff");
              c.beginPath();
              c.arc(x, 64, 9, 0, TAU);
              c.fill();
            }
            for (let x = 8; x < 2048; x += 22) {
              c.beginPath();
              c.arc(x, 246, 6, 0, TAU);
              c.arc(x + 11, 10, 6, 0, TAU);
              c.fill();
            }
          });
          const side = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Hb, 128, 1, true), band);
          side.position.y = Hb / 2;
          const innerWall = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.03, R - 0.03, Hb, 96, 1, true), new THREE.MeshStandardMaterial({ color: 0xc89430, metalness: 1, roughness: 0.4, side: THREE.BackSide }));
          innerWall.position.y = Hb / 2;
          const floor = new THREE.Mesh(new THREE.CircleGeometry(R - 0.03, 64), gold2);
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = 0.02;
          const rim = new THREE.Mesh(new THREE.TorusGeometry(R - 0.015, 0.025, 10, 96), gold2);
          rim.rotation.x = Math.PI / 2;
          rim.position.y = Hb;
          group.add(side, innerWall, floor, rim);
          // dry fruit heaped inside: almonds and pistachios
          const almond = new THREE.MeshStandardMaterial({ color: 0x8b5631, roughness: 0.6 }), pista = new THREE.MeshStandardMaterial({ color: 0x9ca25a, roughness: 0.65 });
          const nutGeo = new THREE.SphereGeometry(1, 14, 10);
          for (let i = 0; i < 34; i++) {
            const a = i * 2.39996, r = Math.sqrt(i / 34) * (R - 0.32), nut = new THREE.Mesh(nutGeo, i % 3 ? almond : pista);
            nut.scale.set(0.15, 0.075, 0.09);
            nut.rotation.set(i * 0.4, a, i * 0.9);
            // each nut can be picked like a sweet: a cell where it lies and a hop group the frame loop lifts (no opening hop)
            const cell = new THREE.Group(), hop = new THREE.Group();
            cell.position.set(Math.cos(a) * r, 0.1 + (1 - r / R) * 0.28 + (i % 2) * 0.05, Math.sin(a) * r);
            hop.userData = { kind: i % 3 ? "almond" : "pistachio", loose: true };
            group.add(cell.add(hop.add(nut)));
            treats.push(hop);
          }
          // the lid: a skirt with a scalloped band, a flat top with a pierced ring, and the raised flower
          // the lid turns about its own middle, so it can be set down leaning on the tin
          const lidPivot = new THREE.Group(), lid = new THREE.Group();
          lidPivot.add(lid);
          group.add(lidPivot);
          const lidBand = relief(2048, 128, (c) => {
            const n = 36, u = 2048 / n;
            c.lineWidth = 5;
            for (let i = 0; i < n; i++) {
              c.beginPath();
              c.arc(i * u + u / 2, 128, u * 0.42, Math.PI, 0);
              c.stroke();
              c.beginPath();
              c.arc(i * u + u / 2, 96, 7, 0, TAU);
              c.fill();
            }
            c.fillRect(0, 0, 2048, 14);
          });
          const RL = R + 0.04, skirtH = 0.36, topY = Hb + 0.11;
          const skirt = new THREE.Mesh(new THREE.CylinderGeometry(RL, RL, skirtH, 128, 1, true), lidBand);
          skirt.position.y = topY - skirtH / 2;
          lid.add(skirt);
          const lidTop = new THREE.Mesh(new THREE.CircleGeometry(RL, 96), relief(1024, 1024, (c) => {
            // the pierced ring between the petal tips: small arches round the rim
            c.lineWidth = 8;
            for (let i = 0; i < 32; i++) {
              const a = (i * TAU) / 32;
              c.save();
              c.translate(512 + Math.cos(a) * 440, 512 + Math.sin(a) * 440);
              c.rotate(a + Math.PI / 2);
              c.beginPath();
              c.moveTo(-30, 30);
              c.lineTo(-30, 0);
              c.quadraticCurveTo(-30, -40, 0, -48);
              c.quadraticCurveTo(30, -40, 30, 0);
              c.lineTo(30, 30);
              c.stroke();
              c.restore();
            }
            c.beginPath();
            c.arc(512, 512, 498, 0, TAU);
            c.lineWidth = 22;
            c.stroke();
            c.beginPath();
            c.arc(512, 512, 380, 0, TAU);
            c.lineWidth = 8;
            c.stroke();
            // the pierced filigree inside the ring: pairs of leaves and beads
            for (let i = 0; i < 48; i++) {
              const a = (i * TAU) / 48;
              c.save();
              c.translate(512 + Math.cos(a) * 345, 512 + Math.sin(a) * 345);
              c.rotate(a + Math.PI / 2);
              petal(c, 0, 20, 52, 11, -0.5, "#fff");
              petal(c, 0, 20, 52, 11, 0.5, "#fff");
              c.beginPath();
              c.arc(0, 26, 6, 0, TAU);
              c.fill();
              c.restore();
            }
          }));
          lidTop.rotation.x = -Math.PI / 2;
          lidTop.position.y = topY;
          lid.add(lidTop);
          const lidRim = new THREE.Mesh(new THREE.TorusGeometry(RL, 0.035, 10, 128), gold2);
          lidRim.rotation.x = Math.PI / 2;
          lidRim.position.y = topY;
          lid.add(lidRim);
          // the flower: eight big pointed petals with a midrib, eight smaller ones between them below, a boss in the middle
          const petalGeo = (len: number, wid: number) => {
            const sh = new THREE.Shape();
            sh.moveTo(0, 0);
            sh.bezierCurveTo(wid, len * 0.28, wid * 0.62, len * 0.82, 0, len);
            sh.bezierCurveTo(-wid * 0.62, len * 0.82, -wid, len * 0.28, 0, 0);
            const g = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.05, bevelSize: wid * 0.35, bevelSegments: 4, curveSegments: 20 });
            g.rotateX(-Math.PI / 2);
            g.rotateX(0.1); // the tips dip toward the rim: a domed flower
            return g;
          };
          const big = petalGeo(RL * 0.7, RL * 0.17), small = petalGeo(RL * 0.56, RL * 0.13);
          const rib = new THREE.BoxGeometry(0.018, 0.02, RL * 0.6);
          for (let i = 0; i < 16; i++) {
            const g = new THREE.Group(), isBig = i % 2 === 0;
            g.rotation.y = (i * TAU) / 16;
            g.position.y = topY + (isBig ? 0.06 : 0.025);
            const m = new THREE.Mesh(isBig ? big : small, gold2);
            m.position.z = -RL * 0.1;
            g.add(m);
            if (isBig) {
              const r2 = new THREE.Mesh(rib, gold2);
              r2.position.set(0, 0.075, -RL * 0.45);
              r2.rotation.x = 0.1;
              g.add(r2);
            }
            lid.add(g);
          }
          const boss = new THREE.Mesh(new THREE.SphereGeometry(RL * 0.15, 28, 14, 0, TAU, 0, Math.PI / 2), gold2);
          boss.scale.y = 0.7;
          boss.position.y = topY + 0.07;
          lid.add(boss);
          for (let i = 0; i < 14; i++) {
            const bead = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), gold2);
            bead.position.set(Math.cos((i * TAU) / 14) * RL * 0.19, topY + 0.07, Math.sin((i * TAU) / 14) * RL * 0.19);
            lid.add(bead);
          }
          const mid = topY - skirtH / 2;
          lid.position.y = -mid;
          // open: the lid lifts, then is stood up behind the tin, off to the right, its flower turned to you, so the
          // sweets in front stay in view
          // lift, carry it back high while it turns (so its near edge never dips into the tin), then set it down
          pose = (t) => {
            const a = smooth(0, 0.35, t), b = smooth(0.3, 0.85, t), d = smooth(0.7, 1, t);
            lidPivot.position.set(b * R * 0.75, mid + a * 1.3 * (1 - d) + d * (RL * 0.95 - mid), -b * (R + 0.7));
            lidPivot.rotation.set(b * 1.2, b * 0.3, -b * 0.12);
          };
          dustY = Hb;
          glowAt = 4;
          view = { r: 2.45, y: 0.8, openUp: 6.4, back: 0.1 }; // the lid stands behind: look down into the tin
        }

        if (format === "rigid") {
          // the crimson rigid box: a deep telescoping lid with a gold frame, a champagne ribbon off centre and a bow
          const hx = 1.65, hz = 1.15, Hb = 1.65, lidH = 1.2, lx = hx + 0.06, lz = hz + 0.06, topY = Hb + 0.05;
          const crimson = new THREE.MeshPhysicalMaterial({ color: PALETTE.crimson, roughness: 0.62 }), cream = lining(PALETTE.ivory);
          group.add(ring(rect(hx, hz), rect(hx - 0.04, hz - 0.04), 0, Hb, 6, [crimson, cream, crimson]), cap(rect(hx - 0.04, hz - 0.04), 0.03, true, cream));
          // a card insert holds the cups near the top, as in a real rigid box, so they show over the walls
          const deck = Hb - 0.56;
          group.add(cap(rect(hx - 0.04, hz - 0.04), deck, true, cream));
          addCups(group, grid(3, 2, 1, 0.98), deck + 0.005, 0.9);
          const lid = new THREE.Group();
          group.add(lid);
          const top = printMat(1024, Math.round((1024 * lz) / lx), paintRigidLid, { rough: 0.62 });
          lid.add(cap(rect(lx, lz), topY, true, top.mat), cap(rect(lx, lz), topY - 0.04, false, cream));
          lid.add(ring(rect(lx, lz), rect(lx - 0.04, lz - 0.04), topY - lidH, lidH, 6, [crimson, cream, crimson], true));
          // the ribbon lies tight on the lid: thin bands a hair off each face, the top ones running just over the edge to
          // meet the ones down the sides, so nothing stands proud or runs past the box
          const ribbon = satin(0xd9c08a), bx = 0.42, bz = -0.28, bw = 0.26, rt = 0.008, g = 0.01;
          // drawn a little ahead of the lid in depth too, so it never sinks into it as the box tilts
          Object.assign(ribbon, { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
          const bands = [
            slab(lid, bw, rt, 2 * (lz + g + rt), bx, topY + g + rt / 2, 0, ribbon),
            slab(lid, 2 * (lx + g + rt), rt, bw, 0, topY + g + rt * 1.5, bz, ribbon),
            ...[-1, 1].map((sg) => slab(lid, bw, lidH + g, rt, bx, topY - lidH / 2 + g / 2, sg * (lz + g + rt / 2), ribbon)),
            ...[-1, 1].map((sg) => slab(lid, rt, lidH + g * 2, bw, sg * (lx + g + rt / 2), topY - lidH / 2 + g, bz, ribbon)),
          ];
          const b = bowOn(lid, 1.0, ribbon);
          b.position.set(bx, topY + g + rt * 2, bz);
          b.rotation.y = 0.5;
          ribbonPose = untie(b, bands, ribbon);
          // open: the lid lifts straight off, then is set down leaning on the back of the box
          pose = (t) => {
            const a = smooth(0, 0.5, t), c2 = smooth(0.4, 1, t);
            lid.position.set(0, a * 1.15 * (1 - c2) + c2 * 0.62, -c2 * (hz + 0.95));
            lid.rotation.x = -c2 * 1.22;
          };
          dustY = Hb;
          view = { r: 2.35, y: 0.95, key: [-1.5, 9, 2], back: 0.14 };
        }
        glow.position.set(0, dustY * 0.7, 0);
        // light from the front-left, so the front, the side and the top of a tall square box land at different tones
        if (view?.key) sun.position.set(...view.key);
      }

      // gold dust: one burst per opening
      const N = 140;
      const dustPos = new Float32Array(N * 3), dustVel = new Float32Array(N * 3);
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({
        color: 0xf2b53c, // normal blending, not additive: additive gold vanishes on a light page
        size: 0.07,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        map: canvasTex(64, (c) => {
          const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
          g.addColorStop(0, "rgba(255,255,255,1)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          c.fillStyle = g;
          c.fillRect(0, 0, 64, 64);
        }),
      });
      const dust = new THREE.Points(dustGeo, dustMat);
      dust.visible = false;
      group.add(dust);
      const burst = () => {
        for (let i = 0; i < N; i++) {
          dustPos.set([(Math.random() - 0.5) * 2.4, dustY, (Math.random() - 0.5) * 2.4], i * 3);
          dustVel.set([(Math.random() - 0.5) * 1.2, 1.6 + Math.random() * 1.8, (Math.random() - 0.5) * 1.2], i * 3);
        }
        dust.visible = true;
      };

      // springs and loop
      const mq = matchMedia("(prefers-reduced-motion: reduce)");
      let calm = mq.matches;
      let tie = live.current.open ? 1 : 0; // 0 tied, 1 undone
      let th = live.current.open ? maxT : 0, w = 0, hover = false, wasOpen = live.current.open, revealed = live.current.open;
      let pick = -1, chosen = -1, boxS = 1, boxV = 0; // the hovered sweet, the picked one, and the box's scale spring
      const want = (i: number) => (i === chosen ? 1.8 : i === pick ? 1 : 0);
      const unpick = () => {
        chosen = -1;
        setPicked((p) => p && { ...p, on: false });
      };
      const { floatT: carried, ...tilt } = { ...carry.current };
      let openedAt = -1, time = 0, floatT = carried, jolt = 0, joltV = 0;
      const snd = () => (live.current.sound ? audio.current : null);
      let raf = 0, last = 0, seen = true;
      // the shop formats frame their own size: the same direction as the classic box, the distance from their reach; as
      // one opens the camera rises (openUp) so you look down into it and every cup shows over the walls
      let aimed = -1;
      const aim = (o = Math.min(1, Math.max(0, th / maxT))) => {
        if (!view || Math.abs(o - aimed) < 1e-3) return;
        aimed = o;
        // the camera swings up over the box at the same distance (only the elevation changes), so it stays the same size
        const far = (view.r / 2.25) * 1.25 * Math.max(1, 0.85 / camera.aspect), up = view.up ?? 4.6, s = o * o * (3 - 2 * o);
        const a = Math.atan2(up, 7.2) + (Math.atan2(view.openUp ?? up * 1.45, 7.2) - Math.atan2(up, 7.2)) * s, d = Math.hypot(up, 7.2) * far * (1 + (view.back ?? 0) * s); // a box that stands taller open backs off, so nothing clips
        camera.position.set(0, view.y + Math.sin(a) * d, Math.cos(a) * d);
        camera.lookAt(0, view.y - 0.22 * s * view.r, 0);
      };
      const resize = (draw = true) => {
        aimed = -1;
        // layout size, not the on-screen rect: a scaled ancestor must not shrink the canvas for good
        const w = Math.max(1, box.offsetWidth), h = Math.max(1, box.offsetHeight);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        if (view) aim();
        else {
          const far = 1.25 * reach * Math.max(1, 0.85 / camera.aspect); // pull back on tall boxes so the open lid still fits
          camera.position.set(0, 5.4 * far, 7.2 * far);
          camera.lookAt(0, 1.35 * reach, -0.7 * reach);
        }
        camera.updateProjectionMatrix();
        if (draw) renderer.render(scene, camera);
      };
      const frame = (now: number) => {
        const dt = Math.min(1 / 30, (now - last) / 1000 || 0);
        last = now;
        time += dt;
        const { open: o, paused: p } = live.current;
        if (o !== wasOpen) {
          wasOpen = o;
          if (!o) revealed = false;
        }
        // a ribbon comes undone first and the lid waits for it; shutting, the lid lands before the ribbon is tied again
        if (ribbonPose) {
          if (o) tie = Math.min(1, tie + dt / (calm ? 0.25 : 1.1));
          else if (th < 0.03) tie = Math.max(0, tie - dt / (calm ? 0.25 : 0.8));
          ribbonPose(tie);
        }
        // hover: the classic lid lifts a touch; the shop boxes, whose flaps would only twitch, swell a little instead
        const goal = o ? (ribbonPose && tie < 0.88 ? 0 : maxT) : hover && format === "classic" ? PEEK : 0;
        if (calm) {
          // reduced motion: a stiff, critically damped spring straight to the goal; no gravity, bounce or jolt
          w += (260 * (goal - th) - 2 * Math.sqrt(260) * w) * dt;
          th = Math.min(maxT, Math.max(0, th + w * dt));
        } else if (format !== "classic") {
          // the shop formats: a slightly underdamped spring, so flaps and lids overshoot a touch and settle; landing shut
          // fast knocks and jolts like the classic lid, resting there is quiet
          w += (120 * (goal - th) - 2 * Math.sqrt(120) * 0.78 * w) * dt;
          th += w * dt;
          if (th <= 0 && w < 0) {
            th = 0;
            if (w < -REST * 0.6) {
              snd()?.hit(-w * 2.5, 90, 0.8);
              joltV += -w * 0.01;
              w = -w * 0.15;
            } else w = 0;
          }
          joltV += (-220 * jolt - 2 * Math.sqrt(220) * 0.35 * joltV) * dt;
          jolt += joltV * dt;
        } else {
          // a hinged lid with weight: gravity about the hinge, friction, and a hand that lifts it (cancelling gravity, with a
          // springy pull) until it passes upright on the way open, or lowers it until LET_GO on the way shut, then lets it fall
          const gravity = Math.cos(A0 + th) * G;
          let acc = -gravity - FRICTION * w;
          if (o ? th < UPRIGHT + 0.05 : hover || th > LET_GO) acc += gravity + Math.min(HAND_MAX, Math.max(-HAND_MAX, HAND * (goal - th) - 2 * Math.sqrt(HAND) * 0.5 * w));
          w += acc * dt;
          th += w * dt;
          // the stops: shut on the base, open at OPEN_MAX; a real impact bounces a little and knocks. Under REST it is the lid
          // resting there (gravity presses it into the stop every frame): no sound, bounce or jolt, or it hums 60 knocks a second
          if (th <= 0 && w < 0) {
            th = 0;
            if (w < -REST) {
              snd()?.hit(-w, 70, 1);
              joltV += -w * 0.012;
              w = -w * 0.18;
            } else w = 0;
          } else if (th >= OPEN_MAX && w > 0) {
            th = OPEN_MAX;
            if (w > REST) {
              snd()?.hit(w, 160, 0.5);
              w = -w * 0.3;
            } else w = 0;
          }
          joltV += (-220 * jolt - 2 * Math.sqrt(220) * 0.35 * joltV) * dt;
          jolt += joltV * dt;
        }
        snd()?.creak(calm || !creaky ? 0 : Math.abs(w) * (format === "classic" ? 1 : 3));
        // the reveal, once the lid is well up: light, a chime, gold dust and the sweets hopping in turn
        if (o && !revealed && th > revealAt) {
          revealed = true;
          snd()?.chime();
          if (!calm) {
            openedAt = time;
            burst();
          }
        }
        pose(th);
        aim();
        const openness = Math.min(1, th / maxT);
        glow.intensity = glowAt * openness;
        // the sweets hop in turn after an opening; the one under the pointer springs up out of its cup and grows toward
        // you while the box eases back a little (a stiff, slightly underdamped spring, so it is quick and can be handed
        // from sweet to sweet mid-flight)
        if (!o) {
          pick = -1;
          if (chosen >= 0) unpick();
        }
        // a picked sweet rises higher and grows more, and turns slowly so you see it all round; let go, it unwinds the
        // short way back
        treats.forEach((t, i) => {
          const s = openedAt < 0 || t.userData.loose ? 1 : Math.min(1, Math.max(0, (time - openedAt - 0.25 - i * 0.07) / 0.45));
          const u = t.userData as { l?: number; lv?: number; r?: number };
          u.l ??= 0;
          u.lv ??= 0;
          u.r ??= 0;
          u.lv += (220 * (want(i) - u.l) - 2 * Math.sqrt(220) * u.lv) * dt;
          u.l += u.lv * dt;
          if (i === chosen && !calm) u.r += dt * 0.6;
          else {
            u.r = Math.atan2(Math.sin(u.r), Math.cos(u.r));
            u.r -= u.r * Math.min(1, dt * 6);
            if (Math.abs(u.r) < 1e-4) u.r = 0;
          }
          t.position.y = Math.sin(Math.PI * s) * 0.45 + u.l * (calm ? 0.05 : 0.22);
          t.scale.setScalar(1 + u.l * (calm ? 0.08 : 0.22));
          t.rotation.y = s < 1 ? s * Math.PI * 2 : u.l * 0.2 + u.r;
        });
        const sGoal = chosen >= 0 ? 0.96 : pick >= 0 ? 0.975 : !o && hover && format !== "classic" ? 1.015 : 1;
        boxV += (220 * (sGoal - boxS) - 2 * Math.sqrt(220) * boxV) * dt;
        boxS += boxV * dt;
        group.scale.setScalar(boxS);
        if (dust.visible) {
          const age = time - openedAt;
          for (let i = 0; i < N * 3; i += 3) {
            dustVel[i + 1] -= 2.4 * dt;
            dustPos[i] += dustVel[i] * dt;
            dustPos[i + 1] += dustVel[i + 1] * dt;
            dustPos[i + 2] += dustVel[i + 2] * dt;
          }
          dustGeo.attributes.position.needsUpdate = true;
          dustMat.opacity = Math.max(0, 1 - age / 1.8);
          if (age > 1.8) dust.visible = false;
        }
        // idle float and pointer tilt (not on reduced motion)
        const ease = 1 - Math.exp(-dt * 6);
        // open, the lean is gentler (eased with the opening): swung far round, a side wall would hide the cups behind it
        const leanX = calm ? 0 : tilt.tx * (1 - 0.6 * openness), leanY = calm ? 0 : tilt.ty;
        tilt.x += (leanX - tilt.x) * ease;
        tilt.y += (leanY - tilt.y) * ease;
        if (!p && !calm) floatT += dt;
        const bob = Math.sin(floatT * 2.2) * 0.06;
        group.position.y = bob + 0.1 - Math.min(0.03, Math.abs(jolt) * 0.6); // never down to the shadow plane: they would flicker
        group.rotation.set(tilt.y + jolt, tilt.x - (view?.turn ?? 0.35), 0);
        shadow.scale.setScalar((view ? view.r / 2.2 : reach) * (1 - bob * 0.8));
        renderer.render(scene, camera);
        const settled = Math.abs(w) < 2e-3 && (Math.abs(goal - th) < 2e-3 || th === 0 || th === maxT) && Math.abs(jolt) < 1e-4 && Math.abs(joltV) < 1e-3 && Math.abs(leanX - tilt.x) < 1e-3 && Math.abs(leanY - tilt.y) < 1e-3 && !dust.visible && (openedAt < 0 || time - openedAt > 1.5) && (!ribbonPose || tie === (o ? 1 : 0)) && Math.abs(boxV) < 1e-3 && Math.abs(sGoal - boxS) < 1e-3 && treats.every((t, i) => Math.abs((t.userData.lv as number) ?? 0) < 1e-3 && Math.abs(((t.userData.l as number) ?? 0) - want(i)) < 1e-3 && !((t.userData.r as number) ?? 0)) && (chosen < 0 || calm);
        raf = (p || calm) && settled ? 0 : requestAnimationFrame(frame);
      };
      const start = () => {
        if (raf || !seen || dead) return;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };
      kick.current = start;
      const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
      // which sweet is under a point, once the box is open enough to see them
      const sweetAt = (x: number, y: number) => {
        if (!live.current.open || th < maxT * 0.7 || !treats.length) return -1;
        const r = box.getBoundingClientRect();
        ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(treats.map((t) => t.parent!), true)[0]; // the whole cell: it stays put while its sweet lifts
        for (let o: Three.Object3D | null = hit?.object ?? null; o; o = o.parent) {
          const i = treats.indexOf(o.children.find((c) => treats.includes(c)) ?? o);
          if (i >= 0) return i;
        }
        return -1;
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const r = box.getBoundingClientRect();
        pick = sweetAt(e.clientX, e.clientY);
        tilt.tx = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
        tilt.ty = ((e.clientY - r.top) / r.height - 0.5) * 0.2;
        hover = true;
        start();
      };
      const onLeave = () => {
        tilt.tx = tilt.ty = 0;
        pick = -1;
        hover = false;
        start();
      };
      // a click or tap on a sweet picks it (again puts it back); with one picked, a click anywhere else puts it back
      // too, rather than shutting the box. This runs before React's onClick, which `tapped` tells to stand aside.
      const onTap = (e: MouseEvent) => {
        const i = e.detail ? sweetAt(e.clientX, e.clientY) : -1; // a key press (detail 0) has no point
        if (i < 0 && chosen < 0) return;
        tapped.current = true;
        if (i < 0 || i === chosen) unpick();
        else {
          chosen = i;
          setPicked((p) => ({ name: NAMES[treats[i].userData.kind as string], n: (p?.n ?? 0) + 1, on: true }));
        }
        snd()?.click();
        start();
      };
      // Esc puts a picked sweet back; only that, not the dialog the box may sit in
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== "Escape" || chosen < 0) return;
        e.preventDefault();
        e.stopPropagation();
        unpick();
        start();
      };
      const onMq = () => {
        calm = mq.matches;
        start();
      };
      box.addEventListener("pointermove", onMove);
      box.addEventListener("pointerleave", onLeave);
      box.addEventListener("click", onTap);
      box.addEventListener("keydown", onKey);
      mq.addEventListener("change", onMq);
      const ro = new ResizeObserver(() => resize());
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
      // the first frame is a real one (posed, floating, turned), drawn before the outgoing box fades off it
      resize(false);
      last = performance.now();
      frame(last);
      box.querySelectorAll<HTMLCanvasElement>("canvas[data-stale]").forEach((c) => {
        if (c.style.opacity === "0") return;
        // a light blur as it goes hides the double image of two differently shaped boxes
        c.style.transition = "opacity 180ms cubic-bezier(0.23, 1, 0.32, 1), filter 180ms cubic-bezier(0.23, 1, 0.32, 1)";
        c.style.opacity = "0";
        c.style.filter = "blur(4px)";
        c.addEventListener("transitionend", () => drop(c), { once: true });
        setTimeout(() => drop(c), 260);
      });

      cleanup = () => {
        cancelAnimationFrame(raf);
        carry.current = { floatT, ...tilt };
        kick.current = () => {};
        ro.disconnect();
        io.disconnect();
        box.removeEventListener("pointermove", onMove);
        box.removeEventListener("pointerleave", onLeave);
        box.removeEventListener("click", onTap);
        box.removeEventListener("keydown", onKey);
        setPicked(null);
        mq.removeEventListener("change", onMq);
        canvas.removeEventListener("webglcontextlost", onLost);
        scene.traverse((o) => {
          const m = o as Three.Mesh;
          m.geometry?.dispose();
          for (const mat of ([] as Three.Material[]).concat(m.material ?? [])) mat.dispose();
        });
        textures.forEach((t) => t.dispose());
        pmrem.dispose();
        renderer.dispose();
        // left on screen until the next scene draws its first frame, so switching format never flashes blank
        canvas.dataset.stale = "";
        releases.set(canvas, () => renderer.forceContextLoss());
      };
    })().catch(() => {
      if (dead) return;
      cleanup();
      box.querySelectorAll<HTMLCanvasElement>("canvas[data-stale]").forEach(drop);
      setFailed(true);
    });
    return () => {
      dead = true;
      cleanup();
    };
  }, [variant, shape, format, message, sweetsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- sweetsKey stands in for sweets

  return (
    <button
      ref={root}
      type="button"
      aria-expanded={isOpen}
      aria-label={`${isOpen ? "Close" : "Open"} the sweet box`}
      onClick={(e) => {
        onClick?.(e);
        if (tapped.current) {
          tapped.current = false; // spent on a sweet
          return;
        }
        if (e.defaultPrevented) return;
        // audio unlocks only inside a gesture, so the sounds are made on the first click
        if (sound && !audio.current) {
          try {
            audio.current = createSounds();
          } catch {}
        }
        if (sound) audio.current?.click();
        if (open === undefined) setInner(!isOpen);
        onOpenChange?.(!isOpen);
      }}
      className={cn("relative block aspect-[4/3] w-full cursor-pointer touch-manipulation overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      {...rest}
    >
      {failed && <span className="absolute inset-0 grid place-items-center font-serif text-2xl text-muted-foreground">{message}</span>}
      {hint && (
        <svg
          aria-hidden
          viewBox="0 0 300 200"
          className={cn("pointer-events-none absolute top-[6%] left-[4%] w-[46%] overflow-visible text-foreground transition-opacity duration-200", isOpen && "opacity-0")}
        >
          <style>{HINT_CSS}</style>
          {/* the fade-in lives on this group, so the svg's own opacity can still fade the note away once it is used */}
          <g key={closes} className="mb-hint">
            <text className="mb-write" x="8" y="48" fill="currentColor" fontSize={Math.min(40, 520 / Math.max(hint.length, 1))} style={{ fontFamily: 'var(--mithai-hint-font, "Caveat", "Segoe Print", "Bradley Hand", cursive)' }}>
              {hint}
            </text>
            <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="mb-shaft" pathLength={1} d="M150 66 C 205 60, 252 82, 254 118 C 256 146, 232 150, 236 132 C 240 116, 268 128, 266 172" />
              <path className="mb-head" pathLength={1} d="M250 158 L 266 176 L 280 155" />
            </g>
          </g>
        </svg>
      )}
      {picked && (
        <svg aria-hidden viewBox="0 0 300 200" className={cn("pointer-events-none absolute top-[6%] left-[4%] w-[46%] overflow-visible text-foreground transition-opacity duration-200", !(picked.on && isOpen) && "opacity-0")}>
          <style>{HINT_CSS}</style>
          <g key={picked.n} className="mb-pick">
            <text className="mb-write" x="8" y="48" fill="currentColor" fontSize="40" style={{ fontFamily: 'var(--mithai-hint-font, "Caveat", "Segoe Print", "Bradley Hand", cursive)' }}>
              {picked.name}
            </text>
          </g>
        </svg>
      )}
      <span aria-live="polite" className="sr-only">
        {picked?.on && isOpen ? picked.name : ""}
      </span>
    </button>
  );
}
