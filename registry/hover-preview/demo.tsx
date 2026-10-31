import { HoverPreview } from "./hover-preview";

const shot = (from: string, to: string, name: string) => (
  <div className="grid size-full place-items-center text-2xl font-medium text-white" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
    {name}
  </div>
);

const ITEMS = [
  { title: "Mapinly", meta: "Design & development", href: "#mapinly", preview: shot("#0E7DDA", "#4FA06B", "Mapinly") },
  { title: "Bountydesk", meta: "Design & development", href: "#bountydesk", preview: shot("#D94A3A", "#D9C8A4", "Bountydesk") },
  { title: "Poinu", meta: "Development", href: "#poinu", preview: shot("#6d28d9", "#c2255c", "Poinu") },
];

export default function HoverPreviewDemo() {
  return <HoverPreview items={ITEMS} className="w-full max-w-3xl" />;
}
