"use client"; // check-ignore: use-client-unneeded the variants are functions (custom), which cannot cross from a server component

import { motion, type Variants } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SpringChip = {
  label: ReactNode;
  /** An icon for the tile on the chip's left (a lucide icon, an svg). */
  icon?: ReactNode;
  /** A CSS background for the icon tile, e.g. a linear-gradient. */
  iconBackground?: string;
  /** Where the chip sits: absolute position classes such as "-left-6 top-1/3". */
  className?: string;
};

export interface SpringChipsProps extends Omit<ComponentProps<"div">, "ref" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  chips: SpringChip[];
  /** Seconds between one chip popping in and the next. */
  stagger?: number;
  /** Classes for every chip. */
  chipClassName?: string;
}

const chip: Variants = {
  hidden: { opacity: 0, scale: 0.82, y: 22 },
  shown: (delay: number) => ({ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 18, mass: 0.7, delay } }),
};

/**
 * Pill labels with an icon tile that spring in around something (a phone, a photo) when the group scrolls into view,
 * one after another: up from a little below, from 82% scale. Children are the centrepiece; each chip is absolutely
 * placed by its own `className`. It plays once. Reduced motion: the chips are already in place and only fade in.
 */
export function SpringChips({ chips, stagger = 0.08, chipClassName, className, children, ...rest }: SpringChipsProps) {
  return (
    <motion.div initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.45 }} className={cn("relative", className)} {...rest}>
      {children}
      {chips.map((c, i) => (
        <motion.div
          key={i}
          custom={i * stagger}
          variants={chip}
          className={cn(
            "absolute z-20 flex max-w-64 items-center gap-2 rounded-full border border-border bg-card py-1.5 pr-4 pl-1.5 text-sm font-medium text-card-foreground shadow-lg motion-reduce:![transform:none]",
            !c.icon && "pl-4",
            chipClassName,
            c.className,
          )}
        >
          {c.icon != null && (
            <span
              style={{ background: c.iconBackground }}
              className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg [&_svg]:size-4"
            >
              {c.icon}
            </span>
          )}
          <span className="min-w-0 break-words">{c.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}
