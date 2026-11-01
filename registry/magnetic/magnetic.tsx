"use client";

import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useSyncExternalStore, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MagneticProps extends Omit<ComponentProps<"span">, "ref"> {
  /** Whatever should be pulled toward the pointer: a button, a link, an icon. */
  children: ReactNode;
  /** How much of the pointer's offset from the centre the content follows. 1 reaches its own edge, 0 stays still. */
  strength?: number;
  className?: string;
}

// underdamped (ratio ~0.69, ~5% overshoot): a little elastic give on release without wobbling while it tracks
const ELASTIC = { stiffness: 150, damping: 12, mass: 0.5 };
// critically damped: no overshoot
const GENTLE = { stiffness: 150, damping: 25, mass: 1 };

// live, unlike motion's useReducedMotion (read once): flipping the setting swaps the spring at once
const query = () => matchMedia("(prefers-reduced-motion: reduce)"); // check-ignore: ssr-safe only called on the client (the server snapshot is false)
const onReduce = (cb: () => void) => {
  const q = query();
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};

/**
 * Pulls what it wraps toward the mouse while the pointer is over it, then springs back with an elastic overshoot (one motion
 * spring per axis, written straight to `translate`, so React never re-renders). Mouse only (touch and pen leave it still).
 * Under `prefers-reduced-motion` it follows a quarter as far, with no overshoot. The hit area is the wrapper, which never
 * moves: only the content inside it is pulled, so it lets go at its resting edge and can't be dragged across the page.
 */
export function Magnetic({ children, strength = 0.4, className, ...rest }: MagneticProps) {
  const root = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  // only picks the spring and the pull, never the HTML
  const reduce = useSyncExternalStore(onReduce, () => query().matches, () => false);
  const power = useRef(strength);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, reduce ? GENTLE : ELASTIC);
  const y = useSpring(ty, reduce ? GENTLE : ELASTIC);

  useEffect(() => {
    power.current = reduce ? strength / 4 : strength;
  });

  useEffect(() => {
    const el = root.current, box = inner.current;
    if (!el || !box) return;
    const paint = () => (box.style.translate = `${x.get()}px ${y.get()}px`);
    const release = () => {
      tx.set(0);
      ty.set(0);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      // the wrapper's box is the resting place: the pulled content can still be under the pointer outside it, so leaving
      // the box releases too
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return release();
      tx.set((e.clientX - (r.left + r.width / 2)) * power.current);
      ty.set((e.clientY - (r.top + r.height / 2)) * power.current);
    };
    const offX = x.on("change", paint);
    const offY = y.on("change", paint);

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", release);
    el.addEventListener("pointercancel", release);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", release);
      el.removeEventListener("pointercancel", release);
      offX();
      offY();
      box.style.translate = "";
    };
  }, [tx, ty, x, y]);

  return (
    <span ref={root} className={cn("inline-block", className)} {...rest}>
      <span ref={inner} className="inline-block">
        {children}
      </span>
    </span>
  );
}
