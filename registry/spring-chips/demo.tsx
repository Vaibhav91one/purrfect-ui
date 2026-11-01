"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Banknote, Eye, Mic, ShoppingBag, Sparkle } from "lucide-react";
import { SpringChips, type SpringChip } from "./spring-chips";

// Armour's home hero: the pitch on the left, the phone on the right with three chips springing in around it
const tile = (colors: string) => `linear-gradient(135deg, ${colors})`;
const CHIPS: SpringChip[] = [
  { label: "Your money, always working.", icon: <ShoppingBag className="text-white" />, iconBackground: tile("#2dd4bf, #0ea5e9, #6366f1, #a855f7"), className: "-right-8 top-24" },
  { label: "Talk to your finances.", icon: <Mic className="text-white" />, iconBackground: tile("#fb7185, #f97316, #facc15, #f43f5e"), className: "-left-8 top-36" },
  { label: "Wealth that grows with you.", icon: <Banknote className="text-white" />, iconBackground: tile("#22c55e, #10b981, #14b8a6, #84cc16"), className: "-right-8 bottom-28" },
];

export default function SpringChipsDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="relative h-[600px] w-[1000px] overflow-hidden rounded-3xl p-6">
      <img src="/demo/valley.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative grid size-full grid-cols-[1fr_380px] items-center gap-10 rounded-[2rem] bg-background py-8 pr-16 pl-14 text-foreground">
        <div>
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
            <Sparkle className="size-6 fill-red-500 text-red-500" aria-hidden />
            <span className="bg-gradient-to-b from-red-500 to-orange-400 bg-clip-text text-transparent">Track. Invest. Grow wealth.</span>
          </p>
          <h2 className="text-[56px] leading-[1.1] font-medium tracking-tight">
            Your money,
            <br />
            managed by <span className="font-serif italic">AI</span>
          </h2>
          <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted-foreground">
            Armour watches your portfolio, flags what matters, and tells you exactly what to do next — all from your iPhone.
          </p>
          <div className="mt-8 flex gap-4 text-sm font-medium">
            <span className="rounded-full bg-foreground px-8 py-4 text-background">Get the app</span>
            <span className="flex items-center gap-2 rounded-full bg-muted px-7 py-4">
              <Eye className="size-4" aria-hidden /> See it in action
            </span>
          </div>
        </div>
        <button type="button" onClick={() => setRun((n) => n + 1)} aria-label="Replay the chips" className="relative">
          <SpringChips key={run} chips={CHIPS} className="grid h-[480px] place-items-center rounded-[2.5rem] bg-muted">
            <div className="relative h-[400px] w-[196px] -rotate-6 overflow-hidden rounded-[36px] border-[6px] border-neutral-900 bg-neutral-900 shadow-2xl">
              <img src="/demo/canyon.jpg" alt="" className="absolute inset-0 size-full rounded-[30px] object-cover" />
              <span className="absolute inset-x-0 top-1/2 text-center text-2xl font-semibold tracking-wide text-white">ARMOUR</span>
            </div>
          </SpringChips>
        </button>
      </div>
    </div>
  );
}
