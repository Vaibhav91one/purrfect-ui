"use client";

import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

export interface NotchProps {
  /** What sits in the tab: a logo, a wordmark, a nav. */
  children: ReactNode;
  /** Fill of the tab and of its two curved shoulders. Any CSS colour. */
  color?: string;
  /** Radius of the lower corners and the size of the shoulders, in px. */
  radius?: number;
  /** Seconds to wait before the tab drops in. 1.05 follows the Armour hero's own sequence. */
  delay?: number;
  /** Gap in px between the container's top edge and the tab. Armour's hero uses 8, to line up with its inset photo. */
  offset?: number;
  /** Classes for the positioning wrapper (absolute, full width). */
  className?: string;
}

// one quarter-circle cut out of a square: the curve that blends the tab into the edge it hangs from
const SHOULDER = "M100 0H0v100C0 44.77 44.77 0 100 0";

/**
 * A tab that hangs from the top edge of its container, with inverse-rounded shoulders where it meets the edge, so it
 * reads as a notch cut into the frame. It drops in and fades up once on mount. Place it inside a `relative` container.
 * Reduced motion: it fades in without moving.
 */
export function Notch({ children, color = "#fff", radius = 32, delay = 1.05, offset = 0, className = "" }: NotchProps) {
  const reduce = useReducedMotion();
  const shoulder = { width: radius, height: radius, top: -0.1, fill: color } as const; // -0.1px hides the seam against the edge
  return (
    <motion.div
      role="presentation"
      className={`pointer-events-none absolute inset-x-0 z-50 flex justify-center px-8 ${className}`}
      style={{ top: offset }}
      initial={{ opacity: 0, transform: reduce ? "translateY(0px)" : "translateY(-26px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      // check-ignore: duration a one-off entrance, seen once per page load
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-auto relative isolate flex w-full max-w-[200px] items-center justify-center p-6 md:max-w-[500px]" style={{ background: color, borderRadius: `0 0 ${radius}px ${radius}px` } as CSSProperties}>
        <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute rotate-90" style={{ ...shoulder, left: -radius }}>
          <path d={SHOULDER} />
        </svg>
        <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute -scale-y-100 rotate-90" style={{ ...shoulder, right: -radius }}>
          <path d={SHOULDER} />
        </svg>
        <div className="relative z-10 flex items-center justify-center gap-2">{children}</div>
      </div>
    </motion.div>
  );
}
