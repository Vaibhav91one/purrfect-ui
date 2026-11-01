"use client";

import { ChevronDown } from "lucide-react";
import { GridDisclosure, type GridDisclosureItem } from "./grid-disclosure";

// The BountyDesk FAQ (bountydesk.vaibhav.quest/#faq), word for word.
export const FAQ: GridDisclosureItem[] = [
  {
    title: "Does reproduction run today?",
    content:
      "Yes, for the one pinned target. A TrueForge agent investigates the report in an isolated sandbox and drafts its own outcome, summary and findings. What still won't change: a report with no authorized target, or one whose repository grant has since been revoked, cannot come back reproduced or not reproduced, whatever the agent concluded. That report stays an analysis packet, and a person decides.",
  },
  {
    title: "How would you know a bug is real?",
    content:
      "The agent's own investigation is the source: it works the report against its authorized target inside a sandbox, using scope-guard and its skills, and reaches its own conclusion. Two things keep that conclusion honest. A person has to approve the exact drafted text before anything reaches the reporter, so nothing ships unseen. And the server re-checks authorization before a reproduced or not-reproduced claim becomes a verdict: a report with no bound target, or one whose grant has been revoked, is refused regardless of what the agent asserts.",
  },
  {
    title: "What exactly am I approving?",
    content:
      "The precise bytes of the outbound comment, bound to a content hash. The delivery worker reads the immutable verdict and refuses any payload whose hash differs from the one you approved, so an approval cannot be reused for different words. Approving does not close the issue.",
  },
  {
    title: "How is scope enforced?",
    content:
      "At the capability boundary, not by the agent choosing to behave. Clone, deploy and egress each take the target from a server-held profile, never from a string the model produced. Issue text, attachments and model output can never create a profile, so a report without one is triaged and goes no further.",
  },
  {
    title: "What does the GitHub App ask for?",
    content:
      "Metadata read, and Issues read and write. Nothing that can write code, open pull requests or change repository settings. Signing in says who you are; installing the App is what grants access to a repository, and the two are deliberately separate.",
  },
  {
    title: "Do I need GitHub at all?",
    content:
      "Not for intake. Email and file upload are independent channels that need no GitHub connection to create and triage a report, and both deliver the approved verdict back: an email report is replied to at the sender's verified address, and an upload's verdict goes to the contact the uploader confirmed with a one-time code. A delivery is still only recorded once there is a verified recipient and a transport receipt, which is the safety property rather than a gap.",
  },
];

export default function GridDisclosureDemo() {
  return (
    <div className="relative grid h-[680px] w-[880px] place-items-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/dunes.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <section className="relative grid w-[820px] grid-cols-[200px_1fr] gap-8 rounded-3xl bg-background p-8 shadow-2xl">
        <div className="flex flex-col gap-3">
          <h2 className="text-[26px] leading-tight font-medium tracking-[-0.02em] text-foreground">
            Frequently
            <br /> asked questions
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">Answers come from the design record, not from a marketing draft.</p>
        </div>
        <GridDisclosure items={FAQ} icon={<ChevronDown className="size-4" strokeWidth={1.75} />} />
      </section>
    </div>
  );
}
