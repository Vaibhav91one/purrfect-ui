// Dev-only fixture (not in registry.json, never installed): the realistic worst labels for RollLink, shown at /dev?c=roll-link.
import Link from "next/link";
import type { ReactNode } from "react";
import { RollLink } from "./roll-link";

const col = (...kids: ReactNode[]) => (
  <div className="flex flex-col items-start gap-6 p-6 text-2xl">
    {kids.map((k, i) => (
      <div key={i} className="max-w-full">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: col(<RollLink href="#work">Work</RollLink>, <RollLink href="#about">About</RollLink>),
  "Worst case": col(
    <RollLink href="#a">The quarterly engineering newsletter and product updates</RollLink>,
    <RollLink href="#b">メールアドレスを確認</RollLink>,
    <RollLink href="#c" dir="rtl">إرسال الرسالة</RollLink>,
    <RollLink href="#d" className="text-6xl font-semibold">Huge</RollLink>,
    <RollLink href="#e" className="text-xs">Tiny</RollLink>,
    <RollLink asChild>
      <Link href="/components">A Next Link via asChild</Link>
    </RollLink>,
  ),
  One: col(<RollLink href="#x">A</RollLink>),
};
