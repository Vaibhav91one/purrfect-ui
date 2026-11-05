"use client";

import { Check, ChevronDown, ClipboardCopy, Link2, type LucideIcon, Pause, Play, Search } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { NotchCat } from "@/components/notch/notch-cat";
import { notchPill, notchRow, soloButton } from "@/components/notch/styles";
import { SPRING } from "@/lib/motion";

const HOVER_IN_MS = 80;
const HOVER_OUT_MS = 260;
const layer = "absolute inset-0 flex items-center gap-2 pr-2 pl-[70px] transition-[translate,opacity] duration-[380ms] ease-snappy motion-reduce:translate-y-0 motion-reduce:duration-200";

type View = readonly [id: string, Icon: LucideIcon, name: string];
type Props = {
  name: string;
  shown: boolean;
  canCopy: boolean;
  copied: boolean;
  onCopy: () => void;
  shared: boolean;
  onShare: () => void;
  views: readonly View[];
  tab: string;
  onTab: (id: string) => void;
  playing: boolean;
  onTogglePlay?: () => void; // undefined: nothing to pause here, so no button
};

/**
 * The site notch, standing in for the real one while a component's dialog is open (a modal dialog covers the page, notch
 * included). It sits exactly where the notch does and looks the same: the notch's own name and Search pill slide up out of it,
 * masked by its edge, and the component's name and Copy prompt rise in. Hover (mouse), focus (keyboard) or a tap (touch) drops
 * the views menu below it, as the notch drops its links, and with Share and Pause/Play always beside it. `shown` flips the swap both ways as the dialog opens and closes.
 */
export function SheetNotch({ name, shown, canCopy, copied, onCopy, shared, onShare, views, tab, onTab, playing, onTogglePlay }: Props) {
  const reduce = useReducedMotion();
  // the live notch's cat, so the swap is invisible
  const [variant] = useState(() => Number(document.querySelector("[data-notch-cat]")?.getAttribute("data-variant") ?? 0));
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const touch = useRef(false);
  const schedule = (next: boolean, ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), ms);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const show = open && shown;
  const [, CurrentIcon, currentLabel] = views.find((v) => v[0] === tab) ?? views[0];
  const t = reduce ? { duration: 0 } : SPRING;
  const share = (
    <button type="button" onClick={onShare} aria-label={shared ? "Link copied" : "Copy link"} title="Copy link" data-cuelume-tap className={soloButton}>
      {shared ? <Check className="size-4 sm:size-5" /> : <Link2 className="size-4 sm:size-5" />}
    </button>
  );

  const playBtn = onTogglePlay && (
    <button type="button" onClick={onTogglePlay} aria-label={playing ? "Pause loop" : "Play loop"} data-cuelume-toggle className={soloButton}>
      {playing ? <Pause className="size-4 sm:size-5" /> : <Play className="size-4 sm:size-5" />}
    </button>
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center px-4">
      <div className="pointer-events-auto relative">
      <div
        ref={root}
        className="relative"
        onPointerDown={(e) => (touch.current = e.pointerType !== "mouse")}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          hovered.current = true;
          schedule(true, HOVER_IN_MS);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          hovered.current = false;
          if (root.current?.matches(":has(:focus-visible)")) return; // a keyboard user still working inside
          schedule(false, HOVER_OUT_MS);
        }}
        onFocus={(e) => {
          if (e.target.matches(":focus-visible")) schedule(true, 0);
        }}
        onBlur={(e) => {
          if (!root.current?.contains(e.relatedTarget as Node) && !hovered.current) schedule(false, 120);
        }}
      >
        <nav
          aria-label="Component"
          onClick={(e) => {
            // touch has no hover: a tap on the bar (not on its buttons) toggles the buttons
            if (touch.current && !(e.target as HTMLElement).closest("button")) schedule(!open, 0);
          }}
          className="relative h-12 w-[250px] overflow-hidden rounded-[26px] bg-black text-white shadow-[0_8px_30px_rgb(0_0_0/0.35)] ring-1 ring-white/10 sm:w-[340px]"
        >
          <NotchCat settled variant={variant} />
          <div className={`${layer} ${shown ? "-translate-y-full opacity-0" : ""}`} aria-hidden inert>
            <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight">purrfect ui</span>
            <span className={`${notchPill} px-2.5 sm:pr-3 sm:pl-3.5`}>
              <Search className="size-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded bg-white/10 px-1.5 text-[11px] text-white/60 sm:inline">⌘K</kbd>
            </span>
          </div>
          <div className={`${layer} ${shown ? "" : "translate-y-full opacity-0"}`}>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm leading-tight font-medium tracking-tight">{name}</h2>
              {/* always there, so it is clear the notch has more views behind it */}
              <span className="flex items-center gap-1 text-[11px] leading-tight text-white/50">
                <CurrentIcon className="size-3 shrink-0" />
                <span className="truncate">{currentLabel}</span>
                <ChevronDown className={`size-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
              </span>
            </div>
            {canCopy && (
              <button type="button" onClick={onCopy} data-cuelume-tap aria-label="Copy prompt" className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-white px-2.5 text-sm font-medium text-black transition-colors hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white sm:pr-3 sm:pl-3.5">
                {copied ? <Check className="size-4" /> : <ClipboardCopy className="size-4" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy prompt"}</span>
              </button>
            )}
          </div>
        </nav>

        {/* the views, the way the notch lists its links; pt-2 keeps the pointer inside the hover area on its way down */}
        <AnimatePresence>
          {show && (
            <div id="sheet-views" className="absolute top-full left-0 z-10 w-full pt-2">
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: t }}
                exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: reduce ? 0 : 0.12 } }}
                style={{ transformOrigin: "top center" }}
                className="flex flex-col rounded-3xl bg-black p-2 text-white shadow-[0_8px_30px_rgb(0_0_0/0.35)] ring-1 ring-white/10"
              >
                {views.map(([id, Icon, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-current={id === tab ? "true" : undefined}
                    onClick={() => {
                      onTab(id);
                      schedule(false, 0);
                    }}
                    data-cuelume-tap
                    className={`${notchRow} ${id === tab ? "bg-white/10 text-white" : ""}`}
                  >
                    <Icon className="size-4" />
                    <span className="flex-1 text-left">{label}</span>
                    {id === tab && <Check className="size-4 text-white/60" />}
                  </button>
                ))}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
        {/* beside the notch, outside the hover area: hovering them must not open the views */}
        <AnimatePresence>
          {shown && (
            <motion.div
              className="absolute top-0 right-full pr-2"
              initial={{ opacity: 0, x: 12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1, transition: t }}
              exit={{ opacity: 0, x: 8, transition: { duration: reduce ? 0 : 0.1 } }}
            >
              {share}
            </motion.div>
          )}
        </AnimatePresence>
        {playBtn && (
          <AnimatePresence>
            {shown && (
              <motion.div
                className="absolute top-0 left-full pl-2"
                initial={{ opacity: 0, x: -12, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1, transition: t }}
                exit={{ opacity: 0, x: -8, transition: { duration: reduce ? 0 : 0.1 } }}
              >
                {playBtn}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
