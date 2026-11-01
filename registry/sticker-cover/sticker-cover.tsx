"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useImperativeHandle, useRef, type ComponentProps, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils";

/** What runs under the cover: swap the route or the content. Return a promise if the new content is not ready at once. */
export type CoverChange = () => void | Promise<void>;

export interface StickerCoverHandle {
  /**
   * Rise, run `change`, pop the sticker, lift. Resolves once the cover is gone. Called again while the cover is still up,
   * the newer change runs under the same cover (latest wins if the first has not started). `instant` drops the cover in
   * place with no rise, for back/forward where the browser has already started swapping the page.
   */
  play: (change?: CoverChange, options?: { instant?: boolean }) => Promise<void>;
}

export interface StickerCoverProps extends Omit<ComponentProps<"div">, "ref" | "className"> {
  /** `ref.current.play(change)` plays the cover. */
  ref?: Ref<StickerCoverHandle>;
  /** Pops in at the centre once the sheet is up. None by default: the sheet lifts as soon as the new content has painted. */
  sticker?: ReactNode;
  /** Seconds the sheet takes to rise; the lift takes 1.2x. */
  duration?: number;
  /** Cover the nearest `relative` parent (give it `overflow-hidden`) instead of the screen: for a card or a preview. */
  contained?: boolean;
  /** Classes for the sheet: its colour, `bg-foreground` by default (`bg-primary` ...). */
  className?: string;
  /** Classes for the box around `children`, the page that drifts up and goes inert while covered. */
  pageClassName?: string;
}

// every timing lives here, nowhere else (no matching CSS durations to keep in sync)
const EASE = [0.66, 0, 0.23, 1] as const; // the cover curve: a slow start, then a long settle
const OUT_EASE = [0.23, 1, 0.32, 1] as const;
const DRIFT = "-7rem"; // how far the old page drifts up while the sheet rises over it
const SWAP_AT = 0.88; // run the change slightly before the rise ends; the lift still waits for the whole rise
// check-ignore: duration a springy pop for a rare, page-sized moment, not a control responding
const POP = { delay: 0.3, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] as const };
const HOLD = 0.7; // seconds the sticker stays up, counted from the start of its pop, before it leaves
const STICKER_OUT = { duration: 0.25, ease: OUT_EASE };
const FADE = { duration: 0.2, ease: OUT_EASE }; // reduced motion: a quick crossfade instead of the rise and lift

/**
 * A page-transition cover: a full sheet rises while the page under it drifts up, your change runs (a route push, a
 * content swap), two frames paint, a sticker pops in at the centre, then the sheet lifts away. It knows nothing about
 * routing: wrap the page in it and call `ref.current.play(() => router.push(href))`. While covered the page is `inert`
 * and focus comes back to where it was (or to the page box if that element is gone); the sheet is `aria-hidden`.
 * Everything is imperative motion on refs, so React never re-renders while it plays. Reduced motion: a quick crossfade
 * and no sticker.
 */
