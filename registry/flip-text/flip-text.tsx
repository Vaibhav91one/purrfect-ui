"use client";

import { Fragment, useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface FlipTextProps extends Omit<ComponentProps<"p">, "children" | "ref"> {
  /** The text. Drawn letter by letter; screen readers get it whole. */
  text: string;
}

const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
// letters that only look right joined to their neighbours (Arabic, Indic marks, emoji sequences and tag flags): those words flip as one piece
// ponytail: a short list of joining scripts; add one here if a script shows up broken apart
const JOINED = /[\p{M}\p{Emoji_Modifier}\p{Regional_Indicator}\u{E0020}-\u{E007F}‍️\p{Script=Arabic}\p{Script=Syriac}\p{Script=Nko}\p{Script=Mongolian}]/u;

/**
 * Text whose letters flip over on the X axis when the mouse crosses them (a tap flips one on touch; a swipe or keyboard
 * focus flips nothing). One delegated listener on the root, the flips are Web Animations on transform and opacity.
 * Screen readers read the text, not letters. Reduced motion: letters blink their opacity instead of turning.
 */
export function FlipText({ text, className, ...rest }: FlipTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const flip = (el: Element, delay = 0) => {
      // read at event time, so a change to the setting applies on the next flip
      // check-ignore: reduced-motion-live read on every flip, not once
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.animate(
        reduce
          ? [{ opacity: 0.35 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: "perspective(400px) translateY(-0.15em) rotateX(180deg)" },
              { opacity: 1, transform: "perspective(400px) translateY(0) rotateX(0deg)" },
            ],
        // check-ignore: duration a half turn reads as a flip at the source's 400ms; shorter looks like a twitch
        { duration: 400, delay, easing: EASE, fill: "backwards" },
      );
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // touch flips on a tap (pointerup) instead, so a scroll that starts on the text flips nothing
      const l = (e.target as Element).closest("[data-l]");
      // a turning letter shrinks under a still pointer and would retrigger itself: let a running flip finish
      if (l && !l.getAnimations().length) flip(l);
    };
    const onUp = (e: PointerEvent) => {
      const l = e.pointerType !== "mouse" && (e.target as Element).closest("[data-l]");
      if (l && !l.getAnimations().length) flip(l);
    };
    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerup", onUp);
    return () => {
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerup", onUp);
    };
  }, []);

  // split on breaking whitespace only: a no-break space keeps "10 kg" together
  const words = text.trim().split(/[^\S\u00A0\u202F]+/).filter(Boolean);
  return (
    <p ref={ref} className={cn("relative", className)} {...rest}>
      {/* unselectable so a copy takes the visible words once, not twice */}
      <span className="sr-only select-none">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            {/* a long word wraps inside its own box */}
            <span className="inline-block max-w-full">
              {(JOINED.test(w) ? [w] : Array.from(w)).map((c, j) => (
                <span key={j} data-l className="inline-block">
                  {c}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </p>
  );
}
