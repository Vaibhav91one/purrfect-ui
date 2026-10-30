// Dev-only fixture (not in registry.json, never installed): the realistic worst props for PathCarousel, shown at /dev?c=path-carousel.
// Each carousel sits between tall spacers: the page must still scroll past it with the wheel and the arrow keys.
import type { ReactNode } from "react";
import { PathCarousel } from "./path-carousel";

const card = (t: ReactNode, i: number) => (
  <div key={i} className="grid size-full place-items-center overflow-hidden rounded-[32px] bg-card p-4 text-center text-xl font-light">
    {t}
  </div>
);
const box = (node: ReactNode, h = "h-[360px]") => <div className={`${h} w-full`}>{node}</div>;
const page = (...kids: ReactNode[]) => <div className="flex flex-col gap-[50svh] py-[50svh]">{kids.map((k, i) => <div key={i}>{k}</div>)}</div>;
const names = (n: number) => Array.from({ length: n }, (_, i) => card(`Item ${i + 1}`, i));

export const states: Record<string, ReactNode> = {
  Demo: page(box(<PathCarousel items={["Alpha", "Beta", "Gamma", "Delta", "Epsilon"].map(card)} />)),
  "Worst case": page(
    box(<PathCarousel label="Many" items={names(40)} />),
    box(<PathCarousel label="Links inside" items={["One", "Two", "Three"].map((t, i) => card(<a href={`#${t}`} className="underline">{t}: a link inside a slide</a>, i))} />),
    box(<PathCarousel label="Long" items={["Quarterly engineering newsletter and product updates", "Anmeldung-abschließen-und-bestätigen", "メールアドレスを確認して登録を完了する"].map(card)} />),
    box(<PathCarousel label="Short" items={names(5)} />, "h-[140px]"),
  ),
  Two: page(box(<PathCarousel label="Two" items={names(2)} />)),
  One: page(box(<PathCarousel label="One" items={names(1)} />)),
  Empty: page(box(<PathCarousel label="Empty" items={[]} />)),
};
