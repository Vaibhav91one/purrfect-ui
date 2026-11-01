import { ArrowUpRight } from "lucide-react";
import { CurtainReveal } from "./curtain-reveal";

// the portfolio's footer: the page scrolls off a photo and the contact panel is uncovered beneath it
export default function CurtainRevealDemo() {
  return (
    <div className="w-full">
      <section className="relative h-[60svh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/demo/fjord.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      </section>
      <CurtainReveal height="60svh" className="px-10 pt-16">
        <p className="text-6xl leading-[0.95]">Let&apos;s ✺ work together</p>
        <div className="mt-10 grid w-fit grid-cols-2 gap-12 text-lg">
          <div>
            <p className="mb-2 text-xs tracking-wider uppercase opacity-60">Contact</p>
            <a href="#mail" className="block py-1">hello@example.com</a>
          </div>
          <div>
            <p className="mb-2 text-xs tracking-wider uppercase opacity-60">Socials</p>
            <a href="#github" className="flex items-center gap-1 py-1">GitHub <ArrowUpRight className="size-4" /></a>
            <a href="#linkedin" className="flex items-center gap-1 py-1">LinkedIn <ArrowUpRight className="size-4" /></a>
          </div>
        </div>
      </CurtainReveal>
    </div>
  );
}
