"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface QuoteCycleProps extends Omit<ComponentProps<"div">, "children"> {
  /** The lines to cycle through, in order. Strings or any inline content. */
  lines: ReactNode[];
  /** Show this line (wraps past the end) and stop rotating on a timer: the parent advances it, from a click or anything else. */
  index?: number;
  /** Seconds from one line arriving to the next one arriving. */
  interval?: number;
  /** Announce each new line to screen readers. Off by default: a line every few seconds floods a screen reader. */
  announce?: boolean;
  className?: string;
}

const OUT = [0.22, 1, 0.36, 1] as const;
const SNAP = [0.23, 1, 0.32, 1] as const;
// seconds for the old line to leave; the new one waits this long, then drops in
const LEAVE = 0.5;
// driven by `index` (a click), the swap is feedback to input: the old line leaves fast and the new one overlaps it
const FAST = { leave: 0.2, delay: 0.1, show: 0.25 };

// opacity lives on the outer span and transform on the inner one, so reduced motion can drop the transform with a class
// and keep a plain fade (no server-side branch on useReducedMotion). `custom` is true when controlled.
const fade: Variants = {
  show: (fast: boolean) => ({
    opacity: 1,
    // check-ignore: duration an ambient rotation, not a response to input
    transition: fast ? { delay: FAST.delay, duration: FAST.show, ease: SNAP } : { delay: LEAVE, duration: 0.5, ease: OUT },
  }),
  // check-ignore: duration an ambient rotation, not a response to input
  leave: (fast: boolean) => ({ opacity: 0, transition: fast ? { duration: FAST.leave, ease: SNAP } : { duration: LEAVE, ease: OUT } }),
  hide: { opacity: 0, transition: { duration: 0 } },
  rest: { opacity: 1, transition: { duration: 0 } },
};
// the held line is scale(1), its layout size, so nothing painted overflows the box; the others are relative to it
const move: Variants = {
  // drops in from 1.25x past rest to 0.83x, then pops back up to 1x and holds there (controlled: one quick drop to 1x)
  show: (fast: boolean) =>
    fast
      ? { transform: ["translateY(30px) scale(1.25)", "translateY(0px) scale(1)"], transition: { delay: FAST.delay, duration: FAST.show, ease: SNAP } }
      : {
          transform: ["translateY(30px) scale(1.25)", "translateY(0px) scale(0.833)", "translateY(0px) scale(1)"],
          // check-ignore: duration drop-in plus pop, an ambient rotation, not a response to input
          transition: { delay: LEAVE, duration: 1, times: [0, 0.5, 1], ease: OUT },
        },
  // shrinks up and away
  // check-ignore: duration an ambient rotation, not a response to input
  leave: (fast: boolean) => ({ transform: "translateY(-30px) scale(0.667)", transition: fast ? { duration: FAST.leave, ease: SNAP } : { duration: LEAVE, ease: OUT } }),
  hide: { transform: "translateY(-30px) scale(0.667)", transition: { duration: 0 } },
  // the first line on first paint: already popped, so nothing plays on load (or on a StrictMode remount)
  rest: { transform: "translateY(0px) scale(1)", transition: { duration: 0 } },
};

/**
 * Lines that take turns: the current one pops up to its full size and holds, then shrinks up and away while the next drops
 * in from 1.25x. The held size is the layout size, so set the font size for the held line. Every line sits in the same
 * grid cell, so the box always has the height of the tallest one and never shifts. Driven by `index`, the swap is quick
 * (about 350ms, the lines overlapping) since it answers a click.
 * Rotation pauses on hover, on keyboard focus inside it and while off screen; pass `index` to drive it yourself instead. Hidden lines are inert, and the live
 * region is off unless `announce` is set.
 * Under `prefers-reduced-motion` the lines cross-fade in place.
 */
export function QuoteCycle({
  lines,
  index,
  interval = 3.5,
  announce = false,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...rest
}: QuoteCycleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [step, setStep] = useState(0); // lines advanced so far; current = step % count, previous = (step - 1) % count
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  // controlled: remember the line it came from, so that one plays its exit (state adjusted during render, no effect)
  const [was, setWas] = useState({ index, prev: -1, moved: false });
  if (index !== was.index) setWas({ index, prev: was.index ?? -1, moved: true });
  const count = lines.length;
  const at = (n: number) => (count ? ((n % count) + count) % count : -1);
  const ctrl = index !== undefined;
  const cur = ctrl ? at(index) : count ? step % count : 0;
  const prev = ctrl ? (was.moved ? at(was.prev) : -1) : step > 0 && count ? (step - 1) % count : -1;
  const moved = ctrl ? was.moved : step > 0;
  const paused = ctrl || hover || focus || !inView || count < 2;

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setStep((s) => s + 1), interval * 1000);
    return () => clearTimeout(t);
  }, [step, paused, interval]);

  return (
    <div
      ref={ref}
      aria-live={announce ? "polite" : "off"}
      // grid-cols-1 is minmax(0, 1fr): an unbreakable line wraps instead of widening the shared cell
      className={cn("grid grid-cols-1 items-center text-center text-muted-foreground", className)}
      {...rest}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHover(true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setHover(false);
        onPointerLeave?.(e);
      }}
      onFocus={(e) => {
        setFocus(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
        onBlur?.(e);
      }}
    >
      {lines.map((line, i) => {
        const state = i === cur ? (moved ? "show" : "rest") : i === prev ? "leave" : "hide";
        return (
          <motion.span
            key={i}
            variants={fade}
            custom={ctrl}
            initial={false}
            animate={state}
            // inert: hidden lines are out of the a11y tree, the tab order and the pointer's way (links in them too)
            inert={i !== cur}
            className="block [grid-area:1/1] break-words text-pretty"
          >
            <motion.span variants={move} custom={ctrl} initial={false} className="block motion-reduce:transform-none!">
              {line}
            </motion.span>
          </motion.span>
        );
      })}
    </div>
  );
}
