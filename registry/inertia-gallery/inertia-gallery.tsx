"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InertiaGalleryItem {
  /** Image shown in the frame (cover-fit). */
  src?: string;
  /** Anything else to draw in the frame instead of an image. */
  node?: ReactNode;
  alt?: string;
  /** Clicking the centred frame follows it; clicking any other frame brings it to the centre first. */
  href?: string;
  /** Shown in the bar and announced when the frame is centred. */
  title?: ReactNode;
}

export type InertiaGalleryLayout = "slider" | "list";

export interface InertiaGalleryProps extends Omit<ComponentProps<"div">, "children" | "ref"> {
  items: InertiaGalleryItem[];
  /** Controlled layout. Pair with onLayoutChange. */
  layout?: InertiaGalleryLayout;
  /** Uncontrolled starting layout. */
  defaultLayout?: InertiaGalleryLayout;
  /** Called when the bar's List / Slider buttons ask for a layout. */
  onLayoutChange?: (layout: InertiaGalleryLayout) => void;
  /** Called with the centred item's index whenever it changes. */
  onActiveChange?: (index: number) => void;
  /** Play the squares intro the first time the gallery scrolls into view. */
  intro?: boolean;
  /** How much velocity survives each 60fps frame (0-1). Higher coasts further. Touch coasts shorter. */
  friction?: number;
  /** Largest list-mode frame, in px; it also sets the frame shape. Slider frames are twice as big. Both shrink to fit. */
  frameWidth?: number;
  frameHeight?: number;
  /** Show the bottom bar (title, counter, List / Slider buttons). */
  bar?: boolean;
  /** Accessible name of the gallery. */
  label?: string;
}

type St = { x: number; y: number; w: number; h: number; black: number; zoom: number; op: number };
type Frame = { el: HTMLElement; im: HTMLElement; bk: HTMLElement; st: St; cw: number; ch: number; T?: string; I?: string; B?: number; O?: number; off?: boolean };
type Tw = { o: Record<string, number>; k: string; b: number; a?: number; t0: number; d: number; e: (t: number) => number; done?: () => void };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const wrap = (x: number, n: number) => x - n * Math.floor((x + n / 2) / n); // into [-n/2, n/2)
const mod = (x: number, n: number) => ((x % n) + n) % n;
const pad = (n: number) => String(n).padStart(2, "0");
const out2 = (t: number) => 1 - (1 - t) ** 3; // gsap power2.out
const inOut3 = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2); // gsap power3.inOut

