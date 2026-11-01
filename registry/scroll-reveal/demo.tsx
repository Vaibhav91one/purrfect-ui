import { ScrollReveal } from "./scroll-reveal";

export default function ScrollRevealDemo() {
  return (
    <div className="relative grid w-[560px] place-items-center overflow-hidden rounded-3xl p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/fjord.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative flex w-full flex-col items-center gap-10 rounded-2xl bg-background px-8 py-12">
        <ScrollReveal text="Each one is a single file. Open it, tweak it, copy it." className="text-center text-4xl font-light tracking-tight" />
        <ScrollReveal mode="chars" text="Projects" className="text-center text-8xl italic" />
      </div>
    </div>
  );
}
