"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { ComponentItem } from "@/lib/components-data";
import { DEMOS, type DemoProps } from "./demos/demos";

/** Draws children at their natural size and scales them to fit whatever box they sit in. `fill`: scale by width only and stretch the height to the box. */
function Fit({ nat, max = 1, pad = 24, fill = false, children }: { nat: [number, number]; max?: number; pad?: number; fill?: boolean; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const b = box.current!;
    const ro = new ResizeObserver(() => {
      const s = Math.max(0.1, Math.min(max, (b.clientWidth - pad) / nat[0], fill ? Infinity : (b.clientHeight - pad) / nat[1]));
      inner.current!.style.scale = String(s);
      if (fill) inner.current!.style.height = `${b.clientHeight / s}px`; // edge to edge, top to bottom
    });
    ro.observe(b);
    return () => ro.disconnect();
  }, [nat, max, pad, fill]);
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden">
      <div ref={inner} style={{ width: nat[0], height: nat[1] }} className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
        {children}
      </div>
    </div>
  );
}

/** The component's preview, scaled to its box. `inert` keeps clicks on the card, not on the demo inside it. In a card the demo is still; the dialog passes `playing`, `speed` and the extras. */
export function Preview({ item, inert = true, max = 1, pad, playing, speed = 1, opts = {} }: { item: ComponentItem; inert?: boolean; max?: number; pad?: number } & Partial<DemoProps>) {
  const Demo = DEMOS[item.slug];
  return (
    <Fit nat={item.nat} max={max} pad={pad} fill={item.fill}>
      <div inert={inert} aria-hidden={inert || undefined} className="grid size-full place-items-center">
        <Demo playing={playing} speed={speed} opts={opts} />
      </div>
    </Fit>
  );
}
