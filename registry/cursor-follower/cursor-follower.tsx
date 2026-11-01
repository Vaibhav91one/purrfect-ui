"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface CursorFollowerProps extends Omit<ComponentProps<"div">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** Diameter of the dot in px. */
  size?: number;
}

const FOLLOW = { stiffness: 900, damping: 50, mass: 0.4 }; // tight: it trails the pointer by a frame or two, never lags
const GROW = { stiffness: 420, damping: 40 }; // critically damped: shrinking back never dips below rest size
/** Largest data-cursor-scale honoured, so a stray value cannot flood the page with inversion. */
const MAX_GROW = 10;

/**
 * A dot that follows the mouse and inverts what is under it (mix-blend-difference). Mount it once, near the root. Any
 * element with `data-cursor-scale="3"` grows it while hovered: no context, no hooks to wire. One passive pointer listener
 * on the document moves motion values, so React never re-renders while it moves. Mouse only: touch and pen never see it,
 * and it fades out when the pointer leaves the window (or a touch or pen takes over). Scale values are read as positive and
 * capped at 10. Reduced motion: it sits exactly on the pointer with no trail, and grows instantly instead of springing.
 */
export function CursorFollower({ size = 20, className, style, ...rest }: CursorFollowerProps) {
  const reduce = useReducedMotion();
  const still = useRef(reduce);
  const [shown, setShown] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const grow = useMotionValue(1);
  const sx = useSpring(x, FOLLOW);
  const sy = useSpring(y, FOLLOW);
  const scale = useSpring(grow, GROW);

  useEffect(() => {
    still.current = reduce;
  }, [reduce]);

  useEffect(() => {
    let visible = false;
    const move = (e: PointerEvent) => {
      // a hybrid device switching to touch or pen hides it instead of leaving it frozen
      if (e.pointerType !== "mouse") {
        if (visible) setShown((visible = false));
        return;
      }
      x.set(e.clientX);
      y.set(e.clientY);
      // the first move after it appears, and every move under reduced motion, lands on the pointer
      if (!visible || still.current) {
        sx.jump(e.clientX);
        sy.jump(e.clientY);
      }
      if (!visible) setShown((visible = true));
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const n = Math.min(MAX_GROW, Math.abs(Number((e.target as Element).closest?.("[data-cursor-scale]")?.getAttribute("data-cursor-scale")))) || 1;
      grow.set(n);
      if (still.current) scale.jump(n);
    };
    const leave = () => setShown((visible = false));
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [x, y, sx, sy, grow, scale]);

  return (
    <motion.div
      aria-hidden
      // check-ignore: hardcoded-color white is what makes mix-blend-difference invert the page, in either theme
      className={cn("pointer-events-none fixed top-0 left-0 z-[100] rounded-full bg-white mix-blend-difference transition-opacity duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]", shown ? "opacity-100" : "opacity-0", className)}
      style={{ x: sx, y: sy, scale, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, ...style }}
      {...rest}
    />
  );
}