export function StickerCover({ ref, sticker, duration = 0.5, contained = false, className, pageClassName, children, ...rest }: StickerCoverProps) {
  const reduce = useReducedMotion();
  const page = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const live = useRef({ duration, reduce });
  useEffect(() => {
    live.current = { duration, reduce };
  });
  const queue = useRef<CoverChange | null>(null);
  const busy = useRef<Promise<void> | null>(null);
  const covered = useRef(false); // true until the lift starts: new changes join this run instead of starting another
  const turn = useRef(0);
  const cancels = useRef(new Set<() => void>());

  useEffect(() => {
    const c = cancels.current;
    return () => c.forEach((f) => f());
  }, []);

  useImperativeHandle(ref, () => {
    // each cancel leaves the set once its animation, timer or frame settles, so the set stays small across plays
    const keep = (stop: () => void) => (cancels.current.add(stop), () => cancels.current.delete(stop));
    const track = (a: { stop: () => void; then: (r: () => void) => unknown }) => {
      const drop = keep(() => a.stop());
      return new Promise<void>((r) => a.then(() => (drop(), r())));
    };
    const wait = (ms: number) => new Promise<void>((r) => {
      const drop = keep(() => clearTimeout(t));
      const t = setTimeout(() => (drop(), r()), ms);
    });
    const frames = () => new Promise<void>((r) => {
      const drop = keep(() => cancelAnimationFrame(id));
      let id = requestAnimationFrame(() => (id = requestAnimationFrame(() => (drop(), r()))));
    });

    const run = async (instant: boolean) => {
      const p = page.current, s = sheet.current, st = pop.current;
      if (!p || !s) return;
      const { duration: d, reduce: still } = live.current;
      const rise = { duration: d, ease: EASE };
      const r = turn.current++ % 2 ? 6 : -6; // the sticker tilts the other way each time
      const focused = document.activeElement;
      const hadFocus = focused instanceof HTMLElement && p.contains(focused);
      s.style.visibility = "visible";
      p.inert = true;

      let risen: Promise<unknown> = Promise.resolve();
      if (still || instant) {
        s.style.transform = "none";
        if (still && !instant) risen = track(animate(s, { opacity: [0, 1] }, FADE));
        else s.style.opacity = "1";
      } else {
        s.style.opacity = "1";
        risen = Promise.all([track(animate(s, { y: ["102%", "0%"] }, rise)), track(animate(p, { y: ["0rem", DRIFT] }, rise))]);
      }
      const showSticker = !!st && !still;
      const popDelay = instant ? 0 : POP.delay;
      if (showSticker) track(animate(st, { opacity: [0, 1], scale: [0.85, 1], rotate: [r - 10, r] }, { ...POP, delay: popDelay }));
      const held = wait(showSticker ? (popDelay + HOLD) * 1000 : 0);

      await (still ? risen : wait(instant ? 0 : d * SWAP_AT * 1000));
      // run every change queued so far; ones that arrive while we wait for the paint also run under this cover
      do {
        while (queue.current) {
          const change = queue.current;
          queue.current = null;
          try {
            await change();
          } catch (e) {
            reportError(e); // a failed change still lifts the cover
          }
        }
        await Promise.all([risen, held]);
        await frames(); // two painted frames: the new content is on screen before anything shows it
      } while (queue.current);
      covered.current = false;

      if (showSticker) await track(animate(st, { opacity: 0, scale: 0.8, rotate: r + 10 }, STICKER_OUT));
      p.style.transform = "none";
      p.inert = false;
      if (hadFocus) (focused.isConnected && p.contains(focused) ? focused : p).focus({ preventScroll: true });
      // check-ignore: duration the lift is the second half of a page change, the source's 0.6s
      await (still ? track(animate(s, { opacity: 0 }, FADE)) : track(animate(s, { y: "-102%" }, { duration: d * 1.2, ease: EASE })));
      s.style.visibility = "hidden";
    };

    const play = (change?: CoverChange, options?: { instant?: boolean }): Promise<void> => {
      if (busy.current && covered.current) {
        if (change) queue.current = change;
        return busy.current;
      }
      if (busy.current) return busy.current.then(() => play(change, options)); // lifting: cover again once it is gone
      queue.current = change ?? null;
      covered.current = true;
      const b = run(!!options?.instant).finally(() => {
        busy.current = null;
        covered.current = false;
      });
      busy.current = b;
      return b;
    };
    return { play };
  }, []);

  const at = contained ? "absolute" : "fixed";
  return (
    <>
      <div ref={page} tabIndex={-1} className={cn("outline-none", pageClassName)} {...rest}>
        {children}
      </div>
      <div
        ref={sheet}
        aria-hidden
        data-cover-sheet=""
        className={cn(at, "inset-0 bg-foreground", contained ? "z-10" : "z-[150]", className)}
        style={{ visibility: "hidden", transform: "translateY(102%)" }}
      />
      {sticker != null && (
        <div aria-hidden className={cn(at, "pointer-events-none inset-0 grid place-items-center", contained ? "z-10" : "z-[151]")}>
          <div ref={pop} style={{ opacity: 0 }}>
            {sticker}
          </div>
        </div>
      )}
    </>
  );
}
