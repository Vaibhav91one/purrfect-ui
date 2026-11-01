// Dev-only fixture (not in registry.json, never installed): the realistic worst props for StepRing, shown at /dev?c=step-ring.
import type { ReactNode } from "react";
import { StepRing, StepRise, type StepState } from "./step-ring";

const ALL: StepState[] = ["pending", "current", "done", "skipped"];

const row = (...kids: ReactNode[]) => (
  <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-muted p-6 text-foreground">{kids}</div>
);

export const states: Record<string, ReactNode> = {
  Demo: (
    <div className="grid gap-4 p-6">
      {row(...ALL.map((s, i) => <StepRing key={s} state={s} index={i + 1} />))}
      <ol className="rounded-2xl bg-card">
        {ALL.map((s, i) => (
          <StepRise key={s} order={i} className="flex items-center gap-3 border-b border-border/50 px-4 py-4 last:border-b-0">
            <StepRing state={s} index={i + 1} />
            <span className="text-sm">{s}</span>
          </StepRise>
        ))}
      </ol>
    </div>
  ),
  "Worst case": (
    <div className="grid gap-4 p-6">
      {row(
        <StepRing key="0" state="pending" index={0} />,
        <StepRing key="big" state="current" index={1000} />,
        <StepRing key="huge" state="current" index={123456789} />,
        <StepRing key="neg" state="pending" index={-7} />,
        <StepRing key="tiny" state="current" index={3} className="size-3" />,
        <StepRing key="large" state="current" index={4} className="size-40 text-4xl" />,
        <StepRing key="large-done" state="done" index={5} className="size-40" />,
        <StepRing key="tinted" state="current" index={6} className="text-primary" />,
      )}
      <ol className="rounded-2xl bg-card" dir="rtl">
        {Array.from({ length: 30 }, (_, i) => (
          <StepRise key={i} order={i} className="flex items-center gap-3 border-b border-border/50 px-4 py-2 last:border-b-0">
            <StepRing state={ALL[i % 4]} index={i + 1} />
            <span className="min-w-0 break-words text-sm">مرحلة طويلة جدا Supercalifragilisticexpialidocious</span>
          </StepRise>
        ))}
      </ol>
      <ol>
        <StepRise order={0} stagger={0}>
          <StepRing state="current" index={1} />
        </StepRise>
      </ol>
    </div>
  ),
};
