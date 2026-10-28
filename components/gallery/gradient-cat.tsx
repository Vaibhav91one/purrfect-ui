"use client";

import { useReducedMotion, useSpring } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { EYES, VARIANTS } from "./cat-variants";

// A sitting cat, seen from behind and looking up, drawn as separate parts. Every part is rendered twice
// (a fattened foreground copy = outline, and a white copy inside the gradient mask), so anything that moves
// has to move in both: tail and eye by CSS class, the head group by the shared spring below.
export const TAIL = "M128 222 C176 232 204 222 206 192 C208 166 198 150 184 154";
export const BODY = "M58 228 C44 196 50 150 74 120 C88 102 118 104 132 124 C152 152 156 196 142 228 C132 244 68 244 58 228 Z";
export const PAWS = "M72 236 a12 8 0 1 0 24 0 a12 8 0 1 0 -24 0Z M104 236 a12 8 0 1 0 24 0 a12 8 0 1 0 -24 0Z";
export const HEAD = [
  "M104 52 C112 40 120 32 128 26 C130 40 131 58 126 80 Z", // far ear
  "M64 70 C60 52 62 40 66 30 C76 38 84 46 88 56 Z", // near ear
  "M60 90 C58 66 74 54 94 54 C116 54 128 70 126 92 C124 112 108 120 92 118 C72 116 61 106 60 90 Z", // skull
];
const TAIL_PIVOT = "132px 222px";
const NECK = "92px 118px";
const OUTLINE = 4; // px of outline drawn outside each part

// where each of the four gradient blobs sits (its colour comes from the variant)
export const BLOB_AT = [
  [62, 96],
  [178, 100],
  [120, 196],
  [150, 150],
];

export function GradientCat({ className = "h-44 sm:h-56", outlineClass = "text-foreground", variant = 0 }: { className?: string; outlineClass?: string; variant?: number }) {
  const look = VARIANTS[variant % VARIANTS.length];
  const eye = EYES[look.eye];
  const uid = useId().replace(/:/g, ""); // each cat needs its own mask and filter ids
  const svg = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const turn = useSpring(0, { stiffness: 120, damping: 18 });

  // head turns toward the pointer (fine pointers only), written straight to both head groups
  useEffect(() => {
    const heads = svg.current?.querySelectorAll<SVGGElement>("[data-head]");
    const off = turn.on("change", (v) => heads?.forEach((h) => (h.style.rotate = `${v}deg`)));
    if (reduce || !matchMedia("(pointer: fine)").matches) return off;
    const move = (e: PointerEvent) => {
      const r = svg.current?.getBoundingClientRect();
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      turn.set(Math.max(-8, Math.min(8, dx * 24)));
    };
    addEventListener("pointermove", move);
    return () => { off(); removeEventListener("pointermove", move); };
  }, [reduce, turn]);

  const head = (fill: boolean) => (
    <g data-head style={{ transformOrigin: NECK }}>
      {HEAD.map((d) => <path key={d} d={d} fill={fill ? "white" : undefined} strokeWidth={fill ? 0 : OUTLINE} />)}
      {fill && <path d={eye.d} fill={eye.stroke ? "none" : "black"} stroke={eye.stroke ? "black" : undefined} strokeWidth={eye.stroke} strokeLinecap="round" strokeLinejoin="round" className="cat-blink" />}
    </g>
  );

  return (
    <svg ref={svg} viewBox="0 0 240 250" aria-hidden className={`aspect-240/250 ${className}`}>
      <defs>
        <mask id={`cat-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="250">
          <path d={TAIL} fill="none" stroke="white" strokeWidth="13" strokeLinecap="round" className="cat-tail" style={{ transformOrigin: TAIL_PIVOT }} />
          <path d={BODY} fill="white" />
          <path d={PAWS} fill="white" />
          {head(true)}
        </mask>
        <filter id={`catblur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      {/* outline: every part again in the foreground colour, fattened; the gradient covers the inner half */}
      <g className={outlineClass} fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round" strokeWidth={OUTLINE}>
        <path d={TAIL} fill="none" strokeWidth={13 + OUTLINE} className="cat-tail" style={{ transformOrigin: TAIL_PIVOT }} />
        <path d={BODY} />
        <path d={PAWS} />
        {head(false)}
      </g>
      <g mask={`url(#cat-${uid})`}>
        <rect width="240" height="250" fill={look.base} />
        <g className="cat-spin" filter={`url(#catblur-${uid})`} style={{ transformOrigin: "120px 130px", transformBox: "view-box" }}>
          {BLOB_AT.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="62" fill={look.blobs[i]} />
          ))}
        </g>
      </g>
    </svg>
  );
}
