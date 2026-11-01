// check-ignore: use-client-unneeded the `in` variant is a function, which cannot cross from a server component into motion
"use client";

import { motion, type Variants } from "motion/react";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";

export interface LineRiseProps extends Omit<ComponentProps<"p">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  as?: "p" | "h1" | "h2" | "h3" | "div";
  /** One entry per line; each rises out of its own mask. */
  lines: ReactNode[];
  /** Seconds between one line and the next. */
  stagger?: number;
  /** Seconds each line takes to rise. */
  duration?: number;
  /** How much of the block (0 to 1) must be on screen before it plays. Lower it for blocks taller than the screen. */
  amount?: number;
  /** Play the first time only. With `false` the lines drop back when the block leaves the screen and rise again on return. */
  once?: boolean;
  /** Watch a scrolling box instead of the page: the lines rise as the block scrolls into view inside it. */
  container?: RefObject<Element | null>;
}

type Custom = { i: number; stagger: number; duration: number };

// one 0 to 1 progress per line; CSS turns it into the rise, or under reduced motion into a fade done in the first third
const variants: Variants = {
  out: { "--rise": 0, transition: { duration: 0.2 } },
  in: ({ i, stagger, duration }: Custom) => ({ "--rise": 1, transition: { delay: i * stagger, duration, ease: [0.33, 1, 0.68, 1] } }),
};

/**
 * A block of text whose lines slide up one after another from behind a clipping edge, once `amount` of the block is on
 * screen. You choose the line breaks (`lines`), so nothing is measured or re-split on resize, and the lines keep their
 * place in the layout the whole time: only a transform moves inside each line's mask. The lines are hidden only under
 * `@media (scripting: enabled)`, so with no JS the text is simply visible. Motion animates one `--rise` variable per line;
 * CSS turns it into the rise, and under reduced motion into a short fade, so nothing branches in JS.
 */
export function LineRise({
  as = "p",
  lines,
  stagger = 0.075,
  // check-ignore: duration a 0.75s display-type rise, like the source; it plays once per block
  duration = 0.75,
  amount = 0.5,
  once = true,
  container,
  className,
  ...rest
}: LineRiseProps) {
  const Tag = motion[as] as typeof motion.p;
  return (
    <Tag initial="out" whileInView="in" viewport={{ once, amount, root: container }} className={cn("m-0 leading-tight", className)} {...rest}>
      {lines.map((line, i) => (
        // the mask: padding below keeps descenders inside the clip, pulled back with a negative margin so the box does not grow
        <span key={i} className="-mb-[.15em] block overflow-clip pb-[.15em]">
          <motion.span
            custom={{ i, stagger, duration } satisfies Custom}
            variants={variants}
            className="block motion-safe:[@media(scripting:enabled)]:[transform:translateY(calc(105%-var(--rise,0)*105%))] motion-reduce:[@media(scripting:enabled)]:[opacity:min(1,calc(var(--rise,0)*3))]"
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
