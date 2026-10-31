"use client";

import { useRef, useState, type ReactNode } from "react";
import { StickerCover, type StickerCoverHandle } from "./sticker-cover";

const PAGES = {
  Work: { title: "Selected work", body: "Posters, packaging and a few identities from the last two years." },
  About: { title: "About the studio", body: "A two-person practice drawing things by hand, then by machine." },
};
type Page = keyof typeof PAGES;

export const hello = <div className="rounded-2xl bg-background px-5 py-3 text-2xl font-semibold text-foreground shadow-lg">Hi there!</div>;

/** Two fake pages in a box; the nav swaps them under the cover. Shared with worst-case.tsx. */
export function CoverBox({ sticker = hello, sheetClassName, body, contained = true }: { sticker?: ReactNode; sheetClassName?: string; body?: ReactNode; contained?: boolean }) {
  const cover = useRef<StickerCoverHandle>(null);
  const [page, setPage] = useState<Page>("Work");
  return (
    <div className="relative flex h-[320px] w-[480px] flex-col overflow-hidden rounded-2xl border bg-background text-foreground">
      <nav aria-label="Demo pages" className="flex gap-4 border-b px-5 py-3 text-sm">
        {(Object.keys(PAGES) as Page[]).map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => p !== page && cover.current?.play(() => setPage(p))}
            className="text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground"
          >
            {p}
          </button>
        ))}
      </nav>
      <StickerCover ref={cover} contained={contained} sticker={sticker} className={sheetClassName} pageClassName="flex-1 overflow-auto p-5">
        <h2 className="text-3xl font-semibold tracking-tight">{PAGES[page].title}</h2>
        <p className="mt-2 text-muted-foreground">{PAGES[page].body}</p>
        {body}
      </StickerCover>
    </div>
  );
}

export default function StickerCoverDemo() {
  return <CoverBox />;
}
