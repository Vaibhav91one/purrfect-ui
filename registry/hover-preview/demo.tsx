import { HoverPreview } from "./hover-preview";

// eslint-disable-next-line @next/next/no-img-element -- a registry demo cannot assume next/image
const shot = (name: string) => <img src={`/demo/shot-${name.toLowerCase()}.jpg`} alt="" className="size-full object-cover" />;

const ITEMS = [
  { title: "Mapinly", meta: "Design & development", href: "#mapinly", preview: shot("Mapinly") },
  { title: "Bountydesk", meta: "Design & development", href: "#bountydesk", preview: shot("Bountydesk") },
  { title: "Poinu", meta: "Development", href: "#poinu", preview: shot("Poinu") },
];

export default function HoverPreviewDemo() {
  return <HoverPreview items={ITEMS} className="w-full max-w-3xl" />;
}
