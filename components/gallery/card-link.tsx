"use client";

import type { ComponentItem } from "@/lib/components-data";
import { CardFace } from "./component-card";
import { openSheet } from "./use-sheet";

/** A card that opens its dialog in place. Still a real link, so open-in-new-tab and no-JS go to /components?c=slug. */
export function CardLink({ item, className }: { item: ComponentItem; className: string }) {
  return (
    <a
      href={`/components?c=${item.slug}`}
      data-cuelume-open
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        openSheet(item.slug, e.currentTarget);
      }}
    >
      <CardFace item={item} />
    </a>
  );
}
