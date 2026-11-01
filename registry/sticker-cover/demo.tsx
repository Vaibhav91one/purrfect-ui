/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDown } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { FitTitle } from "@/registry/fit-title/fit-title";
import { cn } from "@/lib/utils";
import { StickerCover, type StickerCoverHandle } from "./sticker-cover";

/** A die-cut photo sticker: white edge and a soft drop shadow, like the source's hand-drawn stickers. */
export const sticker = (
  <span className="block size-24 overflow-hidden rounded-full border-[5px] border-white shadow-[0_6px_18px_rgba(0,0,0,.18)]">
    <img src="/demo/jellyfish.jpg" alt="" className="size-full object-cover" />
  </span>
);

const WORKS = [
  ["fjord", "Fjord"],
  ["canyon", "Canyon"],
  ["coast", "Coast"],
  ["field", "Field"],
];

// the source site's three pages, small: the home list, the shop's fitted title, the about portrait
const PAGES = {
  Work: (
    <div className="grid min-h-0 flex-1 grid-cols-[1fr_96px_1fr] gap-4 overflow-hidden px-4 pt-3 text-[11px]">
      <ol className="grid content-start gap-3">
        {WORKS.map(([, title], i) => (
          <li key={title} className="flex gap-4">
            <span className="text-muted-foreground">0{i + 1}/</span>
            {title}
          </li>
        ))}
      </ol>
      <div className="grid content-start gap-1.5">
        {WORKS.slice(0, 3).map(([file, title], i) => (
          <img key={file} src={`/demo/${file}.jpg`} alt={title} className={cn("w-full rounded-sm object-cover", i === 1 ? "h-28" : "h-16")} />
        ))}
      </div>
    </div>
  ),
  Shop: (
    <div className="px-4 text-[11px]">
      <FitTitle max={150} className="leading-none">shop</FitTitle>
      <p className="mt-2 flex justify-between">
        shop here <ArrowDown className="size-3" />
      </p>
      <p className="mt-4 text-muted-foreground">New prints are on the way.</p>
    </div>
  ),
  About: (
    <div className="grid grid-cols-[112px_1fr] gap-6 px-4 pt-3">
      <img src="/demo/hiker.jpg" alt="" className="h-36 w-full rounded-[2px] object-cover" />
      <p className="text-[15px] leading-snug">A small studio drawing portraits by hand, then by machine: pencil-soft lines and a lot of hair.</p>
    </div>
  ),
};
type Page = keyof typeof PAGES;

/** A site window on a wallpaper: header nav, three pages swapped under the cover. Shared with worst-case.tsx. */
export function CoverBox({ sticker: st = sticker, sheetClassName = "bg-muted", body, contained = true }: { sticker?: ReactNode; sheetClassName?: string; body?: ReactNode; contained?: boolean }) {
  const cover = useRef<StickerCoverHandle>(null);
  const [page, setPage] = useState<Page>("Work");
  const go = (p: Page) => p !== page && cover.current?.play(() => setPage(p));
  const link = "relative after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 aria-[current=page]:after:scale-x-100";
  return (
    <div className="relative h-[320px] w-[480px] overflow-hidden rounded-2xl">
      <img src="/demo/valley.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-4 overflow-hidden rounded-xl bg-background text-foreground shadow-xl">
        {/* the header is part of the page, as on the source: it drifts up and goes inert under the cover too */}
        <StickerCover ref={cover} contained={contained} sticker={st} className={sheetClassName} pageClassName={cn("flex h-full flex-col overflow-auto", page === "Shop" && "bg-muted")}>
          <nav aria-label="Demo pages" className="grid h-10 shrink-0 grid-cols-[1fr_auto_auto] items-center gap-10 px-4 text-[11px]">
            <button type="button" onClick={() => go("Work")} className="justify-self-start">
              ©Studio
            </button>
            <span className="flex gap-3">
              {(["Shop", "About"] as const).map((p) => (
                <button key={p} type="button" aria-current={p === page ? "page" : undefined} onClick={() => go(p)} className={link}>
                  {p}
                </button>
              ))}
            </span>
            <button type="button" onClick={() => go("About")} className={link}>
              Get in touch
            </button>
          </nav>
          {PAGES[page]}
          {body}
        </StickerCover>
      </div>
    </div>
  );
}

export default function StickerCoverDemo() {
  return <CoverBox />;
}
