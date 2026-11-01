"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ShimmerText } from "@/registry/shimmer-text/shimmer-text";
import { FanOutCards, type FanOutCard } from "./fan-out-cards";

// Armour's "Ask your money anything" section: insight cards fan out from behind a phone that is listening
const insight = (text: string, meta: string, colors: string) => (
  <div className="flex min-h-[88px] items-stretch gap-3 p-2">
    <div className="mr-2 w-21 shrink-0 rounded-sm opacity-90" style={{ background: `linear-gradient(135deg, ${colors})` }} />
    <div className="min-w-0 flex-1">
      <p className="text-xs leading-snug">{text}</p>
      <p className="mt-11 text-[11px] text-muted-foreground">{meta}</p>
    </div>
  </div>
);

const CARDS: FanOutCard[] = [
  { x: -28, y: -12, rotate: 6, content: insight("Your AAPL position is up 12%", "Live market", "#22c55e, #10b981, #14b8a6, #4ade80") },
  { x: 28, y: -12, rotate: -6, content: insight("You're on track to save $400 this month", "2 min ago", "#6366f1, #8b5cf6, #a78bfa, #818cf8") },
  { x: -30, y: 20, rotate: -6, content: insight("Rebalancing opportunity detected", "1 hour ago", "#f97316, #fb923c, #fbbf24, #f59e0b") },
  { x: 30, y: 20, rotate: 6, content: insight("Portfolio hit a new all-time high", "3 hours ago", "#0ea5e9, #38bdf8, #6366f1, #818cf8") },
];

const phone = (
  // the phone sits above the cards, so they tuck behind it as they land; its top fades out like the original's
  <div className="relative z-10 h-[440px] w-[290px] overflow-hidden rounded-[48px] border-[7px] border-neutral-900 bg-neutral-900 shadow-2xl [mask-image:linear-gradient(to_bottom,transparent,black_30%)]">
    <img src="/demo/field.jpg" alt="" className="absolute inset-0 size-full rounded-[40px] object-cover" />
    <div className="dark absolute inset-x-0 bottom-20 flex justify-center">
      <div className="rounded-full bg-card px-5 py-2 shadow-lg">
        <ShimmerText className="text-base">
          <span className="font-semibold">Armour</span> is listening
        </ShimmerText>
      </div>
    </div>
  </div>
);

export default function FanOutCardsDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="relative grid h-[520px] w-[900px] place-items-center overflow-hidden rounded-3xl">
      <img src="/demo/fjord.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <button type="button" onClick={() => setRun((n) => n + 1)} aria-label="Replay the fan-out" className="relative size-full">
        <FanOutCards key={run} cards={CARDS} cardClassName="w-80 p-2 text-left shadow-xl" className="size-full" center={phone} />
      </button>
    </div>
  );
}
