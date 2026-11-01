"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
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
   * so give the panel that id, `role="tabpanel"` and `aria-labelledby` the tab's id.
   */
  idPrefix?: string;
}

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;
const norm = (t: GlideTab) => (typeof t === "string" ? { value: t, label: t, disabled: false } : { disabled: false, ...t });

/**
 * Tabs with a pill that glides under the active label. One spring moves the pill, so picking another tab mid-glide carries
 * on from where it is. Arrow keys, Home and End move between enabled tabs (roving tabindex); under `prefers-reduced-motion`
 * the pill takes a short ease-out instead. It renders the tab bar only: show your own panel for the selected value.
 */
export function GlideTabs({ tabs, value, defaultValue, onValueChange, label = "Tabs", orientation = "horizontal", idPrefix, className, onKeyDown, ...rest }: GlideTabsProps) {
  const reduce = useReducedMotion() ?? false;
  const id = useId();
  const items = tabs.map(norm);
  const [inner, setInner] = useState(defaultValue ?? items.find((t) => !t.disabled)?.value);
  const active = value ?? inner;
  // the one tab stop: the active tab, or the first enabled one when the value matches none
  const stop = items.some((t) => t.value === active && !t.disabled) ? active : items.find((t) => !t.disabled)?.value;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const vertical = orientation === "vertical";

  const pick = (v: string) => {
    if (value === undefined) setInner(v);
    onValueChange?.(v);
  };

  const keys = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const on = items.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0);
    if (!on.length) return;
    const at = Math.max(0, on.indexOf(items.findIndex((t) => t.value === active)));
    const [prev, next] = vertical ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
    const to = e.key === next ? on[(at + 1) % on.length] : e.key === prev ? on[(at - 1 + on.length) % on.length] : e.key === "Home" ? on[0] : e.key === "End" ? on[on.length - 1] : -1;
    if (to < 0) return;
    e.preventDefault();
    pick(items[to].value);
    refs.current[to]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      onKeyDown={keys}
      className={cn("inline-flex max-w-full rounded-full bg-muted p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", vertical ? "flex-col overflow-y-auto rounded-3xl" : "overflow-x-auto", className)}
      {...rest}
    >
      {items.map((t, i) => {
        const selected = active === t.value;
        return (
          <button
            key={t.value}
            ref={(el) => void (refs.current[i] = el)}
            type="button"
            role="tab"
            id={idPrefix && `${idPrefix}-tab-${t.value}`}
            aria-controls={idPrefix && `${idPrefix}-panel-${t.value}`}
            aria-selected={selected}
            disabled={t.disabled}
            tabIndex={stop === t.value ? 0 : -1}
            onClick={() => pick(t.value)}
            className={cn(
              "relative shrink-0 rounded-full px-5 py-2 whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-40",
              selected ? "text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {selected && <motion.span layoutId={id} transition={reduce ? { duration: 0.15, ease: "easeOut" } : SPRING} className="absolute inset-0 rounded-full bg-foreground" />}
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
