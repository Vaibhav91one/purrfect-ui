/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { ArrowLeft, ArrowUp, Info, ListChecks, Search, ShieldCheck, Wrench } from "lucide-react";
import { WordStream } from "./word-stream";

// BountyDesk's /reports/[id] reviewer chat: an Agent Bounty reply revealed after the reviewer's question
const QUESTION = "Summarize the reproduced issue, including steps and impact.";
const REPLY =
  "The export endpoint returns another workspace's invoices when you swap the account id in the URL. I reproduced it twice with a fresh viewer session.\n\nImpact is read access to billing data across tenants, so I'd keep this at high severity.";
const PROMPTS = [
  { label: "Summarize issue", icon: ListChecks },
  { label: "Review steps", icon: Search },
  { label: "Suggest remediation", icon: Wrench },
  { label: "Verify a fix", icon: ShieldCheck },
];

export default function WordStreamDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="relative grid h-[560px] w-[800px] place-items-center overflow-hidden rounded-3xl">
      <img src="/demo/fjord.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <section
        aria-label="Reviewer advisory chat"
        className="relative flex h-[480px] w-[600px] flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-xl"
      >
        <header className="flex items-center justify-between px-4 py-3">
          <span className="grid size-8 place-items-center rounded-md text-muted-foreground">
            <ArrowLeft className="size-4" />
          </span>
          <span className="text-sm font-medium text-foreground">Agent Bounty</span>
          <span className="grid size-8 place-items-center rounded-md text-muted-foreground">
            <Info className="size-4" />
          </span>
        </header>

        <div role="log" aria-live="polite" className="flex flex-1 flex-col gap-3 px-6 pt-4 text-sm leading-relaxed">
          <div className="flex flex-col items-end gap-1.5 pl-10">
            <p className="whitespace-pre-wrap rounded-xl bg-muted px-3 py-1.5 text-foreground">{QUESTION}</p>
          </div>
          <button type="button" aria-label="Replay the reply" onClick={() => setRun((n) => n + 1)} className="cursor-pointer text-left">
            <WordStream key={run} text={REPLY} className="text-foreground" />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-6 pt-3 pb-5">
          <div className="mb-2 flex justify-center gap-2">
            {PROMPTS.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex h-6 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground"
              >
                <Icon className="size-3.5" /> {label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-full border border-border/50 bg-background px-6 py-3">
            <span className="h-11 flex-1 content-center px-1 text-sm text-muted-foreground">Ask about this verdict</span>
            <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
