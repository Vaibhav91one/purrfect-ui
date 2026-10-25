"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { soloButton } from "./styles";

// The theme lives on <html class="dark"> (set before paint by the script in app/layout.tsx), so that is the store.
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
};
const isDark = () => document.documentElement.classList.contains("dark");

// The icon comes from the dark: variant, so the first paint is already right; the store only feeds aria-pressed.
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const toggle = () => {
    const next = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };
  return (
    <button type="button" onClick={toggle} aria-label="Dark theme" aria-pressed={dark} data-cuelume-toggle className={soloButton}>
      <Sun className="size-4 sm:size-5 dark:hidden" />
      <Moon className="hidden size-4 sm:size-5 dark:block" />
    </button>
  );
}
