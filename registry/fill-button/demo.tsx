import { ArrowUpRight } from "lucide-react";
import { FillButton } from "./fill-button";

export default function FillButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <FillButton>Get in touch</FillButton>
      <FillButton href="#work">
        View work <ArrowUpRight className="size-4" />
      </FillButton>
    </div>
  );
}
