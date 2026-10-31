"use client";

import { StatRotator } from "./stat-rotator";

const STATS = [
  { value: "3.2x", label: "Faster savings growth than a regular account" },
  { value: "$1.2M", label: "Saved by members in the first year" },
  { value: "98%", label: "Of members hit their monthly goal" },
  { value: "12,400", label: "Transactions sorted by AI every day" },
];

export default function StatRotatorDemo() {
  return (
    <div className="relative grid h-[400px] w-[360px] place-items-center overflow-hidden rounded-[2rem] p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/storm.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <StatRotator stats={STATS} className="relative w-full" />
    </div>
  );
}
