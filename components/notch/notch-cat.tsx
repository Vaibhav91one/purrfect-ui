"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { VARIANTS } from "@/components/gallery/cat-variants";
import { GradientCat } from "@/components/gallery/gradient-cat";

const SPRING = { type: "spring", stiffness: 220, damping: 24 } as const;
const HIDDEN_Y = 52; // px: a full row (48) plus a little, so the head is fully below the notch's bottom edge

/**
 * The hero cat living in the notch. Its feet are the notch's bottom border: the wrapper clips everything below it, so
 * the cat can duck down out of sight and pop back up. It starts hidden, rises on load, and ducks for a moment every
 * so often (never while it is purring), and each time it comes back it has a different gradient and eye. The clip-path cuts only the bottom edge, so the purr rings can spread sideways
 * and up (the notch itself clips them).
 */
export function NotchCat() {
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState(true);
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let t = setTimeout(() => setHidden(false), 400);
    const cycle = () => {
      t = setTimeout(() => {
        setHidden(true);
        // swap the look while it is out of sight, so it comes back as a different cat
        setVariant((v) => (v + 1 + Math.floor(Math.random() * (VARIANTS.length - 1))) % VARIANTS.length);
        t = setTimeout(() => (setHidden(false), cycle()), 2500);
      }, 12000 + Math.random() * 8000);
    };
    cycle();
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <div data-notch-cat data-variant={variant} className="absolute bottom-0 left-3.5 h-12 w-12 [clip-path:inset(-200px_-200px_0_-200px)]">
      <motion.div initial={false} animate={{ y: hidden && !reduce ? HIDDEN_Y : 0 }} transition={SPRING} className="absolute top-0 -left-2">
        <GradientCat className="h-[88px]" outlineClass="text-white" variant={variant} />
      </motion.div>
    </div>
  );
}
