import { RollLink } from "./roll-link";

// the portfolio's hero nav: a credit on the left, uppercase links on the right
export default function RollLinkDemo() {
  return (
    <div className="relative h-[300px] w-[420px] overflow-hidden rounded-2xl">
      <nav aria-label="Demo" className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[13px] leading-none tracking-tight text-foreground uppercase">
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
