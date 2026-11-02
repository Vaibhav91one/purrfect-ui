"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The footer wordmark. The cats on its letters settle in (one after another) the first time it scrolls into view, and
 * while it is on screen they look at the pointer: heads (`[data-head]`) turn, eyes (`[data-look]`) shift.
 */
export function Wordmark({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let at: [number, number] | null = null;
    const look = () => {
      frame = 0;
      const [x, y] = at!;
      // heads turn like the hero cat's (sign -1 on a mirrored cat)
      el.querySelectorAll<SVGGElement>("[data-head]").forEach((h) => {
        const r = h.ownerSVGElement!.getBoundingClientRect();
        const dx = (x - (r.left + r.width / 2)) / innerWidth;
        h.style.rotate = `${Number(h.dataset.head) * Math.max(-8, Math.min(8, dx * 24))}deg`;
      });
      // eyes (cut out of a mask, so measured from their svg) shift toward the pointer by up to `data-look` units
      el.querySelectorAll<SVGCircleElement>("[data-look]").forEach((e) => {
        const svg = e.ownerSVGElement!;
        const r = svg.getBoundingClientRect();
        const s = r.width / svg.viewBox.baseVal.width;
        const dx = x - (r.left + e.cx.baseVal.value * s);
        const dy = y - (r.top + e.cy.baseVal.value * s);
        const d = Math.hypot(dx, dy) || 1;
        const max = Number(e.dataset.look) * Math.min(1, d / 120);
        e.style.translate = `${(dx / d) * max}px ${(dy / d) * max}px`;
      });
    };
    const move = (e: PointerEvent) => {
      at = [e.clientX, e.clientY];
      frame ||= requestAnimationFrame(look);
    };
    const watch = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setSeen(true);
        if (!watch) return;
        if (e.isIntersecting) addEventListener("pointermove", move);
        else removeEventListener("pointermove", move);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <p ref={ref} aria-hidden data-in={seen || undefined} className={className}>
      {children}
    </p>
  );
}
