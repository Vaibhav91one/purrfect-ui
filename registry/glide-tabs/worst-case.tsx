// Dev-only fixture (not in registry.json, never installed): the realistic worst props for GlideTabs, shown at /dev?c=glide-tabs.
import type { ReactNode } from "react";
import { GlideTabs } from "./glide-tabs";

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
  Demo: box(<GlideTabs tabs={["Preview", "Code", "Docs"]} />),
  "Worst case": box(
    <GlideTabs tabs={["One"]} />,
    <GlideTabs tabs={["Overview", "Quarterly engineering newsletter", "Product updates and release notes"]} />,
    <GlideTabs tabs={Array.from({ length: 12 }, (_, i) => `Tab ${i + 1}`)} />,
    <GlideTabs tabs={["Preview", "Code"]} defaultValue="Code" />,
    <GlideTabs tabs={[{ value: "a", label: "Disabled first", disabled: true }, "Enabled", { value: "c", label: "Disabled", disabled: true }, "Last"]} />,
    <GlideTabs tabs={[{ value: "a", label: "All", disabled: true }, { value: "b", label: "disabled", disabled: true }]} />,
    <GlideTabs orientation="vertical" tabs={["Account", "Billing and invoices", "Notifications"]} />,
    <GlideTabs tabs={["Preview", "Code"]} value="Missing" />,
    <GlideTabs dir="rtl" tabs={["معاينة", "الكود", "المستندات"]} />,
    <GlideTabs idPrefix="wc" tabs={["Overview", "Billing and invoices"]} />,
  ),
};
