"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FACES, SEQUENCE } from "./faces";

const STEP_MS = 2600;
const SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;

/**
 * The notch's bot: two eyes and a mouth that morph through FACES one after another, with a quick blink every few seconds.
 * Under reduced motion it stays on the idle face.
 */
export function BotFace({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [blink, setBlink] = useState(false);

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

  const name = reduce ? "idle" : SEQUENCE[step];
  const face = FACES[name];
  const fill = face.tint ?? "#fff";
  const t = reduce ? { duration: 0 } : SPRING;

  return (
    <svg viewBox="0 0 40 28" aria-hidden className={className ?? "h-7 w-10"} data-face={name}>
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
      <motion.path
        initial={false}
        animate={{ d: face.mouth, stroke: fill }}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        transition={t}
      />
    </svg>
  );
}
