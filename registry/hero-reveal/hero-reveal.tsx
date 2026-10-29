"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const OUT = [0.22, 1, 0.36, 1] as const; // strong ease-out, shared by every move in the sequence

/**
 * Fades a block up out of a blur when it scrolls into view, once. Reduced motion: a plain fade.
 */
export function BlurReveal({ children, delay = 0, duration = 0.65, y = 18, blur = 10, once = true }: { children: ReactNode; delay?: number; duration?: number; y?: number; blur?: number; once?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, transform: `translateY(${reduce ? 0 : y}px)`, filter: `blur(${reduce ? 0 : blur}px)` }}
      whileInView={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
      viewport={{ once, amount: 0.4 }}
      // check-ignore: duration a one-off entrance, seen once per page load
      transition={{ delay, duration, ease: OUT }}
    >
      {children}
    </motion.div>
  );
}

export interface HeroRevealProps {
  /** Background photo. It fills the frame, with a 8px inset and rounded corners. */
  src: string;
  alt?: string;
  /** The headline. */
  title: ReactNode;
  /** The line under it. */
  description?: ReactNode;
  /** A button or link, popped in last with a spring. */
  action?: ReactNode;
  /** Classes for the section (height, max width). */
  className?: string;
}

/**
 * A full-height hero: the photo frame opens from the middle along the y-axis, then the headline and the line under it
 * fade up out of a blur, and the action springs in last. Everything plays once, when the hero first scrolls into view.
 * Reduced motion: the frame and text fade in, nothing moves, and the action appears without the spring.
 */
export function HeroReveal({ src, alt = "", title, description, action, className = "" }: HeroRevealProps) {
  const reduce = useReducedMotion();
  return (
    <section className={`relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-12 ${className}`}>
      <div aria-hidden={alt === ""} className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="h-full w-full origin-center"
          // scaleY from 0 is this hero's signature opening, not a pop-in: the photo unfolds from a line
          initial={reduce ? { opacity: 0 } : { transform: "scaleY(0)" }}
          whileInView={reduce ? { opacity: 1, transform: "scaleY(1)" } : { transform: "scaleY(1)" }} // reduced motion still names the resting transform: the hook settles after the first render
          viewport={{ once: true, amount: 0.5 }}
          // check-ignore: duration a one-off entrance, seen once per page load
          transition={{ duration: 0.9, ease: OUT }}
        >
          {/* a dark frame behind the photo: if it fails to load, the white text still has something to sit on */}
          <div className="absolute inset-x-2 inset-y-2 rounded-[2rem] bg-neutral-900" />
          {/* eslint-disable-next-line @next/next/no-img-element -- a registry file cannot assume next/image */}
          <img src={src} alt={alt} className="h-full w-full rounded-[2rem] object-cover p-2" />
          <div className="absolute inset-x-2 inset-y-2 rounded-[2rem] bg-black/10" />
        </motion.div>
      </div>
      <div className="z-10 flex max-w-5xl flex-col items-center justify-center gap-6 px-4 pb-19 text-center sm:px-6 md:pb-0">
        {title && (
          <BlurReveal>
            <h1 className="max-w-4xl text-4xl leading-[1.1] font-medium tracking-tight text-balance text-white sm:text-5xl lg:text-6xl xl:text-7xl">{title}</h1>
          </BlurReveal>
        )}
        {description && (
          <BlurReveal delay={0.12}>
            <p className="max-w-2xl text-sm leading-tight font-medium tracking-tight text-white sm:text-base">{description}</p>
          </BlurReveal>
        )}
        {action && (
          <motion.div
            className="mt-2 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, transform: reduce ? "scale(1) translateY(0px)" : "scale(0.72) translateY(20px)" }}
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
