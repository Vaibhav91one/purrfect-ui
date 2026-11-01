import { Mail } from "lucide-react";
import { FillButton } from "./fill-button";

// the portfolio's About column: a short paragraph, then the outlined "Get in touch" pill
export default function FillButtonDemo() {
  return (
    <div className="relative grid h-[300px] w-[420px] place-items-center overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/field.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="relative grid w-80 justify-items-start gap-8 rounded-2xl bg-background p-8 text-foreground">
        <p className="text-muted-foreground">I solve problems through code. Always learning, always refining.</p>
        <FillButton href="#contact" className="px-8 py-4 text-[13px] uppercase">
          Get in touch <Mail className="size-5" />
        </FillButton>
      </div>
    </div>
  );
}
