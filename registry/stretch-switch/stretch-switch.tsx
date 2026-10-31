"use client";

import { motion, useReducedMotion, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useState, type ComponentProps, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export interface StretchSwitchProps extends Omit<ComponentProps<"button">, "value" | "children"> {
  /** Controlled value. Leave it out and the switch keeps its own state. */
  checked?: boolean;
  /** Starting value when uncontrolled. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** The switch's accessible name. There is no visible text inside it, so say what it turns on. */
  label: string;
  /** Submitted with a form while on, like a checkbox. */
  name?: string;
  value?: string;
}

const SPRING = { stiffness: 420, damping: 34 };

/**
 * An on/off switch whose knob stretches as it travels. One spring moves the knob and its own speed drives the stretch, so
 * flipping it again mid-way carries on from where the knob is. Space and Enter flip it. Size it with the `--switch-w` and
 * `--switch-h` CSS variables (112 x 64px by default); the knob follows. Under `prefers-reduced-motion` the knob jumps and
 * only the colour fades.
 */
export function StretchSwitch({ checked, defaultChecked = false, onCheckedChange, label, name, value = "on", className, onClick, ...rest }: StretchSwitchProps) {
  const reduce = useReducedMotion() ?? false;
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const p = useSpring(on ? 1 : 0, SPRING); // 0 off, 1 on: the knob's travel is a share of the track, so any size works
  const stretch = useTransform(useVelocity(p), [-29, 0, 29], [1.3, 1, 1.3]); // 29 travels/s is the old 1400px/s over 48px
  const transform = useTransform(() => `translateX(calc((var(--switch-w) - var(--switch-h)) * ${p.get()})) scaleX(${stretch.get()})`);

  useEffect(() => {
    if (reduce) p.jump(on ? 1 : 0);
    else p.set(on ? 1 : 0);
  }, [on, reduce, p]);

  const flip = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
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
      onClick={flip}
      className={cn(
        "flex h-[var(--switch-h)] w-[var(--switch-w)] shrink-0 items-center rounded-full p-[calc(var(--switch-h)/8)] transition-colors duration-300 [--switch-h:4rem] [--switch-w:7rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50",
        on ? "bg-primary" : "bg-input",
        className,
      )}
      {...rest}
    >
      {/* knob colours as in shadcn's Switch, so it sits in a shadcn theme in light and dark */}
      <motion.span aria-hidden style={{ transform }} className={cn("aspect-square h-full rounded-full bg-background shadow", on ? "dark:bg-primary-foreground" : "dark:bg-foreground")} />
      {name && on && <input type="hidden" name={name} value={value} />}
    </button>
  );
}
