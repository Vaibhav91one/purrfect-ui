// Dev-only fixture (not in registry.json, never installed): the realistic worst props for ColumnHop, shown at /dev?c=column-hop.
// Pushed down the page so the off-screen pause is exercised.
import type { ReactNode } from "react";
import Demo from "./demo";
import { ColumnHop } from "./column-hop";

const page = (node: ReactNode) => <div className="mx-auto w-full max-w-4xl px-6 pt-[60svh] pb-[60svh]">{node}</div>;
const t = (s: string) => <p className="break-words">{s}</p>;

export const states: Record<string, ReactNode> = {
  Demo: page(<Demo />),
  "Worst case": page(
    <ColumnHop
      stops={[0, 2, 1]}
      interval={1}
      columns={[
        { title: "A very long column title that keeps going well past the width of its column", items: [t("A long card that keeps going and going to see how it wraps across many lines without breaking the column at all")] },
        { title: "Unbreakable_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", items: [t("Unbreakable_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")] },
        { title: "空の列", items: [] },
        { title: <span dir="rtl">قيد المراجعة</span>, items: Array.from({ length: 6 }, (_, i) => t(`Card ${i + 1}`)) },
      ]}
      item={t(`Travelling: ${"word ".repeat(12)}`)}
      itemByColumn={[t("In column 1"), undefined, t("بطاقة متنقلة")]}
    />,
  ),
  "Many columns (8)": page(
    <ColumnHop stops={[0, 1, 2, 3, 4, 5, 6, 7]} interval={0.8} columns={Array.from({ length: 8 }, (_, i) => ({ title: `Col ${i + 1}`, items: [t("Card")] }))} item={t("Hop")} />,
  ),
  "One stop (no loop)": page(<ColumnHop stops={[1]} columns={[{ title: "Todo", items: [t("Stays")] }, { title: "Doing", items: [] }]} item={t("Parked")} />),
  Empty: page(<ColumnHop columns={[]} item={t("Nowhere")} />),
};
