"use client";

import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/utils";

export type DrawerLink = { label: string; href: string };

export interface DrawerMenuProps extends Omit<ComponentProps<"div">, "children"> {
  /** The links in the panel, top to bottom. */
  links: DrawerLink[];
  /** The `href` of the current page or section: its dot shows while nothing is hovered or focused. */
  active?: string;
  /** The small heading over the links. */
  heading?: ReactNode;
  /** Pinned to the bottom of the panel: social links, an email, small print. */
  footer?: ReactNode;
  /** Fill the nearest `relative` parent instead of the screen: for a card, a preview or a frame. */
  contained?: boolean;
  /** Start open (uncontrolled). */
  defaultOpen?: boolean;
  /** Controlled state. Leave it out and the menu manages itself. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classes for the round button's position (top-right, 20px in, by default). */
  className?: string;
}

const EASE = [0.76, 0, 0.24, 1] as const;
const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** The panel. While it plays its exit it is inert, so a link can't be hit or tabbed to while it slides away. */
function Panel({ id, pos, reduce, ref, children }: { id: string; pos: string; reduce: boolean; ref: Ref<HTMLDivElement>; children: ReactNode }) {
  const present = useIsPresent();
  return (
    <motion.div
      ref={ref}
      id={id}
      inert={!present}
      role="dialog"
      aria-modal
      aria-label="Menu"
      className={`${pos} top-0 right-0 z-40 h-full w-full max-w-md overflow-y-auto bg-foreground text-background`}
      initial={reduce ? { opacity: 0 } : { transform: "translateX(100%)" }}
      // the reduced-motion target still names the resting transform: useReducedMotion settles after the first render, so the panel can mount with the slide's start state
      animate={{ opacity: 1, transform: "translateX(0%)" }}
      exit={reduce ? { opacity: 0 } : { transform: "translateX(100%)" }}
      // check-ignore: duration a full-height panel crossing the frame; shorter reads as a jump
      transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A round button whose two lines cross into an X, opening a full-height panel that slides in from the right. The links
 * follow it in one after another, and a dot grows beside the hovered or focused link (or the `active` one when nothing is).
 * Escape, a click outside or a link closes it; focus moves into the panel and comes back to the button, and Tab stays inside
 * while it is open. Reduced motion: the panel and links fade, nothing slides.
 */
export function DrawerMenu({ links, active, heading = "Navigation", footer, contained = false, defaultOpen = false, open, onOpenChange, className, onKeyDown, ...rest }: DrawerMenuProps) {
  const reduce = useReducedMotion() ?? false;
  const id = useId();
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const [hot, setHot] = useState<string | null>(null); // the hovered or focused link
  // the window listeners outlive the render that added them: read the latest callback, not the one they closed over
  const change = useRef(onOpenChange);
  useEffect(() => {
    change.current = onOpenChange;
  });
  const set = (v: boolean) => {
    own.current = true;
    setInner(v);
    change.current?.(v);
  };
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const was = useRef(isOpen); // focus only moves when the state actually changed, not on mount
  const own = useRef(false); // the change came from this menu (its button, a link, Escape), not from a controlling parent

  useEffect(() => {
    const changed = was.current !== isOpen;
    was.current = isOpen;
    const mine = own.current;
    own.current = false;
    if (!isOpen) {
      // back to the button only if focus was in the panel: an outside click or a parent closing it leaves focus where it is
      if (changed && panel.current?.contains(document.activeElement)) button.current?.focus({ preventScroll: true });
      return;
    }
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault(); // the menu takes this Esc: a dialog or sheet around it stays open
      set(false);
    };
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !button.current?.contains(t)) set(false);
    };
    // check-ignore: global-keys only while the menu is open: it is modal, so Escape closes it wherever focus is
    window.addEventListener("keydown", esc);
    document.addEventListener("pointerdown", outside);
    // into the panel only when the person opened it here; a parent opening it (a demo loop, a route change) never steals focus
    const t = !changed || !mine ? 0 : setTimeout(() => panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true }), 120);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", esc);
      document.removeEventListener("pointerdown", outside);
    };
  }, [isOpen]);

  // Tab cycles through the panel and the button, never out to the page behind
  const trap = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (!isOpen || e.key !== "Tab") return;
    const all = [...(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []), button.current!];
    const at = all.indexOf(document.activeElement as HTMLElement);
    e.preventDefault();
    all[(at + (e.shiftKey ? -1 : 1) + all.length) % all.length].focus();
  };

  const pos = contained ? "absolute" : "fixed";
  const dot = hot ?? active;
  const line = "absolute h-px w-2/5 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none";

  return (
    <div onKeyDown={trap} {...rest}>
      <button
        ref={button}
        type="button"
        aria-expanded={isOpen}
        aria-controls={isOpen ? id : undefined}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        onClick={() => set(!isOpen)}
        className={cn(`${pos} top-0 right-0 z-50 m-5 grid size-16 place-items-center rounded-full bg-muted-foreground text-background transition-transform duration-150 ease-out active:scale-95 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-muted-foreground`, className)}
      >
        <span className={`${line} ${isOpen ? "rotate-45" : "-translate-y-[5px]"}`} />
        <span className={`${line} ${isOpen ? "-rotate-45" : "translate-y-[5px]"}`} />
      </button>

      {/* a menu that starts open (defaultOpen) is drawn open, without the entrance: the server HTML matches */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <Panel key="panel" ref={panel} id={id} pos={pos} reduce={reduce}>
            <div className="flex min-h-full flex-col justify-between gap-12 px-10 pt-28 pb-10">
              <nav aria-label="Menu" onPointerLeave={() => setHot(null)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHot(null)}>
                <div className="mb-10 border-b border-background/40 pb-2 text-xs tracking-wide text-background/60 uppercase">{heading}</div>
                <ul className="flex flex-col gap-3 text-[40px] leading-tight font-light">
                  {links.map((l, i) => (
                    <motion.li
                      key={`${l.href}-${i}`}
                      className="relative flex items-center"
                      initial={{ opacity: 0, transform: `translateX(${reduce ? 0 : 60}px)` }}
                      animate={{ opacity: 1, transform: "translateX(0px)" }}
                      exit={{ opacity: 0, transform: `translateX(${reduce ? 0 : 60}px)` }}
                      // check-ignore: duration the links ride in with the panel; the stagger is what makes them read as following it
                      transition={{ duration: reduce ? 0.2 : 0.6, delay: reduce ? 0 : Math.min(i, 10) * 0.03, ease: EASE }}
                    >
                      <span aria-hidden className={`absolute -start-7 size-2.5 rounded-full bg-current transition-transform duration-300 ease-out motion-reduce:transition-opacity ${dot === l.href ? "scale-100 opacity-100" : "scale-25 opacity-0"}`} />
                      <a
                        href={l.href}
                        aria-current={active === l.href ? "page" : undefined}
                        onClick={() => set(false)}
                        // mouse only: a tap would leave the dot stuck on the link it touched
                        onPointerEnter={(e) => e.pointerType === "mouse" && setHot(l.href)}
                        onFocus={() => setHot(l.href)}
                        className="min-w-0 rounded-sm [overflow-wrap:anywhere] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background"
                      >
                        {l.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              {footer && <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">{footer}</div>}
            </div>
          </Panel>
        )}
      </AnimatePresence>
    </div>
  );
}
