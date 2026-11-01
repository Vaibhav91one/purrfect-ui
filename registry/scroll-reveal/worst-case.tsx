// Dev-only fixture (not in registry.json, never installed): the realistic worst text for ScrollReveal, shown at /dev?c=scroll-reveal.
// Each state is taller than the screen so the reveal can be scrolled through.
import type { ReactNode } from "react";
import { ScrollReveal } from "./scroll-reveal";

const LONG = Array.from({ length: 12 }, () => "A long paragraph keeps one style write per frame, however many words it has.").join(" ");
const page = (...kids: ReactNode[]) => <div className="flex flex-col gap-[60svh] py-[60svh]">{kids}</div>;

export const states: Record<string, ReactNode> = {
  Demo: page(<ScrollReveal key="d" text="Scroll and the words fill in, one after another." className="max-w-xl text-3xl font-light" />),
  "Worst case": page(
    <ScrollReveal key="l" text={LONG} className="max-w-3xl text-2xl" />,
    <ScrollReveal key="s" text={"  double  spaces,\nnew lines\tand tabs  "} className="text-3xl" />,
    <ScrollReveal key="u" text="Donaudampfschifffahrtsgesellschaftskapitänswitwe" className="text-5xl" />,
    <ScrollReveal key="j" text="日本語 の 文章 も 単語 ごと に 表示 されます" className="text-3xl" />,
    <ScrollReveal key="a" dir="rtl" text="النص العربي يظهر كلمة بكلمة" className="text-3xl" />,
    <ScrollReveal key="jn" text="日本語の文章はスペースなしで書かれますが単語ごとに表示されます" className="text-3xl" />,
    <ScrollReveal key="th" text="ภาษาไทยเขียนติดกันโดยไม่มีช่องว่างระหว่างคำ" className="text-3xl" />,
    <ScrollReveal key="lc" mode="chars" text={LONG} className="max-w-3xl text-2xl" />,
  ),
  Chars: page(
    <ScrollReveal key="c" mode="chars" text="Selected work" className="text-7xl font-semibold tracking-tight" />,
    <ScrollReveal key="cl" mode="chars" text={LONG.slice(0, 300)} className="max-w-3xl text-3xl" />,
    <ScrollReveal key="cu" mode="chars" text="Donaudampfschifffahrtsgesellschaftskapitänswitwe" className="text-5xl" />,
    <ScrollReveal key="ce" mode="chars" text="Emoji 👩‍💻🇮🇳 and café, ñ" className="text-5xl" />,
    <ScrollReveal key="cj" mode="chars" text="日本語 の 文章" className="text-5xl" />,
    <ScrollReveal key="cjn" mode="chars" text="日本語の文章はスペースなしで書かれます" className="text-5xl" />,
    <ScrollReveal key="ca" mode="chars" dir="rtl" text="النص العربي يظهر" className="text-5xl" />,
    <ScrollReveal key="cs" mode="chars" text={"  double  spaces,\nnew lines\tand tabs  "} className="text-3xl" />,
    <ScrollReveal key="c0" mode="chars" text="" />,
  ),
  One: page(<ScrollReveal key="o" text="Word" className="text-5xl" />),
  Empty: page(<ScrollReveal key="e" text="" />),
};
