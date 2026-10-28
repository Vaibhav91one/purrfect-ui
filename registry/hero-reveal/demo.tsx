import { HeroReveal } from "./hero-reveal";

// a gradient stands in for a photo so the demo needs no asset
const SKY = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5a96"/><stop offset=".6" stop-color="#9fb8d3"/><stop offset="1" stop-color="#3d6b3a"/></linearGradient></defs><rect width="800" height="500" fill="url(#g)"/></svg>');

export default function HeroRevealDemo() {
  return (
    <HeroReveal
      className="min-h-[24rem]! px-4!"
      src={SKY}
      title={<>Your wealth, finally working.</>}
      description="The AI finance app that tracks your spending and grows your portfolio."
      action={<button type="button" className="rounded-full bg-neutral-900 px-8 py-4 font-medium text-white">Get the app</button>}
    />
  );
}
