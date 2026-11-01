"use client";

import { useRef, type RefObject } from "react";
import { StickyCrossfade } from "./sticky-crossfade";

// eslint-disable-next-line @next/next/no-img-element
const pic = (src: string) => <img src={src} alt="" />;
const pictures = ["/demo/hiker.jpg", "/demo/field.jpg", "/demo/canal.jpg", "/demo/jellyfish.jpg", "/demo/coast.jpg", "/demo/valley.jpg"].map(pic);

const facts = [
  { title: "Based in", body: ["Bangalore, India", "[ originally from Manipur ]"] },
  { title: "Credit", body: ["Illustration, words", "Khushi Chanu ©2026"] },
  { title: "Social", body: ["Instagram", "Threads"] },
];

/** The Poinu /about page inside a scrolling box: the portrait sticks in the middle and changes as each block passes it. */
export function StickyCrossfadeScene({ container }: { container: RefObject<HTMLElement | null> }) {
  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-6 py-4 text-base">
        <span>©KhushiChanu</span>
        <nav className="flex gap-4">
          <span>Shop</span>
          <span className="underline underline-offset-4">About</span>
        </nav>
        <span>Get in touch</span>
      </header>
      <StickyCrossfade pictures={pictures} container={container} pictureClassName="w-[260px] @3xl:w-[260px]" className="pt-16 pb-[45%]">
        {[
          "I'm Khushi Chanu, from Manipur and drawing in Bangalore. I draw portraits in Procreate: pencil-soft lines, flushed cheeks and a lot of hair.",
          "Some of them are signed Poinu. This is a small first set, and more are on the way.",
        ].map((t) => (
          <p key={t} data-pic-block className="m-0 mb-12 max-w-[560px] text-[32px] leading-[1.2] tracking-tight indent-[4em]">
            {t}
          </p>
        ))}
        <div className="mt-32 grid gap-24 pl-24">
          {facts.map((f) => (
            <div key={f.title} data-pic-block>
              <h2 className="m-0 mb-6 text-[40px] font-normal">{f.title}</h2>
              <p className="m-0 text-xl text-muted-foreground">
                {f.body[0]}
                <br />
                {f.body[1]}
              </p>
            </div>
          ))}
          <div data-pic-block>
            <p className="m-0 text-[40px]">Get in touch →</p>
          </div>
        </div>
      </StickyCrossfade>
    </>
  );
}

export default function StickyCrossfadeDemo() {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-[600px] w-[1000px] overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/dunes.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div ref={box} className="absolute inset-4 overflow-y-auto overscroll-contain rounded-2xl bg-background text-foreground">
        <StickyCrossfadeScene container={box} />
      </div>
    </div>
  );
}
