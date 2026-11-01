"use client";

import { useEffect, useRef, type ComponentProps, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface VoiceBarsProps extends Omit<ComponentProps<"div">, "ref" | "children"> {
  /** How many bars. */
  bars?: number;
  /** Seconds for one loop of a bar through its heights. */
  duration?: number;
  /** Seconds between one bar starting and the next. */
  stagger?: number;
}

const KEYFRAMES =
  "@keyframes voice-bars{0%,100%{scale:1 var(--h0)}25%{scale:1 var(--h1)}50%{scale:1 var(--h2)}75%{scale:1 var(--h3)}}" +
  "@keyframes voice-bars-fade{50%{opacity:.45}}";

// Heights as a fraction of the box, 0.38-1 (Armour's 10-26px in a 26px bar). Integer hash, so server and client agree.
const height = (i: number, k: number) => (0.38 + (((i * 7 + k * 13 + i * k * 5 + 3) % 17) / 16) * 0.62).toFixed(2);

/**
 * A voice level meter: thin bars jump between heights on a loop, each one a beat behind the last, like a mic that is listening.
 * Each bar has its own fixed sequence of four heights (no Math.random, so the server HTML matches), drawn with CSS `scale` from the bottom:
 * transform only, one keyframe shared by every bar, no JavaScript per frame. Bars are `currentColor`, so set the colour with `text-*`.
 * The loop pauses while the meter is off screen. It is decorative (hidden from screen readers) unless you give it an `aria-label`.
 * Reduced motion: the bars hold still at their first height and only pulse in opacity.
 */
export function VoiceBars({ bars = 12, duration = 1, stagger = 0.08, className, style, ...rest }: VoiceBarsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-paused", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const labelled = rest["aria-label"] != null;

  return (
    <div
      ref={ref}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cn("group flex h-8 items-end justify-center gap-0.5", className)}
      style={{ "--vb-duration": `${duration}s`, ...style } as CSSProperties}
      {...rest}
    >
      {/* React 19 hoists this into <head> once, however many instances render */}
      <style href="voice-bars" precedence="default">
        {KEYFRAMES}
      </style>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-full w-0.5 shrink-0 origin-bottom rounded-full bg-current [scale:1_var(--h0)]",
            "animate-[voice-bars_var(--vb-duration)_ease-in-out_infinite] group-data-paused:[animation-play-state:paused]",
            "motion-reduce:animate-[voice-bars-fade_calc(var(--vb-duration)*2)_ease-in-out_infinite]",
          )}
          style={
            {
              "--h0": height(i, 0),
              "--h1": height(i, 1),
              "--h2": height(i, 2),
              "--h3": height(i, 3),
              animationDelay: `${i * stagger}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
