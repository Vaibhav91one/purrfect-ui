"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface CounterProps extends Omit<ComponentProps<"span">, "children"> {
  /** The number to show. Change it and each digit column rolls to its new digit. */
  value: number;
  /** BCP 47 tag for the digit grouping (1,234 or 1.234). */
  locale?: string;
  /** Size and weight come from here, e.g. `text-8xl font-semibold`. */
  className?: string;
}

const OUT = [0.23, 1, 0.32, 1] as const;

function Digit({ d, reduce }: { d: number; reduce: boolean }) {
  return (
    <span aria-hidden className="relative inline-block h-[1em] w-[1ch] overflow-hidden leading-none">
      <motion.span
        animate={{ transform: `translateY(${-d * 10}%)` }}
        // check-ignore: duration a count-up is read, not waited on; it is a display moment, not a control
        transition={{ duration: reduce ? 0 : 0.9, ease: OUT }}
        className="flex flex-col"
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="h-[1em]">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/**
 * A number that rolls digit by digit to its value. Each column slides up or down to its digit; columns are keyed from the
 * right, so 99 -> 100 grows a column instead of reshuffling. Screen readers read the formatted number as text, not the 0-9 stack.
 * Under `prefers-reduced-motion` the digits switch with no roll.
 */
export function Counter({ value, locale = "en-US", className, ...rest }: CounterProps) {
  const reduce = useReducedMotion() ?? false;
  const format = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const text = format.format(value);
  return (
    <span className={cn("inline-flex leading-none tabular-nums", className)} {...rest}>
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <Digit key={text.length - i} d={+ch} reduce={reduce} />
        ) : (
          <span key={text.length - i} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
