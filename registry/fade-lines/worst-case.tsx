// Dev-only fixture (not in registry.json, never installed): the realistic worst text for FadeLines, shown at /dev?c=fade-lines.
import type { ReactNode } from "react";
import { FadeLines } from "./fade-lines";

const col = (...kids: ReactNode[]) => <div className="flex max-w-full flex-col items-start gap-6 p-6 text-2xl">{kids}</div>;

export const states: Record<string, ReactNode> = {
  Demo: col(<FadeLines key="a" text="Helping brands thrive in the digital world. Every line fades in after the last." />),
  "Worst case": col(
    <FadeLines key="a" text="Pneumonoultramicroscopicsilicovolcanoconiosis_and_an_unbreakable_email.address@example-company.com" />,
    <FadeLines key="b" text="メールアドレスを確認してください 你好世界" />,
    <FadeLines key="c" dir="rtl" text="إرسال الرسالة إلى الفريق" />,
    <FadeLines key="d" text="नमस्ते दुनिया 👋🏽 🇮🇳 👩‍👩‍👧" />,
    <FadeLines key="t" text={"No-break: 10 kg, Mr. Smith"} />,
    <FadeLines key="e" className="text-6xl font-semibold" text="Huge" />,
    <FadeLines key="f" className="text-xs" text="Tiny print that runs on and on across several lines so the line-by-line fade has a few rows to step through in the narrow width." />,
  ),
  One: col(<FadeLines key="a" text="A" />),
  Empty: col(<FadeLines key="a" text="   " />),
};
