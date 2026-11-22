"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import type * as Three from "three";
import { cn } from "@/lib/utils";

export interface LanyardBadgeProps extends Omit<ComponentProps<"div">, "children"> {
  /** Printed in the name box. */
  name?: string;
  /** The tab over the name box. */
  role?: string;
  /** In the pill under the wordmark and in the footer. */
  city?: string;
  /** In the pill at the end of the arrow. */
  year?: string;
  /** "print" is the card as it came, matte ink on white stock; "foil" stamps the wordmark in holographic foil, its rainbow sliding as the card turns. */
  finish?: "print" | "foil";
  /** URL of the hardware model (card, clasp, D-ring, crimp cap). The shadcn install puts it at /models/lanyard-badge.gltf. */
  model?: string;
  /** Stops the loop once the badge has settled, so nothing redraws until it is grabbed. */
  paused?: boolean;
  /** Its own sounds (a click as you grab it, the clasp clinking on a hard swing), made with Web Audio. */
  sound?: boolean;
}

// ---- the printed card, traced from a photo of the badge straightened to the card's outline at 850 x 1240 px (9 px/mm):
// every coordinate below is in that photo's pixels, so it can be checked against it, and the drawing is scaled onto the texture.
const CARD_PX = [1880, 2760] as const;
const INK = "#2b211e", BLUE = "#98b6d8", CREAM = "#f7e2bd", PURPLE = "#7c6bc2", PAPER = "#e9ecf3";
// the GDG mark: Google's colours on the strap; on the card the blue prints violet and the green olive
const GDG = { red: "#ea4335", blue: "#4285f4", green: "#34a853", yellow: "#f9ab00" };
const GDG_CARD = { ...GDG, blue: "#7166c2", green: "#5f9a3e" };

type Ctx = CanvasRenderingContext2D;
const pill = (c: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, stroke = INK, lw = 3.2) => {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  c.lineWidth = lw;
  c.strokeStyle = stroke;
  c.stroke();
};
const fitText = (c: Ctx, text: string, x: number, y: number, size: number, weight: number, font: string, maxW: number, color = INK, align: CanvasTextAlign = "center") => {
  c.font = `${weight} ${size}px ${font}`;
  const w = c.measureText(text).width;
  if (w > maxW) c.font = `${weight} ${(size * maxW) / w}px ${font}`;
  c.fillStyle = color;
  c.textAlign = align;
  c.textBaseline = "alphabetic";
  c.fillText(text, x, y);
};
// a closed path through [x, y, corner radius] points
const roundPoly = (c: Ctx, pts: number[][]) => {
  const n = pts.length;
  c.beginPath();
  c.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  pts.forEach(([x, y, r], i) => {
    const [qx, qy] = pts[(i + 1) % n];
    c.arcTo(x, y, (x + qx) / 2, (y + qy) / 2, r);
  });
  c.closePath();
};
// the GDG mark: two chevrons of capsules, the lower bar of "<" and the upper bar of ">" laid over the other. (x, y) is its
// top left corner and s its height; it is 1.68 s wide
const gdgMark = (c: Ctx, x: number, y: number, s: number, colors = GDG, ink = INK) => {
  const bar = (x0: number, y0: number, x1: number, y1: number, fill: string) => {
    c.beginPath();
    c.moveTo(x + x0 * s, y + y0 * s);
    c.lineTo(x + x1 * s, y + y1 * s);
    c.lineCap = "round";
    c.lineWidth = s * 0.34;
    c.strokeStyle = ink;
    c.stroke();
    c.lineWidth = s * 0.27;
    c.strokeStyle = fill;
    c.stroke();
  };
  bar(0.17, 0.5, 0.62, 0.17, colors.red);
  bar(0.17, 0.5, 0.62, 0.83, colors.blue);
  bar(1.06, 0.83, 1.51, 0.5, colors.yellow);
  bar(1.06, 0.17, 1.51, 0.5, colors.green);
};

