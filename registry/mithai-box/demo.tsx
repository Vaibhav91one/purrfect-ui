"use client";

import { Caveat } from "next/font/google";
import { useSound } from "@/components/providers/sound-provider";
import { MithaiBox, type Format, type Shape } from "./mithai-box";

// the hint's hand-written font on the site; an install falls back to the system's cursive
const hand = Caveat({ subsets: ["latin"], weight: "600", variable: "--mithai-hint-font" });

// compact: the dialog on a phone, a tall stage so the box fills the width instead of floating small in it.
// playing comes from the gallery's Pause control (cards pass it while in view): paused, the box stops floating.
// It makes its own sounds, so it follows the site's Sound switch and turns off the site's hover cue.
export default function MithaiBoxDemo({ playing = true, variant = "royal", shape = "square", format = "classic", compact = false }: { compact?: boolean; playing?: boolean; variant?: "royal" | "peacock" | "kraft" | "velvet"; shape?: Shape; format?: Format }) {
  const { enabled } = useSound();
  return (
    <div data-hover-sound="off" className={`grid place-items-center ${compact ? "h-[520px] w-[360px]" : "h-[540px] w-[720px]"} ${hand.variable}`}>
      <MithaiBox variant={variant} shape={shape} format={format} paused={!playing} sound={enabled} className="h-full w-full" />
    </div>
  );
}
