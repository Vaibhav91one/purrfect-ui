"use client";

import { ArrowUpRight } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { ComponentItem } from "@/lib/components-data";
import { cardLabel } from "./card";
import { Preview } from "./preview";
import { SiteClip } from "./site-clip";

/** What is inside a card: the live preview, its name on hover and the open arrow (hidden where the card is only a stop on a path). */
export function CardFace({ item, hideLabel = false }: { item: ComponentItem; hideLabel?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const staged = !!item.clip || item.nat[0] >= 1000; // a clip, or a demo drawn at a full page's size, sits in the padded stage
  // cards loop while on screen, so you can see what each one does without opening it
  return (
    <>
      {/* a staged card shows the component in a padded stage, and the clip (if any) swaps in only inside it (same ratio as the clip) */}
      <div ref={ref} data-hover-sound="off" className={staged ? "absolute inset-[12%] overflow-hidden rounded-2xl" : "absolute inset-0"}>
        <Preview item={item} playing={inView && !reduce} pad={staged ? 0 : undefined} />
        {item.clip && <SiteClip slug={item.slug} hover className="pointer-events-none absolute inset-0 size-full object-cover" />}
      </div>
      {!hideLabel && (
        <>
          <ArrowUpRight aria-hidden className="absolute top-4 right-4 size-5 text-muted-foreground opacity-0 transition-opacity duration-200 ease-snappy group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" />
          <span className={cardLabel}>
            <span className="sr-only">Open </span>
            {item.name}
          </span>
        </>
      )}
    </>
  );
}
