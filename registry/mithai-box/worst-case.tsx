// Dev-only fixture (not in registry.json, never installed): the realistic worst content for MithaiBox, shown at /dev?c=mithai-box.
import type { ReactNode } from "react";
import { MithaiBox } from "./mithai-box";

export const states: Record<string, ReactNode> = {
  Demo: <MithaiBox className="h-[540px] w-[720px]" />,
  // no sweets at all, a very long message, a tall narrow box
  "Empty, long message": <MithaiBox sweets={[]} message="Wishing you and your whole family a very happy and prosperous Deepavali" variant="kraft" className="h-[540px] w-[720px]" />,
  "Tall and narrow": <MithaiBox variant="velvet" defaultOpen className="h-[640px] w-[300px]" />,
  "Over nine sweets": <MithaiBox sweets={Array.from({ length: 20 }, () => "jalebi" as const)} defaultOpen className="h-[540px] w-[720px]" />,
  "Tiny": <MithaiBox className="h-[120px] w-[160px]" />,
  // a long hint shrinks to fit; no hint at all
  "Long hint": <MithaiBox hint="Go on, open it, there are laddoos inside for you" className="h-[540px] w-[720px]" />,
  "No hint": <MithaiBox hint={false} variant="peacock" className="h-[540px] w-[720px]" />,
  // every shape, open, in a finish it has not been seen in, and the long box squeezed tall
  "Long, velvet": <MithaiBox shape="long" variant="velvet" defaultOpen className="h-[540px] w-[720px]" />,
  "Hexagon, kraft": <MithaiBox shape="hexagon" variant="kraft" defaultOpen className="h-[540px] w-[720px]" />,
  "Octagon, royal": <MithaiBox shape="octagon" defaultOpen className="h-[540px] w-[720px]" />,
  "Round, peacock, few sweets": <MithaiBox shape="round" variant="peacock" sweets={["jalebi"]} defaultOpen className="h-[540px] w-[720px]" />,
  "Long, tall and narrow": <MithaiBox shape="long" className="h-[640px] w-[300px]" />,
  // each shop format open, and the tallest one squeezed narrow
  "Tray, open": <MithaiBox format="tray" defaultOpen className="h-[540px] w-[720px]" />,
  "Diamond, open, long message": <MithaiBox format="diamond" defaultOpen message="Wishing you a very happy Deepavali" className="h-[540px] w-[720px]" />,
  "Rajwadi, open": <MithaiBox format="rajwadi" defaultOpen className="h-[540px] w-[720px]" />,
  "Arch, open": <MithaiBox format="arch" defaultOpen className="h-[540px] w-[720px]" />,
  "Dabba, open": <MithaiBox format="dabba" defaultOpen className="h-[540px] w-[720px]" />,
  "Rigid, open, one sweet": <MithaiBox format="rigid" defaultOpen sweets={["laddoo"]} className="h-[540px] w-[720px]" />,
  "Rajwadi, tall and narrow": <MithaiBox format="rajwadi" className="h-[640px] w-[300px]" />,
  // one kind of sweet in every cup, to check each one up close against the real thing
  ...Object.fromEntries((["laddoo", "katli", "jalebi", "gulabjamun", "milkcake", "sandesh", "barfi"] as const).map((k) => [`All ${k}`, <MithaiBox key={k} sweets={Array(9).fill(k)} defaultOpen className="h-[540px] w-[720px]" />])),
};
