"use client";

import { useState } from "react";
import { useSound } from "@/components/providers/sound-provider";
import { GradientCat } from "./gradient-cat";

const PURR_MS = 1600;

/** The gradient cat as a button: click to pet it, and it blinks slowly at you and purrs softly. */
export function PurrCat({ className, outlineClass, variant }: { className?: string; outlineClass?: string; variant?: number }) {
  const [blink, setBlink] = useState(0);
  const { purr } = useSound();

  const onClick = () => {
    setBlink((b) => b + 1);
    purr(PURR_MS);
  };

  return (
    <button type="button" onClick={onClick} aria-label="Pet the cat" data-hover-sound="off" className="relative inline-grid cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
      <GradientCat className={className} outlineClass={outlineClass} variant={variant} blink={blink} />
    </button>
  );
}
