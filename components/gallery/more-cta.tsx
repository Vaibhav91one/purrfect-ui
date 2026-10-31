"use client";

import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { RollButton as Button } from "@/registry/roll-button/roll-button";
import { SleepingCat } from "./sleeping-cat";

/** Under the home grid: a cat loafing on the "view more" button; hovering the button wakes it. */
export function MoreCta() {
  const wrap = useRef<HTMLDivElement>(null);
  return (
    <div ref={wrap} className="relative z-10 -mt-24 flex flex-col items-center pb-6">
      <SleepingCat variant={3} trigger={wrap} className="-mb-2 h-16 sm:h-20" />
      <Button href="/components" data-cuelume-navigate="" icon={<ArrowRight className="size-4" />} iconPosition="end">
        View more components
      </Button>
    </div>
  );
}