// Bengaluru skyline on its ground line (y 1054): Bangalore Palace, Vidhana Soudha under the flag, the Lalbagh glass house,
// the UB City towers and the metro on its viaduct, among trees and hedges, painted in soft shaded fills
const GROUND = 1054;
const skyline = (c: Ctx) => {
  const G = GROUND;
  const rect = (x: number, y: number, w: number, h: number, fill: string | CanvasGradient) => {
    c.fillStyle = fill;
    c.fillRect(x, y, w, h);
  };
  const shape = (pts: number[], fill: string | CanvasGradient, stroke?: string, lw = 1.2) => {
    c.beginPath();
    for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    if (stroke) {
      c.lineWidth = lw;
      c.strokeStyle = stroke;
      c.stroke();
    }
  };
  // a horizontal gradient: lit on the left, in shade on the right, as the whole drawing is
  const lit = (x: number, w: number, light: string, dark: string) => {
    const g = c.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, light);
    g.addColorStop(0.55, light);
    g.addColorStop(1, dark);
    return g;
  };
  const dome = (cx: number, base: number, r: number, h: number, light: string, dark: string, tip = 0) => {
    c.beginPath();
    c.moveTo(cx - r, base);
    c.bezierCurveTo(cx - r * 1.05, base - h * 0.6, cx - r * 0.42, base - h * 0.96, cx, base - h);
    c.bezierCurveTo(cx + r * 0.42, base - h * 0.96, cx + r * 1.05, base - h * 0.6, cx + r, base);
    c.closePath();
    c.fillStyle = lit(cx - r, r * 2, light, dark);
    c.fill();
    if (tip) shape([cx - 1.8, base - h + 2, cx, base - h - tip, cx + 1.8, base - h + 2], dark);
  };
  const arches = (x: number, y: number, n: number, w: number, gap: number, h: number, fill: string) => {
    c.fillStyle = fill;
    for (let i = 0; i < n; i++) {
      c.beginPath();
      c.roundRect(x + i * (w + gap), y, w, h, [w / 2, w / 2, 0, 0]);
      c.fill();
    }
  };
  const tree = (x: number, y: number, r: number, fill: string) => {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = fill;
    c.fill();
  };
  // a clump of foliage: a dark mass with lit leaves on its upper left
  const clump = (x: number, y: number, r: number) => {
    tree(x, y, r, SHADE);
    tree(x - r * 0.25, y - r * 0.2, r * 0.75, OLIVE);
    tree(x - r * 0.4, y - r * 0.4, r * 0.38, LEAF);
  };
  const LEAF = "#8fa443", OLIVE = "#748a35", SHADE = "#56662a";

  // trees behind the buildings
  for (const [x, y, r] of [[6, 1040, 18], [26, 1036, 16], [48, 1042, 12], [194, 1024, 12], [212, 1028, 10], [462, 1028, 13], [478, 1034, 10], [610, 1028, 12], [628, 1020, 14], [648, 1026, 11]]) clump(x, y, r);

  // UB City: the slate towers, the tallest under its gilded crown and spire
  const SLATE_L = "#7a7eb6", SLATE = "#5e619c", SLATE_D = "#45477c", EDGE = "#33355c";
  const tower = (x: number, top: number, w: number, light: string, dark: string) => {
    shape([x, top, x + w, top, x + w, 1030, x, 1030], lit(x, w, light, dark), EDGE, 0.9);
    rect(x + w * 0.22, top + 4, 1.6, 1026 - top - 4, "rgba(255,255,255,0.2)");
    for (let y = top + 6; y < 1028; y += 5) rect(x + 2, y, w - 4, 0.8, "rgba(30,30,70,0.18)");
  };
  tower(662, 963, 40, SLATE_L, SLATE);
  tower(700, 983, 12, SLATE, SLATE_D);
  tower(755, 973, 26, SLATE_L, SLATE);
  shape([787, 947, 826, 953, 826, 1030, 787, 1030], lit(787, 39, SLATE_L, SLATE_D), EDGE, 0.9);
  rect(796, 952, 3, 74, "rgba(255,255,255,0.22)");
  tower(710, 935, 45, SLATE, SLATE_D);
  rect(738, 938, 2.4, 88, "rgba(255,255,255,0.16)");
  shape([711, 936, 754, 936, 747, 926, 718, 926], lit(711, 43, "#f6bf55", "#d4862c"));
  dome(732.5, 927, 14, 10, "#f8c860", "#dc8f2e");
  shape([729.5, 920, 732.5, 892, 735.5, 920], lit(729, 7, "#f7c45a", "#d98a2a"));

  // Bangalore Palace: crenellated towers and turrets over a long body of arched windows
  const TAN = "#bf7f42", TAN_D = "#875024", BRN = "#4f2b14";
  const crenels = (x: number, y: number, w: number, fill: string) => {
    for (let i = 0; i + 5 <= w; i += 8.5) rect(x + i, y - 5, 5, 5, fill);
  };
  const ptower = (x: number, top: number, w: number, cap: number) => {
    rect(x, top + cap, w, G - top - cap, lit(x, w, TAN, TAN_D));
    rect(x - 3, top, w + 6, cap, lit(x - 3, w + 6, TAN, TAN_D));
    rect(x - 3, top + cap - 2, w + 6, 2, BRN);
    crenels(x - 3, top, w + 6, TAN);
    for (let y = top + cap + 7, i = 0; y < G - 14; y += 18, i++) {
      if (w > 20) arches(x + w / 2 - 6.5, y, 2, 4.5, 4, 9, BRN);
      else arches(x + w / 2 - 2.5, y, 1, 5, 0, 9, BRN);
      rect(x, y + 13, w, 1, "rgba(80,40,15,0.45)");
    }
  };
  // a round turret with a conical cap
  const turret = (x: number, top: number, w: number) => {
    rect(x, top, w, G - top, lit(x, w, TAN, TAN_D));
    shape([x - 1.5, top, x + w / 2, top - w * 1.1, x + w + 1.5, top], lit(x, w, "#a96a3a", "#6e4020"));
    arches(x + w / 2 - 1.8, top + 8, 1, 3.6, 0, 7, BRN);
  };
  rect(60, 990, 98, G - 990, lit(60, 98, TAN, TAN_D));
  crenels(60, 990, 98, TAN_D);
  rect(183, 1000, 40, G - 1000, lit(183, 40, TAN, TAN_D));
  crenels(183, 1000, 40, TAN_D);
  rect(60, 1013, 98, 1.2, "rgba(80,40,15,0.45)");
  rect(183, 1022, 40, 1.2, "rgba(80,40,15,0.45)");
  turret(128, 982, 9);
  turret(212, 988, 8);
  ptower(38, 965, 22, 12);
  ptower(96, 966, 12, 9);
  ptower(158, 946, 27, 14);
  arches(66, 999, 4, 5, 4.5, 9, BRN);
  arches(112, 999, 2, 5, 4.5, 9, BRN);
  arches(140, 999, 2, 5, 4.5, 9, BRN);
  arches(68, 1020, 3, 7, 5, 24, BRN);
  arches(116, 1022, 3, 6, 6, 20, BRN);
  arches(188, 1008, 3, 5, 6, 10, BRN);
  arches(188, 1030, 3, 5, 6, 12, BRN);

  // Vidhana Soudha: wings with small domes, pavilions with tall ones, the pillared portico, the drum and the great dome
  const GOLD_L = "#f0bf6c", GOLD = "#e0963c", GOLD_D = "#b8661f", BROWN = "#7a3f1a", WIN = "#3d3150";
  for (const s of [-1, 1]) {
    const wx = s < 0 ? 222 : 404, px = s < 0 ? 270 : 375;
    rect(wx, 1000, 48, G - 1000, lit(wx, 48, GOLD, GOLD_D));
    rect(wx - 1, 998, 50, 4, GOLD_D);
    for (let i = 0; i < 12; i++) rect(wx + 1 + i * 4, 995, 2, 3, GOLD_L);
    arches(wx + 5, 1007, 4, 5, 6.5, 8, BROWN);
    arches(wx + 5, 1022, 4, 5, 6.5, 10, BROWN);
    arches(wx + 5, 1039, 4, 5, 6.5, 11, BROWN);
    rect(wx, 1018, 48, 1, "rgba(120,60,20,0.5)");
    rect(wx, 1035, 48, 1, "rgba(120,60,20,0.5)");
    dome(s < 0 ? 234 : 440, 999, 11, 17, GOLD_L, GOLD_D, 4);
    rect(px, 975, 30, G - 975, lit(px, 30, GOLD_L, GOLD));
    rect(px - 2, 974, 34, 4, GOLD_D);
    arches(px + 11, 984, 1, 8, 0, 13, BROWN);
    arches(px + 6, 1004, 2, 6, 6, 12, BROWN);
    arches(px + 9, 1030, 1, 12, 0, 24, BROWN);
    dome(px + 15, 975, 16, 22, GOLD_L, GOLD_D, 7);
  }
  rect(300, 983, 75, G - 983, GOLD);
  rect(296, 983, 83, 6, GOLD_D);
  rect(296, 989, 83, 9, lit(296, 83, GOLD_L, GOLD));
  for (let i = 0; i < 20; i++) rect(298 + i * 4, 979, 2, 4, GOLD_L);
  rect(302, 1000, 71, 44, WIN);
  for (let i = 0; i < 9; i++) {
    rect(302 + i * 8.6, 1000, 3.4, 44, GOLD_L);
    rect(304.6 + i * 8.6, 1000, 0.8, 44, "rgba(150,80,30,0.6)");
  }
  rect(296, 1044, 83, 10, lit(296, 83, GOLD, GOLD_D));
  rect(306, 967, 63, 16, lit(306, 63, GOLD_L, GOLD));
  for (let i = 0; i < 8; i++) rect(311 + i * 7.6, 970, 3, 9, BROWN);
  shape([303, 968, 371, 968, 364, 957, 310, 957], lit(303, 68, GOLD, GOLD_D));
  dome(337, 959, 30, 29, GOLD_L, GOLD_D);
  c.beginPath();
  for (const k of [-0.6, -0.25, 0.25, 0.6]) {
    c.moveTo(337 + k * 30, 958);
    c.quadraticCurveTo(337 + k * 26, 938, 337 + k * 6, 931);
  }
  c.lineWidth = 0.9;
  c.strokeStyle = "rgba(160,85,25,0.55)";
  c.stroke();
  rect(307, 955, 60, 3, GOLD_D);
  dome(337, 932, 7, 9, GOLD, GOLD_D);
  rect(336.2, 888, 1.6, 36, "#6b5a4a");
  const band = (y: number, fill: string) => {
    c.beginPath();
    c.moveTo(337.8, y);
    c.quadraticCurveTo(350, y - 3.5, 362, y + 1);
    c.lineTo(362, y + 8);
    c.quadraticCurveTo(350, y + 3.5, 337.8, y + 7);
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  };
  band(890, "#ee8a2e");
  band(897, "#fbf6ec");
  band(904, "#2f8c3e");
  c.beginPath();
  c.arc(350, 900.5, 2, 0, Math.PI * 2);
  c.lineWidth = 0.7;
  c.strokeStyle = "#2b3f8f";
  c.stroke();

  // the Lalbagh glass house: an iron frame over pale glass with the gilded interior glowing through, red flowers in front
  const IRON = "#3b302c";
  const house = () => {
    c.beginPath();
    c.moveTo(480, 1046);
    c.lineTo(480, 1004);
    c.bezierCurveTo(492, 986, 530, 978, 552, 966);
    c.bezierCurveTo(574, 978, 612, 986, 625, 1004);
    c.lineTo(625, 1046);
    c.closePath();
  };
  house();
  const glass = c.createRadialGradient(553, 1004, 4, 553, 1004, 60);
  glass.addColorStop(0, "#e9a547");
  glass.addColorStop(0.5, "#e6c48c");
  glass.addColorStop(1, "#ece1c8");
  c.fillStyle = glass;
  c.fill();
  c.save();
  c.clip();
  dome(553, 1046, 30, 52, "#f0b75a", "#c98232");
  c.beginPath();
  for (let x = 494; x < 625; x += 14.5) {
    c.moveTo(x, 1046);
    c.lineTo(x, 960);
  }
  c.moveTo(470, 1004);
  c.lineTo(635, 1004);
  c.moveTo(470, 1025);
  c.lineTo(635, 1025);
  for (const d of [9, 19, 29]) {
    c.moveTo(480, 1004 + d * 0.15);
    c.bezierCurveTo(492, 986 + d, 530, 978 + d, 552, 966 + d);
    c.bezierCurveTo(574, 978 + d, 612, 986 + d, 625, 1004 + d * 0.15);
  }
  c.lineWidth = 1.3;
  c.strokeStyle = IRON;
  c.stroke();
  c.restore();
  c.beginPath();
  c.moveTo(530, 1046);
  c.lineTo(530, 1012);
  c.quadraticCurveTo(531, 994, 553, 988);
  c.quadraticCurveTo(575, 994, 576, 1012);
  c.lineTo(576, 1046);
  for (const x of [494, 597]) {
    c.moveTo(x, 1046);
    c.lineTo(x, 1020);
    c.quadraticCurveTo(x + 7, 1008, x + 14, 1020);
    c.lineTo(x + 14, 1046);
  }
  c.moveTo(552, 966);
  c.lineTo(552, 958);
  c.lineWidth = 2.4;
  c.strokeStyle = IRON;
  c.stroke();
  house();
  c.stroke();
  tree(552, 957, 2.2, IRON);
  for (let x = 487; x < 622; x += 7) tree(x, 1037 + ((x * 13) % 3), 5, (x * 7) % 13 > 6 ? "#e2553a" : "#f2704a");

  // the metro: its viaduct on piers with hedges between, and the train, nose to the left
  rect(615, 1027, 235, 11, "#dcd6de");
  rect(615, 1036, 235, 3, "#a9a2ae");
  for (const x of [640, 697, 757, 820]) rect(x, 1039, 12, G - 1039, "#cfc9d3");
  for (const [x, w] of [[615, 25], [652, 45], [709, 48], [769, 51], [832, 18]]) {
    c.beginPath();
    c.roundRect(x + 2, 1042, w - 4, G - 1042, [5, 5, 0, 0]);
    c.fillStyle = SHADE;
    c.fill();
  }
  c.beginPath();
  c.moveTo(851, 1003);
  c.lineTo(686, 1003);
  c.bezierCurveTo(673, 1003, 665, 1013, 665, 1021);
  c.lineTo(665, 1026);
  c.lineTo(851, 1026);
  c.closePath();
  const body = c.createLinearGradient(0, 1003, 0, 1026);
  body.addColorStop(0, "#f09c92");
  body.addColorStop(1, "#cf5e66");
  c.fillStyle = body;
  c.fill();
  c.lineWidth = 1;
  c.strokeStyle = "#a54a58";
  c.stroke();
  rect(692, 1009, 159, 8, "#3d2b36");
  for (let x = 714; x < 851; x += 24) rect(x, 1009, 2, 8, "#ec938b");
  shape([671, 1017, 679, 1008, 688, 1008, 688, 1017], "#3d2b36");
  rect(666, 1021, 185, 1.6, "#fbe2de");

  // the hedge along the ground
  // the palace stands deep in trees, as on the card
  for (const [x, y, r] of [[8, 1032, 20], [42, 1036, 17], [78, 1044, 12], [108, 1041, 15], [148, 1040, 15], [186, 1045, 11], [226, 1047, 8], [458, 1040, 11], [608, 1042, 9]]) clump(x, y, r);
  for (const [top, fill] of [[10, OLIVE], [6, SHADE]] as const) {
    c.beginPath();
    c.moveTo(0, G);
    for (let x = 0; x <= 616; x += 4) c.lineTo(x, G - top - 2.5 * Math.sin(x * 0.23 + top) - 1.5 * Math.sin(x * 0.07));
    c.lineTo(616, G);
    c.fillStyle = fill;
    c.fill();
  }
};

