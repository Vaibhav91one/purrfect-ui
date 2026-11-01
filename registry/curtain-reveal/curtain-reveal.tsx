import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface CurtainRevealProps extends ComponentProps<"div"> {
  /** Height of the revealed panel: a fixed length (px, svh, rem, or a calc/min of those), not % or auto. One screen by default. */
  height?: string;
  /** Classes for the panel itself (background, padding, text colour). Every other prop (id, style, data-*, aria-*) goes on the outer box. */
  className?: string;
  /** Classes for the outer box that sits in the page flow. */
  frameClassName?: string;
}

/**
 * A curtain reveal for the end of a page: as you scroll down, the page above lifts away and uncovers this panel, which
 * stays put underneath instead of scrolling up with it. A clipped box in the page flow holds a sticky panel twice its
 * height, so the browser does it all: no JavaScript, no scroll listener, nothing to slow down, and it renders on the
 * server. It sticks to the bottom of whatever scrolls, so it works inside a scrolling box as well as the page. Put it last
 * on the page (a footer, a contact block). There is no animation, so reduced motion changes nothing.
 */
export function CurtainReveal({ height = "100svh", className, frameClassName, style, children, ...rest }: CurtainRevealProps) {
  return (
    <div className={cn("relative h-[var(--curtain-h)] [clip-path:inset(0)]", frameClassName)} style={{ "--curtain-h": height, ...style } as CSSProperties} {...rest}>
      <div className="relative -top-[var(--curtain-h)] flex h-[calc(var(--curtain-h)*2)] flex-col justify-end">
        {/* pinned to the bottom of whatever scrolls (the page or a box), so a panel shorter than it shows too; a taller one pins by its bottom */}
        <div className={cn("sticky bottom-0 h-[var(--curtain-h)] shrink-0 overflow-hidden bg-foreground text-background", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
