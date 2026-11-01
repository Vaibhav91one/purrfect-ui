// Dev-only fixture (not in registry.json, never installed): the realistic worst props for LocationPill, shown at /dev?c=location-pill.
// Each state is one screen; add a state when a bug shows up so it stays fixed.
import { Globe, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { LocationPill } from "./location-pill";

const col = (...kids: ReactNode[]) => (
  <div className="flex max-w-full flex-col items-start gap-6 overflow-hidden">
    {kids.map((k, i) => (
      <div key={i} className="max-w-full">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: col(<LocationPill />, <LocationPill icon={<Globe size={30} />} />),
  "Worst case": col(
    <LocationPill label="Located in Llanfairpwllgwyngyll, Anglesey, Wales, United Kingdom" />,
    <LocationPill label="東京都渋谷区に拠点" />,
    <LocationPill label="مقيم في دبي" dir="rtl" />,
    <LocationPill label="📍 Remote 🌍" icon={<MapPin size={30} />} />,
    <LocationPill label="" />,
    <LocationPill label="India" duration={1} drift={0} className="text-base" />,
  ),
};
