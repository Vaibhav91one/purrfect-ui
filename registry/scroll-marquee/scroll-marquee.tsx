"use client";

import { motion, useAnimationFrame, useInView, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
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
  /** Pixels the whole line slides sideways over the first screen of scroll, on top of the drift. 0 turns it off. */
  travel?: number;
}

/**
 * A marquee driven by the page's scroll: the line slides `travel` px sideways over the first screen of scroll (and back as
 * you scroll up), while it drifts on its own and the drift flips with the scroll: down runs it left, up runs it right.
 * It moves at a fixed speed per second whatever the frame rate, renders as many copies as the width needs and wraps by
 * exactly one copy, so it never runs out. The motion is a WAAPI animation on the compositor, so a busy main thread does
 * not stall it; JavaScript only eases its playback rate. It only runs while on screen, eases to a stop while hovered and
 * stops at once while focus is inside. A scroll flip eases the speed through zero instead of snapping. Screen readers and
 * Tab get the first copy only (the repeats are inert, so links inside are not doubled).
 * Reduced motion: it stands still and does not slide.
 */
export function ScrollMarquee({ children, speed = 80, direction = "left", container, travel = 500, className, onPointerEnter, onPointerLeave, onFocus, onBlur, ...rest }: ScrollMarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const anim = useRef<Animation | null>(null);
  const reduce = useReducedMotion();
  const visible = useInView(root);
  const dir = useRef(direction === "left" ? -1 : 1);
  const v = useRef(direction === "left" ? -1 : 1); // the eased sign, so a flip slows through zero instead of snapping
  const rtl = useRef(false);
  const paused = useRef(false); // focus inside: stop at once, keyboard gets no motion
  const hovered = useRef(false); // pointer over it: ease to a stop
  const rate = useRef(0);
  const [count, setCount] = useState(2);

  const { scrollY } = useScroll({ container });
  // 0 to -travel over the first screen (the box's height when following one), quad ease-out, smoothed a little
  const slide = useSpring(
    useTransform(scrollY, (y) => {
      if (reduce) return 0;
      const p = Math.min(1, Math.max(0, y / (container?.current?.clientHeight || window.innerHeight)));
      return (rtl.current ? 1 : -1) * travel * (1 - (1 - p) * (1 - p));
    }),
    { stiffness: 400, damping: 50 },
  );
  useMotionValueEvent(useVelocity(scrollY), "change", (v) => {
    if (v) dir.current = v > 0 ? -1 : 1;
  });

  // one copy's width, and enough copies to cover the box plus the one that scrolls out
  useEffect(() => {
    const box = root.current, one = first.current, el = track.current;
    if (!box || !one || !el) return;
    const ro = new ResizeObserver(() => {
      const w = one.offsetWidth, isRtl = getComputedStyle(box).direction === "rtl"; // RTL copies stack leftwards from the right edge
      if (!w) return;
      setCount(Math.max(2, Math.ceil((box.clientWidth + travel) / w) + 1));
      const prev = anim.current, t = prev?.effect?.getTiming();
      if (prev && t?.duration === w && rtl.current === isRtl) return;
      rtl.current = isRtl;
      // one copy in w ms (1000px/s at rate 1), so the rate alone sets the speed; keep the phase across a resize
      const p = prev && t ? (Number(prev.currentTime) % Number(t.duration)) / Number(t.duration) : 0;
      prev?.cancel();
      const a = el.animate(isRtl ? [{ transform: `translateX(${w}px)` }, { transform: "translateX(0px)" }] : [{ transform: "translateX(0px)" }, { transform: `translateX(${-w}px)` }], { duration: w, iterations: Infinity });
      a.currentTime = w * (1e6 + p); // far from 0, so running backwards (right) never reaches the start and finishes
      a.playbackRate = rate.current;
      anim.current = a;
    });
    ro.observe(box);
    ro.observe(one);
    return () => ro.disconnect();
  }, [travel]);
  useEffect(() => () => anim.current?.cancel(), []);

  // only the rate is set from here, and only while it changes: once it settles the compositor runs the loop alone
  useAnimationFrame((_, delta) => {
    const a = anim.current;
    if (!a) return;
    const run = !reduce && visible && !paused.current;
    if (run) {
      const target = hovered.current ? 0 : dir.current;
      v.current += (target - v.current) * (1 - Math.exp(-Math.min(delta, 100) / 80));
      if (Math.abs(target - v.current) < 1e-3) v.current = target;
    }
    const next = run ? (-v.current * speed) / 1000 : 0;
    if (next !== rate.current) a.updatePlaybackRate((rate.current = next));
  });

  return (
    <div
      ref={root}
      className={cn("overflow-hidden", className)}
      onPointerEnter={(e) => ((hovered.current = true), onPointerEnter?.(e))}
      onPointerLeave={(e) => ((hovered.current = false), onPointerLeave?.(e))}
      onFocus={(e) => ((paused.current = true), onFocus?.(e))}
      onBlur={(e) => ((paused.current = e.currentTarget.contains(e.relatedTarget)), onBlur?.(e))}
      {...rest}
    >
      <motion.div style={{ x: slide }} className="w-max">
        <div ref={track} className="flex w-max will-change-transform">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} ref={i === 0 ? first : undefined} aria-hidden={i > 0 || undefined} inert={i > 0 || undefined} className="shrink-0">
              {children}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
