// Dev-only fixture (not in registry.json, never installed): the realistic worst content for PhotoWordmark, shown at /dev?c=photo-wordmark.
// The page is taller than the screen so the scroll-linked rise and drift can play.
import type { ReactNode } from "react";
import { PhotoWordmark } from "./photo-wordmark";

const page = (...kids: ReactNode[]) => (
  <div className="flex flex-col gap-24 py-[60svh] pb-[20svh]">
    {kids.map((k, i) => (
      <footer key={i} className="overflow-hidden rounded-3xl border bg-card px-6 pt-6">
        {k}
      </footer>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: page(<PhotoWordmark text="ARMOUR" src="/demo/field.jpg" className="font-black tracking-tight" />),
  "Worst case": page(
    <PhotoWordmark text="A" src="/demo/canyon.jpg" className="font-black" />,
    <PhotoWordmark text="Supercalifragilisticexpialidocious" src="/demo/storm.jpg" className="font-black" />,
    <PhotoWordmark text="メールアドレス" src="/demo/coast.jpg" className="font-black [--advance:1]" />,
    <PhotoWordmark text="مرحبا بالعالم" dir="rtl" src="/demo/dunes.jpg" className="font-black [--advance:0.55]" />,
    <PhotoWordmark text="NO GLOW, NO CROP" src="/demo/city.jpg" glow={false} crop={0} className="font-black" />,
    <PhotoWordmark text="DEEP CROP" src="/demo/jellyfish.jpg" crop={0.9} as="h2" className="font-serif" />,
  ),
  Empty: page(<PhotoWordmark text="" src="/demo/field.jpg" className="font-black" />),
};
