import { ScrollMarquee } from "./scroll-marquee";

// the portfolio's hero: a giant name running across the bottom of the hero, flipping with the page scroll
export default function ScrollMarqueeDemo() {
  return (
    <div className="relative grid h-[320px] w-full items-end overflow-hidden rounded-2xl pb-6">
      <ScrollMarquee className="w-full">
        <p className="pr-12 text-8xl font-medium whitespace-nowrap text-foreground">Vaibhav Tomar —</p>
      </ScrollMarquee>
    </div>
  );
}
