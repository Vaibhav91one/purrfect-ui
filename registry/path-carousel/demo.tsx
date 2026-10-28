import { PathCarousel } from "./path-carousel";

const ITEMS = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"].map((name) => (
  <div key={name} className="grid size-full place-items-center rounded-[32px] bg-card text-xl font-light">
    {name}
  </div>
));

export default function PathCarouselDemo() {
  return (
    <div className="h-[360px] w-full max-w-3xl">
      <PathCarousel items={ITEMS} />
    </div>
  );
}
