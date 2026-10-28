"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Connection = { saveData?: boolean };
const saveData = () => !!(navigator as Navigator & { connection?: Connection }).connection?.saveData;
const noop = () => () => {};

// Hover mode: the clip eases in from slightly large and soft so the swap from the live component reads as one move, not a
// cut. It starts the moment the pointer arrives (nothing waits); leaving is quicker. The base zoom (1.04) crops the
// page margin and corners of the recorded page, so the card's own rounded edge is the only border.
const REST_MS = 4000; // hover mode: how long the live component shows again after the clip ends, if the pointer stays
const HOVER =
  "opacity-0 scale-[1.08] blur-[6px] transition-[opacity,scale,filter] duration-[180ms] ease-snappy data-[shown=true]:opacity-100 data-[shown=true]:scale-[1.04] data-[shown=true]:blur-[0px] data-[shown=true]:duration-[300ms]";

/**
 * A component running on the real site it came from: a short muted clip, files in public/previews.
 * Nothing loads with the page. `hover` mode (a grid card) fetches the clip once the card is near the viewport, shows it
 * the moment its first frame is decoded (that is before the pointer arrives, so the swap has no wait), and on leave
 * fades it out while it keeps playing, rewinding afterwards, so there is never a stuck frame or a snap back to the start.
 * Hovering the whole card plays the clip once, then the live component shows again (REST_MS) and the clip replays, while
 * the pointer stays. Otherwise it plays while `playing` is true and it is on screen. Reduced motion or Save-Data: no hover clip at all; elsewhere the poster stays.
 */
export function SiteClip({ slug, playing = true, speed = 1, hover = false, className = "" }: { slug: string; playing?: boolean; speed?: number; hover?: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const lite = useSyncExternalStore(noop, saveData, () => false);
  const inView = useInView(ref, { amount: 0.4 });
  const near = useInView(ref, { margin: "200px" });
  const [over, setOver] = useState(false);
  const [ready, setReady] = useState(false); // playing
  const [loaded, setLoaded] = useState(false); // frame 0 is decoded: a paused video already shows it, so it can fade in before play starts
  const [rest, setRest] = useState(false); // the clip ended while the pointer stays: the live component shows again for a moment
  const [armed, setArmed] = useState(false);
  const blocked = !!reduce || lite;
  const active = !blocked && (hover ? over : playing && inView);
  if (!blocked && !armed && (hover ? near || over : active)) setArmed(true); // attach the sources: early for a card, on first play elsewhere

  if (!over && rest) setRest(false);

  // a parent card drives hover mode (mouse only, so touch keeps the live preview)
  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>("[role=button]") ?? ref.current?.parentElement; // the whole card, not the padded stage
    if (!hover || !host) return;
    const on = (e: PointerEvent | FocusEvent) => {
      if ("pointerType" in e && e.pointerType !== "mouse") return;
      setOver(true);
    };
    const off = () => setOver(false);
    host.addEventListener("pointerenter", on);
    host.addEventListener("pointerleave", off);
    host.addEventListener("focusin", on);
    host.addEventListener("focusout", off);
    return () => {
      host.removeEventListener("pointerenter", on);
      host.removeEventListener("pointerleave", off);
      host.removeEventListener("focusin", on);
      host.removeEventListener("focusout", off);
    };
  }, [hover]);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed;
  }, [speed, armed]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (hover) {
      if (blocked) return;
      if (over) {
        if (!rest) v.play().catch(() => {}); // blocked or interrupted: it simply never shows
        else {
          const id = setTimeout(() => {
            v.currentTime = 0;
            setRest(false);
          }, REST_MS);
          return () => clearTimeout(id);
        }
      } else if (!ready || v.ended) {
        v.pause();
        v.currentTime = 0;
      }
      return; // leaving while shown: it keeps playing until the fade ends (onTransitionEnd)
    }
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active, armed, blocked, hover, over, ready, rest]);

  if (hover && blocked) return null;

  const reset = () => {
    const v = ref.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setReady(false);
  };

  return (
    <video
      ref={ref}
      muted
      loop={!hover}
      playsInline
      preload={armed ? "auto" : "none"}
      poster={!hover || armed ? `/previews/${slug}.jpg` : undefined} // a card's clip is invisible until it plays, so its poster waits until the card is near the screen
      aria-hidden
      data-shown={hover ? over && !rest && (loaded || ready) : undefined}
      onEnded={() => hover && setRest(true)}
      onLoadedData={() => setLoaded(true)}
      onPlaying={() => setReady(true)}
      onTransitionEnd={(e) => {
        if (hover && !over && e.propertyName === "opacity") reset();
      }}
      className={`${className} ${hover ? HOVER : ""}`}
    >
      {armed && (
        <>
          <source src={`/previews/${slug}.mp4`} type="video/mp4" />
          <source src={`/previews/${slug}.webm`} type="video/webm" />
        </>
      )}
    </video>
  );
}
