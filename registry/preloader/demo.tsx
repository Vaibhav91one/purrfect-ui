"use client";

import { useState } from "react";
import { Preloader } from "./preloader";

// contained + no storageKey so the demo can replay inside a card; on a site, mount it once near the root with neither.
// The page under it is a photo: once the panel has lifted, click the photo to play it again.
export default function PreloaderDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="relative h-[320px] w-[480px] overflow-hidden rounded-3xl">
      <button type="button" onClick={() => setRun((r) => r + 1)} aria-label="Replay the preloader" className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo/canyon.jpg" alt="" className="size-full object-cover" />
      </button>
      <Preloader key={run} contained storageKey={false} />
    </div>
  );
}
