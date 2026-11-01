// Dev-only fixture (not in registry.json, never installed): the realistic worst content for StickerPop, shown at /dev?c=sticker-pop.
import type { ReactNode } from "react";
import { LoaderBox } from "./demo";
import { StickerPop } from "./sticker-pop";

export const states: Record<string, ReactNode> = {
  Demo: <LoaderBox />,
  // a missing file never pops (no empty flash), wide and tall photos letterboxed, a long non-Latin alt
  "Worst case": <LoaderBox stickers={["/demo/missing-sticker.jpg", "/demo/scenery.jpg", "/demo/city.jpg", "/demo/hiker.jpg"]} stickerClassName="object-contain bg-muted" />,
  "One sticker": <LoaderBox stickers={["/demo/canal.jpg"]} />,
  "Inline, extreme tilt": (
    <div className="grid h-64 place-items-center">
      <StickerPop src="/demo/storm.jpg" rotate={170} alt="ومرحبا 欢迎 a very long alternative text that should never show while loading" className="size-40 rounded-full border-4 border-background object-cover" />
    </div>
  ),
};
