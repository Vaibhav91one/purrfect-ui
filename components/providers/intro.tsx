"use client";

import { useEffect, useRef, useState } from "react";
import { GradientCat } from "@/components/gallery/gradient-cat";
import { EASE } from "@/lib/motion";
import { sound } from "@/lib/sound";

export const INTRO_KEY = "purrfect-intro";
const CAT_H = 220; // px: the loader cat; the notch cat is 88
const NOTCH_CAT_H = 88;
const MORPH_MS = 950;
const css = EASE.join(",");
const ease = `cubic-bezier(${css})`;

const mark = (...names: string[]) => names.forEach((n) => (document.documentElement.dataset[n] = n === "intro" ? "ready" : ""));

/**
 * First visit of a tab: the cat counts the load up to 100, waits for a tap (the gesture that unlocks sound), then
 * shrinks and flies into the notch while the backdrop fades; the page's `.intro-item`s enter as it lands.
 * Later visits and client navigations skip all of it (the head script in app/layout.tsx marks the tab before first paint).
 */
export function Intro() {
  const [count, setCount] = useState(0);
  const [variant, setVariant] = useState(0); // matches the notch cat, so the swap at landing is invisible
  const [phase, setPhase] = useState<"count" | "tap" | "morph" | "done">("count");
  const layer = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const cat = useRef<HTMLDivElement>(null);
  const ui = useRef<HTMLDivElement>(null);

  // the load: real signal is the fonts, with a minimum so the count reads, and a cap so it can never hang
  useEffect(() => {
    const el = document.documentElement;
    if (el.dataset.seen !== undefined || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      mark("seen", "intro", "landed");
      try { sessionStorage.setItem(INTRO_KEY, "1"); } catch {}
      return; // the layer is hidden by CSS for these
    }
    el.style.overflow = "hidden";
    const t0 = performance.now();
    let fonts = false;
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 6000))]).then(() => (fonts = true));
    let v = 0;
    let last = t0;
    let raf = 0;
    const tick = (now: number) => {
      const target = fonts && now - t0 > 1400 ? 100 : 90;
      v += (target - v) * (1 - Math.exp(-(now - last) / 380));
      last = now;
      if (target === 100 && v > 99.5) v = 100;
      setCount(Math.round(v));
      if (v < 100) raf = requestAnimationFrame(tick);
      else setPhase("tap");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // the tap: unlocks sound, then the cat flies into the notch
  useEffect(() => {
    if (phase !== "tap") return;
    const go = () => {
      setVariant(Number(document.querySelector<HTMLElement>("[data-notch-cat]")?.dataset.variant ?? 0));
      void sound.unlock().then(() => sound.play("open"));
      setPhase("morph");
    };
    const events = ["pointerdown", "touchstart", "keydown"] as const;
    events.forEach((e) => addEventListener(e, go, { once: true }));
    return () => events.forEach((e) => removeEventListener(e, go));
  }, [phase]);

  useEffect(() => {
    if (phase !== "morph") return;
    const slot = document.querySelector("[data-notch-cat]")?.getBoundingClientRect();
    const c = cat.current;
    const finish = () => {
      mark("landed");
      document.documentElement.style.overflow = "";
      setPhase("done");
    };
    try { sessionStorage.setItem(INTRO_KEY, "1"); } catch {}
    if (!slot || !c) {
      mark("intro");
      finish();
      return;
    }
    const from = c.getBoundingClientRect();
    const s = NOTCH_CAT_H / CAT_H;
    const opts = { duration: MORPH_MS, easing: ease, fill: "forwards" as const };
    c.animate(
      [
        { transform: "none", color: "var(--foreground)", clipPath: "inset(-20% -20% 0 -20%)" },
        // slot is the cat's box in the notch: it sits 8px left of the wrapper and its top is the wrapper's top
        { transform: `translate(${slot.left - 8 - from.left}px, ${slot.top - from.top}px) scale(${s})`, color: "#fff", clipPath: `inset(-20% -20% ${(1 - slot.height / NOTCH_CAT_H) * 100}% -20%)` },
      ],
      opts,
    ).onfinish = finish;
    ui.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" });
    bg.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: MORPH_MS * 0.55, delay: MORPH_MS * 0.4, easing: "ease-out", fill: "forwards" });
    const t = setTimeout(() => mark("intro"), MORPH_MS * 0.5);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;
  return (
    <div ref={layer} data-intro-layer aria-hidden={phase === "morph"} className={`fixed inset-0 z-[400] grid place-items-center ${phase === "morph" ? "pointer-events-none" : ""}`}>
      <div ref={bg} className="absolute inset-0 bg-background" />
      <div ref={cat} style={{ transformOrigin: "0 0", height: CAT_H, width: (CAT_H * 240) / 250 }} className="relative">
        <GradientCat className="h-[220px]" outlineClass="" variant={variant} />
      </div>
      <div ref={ui} className="absolute inset-x-0 top-[calc(50%+150px)] text-center text-foreground">
        {phase === "count" ? (
          <p role="status" className="text-5xl font-light tracking-tighter tabular-nums">{count}</p>
        ) : (
          <p className="text-sm tracking-wide text-foreground" style={{ animation: "intro-pulse 1.6s ease-in-out infinite" }}>tap to enter</p>
        )}
      </div>
    </div>
  );
}
