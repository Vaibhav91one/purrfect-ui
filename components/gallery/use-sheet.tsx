"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { CATEGORIES, bySlug, categorySlug } from "@/lib/components-data";

// the dialog (docs, highlighter, controls) is its own chunk: fetched on idle after load, or when a dialog opens first
const loadSheet = () => import("./component-sheet");
const ComponentSheet = dynamic(() => loadSheet().then((m) => m.ComponentSheet), { ssr: false });

// The open component lives in the URL (`?c=slug`) so reload, sharing and Back all work. There is no mirrored React state:
// <SheetHost /> reads the URL, openSheet/closeSheet write it.
let pushed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const onPop = () => {
  pushed = false;
  notify();
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  if (listeners.size === 1) addEventListener("popstate", onPop);
  return () => {
    listeners.delete(cb);
    if (!listeners.size) removeEventListener("popstate", onPop);
  };
};
const read = () => new URLSearchParams(location.search).get("c");

/** Opens a component's dialog over the current page. */
export function openSheet(slug: string) {
  const u = new URL(location.href);
  u.searchParams.set("c", slug);
  history.pushState(null, "", u);
  pushed = true;
  notify();
}

export function closeSheet() {
  if (pushed) {
    pushed = false;
    history.back();
    return;
  }
  const u = new URL(location.href);
  u.searchParams.delete("c");
  history.replaceState(null, "", u);
  notify();
}

// The /components category filter lives in the URL too (`?cat=input,text`), written with replaceState: no navigation,
// no history entry, and `?c=` is left alone (each side edits only its own param of the current URL).
const readCat = () => new URLSearchParams(location.search).get("cat") ?? "";

/** The active categories (names, in the order they were picked) and a setter; [] on the server. */
export function useCategoryFilter() {
  const raw = useSyncExternalStore(subscribe, readCat, () => "");
  const active = useMemo(() => raw.split(",").flatMap((s) => CATEGORIES.filter((c) => categorySlug(c) === s)), [raw]);
  const set = useCallback((next: string[]) => {
    const u = new URL(location.href);
    if (next.length) u.searchParams.set("cat", next.map(categorySlug).join(","));
    else u.searchParams.delete("cat");
    history.replaceState(history.state, "", u.href.replaceAll("%2C", ","));
    notify();
  }, []);
  return [active, set] as const;
}

/** Mount once per page: renders the dialog for whichever component the URL names. */
export function SheetHost() {
  const item = bySlug(useSyncExternalStore(subscribe, read, () => null));
  useEffect(() => {
    const t = setTimeout(loadSheet, 4000); // ponytail: a fixed delay, not requestIdleCallback (Safari lacks it)
    return () => clearTimeout(t);
  }, []);
  return item ? <ComponentSheet key={item.slug} item={item} onClose={closeSheet} /> : null;
}
