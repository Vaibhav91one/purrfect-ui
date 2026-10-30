// Dev-only fixture (not in registry.json, never installed): the realistic worst props for Preloader, shown at /dev?c=preloader.
import type { ReactNode } from "react";
import { Preloader } from "./preloader";

const frame = (...kids: ReactNode[]) => (
  <div className="grid gap-4 p-6 sm:grid-cols-2">
    {kids.map((k, i) => (
      <div key={i} className="relative h-56 overflow-hidden rounded-2xl bg-muted">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: frame(<Preloader contained storageKey={false} />),
  "Worst case": frame(
    <Preloader contained storageKey={false} words={["Donaudampfschifffahrtsgesellschaftskapitänswitwe"]} />,
    <Preloader contained storageKey={false} words={[]} />,
    <Preloader contained storageKey={false} duration={0.3} />,
    <Preloader contained storageKey={false} duration={8} words={["Slow", "and", "steady"]} />,
  ),
};
