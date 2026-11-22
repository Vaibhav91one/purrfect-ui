// Dev-only fixture (not in registry.json, never installed): the realistic worst content for StickerSheet, shown at /dev?c=sticker-sheet.
import type { ReactNode } from "react";
import { stickerFont } from "./demo";
import { StickerSheet, type StickerSpec } from "./sticker-sheet";

// a copy of the default sheet: this server file cannot read data exported from the client component
const DEVFEST_STICKERS: StickerSpec[] = [
  { id: "android", x: 34.7, y: 25.4, width: 45 },
  { id: "devfest", x: 105.5, y: 31.4, width: 59 },
  { id: "vibe-coder", x: 36, y: 67, width: 51 },
  { id: "attended", x: 111.5, y: 82, width: 48 },
  { id: "gemma", x: 35.5, y: 112.8, width: 47 },
  { id: "gemini", x: 106.6, y: 122.6, width: 60 },
  { id: "google-cloud", x: 107, y: 153.7, width: 60 },
  { id: "gdg", x: 32.2, y: 173.3, width: 43 },
  { id: "firebase", x: 103, y: 190.8, width: 67 },
];

const wrap = (node: ReactNode) => <div className={stickerFont.variable}>{node}</div>;

export const states: Record<string, ReactNode> = {
  Demo: wrap(<StickerSheet className="h-[600px] w-[480px]" />),
  // every sticker in holo film; none at all; one alone; 30 crammed and overlapping; an image that fails to load
  "All holo": wrap(<StickerSheet stickers={DEVFEST_STICKERS.map((s) => ({ ...s, finish: "holo" as const }))} className="h-[600px] w-[480px]" />),
  Empty: wrap(<StickerSheet stickers={[]} className="h-[600px] w-[480px]" />),
  "One sticker": wrap(<StickerSheet stickers={[{ id: "android", x: 74, y: 105, width: 60 }]} className="h-[600px] w-[480px]" />),
  "Thirty, overlapping": wrap(<StickerSheet stickers={Array.from({ length: 30 }, (_, i) => ({ ...DEVFEST_STICKERS[i % 9], x: 20 + ((i * 37) % 110), y: 20 + ((i * 53) % 170) }))} className="h-[600px] w-[480px]" />),
  "Broken image": wrap(<StickerSheet stickers={[{ src: "/nope.png", x: 74, y: 60, width: 50 }, { id: "gemini", x: 74, y: 140, width: 60 }]} className="h-[600px] w-[480px]" />),
  "Wide and short": wrap(<StickerSheet className="h-[300px] w-[720px]" />),
  Tiny: wrap(<StickerSheet className="h-[160px] w-[120px]" />),
};
