// Dev-only fixture (not in registry.json, never installed): the realistic worst content for LanyardBadge, shown at /dev?c=lanyard-badge.
import type { ReactNode } from "react";
import { badgeFont } from "./demo";
import { LanyardBadge } from "./lanyard-badge";

const wrap = (node: ReactNode) => <div className={badgeFont.variable}>{node}</div>;

export const states: Record<string, ReactNode> = {
  Demo: wrap(<LanyardBadge className="h-[600px] w-[480px]" />),
  // a very long name and role shrink to fit their boxes; an empty name leaves the box blank
  "Long name": wrap(<LanyardBadge name="Venkatanarasimharajuvaripeta Subrahmanyam" role="Speaker and Organiser" className="h-[600px] w-[480px]" />),
  "Empty name": wrap(<LanyardBadge name="" className="h-[600px] w-[480px]" />),
  "Non-Latin": wrap(<LanyardBadge name="ವೈಭವ್ ತೋಮರ್" city="ಬೆಂಗಳೂರು" className="h-[600px] w-[480px]" />),
  Foil: wrap(<LanyardBadge finish="foil" className="h-[600px] w-[480px]" />),
  "Wide and short": wrap(<LanyardBadge className="h-[300px] w-[720px]" />),
  "Tall and narrow": wrap(<LanyardBadge className="h-[640px] w-[240px]" />),
  Tiny: wrap(<LanyardBadge className="h-[160px] w-[120px]" />),
  "Missing model": wrap(<LanyardBadge model="/models/nope.gltf" className="h-[600px] w-[480px]" />),
};
