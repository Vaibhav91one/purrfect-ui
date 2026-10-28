"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { COMPONENTS as ALL } from "@/lib/components-data";

const COMPONENTS = ALL.filter((c) => c.published); // an unpublished install command would 404
import { useCopy } from "./copy-button";
import { ReelText } from "./reel-text";

const EVERY_MS = 3600; // longer than one reel spin, so it rests a moment between changes

/**
 * Install command pill that cycles through every component with a character-reel effect. The whole pill is the copy
 * button. Hover or focus pauses the cycle so the click lands on the command you read.
 */
export function RotatingInstall() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const { install } = COMPONENTS[i];
  const { done, copy } = useCopy(install);
  const hold = paused || done;
  useEffect(() => {
    if (hold) return;
    const t = setInterval(() => setI((n) => (n + 1) % COMPONENTS.length), EVERY_MS);
    return () => clearInterval(t);
  }, [hold]);
  return (
    <button
      type="button"
      onClick={copy}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label={done ? "Copied" : `Copy install command: ${install}`}
      className="flex h-12 w-full max-w-full cursor-pointer items-center gap-3 rounded-full bg-muted pr-4 pl-5 text-left transition-[background-color,scale] duration-150 ease-out active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <ReelText text={install} className="min-w-0 flex-1 font-mono text-[12.5px] [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)]" />
      <span className="relative grid size-4 shrink-0 place-items-center text-muted-foreground">
        <AnimatePresence initial={false} mode="wait">
          <motion.span key={done ? "done" : "copy"} initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={reduce ? undefined : { scale: 0.6, opacity: 0 }} transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }} className="grid place-items-center">
            {done ? <Check className="size-4" /> : <Copy className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
