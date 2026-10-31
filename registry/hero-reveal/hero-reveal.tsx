"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ImgHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const OUT = [0.22, 1, 0.36, 1] as const; // strong ease-out, shared by every move in the sequence

/**
 * Fades a block up out of a blur when it scrolls into view, once. Reduced motion: a plain fade.
 * The blur is animated through WAAPI by Motion, so it composites instead of repainting the text each frame.
 */
export function BlurReveal({ children, delay = 0, duration = 0.65, y = 18, blur = 10, once = true, appear = true }: { children: ReactNode; delay?: number; duration?: number; y?: number; blur?: number; once?: boolean; appear?: boolean }) {
  return (
    <motion.div
      // reduced motion drops the move and the blur in CSS, so the server HTML and the first client render agree
      className="motion-reduce:!transform-none motion-reduce:!filter-none"
      initial={appear ? { opacity: 0, transform: `translateY(${y}px)`, filter: `blur(${blur}px)` } : false}
      whileInView={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
      viewport={{ once, amount: 0.4 }}
      // check-ignore: duration a one-off entrance, seen once per page load
      transition={{ delay, duration, ease: OUT }}
    >
      {children}
    </motion.div>
  );
}

export interface HeroRevealProps extends Omit<ComponentProps<"section">, "title" | "children"> {
  /** Background photo. It fills the frame, with a 8px inset and rounded corners. */
  src: string;
  alt?: string;
  /** Extra attributes for the photo: `srcSet`, `sizes`, `width`/`height`. It is fetched with high priority (it is the LCP). */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;
  /** The headline. */
  title: ReactNode;
  /** The line under it. */
  description?: ReactNode;
  /** A button or link, popped in last with a spring. */
  action?: ReactNode;
  /** Play the entrance. `false` renders the finished hero straight from the server HTML (best LCP, no motion). */
  appear?: boolean;
  /** Classes for the section (height, max width, padding). */
  className?: string;
}

/**
 * A full-height hero: the photo frame opens from the middle along the y-axis, then the headline and the line under it
 * fade up out of a blur, and the action springs in last. Everything plays once, when the hero first scrolls into view.
 * The text is white over a darkened photo, so it reads in light and dark themes alike.
 * Reduced motion: the frame and text fade in, nothing moves, and the action appears without the spring.
 */
export function HeroReveal({ src, alt = "", imgProps, title, description, action, appear = true, className, ...rest }: HeroRevealProps) {
  const reduce = useReducedMotion();
  return (
    <section className={cn("relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-12", className)} {...rest}>
      <div aria-hidden={alt === ""} className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="h-full w-full origin-center motion-reduce:!transform-none"
          // scaleY from 0 is this hero's signature opening, not a pop-in: the photo unfolds from a line. Reduced motion keeps only
          // the fade (transform-none in CSS), so the server HTML and the first client render agree
          initial={appear ? { opacity: 0, transform: "scaleY(0)" } : false}
          whileInView={{ opacity: 1, transform: "scaleY(1)" }}
          viewport={{ once: true, amount: 0.5 }}
          // check-ignore: duration a one-off entrance, seen once per page load
          transition={{ duration: 0.9, ease: OUT }}
        >
          {/* a dark frame behind the photo: if it fails to load, the white text still has something to sit on. check-ignore: hardcoded-color it sits under a photo, not the theme */}
          <div className="absolute inset-x-2 inset-y-2 rounded-[2rem] bg-neutral-900" />
          {/* eslint-disable-next-line @next/next/no-img-element -- a registry file cannot assume next/image */}
          <img src={src} alt={alt} fetchPriority="high" {...imgProps} className={cn("h-full w-full rounded-[2rem] object-cover p-2", imgProps?.className)} />
          {/* check-ignore: hardcoded-color a scrim darkens the photo for the white text in either theme */}
          <div className="absolute inset-x-2 inset-y-2 rounded-[2rem] bg-black/10" />
        </motion.div>
      </div>
      <div className="z-10 flex max-w-5xl flex-col items-center justify-center gap-6 px-4 pb-19 text-center sm:px-6 md:pb-0">
        {title && (
          <BlurReveal appear={appear}>
            {/* check-ignore: hardcoded-color white over the darkened photo, in either theme */}
            <h1 className="max-w-4xl text-4xl leading-[1.1] font-medium tracking-tight text-balance text-white sm:text-5xl lg:text-6xl xl:text-7xl">{title}</h1>
          </BlurReveal>
        )}
        {description && (
          <BlurReveal appear={appear} delay={0.12}>
            {/* check-ignore: hardcoded-color white over the darkened photo, in either theme */}
            <p className="max-w-2xl text-sm leading-tight font-medium tracking-tight text-white sm:text-base">{description}</p>
          </BlurReveal>
        )}
        {action && (
          <motion.div
            className="mt-2 flex flex-wrap items-center justify-center gap-3 motion-reduce:!transform-none"
            initial={appear ? { opacity: 0, transform: "scale(0.72) translateY(20px)" } : false}
            whileInView={{ opacity: 1, transform: "scale(1) translateY(0px)" }}
            viewport={{ once: true, amount: 0.8 }}
            // check-ignore: duration a spring settles on its own time; it is the last beat of a one-off entrance
            transition={reduce ? { duration: 0.2, delay: 0.2 } : { delay: 1.28, type: "spring", stiffness: 240, damping: 18, mass: 0.72 }}
          >
            {action}
          </motion.div>
        )}
      </div>
    </section>
  );
}
