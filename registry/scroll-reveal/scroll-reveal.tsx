"use client";

import { motion, useScroll } from "motion/react";
import { useRef, type ComponentProps, type CSSProperties, type RefObject } from "react";
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
 * scrolling box instead of the page. Size and weight come from `className`. Reduced motion shows the whole text solid.
 * One CSS variable carries the scroll progress and each word's opacity is a CSS clamp of it, so a long paragraph costs one
 * style write per frame, not one per word. `mode="chars"` scrubs letters instead: each grows from half size, rises and fades
 * in, words only break mid-word when wider than the line. It is still one style write, but every letter's style is recalculated
 * each frame (about 9ms for 1,000 letters), so keep chars mode to headings and short lines. Reduced motion keeps only its fade.
 */
export function ScrollReveal({ text, className = "text-4xl font-light tracking-tight md:text-6xl lg:text-7xl", offset = ["start 0.8", "start 0.15"], container, mode = "words", style, ...rest }: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset, container });
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (mode === "chars") {
    const split = words.map(letters);
    const starts = split.map((_, w) => split.slice(0, w).reduce((a, cs) => a + cs.length, 0));
    const n = split.flat().length;
    return (
      <motion.p ref={ref} className={cn("leading-[1.1]", className)} style={{ ...style, "--reveal": scrollYProgress } as CSSProperties} {...rest}>
        <span className="sr-only">{text}</span>
        <span aria-hidden className="select-none">
          {split.map((cs, w) => (
            <span key={w}>
              {w > 0 && " "}
              <span className="inline-block max-w-full">
                {cs.map((c, j) => {
                  // letter i runs from i/(n+2) to (i+3)/(n+2) of the progress, so three overlap and the last ends at 1; --e eases it out
                  const i = starts[w] + j;
                  return (
                    <span key={i} style={{ "--t": `clamp(0, (var(--reveal) * ${n + 2} - ${i}) / 3, 1)` } as CSSProperties} className="inline-block opacity-(--t) [--e:calc(1-(1-var(--t))*(1-var(--t)))] [transform:translateY(calc((1-var(--e))*0.4em))_scale(calc(0.5+var(--e)*0.5))] motion-reduce:transform-none">
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
    <motion.p ref={ref} className={cn("leading-[1.1]", className)} style={{ ...style, "--reveal": scrollYProgress } as CSSProperties} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="select-none">
        {segs.map(({ w, end }, i) => (
          <span key={i} className={cn("relative mt-1 inline-block max-w-full [overflow-wrap:anywhere]", end && "me-[0.25em]")}>
            <span className="opacity-20">{w}</span>
            {/* word i turns solid while the progress runs from i/n to (i+1)/n; reduced motion pins it solid in CSS, so the server HTML and the first client render agree */}
            <span style={{ opacity: `clamp(0, var(--reveal) * ${segs.length} - ${i}, 1)` }} className="absolute inset-0 motion-reduce:!opacity-100">
              {w}
            </span>
          </span>
        ))}
      </span>
    </motion.p>
  );
}
