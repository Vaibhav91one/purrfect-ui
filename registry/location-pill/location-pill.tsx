"use client";

import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ComponentProps, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

/** The default icon: a globe (circle, equator, two meridians) in the current text colour. */
export function GlobeIcon({ className, ...rest }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("size-[30px]", className)} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

export interface LocationPillProps extends Omit<ComponentProps<"div">, "ref" | "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** The text before the icon. */
  label?: ReactNode;
  /** Spins slowly inside the grey circle. Defaults to an inline globe; size it like a 30px icon. */
  icon?: ReactNode;
  /** Seconds per full turn of the icon. */
  duration?: number;
  /** How far it drifts up as it scrolls out, as a fraction of its own height (0 turns the drift off). */
  drift?: number;
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
}

/**
 * A "Located in …" pill meant to sit on the left edge of a hero: square on the left, round on the right, with an icon
 * turning slowly in a grey circle (a CSS animation, paused while off screen). Once its bottom passes the middle of the
 * viewport (or of `container`) it drifts up by `drift` of its height as you scroll, smoothed like a scrubbed timeline.
 * Reduced motion: the icon turns four times slower; the drift (small, and only ever moved by your own scrolling) stays.
 */
export function LocationPill({ label = "Located in India", icon, duration = 10, drift = 0.2, container, className, ...rest }: LocationPillProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  // bottom edge at the middle of the view → bottom edge at the top: the source's ScrollTrigger("bottom center") range
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ["end center", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const y = useTransform(smooth, (p) => `${-p * drift * 100}%`);
  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={cn(
        "inline-flex max-w-full items-center gap-12 rounded-l-md rounded-r-full bg-foreground p-5 text-2xl text-background",
        className,
      )}
      {...rest}
    >
      {label ? <span className="min-w-0 truncate">{label}</span> : null}
      <span className="shrink-0 rounded-full bg-muted-foreground p-4 text-background">
        <span
          className="block animate-spin [--slow:1] motion-reduce:[--slow:4]"
          style={{ animationDuration: `calc(${duration}s * var(--slow))`, animationPlayState: visible ? "running" : "paused" }}
        >
          {icon ?? <GlobeIcon />}
        </span>
      </span>
    </motion.div>
  );
}
