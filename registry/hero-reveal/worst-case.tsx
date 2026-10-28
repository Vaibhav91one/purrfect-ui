// Dev-only fixture (not in registry.json, never installed): the realistic worst content for HeroReveal, shown at /dev?c=hero-reveal.
import type { ReactNode } from "react";
import { HeroReveal } from "./hero-reveal";

const SKY = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5a96"/><stop offset=".6" stop-color="#9fb8d3"/><stop offset="1" stop-color="#3d6b3a"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/></svg>');
const cta = <button type="button" className="rounded-full bg-neutral-900 px-8 py-4 font-medium whitespace-nowrap text-white">Get the app</button>;
const hero = (p: Partial<React.ComponentProps<typeof HeroReveal>>) => <HeroReveal className="min-h-[28rem]!" src={SKY} title="Your wealth, finally working." {...p} />;

export const states: Record<string, ReactNode> = {
  Demo: hero({ description: "The AI finance app that tracks your spending and grows your portfolio.", action: cta }),
  "Worst case": (
    <div className="flex flex-col gap-6">
      {hero({
        title: "Internationalisation-ready infrastructure for organisations that operate across jurisdictions",
        description: "Armour is the AI finance app that tracks your spending, grows your portfolio, and tells you exactly what to do next, whether you are saving for a first home, paying down a loan or planning retirement — all from your iPhone, with no hidden fees and no spreadsheets.",
        action: cta,
      })}
      {hero({ title: "ثروتك أخيراً تعمل", description: "تطبيق التمويل الذكي", action: cta })}
      {hero({ src: "/missing.jpg", title: "The photo failed to load", description: "A dark frame opens in its place and the text stays readable.", action: cta })}
    </div>
  ),
  One: hero({ title: "Hi" }),
  Empty: hero({ title: "" }),
};
