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
      {row("Zero", <Counter value={0} className="text-3xl font-semibold sm:text-6xl" />)}
      {row("One", <Counter value={1} className="text-3xl font-semibold sm:text-6xl" />)}
      {row("Negative", <Counter value={-42} className="text-3xl font-semibold sm:text-6xl" />)}
      {row("Decimal", <Counter value={1234.56} className="text-3xl font-semibold sm:text-6xl" />)}
      {row("A billion", <Counter value={1_000_000_000} className="text-3xl font-semibold sm:text-6xl" />)}
      {row("German", <Counter value={1234567} locale="de-DE" className="text-3xl font-semibold sm:text-6xl" />)}
      {row("Arabic digits", <Counter value={1234.5} locale="ar-EG" className="text-3xl font-semibold sm:text-6xl" />)}
      {row("In RTL text", <span dir="rtl"><Counter value={1234} className="text-3xl font-semibold sm:text-6xl" /></span>)}
      {row("NaN / -0", <span className="flex gap-6"><Counter value={NaN} className="text-3xl font-semibold sm:text-6xl" /><Counter value={-0} className="text-3xl font-semibold sm:text-6xl" /></span>)}
      {row("Count up", <Counter value={2480} countUp className="text-3xl font-semibold sm:text-6xl" />)}
      {row("Bad locale", <Counter value={9876} locale="not a locale!" className="text-3xl font-semibold sm:text-6xl" />)}
    </div>
  ),
};
