"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface LoadPreloaderProps extends Omit<ComponentProps<"div">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** What it waits for: a promise (settled either way counts as loaded) or a flag that turns true. Fonts plus the window `load` event by default. */
  ready?: Promise<unknown> | boolean;
  /** Seconds the count takes at the least, so a fast load still reads as intentional. */
  minDuration?: number;
  /** Seconds it waits at most before it counts to 100 anyway, so a stuck request never hangs the page. */
  maxWait?: number;
  /** sessionStorage key that marks it seen, so it plays once per tab; `false` plays it every load. */
  storageKey?: string | false;
  /** Called when it reaches 100 and starts to fade, releasing the page (also right away when it is skipped as already seen). */
  onDone?: () => void;
  /** Fill the nearest `relative` parent instead of the screen, without locking page scroll: for a card or a preview. */
  contained?: boolean;
}

const IN_OUT = [0.45, 0, 0.55, 1] as const; // the fade is a scene change, not a control responding
const noop = () => () => {};

/**
 * A full-screen cover with a big 0 to 100 count in the bottom-left corner that tracks real loading (fonts and the window
 * `load` event, or your own `ready`), never faster than `minDuration`. At 100 it holds for a beat, then fades out and
 * releases the page. It locks page scroll while it covers the page and plays once per tab (`storageKey`). The count is
 * written straight to the text node, so React renders it only to start and to fade. The server HTML already covers the
 * page, so nothing flashes before it; an inline script hides it before the first paint on a repeat visit, and if
 * JavaScript never runs it uncovers the page by itself. Reduced motion: the number jumps with the load, then a quick fade.
 */
export function LoadPreloader({ ready, minDuration = 1.2, maxWait = 7, storageKey = "load-preloader-seen", onDone, contained = false, className, style, ...rest }: LoadPreloaderProps) {
  const reduce = useReducedMotion();
  // false in the server HTML and while hydrating, true after: the inline script only exists in the server HTML (React never runs a script it renders itself)
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  // played before in this tab: false while hydrating (the inline script already hid it), then the stored answer
  const seen = useSyncExternalStore(noop, () => {
    try {
      return !!storageKey && sessionStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  }, () => false);
  const [phase, setPhase] = useState<"count" | "fade" | "gone">("count");
  const num = useRef<HTMLSpanElement>(null);
  const load = useRef(0); // share of what it waits for that has settled, 0 to 1
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    load.current = ready === true ? 1 : 0;
    if (typeof ready === "boolean") return;
    let on = true;
    let onLoad: (() => void) | undefined;
    const parts: Promise<unknown>[] = ready
      ? [ready]
      : [
          document.fonts?.ready ?? Promise.resolve(),
          document.readyState === "complete"
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                onLoad = () => resolve();
                window.addEventListener("load", onLoad);
              }),
        ];
    let settled = 0;
    parts.forEach((p) =>
      Promise.resolve(p)
        .catch(() => {})
        .then(() => {
          if (on) load.current = ++settled / parts.length;
        }),
    );
    return () => {
      on = false;
      if (onLoad) window.removeEventListener("load", onLoad);
    };
  }, [ready]);

  useEffect(() => {
    if (seen || phase !== "count") return;
    const body = document.body.style;
    const prev = [body.overflow, body.paddingRight];
    if (!contained) {
      // hiding the scrollbar widens the page: pad by its width so nothing behind shifts sideways
      const bar = innerWidth - document.documentElement.clientWidth;
      if (bar > 0) body.paddingRight = `calc(${getComputedStyle(document.body).paddingRight} + ${bar}px)`;
      body.overflow = "hidden";
    }
    const t0 = performance.now();
    const min = reduce ? 0 : minDuration * 1000;
    const cap = setTimeout(() => (load.current = 1), maxWait * 1000);
    let value = 0;
    let last = t0;
    let shown = 0;
    let raf = 0;
    let hold = 0;
    const tick = (now: number) => {
      const target = load.current * 100;
      // ease toward the load, but never outrun the minimum-time ramp, so the count always looks continuous
      const ramp = min ? Math.min(((now - t0) / min) * 100, 100) : 100;
      value = reduce ? target : value + (Math.min(target, ramp) - value) * (1 - 0.88 ** ((now - last) / 16.7));
      last = now;
      const end = target >= 100 && (reduce || value > 99.4);
      const n = end ? 100 : Math.round(value);
      if (n !== shown && num.current) num.current.textContent = String((shown = n));
      if (end) hold = window.setTimeout(() => setPhase("fade"), 250);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(cap);
      clearTimeout(hold);
      [body.overflow, body.paddingRight] = prev;
    };
  }, [seen, phase, contained, reduce, minDuration, maxWait]);

  const released = seen || phase !== "count";
  useEffect(() => {
    if (released) done.current?.();
  }, [released]);

  if (seen || phase === "gone") return null;
  const key = storageKey ? JSON.stringify(storageKey) : "";
  return (
    <motion.div
      data-load-preloader
      role="status"
      aria-label="Loading"
      aria-live="polite"
      initial={false}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: reduce ? 0.3 : 1, ease: IN_OUT }}
      onAnimationComplete={() => {
        if (phase !== "fade") return;
        try {
          if (storageKey) sessionStorage.setItem(storageKey, "1");
        } catch {}
        setPhase("gone");
      }}
      className={cn(
        contained ? "absolute" : "fixed",
        "@container inset-0 z-[9999] flex items-end bg-foreground p-6 text-background @3xl:p-10",
        phase === "fade" && "pointer-events-none",
        className,
      )}
      style={{ animation: `load-preloader-failsafe 0s linear ${maxWait + 2}s forwards`, ...style }}
      {...rest}
    >
      {/* no JavaScript: uncover the page 2s after the longest wait. Seen before: hide it before the first paint, no flash */}
      <style>{`@keyframes load-preloader-failsafe{to{visibility:hidden}}html[data-load-preloader-seen] [data-load-preloader]{display:none}`}</style>
      {key && !hydrated && <script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem(${key})==="1")document.documentElement.dataset.loadPreloaderSeen=""}catch(e){}` }} />}
      <span ref={num} aria-hidden className="text-[clamp(3rem,15cqw,10rem)] leading-none font-light tracking-tight tabular-nums">
        0
      </span>
      <span className="sr-only">Loading</span>
    </motion.div>
  );
}
