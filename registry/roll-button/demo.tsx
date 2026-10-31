import { ArrowRight, Rocket } from "lucide-react";
import { RollButton } from "./roll-button";

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <RollButton icon={<Rocket className="size-4" />}>Ship it</RollButton>
      <RollButton variant="ghost" icon={<ArrowRight className="size-4" />} iconPosition="end">
        Read the docs
      </RollButton>
    </div>
  );
}
