// Dev-only fixture (not in registry.json, never installed): the realistic worst props for AsteriskRows, shown at /dev?c=asterisk-rows.
// The page is taller than the screen so scrolling turns the marks and flips the drift.
import type { ReactNode } from "react";
import { AsteriskRows } from "./asterisk-rows";

const page = (...kids: ReactNode[]) => <div className="flex flex-col gap-16 py-[20svh] pb-[150svh]">{kids.map((k, i) => <div key={i}>{k}</div>)}</div>;

export const states: Record<string, ReactNode> = {
  Demo: page(<AsteriskRows />),
  "Worst case": page(
    <AsteriskRows rows={0} />,
    <AsteriskRows rows={1} count={1} markClassName="size-2" />,
    <AsteriskRows rows={5} count={1000} markClassName="size-8" speed={400} />,
    <AsteriskRows count={0} speed={0} turns={0} />,
    <AsteriskRows markClassName="size-[40rem]" turns={500} />,
    <AsteriskRows rows={1} markClassName="h-12 w-64">
      <span className="grid size-full place-items-center text-sm whitespace-nowrap">Supercalifragilisticexpialidocious مرحبا</span>
    </AsteriskRows>,
  ),
  RTL: page(<AsteriskRows dir="rtl" className="text-primary" />),
};
