"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface StickyCrossfadeProps extends Omit<ComponentProps<"div">, "children"> {
  /** One picture per block, in order; with fewer pictures than blocks they repeat. */
  pictures: ReactNode[];
  /** The text column. Mark each block that should switch the picture with `data-pic-block`. */
  children: ReactNode;
  /** Size of the picture box (width, aspect ratio, radius). */
  pictureClassName?: string;
  /** Watch a scrolling box instead of the page: the picture switches as blocks pass the middle of that box. */
  container?: RefObject<Element | null>;
}

/**
 * Two columns: a picture that sticks at the vertical middle of the screen beside a column of text, crossfading
 * (opacity plus a 1.02 to 1 settle) to the next picture each time a `[data-pic-block]` crosses the middle of the screen.
 * One IntersectionObserver watches everything above the middle of the scroll root, so nothing runs on scroll, state
 * changes only when a block crosses, and a jump scroll still lands on the right picture. The picture is centred in a
 * root-tall sticky box, so it never paints above the component, and it shrinks to fit a short window. The layout follows its own width (a container query): narrower than 48rem it stacks and shows
 * the first picture only, in flow.
 */
export function StickyCrossfade({ pictures, children, pictureClassName, container, className, ...rest }: StickyCrossfadeProps) {
  const text = useRef<HTMLDivElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const blocks = [...(text.current?.querySelectorAll<HTMLElement>("[data-pic-block]") ?? [])];
    // a block counts once its top is above the middle of the root; the active one is the last that counts
    const above = blocks.map(() => false);
    const root = container?.current ?? null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) above[blocks.indexOf(e.target as HTMLElement)] = e.isIntersecting;
        setActive(Math.max(0, above.lastIndexOf(true)));
      },
      // everything above the root's middle (the region grows far upward): a block is in it exactly when its top is above
      // the middle, so even a jump scroll (Home/End, an anchor) that skips past a block reports it
      { root, rootMargin: "100000px 0px -50% 0px" },
    );
    blocks.forEach((b) => io.observe(b));
    // the sticky box is one root tall and centres the picture in it; a scrolling box gives its own height
    // ponytail: measured once per mount, a ResizeObserver if the box resizes while mounted
    if (root) stick.current?.style.setProperty("--root-h", `${root.clientHeight}px`);
    return () => io.disconnect();
  }, [children, container]);

  const shown = pictures.length ? active % pictures.length : 0;
  return (
    <div className={cn("@container", className)} {...rest}>
      <div className="grid @3xl:grid-cols-[43%_57%]">
        <div ref={stick} className="mb-10 self-start @3xl:sticky @3xl:top-0 @3xl:mb-0 @3xl:ml-[22.8%] @3xl:flex @3xl:h-[var(--root-h,100svh)] @3xl:items-center">
          <div
            className={cn(
              // the 3/4 box shrinks to stay 2rem shorter than the root, so a short window never clips it
              "grid aspect-[3/4] w-56 max-w-full overflow-hidden rounded-sm bg-muted @3xl:w-80 @3xl:max-w-[calc((var(--root-h,100svh)-2rem)*3/4)]",
              pictureClassName,
            )}
          >
            {pictures.map((p, i) => (
              // positional slides: the active index selects one, and pictures can repeat
              <div
                key={i}
                aria-hidden={i !== shown}
                className={cn(
                  // check-ignore: duration the source's 800ms page-level crossfade; it plays once per block crossing
                  "col-start-1 row-start-1 transition-[opacity,scale] duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity motion-reduce:duration-300 [&>*]:size-full [&>*]:object-cover",
                  // the incoming slide fades in on top while the outgoing one stays opaque under it, then goes, so the
                  // box never shows through mid-fade (a transition's delay comes from the state it is moving to)
                  i === shown
                    ? "z-[1] scale-100 opacity-100"
                    : "scale-[1.02] opacity-0 delay-[800ms] motion-reduce:scale-100 motion-reduce:delay-300",
                  // narrow: the first picture only, never swapped
                  i === 0 ? "@max-3xl:!scale-100 @max-3xl:!opacity-100" : "@max-3xl:hidden",
                )}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
        <div ref={text} className="min-w-0 @3xl:pr-8">
          {children}
        </div>
      </div>
    </div>
  );
}
