"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef, useState, type ComponentProps, type FocusEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HoverPreviewItem = {
  title: ReactNode;
  href: string;
  /** The small line on the right of the row. */
  meta?: ReactNode;
  /** What the floating card shows for this row: an image, a video, anything. */
  preview: ReactNode;
  /** Card background behind the preview. The muted token by default. */
  color?: string;
};

export interface HoverPreviewProps extends Omit<ComponentProps<"div">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  items: HoverPreviewItem[];
  /** Text on the disc that trails the card. Empty hides the disc. */
  label?: string;
  /** Classes for the floating card (its size: 400 x 300px by default). */
  cardClassName?: string;
}

const CARD = { stiffness: 150, damping: 22, mass: 0.6 }; // the card trails the pointer
const DISC = { stiffness: 320, damping: 28, mass: 0.5 }; // the disc keeps up with it
const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/**
 * A list of links where hovering a row floats a preview card that trails the pointer, with a "View" disc that keeps up
 * faster; moving to another row slides the card's strip to that row's preview. Keyboard focus opens it beside the focused
 * row, so it is not mouse-only. Positions are relative to the list, so it works anywhere on the page, and the pointer only
 * moves motion values: React re-renders once per row change, not per move. Previews mount on the first open, so a list
 * of screenshots costs nothing until someone hovers. The card stops at the viewport's side edges. Touch gets plain links.
 * Reduced motion: the card appears in place and jumps with the pointer, no scale and no trail.
 */
export function HoverPreview({ items, label = "View", cardClassName, className, onPointerMove, onPointerLeave, onBlur, ...rest }: HoverPreviewProps) {
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const card = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ open: false, index: 0, armed: false, slide: false });
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const qx = useMotionValue(0); // the card's x, kept inside the viewport
  const cx = useSpring(qx, CARD);
  const cy = useSpring(py, CARD);
  const dx = useSpring(px, DISC);
  const dy = useSpring(py, DISC);

  // a closed card jumps to the pointer before it opens, so it never flies in from the corner
  const place = (x: number, y: number, jump: boolean) => {
    // the card stops at the viewport's side edges (the disc still follows the pointer), so hovering near an edge never
    // makes the page scroll sideways
    const el = root.current!, r = el.getBoundingClientRect(), k = r.width / el.offsetWidth || 1;
    const w = (card.current?.offsetWidth ?? 0) / 2;
    const q = Math.max(w - r.left / k, Math.min(x, (document.documentElement.clientWidth - r.left) / k - w));
    px.set(x);
    py.set(y);
    qx.set(q);
    if (jump || reduce) for (const [s, v] of [[cx, q], [cy, y], [dx, x], [dy, y]] as const) s.jump(v);
  };
  // the strip only slides between rows while the card is open; a reopen lands on the new row at once
  const open = (index: number) => setState((s) => ({ open: true, index, armed: true, slide: s.open }));
  const close = () => setState((s) => ({ ...s, open: false }));
  // list coordinates, undoing any scale on an ancestor (a zoomed preview, a transformed card)
  const local = (x: number, y: number) => {
    const el = root.current!, r = el.getBoundingClientRect(), k = r.width / el.offsetWidth || 1;
    return [(x - r.left) / k, (y - r.top) / k] as const;
  };

  return (
    <div
      ref={root}
      className={cn("relative", className)}
      onPointerMove={(e) => {
        onPointerMove?.(e);
        if (e.pointerType === "mouse") place(...local(e.clientX, e.clientY), !state.open);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        close();
      }}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        onBlur?.(e);
        if (!e.currentTarget.contains(e.relatedTarget)) close();
      }}
      {...rest}
    >
      <ul>
        {items.map((it, i) => (
          <li key={i} className="border-t border-border last:border-b">
            <a
              href={it.href}
              onPointerEnter={(e) => e.pointerType === "mouse" && open(i)}
              onFocus={(e) => {
                if (!e.currentTarget.matches(":focus-visible")) return;
                const r = e.currentTarget.getBoundingClientRect();
                place(...local(r.left + r.width * 0.7, r.top + r.height / 2), true); // keyboard moves land at once
                open(i);
              }}
              className="group/row flex items-center justify-between gap-6 py-8 transition-opacity duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground [@media(hover:hover)]:hover:opacity-50"
            >
              <span className={`min-w-0 text-3xl [overflow-wrap:anywhere] transition-[translate] duration-300 ${EASE} [@media(hover:hover)]:group-hover/row:-translate-x-2 motion-reduce:!translate-none md:text-[40px]`}>{it.title}</span>
              {it.meta && <span className={`max-w-[40%] text-right text-sm text-muted-foreground transition-[translate] duration-300 ${EASE} [@media(hover:hover)]:group-hover/row:translate-x-2 motion-reduce:!translate-none`}>{it.meta}</span>}
            </a>
          </li>
        ))}
      </ul>

      {/* decorative: the rows are the links, so the card and disc are hidden from screen readers. The anchors are size-0 so
          their own boxes never widen the page; the card and disc hang off them centred */}
      <motion.div aria-hidden style={{ x: cx, y: cy }} className="pointer-events-none absolute top-0 left-0 z-10 size-0">
        <motion.div
          ref={card}
          initial={false}
          animate={{ opacity: state.open ? 1 : 0, transform: state.open ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.92)" }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className={cn("h-[300px] w-[400px] max-w-[60vw] overflow-hidden rounded-2xl motion-reduce:![transform:translate(-50%,-50%)]", cardClassName)}
        >
          {state.armed && (
            <div style={{ transform: `translateY(${state.index * -100}%)` }} className={cn("size-full", state.slide && `transition-transform duration-300 ${EASE} motion-reduce:transition-none`)}>
              {items.map((it, i) => (
                <div key={i} className="grid size-full place-items-center overflow-hidden bg-muted" style={it.color ? { background: it.color } : undefined}>
                  {it.preview}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
      {label && (
        <motion.div aria-hidden style={{ x: dx, y: dy }} className="pointer-events-none absolute top-0 left-0 z-10 size-0">
          <motion.div
            initial={false}
            animate={{ opacity: state.open ? 1 : 0, transform: state.open ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.9)" }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="grid size-20 place-items-center rounded-full bg-primary text-sm font-light text-primary-foreground motion-reduce:![transform:translate(-50%,-50%)]"
          >
            {label}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
