// Dev-only fixture (not in registry.json, never installed): the realistic worst props for ShimmerText, shown at /dev?c=shimmer-text.
import type { ReactNode } from "react";
import { ShimmerText } from "./shimmer-text";

const frame = (...kids: ReactNode[]) => (
  <div className="grid max-w-full gap-6 p-6">
    {kids.map((k, i) => (
      <div key={i} className="min-w-0 rounded-2xl bg-muted p-4">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: frame(<ShimmerText>Armour is listening…</ShimmerText>, <ShimmerText as="p">Thinking…</ShimmerText>),
  "Worst case": frame(
    <ShimmerText className="break-all">Donaudampfschifffahrtsgesellschaftskapitänswitwe_and_an_unbreakable_email@example-very-long-domain.com</ShimmerText>,
    <ShimmerText as="p">
      A whole paragraph that wraps across several lines, so the band sweeps every line box at once rather than one line after another.
      It still reads as one sentence to a screen reader, because the text is a single node.
    </ShimmerText>,
    <ShimmerText as="h2" className="text-4xl font-bold">
      思考中… 考えています
    </ShimmerText>,
    <p dir="rtl">
      <ShimmerText>جارٍ التفكير… 🤔</ShimmerText>
    </p>,
    <ShimmerText duration={0.4}>Fast: 0.4s</ShimmerText>,
    // check-ignore: duration a deliberately slow sweep to check the long end
    <ShimmerText duration={12}>Slow: 12s</ShimmerText>,
    <ShimmerText>{""}</ShimmerText>,
  ),
};