// a curly brace as printed: blocky arms and a square nib, blue with an ink outline. x is its back's outer edge, dir 1 a "{"
const bracePts = (x: number, dir: number) =>
  [[0, 113, 20], [52, 113, 5], [52, 151, 5], [30, 151, 5], [30, 274, 5], [52, 274, 5], [52, 313, 5], [0, 313, 20], [0, 233, 4], [-18, 233, 4], [-18, 195, 4], [0, 195, 4]].map(([dx, y, r]) => [x + dx * dir, y, r]);

function drawFront(c: Ctx, t: { name: string; role: string; city: string; year: string; font: string; foil: boolean }) {
  c.save();
  c.fillStyle = PAPER;
  c.fillRect(0, 0, CARD_PX[0], CARD_PX[1]);
  c.scale(CARD_PX[0] / 850, CARD_PX[1] / 1240);
  c.lineJoin = "round";
  c.lineCap = "round";
  for (const [x, dir] of [[90, 1], [771, -1]]) {
    roundPoly(c, bracePts(x, dir));
    c.fillStyle = BLUE;
    c.fill();
    c.lineWidth = 3.2;
    c.strokeStyle = INK;
    c.stroke();
  }
  fitText(c, "DevFest", 431, 212, 154, 700, t.font, 540, t.foil ? "#e4e7ee" : INK); // foil is laid on a silver base
  pill(c, 165, 237, 530, 77, 38.5, CREAM);
  fitText(c, t.city, 432, 287, 37, 400, t.font, 470);
  // three circles, outlined as one shape
  c.beginPath();
  for (const x of [112, 192, 272]) {
    c.moveTo(x + 42, 398);
    c.arc(x, 398, 42, 0, Math.PI * 2);
  }
  c.lineWidth = 5;
  c.strokeStyle = INK;
  c.stroke();
  c.fillStyle = PURPLE;
  c.fill();
  c.beginPath();
  c.moveTo(340, 400);
  c.lineTo(620, 400);
  c.moveTo(572, 362);
  c.quadraticCurveTo(586, 396, 622, 400);
  c.quadraticCurveTo(586, 404, 572, 437);
  c.lineWidth = 3;
  c.stroke();
  pill(c, 645, 364, 142, 78, 39, BLUE);
  fitText(c, t.year, 716, 414, 36, 400, t.font, 116);
  pill(c, 97, 547, 673, 300, 22, CREAM);
  pill(c, 248, 501, 372, 89, 44.5, BLUE);
  fitText(c, t.role, 434, 562, 50, 400, t.font, 330);
  // a name too wide for one line breaks at the space nearest its middle before it shrinks
  c.font = `500 63px ${t.font}`;
  const words = t.name.split(" ");
  if (c.measureText(t.name).width > 620 && words.length > 1) {
    let cut = 1;
    for (let i = 1; i < words.length; i++) if (Math.abs(words.slice(0, i).join(" ").length - t.name.length / 2) < Math.abs(words.slice(0, cut).join(" ").length - t.name.length / 2)) cut = i;
    fitText(c, words.slice(0, cut).join(" "), 434, 680, 56, 500, t.font, 620);
    fitText(c, words.slice(cut).join(" "), 434, 748, 56, 500, t.font, 620);
  } else fitText(c, t.name, 434, 719, 63, 500, t.font, 620);
  c.fillStyle = "#f1f3f7";
  c.fillRect(0, GROUND, 850, 1240 - GROUND);
  // the skyline is drawn on its own layer, mottled with dabs of light and shade like the card's painted original, and
  // laid on with a soft dark edge
  const k = CARD_PX[0] / 850, sky = document.createElement("canvas");
  sky.width = CARD_PX[0];
  sky.height = Math.ceil(200 * k);
  const s = sky.getContext("2d")!;
  s.scale(k, k);
  s.translate(0, -860);
  skyline(s);
  s.globalCompositeOperation = "source-atop";
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 7000; i++) {
    s.beginPath();
    s.ellipse(rnd() * 850, 870 + rnd() * 185, 0.8 + rnd() * 2, 0.5 + rnd() * 0.9, rnd() * Math.PI, 0, Math.PI * 2);
    s.fillStyle = rnd() < 0.5 ? "rgba(255,238,205,0.09)" : "rgba(70,32,8,0.09)";
    s.fill();
  }
  const fall = s.createLinearGradient(0, 960, 0, GROUND);
  fall.addColorStop(0, "rgba(70,32,8,0)");
  fall.addColorStop(1, "rgba(70,32,8,0.16)");
  s.fillStyle = fall;
  s.fillRect(0, 960, 850, GROUND - 960);
  c.save();
  c.shadowColor = "rgba(60,32,14,0.7)";
  c.shadowBlur = 2 * k;
  c.drawImage(sky, 0, 860, 850, sky.height / k);
  c.restore();
  gdgMark(c, 98, 1096, 82, GDG_CARD);
  fitText(c, "Google Developer Groups", 262, 1128, 44, 400, t.font, 560, "#34373e", "left");
  c.font = `400 27.6px ${t.font}`;
  c.textAlign = "left";
  c.fillStyle = "#8a93a8";
  c.fillText("Cloud", 262, 1170);
  const cw = c.measureText("Cloud ").width;
  c.fillStyle = "#3a3d44";
  c.fillText(`• ${t.city}`, 262 + cw, 1170);
  c.restore();
}
// where foil goes on the "foil" finish: the wordmark
function drawFoilMask(c: Ctx, font: string) {
  c.fillStyle = "#000";
  c.fillRect(0, 0, CARD_PX[0], CARD_PX[1]);
  c.save();
  c.scale(CARD_PX[0] / 850, CARD_PX[1] / 1240);
  fitText(c, "DevFest", 431, 212, 154, 700, font, 540, "#fff");
  c.restore();
}

