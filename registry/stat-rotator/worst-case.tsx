// Dev-only fixture (not in registry.json, never installed): the realistic worst props for StatRotator, shown at /dev?c=stat-rotator.
import type { ReactNode } from "react";
import { StatRotator } from "./stat-rotator";
import Demo from "./demo";

const box = (node: ReactNode) => (
  <div className="relative w-[360px] overflow-hidden rounded-[2rem] p-4">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/demo/storm.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="relative">{node}</div>
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: <Demo />,
  "Worst case": (
    <div className="flex flex-wrap gap-6 p-6">
      {box(
        <StatRotator
          stats={[
            { value: "1,000,000,000+", label: "A billion-plus value that is far wider than the card would like it to be" },
            { value: "-42.75%", label: "Negative with two decimals", description: "Optional description line under the label." },
            { value: "N/A", label: "No number at all: shown as plain text" },
            { value: "0", label: "Zero" },
            { value: "99%", label: "Supercalifragilisticexpialidociousandthensomemorewithoutanyspacesatall" },
            { value: "٪٩٨", label: "نسبة الأعضاء الذين حققوا هدفهم الشهري" },
            { value: "7倍", label: "日本語のラベル、とても長い説明文がここに入ります" },
            { value: "🚀 5x", label: "Emoji prefix 🎉" },
          ]}
        />,
      )}
      {box(<StatRotator stats={[{ value: "$4.5k", label: "Only one stat: no dots, no rotation" }]} />)}
      {box(<StatRotator stats={[]} />)}
    </div>
  ),
};
