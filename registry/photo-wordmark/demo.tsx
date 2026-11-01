/* eslint-disable @next/next/no-img-element */
import type { RefObject } from "react";
import { PhotoWordmark } from "./photo-wordmark";

const link = "text-muted-foreground transition-colors hover:text-foreground";

const COLUMNS = [
  { title: "Legal", links: ["Privacy Policy", "Terms & Conditions"] },
  { title: "Pages", links: ["Home", "Contact", "Download"] },
  { title: "Socials", links: ["Website", "Instagram", "Facebook", "LinkedIn"] },
];

/** Armour's footer, the wordmark rising out of its bottom edge. `container` is the scrolling box when it is not the page. */
export function ArmourFooter({ container }: { container?: RefObject<HTMLElement | null> }) {
  return (
    <footer className="w-full overflow-clip rounded-3xl bg-card px-8 pt-6 text-foreground">
      <div className="flex items-center justify-between border-b border-border py-5">
        <div className="flex gap-5 text-sm">
          {["Features", "How it works", "FAQ", "Download"].map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-muted-foreground">
              {l}
            </a>
          ))}
        </div>
        <a href="#" className={`text-lg font-light tracking-tight ${link}`}>
          hello@armour.app
        </a>
      </div>
      <div className="flex justify-between gap-10 py-10">
        <div className="flex max-w-56 flex-col gap-2.5">
          <p className="text-sm font-semibold tracking-wide">ARMOUR</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Armour is an AI-powered finance app for managing money, tracking investments, and growing your wealth — built for iPhone.
          </p>
          <a href="#" className="w-fit rounded-full bg-foreground px-4 py-1.5 text-xs text-background">
            Let&apos;s chat
          </a>
          <p className="text-[10px] text-muted-foreground">
            ©2026 ARMOUR. All rights reserved.
            <br />
            By ItsPeterDesign
          </p>
        </div>
        <div className="grid grid-cols-3 gap-10 text-xs">
          {COLUMNS.map((c) => (
            <div key={c.title} className="flex flex-col gap-2">
              <p>{c.title}</p>
              {c.links.map((l) => (
                <a key={l} href="#" className={link}>
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <PhotoWordmark text="ARMOUR" src="/demo/field.jpg" container={container} className="mt-4 font-black tracking-tight" />
    </footer>
  );
}

export default function PhotoWordmarkDemo() {
  return (
    <div className="relative w-[800px] overflow-clip rounded-3xl p-6">
      <img src="/demo/storm.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative">
        <ArmourFooter />
      </div>
    </div>
  );
}
