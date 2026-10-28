"use client";

import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";

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

/**
 * Items ride a curved path, the centre one biggest. Scroll over it, swipe, press the arrow keys or click a neighbour to
 * rotate; a spring moves the rotation and every frame writes position, size and fade straight to the nodes, so React
 * never re-renders while it moves. With 3+ items it loops. It fills its parent, so give the parent a height.
 * Pass `active` to drive it from outside (an auto-advancing demo, a tab list). Reduced motion jumps instead of gliding.
 */
export function PathCarousel({ items, active, onActive, itemWidth = 300, itemHeight = 220, className = "" }: { items: ReactNode[]; active?: number; onActive?: (index: number) => void; itemWidth?: number; itemHeight?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const api = useRef<{ select: (i: number) => void; step: (m: number) => void }>({ select() {}, step() {} });
  const emit = useEffectEvent((i: number) => onActive?.(i));
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
      if (a !== act) { act = a; emit(a); }
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

    // wheel and arrows only count while the pointer is over it / it is mid-screen, so the page still scrolls
    let acc = 0, lock = 0, idle: ReturnType<typeof setTimeout> | undefined, tx = 0, ty = 0;
    const dialogOpen = () => !!document.querySelector("dialog[open]");
    const onWheel = (e: WheelEvent) => {
      if (dialogOpen() || e.ctrlKey || !st.contains(e.target as Node)) return;
      e.preventDefault();
      const dv = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (performance.now() < lock) { acc = 0; return; }
      acc += dv; // trackpads fire many small deltas: one step per ~60px, then a short lock so inertia doesn't skip items
      clearTimeout(idle);
      idle = setTimeout(() => (acc = 0), 160);
      if (Math.abs(acc) >= 60) { step(Math.sign(acc)); acc = 0; lock = performance.now() + (reduce ? 0 : 520); }
    };
    const onKey = (e: KeyboardEvent) => {
      const r = st.getBoundingClientRect();
      if (r.top > innerHeight / 2 || r.bottom < innerHeight / 2 || dialogOpen() || e.metaKey || e.ctrlKey || (e.target as Element).closest?.("input,textarea,select,[role=radiogroup]")) return;
      const m = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[e.key];
      if (m) { e.preventDefault(); step(m); }
    };
    const onTs = (e: TouchEvent) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const onTe = (e: TouchEvent) => {
      const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
      // horizontal swipes only: a vertical one belongs to the page (touch-action: pan-y)
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    };
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("keydown", onKey);
    st.addEventListener("touchstart", onTs, { passive: true });
    st.addEventListener("touchend", onTe, { passive: true });
    return () => {
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
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
    <div ref={box} role="group" aria-label="Carousel, scroll or use arrow keys" className={`relative size-full touch-pan-y ${className}`}>
      <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
        <path ref={path} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
      </svg>
      {items.map((item, i) => (
        <div
          key={i}
          data-cell
          role="button"
          tabIndex={0}
          onClick={() => api.current.select(i)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              api.current.select(i);
            }
          }}
          style={{ width: itemWidth, height: itemHeight, offsetRotate: "0deg" }}
          className="absolute top-0 left-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {item}
        </div>
      ))}
    </div>
  );
}
