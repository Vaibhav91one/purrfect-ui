"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Banknote, Mic, ShoppingBag } from "lucide-react";
import { SpringChips, type SpringChip } from "./spring-chips";

// Armour's home hero phone with three chips springing in around it
const tile = (colors: string) => `linear-gradient(135deg, ${colors})`;
const CHIPS: SpringChip[] = [
  { label: "Your money, always working.", icon: <ShoppingBag className="text-white" />, iconBackground: tile("#2dd4bf, #0ea5e9, #6366f1, #a855f7"), className: "-right-8 top-24" },
  { label: "Talk to your finances.", icon: <Mic className="text-white" />, iconBackground: tile("#fb7185, #f97316, #facc15, #f43f5e"), className: "-left-8 top-36" },
  { label: "Wealth that grows with you.", icon: <Banknote className="text-white" />, iconBackground: tile("#22c55e, #10b981, #14b8a6, #84cc16"), className: "-right-8 bottom-28" },
];

export default function SpringChipsDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="grid h-[520px] w-[520px] place-items-center">
      <button type="button" onClick={() => setRun((n) => n + 1)} aria-label="Replay the chips">
        <SpringChips key={run} chips={CHIPS} className="grid h-[480px] w-[380px] place-items-center">
          <div className="relative h-[400px] w-[196px] -rotate-6 overflow-hidden rounded-[36px] border-[6px] border-neutral-900 bg-neutral-900 shadow-2xl">
            <img src="/demo/canyon.jpg" alt="" className="absolute inset-0 size-full rounded-[30px] object-cover" />
            <span className="absolute inset-x-0 top-1/2 text-center text-2xl font-semibold tracking-wide text-white">ARMOUR</span>
          </div>
        </SpringChips>
      </button>
    </div>
  );
}
