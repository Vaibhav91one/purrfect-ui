"use client";

import { useState } from "react";
import { LoadPreloader } from "./load-preloader";

// contained + no storageKey so the demo can replay inside a card; on a site, mount it once near the root with neither
export default function LoadPreloaderDemo() {
  const [run, setRun] = useState(0);
  return (
    <button type="button" aria-label="Replay the preloader" onClick={() => setRun((r) => r + 1)} className="relative block h-80 w-[480px] overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/fjord.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <LoadPreloader key={run} contained storageKey={false} />
    </button>
  );
}
