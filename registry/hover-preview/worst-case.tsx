// Dev-only fixture (not in registry.json, never installed): the realistic worst props for HoverPreview, shown at /dev?c=hover-preview.
// Pushed down the page so a position bug (page vs list coordinates) shows.
import type { ReactNode } from "react";
import { HoverPreview, type HoverPreviewItem } from "./hover-preview";

const shot = (hue: number) => <div className="size-full" style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${hue + 60} 70% 60%))` }} />;
const items = (titles: string[]): HoverPreviewItem[] => titles.map((title, i) => ({ title, meta: "Design & development", href: `#${i}`, preview: shot(i * 47) }));
const page = (node: ReactNode) => <div className="mx-auto max-w-4xl px-6 pt-[40svh] pb-[60svh]">{node}</div>;

export const states: Record<string, ReactNode> = {
  Demo: page(<HoverPreview items={items(["Mapinly", "Bountydesk", "Poinu"])} />),
  "Worst case": page(
    <HoverPreview
      label="Öffnen"
      items={[
        ...items(["A project with a very long name that wraps onto a second line on narrow screens", "メールアドレス", "إرسال الرسالة"]),
        { title: "No meta", href: "#n", preview: shot(200) },
        { title: "Image preview", href: "#img", color: "#111", preview: <span className="text-4xl">🖼️</span> },
        ...items(Array.from({ length: 12 }, (_, i) => `Row ${i + 1}`)),
      ]}
    />,
  ),
  "No disc": page(<HoverPreview label="" items={items(["One", "Two"])} cardClassName="h-48 w-64" />),
  One: page(<HoverPreview items={items(["Only one"])} />),
  Empty: page(<HoverPreview items={[]} />),
};
