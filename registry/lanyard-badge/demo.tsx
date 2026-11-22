"use client";

import { Google_Sans } from "next/font/google";
import { useSound } from "@/components/providers/sound-provider";
import { LanyardBadge } from "./lanyard-badge";

// the badge's typeface on the site; an install falls back to the system sans unless it sets --lanyard-badge-font
export const badgeFont = Google_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--lanyard-badge-font" });

// It makes its own sounds, so it follows the site's Sound switch and turns off the site's hover cue.
export default function LanyardBadgeDemo({ playing = true, finish = "print", compact = false }: { playing?: boolean; finish?: "print" | "foil"; compact?: boolean }) {
  const { enabled } = useSound();
  return (
    <div data-hover-sound="off" className={`grid place-items-center ${compact ? "h-[520px] w-[360px]" : "h-[600px] w-[480px]"} ${badgeFont.variable}`}>
      <LanyardBadge finish={finish} paused={!playing} sound={enabled} className="h-full w-full" />
    </div>
  );
}
