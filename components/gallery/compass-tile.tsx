"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SPRING } from "@/lib/motion";
import { cardBase } from "./card";

const TICKS = Array.from({ length: 24 }, (_, i) => i);

/** The home grid's last tile: a blue compass whose needle points at the pointer. The whole tile links to /components. */
export function CompassTile({ count }: { count: number }) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLAnchorElement>(null);
  const dial = useRef<SVGSVGElement>(null);
  const angle = useMotionValue(45);
  const rotate = useSpring(angle, SPRING);
  const prev = useRef(45);

  useEffect(() => {
    if (reduce) return;
    const point = (x: number, y: number) => {
      const r = dial.current?.getBoundingClientRect();
      if (!r) return;
      const a = (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI + 90; // 0 = up
      prev.current += ((a - prev.current + 540) % 360) - 180; // unwrap so it turns the short way
      angle.set(prev.current);
      root.current?.setAttribute("data-live", "");
    };
    const move = (e: PointerEvent) => point(e.clientX, e.clientY);
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, [reduce, angle]);

  return (
    <Link ref={root} href="/components" data-cuelume-navigate aria-label={`View all ${count} components`} className={`${cardBase} bg-compass! block text-white`}>
      <svg ref={dial} viewBox="0 0 100 100" aria-hidden className="absolute top-1/2 left-1/2 w-[62%] -translate-x-1/2 -translate-y-[54%] overflow-visible">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.2" className="transition-[stroke-opacity] duration-200 [@media(hover:hover)]:group-hover:[stroke-opacity:0.9]" />
        {TICKS.map((i) => (
          <line key={i} x1="50" y1="6" x2="50" y2={i % 6 === 0 ? 14 : 10} stroke="currentColor" strokeOpacity={i % 6 === 0 ? 0.9 : 0.4} strokeWidth={i % 6 === 0 ? 1.6 : 1} transform={`rotate(${i * 15} 50 50)`} />
        ))}
        <text x="50" y="26" textAnchor="middle" fontSize="8" fill="currentColor" fillOpacity="0.9">
          N
        </text>
        <g className="compass-sway">
          <motion.g style={{ rotate: reduce ? 45 : rotate, transformOrigin: "50px 50px", transformBox: "view-box" }}>
            <path d="M50 18 L56 50 L44 50 Z" fill="currentColor" />
            <path d="M50 82 L56 50 L44 50 Z" fill="currentColor" fillOpacity="0.4" />
          </motion.g>
        </g>
        <circle cx="50" cy="50" r="3.4" fill="#1346e7" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      <span className="absolute bottom-3 left-3 max-w-[70%] text-xs font-light tracking-tight sm:bottom-6 sm:left-6 sm:text-lg">View all {count} components</span>
      <ArrowUpRight aria-hidden className="absolute right-3 bottom-3 size-4 sm:right-6 sm:bottom-6 sm:size-5" />
    </Link>
  );
}
