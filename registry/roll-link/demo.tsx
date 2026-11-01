import { RollLink } from "./roll-link";

// the portfolio's hero nav: a credit on the left, uppercase links on the right, white over the photo
export default function RollLinkDemo() {
  return (
    <div className="relative h-[300px] w-[420px] overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/storm.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      {/* check-ignore: hardcoded-color white nav over a photo, in either theme */}
      <nav aria-label="Demo" className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[13px] leading-none tracking-tight text-white uppercase">
        <span>© Code by Vaibhav</span>
        <span className="flex gap-6">
          <RollLink href="#work">Work</RollLink>
          <RollLink href="#about">About</RollLink>
          <RollLink href="#contact">Contact</RollLink>
        </span>
      </nav>
    </div>
  );
}
