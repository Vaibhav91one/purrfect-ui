"use client";

import { motion } from "motion/react";
import { Gugi, Plus_Jakarta_Sans } from "next/font/google";
import { useId, useState } from "react";
import { FanOutCards, type FanOutCard } from "./fan-out-cards";

// Armour's own faces: Plus Jakarta Sans for the cards, Gugi for the name in the pill
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });
const gugi = Gugi({ subsets: ["latin"], weight: "400" });

// Armour's "Ask your money anything" section (VoiceChatShowcase), ported as it is: a white stage, white cards, a phone that is listening
const insight = (text: string, meta: string, colors: string) => (
  <div className="flex min-h-[88px] items-stretch gap-3 p-2">
    <div className="mr-2 w-21 shrink-0 rounded-sm opacity-90" style={{ background: `linear-gradient(135deg, ${colors})` }} />
    <div className="min-w-0 flex-1">
      <p className="text-xs leading-snug text-zinc-800">{text}</p>
      <p className="mt-11 text-[11px] text-zinc-400">{meta}</p>
    </div>
  </div>
);

// Armour's section, both layouts: from md up and below it (VoiceChatShowcase: cards 320 wide, offsets 235/265 and 135/165, y 100/205 from the
// section's top, the phone anchored to its bottom, the pill at its middle, shifted left on a phone). `top` is where that section starts in the stage.
const LAYOUTS = {
  wide: { w: 900, h: 660, wrap: [500, 580], phone: 610, top: 180, cx: [235, 265], pill: "left-1/2 -translate-x-1/2 -ml-2.5", pillY: 240 },
  compact: { w: 390, h: 520, wrap: [420, 520], phone: 500, top: 90, cx: [135, 165], pill: "left-1/2 -ml-18", pillY: 215 },
} as const;

const place = (L: (typeof LAYOUTS)[keyof typeof LAYOUTS]): FanOutCard[] => {
  // Armour tilts with CSS rotate and moves with transform, so its offsets run inside the tilted frame: rotate them to get where the card's centre lands
  const at = (px: number, cy: number, deg: number) => {
    const r = (deg * Math.PI) / 180;
    const x = px * Math.cos(r) - cy * Math.sin(r);
    const y = px * Math.sin(r) + cy * Math.cos(r);
    return [(x / L.w) * 100, ((L.top + y - L.h / 2) / L.h) * 100] as const;
  };
  const [a, b] = L.cx;
  return [
    { ...pos(at(-a, 100, 6)), rotate: 6, content: insight("Your AAPL position is up 12%", "Live market", "#22c55e, #10b981, #14b8a6, #4ade80") },
    { ...pos(at(a, 100, -6)), rotate: -6, content: insight("You're on track to save $400 this month", "2 min ago", "#6366f1, #8b5cf6, #a78bfa, #818cf8") },
    { ...pos(at(-b, 205, -6)), rotate: -6, content: insight("Rebalancing opportunity detected", "1 hour ago", "#f97316, #fb923c, #fbbf24, #f59e0b") },
    { ...pos(at(b, 205, 6)), rotate: 6, content: insight("Portfolio hit a new all-time high", "3 hours ago", "#0ea5e9, #38bdf8, #6366f1, #818cf8") },
  ];
};
const pos = ([x, y]: readonly [number, number]) => ({ x, y });

// The original's phone: the device frame over a screen (a halftone photo), cut off by the top of its box
function Phone({ className, width, style }: { className?: string; width: number; style?: React.CSSProperties }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 983 1087" aria-hidden className={className} style={{ ...style, width }}>
      <defs>
        <clipPath id={`screen-${id}`}>
          <rect x="250.331" y="-133.049" width="431.34" height="933.994" rx="32" />
        </clipPath>
      </defs>
      <g clipPath={`url(#screen-${id})`}>
        <rect x="250.331" y="-131.902" width="430.193" height="931.51" fill="#fff" />
        <image href="/demo/armour-screen.jpg" x="250.331" y="-131.902" width="430.193" height="931.51" preserveAspectRatio="xMidYMid slice" />
      </g>
      <image href="/demo/iphone-frame.png" x="225" y="-152" width="482.036" height="974" preserveAspectRatio="none" />
    </svg>
  );
}

// the original's ShiningText: a white band sweeping across white text
function Shining({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      className="inline-block bg-clip-text text-transparent"
      style={{ backgroundImage: "linear-gradient(110deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,1) 45%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.45) 100%)", backgroundSize: "220% 100%" }}
      animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
      // check-ignore: duration a looping label shimmer, not a response to input
      transition={{ duration: 2.8, ease: "linear", repeat: Infinity }}
    >
      {children}
    </motion.span>
  );
}

/** `compact`: the phone layout (390 wide), as Armour's section looks below md; the default is the wide one (900 wide). */
export default function FanOutCardsDemo({ compact = false }: { compact?: boolean }) {
  const [run, setRun] = useState(0);
  const L = LAYOUTS[compact ? "compact" : "wide"];
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-white text-zinc-800 ${jakarta.className}`} style={{ width: L.w, height: L.h }}>
      {/* the replay button sits behind the cards, not around them: the cards' text stays readable to screen readers */}
      <button type="button" onClick={() => setRun((n) => n + 1)} aria-label="Replay the fan-out" className="absolute inset-0" />
      {/* the phone's soft shadow, a halo under it (a drop-shadow would be cut square by the box that crops the phone's top) */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[75%] w-[80%] -translate-x-1/2 translate-y-1/4 bg-[radial-gradient(closest-side,rgb(9_20_50/0.09),transparent)]" />
      {/* pointer-events-none lets clicks around the cards reach the replay button */}
      <FanOutCards key={`${run}-${compact}`} cards={place(L)} stagger={0.13} cardClassName="w-80 max-w-none rounded-lg border-0 bg-white p-4 text-left text-zinc-800 shadow-[0_16px_36px_rgba(15,23,42,0.12)]" className="pointer-events-none size-full" />
      {/* the phone sits above the cards, so they slide out from behind it; a white wash fades its top away */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 -translate-x-1/2">
        <div className="relative overflow-hidden" style={{ width: L.wrap[0], height: L.wrap[1] }}>
          <div className="absolute inset-x-0 top-0 z-10 h-34 bg-[linear-gradient(to_bottom,white_0%,rgb(255_255_255/0.88)_32%,transparent_100%)]" />
          <Phone width={L.phone} className="absolute -bottom-10 left-1/2 h-auto -translate-x-1/2" />
        </div>
      </div>
      <div className={`pointer-events-none absolute z-20 -translate-y-1/2 ${L.pill}`} style={{ top: L.top + L.pillY }}>
        <div className="rounded-full bg-[#1B1B1B] px-5 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.22)]">
          <Shining>
            <span className={gugi.className}>Armour</span> <span>is listening</span>
          </Shining>
        </div>
      </div>
    </div>
  );
}
