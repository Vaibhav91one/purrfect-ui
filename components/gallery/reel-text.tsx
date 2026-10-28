"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const LINE = 20; // px, one text line
const SPIN = 14; // characters a slot spins through before it lands
const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789/:._-@";
const EASE = [0.16, 1, 0.3, 1] as const; // starts fast, then a long soft landing
const DURATION = 1.1;
const STAGGER = 0.015; // seconds between neighbouring characters, so the change ripples left to right

// the characters a slot spins through: fixed by (change, slot, step) so rendering stays pure and server and client agree
const filler = (id: number, i: number, k: number) => CHARS[(id * 31 + i * 17 + k * 7 + ((i * k) % 5)) % CHARS.length];

/**
 * Text whose characters spin like slot reels when it changes: each character that differs rolls fast through other
 * characters and slows down onto its new one, starting from the left. Monospace, one fixed-width slot per character.
 */
export function ReelText({ text, className = "" }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const [view, setView] = useState({ id: 0, from: text, to: text });
  if (view.to !== text) setView({ id: view.id + 1, from: view.to, to: text });

  const n = Math.max(view.from.length, view.to.length);
  const slots = Array.from({ length: n }, (_, i) => {
    const a = view.from[i] ?? " ";
    const b = view.to[i] ?? " ";
    if (reduce || view.id === 0 || a === b) return <span key={`s${i}`} className="block h-5 w-[1ch] shrink-0 whitespace-pre">{b}</span>;
    const strip = [a, ...Array.from({ length: SPIN }, (_, k) => filler(view.id, i, k)), b];
    return (
      <span key={`${view.id}-${i}`} className="block h-5 w-[1ch] shrink-0 overflow-hidden">
        <motion.span initial={{ y: 0 }} animate={{ y: -(strip.length - 1) * LINE }} transition={{ duration: DURATION, ease: EASE, delay: i * STAGGER }} className="flex flex-col">
          {strip.map((c, k) => (
            <span key={k} className="block h-5 whitespace-pre">
              {c}
            </span>
          ))}
        </motion.span>
      </span>
    );
  });

  return (
    <span aria-hidden className={`flex h-5 overflow-hidden whitespace-nowrap leading-5 ${className}`}>
      {slots}
    </span>
  );
}
