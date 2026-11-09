"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { SPRING } from "@/lib/motion";

const HOVER_IN_MS = 80;
const HOVER_OUT_MS = 260;

/**
 * A dialog control in the same dress as `Segmented`: a muted pill showing the choice, and the options dropping below it on hover
 * (mouse), a tap (touch) or Enter / arrow keys (keyboard). Esc closes the menu only, not the dialog around it.
 */
export function NotchSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const schedule = (next: boolean, ms: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), ms);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  // touch has no pointerleave: a tap anywhere else puts it away
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !root.current?.contains(e.target as Node) && schedule(false, 0);
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const pick = (o: string) => {
    onChange(o);
    schedule(false, 0);
    trigger.current?.focus({ preventScroll: true });
  };
  const rows = () => [...(root.current?.querySelectorAll<HTMLButtonElement>("[role=option]") ?? [])];

  return (
    <div
      ref={root}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && schedule(true, HOVER_IN_MS)}
      onPointerLeave={(e) => e.pointerType === "mouse" && !root.current?.matches(":has(:focus-visible)") && schedule(false, HOVER_OUT_MS)}
      onBlur={(e) => !root.current?.contains(e.relatedTarget as Node) && schedule(false, 120)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault(); // the dialog closes on Esc too: only the menu goes
          e.stopPropagation();
          schedule(false, 0);
          trigger.current?.focus();
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const r = rows();
          if (!open || !r.length) {
            schedule(true, 0);
            requestAnimationFrame(() => rows().find((b) => b.ariaSelected === "true")?.focus());
            return;
          }
          const i = r.indexOf(document.activeElement as HTMLButtonElement);
          r[(i + (e.key === "ArrowDown" ? 1 : -1) + r.length) % r.length]?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => schedule(!open, 0)}
        data-cuelume-tap
        className={`touch-hit inline-flex h-9 items-center gap-1.5 rounded-full pr-2.5 pl-3 text-sm sm:gap-2 sm:pr-3 sm:pl-4 text-foreground transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${open ? "bg-border" : "bg-muted hover:bg-border"}`}
      >
        <span className="text-muted-foreground max-sm:sr-only">{label}</span>{/* a phone shows just the choice, so the row fits over the stage */}
        <span>{value}</span>
        <ChevronDown className={`size-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {/* pt-2 keeps the pointer inside the hover area on its way down, as under the notch */}
      <AnimatePresence>
        {open && (
          <div className="absolute top-full left-0 z-20 min-w-full pt-2">
            <motion.div
              id={id}
              role="listbox"
              aria-label={label}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: 0 } : SPRING }}
              exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: reduce ? 0 : 0.12 } }}
              style={{ transformOrigin: "top left" }}
              className="flex w-max min-w-40 flex-col gap-0.5 rounded-2xl bg-muted p-1 text-sm shadow-[0_12px_32px_-8px_rgb(0_0_0/0.18)]"
            >
              {options.map((o) => (
                <button key={o} type="button" role="option" aria-selected={o === value} onClick={() => pick(o)} data-cuelume-select className={`flex items-center gap-3 rounded-xl px-3 py-1.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent ${o === value ? "bg-border text-foreground" : "text-muted-foreground hover:bg-border/50 hover:text-foreground"}`}>
                  <span className="flex-1 text-left">{o}</span>
                  {o === value && <Check className="size-3.5 text-muted-foreground" />}
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
