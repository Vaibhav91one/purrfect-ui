"use client";

import type { ComponentItem } from "@/lib/components-data";
import { CardFace } from "./component-card";
import { openSheet } from "./use-sheet";

/** A card that opens its dialog in place. Still a real link, so open-in-new-tab and no-JS go to /components?c=slug. The link
 *  is laid over the face, not around it: some demos (hover-preview, roll-link) hold links, and <a> can't nest. */
export function CardLink({ item, className }: { item: ComponentItem; className: string }) {
  return (
    <div className={`${className} has-[>a:focus-visible]:outline-2 has-[>a:focus-visible]:outline-offset-2 has-[>a:focus-visible]:outline-accent`}>
      <CardFace item={item} />
      <a
        href={`/components?c=${item.slug}`}
        aria-label={`Open ${item.name}`}
        data-cuelume-open
        className="absolute inset-0 outline-none"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          openSheet(item.slug, e.currentTarget.parentElement!);
        }}
      />
    </div>
  );
}
