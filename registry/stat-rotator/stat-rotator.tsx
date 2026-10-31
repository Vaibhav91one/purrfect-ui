"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Stat {
  /** A string with one number in it: "3.2x", "$1.2M", "98%", "12,400". The number counts up; the rest stays put. */
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface StatRotatorProps extends Omit<ComponentProps<"div">, "children"> {
  stats: Stat[];
  /** Seconds each stat stays up before the next one rises in. */
  interval?: number;
  className?: string;
}

const OUT = [0.22, 1, 0.36, 1] as const;
// the site's count-up curve: a slow start, then the digits race to the value
const COUNT = [1, 0, 0.35, 0.95] as const;

function parse(value: string) {
  const m = value.match(/-?\d[\d,]*(?:\.\d+)?/);
  if (!m || m.index === undefined) return null;
  const target = Number(m[0].replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  const decimals = (m[0].split(".")[1] ?? "").length;
  const text = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(target);
  return { target, decimals, text, prefix: value.slice(0, m.index), suffix: value.slice(m.index + m[0].length) };
}

/** Leading places stay invisible until the count reaches them (12,400 counts up as 7, 85, 1,240..., never 00,000); the
 * places at and right of the units always show. Opacity only, so the width never jumps. */
function useLead(n: MotionValue<number>, k: number, units: number) {
  return useTransform(n, (v) => (k <= units || Math.abs(v) >= 10 ** k ? 1 : 0));
}

/** One odometer column: place k of the scaled count rolls continuously at k = 0 and only on the carry above it. */
function Column({ n, k, units }: { n: MotionValue<number>; k: number; units: number }) {
  const opacity = useLead(n, k, units);
  const transform = useTransform(n, (v) => {
    const r = Math.abs(v) / 10 ** k;
    const f = r % 1;
    const pos = (Math.floor(r) % 10) + (k === 0 ? f : Math.max(0, f - 0.9) * 10);
    return `translateY(${(-pos * 100) / 11}%)`;
  });
  return (
    <motion.span style={{ opacity }} className="relative inline-block h-[1em] w-[1ch] overflow-hidden leading-none">
      <motion.span style={{ transform }} className="flex flex-col">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
          <span key={i} className="h-[1em]">
            {d}
          </span>
        ))}
      </motion.span>
    </motion.span>
  );
}

/** A separator (comma) shows once the digit to its left does. */
function Sep({ n, k, units, ch }: { n: MotionValue<number>; k: number; units: number; ch: string }) {
  return <motion.span style={{ opacity: useLead(n, k, units) }}>{ch}</motion.span>;
}

function Rolling({ value, run, reduce }: { value: string; run: boolean; reduce: boolean }) {
  const p = useMemo(() => parse(value), [value]);
  // the count in units of the last decimal place (3.2 counts 0..32), so every column is a whole digit at rest
  const n = useMotionValue(0);
  // no "started" flag: StrictMode runs this twice, and a flag set by the first run would stop the second from restarting the
  // count its cleanup stopped. Restarting is harmless: it animates on from wherever the count is.
  useEffect(() => {
    if (!p || !run) return;
    const to = Math.round(p.target * 10 ** p.decimals);
    if (reduce) return void n.set(to);
    // check-ignore: duration a count-up is read, not waited on; the card is a display moment, not a control
    const c = animate(n, to, { duration: 2.2, ease: COUNT });
    return () => c.stop();
  }, [p, run, reduce, n]);

  if (!p) return <span>{value}</span>;
  let k = [...p.text].filter((ch) => /\d/.test(ch)).length;
  return (
    <span aria-hidden className="inline-flex items-center leading-none tabular-nums">
      {p.prefix}
      {[...p.text].map((ch, i) => (/\d/.test(ch) ? <Column key={i} n={n} k={--k} units={p.decimals} /> : <Sep key={i} n={n} k={k} units={p.decimals} ch={ch} />))}
      {p.suffix}
    </span>
  );
}

/**
 * A glass card that cycles through stats: every few seconds the card lifts out and the next rises in, its number counting
 * up from 0 on rolling digit columns. Pill dots jump to a stat and stretch to mark the current one. Rotation pauses on hover,
 * on keyboard focus and while off screen; a polite live region reads each new stat once, never the count.
 * Under `prefers-reduced-motion` the cards cross-fade in place and the number shows its final value.
 */
export function StatRotator({
  stats,
  interval = 3.6,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...rest
}: StatRotatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const inView = useInView(ref, { amount: 0.4 });
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [picked, setPicked] = useState(false); // a dot was used: from then on each change is announced
  const count = stats.length;
  const cur = count ? index % count : 0;
  const paused = hover || focus || !inView || count < 2;

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), interval * 1000);
    return () => clearTimeout(t);
  }, [cur, paused, interval, count]);

  const stat = stats[cur];
  return (
    <div
      ref={ref}
      className={cn("flex flex-col items-center gap-4", className)}
      {...rest}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setHover(true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        setHover(false);
        onPointerLeave?.(e);
      }}
      onFocus={(e) => {
        setFocus(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
        onBlur?.(e);
      }}
    >
      {/* silent while it rotates by itself (announcing every few seconds floods a screen reader); polite once a dot is used */}
      <div aria-live={picked ? "polite" : "off"} className="w-full">
        <AnimatePresence mode="wait" initial={false}>
          {stat && (
            <motion.article
              key={cur}
              initial={{ opacity: 0, transform: reduce ? "translateY(0px)" : "translateY(38px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: reduce ? "translateY(0px)" : "translateY(-38px)" }}
              // check-ignore: duration the slide is an ambient rotation, not a response to input
              transition={{ duration: 0.45, ease: OUT }}
              className="flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-border/40 bg-background/30 p-10 text-center text-foreground backdrop-blur-md"
            >
              <span className="sr-only">{stat.value}</span>
              <span className="flex h-14 items-center text-5xl font-medium tracking-tight">
                <Rolling value={stat.value} run={inView} reduce={reduce} />
              </span>
              <p className="max-w-full text-sm leading-relaxed text-pretty break-words text-foreground/85">{stat.label}</p>
              {stat.description && (
                <p className="max-w-full text-xs leading-relaxed text-pretty break-words text-foreground/65">{stat.description}</p>
              )}
            </motion.article>
          )}
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="flex flex-wrap items-center justify-center">
          {stats.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show stat ${i + 1} of ${count}`}
              aria-current={i === cur ? "true" : undefined}
              onClick={() => {
                setPicked(true);
                setIndex(i);
              }}
              className="group grid h-6 w-7 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "h-1.5 w-6 rounded-full bg-foreground transition-[clip-path,opacity] duration-300 ease-out motion-reduce:transition-opacity",
                  i === cur ? "[clip-path:inset(0_round_9999px)]" : "opacity-45 [clip-path:inset(0_6px_round_9999px)] group-hover:opacity-70",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
