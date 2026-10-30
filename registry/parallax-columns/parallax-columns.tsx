"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef, type ComponentProps, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

// ponytail: kept in step with SCROLL_SPRING in lib/motion.ts; duplicated so this file installs on its own.
// restDelta is small because the spring runs on 0-1 progress, not pixels
const SPRING = { stiffness: 200, damping: 30, mass: 0.4, restDelta: 0.0005 };

export interface ParallaxColumnsProps extends Omit<ComponentProps<"div">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** One array of items per column, any number of columns. */
  columns: ReactNode[][];
  /** Viewport heights each column starts below its place, by column (repeats when there are more columns). */
  speeds?: number[];
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
}

/**
 * Columns that scroll at different speeds (after Olivier Larose's smooth parallax scroll, without Lenis, so native
 * scrolling is untouched). `speeds` are viewport heights each column starts below its place; they rise into line as the
 * section scrolls in. One spring eases the scroll progress and every column reads it through a CSS variable in `svh`, so
 * resizing or the mobile toolbar collapsing never re-renders React. Reduced motion makes it a plain static grid (in CSS, so the
 * server HTML and the first client render agree).
 */
export function ParallaxColumns({ columns, speeds = [0.12, 0.22, 0.05], container, className, style, ...rest }: ParallaxColumnsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"], container });
  // ease toward the scroll position (the tutorial gets this feel from Lenis; a spring keeps native scrolling)
  const progress = useSpring(scrollYProgress, SPRING);
  return (
    <motion.div ref={ref} className={cn("relative overflow-hidden", className)} style={{ ...style, "--parallax": progress } as CSSProperties} {...rest}>
      <div className="flex gap-3 sm:gap-4">
        {columns.map((items, c) => (
          <ul key={c} style={{ transform: `translateY(calc((1 - var(--parallax)) * ${speeds[c % speeds.length] * 100}svh))` }} className="flex min-w-0 flex-1 flex-col gap-3 will-change-transform motion-reduce:!transform-none sm:gap-4">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ))}
      </div>
    </motion.div>
  );
}
