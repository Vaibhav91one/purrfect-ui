"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CounterLoaderProps extends Omit<ComponentProps<"div">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** Popped one by one into a fanned pile while the counter runs (any images or elements). A few token-coloured shapes by default. */
  stickers?: ReactNode[];
  /** The numbers the counter rolls through, top to bottom. */
  steps?: number[];
  /** Seconds the counter takes to roll, before the block wipes up. */
  duration?: number;
  /** sessionStorage key that marks it seen, so it plays once per tab; `false` plays it every load. */
  storageKey?: string | false;
  /** Called once the page is uncovered (also right away when it is skipped as already seen). */
  onDone?: () => void;
  /** Fill the nearest `relative` parent instead of the screen, without locking page scroll: for a card or a preview. */
  contained?: boolean;
}

// fanned pile: offset (% of the pile box) and tilt per sticker; more stickers reuse the slots
const PILE = [[-38, -6, -8], [34, -14, 7], [-12, 22, 4], [26, 26, -6]] as const;
const SHAPES: ReactNode[] = [
  <span key="a" className="size-3/5 rounded-full bg-background" />,
  <span key="b" className="size-1/2 rounded-[22%] bg-muted-foreground" />,
  <span key="c" className="size-1/2 rounded-full border-[0.6rem] border-background" />,
  <span key="d" className="h-1/3 w-3/5 rounded-full bg-muted" />,
];
const STEPS = [0, 27, 64, 100];
const COVER = [0.66, 0, 0.23, 1] as const; // in-out: the wipe and the lift are a scene change, not a control responding
const noop = () => () => {};

/**
 * A full-screen intro: a counter rolls through `steps` while stickers pop into a fanned pile, then a block wipes up over them
 * and the loader lifts off the page. Click, tap or Escape (full screen only) skips it, it locks page scroll while it covers the page, and it plays
 * once per tab (`storageKey`). The server HTML already covers the page, so nothing flashes before it; an inline script hides it
 * before the first paint on a repeat visit, and if JavaScript never runs it uncovers the page by itself after a few seconds.
 * Reduced motion: the number jumps from step to step, the stickers appear without the pop, and the loader fades out.
 */
