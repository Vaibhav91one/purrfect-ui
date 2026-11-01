"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ColumnHopColumn = {
  title: ReactNode;
  /** The cards that stay put in this column. */
  items: ReactNode[];
};

export interface ColumnHopProps extends Omit<ComponentProps<"div">, "children" | "ref"> {
  columns: ColumnHopColumn[];
  /** The card that hops. */
  item: ReactNode;
  /** Per-column versions of the card, by column index, so it can wear the state of the column holding it. Falls back to `item`. */
  itemByColumn?: ReactNode[];
  /** Column indices it visits, in order, then loops. */
  stops?: number[];
  /** Seconds it rests in each column. */
  interval?: number;
  /** Classes for every card box. */
  itemClassName?: string;
}

type Phase = "settled" | "leaving" | "arriving";

/** ms per half of a hop: the sink plus collapse, then the open plus rise. */
const MOVE = 340;
const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/**
 * A small board whose one card hops between columns on a loop. It fades and sinks, its row collapses, then the row in the
 * next column opens first and the card rises into space that already exists, so it never overlaps a neighbour and the
 * cards below slide rather than being covered. Each row is a grid animating `grid-template-rows` 1fr / 0fr: plain CSS
 * transitions, no measuring. The loop pauses off screen and while the tab is hidden. The row it left is inert and hidden
 * from screen readers. Reduced motion: no sink, rise or collapse; the card fades out and back in.
 */
export function ColumnHop({ columns, item, itemByColumn, stops = [0, 1], interval = 2.6, itemClassName, className, style, ...rest }: ColumnHopProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const [phase, setPhase] = useState<Phase>("settled");
  const n = stops.length;

  useEffect(() => {
    const el = ref.current;
    if (!el || n < 2) return;
    let t = 0;
    let visible = false;
    const run = () => {
      t = window.setTimeout(() => {
        setPhase("leaving");
        t = window.setTimeout(() => {
          setAt((a) => (a + 1) % n);
          setPhase("arriving");
          t = window.setTimeout(() => {
            setPhase("settled");
            run();
          }, MOVE);
        }, MOVE);
      }, interval * 1000);
    };
    // any pause drops the hop in progress and restarts the rest from settled
    const sync = () => {
      window.clearTimeout(t);
      setPhase("settled");
      if (visible && !document.hidden) run();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearTimeout(t);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [interval, n]);

  const box = cn("rounded-md border border-border bg-card p-3 text-sm text-card-foreground", itemClassName);
  const holder = stops[at % Math.max(n, 1)];

  return (
    <div
      ref={ref}
      className={cn("grid gap-3", className)}
      style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))`, ...style }}
      {...rest}
    >
      {columns.map((col, c) => {
        const present = holder === c;
        const open = present && phase !== "leaving";
        return (
          <section key={c} className="flex min-w-0 flex-col rounded-lg bg-muted/50 p-2.5">
            <header className="mb-2.5 flex items-center gap-2 px-0.5 text-sm font-medium">
              <h3 className="min-w-0 flex-1 truncate">{col.title}</h3>
              <span className="text-xs text-muted-foreground tabular-nums">{col.items.length + (present ? 1 : 0)}</span>
            </header>
            {stops.includes(c) && (
              <div
                aria-hidden={!present}
                inert={!present}
                className={cn(
                  "grid motion-reduce:transition-none",
                  // check-ignore: gpu-props the row's height is the point: the column grows so the cards below slide, nothing overlaps
                  `transition-[grid-template-rows] duration-300 ${EASE}`,
                  // reduced motion keeps the row open while the card fades out, then swaps it instantly
                  open ? "grid-rows-[1fr]" : present ? "grid-rows-[0fr] motion-reduce:grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={cn(
                      `pb-2 transition-[opacity,translate] duration-300 ${EASE} motion-reduce:translate-y-0 motion-reduce:duration-150`,
                      !present || phase === "arriving" ? "-translate-y-2 opacity-0" : phase === "leaving" && "translate-y-2 opacity-0",
                    )}
                  >
                    <div className={box}>{itemByColumn?.[c] ?? item}</div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {col.items.map((it, i) => (
                <div key={i} className={box}>
                  {it}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
