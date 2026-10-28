import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "./button";

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button icon={<Rocket className="size-4" />}>Ship it</Button>
      <Button variant="ghost" icon={<ArrowRight className="size-4" />} iconPosition="end">
        Read the docs
      </Button>
    </div>
  );
}
