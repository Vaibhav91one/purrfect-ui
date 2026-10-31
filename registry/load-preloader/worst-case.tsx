// Dev-only fixture (not in registry.json, never installed): the realistic worst props for LoadPreloader, shown at /dev?c=load-preloader.
import type { ReactNode } from "react";
import { LoadPreloader } from "./load-preloader";
import { FailsToLoad, NeverReady } from "./worst-case-client";

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
  Demo: frame(<LoadPreloader contained storageKey={false} />),
  "Worst case": frame(
    <NeverReady key="never" />,
    <FailsToLoad key="fails" />,
    // already loaded, no minimum: as fast as it goes
    <LoadPreloader contained storageKey={false} ready minDuration={0} />,
    // a flag that never turns true, long minimum: stays until the 8s cap
    <LoadPreloader contained storageKey={false} ready={false} minDuration={6} maxWait={8} />,
  ),
};
