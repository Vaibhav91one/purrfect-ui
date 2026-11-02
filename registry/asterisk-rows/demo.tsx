"use client";

import { useRef, type RefObject } from "react";
import { AsteriskRows } from "./asterisk-rows";

/** The source's band of asterisks pinned in a scrolling box: scroll it and the rows drift faster and flip, and every mark turns. */
export function AsteriskRowsScene({ container }: { container: RefObject<HTMLElement | null> }) {
  return (
    <>
      <div className="sticky top-0 grid h-full place-items-center">
        <AsteriskRows container={container} className="text-foreground" />
      </div>
      <div className="h-[200%]" />
    </>
  );
}

export default function AsteriskRowsDemo() {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-[620px] w-[1000px] overflow-hidden rounded-3xl">
      <div ref={box} className="absolute inset-0 overflow-y-auto overscroll-contain">
        <AsteriskRowsScene container={box} />
      </div>
    </div>
  );
}
