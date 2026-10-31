import { MarqueeRows } from "./marquee-rows";

const items = [{ label: "We listen" }, { label: "We experiment" }, { label: "We measure" }, { label: "We share" }, { label: "We repeat", href: "#" }];

export default function MarqueeRowsDemo() {
  return <MarqueeRows items={items} className="w-full text-7xl md:text-7xl" /> // fixed size: the preview is scaled, so viewport breakpoints would shrink it on phones;
}
