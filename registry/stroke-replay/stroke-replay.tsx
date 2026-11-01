"use client";

import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StrokeReplayProps extends Omit<ComponentProps<"div">, "children"> {
  /** One inline `<svg>`. Its direct children are the shapes, replayed in order; mark a background or texture layer `data-static` to keep it always shown (`<defs>` is skipped too). */
  children: ReactNode;
  /** Milliseconds one replay takes, start to finished painting. The readout counts this time. */
  duration?: number;
  /** Milliseconds the finished painting holds before the replay loops. */
  hold?: number;
  /** Badge in the top start corner, one line (truncated); `null` hides it. */
  label?: ReactNode;
}

const fmt = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Replays an SVG painting shape by shape, like a drawing-app timelapse: each shape scales up from 60% and fades in.
 * It starts once 40% of it is on screen, pauses when it leaves, and loops after a short hold. Play/pause and a scrubber
 * (keyboard-friendly range input) sit in a pill at the bottom; progress lives in refs and is written straight to the DOM,
 * so playback never re-renders React. Scrubbing shows shapes in 150ms so the painting keeps up with the thumb; below a
 * 13rem-wide box the time readout hides so the scrubber stays usable. Swapping the painting re-collects its shapes. Reduced motion: it shows the finished painting and does not autoplay; shapes fade
 * without scaling when you play or scrub.
 */
export function StrokeReplay({ children, duration = 12000, hold = 1600, label = "Timelapse", className, ...rest }: StrokeReplayProps) {
  const box = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLInputElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const shapes = useRef<Element[]>([]);
  const pos = useRef(0);
  const shown = useRef(-1);
  const touched = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const sliderId = useId();

  // Progress 0..1 to the DOM: shape classes (only when the count changes), slider, readout.
  const apply = (p: number) => {
    pos.current = p;
    const n = Math.round(p * shapes.current.length);
    if (n !== shown.current) {
      shown.current = n;
      shapes.current.forEach((s, i) => s.classList.toggle("on", i < n));
    }
    const text = `${fmt(p * duration)} / ${fmt(duration)}`;
    if (slider.current) {
      slider.current.value = String(Math.round(p * 1000));
      slider.current.setAttribute("aria-valuetext", text);
    }
    if (readout.current && readout.current.textContent !== text) readout.current.textContent = text;
  };

  // (re)collect the shapes whenever the painting changes, and redraw the current position on the new ones
  useEffect(() => {
    shapes.current = [...(box.current?.querySelector("svg")?.children ?? [])].filter((s) => !s.hasAttribute("data-static") && s.tagName !== "defs");
    shown.current = -1;
    apply(pos.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply only reads refs and `duration`
  }, [children]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // check-ignore: reduced-motion-live it only picks the first frame and autoplay; the motion-reduce: classes stay live
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    apply(reduce ? 1 : 0);
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        // autoplay the first time it comes into view, unless the reader already pressed play/pause or scrubbed
        if (e.isIntersecting && !reduce && !touched.current) {
          touched.current = true;
          setPlaying(true);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure once; apply only reads refs and `duration`
  }, []);

  useEffect(() => {
    if (playing) box.current?.removeAttribute("data-scrub");
    if (!playing || !inView) return;
    let raf = 0;
    let last = 0;
    let restart: ReturnType<typeof setTimeout> | undefined;
    if (pos.current >= 1) apply(0);
    const loop = (now: number) => {
      const next = pos.current + (last ? (now - last) / duration : 0);
      last = now;
      if (next >= 1) {
        apply(1);
        restart = setTimeout(() => {
          apply(0);
          last = 0;
          raf = requestAnimationFrame(loop);
        }, hold);
        return;
      }
      apply(next);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(restart);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply only reads refs and `duration`
  }, [playing, inView, duration, hold]);

  return (
    <div
      ref={box}
      className={cn(
        "@container relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted",
        "[&>svg]:block [&>svg]:h-full [&>svg]:w-full",
        "[&>svg>*:not([data-static])]:origin-center [&>svg>*:not([data-static])]:[transform-box:fill-box]",
        "[&>svg>*:not([data-static])]:scale-[.6] [&>svg>*:not([data-static])]:opacity-0",
        "[&>svg>*:not([data-static])]:transition-[opacity,scale] [&>svg>*:not([data-static])]:ease-[cubic-bezier(0.23,1,0.32,1)]",
        // check-ignore: duration each shape is a brush stroke landing on the canvas, watched, not a UI response
        "[&>svg>*:not([data-static])]:duration-700",
        // scrubbing is direct manipulation: shapes follow the thumb in 150ms instead of trailing it by a stroke
        "[&[data-scrub]>svg>*:not([data-static])]:duration-150",
        "[&>svg>.on:not([data-static])]:scale-100 [&>svg>.on:not([data-static])]:opacity-100",
        "motion-reduce:[&>svg>*:not([data-static])]:scale-100",
        className,
      )}
      {...rest}
    >
      {children}
      {label != null && (
        <span className="absolute start-4 top-3.5 max-w-[calc(100%-2rem)] truncate rounded-full bg-background/80 px-2.5 py-0.5 text-sm text-foreground">{label}</span>
      )}
      <div className="absolute inset-x-3 bottom-3 flex h-8 items-center gap-2.5 rounded-full bg-foreground pr-1.5 pl-1 text-sm text-background">
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            touched.current = true;
            setPlaying((p) => !p);
          }}
          className="relative grid size-6 shrink-0 place-items-center rounded-full outline-none before:absolute before:-inset-2 focus-visible:ring-2 focus-visible:ring-background"
        >
          <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden>
            {playing ? (
              <>
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </>
            ) : (
              <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
            )}
          </svg>
        </button>
        <label className="sr-only" htmlFor={sliderId}>
          Timelapse position
        </label>
        <input
          id={sliderId}
          ref={slider}
          type="range"
          min={0}
          max={1000}
          defaultValue={0}
          onChange={(e) => {
            touched.current = true;
            setPlaying(false);
            box.current?.setAttribute("data-scrub", "");
            apply(Number(e.target.value) / 1000);
          }}
          className="min-w-0 flex-1 accent-background"
        />
        {/* ltr so RTL pages still read elapsed / total; hidden in a narrow box so the scrubber keeps its width */}
        <span ref={readout} dir="ltr" className="hidden shrink-0 pr-2 tabular-nums @[13rem]:inline">
          {`0:00 / ${fmt(duration)}`}
        </span>
      </div>
    </div>
  );
}
