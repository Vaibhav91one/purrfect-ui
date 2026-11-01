// Dev-only fixture (not in registry.json, never installed): the realistic worst props for GridDisclosure, shown at /dev?c=grid-disclosure.
import type { ReactNode } from "react";
import { GridDisclosure } from "./grid-disclosure";

const box = (...kids: ReactNode[]) => (
  <div className="flex max-w-2xl flex-col gap-10 p-6">
    {kids.map((k, i) => (
      <div key={i}>{k}</div>
    ))}
  </div>
);

const faq = [
  { title: "What exactly am I approving?", content: "The precise bytes of the outbound comment, bound to a content hash. Approving does not close the issue." },
  { title: "How is scope enforced?", content: "At the capability boundary, not by the agent choosing to behave." },
  { title: "Do I need GitHub at all?", content: "Not for intake. Email and file upload are independent channels." },
];

export const states: Record<string, ReactNode> = {
  Demo: box(<GridDisclosure items={faq} />),
  "Worst case": box(
    <GridDisclosure items={[]} />,
    <GridDisclosure items={[{ title: "One", content: "Only row." }]} defaultValue={null} />,
    <GridDisclosure
      items={[
        { title: "Supercalifragilisticexpialidocious_unbreakable_question_label_with_no_spaces_at_all_anywhere", content: "https://example.com/" + "a".repeat(180) },
        { title: "A very long question that wraps onto several lines because somebody wrote a whole paragraph where a question should be, and kept going", content: Array.from({ length: 12 }, () => "A long answer that keeps going.").join(" ") },
        { title: "", content: "" },
      ]}
    />,
    <div dir="rtl">
      <GridDisclosure items={[{ title: "هل يعمل الاستنساخ اليوم؟", content: "نعم، للهدف المثبت الوحيد." }, { title: "日本語の質問はここにあります", content: "回答はこちら。" }]} />
    </div>,
    <GridDisclosure items={Array.from({ length: 40 }, (_, i) => ({ title: `Question ${i + 1}`, content: `Answer ${i + 1}` }))} defaultValue={39} />,
    <GridDisclosure items={faq} value={7} />,
  ),
};
