/* eslint-disable @next/next/no-img-element */
import { ShimmerText } from "./shimmer-text";

// Armour's listening pill: a dark pill over the phone's photo, the label shimmering while it listens
export default function ShimmerTextDemo() {
  return (
    <div className="relative grid h-[300px] w-[420px] place-items-center overflow-hidden rounded-3xl">
      <img src="/demo/field.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      {/* .dark scopes the tokens, so the pill stays dark with a light band in either theme, like the original */}
      <div className="dark relative rounded-full bg-card px-5 py-2 shadow-lg">
        <ShimmerText className="text-base">
          <span className="font-semibold">Armour</span> is listening
        </ShimmerText>
      </div>
    </div>
  );
}