// ---- the strap print: 20 mm wide, repeating every 300 mm, measured from the strap's end (the bottom of the texture).
// From the end up: the GDG mark, "Google Developer Groups / Cloud • Bengaluru" reading upward, then the line icons
// (scallops, asterisk, arrow, globe) in navy on white.
const STRAP_W = 0.02, STRAP_REPEAT = 0.3, STRAP_PX = [256, 3840] as const;
function drawStrap(c: Ctx, font: string) {
  const [w, h] = STRAP_PX;
  const mm = h / 300;
  c.fillStyle = "#f4f2ee";
  c.fillRect(0, 0, w, h);
  // the woven edges roll slightly and catch shade, which is what keeps a white strap readable on a white page
  const edge = c.createLinearGradient(0, 0, w, 0);
  edge.addColorStop(0, "rgba(60,55,50,0.28)");
  edge.addColorStop(0.07, "rgba(60,55,50,0)");
  edge.addColorStop(0.93, "rgba(60,55,50,0)");
  edge.addColorStop(1, "rgba(60,55,50,0.28)");
  c.fillStyle = edge;
  c.fillRect(0, 0, w, h);
  const at = (fromEnd: number) => h - (fromEnd + 22) * mm; // measured from the crimp cap's top, 22 mm up from the strap's end
  // the GDG mark, turned to read along the strap
  c.save();
  c.translate(w * 0.5, at(9));
  c.rotate(-Math.PI / 2);
  gdgMark(c, -0.84 * 108, -54, 108, GDG, "#1e2440");
  c.restore();
  // the wordmark, reading bottom to top, with the chapter line under it
  c.save();
  c.translate(w * 0.47, at(19.5));
  c.rotate(-Math.PI / 2);
  c.textAlign = "left";
  c.font = `500 ${6 * mm}px ${font}`;
  c.fillStyle = "#16181d";
  c.fillText("Google Developer Groups", 0, 0);
  c.font = `500 ${3.7 * mm}px ${font}`;
  c.fillStyle = "#4285f4";
  c.fillText("Cloud", 0, 5.6 * mm);
  const cw = c.measureText("Cloud ").width;
  c.fillStyle = "#16181d";
  c.fillText("• Bengaluru", cw, 5.6 * mm);
  c.restore();
  // line icons
  c.strokeStyle = "#1e2440";
  c.lineWidth = 0.45 * mm;
  c.lineCap = "round";
  const cx = w / 2;
  const scallops = (y: number) => {
    c.beginPath();
    for (let i = 0; i < 3; i++) c.arc(cx - 1.5 * mm, y - i * 9 * mm, 4.5 * mm, Math.PI / 2, -Math.PI / 2, true);
    c.stroke();
  };
  const asterisk = (y: number) => {
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 4;
      c.moveTo(cx - Math.cos(a) * 5 * mm, y - Math.sin(a) * 5 * mm);
      c.lineTo(cx + Math.cos(a) * 5 * mm, y + Math.sin(a) * 5 * mm);
    }
    c.stroke();
  };
  const arrow = (y: number, up: boolean) => {
    const s = up ? -1 : 1;
    c.beginPath();
    c.moveTo(cx, y - s * 14 * mm);
    c.lineTo(cx, y + s * 14 * mm);
    c.moveTo(cx - 4 * mm, y + s * 9 * mm);
    c.quadraticCurveTo(cx - 1 * mm, y + s * 11 * mm, cx, y + s * 14 * mm);
    c.quadraticCurveTo(cx + 1 * mm, y + s * 11 * mm, cx + 4 * mm, y + s * 9 * mm);
    c.stroke();
  };
  const globe = (y: number) => {
    c.beginPath();
    c.arc(cx, y, 6 * mm, 0, Math.PI * 2);
    c.moveTo(cx - 6 * mm, y);
    c.lineTo(cx + 6 * mm, y);
    c.moveTo(cx, y - 6 * mm);
    c.lineTo(cx, y + 6 * mm);
    c.ellipse(cx, y, 2.6 * mm, 6 * mm, 0, 0, Math.PI * 2);
    c.moveTo(cx - 5.2 * mm, y - 3 * mm);
    c.lineTo(cx + 5.2 * mm, y - 3 * mm);
    c.moveTo(cx - 5.2 * mm, y + 3 * mm);
    c.lineTo(cx + 5.2 * mm, y + 3 * mm);
    c.stroke();
  };
  globe(at(118));
  scallops(at(140));
  asterisk(at(180));
  arrow(at(212), false);
  globe(at(252));
  scallops(at(272));
}

