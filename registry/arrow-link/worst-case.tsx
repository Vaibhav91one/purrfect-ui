// Dev-only fixture (not in registry.json, never installed): the realistic worst labels for ArrowLink, shown at /dev?c=arrow-link.
import type { ReactNode } from "react";
import { ArrowLink } from "./arrow-link";

const col = (...kids: ReactNode[]) => (
  <div className="flex flex-col items-start gap-6 p-6">
    {kids.map((k, i) => (
      <div key={i} className="max-w-full">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: col(<ArrowLink href="#a">Get in touch</ArrowLink>, <ArrowLink href="#b">Next project</ArrowLink>),
  "Worst case": col(
    <ArrowLink href="#a">The quarterly engineering newsletter and product updates</ArrowLink>,
    <ArrowLink href="#b">メールアドレスを確認</ArrowLink>,
    <ArrowLink href="#c" dir="rtl">إرسال الرسالة</ArrowLink>,
    <ArrowLink href="#d" className="text-8xl font-semibold">Huge</ArrowLink>,
    <ArrowLink href="#e" className="text-base">Tiny</ArrowLink>,
    <ArrowLink href="mailto:hello@example.com">hello@a-very-long-unbroken-domain-name-example.com</ArrowLink>,
  ),
  One: col(<ArrowLink href="#x">A</ArrowLink>),
};
