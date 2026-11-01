"use client";

import { useRef, type RefObject } from "react";
import { LineRise } from "./line-rise";

const lead = ["Mapinly brings people together", "across languages and cultures.", "Learn, connect, and explore"];
const body = ["Whether you're learning a new language", "or discovering cultures, Mapinly provides", "the tools and community to make it happen."];

/** The source's text section inside a scrolling box: scroll it in and the lines rise, scroll it out and they drop back. */
export function LineRiseScene({ container }: { container: RefObject<HTMLElement | null> }) {
  return (
    <>
      <div className="grid h-full place-items-center text-3xl text-muted-foreground">↓ Scroll</div>
      <div className="grid h-full place-items-center">
        <div className="flex flex-col gap-6 text-4xl tracking-tight">
          <LineRise lines={lead} container={container} once={false} className="ps-20 text-end" />
          <LineRise lines={body} container={container} once={false} />
        </div>
      </div>
    </>
  );
}

export default function LineRiseDemo() {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-[420px] w-[1000px] overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/cliffs.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div ref={box} className="absolute inset-4 overflow-y-auto overscroll-contain rounded-2xl bg-background text-foreground">
        <LineRiseScene container={box} />
      </div>
    </div>
  );
}
