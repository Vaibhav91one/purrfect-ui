"use client";

import { ArrowUpRight } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import type { ComponentItem } from "@/lib/components-data";
import { cn } from "@/lib/utils";
import { cardLabel } from "./card";
import { Preview } from "./preview";
import { SiteClip } from "./site-clip";
import { openSheet } from "./use-sheet";

/** What is inside a card: the live preview, its name on hover and the open arrow (hidden where the card is only a stop on a path). */
export function CardFace({ item, hideLabel = false }: { item: ComponentItem; hideLabel?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const near = useInView(ref, { margin: "200px" }); // the demo is mounted only near the viewport
  const reduce = useReducedMotion();
  const staged = !!item.clip || item.nat[0] >= 1000; // a clip, or a demo drawn at a full page's size, sits in the padded stage
  // cards loop while on screen, so you can see what each one does without opening it
  return (
    <>
      {/* a staged card shows the component in a padded stage, and the clip (if any) swaps in only inside it (same ratio as the clip) */}
      <div ref={ref} data-hover-sound="off" className={staged ? "absolute inset-[12%] overflow-hidden rounded-2xl" : "absolute inset-0"}>
        <Preview item={item} live={near} playing={inView && !reduce} pad={staged ? 0 : undefined} />
        {item.clip && <SiteClip slug={item.slug} hover className="pointer-events-none absolute inset-0 size-full object-cover" />}
      </div>
      {!hideLabel && <CardMeta name={item.name} />}
    </>
  );
}

/** The open arrow top-right and the name bottom-left, both shown on hover or focus. `arrow`/`label` move them. */
function CardMeta({ name, arrow, label }: { name: string; arrow?: string; label?: string }) {
  return (
    <>
      <ArrowUpRight aria-hidden className={cn("absolute top-4 right-4 size-5 text-muted-foreground opacity-0 transition-opacity duration-200 ease-snappy group-hover:opacity-100 group-focus-visible:opacity-100 group-has-[a:focus-visible]:opacity-100 motion-reduce:transition-none", arrow)} />
      <span className={cn(cardLabel, label)}>
        <span className="sr-only">Open </span>
        {name}
      </span>
    </>
  );
}

/**
 * A /components grid card, bencho-style: the demo loops in the card at its own shape (masonry), inert so clicks open the dialog
 * (and page-level demos like the cursor stay inside it). Hovering plays the component on the real site it came from (if it
 * has a clip); the arrow and the name show as on the home grid.
 */
export function LiveCard({ item }: { item: ComponentItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const near = useInView(ref, { margin: "200px" }); // the demo is mounted only near the viewport
  const reduce = useReducedMotion();
  return (
    <div
      ref={ref}
      data-slug={item.slug}
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.name}`}
      data-cuelume-open
      onClick={() => openSheet(item.slug, ref.current)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openSheet(item.slug, ref.current); }
      }}
      className="group relative mb-3 w-full cursor-pointer break-inside-avoid overflow-hidden rounded-[28px] bg-card px-6 py-14 sm:px-10 sm:py-16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* every card shows the component in the same padded stage; the taller bands above and below hold the arrow and name,
          centred in them and lined up with the stage's edges. A card with a clip
          takes the clip's shape, so the whole recording shows uncropped; the rest take the demo's own shape (filled edge to edge) */}
      <div style={{ aspectRatio: item.clip ? `${item.clip.w} / ${item.clip.h}` : `${item.nat[0]} / ${item.nat[1]}` }} className="relative max-h-[404px] min-h-[160px] w-full overflow-hidden rounded-2xl">
        <Preview item={item} pad={0} cover live={near} playing={inView && !reduce} />
        {item.clip && <SiteClip slug={item.slug} hover className="pointer-events-none absolute inset-0 size-full object-cover" />}
      </div>
      <CardMeta name={item.name} arrow="top-[18px] right-6 sm:top-[22px] sm:right-10" label="bottom-[18px] left-6 max-w-[calc(100%-3rem)] sm:bottom-[22px] sm:left-10 sm:max-w-[calc(100%-5rem)]" />
    </div>
  );
}
