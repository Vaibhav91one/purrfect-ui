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
 * Text whose lines fade in one after another as it scrolls into view, and whose letters flip over on the X axis when
 * the pointer crosses them (a tap flips one on touch). When the text, or the link or button around it, gets keyboard
 * focus, every letter flips in a quick wave. One delegated listener on the root, the flips are Web Animations on
 * transform and opacity, and the text stays visible when JavaScript is off. Screen readers read the text, not letters.
 * Reduced motion: lines still fade in and letters blink their opacity instead of turning.
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
      const l = (e.target as Element).closest("[data-l]");
      // a turning letter shrinks under a still pointer and would retrigger itself: let a running flip finish
      if (l && !l.getAnimations().length) flip(l);
    };
    const host = root.closest<HTMLElement>("a, button") ?? root;
    const onFocus = (e: FocusEvent) => {
      if (!(e.target as Element).matches(":focus-visible")) return;
      const ls = root.querySelectorAll("[data-l]");
      const step = Math.min(20, 200 / ls.length); // keyboard motion stays short: the whole wave is done in about 600ms
      ls.forEach((l, i) => flip(l, i * step));
    };
    // lines are only known once laid out: group the words by their top edge, then let each line fade in after the last
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        let line = -1;
        let top = -Infinity;
        root.querySelectorAll<HTMLElement>("[data-w]").forEach((w) => {
          if (w.offsetTop > top + w.offsetHeight / 2) {
            line++;
            top = w.offsetTop;
          }
          w.style.transitionDelay = `${Math.min(line, 8) * 120}ms`;
        });
        root.dataset.shown = "";
      },
      // no inset margin: text in the bottom strip of a page that cannot scroll further would never be revealed
      { rootMargin: "0px" },
    );
    io.observe(root);
    root.addEventListener("pointerover", onOver);
    host.addEventListener("focusin", onFocus);
    return () => {
      io.disconnect();
      root.removeEventListener("pointerover", onOver);
      host.removeEventListener("focusin", onFocus);
    };
  }, []);

  // split on breaking whitespace only: a no-break space keeps "10 kg" together
  const words = text.trim().split(/[^\S\u00A0\u202F]+/).filter(Boolean);
  return (
    <p ref={ref} className={cn("group/flip relative", className)} {...rest}>
      {/* unselectable so a copy takes the visible words once, not twice */}
      <span className="sr-only select-none">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            {/* hidden only where scripts run, so the server HTML reads without JS; a long word wraps inside its own box */}
            {/* check-ignore: duration a once-per-page entrance, lines fading in as they arrive */}
            <span data-w className="inline-block max-w-full transition-opacity duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(scripting:enabled)]:opacity-0 group-data-shown/flip:opacity-100">
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
