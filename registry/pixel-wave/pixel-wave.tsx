"use client";
// Adapted from Beautiful UI's loading-state (https://www.beautifului.dev). MIT License, Copyright (c) 2026 Shane Levine.

import { useEffect, useRef, type ComponentProps, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface PixelWaveProps extends Omit<ComponentProps<"span">, "ref" | "children"> {
  /** Side of one cell, in px. */
  size?: number;
  /** Space between cells, in px. */
  gap?: number;
  /** Seconds for one cell to fade up and back. */
  duration?: number;
  /** Seconds between one diagonal of cells and the next. */
  stagger?: number;
}

const KEYFRAMES =
  "@keyframes pixel-wave{0%,100%{opacity:.15}40%{opacity:1}}" + "@keyframes pixel-wave-soft{0%,100%{opacity:.25}40%{opacity:.6}}";

// Steps from the left-middle cell, so the front fans out right and to both corners: 0 1 2 / 0 1 2 shifted by the row's distance from the middle
const STEPS = Array.from({ length: 9 }, (_, i) => (i % 3) + Math.abs(Math.floor(i / 3) - 1));

/**
 * A 3x3 pixel loader: nine square cells run one opacity fade on staggered delays, so a wavefront sweeps across the grid.
 * The fade is shorter than a full sweep plus its tail, which keeps two fronts in flight so it never reads as a metronome.
 * Opacity only, one shared keyframe, no JavaScript per frame. Cells are `currentColor`, so set the colour with `text-*`.
 * The loop pauses while the grid is off screen. It is decorative (hidden from screen readers) unless you give it an `aria-label` or
 * `aria-labelledby`. Inline in text it sits centred on the line.
 * Reduced motion: the wave runs at half speed with a smaller opacity swing.
 */
export function PixelWave({ size = 4, gap = 1, duration = 0.65, stagger = 0.09, className, style, ...rest }: PixelWaveProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-paused", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const labelled = rest["aria-label"] != null || rest["aria-labelledby"] != null;

  return (
    <span
      ref={ref}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      // align-middle: an empty inline-grid takes its first row as the baseline, so inline in text it would hang low
      className={cn("group inline-grid shrink-0 grid-cols-[repeat(3,var(--pw-size))] gap-(--pw-gap) align-middle", className)}
      style={{ "--pw-size": `${size}px`, "--pw-gap": `${gap}px`, "--pw-duration": `${duration}s`, ...style } as CSSProperties}
      {...rest}
    >
      {/* React 19 hoists this into <head> once, however many instances render */}
      <style href="pixel-wave" precedence="default">
        {KEYFRAMES}
      </style>
      {STEPS.map((step, i) => (
        <span
          key={i}
          className={cn(
            "size-(--pw-size) rounded-[1px] bg-current opacity-15",
            // backwards: each cell shows its 0% frame during its delay, so the soft keyframe does not step on start
            "animate-[pixel-wave_var(--pw-duration)_ease-in-out_infinite_backwards] group-data-paused:[animation-play-state:paused]",
            "motion-reduce:animate-[pixel-wave-soft_calc(var(--pw-duration)*2)_ease-in-out_infinite_backwards] motion-reduce:[--pw-slow:2]",
          )}
          // reduced motion doubles the duration, so the delay doubles with it to keep the same wavefront
          style={{ animationDelay: `calc(${step * stagger}s * var(--pw-slow, 1))` }}
        />
      ))}
    </span>
  );
}
