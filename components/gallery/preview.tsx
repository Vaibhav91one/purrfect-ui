"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import type { ComponentItem } from "@/lib/components-data";
import { PixelWave } from "@/registry/pixel-wave/pixel-wave";
import type { DemoProps } from "./demos/demos";

// every demo (and the registry components they draw) is one chunk, fetched when the first preview mounts, not with the page
// until it arrives the box shows the site's loader, not a blank
const Demo = dynamic(() => import("./demos/demos").then((m) => m.Demo), {
  ssr: false,
  loading: () => <PixelWave size={6} gap={2} className="text-muted-foreground" aria-label="Loading the preview" />,
});

// fetch the demos' chunk once the page is idle, so the first previews to scroll in find it already there (no loader flash)
if (typeof window !== "undefined") (window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1500)))(() => void import("./demos/demos"));

const subscribePhone = (cb: () => void) => {
  const q = matchMedia("(max-width: 639px)");
  q.addEventListener("change", cb);
  return () => q.removeEventListener("change", cb);
};
const usePhone = () => useSyncExternalStore(subscribePhone, () => matchMedia("(max-width: 639px)").matches, () => false);

/** Draws children at their natural size and scales them to fit whatever box they sit in. `fill`: scale by width only and stretch the height to the box. */
// a control a finger can reach: a tap that misses every one by up to this far (rendered px, 44 across) goes to the nearest
const CONTROLS = "a[href],button,summary,input,select,textarea,label,[role=button],[role=tab],[role=switch],[role=link],[role=menuitem]";
const SLOP = 22;
function nearestControl(box: HTMLElement, x: number, y: number) {
  let best: HTMLElement | undefined, d = Infinity;
  for (const el of box.querySelectorAll<HTMLElement>(CONTROLS)) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
    const dist = Math.hypot(dx, dy);
    if (dist <= SLOP && dist < d) {
      best = el;
      d = dist;
    }
  }
  return best;
}

function Fit({ nat, max = 1, min = 0, pad = 24, fill = false, cover = false, slop = false, children }: { nat: [number, number]; max?: number; min?: number; pad?: number; fill?: boolean; cover?: boolean; slop?: boolean; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const b = box.current!;
    const ro = new ResizeObserver(() => {
      const w = (b.clientWidth - pad) / nat[0], h = (b.clientHeight - pad) / nat[1];
      // cover: fill the box edge to edge (a demo's wallpaper frame becomes the card's background), cropping the overflow
      const fit = Math.max(0.1, cover ? Math.max(w, h) : Math.min(max, w, fill ? Infinity : h));
      // `min` (the dialog on a phone): a demo that would shrink below 0.8 of it is drawn at `min` and the box pans, so its text stays
      // readable. Full-page mock-ups (1200+ wide) stay whole: cropping a page is worse than a small thumbnail of it.
      const pan = !fill && !cover && fit < min * 0.8 && nat[0] < 1200 && innerWidth < 640;
      const s = pan ? min : fit;
      const el = inner.current!;
      el.style.scale = String(s);
      if (fill) el.style.height = `${b.clientHeight / s}px`; // edge to edge, top to bottom
      b.style.overflow = pan ? "auto" : "";
      // panning: pinned top-left (a scaled box only grows right and down) and centred by hand on the axis that still fits
      el.style.transformOrigin = pan ? "0 0" : "";
      el.style.translate = pan ? "none" : "";
      el.style.left = pan ? `${Math.max(0, (b.clientWidth - nat[0] * s) / 2)}px` : "";
      el.style.top = pan ? `${Math.max(0, (b.clientHeight - nat[1] * s) / 2)}px` : "";
      if (pan) b.scrollLeft = Math.max(0, (nat[0] * s - b.clientWidth) / 2); // start on the middle of the demo
      // soft edges say there is more to pan to
      b.style.maskImage = pan && nat[0] * s > b.clientWidth ? "linear-gradient(to right, transparent, #000 20px, #000 calc(100% - 20px), transparent)" : "";
    });
    ro.observe(b);
    return () => ro.disconnect();
  }, [nat, max, min, pad, fill, cover]);
  return (
    <div
      ref={box}
      onClick={
        slop
          ? (e) => {
              // a demo scaled down to fit shrinks its controls under a fingertip: a tap that just misses one counts as a tap on it
              const t = e.target as HTMLElement;
              if (!matchMedia("(pointer: coarse)").matches || t.closest(CONTROLS) || getComputedStyle(t).cursor === "pointer") return;
              nearestControl(box.current!, e.clientX, e.clientY)?.click();
            }
          : undefined
      }
      // overscroll-contain only in the dialog (slop): on a grid card the box is overflow-hidden with a demo bigger than it, which counts as
      // a scroll container, and "contain" there made the page's wheel scroll stop dead whenever the pointer was over a card
      className={`absolute inset-0 overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden${slop ? " overscroll-contain" : ""}`}
    >
      <div ref={inner} style={{ width: nat[0], height: nat[1] }} className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
        {children}
      </div>
    </div>
  );
}

/**
 * The component's preview, scaled to its box. `inert` keeps clicks on the card, not on the demo inside it. In a card the demo is still; the dialog passes `playing`, `speed` and the extras.
 * `live={false}` (a card far from the viewport) draws only the clip poster, or nothing over the card's own background: no demo is mounted, so nothing loops or holds a WebGL context off screen.
 */
export function Preview({ item, inert = true, max = 1, min, pad, cover, live = true, playing, speed = 1, opts = {} }: { item: ComponentItem; inert?: boolean; max?: number; min?: number; pad?: number; cover?: boolean; live?: boolean } & Partial<DemoProps>) {
  const phone = usePhone();
  // eslint-disable-next-line @next/next/no-img-element -- a static poster the card box already sizes
  if (!live) return item.clip ? <img src={`/previews/${item.slug}.jpg`} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : null;
  const compact = phone && !inert && !!item.natPhone; // the dialog on a phone: a demo with its own phone layout (`natPhone`) draws that one, as the site it came from does
  return (
    <Fit nat={compact ? item.natPhone! : item.nat} max={max} min={min} pad={pad} fill={item.fill} cover={cover} slop={!inert}>
      <div inert={inert} aria-hidden={inert || undefined} className="grid size-full place-items-center">
        <Demo slug={item.slug} playing={playing} speed={speed} opts={inert ? { ...opts, card: true } : compact ? { ...opts, compact: true } : opts} />
      </div>
    </Fit>
  );
}
