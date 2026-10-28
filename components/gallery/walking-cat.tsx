"use client";

import { useEffect, useId, useRef } from "react";
import { VARIANTS } from "./cat-variants";

// The side-view cat that walks into the hero, drawn like the sitting one: every part exists twice (a fattened
// outline copy and a white copy inside the gradient mask) and one loop writes the same pose to both copies.
// The walk is driven by distance, not time: the gait phase is distance travelled / STRIDE, so a planted paw never
// slides and the legs slow down and settle together with the body. Legs are two bones (IK) plus a paw.
const BODY = "M70 104 C70 72 100 64 150 64 C200 64 230 74 230 106 C230 136 205 142 150 142 C100 142 70 136 70 104 Z";
const HEAD = [
  "M238 62 L240 36 L256 56 Z", // ears
  "M258 56 L270 34 L278 64 Z",
  "M232 84 C230 62 246 54 262 56 C282 58 288 74 284 90 C280 104 262 108 248 104 C238 100 233 94 232 84 Z", // skull
];
const EYE = "M262 80 a4.2 5 0 1 0 8.4 0 a4.2 5 0 1 0 -8.4 0Z";
const TAIL = "M76 100 C52 110 30 102 24 84 C20 72 28 64 36 66"; // carried low, tip curled up
const BLOB_AT = [
  [205, 90],
  [100, 100],
  [150, 150],
  [150, 60],
];
const OUTLINE = 4;

const GROUND = 184;
const HIP_Y = 106;
const LIFT_BODY = -16; // the torso rides this far above where it is drawn so the legs get length
const BONE = 44; // upper and lower leg
const PAW = 9;
const STRIDE = 90; // units travelled per full gait cycle
const STANCE = 0.65; // share of the cycle a paw is on the ground
const REACH = 29; // how far a paw swings either side of its hip
const LIFT = 12;
// lateral sequence (what cats do): left hind, left fore, right hind, right fore; far side first, near side last
const LEGS = [
  { hx: 102, off: 0, bend: 1 },
  { hx: 200, off: 0.25, bend: -1 },
  { hx: 92, off: 0.5, bend: 1 },
  { hx: 210, off: 0.75, bend: -1 },
];
// screen speed (px/s) and the ease-in / ease-out times
const CRUISE = 200;
const EASE_IN = 0.5;
const EASE_OUT = 1;
const SETTLE = 0.4;

/** Knee (or elbow) that puts a two-bone leg from the hip to the foot; `bend` 1 points it forward, -1 backward. */
function joint(hx: number, hy: number, fx: number, fy: number, bend: number) {
  const dx = fx - hx;
  const dy = fy - hy;
  const d = Math.min(Math.hypot(dx, dy), 2 * BONE - 0.01);
  const a = d / 2;
  const h = Math.sqrt(BONE * BONE - a * a);
  const ux = dx / Math.hypot(dx, dy);
  const uy = dy / Math.hypot(dx, dy);
  return [hx + ux * a + bend * h * uy, hy + uy * a - bend * h * ux];
}

