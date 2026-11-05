"use client";

import { BookOpen, Box, Clapperboard, Code2, X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSound } from "@/components/providers/sound-provider";
import { BASE, EASE } from "@/lib/motion";
import type { ComponentItem, Extra } from "@/lib/components-data";
import { SITE_URL } from "@/lib/site";
import { buildPrompt } from "@/lib/component-prompt";
import { Code } from "./code";
import { CopyButton, useCopy } from "./copy-button";
import { DocSections } from "./doc-sections";
import { Segmented } from "./segmented";
import { Preview } from "./preview";
import { PixelWave } from "@/registry/pixel-wave/pixel-wave";
import { SheetNotch } from "./sheet-notch";
import { SiteClip } from "./site-clip";

const CURVE = `cubic-bezier(${EASE.join(",")})`;
const MORPH = 420;
const rowLabel = "text-sm text-muted-foreground";

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} data-cuelume-toggle className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${on ? "bg-foreground" : "bg-muted"} focus-visible:outline-2 focus-visible:outline-accent`}>
      <span className={`absolute top-1 left-1 size-5 rounded-full transition-transform duration-200 ease-snappy ${on ? "translate-x-5 bg-background" : "bg-muted-foreground"}`} />
    </button>
  );
}

function Controls({ extras, opts, setOpt }: { extras: Extra[]; opts: Record<string, string | boolean>; setOpt: (k: string, v: string | boolean) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {extras.map((x) => (
        <div key={x.key} className="flex items-center gap-3">
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
      {code === undefined ? (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground">
          <PixelWave size={10} gap={3} aria-label="Loading the source" />
        </div>
      ) : (
        <pre className="absolute inset-0 overflow-y-auto overscroll-contain pl-6 pr-16 pt-20 pb-24 text-xs leading-relaxed">
          {typeof code === "string" ? <Code code={code} /> : <span className="font-mono text-muted-foreground">The source isn&apos;t published yet.</span>}
        </pre>
      )}
      {typeof code === "string" && <CopyButton text={code} label="Copy source" className="absolute top-20 right-6" />}
    </>
  );
}

/** The dialog's Usage tab. */
function Usage({ slug, install, published }: { slug: string; install: string; published: boolean }) {
  return (
    <div className="absolute inset-0 overflow-auto overscroll-contain px-6 pt-20 pb-24">
      <div className="mx-auto max-w-2xl">
        <DocSections slug={slug} install={install} published={published} />
      </div>
    </div>
  );
}

/**
 * The component's dialog. A native <dialog> gives the focus trap, Esc, inert page and focus return. It is a centred sheet; the
 * site notch (see `SheetNotch`) carries the component's name and Copy prompt above it. The page behind is locked, so nothing scrolls.
 */
export function ComponentSheet({ item, onClose }: { item: ComponentItem; onClose: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const { play } = useSound();
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<"preview" | "code" | "usage" | "wild">("preview");
  const [pick, setPick] = useState<boolean | null>(null); // the person's Pause/Play choice; until then the loop follows the live reduced-motion preference
  const playing = pick ?? !reduce;
  // Pause also freezes every CSS / Web Animation running inside the preview, so a demo that never reads `playing` (a marquee, a
  // card fan, a strip) stops too; Play lets just those carry on. A timer catches animations a demo starts while it is held.
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = stage.current;
    if (!root || pick !== false) return;
    const held = new Set<Animation>();
    const hold = () => root.getAnimations({ subtree: true }).forEach((a) => a.playState === "running" && (held.add(a), a.pause()));
    hold();
    const id = setInterval(hold, 200);
    return () => {
      clearInterval(id);
      held.forEach((a) => a.play());
    };
  }, [pick, tab]);
  // the loop yields while the person is hovering or focused in the preview, and picks up again 2s after they leave (not an
  // `ambient` loop: there is nothing to take over, and the dialog opens under the pointer, so it would read as stuck)
  const [engaged, setEngaged] = useState(false);
  const resume = useRef<ReturnType<typeof setTimeout>>(undefined);
  const opening = useRef(false);
  const engage = () => { if (opening.current) return; clearTimeout(resume.current); setEngaged(true); };
  const release = () => { if (opening.current) return; clearTimeout(resume.current); resume.current = setTimeout(() => setEngaged(false), 2000); };
  useEffect(() => () => clearTimeout(resume.current), []);
  // what is really moving: hovering the preview holds the loop (see `engaged`), and the button must say so
  const running = playing && (tab !== "preview" || item.ambient || !engaged);
  const extras = item.extras ?? [];
  const [opts, setOpts] = useState<Record<string, string | boolean>>(() => Object.fromEntries(extras.map((x) => [x.key, x.default])));
  const share = useCopy(`${SITE_URL}/components/${item.slug}`);
  const prompt = useCopy(buildPrompt(item), `Setup prompt for ${item.name}`);

  const [shown, setShown] = useState(false); // the notch's items swap (the page's slide out, ours slide in)

  useEffect(() => {
    const d = dialog.current!;
    document.documentElement.dataset.sheet = "";
    opening.current = true; // showModal() focuses the first focusable thing (a demo's scroll box): that is not the person engaging
    if (!d.open) d.showModal();
    d.focus(); // not the demo's first control, so no focus ring on open; Tab still reaches everything
    opening.current = false;
    const sheet = d.querySelector<HTMLElement>("[data-sheet-preview]")!;
    const o = { duration: MORPH, easing: CURVE, fill: "backwards" as const };
    const anim = sheet.animate(reduce ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, translate: "0 24px", scale: "0.97" }, { opacity: 1, translate: "0 0", scale: "1" }], o);
    const raf = requestAnimationFrame(() => setShown(true));
    return () => {
      anim.cancel();
      cancelAnimationFrame(raf);
      delete document.documentElement.dataset.sheet;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once when the dialog mounts
  }, []);

  const close = async () => {
    const d = dialog.current;
    if (!d || d.dataset.closing) return;
    d.dataset.closing = "";
    play("close"); // Esc, backdrop and the X all land here, once
    setShown(false); // the notch gives its items back as the sheet leaves
    const o = { duration: MORPH - 80, easing: CURVE, fill: "forwards" as const };
    const sheet = d.querySelector<HTMLElement>("[data-sheet-preview]")!;
    const out = sheet.animate(reduce ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 1, translate: "0 0", scale: "1" }, { opacity: 0, translate: "0 24px", scale: "0.97" }], reduce ? { ...o, duration: BASE * 1000 } : o);
    await out.finished.catch(() => {});
    d.close();
  };

  const views = [
    ["preview", Box, "Preview"],
    ...(item.clip ? ([["wild", Clapperboard, "In the wild"]] as const) : []),
    ["code", Code2, "Code"],
    ["usage", BookOpen, "Usage"],
  ] as const;

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
      className="fixed inset-0 m-0 grid size-full max-h-none max-w-none place-items-center overflow-hidden bg-transparent p-4 pt-[max(5rem,calc(env(safe-area-inset-top)+4.5rem))] pb-[max(1rem,env(safe-area-inset-bottom))] text-foreground outline-none"
    >
      <section data-sheet-preview className="relative flex h-[min(620px,calc(100svh-6rem))] w-[min(880px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-card">
        <button type="button" onClick={close} aria-label="Close" className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:text-foreground active:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-accent">
          <X className="size-5" />
        </button>
        {/* Code and Usage scroll under the close button: let them fade out there */}
        {(tab === "code" || tab === "usage") && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-16 bg-linear-to-b from-card via-card/80 to-transparent" />}
        <div className="relative min-h-0 flex-1">
          {tab === "preview" ? (
            <div ref={stage} data-hover-sound="off" className="absolute inset-x-6 inset-y-16" onPointerEnter={engage} onPointerLeave={release} onFocus={engage} onBlur={release}>
              <Preview item={item} inert={false} max={1.4} playing={running} opts={opts} />
            </div>
          ) : tab === "wild" && item.clip ? (
            <div className="absolute inset-0">
              <SiteClip slug={item.slug} playing={playing} speed={1} className="absolute inset-x-6 inset-y-16 h-[calc(100%-8rem)] w-[calc(100%-3rem)] object-contain" />
              <a href={item.clip.href} target="_blank" rel="noreferrer noopener" className="absolute inset-x-0 bottom-6 mx-auto w-fit rounded-sm text-xs text-muted-foreground hover:text-foreground">
                From {item.clip.label} ↗
              </a>
            </div>
          ) : tab === "code" ? (
            <Source slug={item.slug} />
          ) : (
            <Usage slug={item.slug} install={item.install} published={item.published} />
          )}
        </div>
        {/* floating over the content, so the component keeps the whole sheet */}
        <div className="pointer-events-none absolute inset-x-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] flex items-end">
          {tab === "preview" && extras.length > 0 ? (
            <div className="pointer-events-auto max-w-[calc(100%-4rem)] rounded-2xl bg-card/80 p-2 backdrop-blur-md">
              <Controls extras={extras} opts={opts} setOpt={(k, v) => setOpts((o) => ({ ...o, [k]: v }))} />
            </div>
          ) : null}
        </div>
      </section>
      <SheetNotch name={item.name} shown={shown} canCopy={item.published} copied={prompt.done} onCopy={prompt.copy} shared={share.done} onShare={share.copy} views={views} tab={tab} onTab={(v) => { play("tap"); setEngaged(false); setTab(v as typeof tab); }} playing={running} onTogglePlay={(tab === "preview" && item.pausable) || tab === "wild" ? () => setPick(!playing) : undefined} />
    </dialog>
  );
}
