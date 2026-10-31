// Dev-only fixture (not in registry.json, never installed): the realistic worst props for FillButton, shown at /dev?c=fill-button.
import { ArrowUpRight, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { FillButton } from "./fill-button";

const col = (...kids: ReactNode[]) => (
  <div className="flex flex-col items-start gap-4 p-6">
    {kids.map((k, i) => (
      <div key={i} className="max-w-full">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: col(<FillButton>Get in touch</FillButton>, <FillButton href="#w">View work <ArrowUpRight className="size-4" /></FillButton>),
  "Worst case": col(
    <FillButton>Subscribe to the quarterly engineering newsletter and product updates</FillButton>,
    <FillButton className="whitespace-normal text-left">Subscribe to the quarterly engineering newsletter and product updates, allowed to wrap</FillButton>,
    <FillButton>メールアドレスを確認</FillButton>,
    <FillButton dir="rtl">إرسال الرسالة</FillButton>,
    <FillButton disabled>Disabled</FillButton>,
    <FillButton className="px-3" aria-label="Email"><Mail className="size-4" /></FillButton>,
    <FillButton className="border-primary text-primary">Themed</FillButton>,
  ),
  One: col(<FillButton>A</FillButton>),
};
