"use client";
// Adapted from Beautiful UI's streaming-text (https://www.beautifului.dev). MIT License, Copyright (c) 2026 Shane Levine.

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface WordStreamProps extends Omit<ComponentProps<"p">, "children" | "ref"> {
  /** The full text, already known. The reveal is presentation; spaces and newlines are kept. */
  text: string;
  /** Milliseconds between words. */
  interval?: number;
  /** Called once when the last word is shown (straight away under reduced motion). */
  onDone?: () => void;
}

const KEYFRAMES = "@keyframes word-stream-caret{0%,to{opacity:1}50%{opacity:0}}";

/**
 * Known text revealed one word at a time, with a caret pill riding the last shown word, then `onDone`.
 * Every word is rendered up front with opacity 0, so the paragraph has its final size from the start (no reflow)
 * and the reveal is one attribute write per tick: no React render per word. Each word fades in over 150ms; the pace
 * follows elapsed time, so a stream started in a background tab catches up. Long unbreakable tokens wrap (`wrap-anywhere`).
 * Spaces and newlines are kept as text (`whitespace-pre-wrap`).
 * The words are aria-hidden and the whole text sits once in an sr-only copy, so a live region announces it once, not per word.
 * The caret is a pseudo-element on the newest word; it blinks if the stream stalls, and goes when the text is complete.
 * Reduced motion: CSS shows the whole text at once with no caret (server HTML is the same either way), and `onDone` fires on mount.
 */
export function WordStream({ text, interval = 45, onDone, className, ...rest }: WordStreamProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    const words = ref.current?.querySelectorAll<HTMLElement>("[data-word]");
    if (!words) return;
    words.forEach((w) => {
      w.removeAttribute("data-on");
      w.removeAttribute("data-caret");
    });
    // check-ignore: reduced-motion-live only decides when onDone fires; the CSS (motion-reduce:opacity-100) shows every word live if the setting flips mid-stream
    if (!words.length || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current?.();
      return;
    }
    // clocked by elapsed time, not by ticks: a throttled background tab catches up instead of crawling at 1 word/s
    const t0 = performance.now();
    let i = 0;
    const id = setInterval(() => {
      const n = Math.min(words.length, Math.floor((performance.now() - t0) / interval));
      if (n <= i) return;
      words[i - 1]?.removeAttribute("data-caret");
      for (; i < n; i++) words[i].dataset.on = "";
      if (i < words.length) words[i - 1].dataset.caret = "";
      else {
        clearInterval(id);
        done.current?.();
      }
    }, interval);
    return () => clearInterval(id);
  }, [text, interval]);

  return (
    <p
      ref={ref}
      className={cn(
        // wrap-anywhere: an unbreakable token (a hash, a long id) wraps instead of overflowing the bubble
        "whitespace-pre-wrap wrap-anywhere",
        // -me-1 cancels the caret's 4px advance, so it never pushes the next word onto another line
        "[&_[data-caret]]:after:-me-1 [&_[data-caret]]:after:ms-0.5 [&_[data-caret]]:after:inline-block [&_[data-caret]]:after:h-[0.8em] [&_[data-caret]]:after:w-0.5 [&_[data-caret]]:after:rounded-full [&_[data-caret]]:after:bg-current [&_[data-caret]]:after:align-[-0.05em] [&_[data-caret]]:after:content-['']",
        "[&_[data-caret]]:after:animate-[word-stream-caret_1s_step-end_infinite] motion-reduce:[&_[data-caret]]:after:hidden",
        className,
      )}
      {...rest}
    >
      <style href="word-stream" precedence="default">
        {KEYFRAMES}
      </style>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(/(\s+)/).map((part, i) =>
          i % 2 ? (
            part
          ) : part ? (
            <span
              key={i}
              data-word=""
              // the fade is only on the way in, so a restart still hides every word at once
              className="opacity-0 data-on:opacity-100 data-on:transition-opacity data-on:duration-150 data-on:ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:opacity-100 motion-reduce:transition-none"
            >
              {part}
            </span>
          ) : null,
        )}
      </span>
    </p>
  );
}
