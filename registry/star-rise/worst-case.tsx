// Dev-only fixture (not in registry.json, never installed): the realistic worst props for StarRise, shown at /dev?c=star-rise.
import type { ReactNode } from "react";
import { StarRise } from "./star-rise";

const frame = (...kids: ReactNode[]) => (
  <div className="grid gap-4 p-6 sm:grid-cols-2">
    {kids.map((k, i) => (
      <div key={i} className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-muted">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: frame(<StarRise size={200} />),
  "Worst case": frame(
    <StarRise size={12} />,
    <StarRise size={1200} />,
    <StarRise size={160} shader={false} />,
    <StarRise size={160} duration={0.2} turns={0} />,
    <StarRise size={160} duration={10} delay={2} turns={40} />,
    <StarRise size={160}>
      {/* eslint-disable-next-line @next/next/no-img-element -- fixture: any image works as the mark */}
      <img alt="" src="/favicon.ico" className="size-full object-contain" />
    </StarRise>,
    <StarRise size={160}>
      <span className="grid size-full place-items-center text-6xl text-foreground">★</span>
    </StarRise>,
  ),
};
