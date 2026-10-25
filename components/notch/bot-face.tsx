"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { FACES, SEQUENCE } from "./faces";

const STEP_MS = 2600;
const SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;
// mouse tracking: how far (in svg units) the eyes may slide toward the cursor, and how far away the cursor still counts
const LOOK_X = 3.5;
const LOOK_Y = 2.5;
const LOOK_RANGE = 220;
const NEAR = 140; // px from the notch's edge: farther than this the bot ignores the pointer and looks straight ahead
const clamp = (n: number) => Math.max(-1, Math.min(1, n));

/**
 * The notch's bot: two eyes and a mouth that morph through FACES one after another, with a quick blink every few seconds.
 * The eyes also slide toward the mouse pointer. Under reduced motion it stays on the idle face and ignores the pointer.
 */
export function BotFace({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [blink, setBlink] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  // springs so the look glides; they drive transforms directly, so tracking never re-renders the component
  const lookX = useSpring(0, { stiffness: 180, damping: 18 });
  const lookY = useSpring(0, { stiffness: 180, damping: 18 });
  const mouthX = useTransform(lookX, (v) => v * 0.5); // the mouth drifts half as far as the eyes
  const mouthY = useTransform(lookY, (v) => v * 0.5);

  // walk the sequence
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStep((n) => (n + 1) % SEQUENCE.length), STEP_MS);
    return () => clearInterval(id);
  }, [reduce]);

  // random blink, every 3 to 5.5 s
  useEffect(() => {
    if (reduce) return;
    let next: ReturnType<typeof setTimeout>;
    let open: ReturnType<typeof setTimeout>;
    const loop = () => {
      next = setTimeout(() => {
        setBlink(true);
        open = setTimeout(() => setBlink(false), 130);
        loop();
      }, 3000 + Math.random() * 2500);
    };
    loop();
    return () => {
      clearTimeout(next);
      clearTimeout(open);
    };
  }, [reduce]);

  // eyes follow a mouse pointer (not touch) while it is near the notch, and settle back when it moves away or leaves the window
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !svg.current) return;
      const notch = svg.current.closest("nav")?.getBoundingClientRect();
      if (notch) {
        const gapX = Math.max(notch.left - e.clientX, 0, e.clientX - notch.right);
        const gapY = Math.max(notch.top - e.clientY, 0, e.clientY - notch.bottom);
        if (Math.hypot(gapX, gapY) > NEAR) {
          lookX.set(0);
          lookY.set(0);
          return;
        }
      }
      const r = svg.current.getBoundingClientRect();
      lookX.set(clamp((e.clientX - (r.left + r.width / 2)) / LOOK_RANGE) * LOOK_X);
      lookY.set(clamp((e.clientY - (r.top + r.height / 2)) / LOOK_RANGE) * LOOK_Y);
    };
    const onLeave = () => {
      lookX.set(0);
      lookY.set(0);
    };
    addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce, lookX, lookY]);

  const name = reduce ? "idle" : SEQUENCE[step];
  const face = FACES[name];
  const fill = face.tint ?? "#fff";
  const t = reduce ? { duration: 0 } : SPRING;

  return (
    <svg ref={svg} viewBox="0 0 40 28" aria-hidden className={className ?? "h-7 w-10"} data-face={name}>
      <motion.g style={{ x: lookX, y: lookY }}>
      {[face.left, face.right].map((e, i) => {
        const h = blink ? Math.min(e.h, 1.6) : e.h;
        return (
          <motion.rect
            key={i}
            initial={false}
            animate={{ x: e.x - e.w / 2, y: e.y - h / 2, width: e.w, height: h, rx: Math.min(e.r, h / 2), rotate: e.rot, fill }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            transition={blink ? { duration: 0.06 } : t}
          />
        );
      })}
      </motion.g>
      <motion.path
        initial={false}
        animate={{ d: face.mouth, stroke: fill }}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        transition={t}
        style={{ x: mouthX, y: mouthY }}
      />
    </svg>
  );
}
