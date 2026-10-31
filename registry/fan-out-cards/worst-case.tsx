/* eslint-disable @next/next/no-img-element */
// Dev-only fixture (not in registry.json, never installed): the realistic worst props for FanOutCards, shown at /dev?c=fan-out-cards.
// Pushed down the page so the in-view trigger is exercised.
import type { ReactNode } from "react";
import Demo from "./demo";
import { FanOutCards, type FanOutCard } from "./fan-out-cards";

const page = (node: ReactNode) => <div className="mx-auto w-full max-w-4xl px-6 pt-[60svh] pb-[60svh]">{node}</div>;
const text = (t: string) => <p className="text-xs leading-snug break-words">{t}</p>;
const ring = (n: number, r = 38): FanOutCard[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { x: Math.round(Math.cos(a) * r), y: Math.round(Math.sin(a) * r), rotate: (i % 2 ? 1 : -1) * 6, content: text(`Insight ${i + 1}`) };
  });

export const states: Record<string, ReactNode> = {
  Demo: page(<Demo />),
  "Worst case": page(
    <FanOutCards
      className="h-[420px]"
      center={<img src="/demo/city.jpg" alt="" className="size-40 rounded-3xl object-cover" />}
      cards={[
        { x: -30, y: -30, rotate: -8, content: text("A very long insight that keeps going and going to see how the card wraps text across many many lines without breaking the layout at all") },
        { x: 30, y: -30, content: text("Unbreakable_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa") },
        { x: -32, y: 30, rotate: 12, content: text("ポートフォリオが過去最高値を更新しました") },
        { x: 32, y: 30, rotate: -12, content: <p dir="rtl" className="text-xs">تم اكتشاف فرصة لإعادة التوازن</p> },
        { x: 0, y: 0, content: text("Zero offset: sits on the centre") },
        { x: 60, y: 0, content: text("Off the edge (60%)") },
      ]}
    />,
  ),
  "Many (24)": page(<FanOutCards className="h-[480px]" cardClassName="w-28 p-2" stagger={0.02} cards={ring(24)} />),
  One: page(<FanOutCards cards={[{ x: 25, y: 0, rotate: 6, content: text("Only one") }]} center={<span className="text-sm text-muted-foreground">centre</span>} />),
  Empty: page(<FanOutCards cards={[]} center={<span className="text-sm text-muted-foreground">No cards</span>} />),
};
