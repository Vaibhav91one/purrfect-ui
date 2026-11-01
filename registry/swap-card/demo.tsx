import { ArrowDown } from "lucide-react";
import { SwapCard } from "./swap-card";

// eslint-disable-next-line @next/next/no-img-element -- a registry demo cannot assume next/image
const photo = (name: string) => <img src={`/demo/${name}.jpg`} alt="" className="size-full object-cover" />;

// the seeded products of the Poinu shop
const ITEMS = [
  { title: "Low tide", type: "Giclée print", image: "coast", hover: "fjord" },
  { title: "Moth lamp", type: "Giclée print", image: "jellyfish", hover: "storm" },
  { title: "Folded wolf", type: "Sticker sheet", image: "canyon", hover: "dunes" },
];

// a slice of poinu.vercel.app/shop: nav, the "shop" title row and the product grid, as a page over a photo
export default function SwapCardDemo() {
  return (
    <div className="relative grid h-[680px] w-[800px] place-items-center overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/valley.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative w-[720px] rounded-2xl bg-background px-7 pt-5 pb-7 text-sm text-foreground">
        <nav className="flex items-center justify-between">
          <span>©KhushiChanu</span>
          <span className="flex gap-3">
            <span className="underline underline-offset-4">Shop</span>
            <span>About</span>
          </span>
          <span>Get in touch</span>
        </nav>
        <p className="mt-3 text-[148px] leading-[0.8] font-medium tracking-[-0.04em]">shop</p>
        <div className="mt-4 mb-5 grid grid-cols-3 gap-x-4">
          <span>shop here</span>
          <ArrowDown aria-hidden className="size-4" />
        </div>
        <div className="grid grid-cols-3 gap-x-4">
          {ITEMS.map((i) => (
            <SwapCard key={i.title} image={photo(i.image)} hoverImage={photo(i.hover)} title={i.title} subtitle={i.type} />
          ))}
        </div>
      </div>
    </div>
  );
}
