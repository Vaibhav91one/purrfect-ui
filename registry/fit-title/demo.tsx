/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowDown } from "lucide-react";
import { useState } from "react";
import { FitTitle } from "./fit-title";

// the source's shop page head: one fitted word on a flat grey page, a small row under it; click to replay the rise
export default function FitTitleDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="relative h-[260px] w-[480px] overflow-hidden rounded-2xl">
      <img src="/demo/dunes.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <button
        type="button"
        aria-label="Replay the title"
        onClick={() => setRun((r) => r + 1)}
        className="absolute inset-4 flex flex-col justify-center rounded-xl bg-muted px-5 text-left text-xs text-foreground shadow-xl"
      >
        <FitTitle key={run} as="p" className="leading-none">
          shop
        </FitTitle>
        <span className="mt-3 flex justify-between">
          shop here <ArrowDown className="size-3.5" />
        </span>
        <span className="mt-5 text-muted-foreground">New prints are on the way.</span>
      </button>
    </div>
  );
}
