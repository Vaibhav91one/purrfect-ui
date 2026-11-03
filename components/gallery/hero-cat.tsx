"use client";

import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { PurrCat } from "./purr-cat";
import { WalkingCat } from "./walking-cat";

/**
 * The hero cat: it walks in from off the left edge of the viewport, stops in the middle, sits down (the sitting cat
 * takes over), and from then on is the clickable PurrCat. Under reduced motion it is
 * just sitting there.
 */
export function HeroCat() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  const arrive = () => setDone(true);

  return (
    <div className="relative mt-10 mb-6 grid h-44 place-items-center sm:h-56">
      {reduce || done ? (
        <div className={reduce ? undefined : "cat-sit"}>
          <PurrCat />
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <WalkingCat onArrive={arrive} />
        </div>
      )}
    </div>
  );
}
