"use client";

import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type MenuLink = { label: string; href: string };

export interface LayeredMenuProps {
  /** The big links on the right. */
  primary: MenuLink[];
  /** The smaller list on the left. */
  secondary?: MenuLink[];
  /** The small print under the secondary list (hidden when the menu is narrower than 48rem). */
  legal?: MenuLink[];
  /** Four panel colours, back to front. The last one carries the links. */
  colors?: [string, string, string, string];
  /** Centred at the top of the open menu. */
  logo?: ReactNode;
  /** Fill the nearest `relative` parent instead of the screen: for a card, a preview or a frame. */
  contained?: boolean;
  /** Start open (uncontrolled). */
  defaultOpen?: boolean;
  /** Controlled state. Leave it out and the menu manages itself. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Seconds before the two burger lines draw themselves in on first paint. */
  delay?: number;
  /** Burger and "Close" colour while the menu is shut: set it to suit the page behind. Cream by default, as on Armour. */
  color?: string;
  /** Their colour while the menu is open, over the panels. Cream by default. */
  activeColor?: string;
  /** Classes for the burger button's position (top-left, 20px in, by default). */
  className?: string;
}

const OUT = [0.22, 1, 0.36, 1] as const;
const COLORS: [string, string, string, string] = ["#D94A3A", "#D9C8A4", "#4FA06B", "#0E7DDA"];
// per panel, back to front: seconds in (duration, delay) and out (duration, delay). The front panel leaves first.
const TIMING = [
  { in: [0.56, 0.02], out: [0.5, 0.15] },
  { in: [0.62, 0.07], out: [0.54, 0.1] },
  { in: [0.68, 0.12], out: [0.58, 0.05] },
  { in: [0.74, 0.18], out: [0.62, 0] },
] as const;
const REVEAL = 0.44; // links start fading in once the panels are mostly down
const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** The menu's layer. While it plays its exit it is inert and click-through, so a link can't be hit or tabbed to during the ~0.6s it takes to leave. */
function Layer({ pos, children }: { pos: string; children: ReactNode }) {
  const present = useIsPresent();
  return (
    <div inert={!present} className={`${pos} @container inset-0 z-[70] overflow-hidden ${present ? "" : "pointer-events-none"}`}>
      {children}
    </div>
  );
}

