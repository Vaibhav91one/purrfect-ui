"use client";

import { useState } from "react";
import { SpinMark } from "./spin-mark";

// the source's brand tile; click it to pop the mark in again
export default function SpinMarkDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="relative grid h-80 w-[448px] place-items-center overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/valley.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <button type="button" aria-label="Replay the mark" onClick={() => setRun((n) => n + 1)} className="relative grid size-32 place-items-center bg-primary text-primary-foreground">
        <SpinMark key={run} className="size-16" />
      </button>
    </div>
  );
}
