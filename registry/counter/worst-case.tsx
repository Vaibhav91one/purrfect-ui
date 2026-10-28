// Dev-only fixture (not in registry.json, never installed): the realistic worst props for Counter, shown at /dev?c=counter.
import type { ReactNode } from "react";
import { Counter } from "./counter";

const row = (label: string, node: ReactNode) => (
  <div className="flex items-baseline gap-4">
    <span className="w-24 shrink-0 text-sm text-muted-foreground">{label}</span>
    {node}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: <div className="p-6">{row("2,480", <Counter value={2480} className="text-6xl font-semibold" />)}</div>,
  "Worst case": (
    <div className="flex flex-col gap-6 p-6">
      {row("Zero", <Counter value={0} className="text-6xl font-semibold" />)}
      {row("One", <Counter value={1} className="text-6xl font-semibold" />)}
      {row("Negative", <Counter value={-42} className="text-6xl font-semibold" />)}
      {row("Decimal", <Counter value={1234.56} className="text-6xl font-semibold" />)}
      {row("A billion", <Counter value={1_000_000_000} className="text-6xl font-semibold" />)}
      {row("German", <Counter value={1234567} locale="de-DE" className="text-6xl font-semibold" />)}
    </div>
  ),
};
