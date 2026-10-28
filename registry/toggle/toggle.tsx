"use client";

import { motion, useReducedMotion, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useState } from "react";

export interface ToggleProps {
  /** Controlled value. Leave it out and the switch keeps its own state. */
  checked?: boolean;
  /** Starting value when uncontrolled. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** The switch's accessible name. There is no visible text inside it, so say what it turns on. */
  label: string;
  disabled?: boolean;
  className?: string;
}

const TRAVEL = 48; // px the knob moves: track 112 - padding 16 - knob 48
const SPRING = { stiffness: 420, damping: 34 };

/**
 * An on/off switch whose knob stretches as it travels. One spring moves the knob and its own speed drives the stretch, so
 * flipping it again mid-way carries on from where the knob is. Space and Enter flip it. Under `prefers-reduced-motion` the
 * knob jumps and only the colour fades.
 */
export function Toggle({ checked, defaultChecked = false, onCheckedChange, label, disabled, className = "" }: ToggleProps) {
  const reduce = useReducedMotion() ?? false;
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const x = useSpring(on ? TRAVEL : 0, SPRING);
  const stretch = useTransform(useVelocity(x), [-1400, 0, 1400], [1.3, 1, 1.3]);

  useEffect(() => {
    if (reduce) x.jump(on ? TRAVEL : 0);
    else x.set(on ? TRAVEL : 0);
  }, [on, reduce, x]);

  const flip = () => {
    const next = !on;
    if (checked === undefined) setInner(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={flip}
      className={`flex h-16 w-28 shrink-0 items-center rounded-full p-2 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50 ${on ? "bg-emerald-500" : "bg-border"} ${className}`}
    >
      <motion.span aria-hidden style={{ x, scaleX: stretch }} className="size-12 rounded-full bg-white shadow" />
    </button>
  );
}
