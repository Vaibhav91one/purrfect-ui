"use client";

import { useState } from "react";
import { WordStream } from "./word-stream";

// just the words streaming in (an Agent Bounty reply from BountyDesk's reviewer chat); click to replay
const REPLY =
  "The export endpoint returns another workspace's invoices when you swap the account id in the URL. I reproduced it twice with a fresh viewer session.\n\nImpact is read access to billing data across tenants, so I'd keep this at high severity.";

export default function WordStreamDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className="grid h-[560px] w-[800px] place-items-center">
      <button
        type="button"
        aria-label="Replay the reply"
        onClick={() => setRun((n) => n + 1)}
        className="w-[600px] cursor-pointer text-left"
      >
        <WordStream key={run} text={REPLY} className="text-2xl leading-relaxed text-foreground" />
      </button>
    </div>
  );
}
