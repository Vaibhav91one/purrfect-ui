"use client";

import { Globe } from "lucide-react";
import { useRef, type RefObject } from "react";
import { LocationPill } from "./location-pill";

const NAV = ["Work", "About", "Contact"];
const ROLES = ["Design Engineer", "Software Developer", "Cybersecurity Researcher", "Freelancer"];

// the portfolio's hero: nav on top, the pill pinned to the left edge, roles on the right, the name across the bottom;
// the hero scrolls inside its own box, so scrolling it drifts the pill up the way the page does
export default function LocationPillDemo() {
  const box = useRef<HTMLDivElement>(null);
  return (
    <div className="relative grid h-[560px] w-[800px] place-items-center overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/fjord.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div
        ref={box}
        className="relative h-[500px] w-[740px] overflow-y-auto overscroll-contain rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <LocationPillScene container={box} />
      </div>
    </div>
  );
}

// the hero itself, scrolled by whatever box you pass as container (the gallery wraps it in an auto-scrolling box)
export function LocationPillScene({ container }: { container: RefObject<HTMLDivElement | null> }) {
  return (
    <>
      {/* check-ignore: hardcoded-color white type over a photo, as on the source hero, in either theme */}
      <div className="relative h-[500px] overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo/hiker.jpg" alt="" className="absolute inset-0 size-full object-cover brightness-75" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-8 py-5 text-sm uppercase">
          <span>© Code by Vaibhav Tomar</span>
          <nav className="flex gap-6">
            {NAV.map((n) => (
              <a key={n} href="#" onClick={(e) => e.preventDefault()}>
                {n}
              </a>
            ))}
          </nav>
        </div>
        <LocationPill container={container} icon={<Globe size={30} />} className="absolute top-[170px] left-0" />
        <div className="absolute top-[165px] right-8 flex flex-col gap-1.5 text-lg">
          {ROLES.map((r) => (
            <p key={r}>{r}</p>
          ))}
        </div>
        <p className="absolute bottom-2 left-6 text-8xl leading-none font-medium whitespace-nowrap">Vaibhav Tomar —</p>
      </div>
      <div className="h-[260px] bg-background" />
    </>
  );
}
