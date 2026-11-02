"use client";

import { useState } from "react";
import { FitTitle } from "./fit-title";

// the source's shop page head: just the one fitted word on a flat grey page; click to replay the rise
export default function FitTitleDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="relative h-[260px] w-[480px] overflow-hidden rounded-2xl">
      <button
        type="button"
        aria-label="Replay the title"
        onClick={() => setRun((r) => r + 1)}
        className="absolute inset-4 flex flex-col justify-center rounded-xl bg-muted px-14 text-left text-foreground shadow-xl"
      >
        {/* wide side padding keeps the fitted size small enough that the p descender (hanging below the line box) stays in the panel */}
        <FitTitle key={run} as="p" className="leading-none">
          shop
        </FitTitle>
      </button>
    </div>
  );
}
