// check-ignore: use-client-unneeded it keeps in-view state and listens through motion's viewport callbacks
"use client";

import { motion } from "motion/react";
import { useState, type ComponentProps, type CSSProperties, type ReactNode, type RefObject } from "react";
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


/**
 * A block of text whose lines slide up one after another from behind a clipping edge, once `amount` of the block is on
 * screen. You choose the line breaks (`lines`), so nothing is measured or re-split on resize, and the lines keep their
 * place in the layout the whole time: only a transform moves inside each line's mask. The lines are hidden only under
 * `@media (scripting: enabled)`, so with no JS the text is simply visible. Motion only reports when the block is in view;
 * the rise is a CSS transition (off the main thread), and under reduced motion a short fade, so nothing branches in JS.
 * The whole cascade is capped at 0.6s however many lines there are.
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
  const [on, setOn] = useState(false);
  const step = Math.min(stagger, 0.6 / Math.max(1, lines.length - 1)); // many lines: the cascade still ends within 0.6s
  return (
    <Tag
      data-in={on ? "" : undefined}
      onViewportEnter={() => setOn(true)}
      onViewportLeave={() => setOn(false)}
      // a long block may never be `amount` on screen at once (a threshold over what fits), so it plays as soon as any of it shows
      viewport={{ once, amount: lines.length > 12 ? "some" : amount, root: container }}
      className={cn("group/rise m-0 leading-tight", className)}
      {...rest}
    >
      {lines.map((line, i) => (
        // the mask clips only vertically (an unbreakable word overflows visibly instead of being cut); padding above and
        // below keeps accents and descenders inside it, pulled back with negative margins so the box does not grow
        <span key={i} className="-mt-[.15em] -mb-[.15em] block overflow-x-visible overflow-y-clip pt-[.15em] pb-[.15em]">
          <span
            style={{ "--t": on ? `${duration}s` : "0.2s", "--d": on ? `${i * step}s` : "0s" } as CSSProperties}
            className="block [transition:transform_var(--t)_cubic-bezier(0.33,1,0.68,1)_var(--d),opacity_calc(var(--t)/3)_linear_var(--d)] motion-safe:[@media(scripting:enabled)]:[transform:translateY(calc(100%_+_.3em))] motion-reduce:[@media(scripting:enabled)]:opacity-0 group-data-in/rise:![transform:none] group-data-in/rise:!opacity-100"
          >
            {line === "" ? "\u00a0" : line /* an empty line keeps its height */}
          </span>
        </span>
      ))}
    </Tag>
  );
}
