"use client";

import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ArrowLinkProps extends ComponentProps<"a"> {
  /** The label. A string; it is drawn twice, the second copy waiting on the face below. */
  children: ReactNode;
}

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/**
 * A big "→ Label" link that rises out of a mask the first time it scrolls into view. On hover or keyboard focus the
 * arrow slides 8px right and the label rolls up, a copy rising from below inside its own clip. The roll is a flat 2D
 * translate, so the hit area never moves with it (a 3D turn poked out of the box and made hover flicker at the edges).
 * Hover only runs on devices that can hover, so taps never stick. Without JavaScript it is simply visible. Reduced
 * motion: it fades in instead of rising, the arrow stays put and the label copies cross-fade.
 */
export function ArrowLink({ children, className, ...rest }: ArrowLinkProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        el.dataset.in = "";
        io.disconnect();
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fade = "motion-reduce:transition-opacity motion-reduce:duration-300";
  return (
    <a className={cn("group/arrow inline-block max-w-full text-5xl leading-[1.15] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current", className)} {...rest}>
      <span className="sr-only">{children}</span>
      {/* The mask (observed, since the hidden text inside it is clipped away). The text hides only while scripting is on, so
          no-JS visitors see the link; the observer sets data-in on the mask. */}
      <span ref={ref} aria-hidden className="group/mask block overflow-clip [overflow-clip-margin:0.25em]">
        <span
          // check-ignore: duration the rise is a once-per-page entrance, matching the source's 1.2s
          className="flex items-center gap-[0.35em] transition-[translate,opacity] duration-[1200ms] ease-[cubic-bezier(0.18,0.66,0.18,1)] [@media(scripting:enabled)]:translate-y-[105%] group-data-[in]/mask:translate-y-0 motion-reduce:!translate-y-0 motion-reduce:duration-500 motion-reduce:[@media(scripting:enabled)]:opacity-0 motion-reduce:group-data-[in]/mask:opacity-100"
        >
          <svg viewBox="0 0 34 24" className={`h-[0.45em] w-[0.64em] flex-none transition-transform duration-300 ${EASE} [@media(hover:hover)]:group-hover/arrow:translate-x-2 group-focus-visible/arrow:translate-x-2 motion-reduce:!translate-x-0`}>
            <path d="M1 12h30M20 1l11 11-11 11" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="block min-w-0 overflow-clip [overflow-wrap:break-word]">
            <span className={`relative block transition-[translate] duration-300 ${EASE} [@media(hover:hover)]:group-hover/arrow:-translate-y-full group-focus-visible/arrow:-translate-y-full motion-reduce:!translate-y-0`}>
              <span className={cn("block", fade, "motion-reduce:[@media(hover:hover)]:group-hover/arrow:opacity-0 motion-reduce:group-focus-visible/arrow:opacity-0")}>{children}</span>
              <span className={cn("absolute inset-x-0 top-full block motion-reduce:top-0 motion-reduce:opacity-0", fade, "motion-reduce:[@media(hover:hover)]:group-hover/arrow:opacity-100 motion-reduce:group-focus-visible/arrow:opacity-100")}>{children}</span>
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}
