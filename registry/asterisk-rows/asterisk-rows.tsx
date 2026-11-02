"use client";

import { motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, type MotionStyle, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
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

// the page's scroll on the compositor where scroll-driven animations exist; it sets `rotate`, not `transform`, so it never fights the fallback
const TURN = "@keyframes asterisk-rows-turn{to{rotate:calc(var(--turns)*360deg)}}@supports (animation-timeline:scroll()){@media (prefers-reduced-motion:no-preference){[data-asterisk-turn]{animation:asterisk-rows-turn linear both;animation-timeline:scroll(root)}}}";
const SPRING = { type: "spring", stiffness: 300, damping: 20, opacity: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } } as const;
const FADE = { opacity: { duration: 0.2, ease: [0.23, 1, 0.32, 1] }, transform: { duration: 0 } } as const;

export interface AsteriskRowsProps extends Omit<ComponentProps<"div">, "ref" | "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** The mark: any SVG, image or text. Defaults to an asterisk in the current text colour. */
  children?: ReactNode;
  /** How many rows. They alternate direction: the first runs left while you scroll down, the next right. */
  rows?: number;
  /** Marks in one copy of a row (the copy repeats to fill the width). */
  count?: number;
  /** Pixels per second each row drifts at rest; scrolling speeds it up (5x more per 1000px/s of scroll). */
  speed?: number;
  /** Full turns every mark makes from the top of the page (or `container`) to the bottom. */
  turns?: number;
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
  /** Classes for each mark's box: its size (size-42 by default). */
  markClassName?: string;
}

/**
 * Rows of big marks drifting sideways in opposite directions. Each row is a marquee that runs while it is on screen, flips
 * with the scroll direction and speeds up with the scroll speed. Every mark pops in on a spring the first time it comes into
 * view, then turns with the scroll position of the page (or of `container`). Decorative, so it is hidden from screen readers.
 * Reduced motion: marks fade in, nothing drifts or turns.
 */
export function AsteriskRows({ children, rows = 2, count = 5, speed = 43, turns = 3, container, markClassName, className, ...rest }: AsteriskRowsProps) {
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll({ container });
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  // false on the server and progress is 0 there, so both renders write no rotation
  const css = !container && typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()");
  const rotate = useTransform(scrollYProgress, (v) => (css ? 0 : v * turns * 360));
  const mark = (
    <motion.div data-asterisk-turn={container ? undefined : ""} className="size-full origin-center motion-reduce:!transform-none" style={{ rotate, "--turns": turns } as unknown as MotionStyle}>
      {children ?? <Asterisk />}
    </motion.div>
  );
  return (
    <div aria-hidden className={cn("flex w-full flex-col overflow-hidden", className)} {...rest}>
      {/* without JavaScript the hidden start state would never animate, so show the marks as they are */}
      <noscript dangerouslySetInnerHTML={{ __html: "<style>[data-asterisk-pop]{opacity:1!important;transform:none!important}</style>" }} />
      {!container && (
        <style href="asterisk-rows-turn" precedence="default">
          {TURN}
        </style>
      )}
      {Array.from({ length: Math.max(0, rows) }, (_, i) => (
        <Row key={i} sign={i % 2 ? 1 : -1} count={count} speed={speed} velocity={velocity} reduce={!!reduce} markClassName={markClassName}>
          {mark}
        </Row>
      ))}
    </div>
  );
}

type RowProps = { sign: number; count: number; speed: number; velocity: MotionValue<number>; reduce: boolean; markClassName?: string; children: ReactNode };

function Row({ sign, count, speed, velocity, reduce, markClassName, children }: RowProps) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const visible = useInView(root);
  const x = useMotionValue(0);
  const w = useRef(0);
  const dir = useRef(1); // flips with the scroll direction
  const [copies, setCopies] = useState(2);

  // one copy's width, and enough copies to cover the row plus the one that slides out
  useEffect(() => {
    const box = root.current, one = first.current;
    if (!box || !one) return;
    const ro = new ResizeObserver(() => {
      w.current = one.offsetWidth;
      if (w.current) setCopies(Math.max(2, Math.ceil(box.clientWidth / w.current) + 1));
    });
    ro.observe(box);
    ro.observe(one);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduce || !visible || !w.current) return;
    const factor = velocity.get() / 200; // 1000px/s of scroll adds 5x the resting speed
    if (factor < 0) dir.current = -1;
    else if (factor > 0) dir.current = 1;
    const move = sign * dir.current * speed * (1 + Math.abs(factor)) * (Math.min(delta, 100) / 1000);
    const next = (x.get() + move) % w.current; // wrap by exactly one copy, kept in (-w, 0]
    x.set(next > 0 ? next - w.current : next);
  });

  // laid out left to right whatever the page direction, so the wrap maths holds in RTL
  return (
    <div ref={root} dir="ltr" className="overflow-hidden py-4">
      <motion.div style={{ x }} className="flex w-max will-change-transform">
        {Array.from({ length: copies }, (_, c) => (
          <div key={c} ref={c === 0 ? first : undefined} className="flex shrink-0 gap-2 pr-2">
            {Array.from({ length: Math.max(1, count) }, (_, i) => (
              // the unscaled cell watches the viewport: at scale(0) the mark is a single point
              <motion.div key={i} initial="hidden" whileInView="shown" viewport={{ once: true }} className="shrink-0 px-14 py-8">
                <motion.div
                  data-asterisk-pop=""
                  className={cn("size-42", markClassName)}
                  // check-ignore: no-scale-zero a mark popping out of nothing on a spring is the whole effect (the source does it), and it fades in too
                  variants={{ hidden: { transform: "scale(0)", opacity: 0 }, shown: { transform: "scale(1)", opacity: 1 } }}
                  transition={reduce ? FADE : SPRING}
                >
                  {children}
                </motion.div>
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
