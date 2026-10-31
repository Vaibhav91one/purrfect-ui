"use client";

import { motion, useAnimationFrame, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useVelocity } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface ScrollMarqueeProps extends Omit<ComponentProps<"div">, "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** One copy of what scrolls past: a line of text, a row of logos. Put the gap after it (padding-right) inside. */
  children: ReactNode;
  /** Pixels per second. */
  speed?: number;
  /** Which way it runs before the first scroll. Scrolling down runs it left, scrolling up runs it right. */
  direction?: "left" | "right";
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
}

/**
 * A marquee that flips direction with the page's scroll: scroll down and it runs left, scroll back up and it runs right.
 * It moves at a fixed speed per second whatever the frame rate, renders as many copies as the width needs and wraps by
 * exactly one copy, so it never runs out. It only runs while on screen. Screen readers and Tab get the first copy only (the
 * repeats are inert, so links inside are not doubled).
 * Reduced motion: it stands still.
 */
export function ScrollMarquee({ children, speed = 80, direction = "left", container, className, ...rest }: ScrollMarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const visible = useInView(root);
  const x = useMotionValue(0);
  const dir = useRef(direction === "left" ? -1 : 1);
  const copy = useRef(0);
  const [count, setCount] = useState(2);

  const { scrollY } = useScroll({ container });
  useMotionValueEvent(useVelocity(scrollY), "change", (v) => {
    if (v) dir.current = v > 0 ? -1 : 1;
  });

  // one copy's width, and enough copies to cover the box plus the one that scrolls out
  useEffect(() => {
    const box = root.current, one = first.current;
    if (!box || !one) return;
    const ro = new ResizeObserver(() => {
      copy.current = one.offsetWidth;
      if (copy.current) setCount(Math.max(2, Math.ceil(box.clientWidth / copy.current) + 1));
    });
    ro.observe(box);
    ro.observe(one);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const w = copy.current;
    if (reduce || !visible || !w) return;
    let next = x.get() + (dir.current * speed * Math.min(delta, 100)) / 1000; // a backgrounded tab must not jump on return
    if (next <= -w) next += w;
    else if (next > 0) next -= w;
    x.set(next);
  });

  return (
    <div ref={root} className={cn("overflow-hidden", className)} {...rest}>
      <motion.div style={{ x }} className="flex w-max will-change-transform">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} ref={i === 0 ? first : undefined} aria-hidden={i > 0 || undefined} inert={i > 0 || undefined} className="shrink-0">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
