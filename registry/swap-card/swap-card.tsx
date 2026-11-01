import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SwapCardProps extends Omit<ComponentProps<"button">, "children" | "title"> {
  /** What the card shows at rest: an image, usually. It fills the card (use `size-full object-cover`). */
  image: ReactNode;
  /** What it crossfades to on hover, focus or press: a detail shot, the back, the product in use. */
  hoverImage: ReactNode;
  title: ReactNode;
  /** The quieter second line under the title. */
  subtitle?: ReactNode;
  /** The wobbly bag badge in the corner. */
  badge?: boolean;
}

// a 48-point ring whose radius wobbles every other pair of points, drawn once at import
const RING = (() => {
  let d = "";
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2, r = 26 + (i % 4 < 2 ? 2 : -1.5);
    d += (i ? "L" : "M") + (28 + Math.cos(a) * r).toFixed(1) + " " + (28 + Math.sin(a) * r).toFixed(1);
  }
  return d + "Z";
})();

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/**
 * A product card: on hover the image crossfades to a second one while the first zooms in and the second settles from a
 * slight zoom (fade 400ms, zoom 900ms), a wobbly badge ring turns 30 degrees and inverts its colours, and the title nudges
 * forward (right, or left in RTL). Pure CSS on one `group` button, so it costs nothing per frame and renders the same on the server. Hover only
 * applies on devices that really hover (Tailwind's `hover:` is gated on `(hover: hover)`), so a tap never leaves it stuck;
 * keyboard focus (`:focus-visible`) and a press (`:active`, the finger on a phone) show the same state. Reduced motion:
 * the images still crossfade and the badge still inverts, but nothing zooms, turns or moves. A `disabled` card dims and
 * plays no hover. Content sits at the top, so images line up in a grid row of mixed title lengths; the badge scales with
 * a narrow card (22% of its width, 36-56px).
 */
export function SwapCard({ image, hoverImage, title, subtitle, badge = true, type = "button", className, ...rest }: SwapCardProps) {
  return (
    <button
      type={type}
      className={cn(
        "group flex w-full flex-col rounded-2xl text-start outline-hidden transition-[scale] duration-150 active:scale-[.98] disabled:pointer-events-none disabled:opacity-60 motion-reduce:active:scale-100",
        EASE,
        className,
      )}
      {...rest}
    >
      <div className="relative aspect-[448/598] overflow-hidden rounded-2xl bg-muted ring-ring ring-offset-2 ring-offset-background group-focus-visible:ring-2">
        {badge && (
          <span
            className={cn(
              "absolute top-[3%] right-[4%] z-[2] aspect-square w-[22%] min-w-9 max-w-14 text-background transition-colors duration-200 group-hover:text-foreground group-focus-visible:text-foreground group-active:text-foreground",
              EASE,
            )}
          >
            <svg viewBox="0 0 56 56" aria-hidden className="block size-full">
              <path
                d={RING}
                fill="currentColor"
                className={cn(
                  // check-ignore: duration the ring turns slowly on purpose, like the source (600ms)
                  "origin-center transition-[rotate] duration-[600ms] [transform-box:fill-box] group-hover:rotate-30 group-focus-visible:rotate-30 group-active:rotate-30 motion-reduce:!rotate-0",
                  EASE,
                )}
              />
              <path
                d="M19 24h18l-1.5 14h-15zM23 24v-2a5 5 0 0 1 10 0v2"
                fill="none"
                strokeWidth="1.8"
                strokeLinejoin="round"
                className={cn(
                  "stroke-foreground transition-[stroke] duration-200 group-hover:stroke-background group-focus-visible:stroke-background group-active:stroke-background",
                  EASE,
                )}
              />
            </svg>
          </span>
        )}
        <div
          className={cn(
            // check-ignore: duration the zoom is a slow 900ms drift under a 400ms fade, like the source
            "absolute inset-0 transition-[opacity,scale] duration-[400ms,900ms] group-hover:scale-105 group-focus-visible:scale-105 group-active:scale-105 motion-reduce:!scale-100",
            EASE,
          )}
        >
          {image}
        </div>
        <div
          className={cn(
            // check-ignore: duration the zoom is a slow 900ms drift under a 400ms fade, like the source
            "absolute inset-0 scale-[1.08] opacity-0 transition-[opacity,scale] duration-[400ms,900ms] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 group-active:scale-100 group-active:opacity-100 motion-reduce:!scale-100",
            EASE,
          )}
        >
          {hoverImage}
        </div>
      </div>
      <div className="pt-2">
        <span
          className={cn(
            "inline-block max-w-full break-words transition-[translate] duration-300 group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 group-active:translate-x-1.5 rtl:group-hover:-translate-x-1.5 rtl:group-focus-visible:-translate-x-1.5 rtl:group-active:-translate-x-1.5 motion-reduce:!translate-x-0",
            EASE,
          )}
        >
          {title}
          {subtitle != null && (
            <>
              <br />
              <span className="text-muted-foreground">{subtitle}</span>
            </>
          )}
        </span>
      </div>
    </button>
  );
}
