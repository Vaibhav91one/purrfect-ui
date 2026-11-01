// Dev-only fixture (not in registry.json, never installed): the worst lines for LineRise, shown at /dev?c=line-rise.
import type { ReactNode } from "react";
import { LineRise } from "./line-rise";

const box = (w: number, ...kids: ReactNode[]) => (
  <div style={{ width: w }} className="flex max-w-full flex-col gap-6 border border-dashed border-border">
    {kids}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: box(440, <LineRise key="d" as="h2" className="text-5xl tracking-tight" lines={["Maps that", "move with", "the world."]} />),
  "Worst case": box(
    320,
    <LineRise key="o" className="text-4xl" lines={["O"]} />,
    <LineRise key="l" className="text-3xl" lines={["An extremely long single line that has to wrap inside its own mask several times over", "short"]} />,
    <LineRise key="u" className="text-3xl [overflow-wrap:anywhere]" lines={["Donaudampfschifffahrtsgesellschaftskapitänswitwe"]} />,
    <LineRise key="g" className="text-4xl leading-none" lines={["gjpqy descenders", "ÀÉÎ accents"]} />,
    <LineRise key="j" className="text-3xl" lines={["日本語の一行目", "二行目"]} />,
    <LineRise key="a" className="text-3xl" dir="rtl" lines={["سطر عربي أول", "والسطر الثاني"]} />,
    <LineRise key="e" className="text-3xl" lines={["🐈‍⬛ cats 🐈", <a key="a" href="#x" className="underline">a link line</a>]} />,
    <LineRise key="z" lines={[]} />,
    <LineRise key="n" className="text-2xl" lines={["", "blank line above"]} />,
  ),
  Many: box(320, <LineRise key="m" amount={0.1} stagger={0.03} className="text-xl" lines={Array.from({ length: 60 }, (_, i) => `Line number ${i + 1}`)} />),
  Replay: box(320, <LineRise key="r" once={false} className="text-4xl" lines={["Rises again", "on return"]} />),
};
