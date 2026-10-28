"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { VARIANTS } from "./cat-variants";

// A cat curled up asleep, drawn like the sitting one: every part twice (a fattened outline copy and a white copy
// inside the gradient mask). Everything that moves is CSS (breathing, tail swing, the head lifting), switched by
// `data-awake` on the svg, so both copies stay in step. Now and then, or when you poke it, the cat wakes: head up,
// one eye opens and looks around, tail wags wider; then it settles back down.
const BODY = "M30 112 C22 80 52 56 110 54 C170 52 214 66 224 96 C230 116 214 122 190 122 L60 122 C42 122 32 120 30 112 Z";
const TAIL = "M38 112 C14 110 6 88 16 72"; // curls up behind the back, away from the face
const HEAD = [
  "M182 68 L184 44 L200 58 Z", // ears
  "M208 58 L222 42 L228 66 Z",
  "M176 92 C172 70 190 58 208 60 C228 62 238 78 234 96 C230 112 210 118 194 116 C182 114 177 104 176 92 Z", // skull
];
const NECK = "200px 112px";
const BLOB_AT = [
  [60, 90],
  [190, 80],
  [120, 118],
  [150, 70],
];
const OUTLINE = 4;
const TAIL_PIVOT = "38px 112px";

/** Two white dot eyes (cut out of the gradient, like the hero cat). `trigger`: another element (a button the cat sits on) whose hover also wakes it. */
export function SleepingCat({ className = "h-24 sm:h-32", outlineClass = "text-foreground", variant = 1, trigger }: { className?: string; outlineClass?: string; variant?: number; trigger?: RefObject<HTMLElement | null> }) {
  const look = VARIANTS[variant % VARIANTS.length];
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const [awake, setAwake] = useState(false);
  const poke = useRef<() => void>(() => {});

  // asleep for a while, awake for a moment, repeat; a pointer or tap wakes it right away
  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    const sleep = () => {
      setAwake(false);
      t = setTimeout(wake, 6000 + Math.random() * 3000);
    };
    const wake = () => {
      setAwake(true);
      t = setTimeout(sleep, 3400);
    };
    poke.current = () => {
      clearTimeout(t);
      wake();
    };
    t = setTimeout(wake, 3500);
    const el = trigger?.current;
    const hover = () => poke.current();
    el?.addEventListener("pointerenter", hover);
    return () => {
      clearTimeout(t);
      el?.removeEventListener("pointerenter", hover);
    };
  }, [reduce, trigger]);

  const body = (fill: boolean) => (
    <g className="cat-breathe">
      <path d={BODY} fill={fill ? "white" : undefined} strokeWidth={fill ? 0 : OUTLINE} />
      <g className="cat-head" style={{ transformOrigin: NECK, transformBox: "view-box" }}>
        {HEAD.map((d) => (
          <path key={d} d={d} fill={fill ? "white" : undefined} strokeWidth={fill ? 0 : OUTLINE} />
        ))}
        {fill && (
          <>
            <circle cx="200" cy="85" r="2.8" fill="black" className="cat-eye-ball" />
            <circle cx="216" cy="85" r="2.8" fill="black" className="cat-eye-ball" />
          </>
        )}
      </g>
    </g>
  );
  const tail = (fill: boolean) => (
    <path d={TAIL} fill="none" stroke={fill ? "white" : undefined} strokeWidth={12 + (fill ? 0 : OUTLINE)} strokeLinecap="round" className="cat-tail-sleep" style={{ transformOrigin: TAIL_PIVOT }} />
  );

  return (
    <svg viewBox="0 0 260 140" aria-hidden data-awake={awake} onPointerEnter={() => poke.current()} className={`aspect-[260/140] overflow-visible ${className}`}>
      <defs>
        <mask id={`sleep-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="260" height="140">
          {body(true)}
          {tail(true)}
        </mask>
        <filter id={`sleepblur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <g className={outlineClass} fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        {body(false)}
        {tail(false)}
      </g>
      <g mask={`url(#sleep-${uid})`}>
        <rect width="260" height="140" fill={look.base} />
        <g className="cat-spin" filter={`url(#sleepblur-${uid})`} style={{ transformOrigin: "130px 80px", transformBox: "view-box" }}>
          {BLOB_AT.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="70" fill={look.blobs[i]} />
          ))}
        </g>
      </g>
    </svg>
  );
}
