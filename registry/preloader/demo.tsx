"use client";

import { useState } from "react";
import { Preloader } from "./preloader";

// contained + no storageKey so the demo can replay inside a card; on a site, mount it once near the root with neither
export default function PreloaderDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="relative grid h-72 w-full max-w-md place-items-center overflow-hidden rounded-3xl bg-muted">
      <button type="button" onClick={() => setRun((r) => r + 1)} className="rounded-full border border-foreground px-5 py-2">
        Replay
      </button>
      <Preloader key={run} contained storageKey={false} />
    </div>
  );
}
