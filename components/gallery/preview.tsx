"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, type ReactNode } from "react";
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

/** Draws children at their natural size and scales them to fit whatever box they sit in. `fill`: scale by width only and stretch the height to the box. */
function Fit({ nat, max = 1, min = 0, pad = 24, fill = false, cover = false, children }: { nat: [number, number]; max?: number; min?: number; pad?: number; fill?: boolean; cover?: boolean; children: ReactNode }) {
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
    <div ref={box} className="absolute inset-0 overflow-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
  // eslint-disable-next-line @next/next/no-img-element -- a static poster the card box already sizes
  if (!live) return item.clip ? <img src={`/previews/${item.slug}.jpg`} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : null;
  return (
    <Fit nat={item.nat} max={max} min={min} pad={pad} fill={item.fill} cover={cover}>
      <div inert={inert} aria-hidden={inert || undefined} className="grid size-full place-items-center">
        <Demo slug={item.slug} playing={playing} speed={speed} opts={inert ? { ...opts, card: true } : opts} />
      </div>
    </Fit>
  );
}
