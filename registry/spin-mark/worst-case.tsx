// Dev-only fixture (not in registry.json, never installed): the realistic worst props for SpinMark, shown at /dev?c=spin-mark.
import type { ReactNode } from "react";
import { SpinMark } from "./spin-mark";

const frame = (...kids: ReactNode[]) => (
  <div className="grid gap-4 p-6 sm:grid-cols-3">
    {kids.map((k, i) => (
      <div key={i} className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-muted text-foreground">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: frame(<SpinMark />, <SpinMark mode="scroll" />),
  "Worst case": frame(
    <SpinMark className="size-2" />,
    <SpinMark className="size-[40rem]" />,
    <SpinMark duration={0.2} />,
    <SpinMark duration={0} />,
    <SpinMark mode="scroll" turns={0} />,
    <SpinMark mode="scroll" turns={500} />,
    <SpinMark className="size-32 text-primary">
      {/* eslint-disable-next-line @next/next/no-img-element -- fixture: any image works as the mark */}
      <img alt="" src="/demo/jellyfish.jpg" className="size-full rounded-full object-cover" />
    </SpinMark>,
    <SpinMark className="size-32">
      <span className="grid size-full place-items-center text-6xl">✺</span>
    </SpinMark>,
    <SpinMark className="h-12 w-64">
      <span className="grid size-full place-items-center text-sm whitespace-nowrap">Supercalifragilisticexpialidocious مرحبا</span>
    </SpinMark>,
  ),
};
