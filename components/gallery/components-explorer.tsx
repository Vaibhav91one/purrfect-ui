"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useDeferredValue, useMemo } from "react";
import { COMPONENTS } from "@/lib/components-data";
import { EASE, FAST, SPRING } from "@/lib/motion";
import { ScrollReveal } from "@/registry/scroll-reveal/scroll-reveal";
import { sectionBaseClasses } from "@/lib/layout-classes";
import { LiveCard } from "./component-card";
import { SleepingCat } from "./sleeping-cat";
import { SheetHost, useCategoryFilter } from "./use-sheet";

/**
 * /components and /components/category/<name>: a hero and a grid. Click a card to open its dialog. On /components the
 * notch search's category chips (`?cat=`) filter the grid in place: cards slide to their new spots, the rest pop out.
 */
export function ComponentsExplorer({ category }: { category?: string }) {
  // deferred and memoised: re-rendering a grid of live cards is heavy, and the notch's own animation must get its frames
  // first (the urgent render bails out here; the grid catches up in a background render)
  const active = useDeferredValue(useCategoryFilter()[0]);
  const reduce = useReducedMotion();
  return useMemo(() => <Explorer active={active} category={category} reduce={!!reduce} />, [active, category, reduce]);
}

function Explorer({ active, category, reduce }: { active: string[]; category?: string; reduce: boolean }) {
  const items = category ? COMPONENTS.filter((c) => c.category === category) : active.length ? COMPONENTS.filter((c) => active.includes(c.category)) : COMPONENTS;
  // reduced motion: no sliding, a quick fade only (props, not markup, so the server HTML is the same)
  const pop = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 };
  return (
    <section className={`${sectionBaseClasses} px-3 pb-24 md:px-0`}>
      <header className="flex min-h-[70svh] flex-col items-center justify-center pt-24 pb-12 text-center md:pt-32">
        <h1 className="pb-1 text-5xl font-light tracking-[-0.05em] sm:text-7xl lg:text-8xl">{category ? `${category} components` : "Components"}</h1>
        <div className="mt-8 grid h-24 place-items-center sm:h-32">
          <SleepingCat purrOnClick />
        </div>
        <div className="mt-6 max-w-[28ch] md:max-w-3xl">
          <ScrollReveal text="Every component is a single file. Open one to tweak it live, then install it with one command." className="text-xl font-light tracking-tight text-muted-foreground md:text-3xl" offset={["start 0.95", "start 0.55"]} />
        </div>
      </header>

      <div className="relative columns-1 gap-3 sm:columns-2 lg:columns-3">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((c) => (
            <motion.div
              key={c.slug}
              layout={!reduce}
              initial={pop}
              animate={{ opacity: 1, scale: 1 }}
              exit={pop}
              transition={{ layout: SPRING, default: { duration: FAST, ease: EASE } }}
              className="break-inside-avoid"
            >
              <LiveCard item={c} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <SheetHost />
    </section>
  );
}
