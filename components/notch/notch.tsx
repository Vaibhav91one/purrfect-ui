"use client";

import { BookOpen, Boxes, Cat, History, House, Search, X, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EASE, FAST, SPRING } from "@/lib/motion";
import { openSheet, useCategoryFilter } from "@/components/gallery/use-sheet";
import { useSound } from "@/components/providers/sound-provider";
import { CATEGORIES, COMPONENTS, categorySlug } from "@/lib/components-data";
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
// every page mounts its own notch, so a chip that navigates to /components hands the open search bar to the next one
let keepSearching = false;
const handOffSearch = () => (keepSearching = true);

// the height that is really visible: on iOS the on-screen keyboard covers the page without resizing it, so the results list is sized to this
const subscribeVisual = (cb: () => void) => {
  visualViewport?.addEventListener("resize", cb);
  return () => visualViewport?.removeEventListener("resize", cb);
};
const useVisibleHeight = () => useSyncExternalStore(subscribeVisual, () => Math.round(visualViewport?.height ?? innerHeight), () => 800);

const useViewportWidth = () => useSyncExternalStore(subscribeResize, () => innerWidth, () => 1280);

/**
 * The navbar: a small black notch with the cat, the name and a search icon. Hover (mouse), focus (keyboard) or a tap
 * (touch) pops the links, stars, sound and theme out in an arc under it. The search icon turns the whole notch into a
 * search bar. Esc or a click outside puts everything back.
 */
