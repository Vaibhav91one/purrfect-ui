"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SCALE = [1, 0.78, 0.6, 0.45, 0.3]; // size by distance from the centre
const K = 150; // spring stiffness; damping is critical, so there is no overshoot
const sclAt = (scl: number[], ad: number) => {
  const k = Math.min(3, Math.floor(ad));
  return scl[k] + (scl[k + 1] - scl[k]) * Math.min(1, ad - k);
};
const pathD = (w: number, h: number) => {
  const a = w < 600 ? 0.1 : 0.25;
  return `M ${0.04 * w} ${(0.5 + a) * h} C ${0.3 * w} ${(0.5 + a) * h} ${0.35 * w} ${(0.5 - a) * h} ${0.5 * w} ${0.5 * h} C ${0.65 * w} ${(0.5 + a) * h} ${0.7 * w} ${(0.5 - a) * h} ${0.96 * w} ${(0.5 - a) * h}`;
};

export interface PathCarouselProps extends Omit<ComponentProps<"div">, "children" | "ref"> {
  items: ReactNode[];
  /** Drive it from outside (an auto-advancing demo, a tab list). */
  active?: number;
  /** Called with the centred item's index whenever it changes. */
  onActive?: (index: number) => void;
  itemWidth?: number;
  itemHeight?: number;
  /** Accessible name of the carousel. */
  label?: string;
}

/**
 * Items ride a curved path, the centre one biggest. Scroll over it, swipe, use the arrow keys while focus is in it, or
 * click a neighbour to rotate; a spring moves the rotation and every frame writes position, size and fade straight to the
 * nodes, so React never re-renders while it moves. With 3+ items it loops. It fills its parent, so give the parent a height.
 * Every listener is on the carousel itself: the page scrolls and keys work as usual everywhere else. Reduced motion jumps
 * instead of gliding.
 */
