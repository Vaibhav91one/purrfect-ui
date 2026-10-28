"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import { VARIANTS } from "./cat-variants";

// A cat in a play-bow batting a ball, drawn like the sleeping one: every part twice (a fattened outline copy and a
// white copy inside the gradient mask) with the same CSS class on both, so they stay in step. The ball is the one
// unmasked part. Everything moves with CSS keyframes (see `.play-*` in globals.css); hovering `trigger` speeds it up.
const BODY = "M36 96 C30 70 56 56 86 60 C118 64 142 82 150 104 C152 116 140 122 124 122 L56 122 C42 122 38 112 36 96 Z";
const HEAD = [
  "M154 82 L152 62 L168 74 Z", // ears
  "M178 76 L190 60 L196 80 Z",
  "M150 100 C148 84 160 76 176 78 C194 80 202 92 198 106 C194 118 178 122 166 120 C156 118 151 110 150 100 Z", // skull
];
const TAIL = "M38 90 C16 86 8 62 22 44";
const HIND = "M60 120 H98"; // back paws on the ground
const PAW = "M146 108 L170 122"; // front leg; swats about its shoulder
const OUTLINE = 4;
const BALL = { x: 228, y: 112, r: 11 };

export function PlayingCat({ className = "h-16 sm:h-20", outlineClass = "text-foreground", variant = 4, trigger }: { className?: string; outlineClass?: string; variant?: number; trigger?: RefObject<HTMLElement | null> }) {
  const look = VARIANTS[variant % VARIANTS.length];
  const uid = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);

  // hovering the button the cat sits on speeds the game up
  useEffect(() => {
    const el = trigger?.current;
    const s = svg.current;
    if (!el || !s) return;
    const on = () => s.setAttribute("data-play", "fast");
    const off = () => s.setAttribute("data-play", "");
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
    };
  }, [trigger]);

  const line = (d: string, w: number, cls: string, mask: boolean, pivot?: string) => (
    <path d={d} fill="none" stroke={mask ? "white" : undefined} strokeWidth={w + (mask ? 0 : OUTLINE)} strokeLinecap="round" className={cls} style={pivot ? { transformOrigin: pivot, transformBox: "view-box" } : undefined} />
  );
  const parts = (mask: boolean) => (
    <>
      {line(TAIL, 10, "play-tail", mask, "38px 90px")}
      {line(HIND, 12, "", mask)}
      <path d={BODY} fill={mask ? "white" : undefined} strokeWidth={mask ? 0 : OUTLINE} />
      <g className="play-head" style={{ transformOrigin: "160px 112px", transformBox: "view-box" }}>
        {HEAD.map((d) => (
          <path key={d} d={d} fill={mask ? "white" : undefined} strokeWidth={mask ? 0 : OUTLINE} />
        ))}
        {mask && <path d="M178 96 a4.4 4.8 0 1 0 8.8 0 a4.4 4.8 0 1 0 -8.8 0Z" fill="black" />}
      </g>
      {line(PAW, 11, "play-paw", mask, "146px 108px")}
    </>
  );

  return (
    <svg ref={svg} viewBox="0 0 260 140" aria-hidden data-play="" className={`aspect-[260/140] overflow-visible ${className}`}>
      <defs>
        <mask id={`play-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="260" height="140">
          {parts(true)}
        </mask>
        <filter id={`playblur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <g className={outlineClass} fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        {parts(false)}
      </g>
      <g mask={`url(#play-${uid})`}>
        <rect width="260" height="140" fill={look.base} />
        <g className="cat-spin" filter={`url(#playblur-${uid})`} style={{ transformOrigin: "130px 80px", transformBox: "view-box" }}>
          {[[60, 90], [180, 90], [120, 118], [150, 70]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="70" fill={look.blobs[i]} />
          ))}
        </g>
      </g>
      <ellipse cx={BALL.x} cy="126" rx="12" ry="2.5" fill="currentColor" fillOpacity="0.25" className={`play-shadow ${outlineClass}`} style={{ transformOrigin: `${BALL.x}px 126px`, transformBox: "view-box" }} />
      <g className="play-ball" style={{ transformOrigin: `${BALL.x}px ${BALL.y + BALL.r}px`, transformBox: "view-box" }}>
        <circle cx={BALL.x} cy={BALL.y} r={BALL.r} fill={look.blobs[0]} className={outlineClass} stroke="currentColor" strokeWidth="3" />
        <path d={`M${BALL.x - 8} ${BALL.y - 4} Q${BALL.x} ${BALL.y - 10} ${BALL.x + 8} ${BALL.y - 4}`} fill="none" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
