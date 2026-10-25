"use client";

import { motion, type Transition } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { arcLayout, type Point } from "./arc";

// The ellipse the chips hang on is centred on the notch: it reaches ARC_PAD_X past each side and ARC_RY below its centre.
const ARC_PAD_X = 105;
const ARC_RY = 76;

/**
 * The chips that pop out of the notch. From `sm` up they are placed on a curve around it, spaced by their measured
 * size so every gap is equal (see arcLayout); below `sm` they just wrap in centred rows.
 */
export function ArcChips({ items, notchWidth, rowHeight, pop, reduce }: { items: ReactNode[]; notchWidth: number; rowHeight: number; pop: Transition; reduce: boolean | null }) {
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const [pos, setPos] = useState<Point[] | null>(null);
  const [sizes, setSizes] = useState<{ w: number; h: number }[]>([]);

  // measure on mount and whenever a chip changes size (the star count loads in later); state is set from the observer
  // callback, never synchronously in the effect
  useEffect(() => {
    const nodes = els.current.filter((n): n is HTMLDivElement => !!n);
    const measure = () => {
      const s = nodes.map((n) => ({ w: n.offsetWidth, h: n.offsetHeight }));
      setSizes(s);
      setPos(arcLayout(s, notchWidth / 2 + ARC_PAD_X, ARC_RY));
    };
    const ro = new ResizeObserver(measure);
    nodes.forEach((n) => ro.observe(n));
    return () => ro.disconnect();
  }, [notchWidth, items.length]);

  const mid = (items.length - 1) / 2;
  return (
    <div
      id="notch-arc"
      className="pointer-events-none absolute top-full left-1/2 flex w-[min(760px,calc(100vw-32px))] -translate-x-1/2 flex-wrap justify-center gap-2 pt-3 sm:block sm:h-0 sm:pt-0"
    >
      {items.map((item, i) => {
        const p = pos?.[i];
        const s = sizes[i];
        const away = Math.abs(i - mid);
        const style = p && s ? ({ "--x": `${p.x - s.w / 2}px`, "--y": `${p.y - rowHeight / 2 - s.h / 2}px` } as CSSProperties) : undefined;
        return (
          // outer div carries the position (CSS translate), the motion div the pop (transform), so they don't fight
          <div
            key={i}
            ref={(n) => {
              els.current[i] = n;
            }}
            className={`pointer-events-auto sm:absolute sm:top-0 sm:left-1/2 sm:translate-x-(--x) sm:translate-y-(--y) ${p ? "" : "sm:invisible"}`}
            style={style}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.4, y: -28 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { ...pop, delay: reduce ? 0 : away * 0.04 } }}
              exit={{ opacity: 0, scale: 0.6, y: -16, transition: { duration: reduce ? 0 : 0.12 } }}
            >
              {item}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
