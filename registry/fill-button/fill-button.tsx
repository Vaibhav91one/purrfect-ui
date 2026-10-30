"use client";

import { useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type FocusEvent, type HTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Base = { children: ReactNode; className?: string };
export type FillButtonProps =
  | (Base & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children">)
  | (Base & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">);

/**
 * An outlined pill whose fill sweeps in from the left on hover or keyboard focus and sweeps out to the right on leave, the
 * label switching colour with it. One CSS transition does the sweep; a data attribute says which way, so React never
 * re-renders. Touch and pen get the press colour only. Reduced motion: the fill fades in and out instead of sweeping.
 */
export function FillButton({ className, children, ...rest }: FillButtonProps) {
  const fill = useRef<HTMLSpanElement>(null);
  // in: slide to 0 from wherever it is. out: slide off to the right, then jump back to the left with no transition
  const go = (state: "in" | "out") => {
    const el = fill.current;
    if (!el || (state === "out" && el.dataset.state === "idle")) return; // nothing showing, nothing to sweep out
    el.dataset.state = state;
    if (state === "out") el.addEventListener("transitionend", () => el.dataset.state === "out" && (el.dataset.state = "idle"), { once: true });
  };
  // yours run first, then the sweep
  const own = rest as HTMLAttributes<HTMLElement>;
  const on = {
    onPointerEnter: (e: PointerEvent<HTMLElement>) => (own.onPointerEnter?.(e), e.pointerType === "mouse" && go("in")),
    onPointerLeave: (e: PointerEvent<HTMLElement>) => (own.onPointerLeave?.(e), e.pointerType === "mouse" && go("out")),
    onFocus: (e: FocusEvent<HTMLElement>) => (own.onFocus?.(e), e.currentTarget.matches(":focus-visible") && go("in")),
    onBlur: (e: FocusEvent<HTMLElement>) => (own.onBlur?.(e), go("out")),
  };
  const cls = cn(
    "group/fill relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-foreground px-6 py-3 text-sm font-semibold whitespace-nowrap text-foreground transition-colors duration-300 ease-out active:text-background has-[[data-state=in]]:text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground disabled:pointer-events-none disabled:opacity-50",
    className,
  );
  const inner = (
    <>
      <span
        ref={fill}
        aria-hidden
        data-state="idle"
        className="absolute inset-0 -z-10 bg-foreground transition-[translate,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=idle]:-translate-x-full data-[state=idle]:transition-none data-[state=in]:translate-x-0 data-[state=out]:translate-x-full group-active/fill:translate-x-0 motion-reduce:!translate-x-0 motion-reduce:data-[state=idle]:opacity-0 motion-reduce:data-[state=out]:opacity-0"
      />
      {children}
    </>
  );
  if ("href" in rest && rest.href !== undefined)
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} {...on}>
        {inner}
      </a>
    );
  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} {...on}>
      {inner}
    </button>
  );
}
