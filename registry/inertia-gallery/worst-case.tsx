// Dev-only fixture (not in registry.json, never installed): the realistic worst props for InertiaGallery, shown at /dev?c=inertia-gallery.
// Each gallery sits between tall spacers: the page must still scroll past it on touch and with the keyboard.
import type { ReactNode } from "react";
import { InertiaGallery, type InertiaGalleryItem } from "./inertia-gallery";
import { DEMO_ITEMS } from "./demo";

const box = (node: ReactNode, h = "h-[520px]") => <div className={`${h} w-full`}>{node}</div>;
const page = (...kids: ReactNode[]) => <div className="flex flex-col gap-[50svh] py-[50svh]">{kids.map((k, i) => <div key={i}>{k}</div>)}</div>;
const empties = (n: number): InertiaGalleryItem[] => Array.from({ length: n }, (_, i) => ({ title: `Frame ${i + 1}` }));

export const states: Record<string, ReactNode> = {
  Demo: page(box(<InertiaGallery items={DEMO_ITEMS} frameWidth={150} frameHeight={200} />)),
  "Worst case": page(
    box(<InertiaGallery label="Many" items={empties(60)} defaultLayout="slider" />),
    box(<InertiaGallery label="Links" items={DEMO_ITEMS.slice(0, 4).map((it, i) => ({ ...it, href: `#frame-${i}` }))} />),
    box(
      <InertiaGallery
        label="Long titles"
        items={[
          { title: "Quarterly engineering newsletter and product updates for the whole team", src: "/demo/scenery.jpg" },
          { title: "Anmeldung-abschließen-und-bestätigen-Anmeldung-abschließen" },
          { title: "メールアドレスを確認して登録を完了する" },
          { title: "مرحبا بالعالم، هذا عنوان طويل جدا" },
        ]}
      />,
    ),
    box(<InertiaGallery label="Missing image" items={[{ src: "/demo/does-not-exist.jpg", alt: "Broken" }, { alt: "No src or node" }, {}]} />),
    box(<InertiaGallery label="Short box" items={DEMO_ITEMS} defaultLayout="slider" />, "h-[160px]"),
    box(<InertiaGallery label="Narrow" items={DEMO_ITEMS} />, "h-[520px] max-w-[280px]"),
  ),
  Intro: page(box(<InertiaGallery items={DEMO_ITEMS} intro frameWidth={150} frameHeight={200} />)),
  "Two instances": page(
    box(<InertiaGallery label="A" items={DEMO_ITEMS} intro />, "h-[400px]"),
    box(<InertiaGallery label="B" items={DEMO_ITEMS} intro defaultLayout="slider" />, "h-[400px]"),
  ),
  Two: page(box(<InertiaGallery label="Two" items={DEMO_ITEMS.slice(0, 2)} />)),
  One: page(box(<InertiaGallery label="One" items={DEMO_ITEMS.slice(0, 1)} />)),
  Empty: page(box(<InertiaGallery label="Empty" items={[]} />)),
};
