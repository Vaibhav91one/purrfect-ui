"use client";

import { useState } from "react";
import { StarRise } from "./star-rise";

// the source's hero: big heading top-left, the mark rising behind it, the subheading off to the right
export default function StarRiseDemo({ shader = true }: { shader?: boolean }) {
  const [run, setRun] = useState(0);
  return (
    <div className="relative h-[560px] w-[1000px] overflow-hidden rounded-3xl p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/storm.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <section className="relative flex size-full flex-col gap-8 overflow-hidden rounded-2xl bg-background p-10 text-foreground">
        <button type="button" aria-label="Replay the rise" onClick={() => setRun((n) => n + 1)} className="absolute top-44 left-1/2 -translate-x-1/2 rounded-full">
          <StarRise key={run} size={320} shader={shader} />
        </button>
        <h1 className="pointer-events-none relative text-[64px] leading-tight font-normal tracking-tight">Connect Through Language &amp; Culture</h1>
        <p className="pointer-events-none relative max-w-[17rem] self-end text-sm leading-tight tracking-tight">
          A new way to connect with the world. With Mapinly, you can learn new languages and cultures, and connect with people from all over the world.
        </p>
      </section>
    </div>
  );
}
