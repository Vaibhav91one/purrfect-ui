// Dev-only fixture (not in registry.json, never installed): the realistic worst props for Tabs, shown at /dev?c=tabs.
import type { ReactNode } from "react";
import { Tabs } from "./tabs";

const box = (...kids: ReactNode[]) => (
  <div className="flex flex-col items-start gap-8 p-6">
    {kids.map((k, i) => (
      <div key={i} className="max-w-full">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: box(<Tabs tabs={["Preview", "Code", "Docs"]} />),
  "Worst case": box(
    <Tabs tabs={["One"]} />,
    <Tabs tabs={["Overview", "Quarterly engineering newsletter", "Product updates and release notes"]} />,
    <Tabs tabs={Array.from({ length: 12 }, (_, i) => `Tab ${i + 1}`)} />,
    <Tabs tabs={["Preview", "Code"]} defaultValue="Code" />,
  ),
};
