"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { ComponentItem } from "@/lib/components-data";
import type { DemoProps } from "./demos/demos";

// every demo (and the registry components they draw) is one chunk, fetched when the first preview mounts, not with the page
const Demo = dynamic(() => import("./demos/demos").then((m) => m.Demo), { ssr: false });

/** Draws children at their natural size and scales them to fit whatever box they sit in. `fill`: scale by width only and stretch the height to the box. */
function Fit({ nat, max = 1, pad = 24, fill = false, cover = false, children }: { nat: [number, number]; max?: number; pad?: number; fill?: boolean; cover?: boolean; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const b = box.current!;
    const ro = new ResizeObserver(() => {
      const w = (b.clientWidth - pad) / nat[0], h = (b.clientHeight - pad) / nat[1];
      // cover: fill the box edge to edge (a demo's wallpaper frame becomes the card's background), cropping the overflow
      const s = Math.max(0.1, cover ? Math.max(w, h) : Math.min(max, w, fill ? Infinity : h));
      inner.current!.style.scale = String(s);
      if (fill) inner.current!.style.height = `${b.clientHeight / s}px`; // edge to edge, top to bottom
    });
    ro.observe(b);
    return () => ro.disconnect();
  }, [nat, max, pad, fill, cover]);
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
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
export function Preview({ item, inert = true, max = 1, pad, cover, live = true, playing, speed = 1, opts = {} }: { item: ComponentItem; inert?: boolean; max?: number; pad?: number; cover?: boolean; live?: boolean } & Partial<DemoProps>) {
  // eslint-disable-next-line @next/next/no-img-element -- a static poster the card box already sizes
  if (!live) return item.clip ? <img src={`/previews/${item.slug}.jpg`} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : null;
  return (
    <Fit nat={item.nat} max={max} pad={pad} fill={item.fill} cover={cover}>
      <div inert={inert} aria-hidden={inert || undefined} className="grid size-full place-items-center">
        <Demo slug={item.slug} playing={playing} speed={speed} opts={opts} />
      </div>
    </Fit>
  );
}
