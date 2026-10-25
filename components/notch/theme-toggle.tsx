"use client";

import { Moon, Sun } from "lucide-react";
import { iconButton } from "./styles";

// Flips html.dark and remembers it; the pre-paint script in app/layout.tsx reads the same "theme" key.
// The icon swap is CSS (dark: variant), so there is no state and nothing to hydrate.
export function ThemeToggle() {
  const toggle = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {}
  };
  return (
    <button type="button" onClick={toggle} aria-label="Toggle theme" data-cuelume-toggle className={iconButton}>
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </button>
  );
}
