import { MapPin } from "lucide-react";
import { PeekCard } from "./peek-card";

const place = (where: string) => (
  <span className="flex min-w-0 items-center gap-1.5">
    <MapPin className="size-3.5 shrink-0" />
    <span className="truncate">{where}</span>
  </span>
);

// the source's events carousel (cards edge to edge, numbered) over its events list (rows; a past one dimmed)
export default function PeekCardDemo() {
  return (
    <div className="relative grid h-[760px] w-[1000px] content-center gap-4 overflow-hidden rounded-3xl p-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/dunes.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative grid grid-cols-3">
        <PeekCard
          index={1}
          image="/demo/canal.jpg"
          title="Language Exchange Night"
          description="Practice a new language over coffee with native speakers."
          meta={
            <>
              <span>Sat, 12 Oct · 18:00 – 20:00</span>
              {place("Old Town Café")}
            </>
          }
          href="#one"
        />
        <PeekCard
          index={2}
          image="/demo/coast.jpg"
          title="Lakeside Community Picnic"
          description="Bring a dish from home and share its story."
          meta={
            <>
              <span>Sun, 13 Oct · 12:00 – 15:00</span>
              {place("North Shore Park")}
            </>
          }
          href="#two"
        />
        <PeekCard
          index={3}
          image="/demo/city.jpg"
          title="Local Makers Market"
          description="Crafts, food and music from makers across the city."
          meta={
            <>
              <span>Fri, 18 Oct · 17:00 – 21:00</span>
              {place("Canal Street")}
            </>
          }
          href="#three"
        />
      </div>
      <PeekCard
        variant="row"
        index="12 Oct"
        image="/demo/field.jpg"
        title="Language Exchange Night"
        description="Practice a new language over coffee with native speakers."
        meta={<span>@Old Town Café</span>}
        href="#row"
      />
      <PeekCard variant="row" muted title="Spring Cultural Walk" description="This one is over. Thanks for coming." meta={<span>Past</span>} href="#past" />
    </div>
  );
}
