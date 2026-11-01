import { ScrollMarquee } from "./scroll-marquee";

// the portfolio's hero: a giant white name running across the bottom of the photo, flipping with the page scroll
export default function ScrollMarqueeDemo() {
  return (
    <div className="relative grid h-[320px] w-full items-end overflow-hidden rounded-2xl pb-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/storm.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <ScrollMarquee className="w-full">
        {/* check-ignore: hardcoded-color white type over a photo, in either theme */}
        <p className="pr-12 text-8xl font-medium whitespace-nowrap text-white">Vaibhav Tomar —</p>
      </ScrollMarquee>
    </div>
  );
}
