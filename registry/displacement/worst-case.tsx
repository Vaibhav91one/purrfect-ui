// Dev-only fixture (not in registry.json, never installed): the realistic worst props for Displacement, shown at /dev?c=displacement.
import type { ReactNode } from "react";
import { Displacement } from "./displacement";
import { Painted } from "./demo";

const grid = (...kids: ReactNode[]) => (
  <div className="grid gap-4 p-6 sm:grid-cols-2">
    {kids.map((k, i) => (
      <div key={i}>{k}</div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: grid(<Displacement src="/demo/scenery.jpg" alt="Mountains at dusk" className="h-72 rounded-3xl" />, <Painted word="ARMOUR" fill="#0E7DDA" className="h-72 rounded-3xl" />),
  "Worst case": grid(
    <Displacement src="/missing.jpg" alt="A photo that fails to load" className="h-56 rounded-3xl bg-muted" />,
    <Displacement src="https://picsum.photos/600/400" alt="Cross-origin: the plain image if WebGL cannot read it" className="h-56 rounded-3xl" />,
    <Painted word="Strong" strength={2} aberration={1} grain={0.3} radius={0.5} className="h-56 rounded-3xl" />,
    <Painted word="Off" strength={0} className="h-56 rounded-3xl" />,
    <Painted word="Tiny" className="h-16 w-24 rounded-xl" />,
    <Displacement src="/demo/scenery.jpg" className="h-[480px] rounded-3xl" />,
  ),
};
