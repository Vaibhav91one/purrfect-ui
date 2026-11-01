"use client";
// Adapted from Beautiful UI's task-rows (https://www.beautifului.dev). MIT License, Copyright (c) 2026 Shane Levine.

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export type StepState = "pending" | "current" | "done" | "skipped";

export interface StepRingProps extends Omit<ComponentProps<"span">, "children"> {
  /** `current` spins a quarter-arc on the ring, `done` fills it with a tick, `skipped` shows a dash, `pending` shows the number. */
  state: StepState;
  /** The number drawn inside the ring for `pending` and `current`. Fits 1-99 at the default size. */
  index: number;
}

/**
 * A numbered circular badge for one step of a pipeline. The current step's ring has a quarter-arc turning on it, a finished step
 * is a filled tick, a skipped one a dash. Opaque on purpose (`bg-background`), so a connector line running behind it never
 * crosses the number. Size it with `className` (`size-7 text-xs` by default, so `size-40 text-4xl` scales the number too); the arc and the tick
 * take the text colour. Screen readers hear "Step 3, current" from a hidden label.
 * Reduced motion: the arc turns at a third of the speed.
 */
export function StepRing({ state, index, className, ...rest }: StepRingProps) {
  const ref = useRef<SVGSVGElement>(null);
  const visible = useInView(ref);

  if (state === "done") {
    return (
      <span
        className={cn("relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs text-background", className)}
        {...rest}
      >
        <svg viewBox="0 0 256 256" aria-hidden className="size-1/2">
          <path d="M40 144l56 56L216 80" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="sr-only">{`Step ${index}, ${state}`}</span>
      </span>
    );
  }

  return (
    <span
      className={cn("relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-xs text-foreground", className)}
      {...rest}
    >
      <svg ref={ref} viewBox="0 0 28 28" aria-hidden className="absolute inset-0 size-full">
        <circle cx="14" cy="14" r="13" fill="none" stroke="var(--border)" strokeWidth="2" />
        {state === "current" ? (
          // A quarter of the circumference (2πr ≈ 82), turning about its own centre: fill-box makes that explicit instead of
          // relying on the default SVG origin happening to sit at the circle's centre.
          <circle
            cx="14"
            cy="14"
            r="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="20 62"
            // check-ignore: duration a continuous loop, not a UI transition: reduced motion slows one turn to 3s
            className="origin-center animate-spin [transform-box:fill-box] motion-reduce:[animation-duration:3s]"
            style={{ animationPlayState: visible ? "running" : "paused" }}
          />
        ) : null}
      </svg>
      <span aria-hidden className={cn("relative tabular-nums", state === "current" ? "text-foreground" : "text-muted-foreground")}>
        {state === "skipped" ? (
          <svg viewBox="0 0 256 256" aria-hidden className="size-3">
            <path d="M40 128h176" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
          </svg>
        ) : (
          index
        )}
      </span>
      <span className="sr-only">{`Step ${index}, ${state}`}</span>
    </span>
  );
}

export interface StepRiseProps extends Omit<ComponentProps<"li">, "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** Position in the list: each row starts `stagger` seconds after the one before it. */
  order: number;
  /** Seconds between one row and the next. */
  stagger?: number;
}

/**
 * A list row that rises 6px into place with a fade, `order × stagger` after mount (capped at the 6th row), so a pipeline reads top to bottom instead
 * of arriving all at once. Replay it by changing the list's `key`.
 * Reduced motion: it fades in without moving.
 */
export function StepRise({ order, stagger = 0.07, className, ...rest }: StepRiseProps) {
  const reduce = useReducedMotion();
  // check-ignore: duration the source's 450ms rise, staggered so the eye follows the pipeline; each row is short
  const rise = { delay: Math.min(order, 6) * stagger, duration: 0.45, ease: [0.23, 1, 0.32, 1] as const };
  return (
    <motion.li
      className={cn(className)}
      initial={{ opacity: 0, transform: "translateY(6px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ ...rise, transform: reduce ? { duration: 0 } : rise }}
      {...rest}
    />
  );
}
