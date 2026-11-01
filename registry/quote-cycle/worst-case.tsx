// Dev-only fixture (not in registry.json, never installed): the realistic worst props for QuoteCycle, shown at /dev?c=quote-cycle.
import type { ReactNode } from "react";
import { QuoteCycle } from "./quote-cycle";
import Demo from "./demo";

const box = (node: ReactNode) => <div className="w-[320px] rounded-2xl border border-border p-6 text-base">{node}</div>;

export const states: Record<string, ReactNode> = {
  Demo: <Demo />,
  "Worst case": (
    <div className="flex flex-wrap gap-6 p-6">
      {box(
        <QuoteCycle
          lines={[
            "Short.",
            "A very long line that wraps over several rows, so the box has to reserve the height of this one and not the short line before it; nothing below moves when the short ones come back around.",
            "Supercalifragilisticexpialidociousandthensomemorewithoutanyspacesatall",
            "التصميم هو التفكير الذي أصبح مرئيًا",
            "デザインとは目に見える思考である。",
            "Emoji 🎉🚀✨ in a line",
            <span key="rich">
              Rich <strong className="text-foreground">inline</strong> content with a{" "}
              <a href="#" className="underline">
                link
              </a>
            </span>,
          ]}
        />,
      )}
      {box(<QuoteCycle lines={["Only one line: no rotation"]} />)}
      {box(<QuoteCycle lines={[]} />)}
      {box(<QuoteCycle lines={["Announced: one", "Announced: two"]} announce interval={2} />)}
    </div>
  ),
};
