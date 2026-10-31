import { ShimmerText } from "./shimmer-text";

export default function ShimmerTextDemo() {
  return (
    <div className="grid w-[420px] gap-6">
      <div className="relative grid h-56 place-items-center overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo/valley.jpg" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="relative rounded-full bg-background/85 px-5 py-2 shadow-lg backdrop-blur">
          <ShimmerText className="text-base">
            <span className="font-semibold">Armour</span> is listening…
          </ShimmerText>
        </div>
      </div>
      <ShimmerText as="p" className="text-sm font-medium">
        Thinking…
      </ShimmerText>
    </div>
  );
}
