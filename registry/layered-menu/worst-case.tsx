// Dev-only fixture (not in registry.json, never installed): the realistic worst content for LayeredMenu, shown at /dev?c=layered-menu.
// Each frame starts open so the layout can be judged at once; the burger still toggles it.
import type { ReactNode } from "react";
import { LayeredMenu, type LayeredMenuProps } from "./layered-menu";

const l = (...labels: string[]) => labels.map((label, i) => ({ label, href: `#${i}` }));
const frame = (p: Partial<LayeredMenuProps>) => (
  <div className="relative h-[560px] overflow-hidden rounded-3xl bg-gradient-to-b from-sky-700 to-sky-300">
    <LayeredMenu contained defaultOpen delay={0} primary={l("Experience", "Technology", "Company")} logo={<span className="font-medium tracking-tight">ARMOUR</span>} {...p} />
  </div>
);
const long = "International Transactions and Cross-border Settlement Policy";

export const states: Record<string, ReactNode> = {
  Demo: frame({ secondary: l("Build Apps", "Voice Tools", "Features", "Metrics", "FAQ", "Download"), legal: l("Privacy Policy", "Terms of Use", "Impact Reporting") }),
  "Worst case": (
    <div className="flex flex-col gap-6">
      {frame({ secondary: l("Build Apps", "Voice Tools"), legal: l("Privacy Policy") })}
      {frame({ primary: l(long, "Anmeldung-abschließen-und-bestätigen", "メールアドレスを確認して登録を完了する", "🚀 Launch 🎉"), secondary: l(long), legal: l(long) })}
      {frame({ primary: l(...Array.from({ length: 12 }, (_, i) => `Section ${i + 1}`)), secondary: l(...Array.from({ length: 12 }, (_, i) => `Link ${i + 1}`)) })}
      <div dir="rtl">{frame({ primary: l("الصفحة الرئيسية", "المنتجات", "من نحن"), secondary: l("الأسئلة الشائعة") })}</div>
    </div>
  ),
  // a light page: the burger is dark while shut (color) and cream once the menu is open (activeColor)
  "Light page": (
    <div className="relative h-[560px] overflow-hidden rounded-3xl bg-white">
      <LayeredMenu contained delay={0} color="#171717" primary={l("Experience", "Technology", "Company")} secondary={l("Features", "FAQ")} logo={<span className="font-medium tracking-tight">ARMOUR</span>} />
    </div>
  ),
  One: frame({ primary: l("Home") }),
  Empty: frame({ primary: [] }),
};
