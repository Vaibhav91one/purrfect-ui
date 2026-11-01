"use client";

import { useRef, useState } from "react";
import { Bot, Sparkles, Star, SquareCheckBig } from "lucide-react";
import { AnnounceStrip } from "./announce-strip";

const CREDIT = "Built for the WeMakeDevs × TrueFoundry × Qodo Agent Harness Hackathon";

// BountyDesk's landing: the credit strip above the sticky top bar. Scroll the page to put it away, X dismisses it,
// clicking the headline brings it back.
export default function AnnounceStripDemo() {
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  return (
    <div className="relative h-[560px] w-[800px] overflow-hidden rounded-2xl p-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/fjord.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div ref={box} className="relative h-full overflow-y-auto rounded-xl bg-background text-foreground shadow-2xl">
        <div className="sticky top-0 z-10 bg-background">
          <AnnounceStrip open={open} onDismiss={() => setOpen(false)} container={box}>
            <span className="flex items-center gap-3 px-4 py-1.5 text-xs">
              {CREDIT}
              <Bot aria-hidden className="size-4" />
            </span>
          </AnnounceStrip>
          <nav className="flex items-center justify-between px-8 py-3 text-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <SquareCheckBig aria-hidden className="size-4" /> BountyDesk
            </span>
            <span className="flex items-center gap-6 text-muted-foreground">
              <span>How it works</span>
              <span>Questions</span>
              <span className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-primary-foreground">
                <Sparkles aria-hidden className="size-3.5" /> Get started
              </span>
            </span>
          </nav>
        </div>
        <section className="grid justify-items-center gap-4 px-8 pt-16 pb-12 text-center">
          <button type="button" aria-label="Bring the banner back" onClick={() => setOpen(true)} className="text-5xl leading-tight font-medium tracking-tight">
            Read every report.
            <br />
            Sign every verdict.
          </button>
          <p className="text-sm text-muted-foreground">Every report authenticated and scope-checked. No verdict ships until you sign it.</p>
          <span className="flex gap-3 text-sm">
            <span className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-primary-foreground">
              <Sparkles aria-hidden className="size-3.5" /> Get started
            </span>
            <span className="flex items-center gap-1.5 rounded-full border px-4 py-2">
              <Star aria-hidden className="size-3.5" /> Star on GitHub
            </span>
          </span>
        </section>
        <div className="relative px-10 py-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/demo/valley.jpg" alt="" className="absolute inset-0 size-full object-cover" />
          <div className="relative grid gap-3 rounded-xl border bg-card p-5 text-sm text-card-foreground">
            <p>
              <span className="mr-2 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">Awaiting approval</span>
              Auth bypass via SQL injection on login
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Verdict: analysis only.</span> BountyDesk could not reproduce this report automatically, so a
              reviewer read the report and the run&apos;s own event log and is signing this reply by hand.
            </p>
          </div>
        </div>
        <div className="h-64" />
      </div>
    </div>
  );
}