export function Notch() {
  const reduce = useReducedMotion();
  const vw = useViewportWidth();
  const vh = useVisibleHeight();
  const { play } = useSound();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(() => keepSearching);
  const [query, setQuery] = useState("");
  // the category filter lives in the URL (`?cat=`), so it filters the /components grid in place and outlasts the search bar
  const [active, setActive] = useCategoryFilter();

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

  // take over the search bar from the previous page's notch; tuck ours away when this page is hidden (cacheComponents keeps it)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a page cacheComponents brings back keeps its old state
    if (keepSearching) setSearching(true);
    setTimeout(() => (keepSearching = false)); // a tick later: Strict Mode runs this twice
    return closeAll;
  }, [closeAll]);

  // sound on pop and tuck (never on first render)
  useEffect(() => {
    if (open !== wasOpen.current) play(open ? "open" : "close");
    wasOpen.current = open;
  }, [open, play]);

  // Esc and outside pointerdown put everything back. The effect above only hears the arc, so a closing search bar plays its own cue.
  useEffect(() => {
    if (!open && !searching) return;
    const dismiss = () => {
      if (searching) play("close");
      closeAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      quiet();
      dismiss();
      trigger.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) dismiss();
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown);
    };
  }, [open, searching, quiet, closeAll, play]);

  // ⌘K / Ctrl+K opens the search bar, and closes it again
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!searching) return openSearch();
        play("close");
        closeAll();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [searching, openSearch, closeAll, play]);

  // search lists the pages and every component (name or category); the filter narrows components to its categories
  const needle = query.trim().toLowerCase();
  type Row = { label: string; href: string; Icon: LucideIcon; tag?: string };
  const pages: Row[] = !active.length ? NAV_LINKS.filter((l) => l.label.toLowerCase().includes(needle)).map((l) => ({ label: l.label, href: l.href, Icon: NAV_ICONS[l.label] })) : [];
  const comps: Row[] = COMPONENTS.filter((c) => (!active.length || active.includes(c.category)) && (!needle || `${c.name} ${c.category}`.toLowerCase().includes(needle))).map((c) => ({
    label: c.name,
    href: `/components?${active.length ? `cat=${active.map(categorySlug).join(",")}&` : ""}c=${c.slug}`, // the filter carries over
    Icon: Boxes,
    tag: c.category,
  }));
  const matches = [...pages, ...comps];
  const go = (href: string) => {
    quiet();
    closeAll();
    // same page: SheetHost only hears openSheet, not a router push of ?c= (and ?cat= is already in the URL)
    const u = new URL(href, location.href);
    const slug = u.searchParams.get("c");
    if (slug && u.pathname === pathname) openSheet(slug);
    else router.push(href);
  };
  // a category chip toggles that category; "All" clears them (pressed only on /components). On /components only the URL
  // changes; elsewhere the first toggle goes to /components with the filter, and the search bar comes along.
  const toggle = (c: string) => {
    const next = c === "All" ? [] : active.includes(c) ? active.filter((x) => x !== c) : [...active, c];
    if (pathname === "/components") return setActive(next);
    handOffSearch();
    router.push(next.length ? `/components?cat=${next.map(categorySlug).join(",")}` : "/components");
  };

  const width = searching ? Math.min(560, vw - 32) : vw >= 640 ? NOTCH_W : 250;
  const t = reduce ? { duration: 0 } : SPRING;
  const fade = { duration: FAST, ease: EASE };

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
                if (!matches[0]) return;
                play("navigate"); // Enter picks the first result, like a click on it (which data-cuelume-navigate covers)
                go(matches[0].href);
              }}
            >
              <div className="flex items-center gap-2 rounded-full px-4 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-white/50" style={{ height: ROW_H }}>
                <Search className="size-4 shrink-0 text-white/60" />
                {active.length > 0 && (
                  // the chips scroll sideways once they fill the row; the input always keeps room to type
                  <div className="flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none]">
                    {active.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggle(c)}
                        aria-label={`Remove ${c} filter`}
                        data-cuelume-close
                        className={`${chip} flex shrink-0 items-center gap-1 pr-2 whitespace-nowrap bg-white! text-black! hover:bg-white/85!`}
                      >
                        {c}
                        <X className="size-3.5" />
                      </button>
                    ))}
                  </div>
                )}
                <input
                  autoFocus
                  data-cuelume-type
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !query && active.length) setActive(active.slice(0, -1));
                  }}
                  placeholder="Search…"
                  aria-label="Search"
                  className="min-w-16 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40 pointer-coarse:text-base" /* 16px on touch: iOS Safari zooms the page on focus below that */
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
                    aria-pressed={c === "All" ? pathname === "/components" && !active.length : active.includes(c)}
                    onClick={(e) => {
                      toggle(c);
                      e.currentTarget.scrollIntoView({ inline: "center", block: "nearest" });
                    }}
                    data-cuelume-toggle
                    className={`${chip} shrink-0 whitespace-nowrap`}
                  >
                    {c}
                    {c !== "All" && <span className="ml-1.5 opacity-50">{COMPONENTS.filter((x) => x.category === c).length}</span>}
                  </button>
                ))}
              </div>
              <ul style={{ maxHeight: Math.max(120, Math.min(320, vh * 0.5, vh - 156)) }} className="overflow-y-auto overscroll-contain px-2 pb-2">
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
                className="touch-hit group relative flex h-10 items-center gap-2 rounded-full pr-3 pl-[62px] hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
              >
                <span className="text-sm font-medium tracking-tight">purrfect ui</span>
              </button>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={openSearch}
                  aria-label={active.length ? `Search, ${active.length} filter${active.length > 1 ? "s" : ""}` : "Search"}
                  data-cuelume-open
                  className={`${notchPill} px-2.5 sm:pr-3 sm:pl-3.5`}
                >
                  <Search className="size-4" />
                  <span className="hidden sm:inline">Search</span>
                  {/* the badge and the shortcut share one cell and crossfade, so the pill keeps its width; on a phone (no
                      shortcut) the cell folds away instead */}
                  <motion.span
                    initial={false}
                    animate={{ width: active.length || vw >= 640 ? "auto" : 0, marginLeft: active.length || vw >= 640 ? 0 : -8 }}
                    transition={fade}
                    className="grid place-items-center"
                  >
                    <AnimatePresence initial={false}>
                      {active.length > 0 && (
                        <motion.span
                          key="count"
                          initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
                          transition={fade}
                          className="col-start-1 row-start-1 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[11px] leading-none font-medium text-black tabular-nums"
                        >
                          {active.length}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.kbd
                      initial={false}
                      animate={{ opacity: active.length ? 0 : 1, scale: active.length && !reduce ? 0.8 : 1 }}
                      transition={fade}
                      className="col-start-1 row-start-1 hidden rounded bg-white/10 px-1.5 text-[11px] text-white/60 sm:inline"
                    >
                      ⌘K
                    </motion.kbd>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {active.length > 0 && (
                    <motion.button
                      key="clear"
                      type="button"
                      onPointerDown={quiet} // a tap focuses it, which must not pop the arc
                      onClick={() => {
                        quiet();
                        setActive([]);
                        trigger.current?.focus({ preventScroll: true }); // the button unmounts, so focus needs somewhere to go
                      }}
                      aria-label="Clear filters"
                      data-cuelume-close
                      // it folds its width too, so the pill slides over instead of jumping
                      initial={{ opacity: 0, scale: reduce ? 1 : 0.6, width: 0, marginLeft: -2 }}
                      animate={{ opacity: 1, scale: 1, width: 20, marginLeft: 0 }}
                      exit={{ opacity: 0, scale: reduce ? 1 : 0.6, width: 0, marginLeft: -2 }}
                      transition={fade}
                      className="grid h-5 shrink-0 overflow-hidden place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
                    >
                      <X className="size-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
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
