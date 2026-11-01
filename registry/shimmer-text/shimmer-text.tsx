"use client";

import { useEffect, useRef, type ComponentProps, type CSSProperties, type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerTextProps extends Omit<ComponentProps<"span">, "ref"> {
  /** The element to render, `span` by default (`p`, `h2`, `div`...). */
  as?: ElementType;
  /** Seconds for one sweep of the band across the text. */
  duration?: number;
}

const KEYFRAMES = "@keyframes shimmer-text{from{background-position:200% 0}to{background-position:-200% 0}}";

/**
 * Text that reads as busy: a bright band sweeps across the glyphs, which are clipped to a gradient (`bg-clip-text`).
 * The base is `muted-foreground` and the band `foreground`, so it reads on light and dark backgrounds and follows the theme.
 * One CSS keyframe moves `background-position`: a repaint of the text box, cheap on a short label, no JavaScript per frame.
 * The loop pauses while the text is off screen. The text is one node, so screen readers read it once.
 * Reduced motion: it stands still in the base colour, fully readable.
 */
export function ShimmerText({ as: Tag = "span", duration = 2.8, className, style, children, ...rest }: ShimmerTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      el.style.animationPlayState = e.isIntersecting ? "running" : "paused";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(
        // token utilities, not var(--color-*): those resolve at :root, so a .dark-scoped block would keep the page theme's colours
        "inline-block bg-linear-90 from-muted-foreground from-35% via-foreground via-50% to-muted-foreground to-65% bg-[length:200%_100%] bg-clip-text text-transparent",
        // ponytail: background-position repaints the text box every frame; fine for a label, a masked transform layer if it ever covers a paragraph
        "animate-[shimmer-text_var(--shimmer-duration)_linear_infinite]",
        "motion-reduce:animate-none motion-reduce:bg-none motion-reduce:text-muted-foreground",
        className,
      )}
      style={{ "--shimmer-duration": `${duration}s`, ...style } as CSSProperties}
      {...rest}
    >
      {/* React 19 hoists this into <head> once, however many instances render */}
      <style href="shimmer-text" precedence="default">
        {KEYFRAMES}
      </style>
      {children}
    </Tag>
  );
}
