"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { installCommand } from "@/lib/site";

/** The shadcn install command for a component, with a copy button. `onCopied` lets the bot react. */
export function InstallPill({ slug, onCopied }: { slug: string; onCopied?: () => void }) {
  const [copied, setCopied] = useState(false);
  const command = installCommand(slug);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <div className="flex h-9 min-w-56 flex-1 items-center gap-2 rounded-full bg-white/10 pr-1 pl-3.5 font-mono text-xs text-white/70">
      <span className="truncate" title={command}>
        {command}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy install command"}
        data-cuelume-tap
        className="grid size-7 shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
