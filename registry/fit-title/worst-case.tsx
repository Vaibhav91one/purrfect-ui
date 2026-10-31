// Dev-only fixture (not in registry.json, never installed): the worst titles for FitTitle, shown at /dev?c=fit-title.
import type { ReactNode } from "react";
import { FitTitle } from "./fit-title";

const box = (w: number, ...kids: ReactNode[]) => (
  <div style={{ width: w }} className="flex max-w-full flex-col gap-6 border border-dashed border-border">
    {kids}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: box(440, <FitTitle key="d">shop</FitTitle>),
  "Worst case": box(
    360,
    <FitTitle key="o">O</FitTitle>,
    <FitTitle key="l">An extremely long project title that cannot possibly fit on one line at a readable size</FitTitle>,
    <FitTitle key="u" as="h2">Donaudampfschifffahrtsgesellschaftskapitänswitwe</FitTitle>,
    <FitTitle key="j" as="p">日本語のタイトル</FitTitle>,
    <FitTitle key="a" as="p" dir="rtl">عنوان عربي</FitTitle>,
    <FitTitle key="e" as="p">🐈‍⬛ cats 🐈</FitTitle>,
    <FitTitle key="n" as="p" min={12} max={48}>Capped at 48px</FitTitle>,
    <FitTitle key="r" as="p" rise={false}>No rise</FitTitle>,
  ),
  Narrow: box(120, <FitTitle key="w">Wraps below min</FitTitle>, <FitTitle key="s" as="p">ok</FitTitle>),
  Empty: box(320, <FitTitle key="z">{""}</FitTitle>),
  Many: box(320, ...Array.from({ length: 40 }, (_, i) => <FitTitle key={i} as="p">{`Title number ${i + 1}`}</FitTitle>)),
};
