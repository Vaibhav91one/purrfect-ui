// Dev-only fixture (not in registry.json, never installed): the realistic worst content for Notch, shown at /dev?c=notch.
import type { ReactNode } from "react";
import { Notch } from "./notch";

const frame = (...kids: ReactNode[]) => (
  <div className="flex flex-col gap-6 p-4">
    {kids.map((k, i) => (
      <div key={i} className="relative h-40 overflow-hidden rounded-3xl bg-gradient-to-b from-sky-700 to-sky-300">
        {k}
      </div>
    ))}
  </div>
);
const word = (t: string) => <span className="text-2xl font-medium tracking-tight text-foreground">{t}</span>;

export const states: Record<string, ReactNode> = {
  Demo: frame(<Notch delay={0}>{word("ARMOUR")}</Notch>, <Notch delay={0} offset={8}>{word("ARMOUR, 8px down")}</Notch>, <Notch delay={0} color="#1B1B1B"><span className="text-2xl font-medium tracking-tight text-white">ARMOUR</span></Notch>),
  "Worst case": frame(
    <Notch delay={0}>{word("International Transactions and Cross-border Settlement Desk")}</Notch>,
    <Notch delay={0}>{word("اسم الشركة الطويل جداً")}</Notch>,
    <Notch delay={0} radius={8}>{word("Tiny radius")}</Notch>,
    <Notch delay={0} radius={64}>{word("Big radius")}</Notch>,
    <Notch delay={0}>
      <nav className="flex gap-6 text-sm whitespace-nowrap text-neutral-900">
        {["Home", "Pricing", "Docs", "Changelog", "Careers", "Contact"].map((l) => (
          <a key={l} href="#x">{l}</a>
        ))}
      </nav>
    </Notch>,
  ),
  One: frame(<Notch delay={0}>{word("A")}</Notch>),
  Empty: frame(<Notch delay={0}>{null}</Notch>),
};
