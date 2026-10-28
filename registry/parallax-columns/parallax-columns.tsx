"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

// ponytail: kept in step with SCROLL_SPRING in lib/motion.ts; duplicated so this file installs on its own
const SPRING = { stiffness: 200, damping: 30, mass: 0.4 };

/**
 * Three columns that scroll at different speeds (after Olivier Larose's smooth parallax scroll, without Lenis, so
 * native scrolling is untouched). `speeds` are viewport heights each column starts below its place; they rise into line as the section scrolls in. Reduced motion
 * makes it a plain static grid.
 */
export function ParallaxColumns({ columns, speeds = [0.12, 0.22, 0.05], className = "", container }: { columns: [ReactNode[], ReactNode[], ReactNode[]]; speeds?: [number, number, number]; className?: string; container?: RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const read = () => setVh(innerHeight);
    read();
    addEventListener("resize", read);
    return () => removeEventListener("resize", read);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"], container });
  // one hook call per column, written out: hooks can't live in a loop
  const k = reduce ? 0 : vh;
  const raw0 = useTransform(scrollYProgress, [0, 1], [k * speeds[0], 0]);
  const raw1 = useTransform(scrollYProgress, [0, 1], [k * speeds[1], 0]);
  const raw2 = useTransform(scrollYProgress, [0, 1], [k * speeds[2], 0]);
  // ease toward the scroll position (the tutorial gets this feel from Lenis; a spring keeps native scrolling)
  const y0 = useSpring(raw0, SPRING);
  const y1 = useSpring(raw1, SPRING);
  const y2 = useSpring(raw2, SPRING);
  const ys = [y0, y1, y2];
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div className="flex gap-3 sm:gap-4">
        {columns.map((items, c) => (
          <motion.ul key={c} style={{ y: ys[c] }} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </motion.ul>
        ))}
      </div>
    </div>
  );
}
