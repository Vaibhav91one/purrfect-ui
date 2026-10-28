"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type RefObject } from "react";

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

function Word({ children, progress, range, reduce }: { children: string; progress: MotionValue<number>; range: [number, number]; reduce: boolean }) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mr-[0.25em] mt-1 inline-block">
      <span className="opacity-20">{children}</span>
      <motion.span style={{ opacity: reduce ? 1 : opacity }} className="absolute inset-0">
        {children}
      </motion.span>
    </span>
  );
}

/**
 * Text that fills in word by word as you scroll it into view: every word starts faint and turns solid in reading
 * order, finishing when its top reaches the upper sixth of the screen (`offset` changes that). Pass `container` to follow a scrolling box instead of the page. Size and weight come from `className`. Reduced motion shows the whole text solid.
 */
export function ScrollReveal({ text, className = "text-4xl font-light tracking-tight md:text-6xl lg:text-7xl", offset = ["start 0.8", "start 0.15"], container }: { text: string; className?: string; offset?: Offset; container?: RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset, container });
  const words = text.split(" ");
  return (
    <p ref={ref} className={`leading-[1.1] ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} reduce={reduce}>
            {w}
          </Word>
        ))}
      </span>
    </p>
  );
}
