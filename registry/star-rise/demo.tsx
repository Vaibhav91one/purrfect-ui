"use client";

import { useState } from "react";
import { StarRise } from "./star-rise";

export default function StarRiseDemo() {
  const [run, setRun] = useState(0);
  return (
    <section className="relative flex min-h-[28rem] w-full flex-col items-center justify-center gap-6 overflow-hidden bg-background px-6 text-center">
      <StarRise key={run} size={240} className="absolute top-8" />
      <div className="relative z-10 mt-56 flex flex-col items-center gap-3">
        <h1 className="max-w-xl text-4xl font-medium tracking-tight text-balance text-foreground sm:text-5xl">Maps, made in minutes.</h1>
        <p className="max-w-md text-sm text-muted-foreground">Pin places, draw routes and share a link.</p>
        <button
          type="button"
          onClick={() => setRun((n) => n + 1)}
          className="mt-2 rounded-full border border-border px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Replay
        </button>
      </div>
    </section>
  );
}
