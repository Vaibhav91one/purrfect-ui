"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState, type KeyboardEvent } from "react";

export interface TabsProps {
  /** The tab labels, in order. Each label is also its value, so keep them unique. */
  tabs: string[];
  /** Controlled value. Leave it out and the tabs keep their own state. */
  value?: string;
  /** Starting tab when uncontrolled. Defaults to the first. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the tab list. */
  label?: string;
  /** Size comes from here, e.g. `text-lg`. */
  className?: string;
}

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

/**
 * Tabs with a pill that glides under the active label. One spring moves the pill, so picking another tab mid-glide carries
 * on from where it is. Arrow keys, Home and End move between tabs (roving tabindex); the pill is instant under
 * `prefers-reduced-motion`. It renders the tab bar only: show your own panel for the selected value.
 */
export function Tabs({ tabs, value, defaultValue, onValueChange, label = "Tabs", className = "" }: TabsProps) {
  const reduce = useReducedMotion() ?? false;
  const id = useId();
  const [inner, setInner] = useState(defaultValue ?? tabs[0]);
  const active = value ?? inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (tab: string) => {
    if (value === undefined) setInner(tab);
    onValueChange?.(tab);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const at = Math.max(0, tabs.indexOf(active));
    const to = e.key === "ArrowRight" ? (at + 1) % tabs.length : e.key === "ArrowLeft" ? (at - 1 + tabs.length) % tabs.length : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    pick(tabs[to]);
    refs.current[to]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={`[scrollbar-width:none] inline-flex [&::-webkit-scrollbar]:hidden max-w-full overflow-x-auto rounded-full bg-muted p-1.5 ${className}`}>
      {tabs.map((t, i) => (
        <button
          key={t}
          ref={(el) => void (refs.current[i] = el)}
          type="button"
          role="tab"
          aria-selected={active === t}
          tabIndex={active === t ? 0 : -1}
          onClick={() => pick(t)}
          className={`relative shrink-0 rounded-full px-5 py-2 whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${active === t ? "text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          {active === t && <motion.span layoutId={id} transition={reduce ? { duration: 0 } : SPRING} className="absolute inset-0 rounded-full bg-foreground" />}
          <span className="relative">{t}</span>
        </button>
      ))}
    </div>
  );
}
