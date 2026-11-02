"use client";

import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { AnnounceStrip } from "./announce-strip";

const CREDIT = "Built for the WeMakeDevs × TrueFoundry × Qodo Agent Harness Hackathon";

// The strip alone, in BountyDesk's emerald (the same in both themes). X puts it away; it slides back a moment later.
export default function AnnounceStripDemo() {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setOpen(true), 1400);
    return () => clearTimeout(t);
  }, [open]);
  return (
    <div className="w-[380px] overflow-hidden rounded-lg">
      <AnnounceStrip open={open} onDismiss={() => setOpen(false)} hideOnScroll={false} className="bg-emerald-500 text-black">
        <span className="flex items-center gap-3 px-4 py-2">
          {CREDIT}
          <Bot aria-hidden className="size-4" />
        </span>
      </AnnounceStrip>
    </div>
  );
}
