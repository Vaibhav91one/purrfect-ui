// Dev-only fixture (not in registry.json, never installed): the realistic worst text for FlipText, shown at /dev?c=flip-text.
import type { ReactNode } from "react";
import { FlipText } from "./flip-text";

const col = (...kids: ReactNode[]) => <div className="flex max-w-full flex-col items-start gap-6 p-6 text-2xl">{kids}</div>;

export const states: Record<string, ReactNode> = {
  Demo: col(<FlipText key="a" text="© Code By Vaibhav Tomar" className="uppercase" />),
  "Worst case": col(
    <FlipText key="a" text="Pneumonoultramicroscopicsilicovolcanoconiosis_and_an_unbreakable_email.address@example-company.com" />,
    <FlipText key="b" text="メールアドレスを確認してください 你好世界" />,
    <FlipText key="c" dir="rtl" text="إرسال الرسالة إلى الفريق" />,
    <FlipText key="d" text="नमस्ते दुनिया 👋🏽 🇮🇳 👩‍👩‍👧" />,
    <FlipText key="t" text={"Tag flag 🏴󠁧󠁢󠁳󠁣󠁴󠁿 and no-break: 10\u00A0kg, Mr.\u00A0Smith"} />,
    <FlipText key="e" className="text-6xl font-semibold" text="Huge" />,
    <FlipText key="f" className="text-xs" text="Tiny print that runs on and on across several lines so the line-by-line fade has a few rows to step through in the narrow width." />,
    <a key="g" href="#flip">
      <FlipText text="Inside a link: Tab here for the wave" />
    </a>,
  ),
  One: col(<FlipText key="a" text="A" />),
  Empty: col(<FlipText key="a" text="   " />),
};
