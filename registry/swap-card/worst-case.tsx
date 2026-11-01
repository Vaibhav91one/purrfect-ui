// Dev-only fixture (not in registry.json, never installed): the realistic worst props for SwapCard, shown at /dev?c=swap-card.
import type { ReactNode } from "react";
import { SwapCard } from "./swap-card";

// eslint-disable-next-line @next/next/no-img-element -- a registry fixture cannot assume next/image
const photo = (name: string) => <img src={`/demo/${name}.jpg`} alt="" className="size-full object-cover" />;
const grid = (node: ReactNode) => <div className="mx-auto grid max-w-4xl grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-x-4 gap-y-14 p-6">{node}</div>;

export const states: Record<string, ReactNode> = {
  Demo: grid(
    <>
      <SwapCard image={photo("coast")} hoverImage={photo("fjord")} title="Low tide" subtitle="Giclée print" />
      <SwapCard image={photo("jellyfish")} hoverImage={photo("storm")} title="Moth lamp" subtitle="Giclée print" />
      <SwapCard image={photo("canyon")} hoverImage={photo("dunes")} title="Folded wolf" subtitle="Sticker sheet" />
    </>,
  ),
  "Worst case": grid(
    <>
      <SwapCard
        image={photo("city")}
        hoverImage={photo("canal")}
        title="A product with a very long name that wraps onto a second and a third line in a narrow column"
        subtitle="Limited edition hand-numbered giclée print on 308gsm cotton rag"
      />
      <SwapCard image={photo("field")} hoverImage={photo("hiker")} title="Unbreakable_product_name_with_no_spaces_at_all_anywhere" subtitle="Sticker" />
      <SwapCard image={photo("cliffs")} hoverImage={photo("valley")} title="メールアドレス" subtitle="ポスター" />
      <div dir="rtl">
        <SwapCard image={photo("scenery")} hoverImage={photo("coast")} title="إرسال الرسالة" subtitle="طباعة" />
      </div>
      <SwapCard image={photo("storm")} hoverImage={<span className="grid size-full place-items-center text-4xl">🐺</span>} title="No subtitle, emoji hover" />
      <SwapCard image={<span />} hoverImage={<span />} title="Missing images" subtitle="Empty art" badge={false} />
      <SwapCard image={photo("dunes")} hoverImage={photo("fjord")} title="Disabled" subtitle="Sold out" disabled />
    </>,
  ),
  One: grid(<SwapCard image={photo("fjord")} hoverImage={photo("coast")} title="Only one" />),
};
