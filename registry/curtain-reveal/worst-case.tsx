// Dev-only fixture (not in registry.json, never installed): the realistic worst content for CurtainReveal, shown at /dev?c=curtain-reveal.
import type { ReactNode } from "react";
import { CurtainReveal } from "./curtain-reveal";

const above = <section className="grid h-[120svh] place-items-center bg-background text-3xl">Scroll down</section>;

export const states: Record<string, ReactNode> = {
  Demo: (
    <>
      {above}
      <CurtainReveal className="grid place-items-center">
        <p className="text-5xl font-medium">Let&apos;s work together</p>
      </CurtainReveal>
    </>
  ),
  "Worst case": (
    <>
      {above}
      {/* more content than the panel holds: it clips instead of pushing the page */}
      <CurtainReveal height="50svh" className="p-8">
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i}>Line {i + 1} of a contact block that is far taller than its panel.</p>
        ))}
      </CurtainReveal>
      <CurtainReveal height="320px" className="grid place-items-center bg-primary text-primary-foreground">
        <a href="#top" className="underline">A fixed 320px curtain with a link</a>
      </CurtainReveal>
    </>
  ),
};
