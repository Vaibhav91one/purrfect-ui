"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = ["0", "27", "64", "100"];
// fanned pile: offset (% of the sticker) and tilt (deg) per sticker
const PILE = [
  [-38, -6, -8],
  [34, -14, 7],
  [-12, 22, 4],
  [26, 26, -6],
] as const;
const EASE_SOFT = "cubic-bezier(0.18, 0.66, 0.18, 1)";
const EASE_COVER = "cubic-bezier(0.66, 0, 0.23, 1)";

const seen = (key: string) => {
  try {
    return !!sessionStorage.getItem(key);
  } catch {
    return false;
  }
};

export interface LoaderProps {
  /** Image URLs (max 4) that pop into a fanned pile while the counter runs. */
  stickers?: string[];
  /** sessionStorage key. Plays once per browser session; reloads skip it. */
  once?: string;
  /** Holds the exit until it resolves, so the loader can cover asset loading instead of a fixed timer. */
  ready?: () => Promise<unknown>;
  /** Instead of wiping up, the counter's box morphs into an 8px square at the centre, so a page intro that starts from a centred square continues from it. */
  handoff?: boolean;
  /** Fill the nearest positioned parent instead of the viewport (docs previews, cards). */
  contained?: boolean;
  /** Fires when the page underneath may start its own intro (also fires right away when the loader is skipped). */
  onReveal?: () => void;
  className?: string;
}

/**
 * Counter rolls 0 → 100, a block wipes up over it and the loader lifts away (or, with `handoff`, the counter morphs into a centre square).
 * Colours come from `--loader-bg` and `--loader-fg`. Skipped under `prefers-reduced-motion`.
 */
export function Loader({ stickers = [], once, ready, handoff = false, contained = false, onReveal, className = "" }: LoaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const roll = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const reveal = useRef(onReveal);
  const [phase, setPhase] = useState<"count" | "exit" | "go" | "out" | "done">("count");

  useEffect(() => {
    reveal.current = onReveal;
  });

  useEffect(() => {
    if ((once && seen(once)) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal.current?.();
      return setPhase("done");
    }
    roll.current?.animate([{ transform: "translateY(0)" }, { transform: "translateY(-3.6em)" }], { duration: 1400, easing: EASE_SOFT, fill: "forwards" });
    let dead = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    // the pile pops in over the count, exits in reverse, then (after the counter AND `ready`) the loader leaves
    const pile = stickers.length > 0 ? 250 : 0;
    if (pile) after(1300, () => setPhase("exit"));
    Promise.all([new Promise<void>((r) => after(1300 + pile, r)), Promise.resolve(ready?.()).catch(() => {})]).then(() => {
      if (dead) return;
      setPhase("go");
      if (once) {
        try {
          sessionStorage.setItem(once, "1");
        } catch {}
      }
      if (handoff) {
        // morph runs 900ms; release the page's intro underneath, then drop the overlay a beat later so the square never blinks
        after(900, () => reveal.current?.());
        after(1050, () => setPhase("done"));
        return;
      }
      after(800, () => {
        setPhase("out");
        reveal.current?.();
      });
      after(1700, () => setPhase("done"));
    });
    return () => {
      dead = true;
      timers.forEach(clearTimeout);
    };
    // props are read once on mount: the loader only ever plays one intro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // wipe: the block rises over the counter, then the whole loader lifts
  useEffect(() => {
    if (!handoff && phase === "go") wipe.current?.animate([{ translate: "0 100%" }, { translate: "0 0" }], { duration: 800, easing: EASE_COVER, fill: "forwards" });
    if (phase === "out") root.current?.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: 900, easing: EASE_COVER, fill: "forwards" });
  }, [phase, handoff]);

  // handoff: the number's own box slides to the centre, shrinks to 8x8 and fills in, so the digits are cropped into the square.
  // Pinned with position:fixed first so shrinking it doesn't reflow the loader.
  useEffect(() => {
    const num = counter.current;
    const box = root.current;
    if (!handoff || phase !== "go" || !num || !box) return;
    const r = num.getBoundingClientRect();
    const c = box.getBoundingClientRect();
    const fg = getComputedStyle(num).color;
    Object.assign(num.style, { position: "fixed", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    num.animate(
      [
        { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, backgroundColor: "rgba(0,0,0,0)" },
        { left: `${c.left + c.width / 2 - 4}px`, top: `${c.top + c.height / 2 - 4}px`, width: "8px", height: "8px", backgroundColor: fg },
      ],
      { duration: 900, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
    );
  }, [handoff, phase]);

  // ponytail: with `once`, a returning visitor sees the loader until hydration hides it; add a pre-paint script if that matters
  if (phase === "done") return null;
  return (
    <div
      ref={root}
      aria-hidden
      className={`${contained ? "absolute" : "fixed"} inset-0 z-200 flex items-end p-9 ${className}`}
      style={{ background: "var(--loader-bg, #fff)", color: "var(--loader-fg, #000)" }}
    >
      {stickers.length > 0 && (
        <div className="absolute top-1/2 left-1/2 size-[clamp(150px,24vw,300px)] -translate-x-1/2 -translate-y-1/2">
          {stickers.slice(0, PILE.length).map((src, i, all) => (
            <Sticker key={src} src={src} i={i} total={all.length} out={phase !== "count"} />
          ))}
        </div>
      )}
      <div ref={counter} className="h-[1.2em] overflow-hidden text-[51.84px] leading-[1.2] whitespace-nowrap">
        <div ref={roll} className="flex flex-col">
          {STEPS.map((s) => (
            <span key={s} className="h-[1.2em]">
              {s}
            </span>
          ))}
        </div>
      </div>
      {!handoff && <div ref={wipe} className="absolute inset-x-0 bottom-0 h-full" style={{ background: "var(--loader-bg, #fff)", translate: "0 100%" }} />}
    </div>
  );
}

/** Pops in (springy scale + settle into its tilt) only once it has actually loaded, never as an empty flash; `out` plays the exit. */
function Sticker({ src, i, total, out }: { src: string; i: number; total: number; out: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [x, y, r] = PILE[i];
  // cached images can finish before React attaches onLoad
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true);
  }, [src]);
  useEffect(() => {
    const el = ref.current;
    if (!el || !loaded) return;
    const a = out
      ? el.animate([{ opacity: 1, scale: 1, rotate: `${r}deg` }, { opacity: 0, scale: 0.8, rotate: `${r + 10}deg` }], { duration: 300, delay: (total - 1 - i) * 50, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" })
      : el.animate([{ opacity: 0, scale: 0.85, rotate: `${r - 10}deg` }, { opacity: 1, scale: 1, rotate: `${r}deg` }], { duration: 550, delay: 100 + i * 200, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)", fill: "both" });
    return () => a.cancel();
  }, [loaded, out, i, r, total]);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt=""
      decoding="async"
      onLoad={() => setLoaded(true)}
      className="absolute inset-0 size-full object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,.12)]"
      style={{ opacity: 0, translate: `${x}% ${y}%` }}
    />
  );
}
