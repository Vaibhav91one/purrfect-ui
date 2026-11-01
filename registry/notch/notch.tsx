import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DivProps = Omit<ComponentProps<"div">, "children" | "color">;

export interface NotchProps extends DivProps {
  /** What sits in the tab: a logo, a wordmark, a nav. */
  children: ReactNode;
  /** Fill of the tab and of its two curved shoulders. Any CSS colour; the page background by default. */
  color?: string;
  /** Radius of the lower corners and the size of the shoulders, in px. */
  radius?: number;
  /** Drop in on mount. `false` renders it in place from the server HTML: use that when it holds navigation. */
  appear?: boolean;
  /** Seconds to wait before the tab drops in. */
  delay?: number;
  /** Gap in px between the container's top edge and the tab. */
  offset?: number;
  /** Classes for the positioning wrapper (absolute, full width). */
  className?: string;
  /** Classes for the tab itself: its width (at least 200px, 500px from md, growing to fit its content) and padding. */
  tabClassName?: string;
}

// one quarter-circle cut out of a square: the curve that blends the tab into the edge it hangs from
const SHOULDER = "M100 0H0v100C0 44.77 44.77 0 100 0";

/**
 * A tab that hangs from the top edge of its container, with inverse-rounded shoulders where it meets the edge, so it
 * reads as a notch cut into the frame. It drops in and fades up once on mount. Place it inside a `relative` container.
 * The entrance is a CSS transition from `@starting-style`, so it plays from first paint without waiting for hydration
 * (and shows in place where @starting-style is unsupported). Reduced motion: it fades in without moving.
 */
export function Notch({ children, color = "var(--background, #fff)", radius = 32, appear = true, delay = 0, offset = 0, className, tabClassName, style, ...rest }: NotchProps) {
  const shoulder = { width: radius, height: radius, top: -0.1, fill: color } as const; // -0.1px hides the seam against the edge; minHeight 2*radius keeps the shoulder clear of the bottom corner
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 z-50 flex justify-center px-8",
        // check-ignore: duration a one-off entrance, seen once per page load
        appear && "transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] starting:-translate-y-[26px] starting:opacity-0 motion-reduce:starting:translate-y-0",
        className,
      )}
      style={{ top: offset, transitionDelay: appear && delay ? `${delay}s` : undefined, ...style }}
      {...rest}
    >
      <div className={cn("pointer-events-auto relative isolate flex w-fit max-w-full min-w-[min(200px,100%)] items-center justify-center p-6 md:min-w-[min(500px,100%)]", tabClassName)} style={{ background: color, borderRadius: `0 0 ${radius}px ${radius}px`, minHeight: radius * 2 } as CSSProperties}>
        <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute rotate-90" style={{ ...shoulder, left: -radius }}>
          <path d={SHOULDER} />
        </svg>
        <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute -scale-y-100 rotate-90" style={{ ...shoulder, right: -radius }}>
          <path d={SHOULDER} />
        </svg>
        {/* min-w-0 + flex-wrap: past the container width the content wraps inside the tab instead of spilling out */}
        <div className="relative z-10 flex min-w-0 max-w-full flex-wrap items-center justify-center gap-2">{children}</div>
      </div>
    </div>
  );
}
