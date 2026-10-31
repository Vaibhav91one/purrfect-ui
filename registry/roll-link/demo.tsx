import { RollLink } from "./roll-link";

export default function RollLinkDemo() {
  return (
    <nav aria-label="Demo" className="flex items-center gap-8 text-2xl">
      <RollLink href="#work">Work</RollLink>
      <RollLink href="#about">About</RollLink>
      <RollLink href="#contact">Contact</RollLink>
    </nav>
  );
}
