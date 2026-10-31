// Dev-only fixture (not in registry.json, never installed): the realistic worst content for ScrollMarquee, shown at /dev?c=scroll-marquee.
// The page is taller than the screen so scrolling can flip it.
import type { ReactNode } from "react";
import { ScrollMarquee } from "./scroll-marquee";

const page = (...kids: ReactNode[]) => <div className="flex flex-col gap-16 py-[20svh] pb-[150svh]">{kids.map((k, i) => <div key={i}>{k}</div>)}</div>;
const line = (t: string, size = "text-7xl") => <p className={`pr-12 font-medium whitespace-nowrap ${size}`}>{t}</p>;

export const states: Record<string, ReactNode> = {
  Demo: page(<ScrollMarquee>{line("Scroll to flip me —")}</ScrollMarquee>),
  "Worst case": page(
    <ScrollMarquee>{line("A", "text-xl")}</ScrollMarquee>,
    <ScrollMarquee speed={400}>{line("Fast and very long marquee text that is wider than most screens on its own —")}</ScrollMarquee>,
    <ScrollMarquee direction="right">{line("メールアドレスを確認 —")}</ScrollMarquee>,
    <ScrollMarquee>
      <div className="flex gap-6 pr-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="grid size-24 place-items-center rounded-2xl bg-muted">{i + 1}</div>
        ))}
      </div>
    </ScrollMarquee>,
  ),
  Empty: page(<ScrollMarquee>{null}</ScrollMarquee>),
};
