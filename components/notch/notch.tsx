"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSound } from "@/components/providers/sound-provider";
import { NAV_LINKS } from "@/lib/site";
import { ArcChips } from "./arc-chips";
import { BotFace } from "./bot-face";
import { GithubStars } from "./github-stars";
import { SoundToggle } from "./sound-toggle";
import { chip } from "./styles";
import { ThemeToggle } from "./theme-toggle";

const SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;
const HOVER_IN_MS = 80;
const HOVER_OUT_MS = 260;
const ROW_H = 48;
const NOTCH_W = 340; // collapsed width from `sm` up; the chip arc is sized around it

const subscribeResize = (cb: () => void) => {
  addEventListener("resize", cb);
  return () => removeEventListener("resize", cb);
};
const useViewportWidth = () => useSyncExternalStore(subscribeResize, () => innerWidth, () => 1280);

/**
 * The navbar: a small black notch with the bot, the name and a search icon. Hover (mouse), focus (keyboard) or a tap
 * (touch) pops the links, stars, sound and theme out in an arc under it. The search icon turns the whole notch into a
 * search bar. Esc or a click outside puts everything back.
 */
export function Notch() {
  const reduce = useReducedMotion();
  const vw = useViewportWidth();
  const { play } = useSound();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const root = useRef<HTMLDivElement>(null);
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

  // moving focus back to the trigger (Esc, search closing) must not pop the arc again
  const quiet = useCallback(() => {
    ignoreFocus.current = true;
    setTimeout(() => (ignoreFocus.current = false), 250);
  }, []);

  const closeAll = useCallback(() => {
    clearTimeout(timer.current);
    setOpen(false);
    setSearching(false);
    setQuery("");
  }, []);

  const openSearch = useCallback(() => {
    clearTimeout(timer.current);
    setOpen(false);
    setSearching(true);
  }, []);

  // sound on pop and tuck (never on first render)
  useEffect(() => {
    if (open !== wasOpen.current) play(open ? "open" : "close");
    wasOpen.current = open;
  }, [open, play]);

  // Esc and outside pointerdown put everything back
  useEffect(() => {
    if (!open && !searching) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      quiet();
      closeAll();
      trigger.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) closeAll();
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown);
    };
  }, [open, searching, quiet, closeAll]);

  // ⌘K / Ctrl+K opens the search bar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [openSearch]);

  const matches = NAV_LINKS.filter((l) => l.label.toLowerCase().includes(query.trim().toLowerCase()));
  const go = (href: string) => {
    quiet();
    closeAll();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const width = searching ? Math.min(560, vw - 32) : vw >= 640 ? NOTCH_W : 250;
  const t = reduce ? { duration: 0 } : SPRING;

  // the arc: links, stars, sound, theme. Each gets an index so it can drop by its distance from the centre.
  const items = [
    ...NAV_LINKS.map((l) => (
      <a key={l.href} href={l.href} data-cuelume-navigate className={chip} onClick={closeAll}>
        {l.label}
      </a>
    )),
    <GithubStars key="stars" />,
    <SoundToggle key="sound" />,
    <ThemeToggle key="theme" />,
  ];

  return (
    <div
      ref={root}
      className="pointer-events-auto relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || searching) return;
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
        if (!ignoreFocus.current && !searching) schedule(true, 0);
      }}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node) && !hovered.current) schedule(false, 120);
      }}
    >
      <motion.nav
        aria-label="Main"
        initial={false}
        animate={{ width, height: searching ? "auto" : ROW_H }}
        transition={t}
        style={{ borderRadius: 26 }}
        className="overflow-hidden bg-black text-white shadow-[0_8px_30px_rgb(0_0_0/0.35)] ring-1 ring-white/10"
      >
        {searching ? (
          <motion.form
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.15 }}
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (matches[0]) go(matches[0].href);
            }}
          >
            <div className="flex items-center gap-2 px-4" style={{ height: ROW_H }}>
              <Search className="size-4 shrink-0 text-white/60" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                aria-label="Search"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => {
                  quiet();
                  closeAll();
                  trigger.current?.focus();
                }}
                aria-label="Close search"
                data-cuelume-close
                className="grid size-8 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="px-2 pb-2">
              {matches.length === 0 && <li className="px-3 py-3 text-sm text-white/50">Nothing found</li>}
              {matches.map((l) => (
                <li key={l.href}>
                  <button
                    type="button"
                    onClick={() => go(l.href)}
                    data-cuelume-navigate
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline-none"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.form>
        ) : (
          <div className="flex items-center justify-between gap-1 px-2" style={{ height: ROW_H }}>
            <button
              ref={trigger}
              type="button"
              aria-expanded={open}
              aria-controls="notch-arc"
              aria-label="webof-ui menu"
              onPointerDown={(e) => (lastPointer.current = e.pointerType)}
              onClick={() => {
                // a mouse is handled by hover; touch and keyboard toggle
                if (lastPointer.current === "mouse" && hovered.current) return;
                schedule(!open, 0);
              }}
              className="flex h-10 items-center gap-2 rounded-full pr-3 pl-2 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
            >
              <BotFace />
              <span className="text-sm font-medium tracking-tight">webof-ui</span>
            </button>
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              data-cuelume-open
              className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-white/10 px-2.5 text-sm text-white/70 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white sm:pr-3 sm:pl-3.5"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded bg-white/10 px-1.5 text-[11px] text-white/60 sm:inline">⌘K</kbd>
            </button>
          </div>
        )}
      </motion.nav>

      <AnimatePresence>{open && !searching && <ArcChips items={items} notchWidth={NOTCH_W} rowHeight={ROW_H} pop={t} reduce={reduce} />}</AnimatePresence>
    </div>
  );
}
