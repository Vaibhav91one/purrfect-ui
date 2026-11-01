/* eslint-disable @next/next/no-img-element */
// Dev-only fixture (not in registry.json, never installed): the realistic worst props for SpringChips, shown at /dev?c=spring-chips.
// Pushed down the page so the in-view trigger is exercised.
import type { ReactNode } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import Demo from "./demo";
import { SpringChips, type SpringChip } from "./spring-chips";

const page = (node: ReactNode) => <div className="mx-auto w-full max-w-4xl px-6 pt-[60svh] pb-[60svh]">{node}</div>;
const photo = <img src="/demo/city.jpg" alt="" className="h-80 w-56 rounded-3xl object-cover" />;
const mic = <Mic />;
// spelled out so Tailwind sees the classes
const ROWS = ["top-0", "top-12", "top-24", "top-36", "top-48", "top-60", "top-72", "top-84", "top-96", "top-108", "top-120", "top-132"];
const many: SpringChip[] = Array.from({ length: 24 }, (_, i) => ({
  label: `Chip ${i + 1}`,
  icon: mic,
  className: cn(i % 2 ? "right-0" : "left-0", ROWS[i >> 1]),
}));

export const states: Record<string, ReactNode> = {
  Demo: page(<Demo />),
  "Worst case": page(
    <SpringChips
      className="mx-auto grid h-[420px] w-[420px] place-items-center"
      chips={[
        { label: "A very long label that keeps going and going to see how the pill wraps across many lines without breaking", icon: mic, iconBackground: "var(--muted)", className: "-left-10 top-4" },
        { label: "Unbreakable_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", className: "-right-10 top-1/3" },
        { label: "ポートフォリオが過去最高値を更新しました", icon: mic, className: "-left-10 bottom-16" },
        { label: <span dir="rtl">تم اكتشاف فرصة لإعادة التوازن</span>, icon: mic, className: "-right-6 bottom-2" },
        { label: "", icon: mic, className: "left-1/2 top-0" },
      ]}
    >
      {photo}
    </SpringChips>,
  ),
  "Many (24)": page(
    <SpringChips className="mx-auto flex h-[640px] w-[480px] flex-col items-center justify-center" stagger={0.02} chips={many}>
      {photo}
    </SpringChips>,
  ),
  "No centre": page(<SpringChips className="h-40" chips={[{ label: "Only one, no icon", className: "left-1/3 top-10" }]} />),
  Empty: page(<SpringChips className="grid h-80 place-items-center" chips={[]}>{photo}</SpringChips>),
};
