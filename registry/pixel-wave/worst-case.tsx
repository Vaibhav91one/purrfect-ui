// Dev-only fixture (not in registry.json, never installed): the realistic worst props for PixelWave, shown at /dev?c=pixel-wave.
import type { ReactNode } from "react";
import { PixelWave } from "./pixel-wave";

const frame = (...kids: ReactNode[]) => (
  <div className="grid max-w-full gap-6 p-6">
    {kids.map((k, i) => (
      <div key={i} className="flex min-w-0 items-center gap-2.5 overflow-hidden rounded-2xl bg-muted p-4 text-sm">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: frame(
    <>
      <PixelWave className="text-foreground" />
      <span className="text-muted-foreground">Agent Bounty is thinking</span>
    </>,
    <PixelWave className="text-muted-foreground" aria-label="Loading" />,
  ),
  "Worst case": frame(
    <PixelWave size={0} gap={0} />,
    <PixelWave size={1} gap={0} />,
    <PixelWave size={40} gap={8} className="text-primary" />,
    <PixelWave duration={0.1} stagger={0} />,
    // check-ignore: duration a deliberately slow loop to check the long end
    <PixelWave duration={10} stagger={2} />,
    <p className="block">
      Inline in running text, it should sit centred on the line: Saving draft <PixelWave /> and syncing <PixelWave aria-labelledby="pw-sync" /> <span id="pw-sync">sync</span>
    </p>,
    <>
      <PixelWave className="text-destructive" />
      <span className="min-w-0 break-words">
        Agent Bounty is thinking about a very long question that wraps across several lines on a narrow phone screen without pushing the grid
      </span>
    </>,
    <div dir="rtl" className="flex items-center gap-2.5">
      <PixelWave />
      <span>الوكيل يفكر</span>
    </div>,
  ),
};
