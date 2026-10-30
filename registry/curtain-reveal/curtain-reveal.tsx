import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface CurtainRevealProps extends ComponentProps<"div"> {
  /** Height of the revealed panel, any CSS length. One screen by default. */
  height?: string;
  /** Classes for the panel itself (background, padding, text colour). */
  className?: string;
  /** Classes for the outer box that sits in the page flow. */
  frameClassName?: string;
}

/**
 * A curtain reveal for the end of a page: as you scroll down, the page above lifts away and uncovers this panel, which
 * stays put underneath instead of scrolling up with it. A clipped box in the page flow holds a sticky panel twice its
 * height, so the browser does it all: no JavaScript, no scroll listener, nothing to slow down, and it renders on the
 * server. Put it last on the page (a footer, a contact block). There is no animation, so reduced motion changes nothing.
 */
export function CurtainReveal({ height = "100svh", className, frameClassName, style, children, ...rest }: CurtainRevealProps) {
  return (
    <div className={cn("relative h-[var(--curtain-h)] [clip-path:inset(0)]", frameClassName)} style={{ "--curtain-h": height } as CSSProperties}>
      <div className="relative -top-[var(--curtain-h)] h-[calc(var(--curtain-h)*2)]">
        <div className={cn("sticky top-0 h-[var(--curtain-h)] overflow-hidden bg-foreground text-background", className)} style={style} {...rest}>
          {children}
        </div>
      </div>
    </div>
  );
}
