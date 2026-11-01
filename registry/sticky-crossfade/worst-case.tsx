// Dev-only fixture (not in registry.json, never installed): the worst inputs for StickyCrossfade, shown at /dev?c=sticky-crossfade.
import type { ReactNode } from "react";
import { StickyCrossfade } from "./sticky-crossfade";

// eslint-disable-next-line @next/next/no-img-element
const pic = (src: string) => <img src={src} alt="" />;
const block = (t: ReactNode, i: number) => (
  <p key={i} data-pic-block className="m-0 mb-[40vh] text-3xl">
    {t}
  </p>
);

export const states: Record<string, ReactNode> = {
  Demo: (
    <StickyCrossfade pictures={["/demo/hiker.jpg", "/demo/field.jpg", "/demo/canal.jpg"].map(pic)}>
      {["I draw portraits in Procreate.", "Some of them are signed Poinu.", "More are on the way."].map(block)}
    </StickyCrossfade>
  ),
  "Worst case": (
    <div className="grid gap-24">
      {/* more blocks than pictures: they repeat */}
      <StickyCrossfade pictures={[pic("/demo/coast.jpg")]}>{["One picture, many blocks", "second", "third"].map(block)}</StickyCrossfade>
      {/* no pictures at all */}
      <StickyCrossfade pictures={[]}>{["No pictures: an empty muted box"].map(block)}</StickyCrossfade>
      {/* no data-pic-block children */}
      <StickyCrossfade pictures={[pic("/demo/fjord.jpg"), pic("/demo/storm.jpg")]}>
        <p className="text-3xl">No marked blocks: the first picture stays</p>
      </StickyCrossfade>
      {/* unbreakable, RTL, non-Latin, emoji */}
      <StickyCrossfade pictures={["/demo/city.jpg", "/demo/dunes.jpg", "/demo/cliffs.jpg", "/demo/valley.jpg"].map(pic)}>
        {[
          <span key="u" className="[overflow-wrap:anywhere]">Donaudampfschifffahrtsgesellschaftskapitänswitwe</span>,
          <span key="a" dir="rtl">سطر عربي أول والسطر الثاني</span>,
          "日本語の一行目と二行目",
          "🐈‍⬛ cats 🐈",
        ].map(block)}
      </StickyCrossfade>
    </div>
  ),
  Narrow: (
    <div style={{ width: 340 }}>
      <StickyCrossfade pictures={["/demo/hiker.jpg", "/demo/field.jpg"].map(pic)}>{["Stacked: the first picture only", "in flow"].map(block)}</StickyCrossfade>
    </div>
  ),
};
