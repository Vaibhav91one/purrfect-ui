"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface GridDisclosureItem {
  /** The always-visible row: a question, a heading. A row with an empty title is skipped (it would be a button with no name). */
  title: ReactNode;
  /** What opens under it. */
  content: ReactNode;
}

export interface GridDisclosureProps extends Omit<ComponentProps<"ul">, "children" | "defaultValue" | "onChange"> {
  items: GridDisclosureItem[];
  /** Controlled open row (index), or `null` for all closed. Leave it out and the list keeps its own state. */
  value?: number | null;
  /** Starting open row when uncontrolled. Defaults to the first; `null` starts all closed. */
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  /** Replaces the caret. It still turns half a circle when its row opens. */
  icon?: ReactNode;
}

const Caret = () => (
  <svg viewBox="0 0 256 256" fill="currentColor" className="size-full">
    <path d="M213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z" />
  </svg>
);

/**
 * A list where one row opens at a time. Each panel animates its grid row between 0fr and 1fr, so it opens to whatever
 * its content measures without anyone measuring it; the caret turns with it. Closed panels are `inert`, so Tab never
 * lands inside an answer nobody can see. Each row is a real button with `aria-expanded` and `aria-controls`.
 * Under `prefers-reduced-motion` the panel only fades and the caret flips without turning.
 */
export function GridDisclosure({ items, value, defaultValue = 0, onValueChange, icon, className, ...rest }: GridDisclosureProps) {
  const id = useId();
  const [inner, setInner] = useState<number | null>(defaultValue);
  const open = value === undefined ? inner : value;

  const toggle = (i: number) => {
    const next = open === i ? null : i;
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  return (
    <ul className={cn("flex flex-col", className)} {...rest}>
      {items.map((item, i) => {
        if (item.title == null || item.title === "") return null; // indices stay those of `items`
        const isOpen = open === i;
        return (
          <li key={i} className="border-b border-border first:border-t">
            <h3>
              <button
                id={`${id}-b${i}`}
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-p${i}`}
                onClick={() => toggle(i)}
                className="flex w-full cursor-pointer items-center gap-4 py-5 text-start text-base font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span className="min-w-0 flex-1 break-words">{item.title}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-4 shrink-0 place-items-center text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                    isOpen && "rotate-180",
                  )}
                >
                  {icon ?? <Caret />}
                </span>
              </button>
            </h3>
            {/* grid rows 0fr→1fr: animates to the content's own height without measuring it */}
            <div
              id={`${id}-p${i}`}
              role="region"
              aria-labelledby={`${id}-b${i}`}
              inert={!isOpen}
              className="grid transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pb-5 text-sm leading-relaxed break-words text-muted-foreground">{item.content}</div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
