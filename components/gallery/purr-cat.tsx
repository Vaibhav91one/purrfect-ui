"use client";

import { useEffect, useRef, useState } from "react";
import { GradientCat } from "./gradient-cat";
import { MotionLines } from "./motion-lines";

const PURR_MS = 2600;

/**
 * The gradient cat as a button: click to pet it and comic-style motion lines pulse around it for a moment.
 * `lines` turns the lines on from outside (for example when the hero cat arrives). Sound is parked in lib/cat-sounds.ts.
 */
export function PurrCat({ className, outlineClass, variant, lines = false, onPurr }: { className?: string; outlineClass?: string; variant?: number; lines?: boolean; onPurr?: (on: boolean) => void }) {
  const [purring, setPurring] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = () => {
    clearTimeout(timer.current);
    setPurring(true);
    onPurr?.(true);
    timer.current = setTimeout(() => (setPurring(false), onPurr?.(false)), PURR_MS);
  };

  return (
    <button type="button" onClick={onClick} aria-label="Pet the cat" className="relative inline-grid cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
      <MotionLines active={purring || lines} />
      <GradientCat className={className} outlineClass={outlineClass} variant={variant} />
    </button>
  );
}
