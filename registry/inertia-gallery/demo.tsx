import { InertiaGallery, type InertiaGalleryItem } from "./inertia-gallery";

const PHOTOS = [
  ["fjord", "Fjord"],
  ["canyon", "Canyon"],
  ["cliffs", "Cliffs"],
  ["storm", "Storm"],
  ["valley", "Valley"],
  ["coast", "Coast"],
  ["jellyfish", "Jellyfish"],
  ["field", "Field"],
  ["canal", "Canal"],
  ["dunes", "Dunes"],
];

export const DEMO_ITEMS: InertiaGalleryItem[] = PHOTOS.map(([file, title]) => ({ src: `/demo/${file}.jpg`, alt: title, title }));

// the source's home page: a site window whose whole body is the gallery, under a slim header
export default function InertiaGalleryDemo() {
  return (
    <div className="relative h-[560px] w-[900px] overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/scenery.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-4 flex flex-col overflow-hidden rounded-xl bg-background text-foreground shadow-xl">
        <div className="grid h-11 shrink-0 grid-cols-[1fr_auto_auto] items-center gap-16 px-5 text-xs">
          <span>©Studio</span>
          <span className="flex gap-3">
            <span>Shop</span>
            <span>About</span>
          </span>
          <span>Get in touch</span>
        </div>
        <InertiaGallery items={DEMO_ITEMS} frameWidth={150} frameHeight={200} intro className="min-h-0 flex-1" />
      </div>
    </div>
  );
}
