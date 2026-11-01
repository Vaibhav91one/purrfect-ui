// Dev-only fixture (not in registry.json, never installed): the realistic worst content for AnnounceStrip, shown at /dev?c=announce-strip.
// The page is taller than the screen so scrolling down puts the strips away.
import type { ReactNode } from "react";
import { AnnounceStrip } from "./announce-strip";

const page = (...kids: ReactNode[]) => <div className="flex flex-col gap-8 pb-[150svh]">{kids.map((k, i) => <div key={i}>{k}</div>)}</div>;
const line = (t: string) => <span className="px-4 py-1.5">{t}</span>;

export const states: Record<string, ReactNode> = {
  Demo: page(<AnnounceStrip>{line("Built for the WeMakeDevs × TrueFoundry × Qodo Agent Harness Hackathon ✦")}</AnnounceStrip>),
  "Worst case": page(
    <AnnounceStrip>{line("A")}</AnnounceStrip>,
    <AnnounceStrip duration={4}>{line("A very long announcement that on its own is wider than most screens, so a single copy already overflows the strip and the loop must still be seamless —")}</AnnounceStrip>,
    <AnnounceStrip className="bg-muted text-muted-foreground">{line("メールアドレスを確認してください 🎉 مرحبا بالعالم")}</AnnounceStrip>,
    <AnnounceStrip hideOnScroll={false} className="text-lg">{line("Never hides on scroll, larger text")}</AnnounceStrip>,
    <AnnounceStrip open={false}>{line("Closed from the start: renders as a collapsed row")}</AnnounceStrip>,
  ),
  Empty: page(<AnnounceStrip>{null}</AnnounceStrip>),
};
