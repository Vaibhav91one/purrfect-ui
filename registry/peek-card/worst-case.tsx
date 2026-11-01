// Dev-only fixture (not in registry.json, never installed): the realistic worst props for PeekCard, shown at /dev?c=peek-card.
import type { ReactNode } from "react";
import { PeekCard } from "./peek-card";

const grid = (node: ReactNode) => <div className="mx-auto grid max-w-5xl gap-6 p-6 sm:grid-cols-3">{node}</div>;
const LONG = "An event with a really long name that keeps going well past where anyone expected it to stop, Donaudampfschifffahrtsgesellschaftskapitän";
const LONG_DESC = "A description that is far too long for the panel. ".repeat(12);

export const states: Record<string, ReactNode> = {
  Demo: grid(
    <>
      <PeekCard index={1} image="/demo/scenery.jpg" title="Mapping the old town" description="A walk through the lanes." meta="Sat, 12 Oct" href="#a" />
      <PeekCard index={2} image="/demo/scenery.jpg" title="Night ride" description="Ten kilometres of lit streets." href="#b" />
    </>,
  ),
  "Long text": grid(
    <PeekCard
      index={1}
      image="/demo/scenery.jpg"
      title={LONG}
      description={LONG_DESC}
      meta={
        <>
          <span className="truncate">{LONG}</span>
          <span>Old Town</span>
        </>
      }
      href="#long"
    />,
  ),
  "No image": grid(<PeekCard index={4} title="No image at all" description="The muted token fills the media area." />),
  "Broken image": grid(
    <PeekCard index={5} image="/demo/does-not-exist.jpg" title="Broken image src" description="Nothing broken shows: the img has an empty alt." href="#broken" />,
  ),
  "Huge index": grid(<PeekCard index={1234567890123} image="/demo/scenery.jpg" title="Huge index" description="The number truncates." />),
  "Only title": grid(<PeekCard title="Title only" />),
  "Row muted": (
    <div className="mx-auto grid max-w-5xl gap-6 p-6">
      <PeekCard variant="row" muted index="12 Oct" image="/demo/scenery.jpg" title="Past event" description={LONG_DESC} meta={<span>Closed</span>} href="#past" />
      <PeekCard variant="row" title={LONG} description="No image, live" meta={<span>Active</span>} href="#live" />
      <PeekCard variant="row" title="No href, no meta" />
    </div>
  ),
  // narrow cards on a wide screen: a 5-up grid and a row in a 320px sidebar (layout must follow the card, not the viewport)
  Narrow: (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[1, 2, 3, 4, 5].map((n) => (
          <PeekCard key={n} index={n} image={n === 5 ? undefined : "/demo/scenery.jpg"} title="Mapping the old town" description="A walk through the lanes." meta="Sat, 12 Oct" href={`#n${n}`} />
        ))}
      </div>
      <div className="w-80">
        <PeekCard variant="row" image="/demo/scenery.jpg" title="Night ride through the city" description="Ten kilometres of lit streets." href="#side" />
      </div>
    </div>
  ),
  RTL: (
    <div dir="rtl" className="mx-auto grid max-w-5xl gap-6 p-6 sm:grid-cols-3">
      <PeekCard index="١" image="/demo/scenery.jpg" title="رسم خريطة المدينة القديمة" description="جولة في الأزقة التي لم يرسمها أحد بعد." meta="السبت ١٢ أكتوبر" href="#rtl" />
      <PeekCard variant="row" image="/demo/scenery.jpg" title="رحلة ليلية" description="عشرة كيلومترات." href="#rtl-row" className="sm:col-span-2" />
    </div>
  ),
};
