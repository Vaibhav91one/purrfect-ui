"use client";

import { BookOpen, Boxes, Cat, History, House, Search, X, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FAST, SPRING } from "@/lib/motion";
import { useSound } from "@/components/providers/sound-provider";
import { CATEGORIES, COMPONENTS } from "@/lib/components-data";
import { NAV_LINKS } from "@/lib/site";
import { NotchCat } from "./notch-cat";
import { GithubStars } from "./github-stars";
import { SoundToggle } from "./sound-toggle";
import { notchPill, notchRow } from "./styles";
import { ThemeToggle } from "./theme-toggle";

const HOVER_IN_MS = 80;
const HOVER_OUT_MS = 260;
const ROW_H = 48;
const NOTCH_W = 340; // collapsed width from `sm` up

const NAV_ICONS: Record<string, LucideIcon> = { Home: House, Components: Boxes, Docs: BookOpen, Changelog: History, About: Cat };

const heading = "px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-white/40 uppercase";
const chip =
  "rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/15 hover:text-white aria-pressed:bg-white aria-pressed:text-black focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white";

const subscribeResize = (cb: () => void) => {
  addEventListener("resize", cb);
  return () => removeEventListener("resize", cb);
};
const useViewportWidth = () => useSyncExternalStore(subscribeResize, () => innerWidth, () => 1280);

/**
 * The navbar: a small black notch with the cat, the name and a search icon. Hover (mouse), focus (keyboard) or a tap
 * (touch) pops the links, stars, sound and theme out in an arc under it. The search icon turns the whole notch into a
 * search bar. Esc or a click outside puts everything back.
 */
