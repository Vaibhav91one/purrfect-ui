"use client";

import { Search } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSound } from "@/components/providers/sound-provider";
import { LATEST, NAV_LINKS } from "@/lib/site";
import { BotFace } from "./bot-face";
import type { FaceName } from "./faces";
import { GithubStars } from "./github-stars";
import { InstallPill } from "./install-pill";
import { SearchDialog } from "./search-dialog";
import { SoundToggle } from "./sound-toggle";
import { pill } from "./styles";
import { ThemeToggle } from "./theme-toggle";

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;
const HOVER_IN_MS = 80;
const HOVER_OUT_MS = 220;
const COLLAPSED_H = 48;

const subscribeResize = (cb: () => void) => {
  addEventListener("resize", cb);
  return () => removeEventListener("resize", cb);
};
const useViewportWidth = () => useSyncExternalStore(subscribeResize, () => innerWidth, () => 1280);

/**
 * The navbar: a black Dynamic-Island pill. Collapsed it shows the bot, search, sound and theme; hover (mouse), focus
 * (keyboard) or a tap (touch) morphs it open into the full menu. Esc or a click outside closes it.
 */
export function Notch() {
  const reduce = useReducedMotion();
  const vw = useViewportWidth();
  const { enabled, play } = useSound();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loved, setLoved] = useState(false);

  const root = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hovered = useRef(false);
  const lastPointer = useRef("mouse");
  const ignoreFocus = useRef(false);
  const wasOpen = useRef(false);

  const schedule = useCallback((next: boolean, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  }, []);

  // pill sounds on open and close (never on first render)
  useEffect(() => {
    if (open !== wasOpen.current) play(open ? "open" : "close");
    wasOpen.current = open;
  }, [open, play]);

  // Esc closes; a pointerdown outside closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      ignoreFocus.current = true; // moving focus back to the trigger must not reopen it
      setTimeout(() => (ignoreFocus.current = false), 200);
      setOpen(false);
      trigger.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // The dialog hands focus back to the search button when it closes (before its close event fires), and that must not
  // open the notch. So the guard is armed on open and released shortly after close.
  const openSearch = () => {
    ignoreFocus.current = true;
    setSearchOpen(true);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setTimeout(() => (ignoreFocus.current = false), 300);
  };

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const showLoved = () => {
    setLoved(true);
    setTimeout(() => setLoved(false), 1800);
  };

  const mood: FaceName | undefined = loved ? "love" : open ? "happy" : !enabled ? "sleepy" : undefined;
  const desktop = vw >= 640;
  const width = open ? Math.min(680, vw - 32) : desktop ? 380 : Math.min(250, vw - 32);
  const t = reduce ? { duration: 0 } : SPRING;

  return (
    <>
      <motion.nav
        ref={root}
        aria-label="Main"
        initial={false}
        animate={{ width, height: open ? "auto" : COLLAPSED_H }}
        transition={t}
        style={{ borderRadius: 26 }}
        className="pointer-events-auto overflow-hidden bg-black text-white shadow-[0_8px_30px_rgb(0_0_0/0.35)] ring-1 ring-white/10"
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          hovered.current = true;
          schedule(true, HOVER_IN_MS);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          hovered.current = false;
          if (root.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
          schedule(false, HOVER_OUT_MS);
        }}
        onFocus={() => {
          if (!ignoreFocus.current) schedule(true, 0);
        }}
        onBlur={(e) => {
          if (!root.current?.contains(e.relatedTarget as Node) && !hovered.current) schedule(false, 120);
        }}
      >
        <div className="flex items-center gap-1 px-2" style={{ height: COLLAPSED_H }}>
          <button
            ref={trigger}
            type="button"
            aria-expanded={open}
            aria-controls="notch-panel"
            aria-label="webof-ui menu"
            onPointerDown={(e) => (lastPointer.current = e.pointerType)}
            onClick={() => {
              // a mouse is handled by hover; touch and keyboard toggle
              if (lastPointer.current === "mouse" && hovered.current) return;
              schedule(!open, 0);
            }}
            className="flex h-10 items-center gap-2 rounded-full pr-3 pl-2 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
          >
            <BotFace override={mood} />
            <span className="hidden text-sm font-medium tracking-tight sm:inline">webof-ui</span>
          </button>
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search"
            data-cuelume-open
            className="ml-auto flex h-9 items-center gap-2 rounded-full bg-white/10 px-2.5 text-sm text-white/70 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white sm:pr-3 sm:pl-3.5"
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded bg-white/10 px-1.5 text-[11px] text-white/60 sm:inline">⌘K</kbd>
          </button>
          <SoundToggle />
          <ThemeToggle />
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="notch-panel"
              key="panel"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0, transition: { delay: reduce ? 0 : 0.08, duration: reduce ? 0 : 0.2 } }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1 } }}
              className="flex flex-col gap-3 px-3 pt-1 pb-3"
            >
              <div className="flex flex-wrap gap-1.5" role="list">
                {NAV_LINKS.map((l) => (
                  <a key={l.href} href={l.href} role="listitem" data-cuelume-navigate className={pill} onClick={() => setOpen(false)}>
                    {l.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <InstallPill slug={LATEST.slug} onCopied={showLoved} />
                <GithubStars />
                <span className={`${pill} cursor-default hover:bg-white/10 hover:text-white/80`}>Latest: {LATEST.name}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </>
  );
}
