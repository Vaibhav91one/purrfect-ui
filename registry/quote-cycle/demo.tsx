"use client";

import { useState } from "react";
import { QuoteCycle } from "./quote-cycle";

const QUOTES = [
  "Creativity is intelligence having fun. — Albert Einstein",
  "Make it simple, but significant. — Don Draper",
  "Design is thinking made visual. — Saul Bass",
  "Creativity takes courage. — Henri Matisse",
  "Your work is your signature. Make it legendary.",
  "Dream big. Create bigger.",
  "Innovation begins where imagination meets execution.",
];

export default function QuoteCycleDemo() {
  const [i, setI] = useState(0);
  return (
    <div className="relative grid h-[320px] w-[480px] place-items-center overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/field.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative grid h-[200px] w-[400px] place-items-center rounded-2xl bg-background px-12">
        <button type="button" onClick={() => setI((n) => n + 1)} className="w-full">
          {/* visually hidden, so the button's name is "Next quote" plus the quote itself */}
          <span className="sr-only">Next quote: </span>
          <QuoteCycle index={i} lines={QUOTES} className="text-2xl leading-snug" />
        </button>
      </div>
    </div>
  );
}
