"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface AnnounceStripProps extends Omit<ComponentProps<"div">, "children"> {
  /** One copy of the line: text, an icon. It is repeated to fill the width, so put the gap after it (padding) inside. */
  children: ReactNode;
  /** Seconds for one copy of the line to pass, so the speed is the same on every screen width. */
  duration?: number;
  /** Shown or put away by the parent. A dismissed strip closes the same way it does when you scroll down. */
  open?: boolean;
  /** Adds a close button on the right that calls this. */
  onDismiss?: () => void;
  /** Put the strip away while scrolling down and bring it back on the way up. */
  hideOnScroll?: boolean;
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
}

/** How far the page travels one way before the strip reacts, so a smooth-scroll overshoot is not read as a turn. */
const TRAVEL = 48;
/** Near the top it always shows. */
const SETTLE = 80;

/**
 * A thin announcement strip whose line runs past forever, with an optional close button. Put it at the top of a sticky
 * header: it slides up and closes its row while you scroll down (or once dismissed), so the header takes its place, and
 * comes back on the way up. The loop is two identical copies of the track moved by exactly half its width on the compositor
 * (Web Animations, transform only), so it is seamless and never reads layout per frame. It pauses off screen, under the
 * mouse, after a tap (tap again to resume) and while something in it has focus. Screen readers and Tab get the line once;
 * the repeats are inert. Reduced motion: the line stands still and wraps so all of it is readable, and the strip fades
 * instead of sliding while its row closes, with no row collapse.
 */
export function AnnounceStrip({ children, duration = 40, open = true, onDismiss, hideOnScroll = true, container, className, ...rest }: AnnounceStripProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  // hover and focus hold the loop separately: the mouse leaving must not resume it while the close button has focus
  const held = useRef({ hover: false, focus: false, tap: false });
  const sync = useRef(() => {});
  const awayRef = useRef(false);
  // where the loop was, so a new copy count (resize) or duration carries on instead of snapping back to the start
  const at = useRef(0);
  const [count, setCount] = useState(3);
  const [hidden, setHidden] = useState(false);
  const away = !open || hidden;

  // enough copies of the line that one half of the track is at least as wide as the strip
  useEffect(() => {
    const box = root.current, one = first.current;
    if (!box || !one) return;
    const ro = new ResizeObserver(() => {
      if (one.offsetWidth) setCount(Math.max(1, Math.ceil(box.offsetWidth / one.offsetWidth)));
    });
    ro.observe(box);
    ro.observe(one);
    return () => ro.disconnect();
  }, []);

  // the loop: compositor-only, paused off screen, while held, while away, and stopped for reduced motion
  useEffect(() => {
    const el = track.current, box = root.current;
    if (!el || !box) return;
    // half the track is `count` copies, so this keeps one copy per `duration`; RTL starts flush right and runs the other way
    const ms = duration * count * 1000;
    const end = getComputedStyle(el).direction === "rtl" ? "50%" : "-50%";
    const anim = el.animate([{ transform: "translateX(0)" }, { transform: `translateX(${end})` }], { duration: ms, iterations: Infinity });
    anim.currentTime = at.current % ms;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let seen = false;
    const update = () => {
      if (mq.matches) anim.cancel();
      else if (seen && !held.current.hover && !held.current.focus && !held.current.tap && !awayRef.current) anim.play();
      else anim.pause();
    };
    sync.current = update;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      update();
    });
    io.observe(box);
    mq.addEventListener("change", update);
    update();
    return () => {
      io.disconnect();
      mq.removeEventListener("change", update);
      at.current = Number(anim.currentTime) || 0;
      anim.cancel();
    };
  }, [duration, count]);

  useEffect(() => {
    awayRef.current = away;
    sync.current();
  }, [away]);

  // away going down, back coming up; distance is counted from the last change of direction
  useEffect(() => {
    if (!hideOnScroll) return;
    const target: HTMLElement | Window = container?.current ?? window;
    const y = () => (target instanceof Window ? target.scrollY : target.scrollTop);
    let last = y(), travelled = 0;
    const onScroll = () => {
      const now = y(), step = now - last;
      last = now;
      if (step > 0 !== travelled > 0) travelled = 0;
      travelled += step;
      if (now <= SETTLE) setHidden(false);
      else if (travelled > TRAVEL) setHidden(true);
      else if (travelled < -TRAVEL) setHidden(false);
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [hideOnScroll, container]);

  const hold = (by: "hover" | "focus" | "tap", on: boolean) => {
    held.current[by] = on;
    sync.current();
  };

  return (
    <div
      ref={root}
      // the row closes as the strip slides, so the header below takes the space instead of leaving a gap
      className={cn("grid bg-primary text-sm font-medium text-primary-foreground transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none", className)}
      style={{ gridTemplateRows: away ? "0fr" : "1fr" }}
      onPointerEnter={(e) => e.pointerType === "mouse" && hold("hover", true)}
      onPointerLeave={() => hold("hover", false)}
      // touch has no hover: a tap toggles the pause
      onPointerDown={(e) => e.pointerType !== "mouse" && hold("tap", !held.current.tap)}
      onFocus={() => hold("focus", true)}
      onBlur={() => hold("focus", false)}
      {...rest}
    >
      <div className="min-h-0 overflow-hidden bg-inherit">
        <div
          inert={away || undefined}
          className={cn("relative overflow-hidden bg-inherit transition-[translate,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]", away && "-translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0")}
        >
          <div ref={track} className={cn("flex w-max will-change-transform motion-reduce:w-auto", onDismiss && "motion-reduce:pr-12")}>
            {Array.from({ length: count * 2 }, (_, i) => (
              <div key={i} ref={i === 0 ? first : undefined} aria-hidden={i > 0 || undefined} inert={i > 0 || undefined} className={cn("flex shrink-0 items-center whitespace-nowrap motion-reduce:shrink motion-reduce:whitespace-normal", i > 0 && "motion-reduce:hidden")}>
                {children}
              </div>
            ))}
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="absolute inset-y-0 right-0 z-10 group flex items-center bg-inherit pr-4 pl-6 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 opacity-70 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