export function PathCarousel({ items, active, onActive, itemWidth = 300, itemHeight = 220, label = "Carousel", className, ...rest }: PathCarouselProps) {
  const box = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const live = useRef<HTMLSpanElement>(null);
  const api = useRef<{ select: (i: number) => void; step: (m: number) => void }>({ select() {}, step() {} });
  // the frame loop outlives renders: it calls the latest onActive through this ref
  const emitRef = useRef(onActive);
  useEffect(() => {
    emitRef.current = onActive;
  });
  const n = items.length;

  useEffect(() => {
    const st = box.current;
    const svg = path.current;
    if (!st || !svg || !n) return;
    const L = [...st.querySelectorAll<HTMLElement>("[data-cell]")];
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = mq.matches;
    const onMq = (e: MediaQueryListEvent) => { reduce = e.matches; };
    mq.addEventListener("change", onMq);
    const scl = [...SCALE];
    let gap = 36, base = 1, pts: { s: number; x: number }[] = [], len = 1, x0 = 0;
    let rot = 0, target = 0, vel = 0, raf = 0, last = 0, act = -1;
    const inf = n >= 3;
    const clamp = (v: number) => (inf ? v : Math.max(0, Math.min(n - 1, v)));
    const norm = (v: number) => (inf ? ((Math.round(v) % n) + n) % n : clamp(Math.round(v)));
    const wrapd = (x: number) => x - n * Math.round(x / n);
    const wOf = (ad: number) => itemWidth * base * sclAt(scl, ad);
    const xOf = (d: number) => {
      const a = Math.abs(d), k = Math.floor(a);
      let x = 0;
      for (let j = 1; j <= k; j++) x += (wOf(j - 1) + wOf(j)) / 2 + gap * base;
      const f = a - k;
      if (f > 0) x += f * ((wOf(k) + wOf(k + 1)) / 2 + gap * base);
      return Math.sign(d) * x;
    };
    // offset-distance is a path fraction, but spacing is in x pixels: look the fraction up from the sampled path
    const sAtX = (x: number) => {
      let a = 0, b = pts.length - 1;
      while (b - a > 1) {
        const m = (a + b) >> 1;
        if (pts[m].x < x) a = m; else b = m;
      }
      const p = pts[a], q = pts[b], f = q.x === p.x ? 0 : (x - p.x) / (q.x - p.x);
      return ((p.s + (q.s - p.s) * f) / len) * 100;
    };
    const render = () => {
      if (!pts.length) return;
      const lo = pts[0].x, hi = pts[pts.length - 1].x;
      L.forEach((el, i) => {
        const d = inf ? wrapd(i - rot) : i - rot, ad = Math.abs(d), xd = x0 + xOf(d);
        const edge = Math.max(0, Math.min(1, Math.min(xd - lo, hi - xd) / (itemWidth * 0.3 * base)));
        const op = (ad <= 1 ? 1 - ad * 0.25 : Math.max(0, (1.45 - ad) / 0.45) * 0.75) * edge;
        el.style.offsetDistance = sAtX(Math.max(lo, Math.min(hi, xd))) + "%";
        el.style.transform = `scale(${(sclAt(scl, ad) * base).toFixed(3)})`;
        el.style.opacity = op.toFixed(3);
        el.style.zIndex = String(Math.round(100 - ad * 10));
        el.style.visibility = op < 0.02 ? "hidden" : "";
      });
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      if (reduce) { rot = target; vel = 0; } else { vel += ((target - rot) * K - vel * 2 * Math.sqrt(K)) * dt; rot += vel * dt; }
      render();
      raf = Math.abs(target - rot) > 0.0008 || Math.abs(vel) > 0.0008 ? requestAnimationFrame(frame) : 0;
      if (!raf) { rot = target; last = 0; render(); }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const announce = () => {
      const a = norm(target);
      if (a === act) return;
      const had = L.some((el) => el.contains(document.activeElement));
      act = a;
      // roving focus: only the centred slide is a tab stop, and focus follows it when it was on a slide
      L.forEach((el, i) => {
        el.tabIndex = i === a ? 0 : -1;
        if (i === a) el.setAttribute("aria-current", "true");
        else el.removeAttribute("aria-current");
      });
      if (had) L[a].focus({ preventScroll: true });
      if (live.current) live.current.textContent = `${a + 1} of ${n}`;
      emitRef.current?.(a);
    };
    const go = (i: number) => { target = clamp(Math.round(i)); announce(); kick(); };
    const step = (m: number) => go(Math.round(target) + m);
    api.current = { step, select: (i) => go(Math.round(target) + (inf ? wrapd(i - Math.round(target)) : i - Math.round(target))) };

    const layout = () => {
      const w = st.clientWidth, h = st.clientHeight;
      if (!w) return;
      const d = pathD(w, h);
      svg.setAttribute("d", d);
      len = svg.getTotalLength() || 1;
      pts = Array.from({ length: 241 }, (_, i) => { const s = (i / 240) * len; return { s, x: svg.getPointAtLength(s).x }; });
      x0 = pts[120].x;
      const narrow = w < 600;
      scl[1] = narrow ? 0.62 : 0.78;
      gap = narrow ? 14 : 36;
      base = Math.max(0.4, Math.min(1.3, h / (itemHeight * 1.15), w / (itemWidth * (1 + 2 * scl[1]) + 2 * gap + 48)));
      L.forEach((el) => { el.style.offsetPath = `path('${d}')`; });
      render();
    };
    layout();
    announce();
    const ro = new ResizeObserver(layout);
    ro.observe(st);

    // wheel only counts over the carousel, and arrows only while focus is in it, so the rest of the page is untouched
    let acc = 0, lock = 0, idle: ReturnType<typeof setTimeout> | undefined, tx = 0, ty = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      const dv = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      // without the loop, the first and last item hand the wheel back to the page instead of trapping it
      if (!inf && (Math.round(target) + Math.sign(dv) < 0 || Math.round(target) + Math.sign(dv) > n - 1)) return;
      e.preventDefault();
      if (performance.now() < lock) { acc = 0; return; }
      acc += dv; // trackpads fire many small deltas: one step per ~60px, then a short lock so inertia doesn't skip items
      clearTimeout(idle);
      idle = setTimeout(() => (acc = 0), 160);
      if (Math.abs(acc) >= 60) { step(Math.sign(acc)); acc = 0; lock = performance.now() + (reduce ? 0 : 520); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as Element).closest?.("input,textarea,select,[contenteditable=true],[role=radiogroup],[role=tablist],[role=slider]")) return;
      const m = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key];
      if (m) { e.preventDefault(); step(m); }
    };
    const onTs = (e: TouchEvent) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const onTe = (e: TouchEvent) => {
      const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
      // horizontal swipes only: a vertical one belongs to the page (touch-action: pan-y)
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    };
    st.addEventListener("wheel", onWheel, { passive: false }); // on the carousel only: the rest of the page scrolls off the main thread
    st.addEventListener("keydown", onKey);
    st.addEventListener("touchstart", onTs, { passive: true });
    st.addEventListener("touchend", onTe, { passive: true });
    return () => {
      st.removeEventListener("wheel", onWheel);
      st.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      st.removeEventListener("touchstart", onTs);
      st.removeEventListener("touchend", onTe);
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      ro.disconnect();
      api.current = { select() {}, step() {} };
    };
  }, [n, itemWidth, itemHeight]);

  // drive it from outside
  useEffect(() => {
    if (active !== undefined) api.current.select(active);
  }, [active]);

  return (
    <div ref={box} role="region" aria-roledescription="carousel" aria-label={label} className={cn("relative size-full touch-pan-y", className)} {...rest}>
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
        <path ref={path} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
      </svg>
      <span ref={live} aria-live="polite" aria-atomic className="sr-only" />
      {items.map((item, i) => (
        <div
          key={i}
          data-cell
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${n}`}
          tabIndex={i === 0 ? 0 : -1}
          onClick={() => api.current.select(i)}
          onKeyDown={(e) => {
            if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              api.current.select(i);
            }
          }}
          // hidden until the first layout places it on the path, so hydration never shows the items piled in a corner
          style={{ width: itemWidth, height: itemHeight, offsetRotate: "0deg", opacity: 0 }}
          className="absolute top-0 left-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {item}
        </div>
      ))}
    </div>
  );
}
