"use client";

import { useRef, type RefObject } from "react";
import { ParallaxPhoto } from "./parallax-photo";

/** Mapinly's event page inside a scrolling box: the header, the cover photo the page scrolls over, then the details. */
export function ParallaxPhotoScene({ container }: { container: RefObject<HTMLElement | null> }) {
  return (
    <>
      <section className="flex h-full flex-col justify-between bg-foreground p-8 text-background">
        <p className="text-2xl">/ Events</p>
        <div className="flex items-end justify-between gap-8">
          <dl className="grid shrink-0 gap-4 text-lg">
            <div>
              <dt className="text-sm opacity-60">Date</dt>
              <dd>13.12.2026</dd>
            </div>
            <div>
              <dt className="text-sm opacity-60">Location</dt>
              <dd>@Palazzo dei Congressi, Lugano</dd>
            </div>
          </dl>
          <h2 className="text-right text-6xl leading-none tracking-tight">Startup Pitch Night</h2>
        </div>
      </section>
      <ParallaxPhoto src="/demo/coast.jpg" alt="Sea cliffs around a rocky cove" container={container} />
      <section className="grid h-full grid-cols-[1fr_3fr] gap-10 p-8">
        <p className="text-2xl">About</p>
        <p className="text-2xl leading-snug tracking-tight">
          Five teams, five minutes each, one room of founders and investors. Stay after for drinks on the terrace over the lake.
        </p>
      </section>
    </>
  );
}

export default function ParallaxPhotoDemo() {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div ref={box} className="h-[560px] w-[760px] overflow-y-auto overscroll-contain rounded-2xl bg-background text-foreground">
      <ParallaxPhotoScene container={box} />
    </div>
  );
}