// ---- sound: a soft tick when grabbed, a brass clink when the hardware is jerked
type Sounds = { tick: () => void; clink: (v: number) => void; close: () => void };
function createSounds(): Sounds | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ac = new AC();
  const out = ac.createGain();
  out.gain.value = 0.5;
  out.connect(ac.destination);
  const ping = (freqs: number[], gain: number, decay: number) => {
    if (ac.state === "suspended") ac.resume();
    const t = ac.currentTime;
    for (const [i, f] of freqs.entries()) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.02);
      g.gain.setValueAtTime(gain / (i + 1), t);
      g.gain.exponentialRampToValueAtTime(1e-4, t + decay / (1 + i * 0.4));
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + decay);
    }
  };
  return {
    tick: () => ping([1900, 3400], 0.05, 0.05),
    clink: (v) => ping([2730, 4090, 6370], Math.min(0.12, 0.03 + v * 0.05), 0.22),
    close: () => void ac.close(),
  };
}

const DEFAULT_FONT = '"Google Sans", "Product Sans", system-ui, sans-serif';
const G = -9.81; // real gravity, real sizes (metres): the swing has the period of the badge on your neck
const STEP = 1 / 120, ITER = 18, SEGS = 22, SUB = 3;

/**
 * The GDG DevFest Bengaluru 2026 attendee badge on its lanyard, in three.js, with real physics: grab the card (or a strap)
 * anywhere and pull, swing or flip it; let go and it swings back on its straps and settles. Straps are Verlet ropes, the
 * card is a rigid body tied to them through the clasps, at real size under real gravity. The hardware (card, swivel snap
 * hooks, D-rings, crimp caps) is a Blender model; the print is drawn here, so name, role, city and year are props.
 * The loop runs only while the badge is on screen and moving. Reduced motion: it does not swing in, and swings die fast.
 */
