"use client";

import { motion, useReducedMotion, useSpring, useTransform, useVelocity } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

export interface StretchSwitchProps extends Omit<ComponentProps<"button">, "value" | "children"> {
  /** Controlled value. Leave it out and the switch keeps its own state. */
  checked?: boolean;
  /** Starting value when uncontrolled. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** The switch's accessible name. There is no visible text inside it, so say what it turns on. */
  label: string;
  /** Submitted with a form while on and not disabled, like a checkbox. An uncontrolled switch goes back to `defaultChecked` on form reset. */
  name?: string;
  value?: string;
}

const SPRING = { stiffness: 420, damping: 34 };

/**
 * An on/off switch whose knob stretches as it travels. One spring moves the knob and its own speed drives the stretch, so
 * flipping it again mid-way carries on from where the knob is. Space and Enter flip it. Size it with the `--switch-w` and
 * `--switch-h` CSS variables (112 x 64px by default); the knob follows, and travels the other way in RTL. Under `prefers-reduced-motion` the knob jumps and
 * only the colour fades.
 */
export function StretchSwitch({ checked, defaultChecked = false, onCheckedChange, label, name, value = "on", className, onClick, ...rest }: StretchSwitchProps) {
  const reduce = useReducedMotion() ?? false;
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const p = useSpring(on ? 1 : 0, SPRING); // 0 off, 1 on: the knob's travel is a share of the track, so any size works
  // this spring peaks at about 8.5 travels/s, so the stretch reaches 1.3 at the knob's top speed
  const stretch = useTransform(useVelocity(p), [-8.5, 0, 8.5], [1.3, 1, 1.3]);
  // --switch-dir is -1 in RTL, where the knob starts on the right
  const transform = useTransform(() => `translateX(calc((var(--switch-w) - var(--switch-h)) * ${p.get()} * var(--switch-dir))) scaleX(${stretch.get()})`);
  const knob = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce) p.jump(on ? 1 : 0);
    else p.set(on ? 1 : 0);
  }, [on, reduce, p]);

  // uncontrolled: a form reset puts it back to defaultChecked, as it does a checkbox
  useEffect(() => {
    if (checked !== undefined) return;
    const form = knob.current?.closest("form");
    const reset = () => setInner(defaultChecked);
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [checked, defaultChecked]);

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
        "flex h-[var(--switch-h)] w-[var(--switch-w)] shrink-0 items-center rounded-full p-[calc(var(--switch-h)/8)] transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] [--switch-dir:1] [--switch-h:4rem] [--switch-w:7rem] rtl:[--switch-dir:-1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50",
        on ? "bg-primary" : "bg-input",
        className,
      )}
      {...rest}
    >
      {/* knob colours as in shadcn's Switch, so it sits in a shadcn theme in light and dark */}
      <motion.span ref={knob} aria-hidden style={{ transform }} className={cn("aspect-square h-full rounded-full bg-background shadow", on ? "dark:bg-primary-foreground" : "dark:bg-foreground")} />
      {name && on && !rest.disabled && <input type="hidden" name={name} value={value} />}
    </button>
  );
}
