import { HeroReveal } from "./hero-reveal";

const SKY = "/demo/fjord.jpg";

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
