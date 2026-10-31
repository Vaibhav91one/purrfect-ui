// Dev-only fixture (not in registry.json, never installed): the realistic worst content for MarqueeRows, shown at /dev?c=marquee-rows.
import type { ReactNode } from "react";
import { MarqueeRows } from "./marquee-rows";

const labels = (...l: string[]) => l.map((label) => ({ label }));

export const states: Record<string, ReactNode> = {
  Demo: <MarqueeRows items={labels("We listen", "We experiment", "We measure", "We share")} />,
  "Very long labels": (
    <MarqueeRows
      items={labels(
        "A very long value statement that is much wider than most screens on its own",
        "Supercalifragilisticexpialidociousunbreakablewordwithnospaces",
        "Short",
      )}
    />
  ),
  "One row": <MarqueeRows items={labels("Only me")} speed={400} />,
  "12 rows": <MarqueeRows items={Array.from({ length: 12 }, (_, i) => ({ label: `Row ${i + 1}` }))} className="text-2xl md:text-4xl" />,
  "Non-Latin / RTL": (
    <div dir="rtl">
      <MarqueeRows items={labels("نحن نستمع", "نحن نجرب", "メールアドレスを確認", "我们分享")} />
    </div>
  ),
  "Links vs no href": (
    <MarqueeRows
      items={[{ label: "Link row", href: "#a" }, { label: "Button row" }, { label: "Another link", href: "#b" }]}
      bandClassName="bg-foreground text-background"
      indent={false}
    />
  ),
  Empty: <MarqueeRows items={[]} />,
};
