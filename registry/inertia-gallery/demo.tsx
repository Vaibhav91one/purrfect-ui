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

export default function InertiaGalleryDemo() {
  return (
    <div className="h-[560px] w-[900px] overflow-hidden rounded-2xl border border-border">
      <InertiaGallery items={DEMO_ITEMS} frameWidth={150} frameHeight={200} />
    </div>
  );
}
