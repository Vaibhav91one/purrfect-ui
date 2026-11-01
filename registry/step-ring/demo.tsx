"use client";

import { ExternalLink, FileSearch, Inbox, PenLine, Send, UserCheck } from "lucide-react";
import { useState } from "react";
import { StepRing, StepRise, type StepState } from "./step-ring";

// The BountyDesk case file's Lifecycle panel (app/(app)/reports/[id]/lifecycle-list.tsx), labels and notes from
// lib/reports/case-view.ts. The mascot per row is drawn as a lucide icon here.
const STEPS = [
  { label: "Intake", icon: Inbox, notes: ["Authenticated, target bound"] },
  { label: "Investigation", icon: FileSearch, notes: ["In progress", "14 steps recorded"] },
  { label: "Verdict drafted", icon: PenLine, notes: ["None yet", "Revision 1"] },
  { label: "Human approval", icon: UserCheck, notes: ["Not reached", "Waiting on a reviewer", "Approved by vaibhav"] },
  { label: "Delivery", icon: Send, notes: ["Not enqueued", "sent, waiting for the delivery receipt", "delivered"] },
];

// Each click moves the run one phase on; the last stage has a skipped re-check row, as a crashed turn draws it.
const STAGES: StepState[][] = [
  ["done", "current", "pending", "pending", "pending"],
  ["done", "done", "done", "current", "pending"],
  ["done", "done", "done", "done", "current"],
  ["done", "done", "done", "done", "done"],
  ["done", "skipped", "pending", "pending", "pending"],
];

const noteFor = (notes: string[], state: StepState) =>
  notes[Math.min(notes.length - 1, state === "pending" ? 0 : state === "current" ? 1 : notes.length - 1)];

export default function StepRingDemo() {
  const [stage, setStage] = useState(0);
  const states = STAGES[stage];
  const next = () => setStage((s) => (s + 1) % STAGES.length);
  return (
    <div className="relative grid h-[560px] w-[800px] place-items-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/valley.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <section className="relative flex w-[560px] flex-col gap-4 rounded-xl border border-border/50 bg-card pt-5 shadow-2xl">
        <header className="px-5">
          <h2 className="text-xs text-muted-foreground">Lifecycle</h2>
        </header>
        {/* A list cannot sit inside a <button>, so the click target is a div with the button role and its keys. */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Advance the run and replay the lifecycle"
          onClick={next}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              next();
            }
          }}
          className="cursor-pointer rounded-b-xl outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <ol key={stage} className="flex flex-col">
            {STEPS.map(({ label, icon: Icon, notes }, i) => {
              const state = states[i];
              const note = state === "skipped" ? "Stopped: the agent turn errored" : noteFor(notes, state);
              return (
                <StepRise key={label} order={i} className="border-b border-border/50 last:border-b-0">
                  <span className="flex items-center gap-3 px-4 py-4">
                    <StepRing state={state} index={i + 1} />
                    <span className={`grid size-12 shrink-0 place-items-center rounded-full bg-muted text-foreground ${state === "pending" ? "opacity-40" : ""}`}>
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="min-w-0 flex-1 text-sm font-medium text-foreground">{label}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{note}</span>
                    </span>
                    {state === "pending" ? (
                      <span aria-hidden className="size-3.5 shrink-0" />
                    ) : (
                      <ExternalLink aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </span>
                </StepRise>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
