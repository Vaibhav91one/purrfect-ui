"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import { bySlug } from "@/lib/components-data";

// the dialog (docs, highlighter, controls) is its own chunk: fetched on idle after load, or when a dialog opens first
const loadSheet = () => import("./component-sheet");
const ComponentSheet = dynamic(() => loadSheet().then((m) => m.ComponentSheet), { ssr: false });

// The open component lives in the URL (`?c=slug`) so reload, sharing and Back all work. There is no mirrored React state:
// <SheetHost /> reads the URL, openSheet/closeSheet write it. `origin` is the card that grows into the dialog.
let origin: HTMLElement | null = null;
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

/** Opens a component's dialog over the current page; `from` is the card element it grows out of. */
export function openSheet(slug: string, from: HTMLElement | null) {
  origin = from;
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

/** Mount once per page: renders the dialog for whichever component the URL names. */
export function SheetHost() {
  const item = bySlug(useSyncExternalStore(subscribe, read, () => null));
  useEffect(() => {
    const t = setTimeout(loadSheet, 4000); // ponytail: a fixed delay, not requestIdleCallback (Safari lacks it)
    return () => clearTimeout(t);
  }, []);
  return item ? <ComponentSheet key={item.slug} item={item} origin={origin} onClose={closeSheet} /> : null;
}
