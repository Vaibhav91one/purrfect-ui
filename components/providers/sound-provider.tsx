"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { sound, type Cue, type CueOptions } from "@/lib/sound";

const KEY = "sound";
const HOVER_TARGETS = 'a[href], button, [role="button"], [role="tab"], [role="switch"], [data-cuelume-hover]';

// localStorage as an external store: the server and the first client render say "on", then the saved choice takes over.
const listeners = new Set<() => void>();
const read = () => {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    removeEventListener("storage", cb);
  };
};

type SoundContext = { enabled: boolean; toggle: () => void; play: (cue: Cue, options?: CueOptions) => void };
const Ctx = createContext<SoundContext | null>(null);

/** Sound is on by default; browsers keep audio locked until the first gesture, so the first pointerdown unlocks it. */
export function SoundProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, read, () => true);

  useEffect(() => {
    sound.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    sound.setTheme("bubble");
    const unbind = sound.bind();
    const unlock = () => void sound.unlock();
    const GESTURES = ["pointerdown", "touchstart", "click", "keydown"] as const;
    GESTURES.forEach((g) => addEventListener(g, unlock, { once: true, capture: true }));
    // Hover cue: Cuelume has no hover binding, so one delegated listener quietly answers every control.
    // Mouse only, once per control entered, at most one per 80 ms; live demos (data-hover-sound="off") keep their own sounds.
    let last: Element | null = null;
    let at = 0;
    const hover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element).closest?.(HOVER_TARGETS) ?? null;
      if (el === last) return;
      last = el;
      if (!el || (el as HTMLButtonElement).disabled || el.closest('[data-hover-sound="off"]')) return;
      const now = performance.now();
      if (now - at < 80) return;
      at = now;
      sound.play("select", { emphasis: "subtle" });
    };
    addEventListener("pointerover", hover);
    return () => {
      removeEventListener("pointerover", hover);
      unbind();
      GESTURES.forEach((g) => removeEventListener(g, unlock, { capture: true }));
    };
  }, []);

  const toggle = useCallback(() => {
    const next = !read();
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {}
    sound.setEnabled(next);
    listeners.forEach((cb) => cb());
    if (next) sound.play("tap"); // a click to confirm sound is back
  }, []);

  const value = useMemo<SoundContext>(() => ({ enabled, toggle, play: (cue, options) => sound.play(cue, options) }), [enabled, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSound() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}
