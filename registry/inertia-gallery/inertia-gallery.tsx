"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InertiaGalleryItem {
  src?: string;
  node?: ReactNode;
  alt?: string;
  href?: string;
  title?: ReactNode;
}

export type InertiaGalleryLayout = "slider" | "list";
type L = InertiaGalleryLayout;

export interface InertiaGalleryProps extends Omit<ComponentProps<"div">, "children" | "ref"> {
  items: InertiaGalleryItem[];
  layout?: InertiaGalleryLayout;
  defaultLayout?: InertiaGalleryLayout;
  onLayoutChange?: (layout: InertiaGalleryLayout) => void;
  onActiveChange?: (index: number) => void;
  intro?: boolean;
  friction?: number;
  frameWidth?: number;
  frameHeight?: number;
  bar?: boolean;
  label?: string;
}

type Tw = { o: Record<string, number>; k: string; b: number; a?: number; t0: number; d: number; e: (t: number) => number; done?: () => void };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const wrap = (x: number, n: number) => x - n * Math.floor((x + n / 2) / n);
const mod = (x: number, n: number) => ((x % n) + n) % n;
const pad = (n: number) => String(n).padStart(2, "0");
const str = (v: unknown) => (typeof v === "string" ? v : undefined);
const out2 = (t: number) => 1 - (1 - t) ** 3; // gsap power2.out
const out4 = (t: number) => 1 - (1 - t) ** 5; // gsap power4.out
const inOut3 = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2); // gsap power3.inOut
const SQ = { x: 0, y: 0, w: 8, h: 8, black: 1, zoom: 0.4 };

