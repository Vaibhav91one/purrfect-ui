"use client";

import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type GlideTab = string | { value: string; label: ReactNode; disabled?: boolean };

export interface GlideTabsProps extends Omit<ComponentProps<"div">, "children" | "defaultValue"> {
  /** The tabs, in order: a label (also its value) or `{ value, label, disabled }`. Values must be unique. */
  tabs: GlideTab[];
  /** Controlled value. Leave it out and the tabs keep their own state. */
  value?: string;
  /** Starting tab when uncontrolled. Defaults to the first enabled one. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the tab list. */
  label?: string;
  orientation?: "horizontal" | "vertical";
  /**
   * Set it to wire your panels: tab `value` gets id `${idPrefix}-tab-${value}` and points at `${idPrefix}-panel-${value}`,
   * with any whitespace in the value turned into "-" (an id can't hold a space), so give the panel that id,
   * `role="tabpanel"` and `aria-labelledby` the tab's id.
   */
  idPrefix?: string;
}

const SPRING = { stiffness: 420, damping: 34 } as const;
const ITEM = "shrink-0 rounded-full px-5 py-2 whitespace-nowrap";
const norm = (t: GlideTab) => (typeof t === "string" ? { value: t, label: t, disabled: false } : { disabled: false, ...t });
const slug = (v: string) => v.replace(/\s+/g, "-");

/**
 * Tabs with a pill that glides under the active label. The pill is a copy of the row in the active colours, clipped to the
 * active tab, so the label and the pill change colour as one piece mid-glide. One spring per edge moves the clip, so
 * picking another tab mid-glide carries on from where it is. Arrow keys, Home and End move between enabled tabs (roving
 * tabindex, mirrored in RTL) and jump the pill with no glide; under `prefers-reduced-motion` it fades in place instead.
 * A list too long for its box scrolls, fading the edge that has more tabs. It renders the tab bar only: show your own
 * panel for the selected value.
 */
