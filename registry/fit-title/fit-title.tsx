"use client";

import { motion, type Variants } from "motion/react";
import { useLayoutEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface FitTitleProps extends Omit<ComponentProps<"h1">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  as?: "h1" | "h2" | "p";
  children: string;
  /** Smallest font size in px. A title that would fit smaller than this wraps onto more lines instead. */
  min?: number;
  /** Largest font size in px. */
  max?: number;
  /** Rise out of a mask the first time it scrolls into view. */
  rise?: boolean;
}

// one 0 to 1 progress; CSS turns it into the rise, or under reduced motion into a fade done in the first third
const variants: Variants = {
  // check-ignore: duration the display-type rise is a slow 1.2s on purpose, like the source
  in: { "--rise": [0, 1], transition: { duration: 1.2, ease: [0.18, 0.66, 0.18, 1] } },
};

/**
 * One line of display type sized to exactly fill its container's width. Very short titles stop at half the width, and
 * a title that would fit smaller than `min` wraps instead. The size is CSS: `container-type: inline-size` on the root and
 * a `cqi` clamp on the text, so the server HTML is already close (about half an em per character). One measurement of the
 * text's real width in em (on mount, text change and font load) swaps the estimate for the exact ratio; resizing after
 * that is pure CSS, and the ResizeObserver only decides whether to wrap, from the width it is handed (no layout reads).
 * The rise is hidden only under `@media (scripting: enabled)`, so with no JS the title is simply visible. Motion animates one
 * `--rise` variable; CSS turns it into the rise, and under reduced motion into a short fade, so nothing branches in JS.
 */
export function FitTitle({ as = "h1", children, min = 28, max, rise = true, className, ...rest }: FitTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const Tag = motion[as] as typeof motion.h1;

  useLayoutEffect(() => {
    const box = ref.current;
    const t = text.current;
    if (!box || !t) return;
    let k = 0; // the text's width in em at one line, measured once per text and font
    let width = 0;
    let off = false;
    const wrap = () => {
      const size = Math.min((width * 0.995) / k, width * 0.5);
      box.toggleAttribute("data-wrap", width > 0 && k > 0 && size < min);
    };
    const measure = () => {
      if (off) return;
      box.removeAttribute("data-wrap"); // measure on one line
      const px = parseFloat(getComputedStyle(t).fontSize);
      // the on-screen width includes any ancestor scale (a zoomed preview, a scaled card); divide it out so k is in layout em
      const zoom = box.getBoundingClientRect().width / box.offsetWidth || 1;
      k = px ? t.getBoundingClientRect().width / zoom / px : 0;
      if (k) box.style.setProperty("--fit-k", String(k));
      wrap();
    };
    measure();
    let raf = 0;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentBoxSize?.[0]?.inlineSize ?? e.contentRect.width;
      if (w === width) return; // our own font-size change only moves the height
      width = w;
      // write next frame: toggling the wrap inside the callback resizes the box again ("ResizeObserver loop" error)
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(wrap);
    });
    ro.observe(box);
    document.fonts?.ready.then(measure);
    return () => {
      off = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [children, min]);

  const est = Math.max(children.length, 1) * 0.5;
  const size = `min(calc(99.5cqi / var(--fit-k, ${est})), 50cqi)`;

  return (
    <Tag
      ref={ref}
      initial={false}
      whileInView={rise ? "in" : undefined}
      viewport={{ once: true, amount: 0.12 }}
      className={cn("@container m-0 font-normal whitespace-nowrap [overflow-wrap:anywhere] data-[wrap]:whitespace-normal", className)}
      {...rest}
    >
      {/* the mask: line height .75 with padding below for descenders, pulled back with a negative margin */}
      <span
        className="-mb-[.24em] block overflow-clip pt-[.04em] pb-[.24em] leading-[.75] [[data-wrap]>&]:leading-[1.1]"
        style={{ fontSize: max ? `clamp(${min}px, ${size}, ${max}px)` : `max(${min}px, ${size})` }}
      >
        <motion.span
          ref={text}
          variants={variants}
          className={cn(
            "inline-block tracking-[-.05em]",
            rise &&
              "motion-safe:[@media(scripting:enabled)]:[transform:translateY(calc(105%-var(--rise,0)*105%))] motion-reduce:[@media(scripting:enabled)]:[opacity:min(1,calc(var(--rise,0)*3))]",
          )}
        >
          {children}
        </motion.span>
      </span>
    </Tag>
  );
}
