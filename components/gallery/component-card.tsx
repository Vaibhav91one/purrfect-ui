"use client";

import { ArrowUpRight, Play, X } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import type { ComponentItem } from "@/lib/components-data";
import { cardLabel } from "./card";
import { Preview } from "./preview";
import { SiteClip } from "./site-clip";
import { openSheet } from "./use-sheet";

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
          <ArrowUpRight aria-hidden className="absolute top-4 right-4 size-5 text-muted-foreground opacity-0 transition-opacity duration-200 ease-snappy group-hover:opacity-100 group-focus-visible:opacity-100 group-has-[a:focus-visible]:opacity-100 motion-reduce:transition-none" />
          <span className={cardLabel}>
            <span className="sr-only">Open </span>
            {item.name}
          </span>
        </>
      )}
    </>
  );
}

const round = "grid size-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur transition-[opacity,scale] duration-200 ease-snappy hover:bg-background active:scale-95 focus-visible:outline-2 focus-visible:outline-accent motion-reduce:transition-none";
const reveal = "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100";

/**
 * A /components grid card, bencho-style: the demo loops in the card at its own shape (masonry), inert so clicks open the dialog
 * (and page-level demos like the cursor stay inside it). On hover the name shows bottom-left; bottom-right are ▶ (the component
 * on the real site it came from, if it has a clip) and ↗.
 */
export function LiveCard({ item }: { item: ComponentItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [clip, setClip] = useState(false);
  return (
    <div
      ref={ref}
      data-slug={item.slug}
      onPointerLeave={() => setClip(false)}
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.name}`}
      data-cuelume-open
      onClick={() => openSheet(item.slug, ref.current)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openSheet(item.slug, ref.current); }
      }}
      style={{ aspectRatio: `${item.nat[0]} / ${item.nat[1]}` }}
      className="group relative mb-3 cursor-pointer min-h-[240px] max-h-[484px] w-full break-inside-avoid overflow-hidden rounded-[28px] bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Preview item={item} pad={0} cover playing={inView && !reduce && !clip} />
      {clip && item.clip && <SiteClip slug={item.slug} className="absolute inset-0 size-full object-cover" />}
      <span className={`pointer-events-none absolute bottom-3.5 left-3.5 max-w-[60%] truncate rounded-full bg-background/80 px-3 py-1.5 text-sm text-foreground backdrop-blur transition-opacity duration-200 ease-snappy motion-reduce:transition-none ${reveal}`}>{item.name}</span>
      <div className={`absolute right-3 bottom-3 flex gap-2 transition-opacity duration-200 ease-snappy motion-reduce:transition-none ${reveal}`}>
        {item.clip && (
          <button type="button" aria-pressed={clip} aria-label={clip ? "Back to the live component" : `See ${item.name} on ${item.clip.label}`} onClick={(e) => { e.stopPropagation(); setClip((c) => !c); }} className={round}>
            {clip ? <X className="size-4" /> : <Play className="size-4 fill-current" />}
          </button>
        )}
        <span aria-hidden className={round}>
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </div>
  );
}
