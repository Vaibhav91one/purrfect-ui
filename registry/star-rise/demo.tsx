"use client";

import { useState } from "react";
import { StarRise } from "./star-rise";

// just the mark, centred, rising up from below the box; `replay` (a changing key) and a click both replay the rise
export default function StarRiseDemo({ shader = true, replay = 0, duration }: { shader?: boolean; replay?: number; duration?: number }) {
  const [run, setRun] = useState(0);
  return (
    <div className="relative h-[560px] w-[1000px] overflow-hidden rounded-3xl p-6">
      <section className="relative grid size-full place-items-center overflow-hidden rounded-2xl bg-background text-foreground">
        <button type="button" aria-label="Replay the rise" onClick={() => setRun((n) => n + 1)} className="rounded-full">
          <StarRise key={`${replay}-${run}`} size={320} duration={duration} shader={shader} />
        </button>
      </section>
    </div>
  );
}