/**
 * An endless strip of frames you push with the wheel or by dragging: it coasts, then settles by intent (a nudge returns,
 * anything more moves at least one frame) and every image drifts inside its frame. "list" stacks the frames in a column,
 * "slider" lays them out in a row at twice the size; switching moves every frame to its new spot over 1.5s, outer frames
 * first. With `intro` the frames start as small foreground squares that spread out, take on colour and grow into place.
 * Arrow keys move one frame and Home / End jump to the first and last item while the strip has focus. Touch only takes
 * horizontal swipes (touch-action: pan-y), so the page still scrolls on phones. One frame loop writes transforms straight
 * to the nodes, runs only while something moves and pauses off screen. It fills its parent, so give the parent a height.
 * Reduced motion: no parallax or coasting (it jumps to the settled frame), layout switches crossfade, no intro.
 */
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
  // copies on the strip so the loop always overfills the box (one item stays a single, still frame)
  const [need, setNeed] = useState(12);
  const M = n <= 1 ? n : n * Math.ceil(need / n);
  const frames = Array.from({ length: M }, (_, i) => items[i % n]);
  // per instance: survives the engine restarting (new copy count) so the centred frame, layout and intro stay put
  const keep = useRef({ k: 0, mode, played: false });
  const api = useRef<{ setMode: (m: InertiaGalleryLayout) => void } | null>(null);
  const emit = useRef(onActiveChange);
  useEffect(() => {
    emit.current = onActiveChange;
  });

  useEffect(() => {
    const box = root.current;
    const kp = keep.current;
    if (!box || !n) return;
    const F: Frame[] = [...box.querySelectorAll<HTMLElement>("[data-fr]")].map((el) => ({
      el,
      im: el.querySelector<HTMLElement>("[data-im]")!,
      bk: el.querySelector<HTMLElement>("[data-bk]")!,
      st: { x: 0, y: 0, w: 1, h: 1, black: 0, zoom: 0.9, op: 1 },
      cw: 1,
      ch: 1,
    }));
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = mq.matches;
    const onMq = (e: MediaQueryListEvent) => { reduce = e.matches; };
    mq.addEventListener("change", onMq);

    const G = {
      mode: kp.mode, off: 0, vel: 0, W: 0, H: 0, act: -1, trans: false, intro: false, want: kp.mode,
      touch: false, visible: false, raf: 0, last: 0, snapT: undefined as ReturnType<typeof setTimeout> | undefined,
      g0: null as null | { off: number; k: number },
      drag: null as null | { id: number; x: number; y: number; dist: number; touch: boolean },
      dragged: 0,
    };
    let tws: Tw[] = [];
    const tween = (o: object, to: Record<string, number>, d: number, e: Tw["e"], delay = 0, done?: () => void) => {
      const t0 = performance.now() + delay * 1000, ks = Object.keys(to);
      ks.forEach((k, j) => tws.push({ o: o as Record<string, number>, k, b: to[k], t0, d: d * 1000, e, done: j === ks.length - 1 ? done : undefined }));
      kick();
    };
    const stepTweens = (now: number) => {
      const fin: (() => void)[] = [];
      tws = tws.filter((t) => {
        if (now < t.t0) return true;
        if (t.a === undefined) {
          t.a = t.o[t.k];
          // a newer tween on the same value takes over (gsap overwrite: "auto")
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
    const snapping = () => tws.some((t) => t.o === (G as unknown as Record<string, number>) && t.k === "off");
    const killSnap = () => { tws = tws.filter((t) => !(t.o === (G as unknown as Record<string, number>) && t.k === "off")); };

    // sizes: list frames are frameWidth x frameHeight at most, slider frames twice that; both shrink to fit the box
    const sizeOf = (m: InertiaGalleryLayout) => {
      const f = m === "slider" ? 2 : 1, cap = m === "slider" ? 0.8 : 0.42;
      const s = Math.min(f, (G.H * cap) / frameHeight, (G.W * 0.9) / frameWidth);
      return { w: frameWidth * s, h: frameHeight * s };
    };
    const unitOf = (m: InertiaGalleryLayout) => { const s = sizeOf(m); return m === "list" ? s.h : s.w; };
    const k0 = () => Math.round(G.off); // off is in frames, so a resize or a layout switch keeps the centred frame
    const coord = (i: number) => wrap(i - G.off, M) * unitOf(G.mode);
    const place = (m: InertiaGalleryLayout, c: number) => {
      const s = sizeOf(m);
      return { x: m === "list" ? 0 : c, y: m === "list" ? c : 0, w: s.w, h: s.h };
    };
    const setBase = (m: InertiaGalleryLayout) => {
      const s = sizeOf(m);
      F.forEach((f) => { f.cw = s.w; f.ch = s.h; f.el.style.width = s.w + "px"; f.el.style.height = s.h + "px"; });
    };
    const layoutWrite = () => F.forEach((f, i) => Object.assign(f.st, place(G.mode, M === 1 ? 0 : coord(i))));
    const render = () => {
      const { W, H } = G, cx = W / 2, cy = H / 2;
      F.forEach((f) => {
        const s = f.st, l = cx + s.x - s.w / 2, t = cy + s.y - s.h / 2;
        const off = l > W + 40 || l + s.w < -40 || t > H + 40 || t + s.h < -40;
        if (off !== f.off) { f.off = off; f.el.style.visibility = off ? "hidden" : ""; }
        if (off) return;
        const T = `translate3d(${l.toFixed(1)}px,${t.toFixed(1)}px,0) scale(${(s.w / f.cw).toFixed(4)},${(s.h / f.ch).toFixed(4)})`;
        if (T !== f.T) { f.T = T; f.el.style.transform = T; }
        // parallax: the image is zoomed past its frame and slides against the frame's distance from the centre
        const z = s.zoom, mx = (f.cw * (1 / z - 1)) / 2, my = (f.ch * (1 / z - 1)) / 2;
        const tx = reduce ? 0 : clamp((-0.4 * clamp(s.x / W, -1, 1) * f.cw) / z, -mx, mx);
        const ty = reduce ? 0 : clamp((-0.6 * clamp(s.y / H, -1, 1) * f.ch) / z, -my, my);
        const I = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${(1 / z).toFixed(4)})`;
        if (I !== f.I) { f.I = I; f.im.style.transform = I; }
        if (s.black !== f.B) { f.B = s.black; f.bk.style.opacity = String(s.black); }
        if (s.op !== f.O) { f.O = s.op; f.el.style.opacity = String(s.op); }
      });
    };
    const announce = () => {
      if (G.trans || G.intro) return;
      const a = mod(k0(), M) % n;
      if (a === G.act) return;
      G.act = a;
      setActive(a); // only when the centred item changes, never per frame
      emit.current?.(a);
    };

    const tick = (now: number) => {
      G.raf = 0;
      if (!G.visible || !G.W) { G.last = 0; return; }
      const k = Math.min(4, (now - (G.last || now)) / 16.667);
      G.last = now;
      stepTweens(now);
      if (!G.trans && !G.intro) {
        if (!snapping() && !reduce) G.off += (G.vel * k) / (unitOf(G.mode) || 1);
        if (!reduce) G.vel *= (G.touch ? friction ** 2.7 : friction) ** k;
        if (Math.abs(G.vel) < 0.01) G.vel = 0;
        layoutWrite();
      }
      render();
      announce();
      if (tws.length || (G.vel && !reduce)) G.raf = requestAnimationFrame(tick);
      else G.last = 0; // settled: the loop sleeps until the next input
    };
    function kick() { if (!G.raf && G.visible) G.raf = requestAnimationFrame(tick); }

    const snapTo = (k: number) => {
      killSnap(); clearTimeout(G.snapT); G.vel = 0; G.g0 = null;
      if (reduce) { G.off = k; kick(); }
      else tween(G, { off: k }, 0.8, out2);
    };
    // settle by intent: a nudge (< 15% of a frame) goes back, anything more moves at least one frame that way
    const scheduleSnap = (ms: number) => {
      clearTimeout(G.snapT);
      G.snapT = setTimeout(() => {
        if (G.trans || G.intro) return;
        const u = unitOf(G.mode), fr = G.touch ? friction ** 2.7 : friction;
        const g = G.g0 ?? { off: G.off, k: k0() };
        const moved = G.off + G.vel / (1 - fr) / u - g.off; // in frames, including the coast still to come
        let b = reduce ? Math.round(g.off + moved) : k0();
        if (Math.abs(moved) < 0.15) b = g.k;
        else if (b === g.k) b = g.k + Math.sign(moved);
        snapTo(b);
      }, reduce ? 120 : ms);
    };
    const locked = () => G.trans || G.intro || M <= 1;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || locked()) return;
      e.preventDefault(); // only over the strip: the rest of the page keeps native, passive scrolling
      const d = G.mode === "slider" && Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      killSnap(); G.touch = false; G.g0 ??= { off: G.off, k: k0() }; G.vel += d * 0.03 * (e.deltaMode ? 16 : 1);
      kick(); scheduleSnap(500);
    };
    const onDown = (e: PointerEvent) => {
      G.dragged = 0;
      if (locked() || e.button !== 0 || (e.target as Element).closest("[data-bar]")) return;
      G.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dist: 0, touch: e.pointerType === "touch" };
      G.g0 ??= { off: G.off, k: k0() };
      clearTimeout(G.snapT);
    };
    const onMove = (e: PointerEvent) => {
      const d = G.drag;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      d.x = e.clientX; d.y = e.clientY; d.dist += Math.hypot(dx, dy);
      if (d.dist > 5) {
        if (!box.hasPointerCapture(e.pointerId)) box.setPointerCapture(e.pointerId);
        killSnap(); G.touch = d.touch;
        // touch drives either layout with horizontal swipes: vertical pans belong to the page
        G.vel -= (G.mode === "list" && !d.touch ? dy : dx) * (d.touch ? 0.2 : 0.1);
        kick();
      }
    };
    const onUp = (e: PointerEvent) => {
      const d = G.drag;
      if (!d || e.pointerId !== d.id) return;
      G.drag = null; G.dragged = d.dist;
      if (d.dist > 5) scheduleSnap(1000);
      else G.g0 = null;
    };
    const onClick = (e: MouseEvent) => {
      if (G.dragged > 5) { e.preventDefault(); e.stopPropagation(); G.dragged = 0; return; }
      const a = (e.target as Element).closest<HTMLElement>("[data-fr]");
      if (!a || locked()) return;
      const i = Number(a.dataset.i), here = mod(k0(), M);
      // a side frame comes to the centre first; the settled centre one follows its link
      if (i !== here || snapping() || Math.abs(G.vel) > 0.05) { e.preventDefault(); snapTo(k0() + wrap(i - here, M)); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.target !== box || e.metaKey || e.ctrlKey || e.altKey || locked()) return;
      const k = Math.round(snapping() ? tws.find((t) => t.k === "off")!.b : G.off);
      const to = (j: number) => k + wrap(j - mod(k, n), n); // nearest copy of item j
      const m = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
      if (m) snapTo(k + m);
      else if (e.key === "Home") snapTo(to(0));
      else if (e.key === "End") snapTo(to(n - 1));
      else if (e.key === "Enter") { F[mod(k, M)]?.el.click(); return; }
      else return;
      e.preventDefault();
    };

    // List <-> Slider: every frame tweens to the other layout over 1.5s, outer frames first
    const setMode = (m: InertiaGalleryLayout) => {
      G.want = m;
      if (m === G.mode || G.trans || G.intro) return;
      killSnap(); clearTimeout(G.snapT); G.vel = 0;
      const a = k0(), ia = mod(a, M), h = Math.floor(M / 2);
      const finish = () => {
        G.mode = m; kp.mode = m; setBase(m); G.off = a; layoutWrite(); G.trans = false;
        if (G.want !== m) setMode(G.want);
      };
      G.trans = true;
      if (reduce) {
        // crossfade instead of moving
        F.forEach((f, i) => tween(f.st, { op: 0 }, 0.15, out2, 0, i ? undefined : () => {
          finish();
          F.forEach((g) => tween(g.st, { op: 1 }, 0.2, out2));
        }));
        return;
      }
      let left = F.length;
      F.forEach((f, i) => {
        const d = wrap(i - ia, M);
        // check-ignore: duration the layout switch is a page-level move, kept at the source's 1.5s
        tween(f.st, place(m, d * unitOf(m)), 1.5, inOut3, 0.06 * (h - Math.abs(d)), () => { if (!--left) finish(); });
      });
    };
    api.current = { setMode };

    // Intro: small foreground squares in a row spread out, take on colour, then grow into place
    const playIntro = () => {
      kp.played = true;
      G.intro = true;
      const ia = mod(k0(), M), sp = Math.min(32, (G.W * 0.9) / M);
      F.forEach((f, i) => {
        const d = wrap(i - ia, M), to = place(G.mode, M === 1 ? 0 : coord(i));
        Object.assign(f.st, { x: 0, y: 0, w: 8, h: 8, black: 1, zoom: 0.4, op: 1 });
        // check-ignore: duration a first-view intro, the source's timing
        tween(f.st, { x: d * sp }, 1.75, inOut3, 0.5);
        // check-ignore: duration a first-view intro, the source's timing
        tween(f.st, { black: 0 }, 2, inOut3, 0.5);
        // check-ignore: duration a first-view intro, the source's timing
        tween(f.st, { ...to, zoom: 0.9 }, 2.5, inOut3, 2, i ? undefined : () => { G.intro = false; G.act = -1; if (G.want !== G.mode) setMode(G.want); });
      });
    };

    const measure = () => {
      G.W = box.clientWidth; G.H = box.clientHeight;
      if (!G.W) return;
      // enough copies to overfill the longer of the two layouts, plus a few off each end
      const nd = Math.max(12, Math.ceil(Math.max(G.H / unitOf("list"), G.W / unitOf("slider"))) + 4);
      // a new copy count restarts the engine: hold the intro for that run instead of cutting it short
      if (n > 1 && n * Math.ceil(nd / n) !== M) { stale = true; setNeed(nd); return; }
      measured = true;
      if (G.trans || G.intro) return;
      setBase(G.mode); layoutWrite(); render(); kick();
      start();
    };
    // first view, once measured with the final copy count: play the intro or just show the frames
    const start = () => {
      if (stale || !measured || !G.visible || kp.played) return;
      if (intro && !reduce) playIntro();
      else kp.played = true;
      render(); kick();
    };
    G.W = box.clientWidth; G.H = box.clientHeight;
    G.off = kp.k;
    if (G.W) { setBase(G.mode); layoutWrite(); }
    const pending = intro && !kp.played && M > 0;
    if (pending && !reduce) F.forEach((f) => Object.assign(f.st, { x: 0, y: 0, w: 8, h: 8, black: 1, zoom: 0.4, op: 0 }));
    let stale = false, measured = false;
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    const io = new IntersectionObserver(([en]) => {
      G.visible = en.isIntersecting;
      if (!G.visible) return;
      start();
      render(); kick();
    });
    io.observe(box);

    box.addEventListener("wheel", onWheel, { passive: false });
    box.addEventListener("pointerdown", onDown);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerup", onUp);
    box.addEventListener("pointercancel", onUp);
    box.addEventListener("click", onClick, true);
    box.addEventListener("keydown", onKey);
    return () => {
      kp.k = k0();
      cancelAnimationFrame(G.raf);
      clearTimeout(G.snapT);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener("change", onMq);
      box.removeEventListener("wheel", onWheel);
      box.removeEventListener("pointerdown", onDown);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerup", onUp);
      box.removeEventListener("pointercancel", onUp);
      box.removeEventListener("click", onClick, true);
      box.removeEventListener("keydown", onKey);
      api.current = null;
    };
  }, [n, M, friction, frameWidth, frameHeight, intro]);

  useEffect(() => {
    api.current?.setMode(mode);
  }, [mode]);

  const pick = (m: InertiaGalleryLayout) => {
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
      {frames.map((it, i) => {
        const clone = i >= n;
        const body = (
          <>
            <div data-im className="absolute inset-0 origin-center">
              {/* hover zoom on its own layer: the engine writes the parent's transform */}
              {/* check-ignore: duration a slow hover drift on artwork, the source's 0.9s */}
              <div className="size-full transition-[scale] duration-900 ease-out group-hover/fr:scale-[1.06] motion-reduce:transition-none">
                {it.node ??
                  (it.src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a registry file cannot assume next/image
                    <img src={it.src} alt={clone ? "" : (it.alt ?? "")} draggable={false} className="block size-full object-cover" />
                  ) : null)}
              </div>
            </div>
            <i data-bk className="pointer-events-none absolute inset-0 bg-foreground opacity-0" />
          </>
        );
        const common = {
          "data-fr": "",
          "data-i": i,
          // hidden until the engine's first layout, so hydration never shows the frames piled in a corner
          style: { opacity: 0 },
          className: "group/fr absolute top-0 left-0 block origin-top-left overflow-hidden bg-muted [contain:strict]",
          ...(clone ? { "aria-hidden": true, tabIndex: -1 } : { "aria-label": it.alt ?? (typeof it.title === "string" ? it.title : `${i + 1} of ${n}`), tabIndex: -1 }),
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
          <span className="min-w-0 truncate rounded-full bg-background/80 px-3 py-1.5 text-foreground">
            <span className="tabular-nums">{pad(active + 1)} / {pad(n)}</span>
            {cur?.title ? <span className="text-muted-foreground"> · {cur.title}</span> : null}
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