/** Fills its parent: give the parent a height. */
export function InertiaGallery({
  items,
  layout,
  defaultLayout = "list",
  onLayoutChange,
  onActiveChange,
  intro = false,
  friction = 0.97,
  frameWidth = 240,
  frameHeight = 320,
  bar = true,
  label = "Gallery",
  className,
  ...rest
}: InertiaGalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  const [own, setOwn] = useState(defaultLayout);
  const mode = layout ?? own;
  const [active, setActive] = useState(0);
  const n = items.length;
  const [need, setNeed] = useState(12);
  const M = n <= 1 ? n : n * Math.ceil(need / n);
  const keep = useRef({ k: 0, mode, played: false });
  const api = useRef<{ setMode: (m: L) => void } | null>(null);
  const emit = useRef(onActiveChange);
  useEffect(() => {
    emit.current = onActiveChange;
  });

  useEffect(() => {
    const box = root.current;
    const kp = keep.current;
    if (!box || !n) return;
    const F = [...box.querySelectorAll<HTMLElement>("[data-fr]")].map((el) => ({
      el,
      im: el.querySelector<HTMLElement>("[data-im]")!,
      bk: el.querySelector<HTMLElement>("[data-bk]")!,
      st: { x: 0, y: 0, w: 1, h: 1, black: 0, zoom: 0.9, op: 1 },
      cw: 1,
      ch: 1,
      T: "",
      I: "",
      B: -1,
      O: -1,
      off: false,
    }));
    const ac = new AbortController(), signal = ac.signal;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = mq.matches;
    mq.addEventListener("change", (e) => { reduce = e.matches; }, { signal });

    const G = {
      mode: kp.mode, off: 0, vel: 0, W: 0, H: 0, act: -1, trans: false, intro: false, want: kp.mode,
      touch: false, visible: false, raf: 0, last: 0, snapT: 0,
      g0: null as null | { off: number; k: number },
      drag: null as null | { id: number; x: number; y: number; dist: number; touch: boolean },
      dragged: 0,
    };
    let tws: Tw[] = [];
    const tween = (o: object, to: Record<string, number>, d: number, e: Tw["e"], delay = 0, done?: () => void) => {
      const t0 = performance.now() + delay * 1000, ks = Object.keys(to);
      ks.forEach((k, j) => tws.push({ o: o as Tw["o"], k, b: to[k], t0, d: d * 1000, e, done: j === ks.length - 1 ? done : undefined }));
      kick();
    };
    const stepTweens = (now: number) => {
      const fin: (() => void)[] = [];
      tws = tws.filter((t) => {
        if (now < t.t0) return true;
        if (t.a === undefined) {
          t.a = t.o[t.k];
          // gsap overwrite: "auto"
          tws.forEach((u) => { if (u !== t && u.o === t.o && u.k === t.k && u.a !== undefined) u.d = -1; });
        }
        if (t.d < 0) return false;
        const p = t.d ? Math.min(1, (now - t.t0) / t.d) : 1;
        t.o[t.k] = t.a + (t.b - t.a) * t.e(p);
        if (p < 1) return true;
        if (t.done) fin.push(t.done);
        return false;
      });
      fin.forEach((f) => f());
    };
    const isSnap = (t: Tw) => t.o === (G as object) && t.k === "off";
    const snapping = () => tws.some(isSnap);
    const killSnap = () => { tws = tws.filter((t) => !isSnap(t)); };

    const sizeOf = (m: L) => {
      const sl = m === "slider", s = Math.min(sl ? 2 : 1, (G.H * (sl ? 0.8 : 0.42)) / frameHeight, (G.W * 0.9) / frameWidth);
      return { w: frameWidth * s, h: frameHeight * s };
    };
    const unitOf = (m: L) => sizeOf(m)[m === "list" ? "h" : "w"];
    const k0 = () => Math.round(G.off);
    const g0 = () => ({ off: G.off, k: k0() });
    const coord = (i: number) => (M === 1 ? 0 : wrap(i - G.off, M) * unitOf(G.mode));
    const place = (m: InertiaGalleryLayout, c: number) => {
      const s = sizeOf(m), l = m === "list";
      return { x: l ? 0 : c, y: l ? c : 0, ...s };
    };
    const setBase = (m: L) => {
      const s = sizeOf(m);
      F.forEach((f) => { f.cw = s.w; f.ch = s.h; f.el.style.width = s.w + "px"; f.el.style.height = s.h + "px"; });
    };
    const layoutWrite = () => F.forEach((f, i) => Object.assign(f.st, place(G.mode, coord(i))));
    const render = () => {
      const { W, H } = G, fx = (v: number) => v.toFixed(1), f4 = (v: number) => v.toFixed(4);
      F.forEach((f) => {
        const s = f.st, l = W / 2 + s.x - s.w / 2, t = H / 2 + s.y - s.h / 2;
        const off = l > W + 40 || l + s.w < -40 || t > H + 40 || t + s.h < -40;
        if (off !== f.off) { f.off = off; f.el.style.visibility = off ? "hidden" : ""; }
        if (off) return;
        const T = `translate3d(${fx(l)}px,${fx(t)}px,0) scale(${f4(s.w / f.cw)},${f4(s.h / f.ch)})`;
        if (T !== f.T) f.el.style.transform = f.T = T;
        const z = s.zoom, mx = (f.cw * (1 / z - 1)) / 2, my = (f.ch * (1 / z - 1)) / 2;
        const tx = reduce ? 0 : clamp((-0.4 * clamp(s.x / W, -1, 1) * f.cw) / z, -mx, mx);
        const ty = reduce ? 0 : clamp((-0.6 * clamp(s.y / H, -1, 1) * f.ch) / z, -my, my);
        const I = `translate3d(${fx(tx)}px,${fx(ty)}px,0) scale(${f4(1 / z)})`;
        if (I !== f.I) f.im.style.transform = f.I = I;
        if (s.black !== f.B) f.bk.style.opacity = String((f.B = s.black));
        if (s.op !== f.O) f.el.style.opacity = String((f.O = s.op));
      });
    };
    const busy = () => G.trans || G.intro;
    const announce = () => {
      const a = mod(k0(), M) % n;
      if (busy() || a === G.act) return;
      setActive((G.act = a));
      emit.current?.(a);
    };

    const fr = () => (G.touch ? friction ** 2.7 : friction);
    const tick = (now: number) => {
      G.raf = 0;
      if (!G.visible || !G.W) { G.last = 0; return; }
      const k = Math.min(4, (now - (G.last || now)) / 16.667);
      G.last = now;
      stepTweens(now);
      if (!busy()) {
        if (!reduce) {
          if (!snapping()) G.off += (G.vel * k) / (unitOf(G.mode) || 1);
          G.vel *= fr() ** k;
        }
        if (Math.abs(G.vel) < 0.01) G.vel = 0;
        layoutWrite();
      }
      render();
      announce();
      if (tws.length || (G.vel && !reduce)) G.raf = requestAnimationFrame(tick);
      else G.last = 0;
    };
    function kick() { if (!G.raf && G.visible) G.raf = requestAnimationFrame(tick); }

    const snapTo = (k: number, key = false) => {
      killSnap(); clearTimeout(G.snapT); G.vel = 0; G.g0 = null;
      if (reduce) { G.off = k; kick(); }
      else tween(G, { off: k }, key ? 0.25 : 0.8, key ? out4 : out2);
    };
    // a nudge goes back, more moves at least one frame
    const scheduleSnap = (ms: number) => {
      clearTimeout(G.snapT);
      G.snapT = window.setTimeout(() => {
        if (busy()) return;
        const g = G.g0 ?? g0();
        const moved = G.off + G.vel / (1 - fr()) / unitOf(G.mode) - g.off;
        let b = Math.round(g.off + moved);
        if (Math.abs(moved) < 0.15) b = g.k;
        else if (b === g.k) b = g.k + Math.sign(moved);
        snapTo(b);
      }, reduce ? 120 : ms);
    };
    const locked = () => busy() || M <= 1;

    box.addEventListener("wheel", (e) => {
      if (e.ctrlKey || locked()) return;
      e.preventDefault();
      const d = G.mode === "slider" && Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      killSnap(); G.touch = false; G.g0 ??= g0(); G.vel += d * 0.03 * (e.deltaMode ? 16 : 1);
      kick(); scheduleSnap(500);
    }, { passive: false, signal });
    box.addEventListener("pointerdown", (e) => {
      G.dragged = 0;
      if (locked() || e.button !== 0 || (e.target as Element).closest("[data-bar]")) return;
      G.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dist: 0, touch: e.pointerType === "touch" };
      G.g0 ??= g0();
      clearTimeout(G.snapT);
    }, { signal });
    box.addEventListener("pointermove", (e) => {
      const d = G.drag;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      d.x = e.clientX; d.y = e.clientY; d.dist += Math.hypot(dx, dy);
      if (d.dist > 5) {
        if (!box.hasPointerCapture(e.pointerId)) box.setPointerCapture(e.pointerId);
        killSnap(); G.touch = d.touch;
        // touch swipes horizontally; vertical pans scroll the page
        G.vel -= (G.mode === "list" && !d.touch ? dy : dx) * (d.touch ? 0.2 : 0.1);
        kick();
      }
    }, { signal });
    const onUp = (e: PointerEvent) => {
      const d = G.drag;
      if (!d || e.pointerId !== d.id) return;
      G.drag = null; G.dragged = d.dist;
      if (d.dist > 5) scheduleSnap(1000);
      else G.g0 = null;
    };
    box.addEventListener("pointerup", onUp, { signal });
    box.addEventListener("pointercancel", onUp, { signal });
    box.addEventListener("click", (e) => {
      if (G.dragged > 5) { e.preventDefault(); e.stopPropagation(); G.dragged = 0; return; }
      const a = (e.target as Element).closest<HTMLElement>("[data-fr]");
      if (!a || locked()) return;
      const i = Number(a.dataset.i), here = mod(k0(), M);
      if (i !== here || snapping() || Math.abs(G.vel) > 0.05) { e.preventDefault(); snapTo(k0() + wrap(i - here, M)); }
    }, { capture: true, signal });
    box.addEventListener("keydown", (e) => {
      if (e.target !== box || e.metaKey || e.ctrlKey || e.altKey || locked()) return;
      const k = Math.round(tws.find(isSnap)?.b ?? G.off);
      const to = (j: number) => snapTo(k + wrap(j - mod(k, n), n), true);
      const m = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
      if (m) snapTo(k + m, true);
      else if (e.key === "Home") to(0);
      else if (e.key === "End") to(n - 1);
      else if (e.key === "Enter") return F[mod(k, M)]?.el.click();
      else return;
      e.preventDefault();
    }, { signal });

    const setMode = (m: L) => {
      G.want = m;
      if (G.intro || m === G.mode && !G.trans) return;
      killSnap(); clearTimeout(G.snapT); G.vel = 0;
      const a = k0(), ia = mod(a, M);
      const finish = () => {
        G.mode = kp.mode = m; setBase(m); G.off = a; layoutWrite(); G.trans = false;
        if (G.want !== m) setMode(G.want);
      };
      G.trans = true;
      if (reduce) {
        // fade in before finish(), so a queued switch can't leave G.trans stuck
        F.forEach((f, i) => tween(f.st, { op: 0 }, 0.15, out2, 0, i ? undefined : () => {
          F.forEach((g) => tween(g.st, { op: 1 }, 0.2, out2));
          finish();
        }));
        return;
      }
      let left = F.length;
      F.forEach((f, i) => {
        const d = wrap(i - ia, M);
        tween(f.st, place(m, d * unitOf(m)), 1.5, inOut3, 0.06 * Math.max(0, Math.min(M >> 1, 5) - Math.abs(d)), () => { if (!--left) finish(); });
      });
    };
    api.current = { setMode };

    const playIntro = () => {
      kp.played = G.intro = true;
      const ia = mod(k0(), M), sp = Math.min(32, (G.W * 0.9) / M);
      F.forEach((f, i) => {
        const to = place(G.mode, coord(i));
        Object.assign(f.st, SQ, { op: 1 });
        tween(f.st, { x: wrap(i - ia, M) * sp }, 1.75, inOut3, 0.5);
        tween(f.st, { black: 0 }, 2, inOut3, 0.5);
        tween(f.st, { ...to, zoom: 0.9 }, 2.5, inOut3, 2, i ? undefined : () => { G.intro = false; G.act = -1; setMode(G.want); });
      });
    };

    let stale = false, measured = false;
    const show = () => { render(); kick(); };
    const measure = () => {
      G.W = box.clientWidth; G.H = box.clientHeight;
      if (!G.W) return;
      const nd = Math.max(12, Math.ceil(Math.max(G.H / unitOf("list"), G.W / unitOf("slider"))) + 4);
      if (n > 1 && n * Math.ceil(nd / n) !== M) { stale = true; setNeed(nd); return; }
      measured = true;
      if (busy()) return;
      setBase(G.mode); layoutWrite(); show();
      start();
    };
    const start = () => {
      if (stale || !measured || !G.visible || kp.played) return;
      if (intro && !reduce) playIntro();
      else kp.played = true;
      show();
    };
    G.W = box.clientWidth; G.H = box.clientHeight;
    G.off = kp.k;
    if (G.W) { setBase(G.mode); layoutWrite(); }
    if (intro && !kp.played && !reduce) F.forEach((f) => Object.assign(f.st, SQ, { op: 0 }));
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    const io = new IntersectionObserver(([en]) => {
      if ((G.visible = en.isIntersecting)) { start(); show(); }
    });
    io.observe(box);
    return () => {
      kp.k = k0();
      cancelAnimationFrame(G.raf);
      clearTimeout(G.snapT);
      ro.disconnect();
      io.disconnect();
      ac.abort();
      api.current = null;
    };
  }, [n, M, friction, frameWidth, frameHeight, intro]);

  useEffect(() => {
    api.current?.setMode(mode);
  }, [mode]);

  const pick = (m: L) => {
    if (layout === undefined) setOwn(m);
    onLayoutChange?.(m);
  };
  const cur = items[active];

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={n > 1 ? 0 : undefined}
      className={cn(
        "relative size-full touch-pan-y overflow-hidden select-none rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        className,
      )}
      {...rest}
    >
      {Array.from({ length: M }, (_, i) => {
        const it = items[i % n], clone = i >= n;
        const body = (
          <>
            <div data-im className="absolute inset-0 origin-center">
              {/* check-ignore: duration a slow hover drift on artwork, the source's 0.9s */}
              <div className="size-full transition-[scale] duration-900 ease-out group-hover/fr:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover/fr:scale-100">
                {it.node ??
                  (it.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.src} alt={clone ? "" : (it.alt ?? "")} draggable={false} loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} className="block size-full object-cover" />
                  ) : null)}
              </div>
            </div>
            <i data-bk className="pointer-events-none absolute inset-0 bg-foreground opacity-0" />
          </>
        );
        const common = {
          "data-fr": "",
          "data-i": i,
          style: { opacity: 0 },
          className: "group/fr absolute top-0 left-0 block origin-top-left overflow-hidden bg-muted [contain:strict]",
          tabIndex: -1,
          ...(clone ? { "aria-hidden": true } : { "aria-label": it.alt ?? str(it.title) ?? `${i + 1} of ${n}` }),
        };
        return it.href ? (
          <a key={i} href={it.href} draggable={false} {...common}>{body}</a>
        ) : (
          <div key={i} role={clone ? undefined : "img"} {...common}>{body}</div>
        );
      })}

      <span aria-live="polite" aria-atomic className="sr-only">
        {n ? <>{cur?.title ?? cur?.alt ?? "Item"}, {active + 1} of {n}</> : null}
      </span>

      {bar && n > 0 && (
        <div data-bar className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 text-xs">
          <span className="flex min-w-0 gap-1 rounded-full bg-background/80 px-3 py-1.5 text-foreground">
            <span className="shrink-0 tabular-nums">{pad(active + 1)} / {pad(n)}</span>
            {cur?.title ? <span title={str(cur.title)} className="min-w-0 truncate text-muted-foreground">· {cur.title}</span> : null}
          </span>
          <div role="group" aria-label="Layout" className="flex shrink-0 gap-1 rounded-full bg-background/80 p-1">
            {(["list", "slider"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => pick(m)}
                className="rounded-full px-2.5 py-1 text-muted-foreground capitalize transition-colors duration-200 ease-out hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
