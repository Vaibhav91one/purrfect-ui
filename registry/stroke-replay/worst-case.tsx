// Dev-only fixture (not in registry.json, never installed): the realistic worst props for StrokeReplay, shown at /dev?c=stroke-replay.
import type { ReactNode } from "react";
import { Painting } from "./demo";
import { StrokeReplay } from "./stroke-replay";

const many = (
  <svg viewBox="0 0 400 500" aria-hidden>
    <rect data-static width="400" height="500" className="fill-muted" />
    {Array.from({ length: 400 }, (_, i) => (
      <circle key={i} cx={(i * 37) % 400} cy={(i * 53) % 500} r={4 + (i % 9)} className={i % 2 ? "fill-foreground" : "fill-muted-foreground"} />
    ))}
  </svg>
);

export const states: Record<string, ReactNode> = {
  Demo: (
    <div className="w-[320px] p-6">
      <StrokeReplay>
        <Painting />
      </StrokeReplay>
    </div>
  ),
  "Worst case": (
    <div className="flex flex-wrap items-start gap-6 p-6">
      <div className="w-[160px]">
        <StrokeReplay label="A very long timelapse label that will not fit in the badge">
          <Painting />
        </StrokeReplay>
      </div>
      <div className="w-[320px]">
        <StrokeReplay duration={754000} hold={0} label={null}>
          {many}
        </StrokeReplay>
      </div>
      <div className="w-[320px]">
        <StrokeReplay duration={800} label="Zero shapes">
          <svg viewBox="0 0 400 500" aria-hidden>
            <rect data-static width="400" height="500" className="fill-muted" />
          </svg>
        </StrokeReplay>
      </div>
      <div className="w-[320px]" dir="rtl">
        <StrokeReplay label="تايم لابس">
          <Painting />
        </StrokeReplay>
      </div>
    </div>
  ),
};
