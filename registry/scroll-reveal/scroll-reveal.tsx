"use client";

import { motion, useScroll } from "motion/react";
import { useRef, type ComponentProps, type CSSProperties, type RefObject } from "react";
import { cn } from "@/lib/utils";

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

export interface ScrollRevealProps extends Omit<ComponentProps<"p">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  text: string;
  /** Size and weight. Replaces the default type scale (text-4xl up to text-7xl) instead of merging with it. */
  className?: string;
  offset?: Offset;
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
}

/**
 * Text that fills in word by word as you scroll it into view: every word starts faint and turns solid in reading
 * order, finishing when its top reaches the upper sixth of the screen (`offset` changes that). Pass `container` to follow a
 * scrolling box instead of the page. Size and weight come from `className`. Reduced motion shows the whole text solid.
 * One CSS variable carries the scroll progress and each word's opacity is a CSS clamp of it, so a long paragraph costs one
 * style write per frame, not one per word.
 */
export function ScrollReveal({ text, className = "text-4xl font-light tracking-tight md:text-6xl lg:text-7xl", offset = ["start 0.8", "start 0.15"], container, style, ...rest }: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset, container });
  const words = text.trim().split(/\s+/).filter(Boolean);
  return (
    <motion.p ref={ref} className={cn("leading-[1.1]", className)} style={{ ...style, "--reveal": scrollYProgress } as CSSProperties} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i} className="relative mr-[0.25em] mt-1 inline-block">
            <span className="opacity-20">{w}</span>
            {/* word i turns solid while the progress runs from i/n to (i+1)/n; reduced motion pins it solid in CSS, so the server HTML and the first client render agree */}
            <span style={{ opacity: `clamp(0, var(--reveal) * ${words.length} - ${i}, 1)` }} className="absolute inset-0 motion-reduce:!opacity-100">
              {w}
            </span>
          </span>
        ))}
      </span>
    </motion.p>
  );
}
