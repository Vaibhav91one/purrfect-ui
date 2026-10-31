// Dev-only fixture (not in registry.json, never installed): the realistic worst props for CounterLoader, shown at /dev?c=counter-loader.
import type { ReactNode } from "react";
import { CounterLoader } from "./counter-loader";

const frame = (...kids: ReactNode[]) => (
  <div className="grid grid-cols-2 gap-4 p-6">
    {kids.map((k, i) => (
      <div key={i} className="relative h-56 overflow-hidden rounded-2xl bg-muted">
        {k}
      </div>
    ))}
  </div>
);

const many = Array.from({ length: 24 }, (_, i) => <span key={i} className="size-2/5 rounded-full border-4 border-background" />);

export const states: Record<string, ReactNode> = {
  Demo: frame(<CounterLoader contained storageKey={false} />),
  "Worst case": frame(
    <CounterLoader contained storageKey={false} stickers={[]} steps={[]} />,
    <CounterLoader contained storageKey={false} stickers={many} steps={[1, 9999999999, 123456789012345]} />,
    <CounterLoader contained storageKey={false} duration={0.2} />,
    <CounterLoader contained storageKey={false} duration={6} steps={Array.from({ length: 101 }, (_, i) => i)} />,
  ),
};
