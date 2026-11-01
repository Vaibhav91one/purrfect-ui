/* eslint-disable @next/next/no-img-element */
"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StickerPop } from "./sticker-pop";

// the source's intro pile: offset (% of the sticker box) and tilt per sticker
const PILE = [
  ["field", -38, -6, -8],
  ["coast", 34, -14, 7],
  ["canyon", -12, 22, 4],
  ["jellyfish", 26, 26, -6],
] as const;
const STEPS = ["0", "27", "64", "100"];

/** The source's intro loader, small: a fanned pile of die-cut stickers over the page, the counter rolling up bottom-left. */
export function LoaderBox({ stickers = PILE.map(([f]) => `/demo/${f}.jpg`), stickerClassName, children }: { stickers?: string[]; stickerClassName?: string; children?: ReactNode }) {
  const [run, setRun] = useState(0);
  const [out, setOut] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reduce = useReducedMotion();
  const count = Math.min(stickers.length, PILE.length); // only the rendered stickers stagger out
  useEffect(() => () => clearTimeout(timer.current), []);
  // click: the pile leaves in reverse, then pops in again
  const replay = () => {
    if (out) return;
    setOut(true);
    timer.current = setTimeout(() => {
      setOut(false);
      setRun((n) => n + 1);
    }, (count - 1) * 50 + 300); // the last sticker's outDelay plus its 0.3s exit
  };
  return (
    <div className="relative h-[560px] w-[800px] overflow-hidden rounded-2xl">
      <img src="/demo/dunes.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-6 flex items-end overflow-hidden rounded-xl bg-background p-7 text-foreground shadow-xl">
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
        <div key={run} className="h-[1.2em] overflow-hidden text-[40px] leading-[1.2] tabular-nums">
          {/* check-ignore: duration the source counter rolls for 1.4s while the pile pops */}
          <motion.div initial={{ y: "0%" }} animate={{ y: "-75%" }} transition={{ duration: reduce ? 0 : 1.4, ease: [0.23, 1, 0.32, 1] }} className="flex flex-col">
            {STEPS.map((s) => (
              <span key={s} className="h-[1.2em]">
                {s}
              </span>
            ))}
          </motion.div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function StickerPopDemo() {
  return <LoaderBox />;
}
