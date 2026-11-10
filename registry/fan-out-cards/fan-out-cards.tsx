"use client"; // check-ignore: use-client-unneeded the variants are functions (custom), which cannot cross from a server component

import { MotionConfig, motion, type Variants } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FanOutCard = {
  content: ReactNode;
  /** Where the card's centre lands, in % of the container's width from its centre (-50 is the left edge). */
  x: number;
  /** Where the card's centre lands, in % of the container's height from its centre (-50 is the top edge). */
  y: number;
  /** Tilt in degrees once it lands. */
  rotate?: number;
};

export interface FanOutCardsProps extends Omit<ComponentProps<"div">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  cards: FanOutCard[];
  /** Something in the middle that the cards fan out from: a phone, a photo, a pill. */
  center?: ReactNode;
  /** Seconds between one card leaving the stack and the next. */
  stagger?: number;
  /** Classes for every card box (its width: 16rem by default). */
  cardClassName?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 210, damping: 20, mass: 0.75 } as const;

/**
 * Cards that start stacked behind the centre, each already at its own height and tilt, and slide out along their tilt to their
 * spots when the group scrolls into view, one after another. Offsets are percentages of the container (each card rides a zero-size point in the centre that moves
 * in container units, so no empty layer box ever widens the page), which means the fan scales with whatever box it is in:
 * no pixel offsets, no media queries.
 * Give the root a height. Cards are at most 40% of the box wide, so keep |x| within 30 to keep them inside it (further
 * out, clip a parent with overflow-x-clip).
 * It plays once. Reduced motion: the cards are already in place and only fade in.
 */
export function FanOutCards({ cards, center, stagger = 0.08, cardClassName, className, ...rest }: FanOutCardsProps) {
  // The card's own x runs inside its tilted frame, so it slides out along the tilt, not flat sideways
  const card: Variants = {
    hidden: (c: { x: number }) => ({ opacity: 0, scale: 0.88, x: `${-c.x}cqw` }),
    shown: (c: { delay: number }) => ({
      opacity: 1,
      scale: 1,
      x: "0cqw",
      // check-ignore: duration a one-off entrance that plays once on scroll, not a response to input
      transition: { x: { ...SPRING, delay: c.delay }, opacity: { duration: 0.4, ease: EASE, delay: c.delay }, scale: { duration: 0.55, ease: EASE, delay: c.delay } },
    }),
  };

  return (
    // reducedMotion="user": Motion drops the springs itself under reduced motion, so only the fade runs
    <MotionConfig reducedMotion="user">
    <motion.div
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.3 }}
      className={cn("relative isolate h-[480px] w-full [container-type:size]", className)}
      {...rest}
    >
      {center != null && <div className="absolute inset-0 grid place-items-center">{center}</div>}
      {cards.map((c, i) => {
        const custom = { x: c.x, y: c.y, rotate: c.rotate ?? 0, delay: i * stagger };
        return (
          <div
            key={i}
            style={{ translate: `${c.x}cqw ${c.y}cqh`, rotate: `${custom.rotate}deg` }}
            className="pointer-events-none absolute top-1/2 left-1/2 flex size-0 items-center justify-center"
          >
            <motion.div
              custom={custom}
              variants={card}
              className={cn(
                "pointer-events-auto w-64 max-w-[40cqw] shrink-0 rounded-lg [overflow-wrap:anywhere] border border-border bg-card p-3 text-card-foreground shadow-lg motion-reduce:![transform:none]",
                cardClassName,
              )}
            >
              {c.content}
            </motion.div>
          </div>
        );
      })}
    </motion.div>
    </MotionConfig>
  );
}
