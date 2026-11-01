// Dev-only fixture (not in registry.json, never installed): the realistic worst props for VoiceBars, shown at /dev?c=voice-bars.
import type { ReactNode } from "react";
import { VoiceBars } from "./voice-bars";

const frame = (...kids: ReactNode[]) => (
  <div className="grid max-w-full gap-6 p-6">
    {kids.map((k, i) => (
      <div key={i} className="min-w-0 overflow-hidden rounded-2xl bg-muted p-4">
        {k}
      </div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: frame(<VoiceBars className="text-foreground" />, <VoiceBars className="h-5 text-muted-foreground" aria-label="Listening" />),
  "Worst case": frame(
    <VoiceBars bars={0} />,
    <VoiceBars bars={1} />,
    // 200 bars overflow a phone: the row clips rather than squashing bars to nothing
    <VoiceBars bars={200} className="justify-start" />,
    <VoiceBars className="h-40 gap-2 text-primary [&>span]:w-2" />,
    <VoiceBars className="h-2" />,
    <VoiceBars duration={0.2} stagger={0} />,
    // check-ignore: duration a deliberately slow loop to check the long end
    <VoiceBars duration={10} stagger={1} />,
    <div dir="rtl">
      <VoiceBars className="justify-start text-destructive" />
    </div>,
  ),
};
