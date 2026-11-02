// Dev-only fixture (not in registry.json, never installed): the worst frames for ParallaxPhoto, shown at /dev?c=parallax-photo.
import type { ReactNode } from "react";
import { ParallaxPhoto } from "./parallax-photo";

const gap = <div className="grid h-[80svh] place-items-center text-3xl text-muted-foreground">Scroll</div>;

export const states: Record<string, ReactNode> = {
  Demo: (
    <>
      {gap}
      <ParallaxPhoto src="/demo/coast.jpg" alt="Sea cliffs around a rocky cove" className="min-h-[60vh]" />
      {gap}
    </>
  ),
  "Worst case": (
    <>
      {gap}
      {/* a broken src: the frame keeps its size and shows the muted fill, not a collapsed box */}
      <ParallaxPhoto src="/demo/missing.jpg" alt="A photo that failed to load" className="bg-muted" />
      {gap}
      {/* a frame taller than the screen, a very wide strip and a portrait one */}
      <ParallaxPhoto src="/demo/coast.jpg" alt="" className="h-[150svh]" />
      {gap}
      <ParallaxPhoto src="/demo/dunes.jpg" alt="" aspect="8 / 1" />
      {gap}
      <ParallaxPhoto src="/demo/hiker.jpg" alt="" aspect="3 / 4" className="mx-auto max-w-sm rounded-3xl" />
      {gap}
    </>
  ),
};
