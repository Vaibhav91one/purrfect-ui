"use client";

import { motion, useScroll, useTransform, type MotionStyle } from "motion/react";
import { useRef, type ComponentProps, type CSSProperties, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface PhotoWordmarkProps extends Omit<ComponentProps<"div">, "children" | "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** The word. One line, sized to fill the width. */
  text: string;
  /** The photo inside the letters. */
  src: string;
  /** The text element. A `p` by default so a footer does not add an h1. */
  as?: "p" | "h1" | "h2" | "span";
  /** Fraction of the line box (1em, a bit taller than capitals) hidden under the bottom edge, 0 to 0.8. */
  crop?: number;
  /** A blurred copy of the photo behind the word, as a glow. */
  glow?: boolean;
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
}

// the rise runs on a CSS view() timeline, so it is right from the first paint (no snap on hydration). The timeline is the
// nearest scroll container, so an overflow-hidden ancestor stops it (use overflow-clip); without scroll-driven animations
// the word just sits at its final crop
const CSS =
  "@keyframes photo-wordmark-rise{from{translate:0 14%}to{translate:0 0}}" +
  ".photo-wordmark-rise{animation:photo-wordmark-rise linear both;animation-timeline:view();animation-range:entry 0% entry 100%}" +
  "@media (prefers-reduced-motion:reduce){.photo-wordmark-rise{animation:none}}";

/**
 * A huge wordmark filled with a photo (`background-clip: text`) and cropped at the bottom edge, with an optional blurred
 * copy behind it as a glow (hidden from screen readers, so the word is read once). It fills the width with no measuring:
 * the root is an inline-size container and the font size is `100cqi / (characters x --advance)`, where `--advance` is the
 * font's average glyph width in em (0.75 suits a heavy sans; set `[--advance:0.9]` in className for a wide face or all wide
 * capitals like W and M, lower it for a narrow one). Every offset is in em, so it holds at any size; cap the size with a
 * `max-w-*` on className. Glyphs that still run past the width are clipped. As it scrolls into view the word rises a
 * little out of the crop (CSS scroll timeline: keep ancestors on overflow-clip, not overflow-hidden) and the photo drifts inside the letters (Motion), both tied to scroll
 * progress. If the photo fails to load, the word shows in the foreground colour.
 * Reduced motion: static, the word sits at its final crop and the photo stays put.
 */
export function PhotoWordmark({ text, src, as = "p", crop = 0.3, glow = true, container, className, style, ...rest }: PhotoWordmarkProps) {
  const root = useRef<HTMLDivElement>(null);
  const Tag = as;
  const { scrollYProgress } = useScroll({ target: root, container, offset: ["start end", "end end"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["20%", "100%"]);
  // nothing to show, but useScroll still needs its target mounted
  if (!text) return <div ref={root} hidden />;
  const c = Math.min(Math.max(crop, 0), 0.8);
  // graphemes, not code points, so an emoji family counts as one character
  const chars = typeof Intl.Segmenter === "function" ? [...new Intl.Segmenter().segment(text)].length : Array.from(text).length;

  // JSON.stringify quotes and escapes the URL; the foreground colour shows through the letters if the photo fails
  const fill: CSSProperties = { backgroundImage: `url(${JSON.stringify(src)})`, WebkitBackgroundClip: "text" };
  const word = "block whitespace-nowrap bg-foreground bg-cover bg-clip-text text-transparent [background-position:50%_var(--drift)]";

  return (
    <div ref={root} className={cn("@container overflow-clip [--advance:0.75]", className)} style={{ "--chars": chars, ...style } as CSSProperties} {...rest}>
      {/* React 19 hoists this into <head> once, however many instances render */}
      <style href="photo-wordmark" precedence="default">
        {CSS}
      </style>
      {/* room above for the glow; the box ends (1 - crop) em down, so the rest of the glyphs is clipped */}
      <div className="pt-[0.1em] text-[length:calc(100cqi/(var(--chars)*var(--advance)))] leading-none" style={{ height: `calc(0.1em + ${1 - c}em)` }}>
        {/* check-ignore: gpu-props background-position is the photo drift, a scroll-linked paint the source already pays for */}
        <motion.div
          style={{ "--drift": drift } as MotionStyle}
          className="photo-wordmark-rise relative will-change-transform motion-reduce:[--drift:100%]!"
        >
          {glow && (
            <span aria-hidden className={cn(word, "absolute inset-0 opacity-80 blur-[0.04em] select-none")} style={fill}>
              {text}
            </span>
          )}
          <Tag className={cn(word, "relative")} style={fill}>
            {text}
          </Tag>
        </motion.div>
      </div>
    </div>
  );
}
