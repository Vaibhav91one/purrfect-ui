"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { OUTLINE, SLEEPING } from "./cat-shapes";
import { VARIANTS } from "./cat-variants";
import { useSound } from "@/components/providers/sound-provider";

// A cat curled up asleep, drawn like the sitting one: every part twice (a fattened outline copy and a white copy
// inside the gradient mask; shapes in cat-shapes.ts). Everything that moves is CSS (breathing, tail swing, the head
// lifting), switched by `data-awake` on the svg, so both copies stay in step. Now and then, or when you poke it, the
// cat wakes: head up, one eye opens and looks around, tail wags wider; then it settles back down.
const { BODY, TAIL, HEAD, NECK, BLOB_AT, TAIL_PIVOT } = SLEEPING;

/**
 * Two white dot eyes (cut out of the gradient, like the hero cat). `trigger`: another element (a button the cat sits on) whose hover also wakes it.
 * `purrOnClick` makes the cat its own button: a click wakes it (as hover does) and it purrs; leave it off when the cat sits inside a link or button.
 */
export function SleepingCat({ className = "h-24 sm:h-32", outlineClass = "text-foreground", variant = 1, trigger, purrOnClick = false }: { className?: string; outlineClass?: string; variant?: number; trigger?: RefObject<HTMLElement | null>; purrOnClick?: boolean }) {
  const look = VARIANTS[variant % VARIANTS.length];
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const [awake, setAwake] = useState(false);
  const poke = useRef<() => void>(() => {});
  const { purr } = useSound();

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

  const cat = (
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
  if (!purrOnClick) return cat;
  return (
    <button type="button" aria-label="Wake the sleeping cat" data-hover-sound="off" onClick={() => (poke.current(), purr(1200))} className="grid cursor-pointer rounded-full">
      {cat}
    </button>
  );
}
