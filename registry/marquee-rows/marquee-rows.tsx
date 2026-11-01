"use client";

import { motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MarqueeRowsItem = {
  label: ReactNode;
  /** Makes the row a link. Without it the row is a button. */
  href?: string;
};

export interface MarqueeRowsProps extends Omit<ComponentProps<"div">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  items: MarqueeRowsItem[];
  /** Pixels per second the open row's marquee runs at. */
  speed?: number;
  /** What sits between the repeats in the band. A small spinning asterisk by default. */
  separator?: ReactNode;
  /** Stagger the rows' start (from md up; phones get no indent so the text fits). */
  indent?: boolean;
  /** Classes for the band that slides up (its colours: bg-primary text-primary-foreground by default). */
  bandClassName?: string;
}

const INDENTS = ["", "md:ps-[25%]", "md:ps-[20%]", "md:ps-[60%]"];
// check-ignore: duration 0.4s is the source's timing for a full-row text swap, not a small UI control
const SLIDE = "transition-[translate,opacity] duration-400 ease-[cubic-bezier(0.585,0.039,0.26,0.681)] motion-reduce:transition-opacity motion-reduce:duration-200";

function Asterisk() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[0.6em] shrink-0 animate-[spin_8s_linear_infinite] motion-reduce:animate-none">
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" />
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" transform="rotate(60 12 12)" />
      <rect x="10.5" y="1" width="3" height="22" rx="1.5" transform="rotate(-60 12 12)" />
    </svg>
  );
}

/**
 * Big lines of text, one per row, at staggered indents. Opening a row slides its text up out of view while a coloured band
 * slides up from below, running the same text as a marquee with spinning asterisks between the repeats. A row opens on
 * mouse hover, on keyboard focus, and on tap (a tap toggles a button row; on a link row the first tap opens it and the
 * second follows the link), so touch never sticks open from a stale hover. The row's height comes from its text. The
 * marquee runs at a fixed speed per second whatever the frame rate, renders as many copies as the width needs and wraps by
 * exactly one copy; only the open row's marquee runs, and only while on screen. The band is a visual duplicate, so it is
 * hidden from screen readers and inert.
 * Reduced motion: the band fades in without the slide and its marquee stands still.
 */
export function MarqueeRows({ items, speed = 120, separator = <Asterisk />, indent = true, bandClassName, className, ...rest }: MarqueeRowsProps) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className={cn("flex flex-col text-4xl leading-tight font-light tracking-tight md:text-6xl lg:text-7xl", className)} {...rest}>
      {items.map((it, i) => (
        <Row
          key={i}
          item={it}
          open={open === i}
          setOpen={(v) => setOpen((o) => (v ? i : o === i ? null : o))}
          speed={speed}
          separator={separator}
          indent={indent ? INDENTS[i % INDENTS.length] : ""}
          bandClassName={bandClassName}
        />
      ))}
    </div>
  );
}

type RowProps = { item: MarqueeRowsItem; open: boolean; setOpen: (v: boolean) => void; speed: number; separator: ReactNode; indent: string; bandClassName?: string };

function Row({ item, open, setOpen, speed, separator, indent, bandClassName }: RowProps) {
  const band = useRef<HTMLSpanElement>(null);
  const first = useRef<HTMLSpanElement>(null);
  const pointer = useRef("mouse");
  const reduce = useReducedMotion();
  const visible = useInView(band);
  const x = useMotionValue(0);
  const copy = useRef(0);
  const [count, setCount] = useState(2);

  // one copy's width, and enough copies to cover the band plus the one that scrolls out
  useEffect(() => {
    const box = band.current, one = first.current;
    if (!box || !one) return;
    const ro = new ResizeObserver(() => {
      copy.current = one.offsetWidth;
      if (copy.current) setCount(Math.max(2, Math.ceil(box.clientWidth / copy.current) + 1));
    });
    ro.observe(box);
    ro.observe(one);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const w = copy.current;
    if (!open || reduce || !visible || !w) return;
    let next = x.get() - (speed * Math.min(delta, 100)) / 1000; // a backgrounded tab must not jump on return
    if (next <= -w) next += w;
    x.set(next);
  });

  // touch and pen: a tap toggles (a link's first tap only opens). Keyboard clicks (detail 0) and mouse clicks pass through.
  const onClick = (e: MouseEvent) => {
    if (pointer.current === "mouse" || e.detail === 0) return;
    if (item.href && !open) e.preventDefault();
    setOpen(item.href ? true : !open);
  };

  const props = {
    onPointerDown: (e: { pointerType: string }) => (pointer.current = e.pointerType),
    onPointerEnter: (e: { pointerType: string }) => e.pointerType === "mouse" && setOpen(true),
    onPointerLeave: (e: { pointerType: string }) => e.pointerType === "mouse" && setOpen(false),
    onFocus: (e: { currentTarget: Element }) => e.currentTarget.matches(":focus-visible") && setOpen(true),
    onBlur: () => setOpen(false),
    onClick,
    className: "relative block w-full cursor-pointer overflow-hidden text-start not-last:border-b border-border focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
  };

  const inner = (
    <>
      <span className={cn("block truncate py-2", indent, SLIDE, open && "-translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0")}>{item.label}</span>
      {/* the band repeats the label for the eye only: the text above is the row's name */}
      {/* dir="ltr" on the band, not the strip: an RTL page would pin the strip to the band's right edge and the run left
          would open a gap there. The label keeps dir="auto" so Arabic still shapes */}
      <span
        ref={band}
        aria-hidden
        inert
        dir="ltr"
        className={cn(
          "absolute inset-0 flex items-center overflow-hidden bg-primary text-primary-foreground",
          SLIDE,
          !open && "translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0",
          // a closed band is out of sight: pause the spinning separators in it too, not just the marquee
          !open && "[&_*]:[animation-play-state:paused]",
          bandClassName,
        )}
      >
        <motion.span style={{ x }} className="flex w-max will-change-transform">
          {Array.from({ length: count }, (_, i) => (
            <span key={i} ref={i === 0 ? first : undefined} className="flex shrink-0 items-center gap-[0.4em] pe-[0.4em] whitespace-nowrap">
              <span dir="auto">{item.label}</span>
              {separator}
            </span>
          ))}
        </motion.span>
      </span>
    </>
  );

  return item.href ? (
    <a href={item.href} {...props}>
      {inner}
    </a>
  ) : (
    <button type="button" {...props}>
      {inner}
    </button>
  );
}