export function CounterLoader({ stickers = SHAPES, steps = STEPS, duration = 1.4, storageKey = "counter-loader-seen", onDone, contained = false, className, style, ...rest }: CounterLoaderProps) {
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
  const [phase, setPhase] = useState<"count" | "exit" | "wipe" | "lift" | "gone">("count");
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  const pile = stickers.length > 0;
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
    // count, then the pile exits (250ms), the block wipes up (800ms) and the loader lifts; reduced motion fades out after the count
    const ms = duration * 1000;
    const t = reduce
      ? [setTimeout(() => setPhase("lift"), ms)]
      : [setTimeout(() => setPhase((p) => (p === "count" ? (pile ? "exit" : "wipe") : p)), ms), setTimeout(() => setPhase((p) => (p === "exit" ? "wipe" : p)), ms + 250)];
    const skip = (e: KeyboardEvent) => e.key === "Escape" && setPhase("lift");
    // check-ignore: global-keys only while it covers the whole page: Escape skips it wherever focus is
    if (!contained) window.addEventListener("keydown", skip);
    return () => {
      t.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      [body.overflow, body.paddingRight] = prev;
    };
  }, [duration, reduce, contained, gone, pile]);

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
  const nums = steps.length ? steps : [100];
  // only the timed exit pops them out; a skip leaves the pops running, since the whole loader is lifting away anyway
  const out = phase === "exit";
  return (
    <motion.div
      data-counter-loader
      role="status"
      aria-label="Loading"
      aria-live="polite"
      onClick={() => setPhase("lift")}
      initial={false}
      animate={phase === "lift" ? (reduce ? { opacity: 0 } : { opacity: 1, y: "-100%" }) : { opacity: 1, y: "0%" }}
      transition={{ duration: reduce ? 0.3 : 0.9, ease: COVER }}
      onAnimationComplete={() => phase === "lift" && finish()}
      className={cn(
        contained ? "absolute" : "fixed",
        "inset-0 z-[9999] flex cursor-pointer items-end overflow-hidden bg-foreground p-6 text-background [container-type:size]",
        className,
      )}
      style={{ animation: `counter-loader-failsafe 0s linear ${duration + 4}s forwards`, ...style }}
      {...rest}
    >
      {/* no JavaScript: uncover the page 4s after the count would have ended. Seen before: hide it before the first paint, no flash */}
      <style>{`@keyframes counter-loader-failsafe{to{visibility:hidden}}html[data-counter-loader-seen] [data-counter-loader]{display:none}
@keyframes counter-loader-roll{to{translate:0 calc((1 - var(--n)) * 1.2em)}}
@keyframes counter-loader-in{from{opacity:0;scale:.85;rotate:calc(var(--r) - 10deg)}}
@keyframes counter-loader-out{to{opacity:0;scale:.8;rotate:calc(var(--r) + 10deg)}}`}</style>
      {key && !hydrated && <script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem(${key})==="1")document.documentElement.dataset.counterLoaderSeen=""}catch(e){}` }} />}
      {pile && (
        <div aria-hidden className="absolute top-1/2 left-1/2 size-[min(40cqmin,18rem)] -translate-x-1/2 -translate-y-1/2">
          {stickers.map((s, i) => {
            const [x, y, r] = PILE[i % PILE.length];
            // stagger the pops so even a long list has landed (0.1s delay + 0.55s pop) by the end of the count
            const gap = Math.min(0.2, Math.max(0, duration - 0.65) / stickers.length);
            return (
              <span
                key={i}
                className="absolute inset-0 grid place-items-center motion-reduce:!animate-none [&>img]:size-full [&>img]:object-contain"
                style={
                  {
                    "--r": `${r}deg`,
                    translate: `${x}% ${y}%`,
                    rotate: `${r}deg`,
                    // a little overshoot: stickers are a playful, rare moment
                    animation: out
                      ? `counter-loader-out 0.3s cubic-bezier(0.23,1,0.32,1) ${(stickers.length - 1 - i) * Math.min(0.05, 0.2 / Math.max(1, stickers.length - 1))}s both`
                      : `counter-loader-in 0.55s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * gap}s both`,
                  } as CSSProperties
                }
              >
                {s}
              </span>
            );
          })}
        </div>
      )}
      {/* sized by the box too, so a long number still fits a small contained card */}
      <div aria-hidden className="relative h-[1.2em] overflow-hidden text-[min(3rem,22cqi)] leading-[1.2] whitespace-nowrap tabular-nums">
        <div
          className="flex flex-col motion-reduce:[animation-timing-function:steps(var(--k),end)]!"
          // check-ignore: duration the count is the whole intro; `duration` sets it
          style={{ "--n": nums.length, "--k": Math.max(1, nums.length - 1), animation: `counter-loader-roll ${duration}s cubic-bezier(0.18,0.66,0.18,1) forwards` } as CSSProperties}
        >
          {nums.map((n, i) => (
            <span key={i} className="h-[1.2em]">
              {n.toLocaleString("en-US")}
            </span>
          ))}
        </div>
      </div>
      {/* the block: inherits the loader colour (a className bg follows), it wipes up over the counter and the pile before the lift */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-inherit"
        initial={false}
        animate={{ transform: phase === "wipe" || (phase === "lift" && !reduce) ? "translateY(0%)" : "translateY(100%)" }}
        // check-ignore: duration a full-screen scene change, not a control responding (Poinu's own 0.8s wipe)
        transition={{ duration: 0.8, ease: COVER }}
        onAnimationComplete={() => phase === "wipe" && setPhase("lift")}
      />
      <span className="sr-only">Loading</span>
    </motion.div>
  );
}
