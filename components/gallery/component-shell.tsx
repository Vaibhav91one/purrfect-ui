"use client";

import { ClipboardCopy, Check, Clapperboard, Code2, Maximize2, PanelLeft, RotateCcw, Box } from "lucide-react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/notch/theme-toggle";
import type { ComponentItem } from "@/lib/components-data";
import { Code } from "./code";
import { CopyButton, useCopy } from "./copy-button";
import { Preview } from "./preview";
import { SiteClip } from "./site-clip";

export type NavItem = { slug: string; name: string; category: string; published: boolean };

const tool = "grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent";

/** The published source (public/r/<slug>.json, built by `pnpm registry:build`). */
function Source({ slug }: { slug: string }) {
  const [code, setCode] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    fetch(`/r/${slug}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => live && setCode(j?.files?.[0]?.content ?? null))
      .catch(() => live && setCode(null));
    return () => void (live = false);
  }, [slug]);
  if (typeof code !== "string") return <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">{code === undefined ? "Loading…" : "The source isn't published yet."}</p>;
  return (
    <div className="relative rounded-xl bg-muted">
      <pre className="max-h-[32rem] overflow-auto p-4 pr-12 text-xs leading-relaxed">
        <Code code={code} />
      </pre>
      <CopyButton text={code} label="Copy source" className="absolute top-2 right-2" />
    </div>
  );
}

/**
 * A component's own page, laid out as a playground: the component list on the left, the live component on a large
 * canvas with a floating toolbar, and the docs in a column beside it (under it on a narrow screen). `children` is the docs.
 */
export function ComponentShell({ item, list, children }: { item: ComponentItem; list: NavItem[]; children: ReactNode }) {
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLDivElement>(null);
  const [nav, setNav] = useState(true); // the list is open by default on a wide screen; below lg it is a sheet and starts shut
  const [sheet, setSheet] = useState(false);
  const [view, setView] = useState<"live" | "wild">("live");
  const [run, setRun] = useState(0); // Replay remounts the entrance
  const install = useCopy(item.install);
  const opts = Object.fromEntries((item.extras ?? []).map((x) => [x.key, x.default]));
  const groups = [...new Set(list.map((c) => c.category))];

  const list_ = (
    <nav aria-label="Components" className="flex flex-col gap-6 pb-8">
      {groups.map((g) => (
        <div key={g}>
          <p className="mb-1.5 px-3 text-xs tracking-wider text-muted-foreground uppercase">{g}</p>
          <ul className="flex flex-col">
            {list.filter((c) => c.category === g).map((c) => (
              <li key={c.slug}>
                <Link href={`/components/${c.slug}`} aria-current={c.slug === item.slug ? "page" : undefined} onClick={() => setSheet(false)} className={`flex min-h-9 items-center justify-between gap-2 rounded-lg px-3 text-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent ${c.slug === item.slug ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                  {c.name}
                  {!c.published && <span className="text-xs opacity-60">soon</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const head = (
    <div className="flex items-center gap-3 px-1 pb-4">
      <button type="button" aria-label="Components" aria-expanded={nav} onClick={() => (matchMedia("(min-width: 1024px)").matches ? setNav((v) => !v) : setSheet((v) => !v))} className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent">
        <PanelLeft className="size-5" />
      </button>
      <p className="flex items-center gap-2 text-lg whitespace-nowrap">
        <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">purrfect ui</Link>
        <span aria-hidden className="text-muted-foreground">/</span>
        <Link href="/components" className="transition-colors hover:text-muted-foreground">Components</Link>
      </p>
    </div>
  );

  return (
    <div className="flex min-h-svh flex-col gap-3 p-3 lg:h-svh lg:flex-row lg:overflow-hidden">
      {/* wide: a column that collapses; narrow: a sheet over the page */}
      <aside className={`hidden min-h-0 w-64 shrink-0 flex-col lg:flex ${nav ? "" : "lg:hidden"}`}>
        {head}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">{list_}</div>
      </aside>
      <div className="lg:hidden">{head}</div>
      {sheet && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal aria-label="Components">
          <button type="button" aria-label="Close" onClick={() => setSheet(false)} className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto overscroll-contain bg-background p-3">{head}{list_}</div>
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row">
        <section ref={canvas} aria-label="Preview" className="relative h-[60svh] min-h-80 min-w-0 flex-1 overflow-hidden rounded-3xl bg-muted lg:h-auto">
          {view === "wild" && item.clip ? (
            <SiteClip key={run} slug={item.slug} className="absolute inset-0 size-full object-contain" />
          ) : (
            <div className="absolute inset-0 max-lg:inset-y-16">
              <Preview key={run} item={item} inert={false} max={1.4} playing={!item.replay && !reduce} opts={opts} />
            </div>
          )}
          <div className="absolute top-3 right-3 z-10 flex items-center rounded-full bg-background p-1 shadow-sm">
            {item.published ? (
              <button type="button" onClick={install.copy} className="flex h-11 items-center gap-2 rounded-full px-4 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-accent">
                {install.done ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />}Install
              </button>
            ) : (
              <span className="px-4 text-sm text-muted-foreground">Coming soon</span>
            )}
            {item.clip && (
              <button type="button" aria-label={view === "live" ? "Show it on the real site" : "Show the live component"} aria-pressed={view === "wild"} title={view === "live" ? "In the wild" : "Live"} onClick={() => setView((v) => (v === "live" ? "wild" : "live"))} className={tool}>
                {view === "live" ? <Clapperboard className="size-5" /> : <Box className="size-5" />}
              </button>
            )}
            <button type="button" aria-label="Fullscreen" title="Fullscreen" onClick={() => void canvas.current?.requestFullscreen?.().catch(() => {})} className={tool}>
              <Maximize2 className="size-5" />
            </button>
            <a href="#source" aria-label="Source code" title="Source code" className={tool}>
              <Code2 className="size-5" />
            </a>
            <ThemeToggle />
          </div>
          {item.replay && view === "live" && (
            <button type="button" onClick={() => setRun((r) => r + 1)} aria-label="Replay" data-cuelume-tap className="absolute right-4 bottom-4 z-10 grid size-11 place-items-center rounded-full bg-background text-foreground shadow-sm transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-accent">
              <RotateCcw className="size-4" />
            </button>
          )}
        </section>

        <article className="no-scrollbar min-w-0 overflow-y-auto overscroll-contain rounded-3xl bg-card p-6 lg:w-[26rem] lg:shrink-0 xl:w-[30rem] xl:p-8">
          <header className="mb-8 flex flex-col gap-3">
            <h1 className="text-4xl font-light tracking-[-0.04em]">{item.name}</h1>
            <p className="text-muted-foreground">{item.description}</p>
          </header>
          <div className="flex flex-col gap-8">
            {children}
            <section id="source" className="scroll-mt-4">
              <h2 className="mb-3 text-base font-medium tracking-tight">Source code</h2>
              <Source slug={item.slug} />
            </section>
            {item.clip && (
              <section>
                <h2 className="mb-3 text-base font-medium tracking-tight">Credits</h2>
                <p className="text-sm text-muted-foreground">
                  Ported from{" "}
                  <a href={item.clip.href} target="_blank" rel="noreferrer noopener" className="text-foreground hover:underline">
                    {item.clip.label}
                  </a>
                  .
                </p>
              </section>
            )}
            <section>
              <h2 className="mb-3 text-base font-medium tracking-tight">License</h2>
              <p className="text-sm text-muted-foreground">MIT. Copy it into your project and change it as you like.</p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
