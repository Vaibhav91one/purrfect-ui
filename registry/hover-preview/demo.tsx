import { HoverPreview } from "./hover-preview";

// eslint-disable-next-line @next/next/no-img-element -- a registry demo cannot assume next/image
const shot = (name: string) => <img src={`/demo/shot-${name.toLowerCase()}.jpg`} alt="" className="size-full object-cover" />;

const ITEMS = [
  { title: "Mapinly", meta: "Design & development", href: "#mapinly", preview: shot("Mapinly") },
  { title: "Bountydesk", meta: "Design & development", href: "#bountydesk", preview: shot("Bountydesk") },
  { title: "Poinu", meta: "Development", href: "#poinu", preview: shot("Poinu") },
];

// the portfolio's project list sits on a flat page, drawn here as a panel over a photo
export default function HoverPreviewDemo() {
  return (
    <div className="relative grid h-[420px] w-[760px] place-items-center overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/coast.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative w-[680px] rounded-2xl bg-background px-8 py-6 text-foreground">
        <HoverPreview items={ITEMS} />
      </div>
    </div>
  );
}
