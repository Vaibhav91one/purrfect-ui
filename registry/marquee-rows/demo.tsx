import { MarqueeRows } from "./marquee-rows";

const items = [{ label: "We listen" }, { label: "We experiment" }, { label: "We measure" }, { label: "We share" }];

// the source's values section: inverted surface, four rows, thin rules between them
export default function MarqueeRowsDemo() {
  return (
    <div className="relative grid h-[560px] w-[1000px] place-items-center overflow-hidden rounded-3xl p-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/canyon.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      {/* fixed size: the preview is scaled, so viewport breakpoints would shrink it on phones */}
      <div className="relative w-full rounded-2xl bg-foreground px-10 py-8 text-background">
        <MarqueeRows items={items} className="text-7xl md:text-7xl lg:text-7xl *:border-background/20" />
      </div>
    </div>
  );
}
