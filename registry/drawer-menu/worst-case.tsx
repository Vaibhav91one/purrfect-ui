// Dev-only fixture (not in registry.json, never installed): the realistic worst content for DrawerMenu, shown at /dev?c=drawer-menu.
// Each frame starts open so the layout can be judged at once; the button still toggles it.
import type { ReactNode } from "react";
import { DrawerMenu, type DrawerMenuProps } from "./drawer-menu";

const l = (...labels: string[]) => labels.map((label, i) => ({ label, href: `#${i}` }));
const footer = (
  <>
    <a href="#github">GitHub</a>
    <a href="#x">X</a>
    <a href="#linkedin">LinkedIn</a>
  </>
);
const frame = (p: Partial<DrawerMenuProps>) => (
  <div className="relative h-[640px] w-full max-w-[720px] overflow-hidden rounded-3xl bg-background">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/demo/coast.jpg" alt="" className="absolute inset-0 size-full object-cover" />
    <DrawerMenu contained defaultOpen links={l("Work", "About", "Contact")} active="#0" footer={footer} {...p} />
  </div>
);
const long = "International Transactions and Cross-border Settlement Policy";

export const states: Record<string, ReactNode> = {
  Demo: frame({}),
  "Worst case": (
    <div className="flex flex-col gap-6">
      {frame({ links: l(long, "Anmeldung-abschließen-und-bestätigen", "メールアドレスを確認して登録を完了する", "🚀 Launch 🎉"), heading: long, footer: <span>{long}</span> })}
      {frame({ links: l(...Array.from({ length: 30 }, (_, i) => `Section ${i + 1}`)), active: "#29" })}
      <div dir="rtl">{frame({ links: l("الصفحة الرئيسية", "المنتجات", "من نحن") })}</div>
      {/* two links to one href: only the hovered one lights */}
      {frame({ links: [{ label: "Work", href: "#work" }, { label: "Contact", href: "#contact" }, { label: "Hire me", href: "#contact" }], active: "#work" })}
    </div>
  ),
  Closed: frame({ defaultOpen: false }),
  "No active, no footer": frame({ active: undefined, footer: undefined }),
  One: frame({ links: l("Home") }),
  Empty: frame({ links: [] }),
};
