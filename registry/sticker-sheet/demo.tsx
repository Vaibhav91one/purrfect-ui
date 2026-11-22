"use client";

import { Google_Sans } from "next/font/google";
import { useSound } from "@/components/providers/sound-provider";
import { DEVFEST_STICKERS, StickerSheet } from "./sticker-sheet";

const HOLO = DEVFEST_STICKERS.map((s) => ({ ...s, finish: "holo" as const }));

// the stickers' typeface on the site; an install falls back to the system sans unless it sets --sticker-sheet-font
export const stickerFont = Google_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--sticker-sheet-font" });

// It makes its own sounds, so it follows the site's Sound switch and turns off the site's hover cue.
export default function StickerSheetDemo({ playing = true, finish = "gloss", compact = false }: { playing?: boolean; finish?: "gloss" | "holo"; compact?: boolean }) {
  const { enabled } = useSound();
  return (
    <div data-hover-sound="off" className={`grid place-items-center ${compact ? "h-[520px] w-[360px]" : "h-[600px] w-[480px]"} ${stickerFont.variable}`}>
      <StickerSheet stickers={finish === "holo" ? HOLO : DEVFEST_STICKERS} paused={!playing} sound={enabled} className="h-full w-full" />
    </div>
  );
}
