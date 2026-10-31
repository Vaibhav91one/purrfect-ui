"use client";

import { useEffect, useRef, type ComponentProps, type ImgHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PeekCardProps extends Omit<ComponentProps<"article">, "title" | "ref"> {
  /** An image URL, or any node (a gradient, a video) that fills the media area. */
  image?: string | ReactNode;
  /** Extra attributes for the <img> when `image` is a URL (alt, loading, sizes...). */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src">;
  title: ReactNode;
  /** Shown once the panel opens. */
  description?: ReactNode;
  /** Small line(s) under the description: a date, a place, a status. */
  meta?: ReactNode;
  /** The big number in the corner. */
  index?: number | string;
  /** Makes the whole card a link (the title is the link text). */
  href?: string;
  /** "card": a tall card whose panel peeks up. "row": a wide row with an arrow that appears on hover. */
  variant?: "card" | "row";
  /** A past or closed item: dimmed, and the arrow stays put. */
  muted?: boolean;
}

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

// check-ignore: hardcoded-color the number sits on the photo, so it is white with a shadow in either theme
const NUMBER = "pointer-events-none absolute z-10 leading-none tracking-tight text-white/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.35)]";

function Media({ image, imgProps }: Pick<PeekCardProps, "image" | "imgProps">) {
  if (typeof image !== "string") return image;
  // eslint-disable-next-line @next/next/no-img-element -- a registry component cannot assume next/image
  return <img src={image} alt="" loading="lazy" {...imgProps} className={cn("size-full object-cover", imgProps?.className)} />;
}

function Title({ href, children, className }: { href?: string; children: ReactNode; className: string }) {
  if (!href) return <h3 className={className}>{children}</h3>;
  return (
    <h3 className={className}>
      {/* the stretched ::after makes the whole card the click and focus target */}
      <a
        href={href}
        className="outline-none after:absolute after:inset-0 after:z-20 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
      >
        {children}
      </a>
    </h3>
  );
}

const Asterisk = () => (
  // check-ignore: duration a slow ambient spin, not UI feedback
  <svg viewBox="0 0 24 24" aria-hidden className="size-8 animate-[spin_8s_linear_infinite] fill-current motion-reduce:animate-none">
    <path d="M10.6 1h2.8v8.2l7.1-4.1 1.4 2.4-7.1 4.1 7.1 4.1-1.4 2.4-7.1-4.1V23h-2.8v-8.2l-7.1 4.1-1.4-2.4 7.1-4.1-7.1-4.1 1.4-2.4 7.1 4.1z" />
  </svg>
);

// the wrapper flips it for RTL, so the svg's own scale stays free for the hover
const Arrow = ({ className }: { className?: string }) => (
  <span className="inline-flex shrink-0 rtl:-scale-x-100">
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  </span>
);

/**
 * A card that fades up as it scrolls into view. Hover zooms the image and slides a panel up from the bottom edge, then
 * fades in the description and meta; a big index number sits top-left and an asterisk spins in the panel. The "row"
 * variant is a wide card whose up-right arrow grows in on hover, with a dimmed `muted` state for past or closed items.
 * All of it is CSS on group-hover / focus, so React never re-renders. Touch (no hover) shows the panel open and the arrow
 * visible; keyboard focus opens it too. Reduced motion: no fade-up travel, no zoom, no spin, and the panel's details fade
 * in place instead of sliding.
 */
// open = hover (Tailwind's group-hover is already hover-capable only), keyboard focus inside, or a device with no hover.
// Written out in full per class so Tailwind sees them.
export function PeekCard({ image, imgProps, title, description, meta, index, href, variant = "card", muted = false, className, ...rest }: PeekCardProps) {
  const root = useRef<HTMLElement>(null);

  // fade up once in view: a data attribute, not state, so no re-render
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return void (el.dataset.shown = "");
    const io = new IntersectionObserver(([e]) => e.isIntersecting && ((el.dataset.shown = ""), io.disconnect()), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // check-ignore: duration the fade-up is a once-per-card entrance
  const appear = `opacity-0 translate-y-5 transition-[opacity,translate] duration-500 ${EASE} data-[shown]:translate-y-0 data-[shown]:opacity-100 motion-reduce:translate-y-0`;

  if (variant === "row")
    return (
      <article
        ref={root}
        className={cn(
          "group/peek relative flex w-full flex-col overflow-hidden bg-muted/60 text-foreground transition-[background-color,opacity,translate] sm:flex-row",
          appear,
          muted ? "data-[shown]:opacity-60" : "hover:bg-muted",
          className,
        )}
        {...rest}
      >
        {image != null && (
          <div className="relative h-48 w-full shrink-0 overflow-hidden bg-muted sm:h-auto sm:min-h-56 sm:w-56 lg:w-64">
            <div className="absolute inset-0">
              <Media image={image} imgProps={imgProps} />
            </div>
            {index != null && (
              <span aria-hidden className={cn(NUMBER, "bottom-3 left-3 text-2xl font-bold")}>
                {index}
              </span>
            )}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-6">
          {meta && <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">{meta}</div>}
          <div className="mt-auto flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Title href={href} className="text-xl leading-tight tracking-tight break-words md:text-4xl">
                {title}
              </Title>
              {description && <p className="mt-2 line-clamp-2 leading-tight text-muted-foreground">{description}</p>}
            </div>
            <Arrow
              className={cn(
                // check-ignore: duration the arrow is a slow reveal on a big card, as on the original site
                `size-12 shrink-0 transition-[opacity,scale] duration-500 ${EASE} md:size-20 motion-reduce:scale-100`,
                muted
                  ? "opacity-70"
                  : "scale-80 opacity-0 group-hover/peek:scale-100 group-has-[:focus-visible]/peek:scale-100 [@media(hover:none)]:scale-100 group-hover/peek:opacity-100 group-has-[:focus-visible]/peek:opacity-100 [@media(hover:none)]:opacity-100",
              )}
            />
          </div>
        </div>
      </article>
    );

  return (
    <article
      ref={root}
      className={cn("group/peek relative aspect-[4/5] w-full overflow-hidden bg-muted text-card-foreground", appear, muted && "data-[shown]:opacity-60", className)}
      {...rest}
    >
      <div className="absolute inset-0 overflow-hidden">
                <div
          className={cn(
            // check-ignore: duration the 500ms zoom is the slow drift this card is about
            `size-full transition-[scale] duration-500 ${EASE} motion-reduce:!scale-100 [&>*]:size-full [&>*]:object-cover`,
            "group-hover/peek:scale-110 group-has-[:focus-visible]/peek:scale-110",
          )}
        >
          <Media image={image} imgProps={imgProps} />
        </div>
      </div>
      {index != null && (
        <span aria-hidden className={cn(NUMBER, "start-4 top-4 max-w-[calc(100%-2rem)] truncate text-6xl")}>
          {index}
        </span>
      )}

            <div
        className={cn(
          // check-ignore: duration the panel slide is the card's one big move, as on the original site
          `absolute end-0 bottom-0 z-10 flex min-h-[180px] w-[85%] max-w-sm translate-y-[52%] bg-card transition-[translate] duration-500 ${EASE} motion-reduce:!translate-y-0`,
          "group-hover/peek:translate-y-0 group-has-[:focus-visible]/peek:translate-y-0 [@media(hover:none)]:translate-y-0",
        )}
      >
        <div className="shrink-0 p-6 sm:p-8">
          <Asterisk />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-4 pe-6 sm:pe-8">
          <Title href={href} className="line-clamp-3 text-lg leading-tight tracking-tight break-words md:text-2xl">
            {title}
          </Title>
          {description && (
            <p
              className={cn(
                `line-clamp-4 text-sm leading-tight text-muted-foreground opacity-0 transition-opacity duration-300 ${EASE}`,
                "group-hover/peek:opacity-100 group-has-[:focus-visible]/peek:opacity-100 [@media(hover:none)]:opacity-100 group-hover/peek:delay-100 group-has-[:focus-visible]/peek:delay-100 [@media(hover:none)]:delay-100",
              )}
            >
              {description}
            </p>
          )}
          {meta && (
            <div
              className={cn(
                `mt-auto flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity duration-300 ${EASE}`,
                "group-hover/peek:opacity-100 group-has-[:focus-visible]/peek:opacity-100 [@media(hover:none)]:opacity-100 group-hover/peek:delay-150 group-has-[:focus-visible]/peek:delay-150 [@media(hover:none)]:delay-150",
              )}
            >
              {meta}
            </div>
          )}
          {href && (
            <span className="ms-auto">
              <Arrow className="size-8" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
