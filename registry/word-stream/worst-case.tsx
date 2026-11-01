// Dev-only fixture (not in registry.json, never installed): the realistic worst props for WordStream, shown at /dev?c=word-stream.
import type { ReactNode } from "react";
import { WordStream } from "./word-stream";

const frame = (...kids: ReactNode[]) => (
  <div className="grid max-w-full gap-6 p-6">
    {kids.map((k, i) => (
      <div key={i} className="min-w-0 rounded-2xl bg-muted p-4 text-sm leading-relaxed text-foreground">
        {k}
      </div>
    ))}
  </div>
);

const LONG = Array.from({ length: 12 }, (_, i) => `Paragraph ${i + 1} keeps going so the reveal runs for a while and the box keeps its final height from the first frame.`).join("\n\n");

export const states: Record<string, ReactNode> = {
  Demo: frame(<WordStream text="The export endpoint returns another workspace's invoices when you swap the account id in the URL." />),
  "Worst case": frame(
    <WordStream className="break-all" text="Donaudampfschifffahrtsgesellschaftskapitänswitwe an_unbreakable_email@example-very-long-domain.com https://example.com/a/very/long/path?with=query&and=more" />,
    <WordStream text={"Line one\nLine two after a newline\n\n   indented after a blank line\tand a tab"} />,
    <WordStream text={LONG} interval={10} />,
    <WordStream text="思考中… 考えています、少々お待ちください。" />,
    <div dir="rtl">
      <WordStream text="جارٍ التفكير في هذا التقرير الآن 🤔" />
    </div>,
    // check-ignore: duration a deliberately slow stream so the caret blink is visible
    <WordStream text="Slow: one word every 1200 milliseconds" interval={1200} />,
    <WordStream text="" />,
    <WordStream text="One" />,
  ),
};
