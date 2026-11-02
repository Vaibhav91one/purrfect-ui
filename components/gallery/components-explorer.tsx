"use client";

import { COMPONENTS } from "@/lib/components-data";
import { ScrollReveal } from "@/registry/scroll-reveal/scroll-reveal";
import { sectionBaseClasses } from "@/lib/layout-classes";
import { LiveCard } from "./component-card";
import { SleepingCat } from "./sleeping-cat";
import { SheetHost } from "./use-sheet";

/** /components and /components/category/<name>: a hero and a grid. Click a card to open its dialog. */
export function ComponentsExplorer({ category }: { category?: string }) {
  const items = category ? COMPONENTS.filter((c) => c.category === category) : COMPONENTS;
  return (
    <section className={`${sectionBaseClasses} px-3 pb-24 md:px-0`}>
      <header className="flex min-h-[70svh] flex-col items-center justify-center pt-24 pb-12 text-center md:pt-32">
        <h1 className="pb-1 text-5xl font-light tracking-[-0.05em] sm:text-7xl lg:text-8xl">{category ? `${category} components` : "Components"}</h1>
        <div className="mt-8 grid h-24 place-items-center sm:h-32">
          <SleepingCat />
        </div>
        <div className="mt-6 max-w-[28ch] md:max-w-3xl">
          <ScrollReveal text="Every component is a single file. Open one to tweak it live, then install it with one command." className="text-xl font-light tracking-tight text-muted-foreground md:text-3xl" offset={["start 0.95", "start 0.55"]} />
        </div>
      </header>

      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {items.map((c) => (
          <LiveCard key={c.slug} item={c} />
        ))}
      </div>

      <SheetHost />
    </section>
  );
}