export function Notch() {
  const reduce = useReducedMotion();
  const vw = useViewportWidth();
  const { play } = useSound();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All"); // category filter in the search bar

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
    setFilter("All");
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

  // search lists the pages and every component (name or category); the filter narrows components to one category
  const needle = query.trim().toLowerCase();
  type Row = { label: string; href: string; Icon: LucideIcon; tag?: string };
  const pages: Row[] = filter === "All" ? NAV_LINKS.filter((l) => l.label.toLowerCase().includes(needle)).map((l) => ({ label: l.label, href: l.href, Icon: NAV_ICONS[l.label] })) : [];
  const comps: Row[] = COMPONENTS.filter((c) => (filter === "All" || c.category === filter) && (!needle || `${c.name} ${c.category}`.toLowerCase().includes(needle))).map((c) => ({
    label: c.name,
    href: `/components?c=${c.slug}`,
    Icon: Boxes,
    tag: c.category,
  }));
  const matches = [...pages, ...comps];
  const go = (href: string) => {
    quiet();
    closeAll();
    router.push(href);
  };

  const width = searching ? Math.min(560, vw - 32) : vw >= 640 ? NOTCH_W : 250;
  const t = reduce ? { duration: 0 } : SPRING;

  return (
    <div
        ref={root}
        data-notch
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
          className="relative overflow-hidden bg-black text-white shadow-[0_8px_30px_rgb(0_0_0/0.35)] ring-1 ring-white/10"
        >
          {searching ? (
            <motion.form
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0 : FAST }}
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                if (matches[0]) go(matches[0].href);
              }}
            >
              <div className="flex items-center gap-2 rounded-full px-4 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-white/50" style={{ height: ROW_H }}>
                <Search className="size-4 shrink-0 text-white/60" />
                <input
                  autoFocus
                  data-cuelume-type
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
              <div role="group" aria-label="Filter by category" className="flex gap-1.5 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
                {["All", ...CATEGORIES].map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={filter === c}
                    onClick={(e) => {
                      setFilter(c);
                      e.currentTarget.scrollIntoView({ inline: "center", block: "nearest" });
                    }}
                    data-cuelume-tap
                    className={`${chip} shrink-0 whitespace-nowrap`}
                  >
                    {c}
                    {c !== "All" && <span className="ml-1.5 opacity-50">{COMPONENTS.filter((x) => x.category === c).length}</span>}
                  </button>
                ))}
              </div>
              <ul className="max-h-[min(20rem,50svh)] overflow-y-auto overscroll-contain px-2 pb-2">
                {matches.length === 0 && <li className="px-3 py-3 text-sm text-white/50">Nothing found</li>}
                {matches.map((l, i) => {
                  const Icon = l.Icon;
                  const startsGroup = pages.length > 0 && (i === 0 || !!matches[i - 1].tag !== !!l.tag);
                  return (
                    <li key={l.href}>
                      {startsGroup && <p className={heading}>{l.tag ? "Components" : "Pages"}</p>}
                      <button
                        type="button"
                        onClick={() => go(l.href)}
                        data-cuelume-navigate
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{l.label}</span>
                        {l.tag && <span className="shrink-0 text-xs text-white/40">{l.tag}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.form>
          ) : (
            <div className="flex items-center justify-between gap-1 px-2" style={{ height: ROW_H }}>
              <NotchCat />
              <button
                ref={trigger}
                type="button"
                aria-expanded={open}
                aria-controls="notch-menu"
                aria-label="purrfect ui menu"
                onPointerDown={(e) => (lastPointer.current = e.pointerType)}
                onClick={() => {
                  // a mouse goes home (hover already opens the menu); touch has no hover, so a tap toggles the menu
                  if (lastPointer.current === "mouse") {
                    play("navigate");
                    closeAll();
                    if (pathname === "/") scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
                    else router.push("/");
                    return;
                  }
                  schedule(!open, 0);
                }}
                className="group flex h-10 items-center gap-2 rounded-full pr-3 pl-[62px] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
              >
                <span className="text-sm font-medium tracking-tight">purrfect ui</span>
              </button>
              <button type="button" onClick={openSearch} aria-label="Search" data-cuelume-open className={`${notchPill} px-2.5 sm:pr-3 sm:pl-3.5`}>
                <Search className="size-4" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden rounded bg-white/10 px-1.5 text-[11px] text-white/60 sm:inline">⌘K</kbd>
              </button>
            </div>
          )}
        </motion.nav>

        <AnimatePresence>
          {open && !searching && (
            // pt-2 keeps the pointer inside the hover area on its way from the notch to the menu
            <div id="notch-menu" className="absolute top-full left-0 z-10 w-full pt-2">
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: t }}
                exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: reduce ? 0 : 0.12 } }}
                style={{ transformOrigin: "top center" }}
                className="flex flex-col rounded-3xl bg-black p-2 text-white shadow-[0_8px_30px_rgb(0_0_0/0.35)] ring-1 ring-white/10"
              >
                {NAV_LINKS.filter((l) => l.href !== pathname).map((l) => {
                  const Icon = NAV_ICONS[l.label];
                  return (
                    <Link key={l.href} href={l.href} data-cuelume-navigate className={notchRow} onClick={closeAll}>
                      <Icon className="size-4" />
                      {l.label}
                    </Link>
                  );
                })}
                <div className="mx-3 my-1 h-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <GithubStars />
                  </div>
                  {/* phones have no room beside the notch, so the buttons ride in the menu's last row */}
                  <div className="flex gap-2 sm:hidden">
                    <SoundToggle />
                    <ThemeToggle />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* sound and theme: round buttons that pop out beside the notch, only while the menu is open. pl-2 (not a gap)
            keeps them inside the hover area. */}
        <AnimatePresence>
          {open && !searching && (
            <motion.div
              className="absolute top-0 left-full hidden gap-2 pl-2 sm:flex"
              initial={{ opacity: 0, x: -12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1, transition: t }}
              exit={{ opacity: 0, x: -8, transition: { duration: reduce ? 0 : 0.1 } }}
            >
              <SoundToggle />
              <ThemeToggle />
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