function Links({ links, size, blur, y, dur, base, step, onPick, reduce }: { links: MenuLink[]; size: string; blur: number; y: number; dur: number; base: number; step: number; onPick: () => void; reduce: boolean }) {
  return (
    <>
      {links.map((l, i) => (
        <motion.div
          key={`${l.label}-${i}`}
          className="max-w-full"
          initial={{ opacity: 0, transform: `translateY(${reduce ? 0 : y}px)`, filter: `blur(${reduce ? 0 : blur}px)` }}
          animate={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
          // check-ignore: duration the links settle after the panels land; stagger is what makes the list read as one move
          transition={{ duration: dur, delay: reduce ? 0 : base + Math.min(i, 8) * step, ease: OUT }}
        >
          <a href={l.href} onClick={onPick} className={`block [overflow-wrap:break-word] text-[#F4F1DE] transition-opacity [@media(hover:hover)]:hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F4F1DE] ${size}`}>
            {l.label}
          </a>
        </motion.div>
      ))}
    </>
  );
}

/**
 * A burger that opens a full-frame menu built from four coloured panels dropping from the top, one after another, the
 * links fading up out of a blur on the front one. The burger turns into an X with a "Close" label. Escape or a link closes it;
 * focus moves into the menu and comes back to the burger, and Tab stays inside while it is open.
 * Reduced motion: the panels and links fade, nothing slides or blurs.
 */
export function LayeredMenu({ primary, secondary = [], legal = [], colors = COLORS, logo, contained = false, defaultOpen = false, open, onOpenChange, delay = 1.62, color = "#F4F1DE", activeColor = "#F4F1DE", className = "" }: LayeredMenuProps) {
  const reduce = useReducedMotion() ?? false;
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const set = (v: boolean) => {
    setInner(v);
    onOpenChange?.(v);
  };
  const burger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const was = useRef(isOpen); // what the last run saw: focus only moves when the state actually changed, not on mount

  useEffect(() => {
    const changed = was.current !== isOpen;
    was.current = isOpen;
    if (!isOpen) {
      if (changed) burger.current?.focus({ preventScroll: true }); // back where it came from
      return;
    }
    const prev = [document.body.style.overflow, document.documentElement.style.overflow];
    if (!contained) document.body.style.overflow = document.documentElement.style.overflow = "hidden";
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault(); // the menu takes this Esc: a dialog or sheet around it stays open
      set(false);
    };
    window.addEventListener("keydown", esc);
    const id = !changed ? 0 : setTimeout(() => menu.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true }), 120);
    return () => {
      clearTimeout(id);
      window.removeEventListener("keydown", esc);
      [document.body.style.overflow, document.documentElement.style.overflow] = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `set` only forwards to props and state
  }, [isOpen, contained]);

  // Tab cycles through the menu's links and the burger, never out to the page behind
  const trap = (e: KeyboardEvent) => {
    if (!isOpen || e.key !== "Tab") return;
    const all = [...(menu.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []), burger.current!];
    const at = all.indexOf(document.activeElement as HTMLElement);
    const next = all[(at + (e.shiftKey ? -1 : 1) + all.length) % all.length];
    e.preventDefault();
    next.focus();
  };

  const pos = contained ? "absolute" : "fixed";
  const tall = contained ? ["h-[90%]", "h-[85%]"] : ["h-[90dvh]", "h-[85dvh]"];
  const close = () => set(false);
  const line = "absolute left-0 top-1/2 block h-[2px] w-(--menu-line-width) transition-transform duration-300 ease-out motion-reduce:transition-none";
  const draw = (extra: number) => ({
    initial: { transform: reduce ? "scaleX(1)" : "scaleX(0)", opacity: reduce ? 0 : 1 },
    animate: { transform: "scaleX(1)", opacity: 1 },
    // check-ignore: duration the burger draws itself once on first paint
    transition: { duration: reduce ? 0.2 : 0.42, delay: reduce ? 0 : delay + extra, ease: OUT },
  });

  return (
    <div onKeyDown={trap}>
      <button
        ref={burger}
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        onClick={() => set(!isOpen)}
        style={{ color: isOpen ? activeColor : color }}
        className={`absolute top-5 left-5 z-[75] inline-flex h-12 items-center gap-3 rounded-full px-1 transition-[opacity,color] duration-300 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:top-7 sm:left-7 [@media(hover:hover)]:hover:opacity-85 ${className}`}
      >
        <span className="relative block h-10 w-10 [--menu-line-width:2rem] sm:[--menu-line-width:3rem]">
          <span className={`${line} ${isOpen ? "translate-y-0 rotate-45" : "-translate-y-[5px]"}`}>
            <motion.span className="block h-full w-full origin-left rounded-full bg-current" {...draw(0)} />
          </span>
          <span className={`${line} ${isOpen ? "translate-y-0 -rotate-45" : "translate-y-[5px]"}`}>
            <motion.span className="block h-full w-full origin-left rounded-full bg-current" {...draw(0.06)} />
          </span>
        </span>
        {/* the label's width opens with it, as on Armour: shut, the button is just the burger (60px), not a wider invisible target. check-ignore: gpu-props a one-word label, and Armour's own motion */}
        <span aria-hidden className={`hidden overflow-hidden text-sm tracking-tight transition-[max-width,opacity] duration-300 ease-out motion-reduce:transition-none sm:block ${isOpen ? "max-w-20 opacity-100" : "max-w-0 opacity-0"}`}>Close</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <Layer key="menu" pos={pos}>
            <motion.div className="absolute inset-0 bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28, ease: OUT }} />
            {colors.map((c, i) => {
              const front = i === 3;
              const t = TIMING[i];
              return (
                <motion.div
                  key={i}
                  ref={front ? menu : undefined}
                  role={front ? "dialog" : undefined}
                  aria-modal={front ? true : undefined}
                  aria-label={front ? "Menu" : undefined}
                  className={`absolute inset-x-0 top-0 ${front ? tall[1] : tall[0]}`}
                  style={{ background: c }}
                  initial={reduce ? { opacity: 0 } : { transform: "translateY(-100%)" }}
                  // the reduced-motion target still names the resting transform: useReducedMotion only settles after the first render, so a panel can mount with the slide-in start state
                  animate={reduce ? { opacity: 1, transform: "translateY(0%)", transition: { duration: 0.2 } } : { transform: "translateY(0%)", transition: { duration: t.in[0], delay: t.in[1], ease: OUT } }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.2 } } : { transform: "translateY(-100%)", transition: { duration: t.out[0], delay: t.out[1], ease: OUT } }}
                >
                  {front && (
                    <div className="flex h-full flex-col px-6 pt-6 pb-8 text-[#F4F1DE] @2xl:px-10 @2xl:pt-7 @2xl:pb-10">
                      <div className="mt-2 flex min-h-8 justify-center text-2xl @2xl:text-3xl">{logo}</div>
                      <div className="mt-10 grid min-h-0 flex-1 grid-cols-1 gap-10 overflow-y-auto @3xl:grid-cols-[220px_minmax(0,1fr)] @3xl:gap-14 @5xl:mt-12">
                        <div className="order-2 flex min-w-0 flex-col justify-between gap-8 @3xl:order-1 @3xl:pt-8">
                          <div className="flex flex-col items-start gap-1 text-left">
                            <Links links={secondary} size="text-[1.15rem] leading-tight tracking-tight @2xl:text-[1.35rem]" blur={8} y={14} dur={0.45} base={REVEAL + 0.08} step={0.06} onPick={close} reduce={reduce} />
                          </div>
                          <div className="hidden flex-col items-start gap-0.5 text-left @3xl:flex">
                            <Links links={legal} size="text-[11px] leading-snug opacity-90 @2xl:text-xs" blur={6} y={10} dur={0.4} base={REVEAL + 0.18} step={0.04} onPick={close} reduce={reduce} />
                          </div>
                        </div>
                        <div className="order-1 flex min-w-0 items-center justify-center @3xl:order-2">
                          <div className="flex w-fit max-w-full flex-col items-start text-left">
                            <Links links={primary} size="text-[clamp(3rem,7cqw,5rem)] font-medium leading-[0.92] tracking-tight" blur={10} y={18} dur={0.5} base={REVEAL + 0.08} step={0.06} onPick={close} reduce={reduce} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </Layer>
        )}
      </AnimatePresence>
    </div>
  );
}
