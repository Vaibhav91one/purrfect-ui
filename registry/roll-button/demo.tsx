import { ArrowRight, Rocket } from "lucide-react";
import { RollButton } from "./roll-button";

export default function ButtonDemo() {
  return (
    <div className="relative flex h-[300px] w-[420px] items-center justify-center gap-4 overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/dunes.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <RollButton icon={<Rocket className="size-4" />}>Ship it</RollButton>
      <RollButton variant="ghost" icon={<ArrowRight className="size-4" />} iconPosition="end">
        Read the docs
      </RollButton>
    </div>
  );
}
