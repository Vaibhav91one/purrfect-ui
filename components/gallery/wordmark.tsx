"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** The footer wordmark. The cats on its letters settle in (one after another) the first time it scrolls into view. */
export function Wordmark({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <p ref={ref} aria-hidden data-in={seen || undefined} className={className}>
      {children}
    </p>
  );
}
