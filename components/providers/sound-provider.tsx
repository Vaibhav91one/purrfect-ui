"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { sound, type Cue } from "@/lib/sound";

const KEY = "sound";

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

type SoundContext = { enabled: boolean; toggle: () => void; play: (cue: Cue) => void };
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
    addEventListener("pointerdown", unlock, { once: true });
    addEventListener("keydown", unlock, { once: true });
    return () => {
      unbind();
      removeEventListener("pointerdown", unlock);
      removeEventListener("keydown", unlock);
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

  const value = useMemo<SoundContext>(() => ({ enabled, toggle, play: (cue) => sound.play(cue) }), [enabled, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSound() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSound must be used inside <SoundProvider>");
  return ctx;
}
