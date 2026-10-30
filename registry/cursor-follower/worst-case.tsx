// Dev-only fixture (not in registry.json, never installed): CursorFollower over hard backgrounds, shown at /dev?c=cursor-follower.
import type { ReactNode } from "react";
import { CursorFollower } from "./cursor-follower";

const zone = (cls: string, text: string, scale?: number | string) => (
  <div data-cursor-scale={scale} className={`grid h-40 place-items-center rounded-2xl ${cls}`}>
    {text}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: (
    <div className="grid gap-4 p-6">
      <CursorFollower />
      {zone("bg-muted", "Plain")}
      {zone("bg-foreground text-background", "Inverted, scale 3", 3)}
    </div>
  ),
  "Worst case": (
    <div className="grid gap-4 p-6">
      <CursorFollower size={8} />
      {zone("bg-[linear-gradient(90deg,red,yellow,lime,cyan,blue,magenta)] text-black", "Gradient, scale 6", 6)}
      {zone("bg-background", "Same colour as the page")}
      {zone("bg-muted", "data-cursor-scale=\"nonsense\" stays 1", "nonsense")}
      <a href="#x" data-cursor-scale="2" className="underline">A link inside a scaled zone</a>
    </div>
  ),
};
