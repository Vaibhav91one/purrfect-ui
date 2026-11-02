"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, type ComponentProps, type CSSProperties, type RefObject } from "react";
import { cn } from "@/lib/utils";

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

export interface ScrollRevealProps extends Omit<ComponentProps<"p">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  text: string;
  /** Size and weight. Replaces the default type scale (text-4xl up to text-7xl) instead of merging with it. */
  className?: string;
  offset?: Offset;
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
  /** "words" fills in word by word; "chars" (char-scrub) grows each letter from half size, rising and fading in. */
  mode?: "words" | "chars";
}

// cursive scripts join their letters, so splitting them into boxes breaks the shaping: those words move as one unit
const JOINED = /[\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}]/u;
const graphemes = new Intl.Segmenter();
const letters = (w: string) => (JOINED.test(w) ? [w] : Array.from(graphemes.segment(w), (s) => s.segment));
// words mode splits each spaced chunk into dictionary words too, so Japanese, Chinese or Thai written without spaces still
// fills in progressively; punctuation stays on the word before it, and only the chunk's last word gets the space after it
const wordSeg = new Intl.Segmenter(undefined, { granularity: "word" });
const wordsOf = (chunk: string) => {
  const parts: string[] = [];
  for (const s of wordSeg.segment(chunk)) {
    if (s.isWordLike || !parts.length) parts.push(s.segment);
    else parts[parts.length - 1] += s.segment;
  }
  return parts.map((w, j) => ({ w, end: j === parts.length - 1 }));
};

/**
 * Text that fills in word by word as you scroll it into view: every word starts faint and turns solid in reading
 * order, finishing when its top reaches the upper sixth of the screen (`offset` changes that). Pass `container` to follow a
 * scrolling box instead of the page. Size and weight come from `className`; the line height is 1.1 unless it sets a `leading-*`.
 * One CSS variable carries the scroll progress and each word's opacity is a CSS clamp of it, so a long paragraph costs one
 * style write per frame, not one per word. `mode="chars"` scrubs letters instead: each grows from half size, rises and fades
 * in, words only break mid-word when wider than the line. Each frame writes only the few letters the progress is crossing, so
 * the cost does not grow with the text. Reduced motion: no movement in either mode; the fill is opacity only, so it stays.
 */
export function ScrollReveal({ text, className = "text-4xl font-light tracking-tight md:text-6xl lg:text-7xl", offset = ["start 0.8", "start 0.15"], container, mode = "words", style, ...rest }: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset, container });
  const words = text.trim().split(/\s+/).filter(Boolean);
  // after className: tailwind-merge drops a leading-* that comes before a text-* size, though in Tailwind 4 the leading still wins
  const cls = cn(className, !/(^|[\s:])leading-/.test(className) && "leading-[1.1]");
  // chars mode: letter i runs from i/(n+2) to (i+3)/(n+2) of the progress, so three overlap and the last ends at 1. Only the
  // letters whose window the progress crossed since the last frame get a new --t, instead of every letter recalculating
  const split = mode === "chars" ? words.map(letters) : [];
  const n = split.flat().length;
  const chars = useRef<(HTMLSpanElement | null)[]>([]);
  const last = useRef(0);
  const paint = (v: number) => {
    const els = chars.current;
    const from = Math.max(0, Math.floor(Math.min(last.current, v) * (n + 2)) - 3), to = Math.min(n - 1, Math.ceil(Math.max(last.current, v) * (n + 2)));
    for (let i = from; i <= to; i++) els[i]?.style.setProperty("--t", String(Math.min(1, Math.max(0, (v * (n + 2) - i) / 3))));
    last.current = v;
  };
  useMotionValueEvent(scrollYProgress, "change", (v) => mode === "chars" && paint(v));
  // a render can bring new letters at --t 0: repaint every letter at the current progress
  useEffect(() => {
    if (mode !== "chars") return;
    last.current = 0;
    paint(1);
    paint(scrollYProgress.get());
  });
  if (mode === "chars") {
    const starts = split.map((_, w) => split.slice(0, w).reduce((a, cs) => a + cs.length, 0));
    return (
      <motion.p ref={ref} className={cls} style={style} {...rest}>
        <span className="sr-only">{text}</span>
        <span aria-hidden className="select-none">
          {split.map((cs, w) => (
            <span key={w}>
              {w > 0 && " "}
              <span className="inline-block max-w-full">
                {cs.map((c, j) => {
                  // --t is written by paint(); --e eases it out
                  const i = starts[w] + j;
                  return (
                    <span key={i} ref={(el) => void (chars.current[i] = el)} style={{ "--t": 0 } as CSSProperties} className="inline-block opacity-(--t) [--e:calc(1-(1-var(--t))*(1-var(--t)))] [transform:translateY(calc((1-var(--e))*0.4em))_scale(calc(0.5+var(--e)*0.5))] motion-reduce:transform-none">
                      {c}
                    </span>
                  );
                })}
              </span>
            </span>
          ))}
        </span>
      </motion.p>
    );
  }
  const segs = words.flatMap(wordsOf);
  return (
    <motion.p ref={ref} className={cls} style={{ ...style, "--reveal": scrollYProgress } as CSSProperties} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="select-none">
        {segs.map(({ w, end }, i) => (
          <span key={i} className={cn("relative mt-1 inline-block max-w-full [overflow-wrap:anywhere]", end && "me-[0.25em]")}>
            <span className="opacity-20">{w}</span>
            {/* word i turns solid while the progress runs from i/n to (i+1)/n; opacity only, so reduced motion keeps it */}
            <span style={{ opacity: `clamp(0, var(--reveal) * ${segs.length} - ${i}, 1)` }} className="absolute inset-0">
              {w}
            </span>
          </span>
        ))}
      </span>
    </motion.p>
  );
}
