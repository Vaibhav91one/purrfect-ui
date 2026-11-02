"use client";

import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, type ComponentProps, type CSSProperties, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface ParallaxPhotoProps extends Omit<ComponentProps<"div">, "children"> {
  src: string;
  /** Describe the photo, or "" when it is decoration. */
  alt: string;
  /** The frame's aspect ratio (CSS `aspect-ratio`). A height or min-height in `className` wins over it. */
  aspect?: CSSProperties["aspectRatio"];
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
}

/**
 * A full-bleed photo the page scrolls over (after Mapinly's event cover). The frame scrolls with the page while the photo
 * inside slides the other way, from -100% of its height as the frame enters at the bottom to +100% as it leaves at the
 * top, linear, so the picture stays nearly still and the frame acts as a moving window onto it. The photo starts in
 * place (server HTML and first render), and only takes its scroll position once scrolling is measured, so a photo at the
 * top of the page never flashes empty before hydration. Reduced motion: the photo sits still in its frame (CSS, so the
 * server HTML and first client render agree).
 */
export function ParallaxPhoto({ src, alt, aspect = "16 / 10", container, className, style, ...rest }: ParallaxPhotoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"], container });
  const y = useMotionValue("0%");
  // read through a ref set after hydration, so the first render never branches on it; "0%" also stops the per-frame writes
  const reduce = useReducedMotion();
  const off = useRef(false);
  useEffect(() => {
    off.current = !!reduce;
    if (reduce) y.set("0%");
  }, [reduce, y]);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!off.current) y.set(`${p * 200 - 100}%`);
  });
  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden", className)} style={{ aspectRatio: aspect, ...style }} {...rest}>
      <motion.div style={{ y }} className="absolute inset-0 will-change-transform motion-reduce:!transform-none motion-reduce:will-change-auto">
        {/* eslint-disable-next-line @next/next/no-img-element -- a registry file cannot assume next/image */}
        <img src={src} alt={alt} decoding="async" className="size-full object-cover" />
      </motion.div>
    </div>
  );
}
