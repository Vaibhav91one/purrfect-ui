/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { CounterLoader } from "./counter-loader";

const WORKS = ["Fjord", "Canyon", "Coast", "Field"];

// die-cut photo stickers (white edge, soft shadow), like the source's hand-drawn ones
const STICKERS = ["jellyfish", "dunes", "canal", "cliffs"].map((f) => (
  <span key={f} className="block size-3/5 overflow-hidden rounded-full border-[5px] border-white shadow-[0_6px_18px_rgba(0,0,0,.18)]">
    <img src={`/demo/${f}.jpg`} alt="" className="size-full object-cover" />
  </span>
));

// contained + no storageKey so it can replay inside the window; on a site, mount it once near the root with neither
export default function CounterLoaderDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="relative h-[320px] w-[480px] overflow-hidden rounded-2xl">
      <img src="/demo/fjord.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <button
        type="button"
        aria-label="Replay the loader"
        onClick={() => setRun((r) => r + 1)}
        className="absolute inset-4 overflow-hidden rounded-xl bg-background text-left text-[11px] text-foreground shadow-xl"
      >
        {/* the home page the loader lifts off: header, then the numbered list beside an image strip */}
        <span className="grid h-10 grid-cols-[1fr_auto_auto] items-center gap-10 px-4">
          <span>©Studio</span>
          <span className="flex gap-3">
            <span>Shop</span>
            <span>About</span>
          </span>
          <span>Get in touch</span>
        </span>
        <span className="grid grid-cols-[1fr_96px_1fr] gap-4 px-4 pt-3">
          <span className="grid content-start gap-3">
            {WORKS.map((t, i) => (
              <span key={t} className="flex gap-4">
                <span className="text-muted-foreground">0{i + 1}/</span>
                {t}
              </span>
            ))}
          </span>
          <span className="grid content-start gap-1.5">
            {["canyon", "coast", "field"].map((f, i) => (
              <img key={f} src={`/demo/${f}.jpg`} alt="" className={i === 1 ? "h-28 w-full rounded-sm object-cover" : "h-16 w-full rounded-sm object-cover"} />
            ))}
          </span>
        </span>
        <CounterLoader key={run} contained storageKey={false} stickers={STICKERS} className="bg-background text-foreground" />
      </button>
    </div>
  );
}
