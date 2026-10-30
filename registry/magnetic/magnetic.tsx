"use client";

import gsap from "gsap";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MagneticProps extends Omit<ComponentProps<"span">, "ref"> {
  /** Whatever should be pulled toward the pointer: a button, a link, an icon. */
  children: ReactNode;
  /** How much of the pointer's offset from the centre the content follows. 1 follows it fully, 0 not at all. */
  strength?: number;
  className?: string;
}

/**
 * Pulls what it wraps toward the mouse while the pointer is over it, then springs back with an elastic overshoot (GSAP quickTo,
 * one tween per axis). Mouse only (touch and pen leave it still) and still under `prefers-reduced-motion`.
 */
export function Magnetic({ children, strength = 1, className, ...rest }: MagneticProps) {
  const root = useRef<HTMLSpanElement>(null);
  const power = useRef(strength);

  useEffect(() => {
    power.current = strength;
  });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    // check-ignore: duration this is the settle time of an elastic spring (the pull itself starts at once), not a UI wait
    const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" }); // check-ignore: duration same spring, y axis
    const release = () => {
      xTo(0);
      yTo(0);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce.matches) return;
      const r = el.getBoundingClientRect();
      // the box has already moved by its current offset: measure from where it sits without it, or the pull feeds on itself
      const cx = r.left - (gsap.getProperty(el, "x") as number) + r.width / 2;
      const cy = r.top - (gsap.getProperty(el, "y") as number) + r.height / 2;
      xTo((e.clientX - cx) * power.current);
      yTo((e.clientY - cy) * power.current);
    };
    const onReduce = () => reduce.matches && release();

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", release);
    el.addEventListener("pointercancel", release);
    reduce.addEventListener("change", onReduce);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", release);
      el.removeEventListener("pointercancel", release);
      reduce.removeEventListener("change", onReduce);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "x,y" });
    };
  }, []);

  return (
    <span ref={root} className={cn("inline-block", className)} {...rest}>
      {children}
    </span>
  );
}
