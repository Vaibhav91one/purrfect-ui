"use client";

import { useState } from "react";
import { Code } from "./code";
import { CopyButton } from "./copy-button";

// `install` is the npx form; the others run the same shadcn CLI through their own runner
const RUNNERS = [
  ["npm", "npx "],
  ["pnpm", "pnpm dlx "],
  ["yarn", "yarn dlx "],
  ["bun", "bunx --bun "],
] as const;

/** One install command with a package-manager switch, and a copy button for whichever is showing. */
export function InstallTabs({ install }: { install: string }) {
  const [pm, setPm] = useState<(typeof RUNNERS)[number][0]>("npm");
  const cmd = install.replace(/^npx /, RUNNERS.find(([n]) => n === pm)![1]);
  return (
    <div className="rounded-xl bg-muted">
      <div role="tablist" aria-label="Package manager" className="flex gap-1 px-2 pt-2">
        {RUNNERS.map(([name]) => (
          <button key={name} type="button" role="tab" aria-selected={pm === name} onClick={() => setPm(name)} className={`rounded-lg px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-accent ${pm === name ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 py-1 pr-1 pl-4">
        <Code code={cmd} lang="shell" className="min-w-0 flex-1 py-2 text-xs" />
        <CopyButton text={cmd} />
      </div>
    </div>
  );
}
