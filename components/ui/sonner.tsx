"use client";

import { useSyncExternalStore } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// the theme is the `dark` class on <html> (set by the notch toggle), not prefers-color-scheme
const subscribe = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => o.disconnect();
};
const useTheme = () =>
  useSyncExternalStore<"dark" | "light">(subscribe, () => (document.documentElement.classList.contains("dark") ? "dark" : "light"), () => "dark");

/**
 * The one shared toast host: mount it once (app/layout.tsx), call `toast()` from "sonner" anywhere on the client.
 * Reuse it for new toasts and customise per call (`toast.success("…", { description, action })`) or change the
 * defaults here: position, duration and the look all come from tokens.
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme={useTheme()}
      position="bottom-center"
      duration={2000}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "24px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