export function GlideTabs({ tabs, value, defaultValue, onValueChange, label = "Tabs", orientation = "horizontal", idPrefix, className, onKeyDown, ...rest }: GlideTabsProps) {
  const reduce = useReducedMotion() ?? false;
  const items = tabs.map(norm);
  const [inner, setInner] = useState(defaultValue ?? items.find((t) => !t.disabled)?.value);
  const active = value ?? inner;
  // the one tab stop: the active tab, or the first enabled one when the value matches none
  const stop = items.some((t) => t.value === active && !t.disabled) ? active : items.find((t) => !t.disabled)?.value;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const viaKey = useRef(false);
  const placed = useRef(false);
  const vertical = orientation === "vertical";

  // the clip's four insets, each on the spring
  const top = useSpring(0, SPRING);
  const right = useSpring(0, SPRING);
  const bottom = useSpring(0, SPRING);
  const left = useSpring(0, SPRING);
  const clip = useMotionTemplate`inset(${top}px ${right}px ${bottom}px ${left}px round 999px)`;
  const shown = useMotionValue(0); // hidden until placed: the server HTML shows the pill on the selected tab instead

  const at = items.findIndex((t) => t.value === active);
  useEffect(() => {
    const w = row.current;
    const box = list.current;
    if (!w || !box) return;
    const place = (snap: boolean) => {
      const el = refs.current[at];
      shown.jump(el ? 1 : 0);
      if (!el) return;
      const to = [el.offsetTop, w.offsetWidth - el.offsetLeft - el.offsetWidth, w.offsetHeight - el.offsetTop - el.offsetHeight, el.offsetLeft];
      const jump = snap || viaKey.current || reduce; // the first placing, a resize, keyboard picks and reduced motion skip the glide
      [top, right, bottom, left].forEach((m, i) => (jump ? m.jump(to[i]) : m.set(to[i])));
      if (reduce && !snap) animate(shown, [0, 1], { duration: 0.15, ease: [0.23, 1, 0.32, 1] });
      viaKey.current = false;
      box.dataset.ready = ""; // the clipped copy takes over from the server-drawn pill
    };
    place(!placed.current);
    placed.current = true;
    let size = `${w.offsetWidth}x${w.offsetHeight}`;
    const ro = new ResizeObserver(() => {
      const now = `${w.offsetWidth}x${w.offsetHeight}`;
      if (now === size) return; // the observer's first call, or a change that moved nothing
      size = now;
      place(true);
    });
    ro.observe(w);
    return () => ro.disconnect();
  }, [at, reduce, top, right, bottom, left, shown]);

  // fade only the edge that hides more tabs
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const fade = () => {
      const [pos, size, view] = vertical ? [el.scrollTop, el.scrollHeight, el.clientHeight] : [Math.abs(el.scrollLeft), el.scrollWidth, el.clientWidth];
      const max = size - view;
      const before = !vertical && getComputedStyle(el).direction === "rtl" ? max - pos : pos; // hidden past the left / top edge
      el.style.setProperty("--fa", before > 1 ? "1.5rem" : "0px");
      el.style.setProperty("--fb", max - before > 1 ? "1.5rem" : "0px");
    };
    fade();
    const ro = new ResizeObserver(fade);
    ro.observe(el);
    if (row.current) ro.observe(row.current);
    el.addEventListener("scroll", fade, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", fade);
    };
  }, [vertical]);

  const pick = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };

  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const on = items.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0);
    if (!on.length) return;
    const now = Math.max(0, on.indexOf(at));
    const rtl = !vertical && getComputedStyle(e.currentTarget).direction === "rtl";
    const [prev, next] = vertical ? ["ArrowUp", "ArrowDown"] : rtl ? ["ArrowRight", "ArrowLeft"] : ["ArrowLeft", "ArrowRight"];
    const to = e.key === next ? on[(now + 1) % on.length] : e.key === prev ? on[(now - 1 + on.length) % on.length] : e.key === "Home" ? on[0] : e.key === "End" ? on[on.length - 1] : -1;
    if (to < 0) return;
    e.preventDefault();
    viaKey.current = true;
    pick(items[to].value);
    const el = refs.current[to];
    el?.focus();
    // focus() leaves a partly visible tab clipped: bring all of it in
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  return (
    <div
      ref={list}
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      onKeyDown={keys}
      className={cn(
        "group/tabs inline-flex max-w-full rounded-full bg-muted p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        vertical
          ? "flex-col overflow-y-auto scroll-py-1.5 rounded-3xl [mask-image:linear-gradient(to_bottom,transparent,black_var(--fa,0px),black_calc(100%-var(--fb,0px)),transparent)]"
          : "overflow-x-auto scroll-px-1.5 [mask-image:linear-gradient(to_right,transparent,black_var(--fa,0px),black_calc(100%-var(--fb,0px)),transparent)]",
        className,
      )}
      {...rest}
    >
      <div ref={row} className={cn("relative flex", vertical && "flex-col")}>
        {items.map((t, i) => {
          const selected = active === t.value;
          return (
            <button
              key={t.value}
              ref={(el) => void (refs.current[i] = el)}
              type="button"
              role="tab"
              id={idPrefix && `${idPrefix}-tab-${slug(t.value)}`}
              aria-controls={idPrefix && `${idPrefix}-panel-${slug(t.value)}`}
              aria-selected={selected}
              disabled={t.disabled}
              tabIndex={stop === t.value ? 0 : -1}
              onClick={() => pick(t.value)}
              className={cn(
                ITEM,
                // focused, a tab rises over the copy so its inset outline shows
                "relative focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-40",
                selected
                  ? // the server draws the pill here; once the clipped copy is placed it takes over
                    "bg-foreground text-background group-data-[ready]/tabs:bg-transparent group-data-[ready]/tabs:text-muted-foreground group-data-[ready]/tabs:focus-visible:text-background"
                  : "text-muted-foreground transition-colors duration-200 hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
        {/* the pill: the same row in the active colours, clipped to the active tab, so text and background move as one */}
        <motion.div aria-hidden style={{ clipPath: clip, opacity: shown }} className={cn("pointer-events-none absolute inset-0 flex bg-foreground text-background", vertical && "flex-col")}>
          {items.map((t) => (
            <span key={t.value} className={ITEM}>
              {t.label}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
