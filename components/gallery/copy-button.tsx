"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSound } from "@/components/providers/sound-provider";

/** Copies `text`; `done` stays true for a moment afterwards and a soft success cue plays once the copy worked. */
export function useCopy(text: string, label?: string) {
  const { play } = useSound();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      play("success", { emphasis: "subtle" });
      toast.success("Copied", { id: "copy", description: label ?? (text.length > 64 ? `${text.slice(0, 61)}…` : text) });
      setTimeout(() => setDone(false), 1200);
    } catch {
      toast.error("Couldn't copy", { id: "copy" });
    }
  };
  return { done, copy };
}

/** Icon button that copies `text` and shows a tick for a moment. */
export function CopyButton({ text, className = "", label = "Copy install command" }: { text: string; className?: string; label?: string }) {
  const { done, copy } = useCopy(text);
  return (
    <button type="button" onClick={copy} aria-label={done ? "Copied" : label} title={done ? "Copied" : label} className={`grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent ${className}`}>
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}
