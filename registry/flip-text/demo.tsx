import { RollLink } from "@/registry/roll-link/roll-link";
import { FlipText } from "./flip-text";

export default function FlipTextDemo() {
  return (
    <div className="relative grid h-[300px] w-[560px] place-items-center overflow-hidden rounded-3xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/storm.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <nav aria-label="Demo" className="relative flex w-full items-center justify-between px-8 text-base text-white uppercase leading-none tracking-tight">
        <FlipText text="© Code By Vaibhav Tomar" />
        <div className="flex items-center gap-6">
          <RollLink href="#work">Work</RollLink>
          <RollLink href="#about">About</RollLink>
          <RollLink href="#contact">Contact</RollLink>
        </div>
      </nav>
    </div>
  );
}
