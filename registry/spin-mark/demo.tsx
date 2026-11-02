"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SpinMark } from "./spin-mark";

// the source's brand tile; click it to pop the mark in again
// playing/speed come from the gallery's Pause and Speed controls; the !important class beats the spin's inline play state
export default function SpinMarkDemo({ playing, speed = 1 }: { playing?: boolean; speed?: number }) {
  const [run, setRun] = useState(0);
  return (
    <div className={cn("relative grid h-80 w-[448px] place-items-center overflow-hidden rounded-3xl", playing === false && "[&_*]:![animation-play-state:paused]")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/valley.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <button type="button" aria-label="Replay the mark" onClick={() => setRun((n) => n + 1)} className="relative grid size-32 place-items-center bg-primary text-primary-foreground transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]">
        <SpinMark key={run} duration={20 / speed} className="size-16" />
      </button>
    </div>
  );
}
