"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface PreloaderProps extends Omit<ComponentProps<"div">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** Shown one after another. "Welcome" in ten languages by default. */
  words?: string[];
  /** Seconds the words take in total, before the panel lifts. */
  duration?: number;
  /** sessionStorage key that marks it seen, so it plays once per tab; `false` plays it every load. */
  storageKey?: string | false;
  /** Called once the page is uncovered (also right away when it is skipped as already seen). */
  onDone?: () => void;
  /** Fill the nearest `relative` parent instead of the screen, without locking page scroll: for a card or a preview. */
  contained?: boolean;
}

const WELCOME = ["Welcome", "Bienvenido", "Bienvenue", "Willkommen", "Benvenuto", "欢迎", "ようこそ", "환영합니다", "مرحبا", "स्वागत है"];
const OUT = [0.45, 0, 0.55, 1] as const; // in-out (GSAP power2.inOut): the lift is a scene change, not a control responding
const noop = () => () => {};

/**
 * A full-screen intro: the words swap one after another, then the panel lifts off the page with a curved bottom edge.
 * Click, tap or Escape (full screen only) skips it with a quicker lift, it locks page scroll while it covers the page, and
 * it plays once per tab (`storageKey`). Each word gets at least a 220ms swap, and a word wider than the screen truncates.
 * The server HTML already covers the page, so nothing flashes before it; an inline script hides it before the first paint
 * on a repeat visit, and if JavaScript never runs it uncovers the page by itself after a few seconds. As it lifts, both
 * bottom corners round to 50%, so the edge leaving the page is one curve. Reduced motion: one word, then the panel fades out.
 */
export function Preloader({ words = WELCOME, duration = 2.4, storageKey = "preloader-seen", onDone, contained = false, className, style, ...rest }: PreloaderProps) {
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
  const [phase, setPhase] = useState<"words" | "lift" | "gone">("words");
  const [i, setI] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  const gone = seen || phase === "gone";

  useEffect(() => {
    if (gone) return;
    const body = document.body.style;
    const prev = [body.overflow, body.paddingRight];
    if (!contained) {
      // hiding the scrollbar widens the page: pad by its width so nothing behind shifts sideways
      const bar = innerWidth - document.documentElement.clientWidth;
      if (bar > 0) body.paddingRight = `calc(${getComputedStyle(document.body).paddingRight} + ${bar}px)`;
      body.overflow = "hidden";
    }
    // only as many words as get a full 220ms swap each, so a short duration never stacks them
    const n = reduce ? 1 : Math.max(1, Math.min(words.length, Math.floor((duration * 1000) / 220)));
    const step = (duration * 1000) / n;
    const ticks = Array.from({ length: n - 1 }, (_, k) => setTimeout(() => setI(k + 1), step * (k + 1)));
    const lift = setTimeout(() => setPhase("lift"), reduce ? 600 : duration * 1000);
    const skip = (e: KeyboardEvent) => e.key === "Escape" && (setSkipped(true), setPhase("lift"));
    // check-ignore: global-keys only while it covers the whole page (not contained): Escape skips it wherever focus is
    if (!contained) window.addEventListener("keydown", skip);
    return () => {
      ticks.forEach(clearTimeout);
      clearTimeout(lift);
      if (!contained) window.removeEventListener("keydown", skip);
      [body.overflow, body.paddingRight] = prev;
    };
  }, [words.length, duration, reduce, contained, gone]);

  const finish = () => {
    try {
      if (storageKey) sessionStorage.setItem(storageKey, "1");
    } catch {}
    setPhase("gone");
  };
  useEffect(() => {
    if (gone) done.current?.();
  }, [gone]);

  if (gone) return null;
  const key = storageKey ? JSON.stringify(storageKey) : "";
  return (
    <motion.div
      // tied to its key, so a full-page preloader seen in this tab never hides another one with a different key
      data-preloader={storageKey || ""}
      role="status"
      aria-label="Loading"
      aria-live="polite"
      onClick={() => (setSkipped(true), setPhase("lift"))}
      initial={false}
      // a full transform string (not y), so Motion can hand the lift to WAAPI while the page hydrates
      // ponytail: the radius repaints the panel for the 1s lift only; a clip-path ellipse if that ever shows in a trace
      animate={
        phase === "lift"
          ? reduce
            ? { opacity: 0 }
            : { opacity: 1, transform: "translateY(-100%)", borderBottomLeftRadius: "50%", borderBottomRightRadius: "50%" }
          : { opacity: 1, transform: "translateY(0%)", borderBottomLeftRadius: "0%", borderBottomRightRadius: "0%" }
      }
      // a skip is the user's decision, so it answers fast (drawer curve); the automatic lift keeps the slow in-out
      transition={reduce ? { duration: 0.3, ease: OUT } : skipped ? { duration: 0.6, ease: [0.32, 0.72, 0, 1] } : { duration: 1, ease: OUT }}
      onAnimationComplete={() => phase === "lift" && finish()}
      className={cn(contained ? "absolute" : "fixed", "inset-0 z-[9999] grid cursor-pointer place-items-center bg-foreground text-background", className)}
      style={{ animation: `preloader-failsafe 0s linear ${duration + 3}s forwards`, ...style }}
      {...rest}
    >
      {/* no JavaScript: uncover the page 3s after the words would have ended. Seen before: hide it before the first paint, no flash */}
      <style>{`@keyframes preloader-failsafe{to{visibility:hidden}}${key ? `html[data-preloader-seen~=${key}] [data-preloader=${key}]{display:none}` : ""}`}</style>
      {key && !hydrated && <script dangerouslySetInnerHTML={{ __html: `try{var d=document.documentElement.dataset;if(sessionStorage.getItem(${key})==="1")d.preloaderSeen=(d.preloaderSeen||"")+" "+${key}}catch(e){}` }} />}
      {/* full width, so the box never shrinks to the incoming word (the outgoing one stays centred and whole); a word too long for it truncates */}
      <div aria-hidden className="relative h-16 w-full max-w-full overflow-hidden px-6 text-center text-3xl">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={i}
            className="block truncate leading-[4rem] motion-reduce:!transform-none"
            initial={{ opacity: 0, transform: "translateY(60%)" }}
            animate={{ opacity: 1, transform: "translateY(0%)" }}
            exit={{ opacity: 0, transform: "translateY(-60%)" }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            {words[i] ?? ""}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="sr-only">Loading</span>
    </motion.div>
  );
}