export function WalkingCat({ onArrive, className = "h-36 sm:h-[180px]", outlineClass = "text-foreground", variant = 0 }: { onArrive?: () => void; className?: string; outlineClass?: string; variant?: number }) {
  const uid = useId().replace(/:/g, "");
  const look = VARIANTS[variant % VARIANTS.length];
  const wrap = useRef<HTMLDivElement>(null);
  const arrive = useRef(onArrive);
  useEffect(() => {
    arrive.current = onArrive;
  }, [onArrive]);

  useEffect(() => {
    const el = wrap.current;
    const svg = el?.querySelector("svg");
    if (!el || !svg) return;
    const nodes = new Map<string, Element[]>();
    svg.querySelectorAll("[data-k]").forEach((n) => {
      const k = n.getAttribute("data-k")!;
      nodes.set(k, [...(nodes.get(k) ?? []), n]);
    });
    const put = (k: string, attr: string, v: string) => nodes.get(k)?.forEach((n) => n.setAttribute(attr, v));

    const scale = svg.getBoundingClientRect().width / 300;
    const parent = el.parentElement!.getBoundingClientRect();
    const dist = parent.left + (parent.width + el.offsetWidth) / 2; // far enough that the whole cat starts off screen
    const cruiseLen = dist - (CRUISE * EASE_IN) / 2 - (CRUISE * EASE_OUT) / 2;
    const cruiseT = cruiseLen / CRUISE;
    const total = EASE_IN + cruiseT + EASE_OUT;

    const at = (t: number) => {
      if (t < EASE_IN) return [(CRUISE * t * t) / (2 * EASE_IN), (CRUISE * t) / EASE_IN];
      if (t < EASE_IN + cruiseT) return [(CRUISE * EASE_IN) / 2 + CRUISE * (t - EASE_IN), CRUISE];
      const s = Math.min(t - EASE_IN - cruiseT, EASE_OUT);
      return [(CRUISE * EASE_IN) / 2 + cruiseLen + CRUISE * s - (CRUISE * s * s) / (2 * EASE_OUT), CRUISE * (1 - s / EASE_OUT)];
    };

    const pose = (t: number) => {
      const [x, v] = at(t);
      el.style.translate = `${x - dist}px 0`;
      const g = Math.min(1, (2 * v) / CRUISE); // gait amplitude: full while walking, zero standing
      const p = x / scale / STRIDE;
      const bob = -1.6 * g * Math.cos(4 * Math.PI * p);
      put("body", "transform", `translate(0 ${bob + LIFT_BODY})`);
      put("head", "transform", `translate(-6 10) rotate(${2.5 * g * Math.sin(4 * Math.PI * p)} 258 90)`);
      put("tail", "transform", `rotate(${6 * g * Math.sin(2 * Math.PI * p - 1) + 4 * Math.sin(t * 1.5)} 76 100)`);
      LEGS.forEach((l, i) => {
        const q = (((p + l.off) % 1) + 1) % 1;
        let fx: number;
        let lift = 0;
        if (q < STANCE) fx = REACH * g * (1 - (2 * q) / STANCE);
        else {
          const u = (q - STANCE) / (1 - STANCE);
          fx = REACH * g * (-1 + 2 * u * u * (3 - 2 * u));
          lift = LIFT * g * Math.sin(Math.PI * u);
        }
        const hy = HIP_Y + bob * 0.6;
        const ax = l.hx + fx;
        const ay = GROUND - lift;
        const [kx, ky] = joint(l.hx, hy, ax, ay, l.bend);
        put(`up${i}`, "d", `M${l.hx} ${hy} L${kx} ${ky}`);
        put(`lo${i}`, "d", `M${kx} ${ky} L${ax} ${ay} L${ax + PAW} ${ay}`);
      });
    };

    let raf = 0;
    let t0: number | undefined;
    const frame = (now: number) => {
      t0 ??= now;
      const t = (now - t0) / 1000;
      pose(Math.min(t, total));
      if (t < total + SETTLE) raf = requestAnimationFrame(frame);
      else arrive.current?.();
    };
    pose(0);
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const leg = (i: number, mask: boolean) => (
    <g key={i}>
      <path data-k={`up${i}`} fill="none" stroke={mask ? "white" : undefined} strokeWidth={14 + (mask ? 0 : OUTLINE)} />
      <path data-k={`lo${i}`} fill="none" stroke={mask ? "white" : undefined} strokeWidth={10 + (mask ? 0 : OUTLINE)} />
    </g>
  );
  const parts = (mask: boolean) => (
    <>
      {[0, 1].map((i) => leg(i, mask))}
      <g data-k="body">
        <g data-k="tail">
          <path d={TAIL} fill="none" stroke={mask ? "white" : undefined} strokeWidth={11 + (mask ? 0 : OUTLINE)} />
        </g>
        <path d={BODY} fill={mask ? "white" : undefined} strokeWidth={mask ? 0 : OUTLINE} />
        <g data-k="head">
          {HEAD.map((d) => (
            <path key={d} d={d} fill={mask ? "white" : undefined} strokeWidth={mask ? 0 : OUTLINE} />
          ))}
          {mask && <path d={EYE} fill="black" className="cat-blink" />}
        </g>
      </g>
      {[2, 3].map((i) => leg(i, mask))}
    </>
  );

  return (
    <div ref={wrap} className="relative" style={{ translate: "-150vw 0" }}>
      <svg viewBox="0 0 300 200" aria-hidden className={`aspect-3/2 overflow-visible ${className}`}>
        <defs>
          <mask id={`walk-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="200">
            <g strokeLinecap="round" strokeLinejoin="round">
              {parts(true)}
            </g>
          </mask>
          <filter id={`walkblur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <g className={outlineClass} fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
          {parts(false)}
        </g>
        <g mask={`url(#walk-${uid})`}>
          <rect width="300" height="200" fill={look.base} />
          <g className="cat-spin" filter={`url(#walkblur-${uid})`} style={{ transformOrigin: "150px 100px", transformBox: "view-box" }}>
            {BLOB_AT.map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="88" fill={look.blobs[i]} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
