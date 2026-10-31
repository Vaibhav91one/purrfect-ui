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
  /** Fraction of the glyph height hidden under the bottom edge, 0 to 0.9. */
  crop?: number;
  /** A blurred copy of the photo behind the word, as a glow. */
  glow?: boolean;
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
}

/**
 * A huge wordmark filled with a photo (`background-clip: text`) and cropped at the bottom edge, with an optional blurred
 * copy behind it as a glow (hidden from screen readers, so the word is read once). It fills the width with no measuring:
 * the root is an inline-size container and the font size is `100cqi / (characters x --advance)`, where `--advance` is the
 * font's average glyph width in em (0.75 suits a heavy sans; set `[--advance:0.9]` in className for a wide face). Every
 * offset is in em, so it holds at any size. As it scrolls into view the word rises a little out of the crop and the photo
 * drifts inside the letters, both tied to scroll progress.
 * Reduced motion: static, the word sits at its final crop and the photo stays put.
 */
export function PhotoWordmark({ text, src, as = "p", crop = 0.3, glow = true, container, className, style, ...rest }: PhotoWordmarkProps) {
  const root = useRef<HTMLDivElement>(null);
  const Tag = as;
  const { scrollYProgress } = useScroll({ target: root, container, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["14%", "0%"]);
  const drift = useTransform(scrollYProgress, [0, 1], ["20%", "100%"]);
  const c = Math.min(Math.max(crop, 0), 0.9);

  const fill: CSSProperties = { backgroundImage: `url("${src}")`, WebkitBackgroundClip: "text" };
  const word = "block whitespace-nowrap bg-cover bg-clip-text text-transparent [background-position:50%_var(--drift)]";

  return (
    <div
      ref={root}
      className={cn("@container overflow-x-visible overflow-y-clip [--advance:0.75]", className)}
      style={{ "--chars": Math.max(Array.from(text).length, 1), ...style } as CSSProperties}
      {...rest}
    >
      {/* room above for the glow; the box ends (1 - crop) em down, so the rest of the glyphs is clipped */}
      <div className="pt-[0.1em] text-[length:calc(100cqi/(var(--chars)*var(--advance)))] leading-none" style={{ height: `calc(0.1em + ${1 - c}em)` }}>
        {/* check-ignore: gpu-props background-position is the photo drift, a scroll-linked paint the source already pays for */}
        <motion.div
          style={{ y, "--drift": drift } as MotionStyle}
          className="relative will-change-transform motion-reduce:transform-none! motion-reduce:[--drift:100%]!"
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
