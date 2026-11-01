/* eslint-disable @next/next/no-img-element */
import { ArrowLeft, ArrowUp, Bot, ListChecks, Search, ShieldCheck, Wrench } from "lucide-react";
import { ShimmerText } from "@/registry/shimmer-text/shimmer-text";
import { PixelWave } from "./pixel-wave";

// BountyDesk's case-file approval dialog, chat side: Agent Bounty header, the conversation, the "thinking" row, quick prompts and the pill composer
const PROMPTS = [
  { label: "Summarize issue", icon: ListChecks },
  { label: "Review steps", icon: Search },
  { label: "Suggest remediation", icon: Wrench },
  { label: "Verify a fix", icon: ShieldCheck },
];

export default function PixelWaveDemo() {
  return (
    <div className="relative grid h-[700px] w-[600px] place-items-center overflow-hidden rounded-3xl">
      <img src="/demo/canal.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <section className="relative flex h-[600px] w-[520px] flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl ring-1 ring-border/50">
        <header className="grid grid-cols-3 items-center border-b border-border/50 px-4 py-3">
          <span className="flex items-center gap-1.5 justify-self-start rounded-md px-2 py-1 text-sm text-muted-foreground">
            <ArrowLeft className="size-4" /> Back
          </span>
          <h2 className="flex items-center gap-2 justify-self-center text-sm font-medium text-foreground">
            <span className="grid size-8 place-items-center rounded-full bg-muted">
              <Bot className="size-4" />
            </span>
            Agent Bounty
          </h2>
        </header>

        <div role="log" aria-label="Conversation with Agent Bounty" className="flex flex-1 flex-col gap-3 overflow-hidden px-6 pt-4 text-sm">
          <p className="self-end rounded-xl bg-muted px-3 py-1.5 text-foreground">Did the probe actually read another user&apos;s basket?</p>
          <p className="text-foreground">
            Yes. The reproduction logged in as the test customer, then requested <code className="rounded bg-muted px-1">/rest/basket/2</code>{" "}
            and got basket 2 back with a 200. That basket belongs to the seeded admin account, so the IDOR is confirmed against
            v17.3.0.
          </p>
          <p className="self-end rounded-xl bg-muted px-3 py-1.5 text-foreground">Does the drafted comment say which commit was tested?</p>
          <div className="flex items-center gap-2.5 py-1" role="status" aria-label="Agent Bounty is thinking">
            <PixelWave className="text-foreground" />
            <ShimmerText className="font-medium">Agent Bounty is thinking</ShimmerText>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-6 pt-3 pb-5">
          <div className="flex justify-center gap-2" role="group" aria-label="Suggested prompts">
            {PROMPTS.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground opacity-50"
              >
                <Icon className="size-3.5" /> {label}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-full border border-border/50 bg-background px-6 py-3">
            <span className="flex-1 text-sm text-muted-foreground">Ask about this verdict</span>
            <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground opacity-50">
              <ArrowUp className="size-4" />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
