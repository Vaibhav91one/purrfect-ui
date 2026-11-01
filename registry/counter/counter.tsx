"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, type ComponentProps, type Ref } from "react";
import { cn } from "@/lib/utils";

export interface CounterProps extends Omit<ComponentProps<"span">, "children"> {
  /** The number to show. Change it and each digit column rolls to its new digit. NaN and Infinity show 0. */
  value: number;
  /** BCP 47 tag for the digit grouping (1,234 or 1.234) and the digits themselves (Arabic, Devanagari...). An invalid tag falls back to en-US. */
  locale?: string;
  /** Roll up from 0 when it first appears. Off: it renders at its value and only rolls on later changes. */
  countUp?: boolean;
  /** Size and weight come from here, e.g. `text-8xl font-semibold`. */
  className?: string;
}

const OUT = [0.23, 1, 0.32, 1] as const;

function Digit({ d, glyphs, reduce, countUp, ref }: { d: number; glyphs: string[]; reduce: boolean; countUp: boolean; ref?: Ref<HTMLSpanElement> }) {
  const box = useRef<HTMLSpanElement>(null);
  const last = useRef(d);
  // reduced motion: the column jumps, and a quick fade marks the change (client only, so the server HTML never differs)
  useEffect(() => {
    if (last.current === d) return;
    last.current = d;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) box.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: "ease-out" });
  }, [d]);
  return (
    <motion.span ref={ref} layout="position" exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.3, ease: OUT }} aria-hidden className="relative inline-block h-[1em] w-[1ch] overflow-hidden leading-none">
      <motion.span
        ref={box}
        initial={countUp ? { transform: "translateY(0%)" } : false}
        animate={{ transform: `translateY(${-d * 10}%)` }}
        // check-ignore: duration a count-up is read, not waited on; it is a display moment, not a control
        transition={{ duration: reduce ? 0 : 0.9, ease: OUT }}
        className="flex flex-col"
      >
        {glyphs.map((g, i) => (
          <span key={i} className="h-[1em]">
            {g}
          </span>
        ))}
      </motion.span>
    </motion.span>
  );
}

/**
 * A number that rolls digit by digit to its value. Each column slides up or down to its digit; integer columns are keyed
 * from the right and decimals from the point, so 99 -> 100 grows a column instead of reshuffling, and a column that comes
 * or goes fades while the rest slide over. Screen readers read the formatted number as text, not the 0-9 stack. It always
 * lays out left to right, even inside RTL text. Under `prefers-reduced-motion` the digits switch with no roll and a quick fade.
 */
export function Counter({ value, locale = "en-US", countUp = false, className, ...rest }: CounterProps) {
  const reduce = useReducedMotion() ?? false;
  const format = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, { signDisplay: "negative" });
    } catch {
      return new Intl.NumberFormat("en-US", { signDisplay: "negative" });
    }
  }, [locale]);
  // the locale's own digits, so a column can show ٠-٩ as well as 0-9
  const glyphs = useMemo(() => Array.from({ length: 10 }, (_, i) => format.format(i)), [format]);
  const n = Number.isFinite(value) ? value : 0;
  const parts = format.formatToParts(n);
  const text = parts.map((p) => p.value).join("");
  const point = parts.findIndex((p) => p.type === "decimal");
  const whole = [...parts.slice(0, point < 0 ? parts.length : point).map((p) => p.value).join("")];
  const frac = point < 0 ? [] : [...parts.slice(point + 1).map((p) => p.value).join("")];
  const cells = [
    ...whole.map((ch, i) => ({ ch, key: `i${whole.length - i}` })),
    ...(point < 0 ? [] : [{ ch: parts[point].value, key: "point" }]),
    ...frac.map((ch, i) => ({ ch, key: `f${i}` })),
  ];
  return (
    <span dir="ltr" className={cn("inline-flex leading-none tabular-nums", className)} {...rest}>
      <span className="sr-only">{text}</span>
      <AnimatePresence mode="popLayout" initial={countUp}>
        {cells.map(({ ch, key }) =>
          glyphs.includes(ch) ? (
            <Digit key={key} d={glyphs.indexOf(ch)} glyphs={glyphs} reduce={reduce} countUp={countUp} />
          ) : (
            <motion.span key={key} layout="position" exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.3, ease: OUT }} aria-hidden>
              {ch}
            </motion.span>
          ),
        )}
      </AnimatePresence>
    </span>
  );
}
