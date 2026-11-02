"use client";

import { Fragment, useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface FadeLinesProps extends Omit<ComponentProps<"p">, "children" | "ref"> {
  /** The text. Lines are found from where it wraps, so you don't break it yourself. */
  text: string;
}

/**
 * Text whose lines rise and fade in one after another the first time it scrolls into view. The lines are wherever the
 * text wraps: the words are grouped by their top edge once laid out. Transitions on opacity and translate only, and the
 * text stays visible when JavaScript is off. Reduced motion: lines fade in without the rise.
 */
export function FadeLines({ text, className, ...rest }: FadeLinesProps) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
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
          w.style.transitionDelay = `${Math.min(line, 8) * 60}ms`;
        });
        root.dataset.shown = "";
      },
      // no inset margin: text in the bottom strip of a page that cannot scroll further would never be revealed
      { rootMargin: "0px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // split on breaking whitespace only: a no-break space keeps "10 kg" together
  const words = text.trim().split(/[^\S  ]+/).filter(Boolean);
  return (
    <p ref={ref} className={cn("group/fade", className)} {...rest}>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          {/* hidden only where scripts run, so the server HTML reads without JS; a long word wraps inside its own box */}
          {/* check-ignore: duration a once-per-page entrance, lines fading in as they arrive */}
          <span data-w className="inline-block max-w-full break-words transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] [@media(scripting:enabled)]:opacity-0 motion-safe:[@media(scripting:enabled)]:translate-y-[0.25em] group-data-shown/fade:translate-y-0 group-data-shown/fade:opacity-100">
            {w}
          </span>
        </Fragment>
      ))}
    </p>
  );
}