export function LanyardBadge({ name = "Vaibhav Tomar", role = "Attendee", city = "Bengaluru", year = "2026", finish = "print", model = "/models/lanyard-badge.gltf", paused = false, sound = true, className, style, ...rest }: LanyardBadgeProps) {
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

  useEffect(() => {
    const box = root.current;
    if (!box) return;
    let dead = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      const font = getComputedStyle(box).getPropertyValue("--lanyard-badge-font").trim() || DEFAULT_FONT;
      await Promise.all([400, 500, 600, 700].map((w) => document.fonts?.load(`${w} 40px ${font}`).catch(() => [])));
      let gltf: Awaited<ReturnType<InstanceType<typeof GLTFLoader>["loadAsync"]>>;
      try {
        gltf = await new GLTFLoader().loadAsync(model);
      } catch {
        if (!dead) setFailed(true);
        return;
      }
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
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      const canvas = renderer.domElement;
      canvas.className = "absolute inset-0 size-full cursor-grab touch-none active:cursor-grabbing";
      box.prepend(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      scene.environmentIntensity = 0.75;
      // polished brass needs contrast to mirror: a dim room with a window above, light strips at the sides and a soft lamp
      // behind the viewer, so faces flash bright and dark as they turn
      const studio = new THREE.Scene();
      studio.background = new THREE.Color(0x221c17);
      for (const [w, h, x, y, z, v] of [[5, 2, 0, 4, 1.5, 5], [0.5, 5, -4, 0.5, 1, 3], [0.5, 5, 4, 0, -1, 2], [2.2, 2.6, 1.4, 0.6, 4, 2.6]]) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff8ec).multiplyScalar(v), side: THREE.DoubleSide }));
        m.position.set(x, y, z);
        m.lookAt(0, 0, 0);
        studio.add(m);
      }
      const metalEnv = pmrem.fromScene(studio, 0.02).texture;
      studio.traverse((o) => {
        const m = o as Three.Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (m.material as Three.Material).dispose();
        }
      });
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(0.3, 0.8, 1);
      scene.add(key, new THREE.AmbientLight(0xffffff, 0.35));
      const camera = new THREE.PerspectiveCamera(26, 1, 0.01, 10);

      // textures drawn from the props
      const textures: Three.Texture[] = [env, metalEnv];
      const paint = (w: number, h: number, draw: (c: Ctx) => void, color = true) => {
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        draw(cv.getContext("2d")!);
        const t = new THREE.CanvasTexture(cv);
        if (color) t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        textures.push(t);
        return t;
      };
      const front = paint(...CARD_PX, (c) => drawFront(c, { name, role, city, year, font, foil: finish === "foil" }));
      front.flipY = false; // glTF UVs run top-down
      const strapTex = paint(...STRAP_PX, (c) => drawStrap(c, font));
      strapTex.wrapT = THREE.RepeatWrapping;

      // foil: metal and thin film only where the mask is white, so the ink and paper around it stay matte
      const foil = (mask: Three.Texture) => ({ iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessMinimum: 200, iridescenceThicknessMaximum: 700, iridescenceMap: mask, metalness: 1, metalnessMap: mask });
      // materials, by the names the Blender model gives them
      const mats: Record<string, Three.Material> = {
        front: new THREE.MeshPhysicalMaterial({
          map: front,
          roughness: 0.42,
          clearcoat: 0.25,
          clearcoatRoughness: 0.35,
          ...(finish === "foil" ? foil(Object.assign(paint(...CARD_PX, (c) => drawFoilMask(c, font), false), { flipY: false })) : {}),
        }),
        back: new THREE.MeshPhysicalMaterial({ color: 0xf2f3f6, roughness: 0.5, clearcoat: 0.2 }),
        edge: new THREE.MeshStandardMaterial({ color: 0xe8e8e4, roughness: 0.8 }),
        // polished brass plating (clasps, D-rings, crimp caps), mirroring the contrasty room above
        gold: new THREE.MeshStandardMaterial({ color: 0xe8cd86, metalness: 1, roughness: 0.1, envMap: metalEnv, envMapIntensity: 1.1 }),
        strap: new THREE.MeshStandardMaterial({ color: 0xf1efea, roughness: 0.6 }),
        ink: new THREE.MeshStandardMaterial({ color: 0x1b1b22, roughness: 0.8 }),
      };
      // and the foil's diffraction rainbow: bands of spectrum across the letters that slide through the colours as the card
      // turns to and from you (hue from the view angle and the place on the foil)
      if (finish === "foil")
        mats.front.onBeforeCompile = (sh) => {
          sh.fragmentShader = sh.fragmentShader.replace(
            "#include <opaque_fragment>",
            `float foilMask = texture2D(metalnessMap, vMetalnessMapUv).b;
            float foilAng = dot(normal, normalize(vViewPosition));
            vec3 foilHue = 0.5 + 0.5 * cos(6.2832 * (foilAng * 6.0 + dot(vMetalnessMapUv, vec2(2.4, 1.2)) + vec3(0.0, 0.33, 0.67)));
            outgoingLight = mix(outgoingLight, outgoingLight * 0.45 + foilHue * (0.3 + 0.45 * foilAng * foilAng), foilMask);
            #include <opaque_fragment>`,
          );
        };
      const nodes: Record<string, Three.Object3D> = {};
      gltf.scene.traverse((o) => {
        nodes[o.name] = o;
        const m = o as Three.Mesh;
        if (m.isMesh) {
          const old = m.material as Three.Material;
          m.material = mats[old.name] ?? mats.edge;
          old.dispose();
        }
      });
      const card = nodes.card, holeL = nodes.hole_L.position.clone(), holeR = nodes.hole_R.position.clone();
      const hookOff = nodes.clasp_hook.position.clone(), ringDrop = -nodes.dring_bottom.position.y;
      const claspLen = hookOff.length();
      // the J's bottom sits a little to the side of the eye, so the clasp is turned to put it under the eye's pull line
      const qHook = new THREE.Quaternion().setFromUnitVectors(hookOff.clone().normalize(), new THREE.Vector3(0, -1, 0));
      card.position.set(0, 0, 0);
      scene.add(card);
      const pair = (n: string) => [nodes[n], nodes[n].clone()].map((o) => (scene.add(o), o));
      const clasps = pair("clasp"), rings = pair("dring"), caps = pair("cap");
      const H = 0.138;

      // ---- particles: two straps (top pinned), a D-ring point each, and the card as a rigid tetrahedron
      const N = SEGS + 1;
      const P: Three.Vector3[] = [], Q: Three.Vector3[] = [], W: number[] = []; // position, previous position, inverse mass
      const add = (p: Three.Vector3, mass: number) => (P.push(p.clone()), Q.push(p.clone()), W.push(mass ? 1 / mass : 0), P.length - 1);
      const cons: [number, number, number, number][] = []; // a, b, rest length, stiffness
      const link = (a: number, b: number, k = 1) => cons.push([a, b, P[a].distanceTo(P[b]), k]);
      const local = [holeL.clone(), holeR.clone(), new THREE.Vector3(0, -H / 2 + 0.01, 0), new THREE.Vector3(0, 0, 0.03)];
      const C = local.map((p, i) => add(p, i === 3 ? 0.004 : 0.0016)); // the off-plane 4th point keeps the card from folding
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) link(C[i], C[j]);
      const straps: number[][] = [], rIdx: number[] = [];
      [holeL, holeR].forEach((hole, s) => {
        const ring = hole.clone().add(new THREE.Vector3(0, claspLen, 0));
        const end = ring.clone().add(new THREE.Vector3(0, ringDrop, 0));
        const top = new THREE.Vector3(hole.x * 2.4, end.y + 0.34, -0.02); // the straps splay out toward the shoulders
        const idx: number[] = [];
        for (let i = 0; i < N; i++) idx.push(add(top.clone().lerp(end, i / SEGS), i === 0 ? 0 : 0.00025));
        for (let i = 0; i < SEGS; i++) link(idx[i], idx[i + 1]);
        const r = add(ring, 0.003);
        link(idx[SEGS], r);
        link(r, C[s]);
        straps.push(idx);
        rIdx.push(r);
      });
      // ponytail: no strap-card or strap-strap collision; add sphere-swept checks if a strap ever visibly cuts the card
      const reduce = matchMedia("(prefers-reduced-motion: reduce)");
      // the badge arrives swinging (a real one is never still the moment it is let go)
      if (!reduce.matches) for (const i of C) Q[i].add(new THREE.Vector3(-0.0022, 0, 0.0012 * (i % 2 ? 1 : -1)));

      // grab: either a strap particle, or a point on the card held as a barycentric mix of the tetrahedron's four points
      let grab: { w: number[]; idx: number[]; target: Three.Vector3; plane: Three.Plane } | null = null;
      const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), corr = new THREE.Vector3();
      const step = (dt: number) => {
        const damp = reduce.matches ? 0.94 : 0.989;
        const g = G * dt * dt;
        for (let i = 0; i < P.length; i++) {
          if (!W[i]) continue;
          tmp.subVectors(P[i], Q[i]).multiplyScalar(damp).clampLength(0, 0.06);
          Q[i].copy(P[i]);
          P[i].add(tmp);
          P[i].y += g;
        }
        // air on the card's face: motion across the face is damped far more than motion along it (a flat card planes)
        tmp.subVectors(P[C[1]], P[C[0]]);
        tmp2.subVectors(P[C[2]], P[C[0]]);
        const n = tmp.cross(tmp2).normalize();
        for (const i of C) {
          tmp2.subVectors(P[i], Q[i]);
          P[i].addScaledVector(n, -tmp2.dot(n) * 0.012);
        }
        for (let it = 0; it < ITER; it++) {
          for (const [a, b, rest, k] of cons) {
            corr.subVectors(P[b], P[a]);
            const d = corr.length();
            const ws = W[a] + W[b];
            if (!d || !ws) continue;
            corr.multiplyScalar(((d - rest) / d / ws) * k);
            P[a].addScaledVector(corr, W[a]);
            P[b].addScaledVector(corr, -W[b]);
          }
          if (grab) {
            corr.set(0, 0, 0);
            grab.idx.forEach((i, j) => corr.addScaledVector(P[i], grab!.w[j]));
            corr.sub(grab.target);
            const sum = grab.w.reduce((s, w) => s + w * w, 0);
            grab.idx.forEach((i, j) => P[i].addScaledVector(corr, (-grab!.w[j] / sum) * 0.5));
          }
        }
      };

      // ---- the straps' ribbons: Catmull-Rom through the particles, twisting from facing the camera at the top to the
      // card's facing at the clasp
      const M = SEGS * SUB + 1;
      const ribbons = [0, 1].map(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(M * 6), 3));
        geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(M * 6), 3));
        const uv = new Float32Array(M * 4), index: number[] = [];
        const seg = P[straps[0][0]].distanceTo(P[straps[0][1]]);
        for (let i = 0; i < M; i++) {
          const v = ((M - 1 - i) / SUB) * seg / STRAP_REPEAT;
          uv.set([0, v, 1, v], i * 4);
          if (i < M - 1) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
        }
        geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        geo.setIndex(index);
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: strapTex, roughness: 0.55, side: THREE.DoubleSide }));
        mesh.frustumCulled = false;
        scene.add(mesh);
        return mesh;
      });
      const pts = Array.from({ length: M }, () => new THREE.Vector3());
      const up = new THREE.Vector3(0, 0, 1), qTwist = new THREE.Quaternion(), qPart = new THREE.Quaternion(), qId = new THREE.Quaternion();
      const basis = new THREE.Matrix4(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), cardN = new THREE.Vector3();
      const orient = (o: Three.Object3D, pos: Three.Vector3, yAxis: Three.Vector3, zHint: Three.Vector3) => {
        Y.copy(yAxis).normalize();
        Z.copy(zHint).addScaledVector(Y, -zHint.dot(Y)).normalize();
        X.crossVectors(Y, Z);
        basis.makeBasis(X, Y, Z);
        o.quaternion.setFromRotationMatrix(basis);
        o.position.copy(pos);
      };
      const sync = () => {
        // card from its tetrahedron
        const [a, b, c] = [P[C[0]], P[C[1]], P[C[2]]];
        X.subVectors(b, a).normalize();
        tmp.addVectors(a, b).multiplyScalar(0.5);
        Y.subVectors(tmp, c);
        Y.addScaledVector(X, -Y.dot(X)).normalize();
        Z.crossVectors(X, Y);
        cardN.copy(Z);
        basis.makeBasis(X, Y, Z);
        card.quaternion.setFromRotationMatrix(basis);
        card.position.copy(tmp).addScaledVector(Y, -holeL.y);
        for (let s = 0; s < 2; s++) {
          const idx = straps[s], ring = P[rIdx[s]], end = P[idx[SEGS]];
          orient(clasps[s], ring, tmp.subVectors(ring, P[C[s]]), cardN);
          clasps[s].quaternion.multiply(qHook);
          orient(rings[s], end, tmp.subVectors(end, ring), cardN);
          // ribbon points
          for (let i = 0; i < SEGS; i++) {
            const p0 = P[idx[Math.max(i - 1, 0)]], p1 = P[idx[i]], p2 = P[idx[i + 1]], p3 = P[idx[Math.min(i + 2, SEGS)]];
            for (let k = 0; k < SUB; k++) {
              const t = k / SUB, t2 = t * t, t3 = t2 * t;
              pts[i * SUB + k].set(0, 0, 0)
                .addScaledVector(p0, -0.5 * t3 + t2 - 0.5 * t)
                .addScaledVector(p1, 1.5 * t3 - 2.5 * t2 + 1)
                .addScaledVector(p2, -1.5 * t3 + 2 * t2 + 0.5 * t)
                .addScaledVector(p3, 0.5 * t3 - 0.5 * t2);
            }
          }
          pts[M - 1].copy(end);
          qTwist.setFromUnitVectors(up, cardN);
          const pos = ribbons[s].geometry.attributes.position as Three.BufferAttribute, nor = ribbons[s].geometry.attributes.normal as Three.BufferAttribute;
          let n = up;
          for (let i = 0; i < M; i++) {
            const t = pts[Math.min(i + 1, M - 1)], f = pts[Math.max(i - 1, 0)];
            Y.subVectors(f, t).normalize(); // tangent, pointing up the strap
            const u = i / (M - 1);
            qPart.slerpQuaternions(qId, qTwist, u * u * (3 - 2 * u));
            n = Z.copy(up).applyQuaternion(qPart);
            n.addScaledVector(Y, -n.dot(Y)).normalize();
            X.crossVectors(Y, n).multiplyScalar(STRAP_W / 2);
            pos.setXYZ(i * 2, pts[i].x - X.x, pts[i].y - X.y, pts[i].z - X.z);
            pos.setXYZ(i * 2 + 1, pts[i].x + X.x, pts[i].y + X.y, pts[i].z + X.z);
            nor.setXYZ(i * 2, n.x, n.y, n.z);
            nor.setXYZ(i * 2 + 1, n.x, n.y, n.z);
            if (i === M - 1) orient(caps[s], end, Y, n);
          }
          pos.needsUpdate = nor.needsUpdate = true;
        }
      };

      // ---- frame
      const resize = () => {
        const { width, height } = box.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // fit the card, the hardware and a stretch of strap: 0.30 m tall, at least 0.17 m wide
        const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const d = Math.max(0.3 / 2 / tan, 0.17 / 2 / tan / camera.aspect);
        camera.position.set(0, 0.045, d);
        camera.lookAt(0, 0.045, 0);
        camera.updateProjectionMatrix();
        render();
      };
      const render = () => renderer.render(scene, camera);
      let raf = 0, last = 0, acc = 0, seen = false, still = 0;
      const lastRing = [P[rIdx[0]].clone(), P[rIdx[1]].clone()], ringV = [0, 0];
      let clinkAt = 0;
      const frame = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        acc += dt;
        let moved = 0;
        while (acc >= STEP) {
          step(STEP);
          acc -= STEP;
          for (let i = 0; i < P.length; i++) moved = Math.max(moved, P[i].distanceToSquared(Q[i]));
          // a sudden change in the hardware's speed: the clasp knocks against the D-ring
          for (let s = 0; s < 2; s++) {
            const v = P[rIdx[s]].distanceTo(lastRing[s]) / STEP;
            if (Math.abs(v - ringV[s]) > 1.6 && now - clinkAt > 120 && live.current.sound) {
              audio.current ??= createSounds();
              audio.current?.clink(Math.abs(v - ringV[s]) / 4);
              clinkAt = now;
            }
            ringV[s] = v;
            lastRing[s].copy(P[rIdx[s]]);
          }
        }
        sync();
        render();
        still = moved < 1e-12 && !grab ? still + dt : 0;
        raf = seen && !(still > 0.5 && (live.current.paused || still > 2)) ? requestAnimationFrame(frame) : 0;
      };
      const start = () => {
        if (raf || !seen || dead) return;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };
      kick.current = start;

      // ---- pointer
      const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
      const aim = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
      };
      const camDir = new THREE.Vector3();
      const onDown = (e: PointerEvent) => {
        aim(e);
        const hits = ray.intersectObjects([card, ...ribbons, ...clasps], true);
        if (!hits.length) return;
        const h = hits[0];
        camera.getWorldDirection(camDir);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camDir.negate(), h.point);
        let w: number[], idx: number[];
        if ((ribbons as Three.Object3D[]).includes(h.object)) {
          // nearest strap particle
          let best = -1, bd = Infinity;
          for (const s of straps)
            for (const i of s) {
              const d = P[i].distanceToSquared(h.point);
              if (W[i] && d < bd) {
                bd = d;
                best = i;
              }
            }
          w = [1];
          idx = [best];
        } else {
          // the hit point in the tetrahedron's frame: solve p = a + u(b-a) + v(c-a) + t(d-a)
          const [a, b, c, d] = C.map((i) => P[i]);
          const m = new THREE.Matrix3().set(b.x - a.x, c.x - a.x, d.x - a.x, b.y - a.y, c.y - a.y, d.y - a.y, b.z - a.z, c.z - a.z, d.z - a.z).invert();
          const uvt = tmp.subVectors(h.point, a).applyMatrix3(m);
          w = [1 - uvt.x - uvt.y - uvt.z, uvt.x, uvt.y, uvt.z];
          idx = C;
        }
        grab = { w, idx, target: h.point.clone(), plane };
        canvas.setPointerCapture(e.pointerId);
        if (live.current.sound) {
          audio.current ??= createSounds();
          audio.current?.tick();
        }
        start();
      };
      const onMove = (e: PointerEvent) => {
        if (!grab) return;
        aim(e);
        if (ray.ray.intersectPlane(grab.plane, hit)) grab.target.copy(hit);
      };
      const onUp = (e: PointerEvent) => {
        grab = null;
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      };
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
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
      sync();
      resize();

      cleanup = () => {
        cancelAnimationFrame(raf);
        kick.current = () => {};
        ro.disconnect();
        io.disconnect();
        reduce.removeEventListener("change", onMq);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        canvas.removeEventListener("webglcontextlost", onLost);
        const done = new Set<unknown>();
        scene.traverse((o) => {
          const m = o as Three.Mesh;
          for (const r of [m.geometry, ...([] as Three.Material[]).concat(m.material ?? [])]) {
            if (r && !done.has(r)) {
              done.add(r);
              r.dispose();
            }
          }
        });
        textures.forEach((t) => t.dispose());
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
  }, [name, role, city, year, finish, model]);

  return (
    <div
      ref={root}
      role="img"
      aria-label={`${city} DevFest ${year} ${role.toLowerCase()} badge for ${name} on a lanyard. Drag it to swing it.`}
      className={cn("relative aspect-[3/4] w-full overflow-hidden", className)}
      style={style}
      {...rest}
    >
      {failed && (
        <span className="absolute inset-0 grid place-items-center text-center text-muted-foreground">
          {name}
          <br />
          {role}
        </span>
      )}
    </div>
  );
}
