// Dev-only fixture (not in registry.json, never installed): the realistic worst content for StickerCover, shown at /dev?c=sticker-cover.
import type { ReactNode } from "react";
import { CoverBox } from "./demo";

export const states: Record<string, ReactNode> = {
  Demo: <CoverBox />,
  "Worst case": (
    <CoverBox
      sheetClassName="bg-primary"
      // an unbreakable sticker label and a page far taller than the box: the sticker wraps, the page scrolls inside its box
      sticker={<div className="max-w-[80%] rounded-2xl bg-background px-4 py-2 font-semibold break-all text-foreground shadow-lg">Supercalifragilisticexpialidocious-unbreakable-label-ومرحبا-欢迎-🎉🎉🎉</div>}
      body={Array.from({ length: 40 }, (_, i) => (
        <p key={i} className="mt-2">
          Row {i + 1}: <a href="#top" className="underline">a focusable link</a> that goes inert while covered.
        </p>
      ))}
    />
  ),
  "No sticker": <CoverBox sticker={null} />,
  "Full screen": <CoverBox contained={false} />,
};
