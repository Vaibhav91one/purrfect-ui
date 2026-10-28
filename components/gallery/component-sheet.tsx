"use client";

import { BookOpen, Box, Check, Clapperboard, Code2, Link2, ClipboardCopy, Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSound } from "@/components/providers/sound-provider";
import { BASE, EASE } from "@/lib/motion";
import type { ComponentItem, Extra } from "@/lib/components-data";
import { SITE_URL } from "@/lib/site";
import { Button } from "@/registry/button/button";
import { buildPrompt } from "@/lib/component-prompt";
import { Code } from "./code";
import { CopyButton, useCopy } from "./copy-button";
import { DocSections } from "./doc-sections";
import { Segmented } from "./segmented";
import { Preview } from "./preview";
import { SiteClip } from "./site-clip";

const CURVE = `cubic-bezier(${EASE.join(",")})`;
const MORPH = 420;
// hides the card the dialog grew out of (a plain function, so it is not a prop mutation)
const hide = (el: HTMLElement | null, on: boolean) => {
  if (el) el.style.visibility = on ? "hidden" : "";
};
const rowLabel = "text-sm text-muted-foreground";
const iconBtn = "grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent";

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} data-cuelume-toggle className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${on ? "bg-foreground" : "bg-muted"} focus-visible:outline-2 focus-visible:outline-accent`}>
      <span className={`absolute top-1 left-1 size-5 rounded-full transition-transform duration-200 ease-snappy ${on ? "translate-x-5 bg-background" : "bg-muted-foreground"}`} />
    </button>
  );
}

function SpeedSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { play } = useSound();
  return (
    <label className="relative flex h-12 cursor-ew-resize items-center justify-between overflow-hidden rounded-xl bg-muted px-4 text-sm">
      <span className="absolute inset-y-0 left-0 bg-border" style={{ width: `${((value - 0.5) / 1.5) * 100}%` }} />
      <span className="relative text-muted-foreground">Speed</span>
      <span className="relative tabular-nums">{value.toFixed(1)}×</span>
      <input type="range" min={0.5} max={2} step={0.1} value={value} onChange={(e) => {
        onChange(+e.target.value);
        play("select", { emphasis: "subtle" }); // one tick per step, up or down
      }} aria-label="Speed" className="absolute inset-0 cursor-ew-resize opacity-0" />
    </label>
  );
}

function Controls({ extras, speed, setSpeed, opts, setOpt }: { extras: Extra[]; speed: number; setSpeed: (v: number) => void; opts: Record<string, string | boolean>; setOpt: (k: string, v: string | boolean) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <SpeedSlider value={speed} onChange={setSpeed} />
      {extras.map((x) => (
        <div key={x.key} className="flex items-center justify-between">
          <span className={rowLabel}>{x.label}</span>
          {x.kind === "switch" ? <Switch on={!!opts[x.key]} onChange={(v) => setOpt(x.key, v)} label={x.label} /> : <Segmented options={x.options} value={String(opts[x.key])} onChange={(v) => setOpt(x.key, v)} />}
        </div>
      ))}
    </div>
  );
}

/** The published source of a component (public/r/<slug>.json, built by `pnpm registry:build`). */
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
  return (
    <>
      <pre className="absolute inset-0 overflow-y-auto overscroll-contain p-6 pt-20 pr-16 text-xs leading-relaxed">
        {typeof code === "string" ? <Code code={code} /> : <span className="font-mono text-muted-foreground">{code === undefined ? "Loading…" : "The source isn't published yet."}</span>}
      </pre>
      {typeof code === "string" && <CopyButton text={code} label="Copy source" className="absolute top-16 right-4" />}
    </>
  );
}

/** The dialog's Usage tab. */
function Usage({ slug, install, published }: { slug: string; install: string; published: boolean }) {
  return (
    <div className="absolute inset-0 overflow-auto overscroll-contain p-6 pt-20">
      <DocSections slug={slug} install={install} published={published} />
    </div>
  );
}

/**
 * The component's dialog. A native <dialog> gives the focus trap, Esc, inert page and focus return. The preview panel
 * grows out of the card you clicked (FLIP) and shrinks back into it on close; the page behind is locked, so nothing scrolls.
 */
export function ComponentSheet({ item, origin, onClose }: { item: ComponentItem; origin: HTMLElement | null; onClose: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const { enabled, toggle, play } = useSound();
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<"preview" | "code" | "usage" | "wild">("preview");
  const [pick, setPick] = useState<boolean | null>(null); // the person's Pause/Play choice; until then the loop follows the live reduced-motion preference
  const playing = pick ?? !reduce;
  const [speed, setSpeed] = useState(1);
  const [run, setRun] = useState(0); // Replay bumps it, which remounts the preview or restarts the clip
  // the loop yields while the person is hovering or focused in the preview, and picks up again 2s after they leave
  const [engaged, setEngaged] = useState(false);
  const resume = useRef<ReturnType<typeof setTimeout>>(undefined);
  const engage = () => { clearTimeout(resume.current); setEngaged(true); };
  const release = () => { clearTimeout(resume.current); resume.current = setTimeout(() => setEngaged(false), 2000); };
  useEffect(() => () => clearTimeout(resume.current), []);
  const extras = item.extras ?? [];
  const [opts, setOpts] = useState<Record<string, string | boolean>>(() => Object.fromEntries(extras.map((x) => [x.key, x.default])));
  const share = useCopy(`${SITE_URL}/components/${item.slug}`);
  const install = useCopy(item.install);
  const prompt = useCopy(buildPrompt(item), `Setup prompt for ${item.name}`);

  const panels = () => {
    const d = dialog.current!;
    return { prev: d.querySelector<HTMLElement>("[data-sheet-preview]")!, rest: [...d.querySelectorAll<HTMLElement>("[data-sheet-info]")] };
  };
  // a transform that makes the preview panel cover `card`: one uniform scale (never a stretch) and a crop to the card's shape, so
  // what is inside keeps its proportions the whole way
  const fit = (prev: HTMLElement, card: DOMRect) => {
    const to = prev.getBoundingClientRect();
    const k = Math.max(card.width / to.width, card.height / to.height);
    const cx = (to.width - card.width / k) / 2;
    const cy = (to.height - card.height / k) / 2;
    return {
      translate: `${card.left + card.width / 2 - (to.left + (to.width * k) / 2)}px ${card.top + card.height / 2 - (to.top + (to.height * k) / 2)}px`,
      scale: `${k} ${k}`,
      clipPath: `inset(${cy}px ${cx}px round ${24 / k}px)`,
    };
  };
  const OPEN = { translate: "0 0", scale: "1 1", clipPath: "inset(0px round 24px)" };

  useEffect(() => {
    const d = dialog.current!;
    document.documentElement.dataset.sheet = "";
    if (!d.open) d.showModal();
    d.focus(); // not the demo's first control, so no focus ring on open; Tab still reaches everything
    const { prev, rest } = panels();
    const opts = { duration: MORPH, easing: CURVE, fill: "backwards" as const };
    const anims: Animation[] = [];
    if (!reduce) {
      if (origin?.isConnected) {
        prev.style.transformOrigin = "0 0";
        anims.push(prev.animate([fit(prev, origin.getBoundingClientRect()), OPEN], opts));
        hide(origin, true);
      } else anims.push(prev.animate([{ opacity: 0, scale: "0.96" }, { opacity: 1, scale: "1" }], opts));
      rest.forEach((el) => anims.push(el.animate([{ opacity: 0, translate: "0 12px" }, { opacity: 1, translate: "0 0" }], { ...opts, delay: 90, duration: MORPH - 60 })));
    } else hide(origin, true);
    return () => {
      anims.forEach((a) => a.cancel());
      hide(origin, false);
      delete document.documentElement.dataset.sheet;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once when the dialog mounts
  }, []);

  const close = async () => {
    const d = dialog.current;
    if (!d || d.dataset.closing) return;
    d.dataset.closing = "";
    play("close"); // Esc, backdrop and the X all land here, once
    const { prev, rest } = panels();
    if (!reduce) {
      const o = { duration: MORPH - 80, easing: CURVE, fill: "forwards" as const };
      const card = origin?.isConnected ? origin.getBoundingClientRect() : null;
      const onScreen = card && card.bottom > 0 && card.top < innerHeight;
      // the preview morphs into its card; a clip, code or docs would be squashed by that (the panel and the card differ in shape), so they fade out over the card instead
      const morph = onScreen && tab === "preview";
      if (!morph) hide(origin, false);
      const run: Animation[] = rest.map((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { ...o, duration: BASE * 1000 }));
      run.push(morph ? prev.animate([OPEN, fit(prev, card)], o) : prev.animate([{ opacity: 1, scale: "1" }, { opacity: 0, scale: "0.97" }], o));
      await Promise.allSettled(run.map((a) => a.finished));
    }
    hide(origin, false);
    d.close();
  };

  return (
    <dialog
      ref={dialog}
      data-sheet
      tabIndex={-1}
      aria-label={item.name}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && close()}
      className="fixed inset-0 m-0 grid size-full outline-none max-h-none max-w-none place-items-center overflow-hidden bg-transparent p-4 text-foreground"
    >
      <div className="grid h-[min(640px,calc(100svh-4rem))] w-[min(1000px,calc(100vw-2rem))] grid-rows-[minmax(0,1fr)_auto] gap-3 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-1">
        <section data-sheet-preview className="relative min-h-0 overflow-hidden rounded-3xl bg-card">
          {tab === "preview" ? (
            <div data-hover-sound="off" className="absolute inset-0 max-lg:inset-y-16" onPointerEnter={engage} onPointerLeave={release} onFocus={engage} onBlur={release}>
              <Preview key={run} item={item} inert={false} max={1.4} playing={!item.replay && playing && !engaged} speed={speed} opts={opts} />
            </div>
          ) : tab === "wild" && item.clip ? (
            <div className="absolute inset-0 bg-card">
              <SiteClip key={run} slug={item.slug} playing={playing} speed={speed} className="absolute inset-0 size-full object-contain max-lg:top-16 max-lg:h-[calc(100%-8rem)]" />
              <a href={item.clip.href} target="_blank" rel="noreferrer noopener" className="absolute bottom-5 left-5 rounded-sm text-xs text-muted-foreground hover:text-foreground">
                From {item.clip.label} ↗
              </a>
            </div>
          ) : tab === "code" ? (
            <Source slug={item.slug} />
          ) : (
            <Usage slug={item.slug} install={item.install} published={item.published} />
          )}
          <div className="absolute inset-x-4 top-4 flex items-center justify-between">
            <div className="flex rounded-full bg-muted p-1" role="tablist" aria-label="View">
              {(
                [
                  ["preview", Box, "Preview"],
                  ["code", Code2, "Code"],
                  ["usage", BookOpen, "Usage"],
                  ...(item.clip ? ([["wild", Clapperboard, "In the wild"]] as const) : []),
                ] as const
              ).map(([id, Icon, name]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} aria-label={name} title={name} onClick={() => setTab(id)} data-cuelume-tap className={`grid size-9 place-items-center rounded-full transition-colors duration-200 focus-visible:-outline-offset-2 ${tab === id ? "bg-foreground text-background focus-visible:outline-background" : "text-muted-foreground hover:text-foreground"}`}>
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
            <button type="button" onClick={toggle} aria-label="Sound" aria-pressed={enabled} className={iconBtn}>
              {enabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            </button>
          </div>
          {item.replay ? (
            <button type="button" onClick={() => setRun((r) => r + 1)} aria-label="Replay" data-cuelume-tap className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-border focus-visible:outline-2 focus-visible:outline-accent">
              <RotateCcw className="size-4" />
            </button>
          ) : (
            <button type="button" onClick={() => setPick(!playing)} aria-label={playing ? "Pause loop" : "Play loop"} data-cuelume-toggle className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-border focus-visible:outline-2 focus-visible:outline-accent">
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
          )}
        </section>

        <aside data-sheet-info className="flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain rounded-3xl bg-card p-5 lg:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-light tracking-tight">{item.name}</h2>
            </div>
            <div className="-mt-1 -mr-2 flex shrink-0 items-center">
              <button type="button" onClick={share.copy} aria-label={share.done ? "Link copied" : "Copy link"} title="Copy link" className={iconBtn}>
                {share.done ? <Check className="size-5" /> : <Link2 className="size-5" />}
              </button>
              <button type="button" onClick={close} aria-label="Close" className={iconBtn}>
                <X className="size-5" />
              </button>
            </div>
          </div>
          <p className="line-clamp-4 text-muted-foreground">{item.description}</p>
          <Controls extras={extras} speed={speed} setSpeed={setSpeed} opts={opts} setOpt={(k, v) => setOpts((o) => ({ ...o, [k]: v }))} />
          <div className="mt-auto flex flex-col gap-2">
            {!item.published && <p className="text-center text-sm text-muted-foreground">Coming soon: install and setup prompt arrive when it ships.</p>}
            {item.published && <Button variant="ghost" onClick={prompt.copy} icon={prompt.done ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />} className="w-full">
              {prompt.done ? "Prompt copied" : "Copy prompt"}
            </Button>}
            {item.published && (
              <Button onClick={install.copy} className="w-full">
                {install.done ? "Copied" : "Copy install command"}
              </Button>
            )}
          </div>
        </aside>
      </div>
    </dialog>
  );
}
