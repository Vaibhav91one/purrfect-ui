"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StickerPop } from "./sticker-pop";

// the source's intro pile: offset (% of the sticker box) and tilt per sticker
const PILE = [
  ["field", -38, -6, -8],
  ["coast", 34, -14, 7],
  ["canyon", -12, 22, 4],
  ["jellyfish", 26, 26, -6],
] as const;

/** The source's intro pile, small: a fanned pile of die-cut stickers over the page. `loop` (ms) replays it on a timer. */
export function LoaderBox({ stickers = PILE.map(([f]) => `/demo/${f}.jpg`), stickerClassName, loop, children }: { stickers?: string[]; stickerClassName?: string; loop?: number; children?: ReactNode }) {
  const [run, setRun] = useState(0);
  const [out, setOut] = useState(false);
  const count = Math.min(stickers.length, PILE.length); // only the rendered stickers stagger out
  // click (or the loop): the pile leaves in reverse, then pops in again
  const replay = () => setOut(true);
  useEffect(() => {
    if (!out) return;
    const id = setTimeout(() => {
      setOut(false);
      setRun((n) => n + 1);
    }, (count - 1) * 50 + 300); // the last sticker's outDelay plus its 0.3s exit
    return () => clearTimeout(id);
  }, [out, count]);
  useEffect(() => {
    if (!loop || out) return;
    const id = setTimeout(() => setOut(true), loop);
    return () => clearTimeout(id);
  }, [loop, out]);
  return (
    <div className="relative h-[560px] w-[800px] overflow-hidden rounded-2xl">
      <div className="absolute inset-6 overflow-hidden rounded-xl bg-background text-foreground shadow-xl">
        <button type="button" aria-label="Replay the sticker pile" onClick={replay} className="absolute top-1/2 left-1/2 size-[200px] -translate-x-1/2 -translate-y-1/2 rounded-3xl">
          {stickers.slice(0, PILE.length).map((src, i) => (
            <StickerPop
              key={`${run}-${src}`}
              src={src}
              rotate={PILE[i][3]}
              delay={0.1 + i * 0.2}
              out={out}
              outDelay={(count - 1 - i) * 0.05}
              className={cn("absolute inset-[14%] size-[72%] rounded-[28%] border-[6px] border-white object-cover shadow-[0_6px_18px_rgba(0,0,0,.18)]", stickerClassName)}
              style={{ x: `${PILE[i][1]}%`, y: `${PILE[i][2]}%` }}
            />
          ))}
        </button>
        {children}
      </div>
    </div>
  );
}

// playing/speed come from the gallery's Pause and Speed controls: while playing, the pile leaves and pops in again on a loop
export default function StickerPopDemo({ playing, speed = 1 }: { playing?: boolean; speed?: number }) {
  return <LoaderBox loop={playing ? 2800 / speed : undefined} />;
}
