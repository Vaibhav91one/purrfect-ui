"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ComponentProps, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

/** The default mark: a six-armed asterisk in the current text colour. */
export function Asterisk({ className, ...rest }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden className={cn("size-full", className)} {...rest}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 .09a1 1 0 0 1 1 1v4.088l3.463-2.204a1 1 0 0 1 1.074 1.688L8.863 7l3.674 2.338a1 1 0 0 1-1.074 1.688L8 8.822v4.087a1 1 0 1 1-2 0V8.822l-3.463 2.204a1 1 0 1 1-1.074-1.688L5.137 7 1.463 4.662a1 1 0 1 1 1.074-1.688L6 5.178V1.091a1 1 0 0 1 1-1"
      />
    </svg>
  );
}

// a CSS animation on the compositor, paused while off screen: no rAF, no React work per frame
function Spin({ duration, children }: { duration: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      className="size-full origin-center animate-spin motion-reduce:animate-none"
      style={{ animationDuration: `${duration}s`, animationPlayState: visible ? "running" : "paused" }}
    >
      {children}
    </div>
  );
}

// page (or container) scroll progress 0 → 1 maps to 0 → turns full turns, written straight to transform
function ScrollTurn({ turns, container, children }: { turns: number; container?: RefObject<HTMLElement | null>; children: ReactNode }) {
  const { scrollYProgress } = useScroll({ container });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, turns * 360]);
  return (
    <motion.div className="size-full origin-center motion-reduce:!transform-none" style={{ rotate }}>
      {children}
    </motion.div>
  );
}

export interface SpinMarkProps extends Omit<ComponentProps<"div">, "ref" | "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** The mark: any SVG, image or text. Defaults to an asterisk in the current text colour. Size it with `className` (it fills the root). */
  children?: ReactNode;
  /** `spin` turns forever at a steady speed; `scroll` turns with the page's scroll position. */
  mode?: "spin" | "scroll";
  /** `spin` only: seconds per full turn. */
  duration?: number;
  /** `scroll` only: full turns from the top of the page to the bottom. */
  turns?: number;
  /** `scroll` only: follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
}

/**
 * A mark that pops in with a spring the first time it enters the viewport, then either spins forever (a CSS animation paused
 * while off screen) or turns with the scroll position of the page or of `container`. It fills its root, so size it with
 * `className` (`size-24` by default) and colour it with a text colour.
 * Reduced motion: it fades and scales in without the bounce, and does not turn.
 */
export function SpinMark({ children, mode = "spin", duration = 20, turns = 3, container, className, ...rest }: SpinMarkProps) {
  const reduce = useReducedMotion();
  const mark = children ?? <Asterisk />;
  return (
    <motion.div
      className={cn("size-24 shrink-0", className)}
      // check-ignore: no-scale-zero a brand mark popping out of nothing on a spring is the whole effect (the source does it), and it fades in too
      initial={{ transform: "scale(0)", opacity: 0 }}
      whileInView={{ transform: "scale(1)", opacity: 1 }}
      viewport={{ once: true }}
      transition={reduce ? { duration: 0.3, ease: [0.23, 1, 0.32, 1] } : { type: "spring", stiffness: 300, damping: 20 }}
      {...rest}
    >
      {mode === "scroll" ? (
        <ScrollTurn turns={turns} container={container}>
          {mark}
        </ScrollTurn>
      ) : (
        <Spin duration={duration}>{mark}</Spin>
      )}
    </motion.div>
  );
}
