"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export interface StickerPopProps extends Omit<ComponentProps<"img">, "ref" | "src" | "style" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  src: string;
  /** The tilt, in degrees, the sticker settles into. */
  rotate?: number;
  /** Seconds to wait after the image has loaded before popping: stagger a pile with it. */
  delay?: number;
  /** Play the exit: shrink, tilt on and fade. */
  out?: boolean;
  /** Seconds before the exit starts: stagger a pile leaving in reverse. */
  outDelay?: number;
  style?: ComponentProps<typeof motion.img>["style"];
}

// check-ignore: duration a springy pop for a rare, playful moment, not a control responding
const POP = { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] as const };
const EXIT = { duration: 0.3, ease: [0.23, 1, 0.32, 1] as const };
const FADE = { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const };

/**
 * A sticker image that pops in with a small springy overshoot and settles into its own tilt, only once it has actually
 * loaded (never an empty flash, cached images included). `out` plays the exit: it shrinks, tilts on and fades. Use
 * `delay` / `outDelay` to stagger a pile. Reduced motion: a plain fade at the final tilt, no scale or swing.
 */
export function StickerPop({ src, rotate = 0, delay = 0, out = false, outDelay = 0, alt = "", className, onLoad, ...rest }: StickerPopProps) {
  const reduce = useReducedMotion();
  const [loaded, setLoaded] = useState<string | null>(null);
  const ready = loaded === src;
  // a cached image can finish before React attaches onLoad
  const check = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth) setLoaded(src);
  }, [src]);

  const hidden = { opacity: 0, scale: 0.85, rotate: rotate - 10 };
  const shown = { opacity: 1, scale: 1, rotate };
  const gone = reduce ? { opacity: 0, scale: 1, rotate } : { opacity: 0, scale: 0.8, rotate: rotate + 10 };
  const transition = reduce
    ? { ...FADE, delay: out ? outDelay : delay, scale: { duration: 0 }, rotate: { duration: 0 } }
    : { ...(out ? EXIT : POP), delay: out ? outDelay : delay };

  return (
    <motion.img
      ref={check}
      src={src}
      alt={alt}
      decoding="async"
      onLoad={(e) => {
        setLoaded(src);
        onLoad?.(e);
      }}
      initial={hidden}
      animate={out ? gone : ready ? shown : hidden}
      transition={transition}
      className={cn("select-none", className)}
      {...rest}
    />
  );
}
