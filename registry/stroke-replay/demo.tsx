"use client";

import { ArrowRight } from "lucide-react";
import { StrokeReplay } from "./stroke-replay";

/** A small painted portrait ("Pink bob"): the paper stays put (`data-static`), every other shape is a stroke. */
export function Painting() {
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect data-static width="400" height="500" fill="#efe6da" />
      <path d="M-20 360 C 80 300 160 420 420 330 L 420 520 L -20 520 Z" fill="#c9d6c4" />
      <circle cx="318" cy="96" r="46" fill="#f3c9a8" />
      <path d="M92 250 C 80 120 160 70 210 74 C 280 78 330 130 316 250 C 310 300 300 330 296 350 L 104 350 C 98 320 94 290 92 250 Z" fill="#d97a93" />
      <path d="M130 500 C 130 420 170 395 200 395 C 232 395 272 420 272 500 Z" fill="#3e5a6b" />
      <rect x="178" y="320" width="44" height="86" rx="18" fill="#e8b394" />
      <ellipse cx="200" cy="246" rx="74" ry="92" fill="#f0c3a3" />
      <path d="M118 210 C 120 140 170 112 214 116 C 262 120 290 160 284 206 C 250 178 212 196 196 166 C 180 196 146 186 118 210 Z" fill="#c4607d" />
      <ellipse cx="172" cy="248" rx="8" ry="10" fill="#2f2a33" />
      <ellipse cx="230" cy="248" rx="8" ry="10" fill="#2f2a33" />
      <ellipse cx="158" cy="282" rx="16" ry="9" fill="#ea9a9f" opacity=".7" />
      <ellipse cx="244" cy="282" rx="16" ry="9" fill="#ea9a9f" opacity=".7" />
      <path d="M186 300 C 196 310 208 310 218 300 C 210 316 194 316 186 300 Z" fill="#b54a5e" />
      <circle cx="128" cy="300" r="7" fill="#f6d36b" />
      <circle cx="60" cy="140" r="5" fill="#efe6da" opacity=".85" />
      <circle cx="350" cy="420" r="6" fill="#efe6da" opacity=".85" />
    </svg>
  );
}

/** The Process section of a Poinu work page: big heading, an "01" column, the timelapse and its caption, then the next project. */
export default function StrokeReplayDemo() {
  return (
    <div className="relative grid h-[760px] w-[720px] place-items-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- static demo wallpaper */}
      <img src="/demo/field.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <section className="relative w-[600px] rounded-3xl bg-background p-10 text-foreground shadow-xl">
        <h2 className="m-0 mb-8 text-5xl font-normal tracking-tight">Process</h2>
        <div className="grid grid-cols-[86px_minmax(0,1fr)] items-start">
          <span className="text-sm leading-[29px]">01</span>
          <div>
            <StrokeReplay className="mb-4 max-w-[300px]">
              <Painting />
            </StrokeReplay>
            <p className="m-0 text-sm text-muted-foreground">Timelapse of the process.</p>
            <div className="mt-8 flex flex-col gap-2">
              <small className="text-sm text-muted-foreground">Next project</small>
              <a href="#" className="flex items-center gap-3 text-2xl" onClick={(e) => e.preventDefault()}>
                <ArrowRight className="size-6" strokeWidth={1.5} aria-hidden />
                Poinu curls
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
