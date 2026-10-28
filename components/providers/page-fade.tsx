"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Each page change fades the new page in. Keyed on the pathname only, so a dialog opening (?c=) or any other
 * query change does not replay it. Opacity only: a transform here would break the notch's position: fixed.
 */
export function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef(pathname);
  useLayoutEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ref.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  }, [pathname]);
  return <div ref={ref}>{children}</div>;
}
