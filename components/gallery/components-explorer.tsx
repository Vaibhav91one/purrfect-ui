"use client";

import Link from "next/link";
import { CATEGORIES, categorySlug, COMPONENTS } from "@/lib/components-data";
import { ScrollReveal } from "@/registry/scroll-reveal/scroll-reveal";
import { sectionBaseClasses } from "@/lib/layout-classes";
import { cardBase } from "./card";
import { CardFace } from "./component-card";
import { SleepingCat } from "./sleeping-cat";
import { openSheet, SheetHost } from "./use-sheet";

const chip = "rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** /components and /components/category/<name>: a hero, category links and a grid. Click a card to open its dialog. */
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
        <nav aria-label="Categories" className="mt-10 flex flex-wrap justify-center gap-2">
          <Link href="/components" aria-current={category ? undefined : "page"} className={chip}>
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/components/category/${categorySlug(c)}`} aria-current={c === category ? "page" : undefined} className={chip}>
              {c}
            </Link>
          ))}
        </nav>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <div
            key={c.slug}
            data-slug={c.slug}
            data-cuelume-open
            role="button"
            tabIndex={0}
            onClick={(e) => openSheet(c.slug, e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSheet(c.slug, e.currentTarget); }
            }}
            className={`${cardBase} cursor-pointer`}
          >
            <CardFace item={c} />
          </div>
        ))}
      </div>

      <SheetHost />
    </section>
  );
}
