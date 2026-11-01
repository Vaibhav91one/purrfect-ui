// Dev-only fixture (not in registry.json, never installed): the realistic worst props for Magnetic, shown at /dev?c=magnetic.
import type { ReactNode } from "react";
import { Magnetic } from "./magnetic";

const btn = "rounded-full bg-foreground px-6 py-3 text-background"; // labels wrap, so a long one fits a phone
const box = (...kids: ReactNode[]) => (
  <div className="flex flex-col items-start gap-8 p-6">
    {kids.map((k, i) => (
      <div key={i}>{k}</div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: box(
    <Magnetic strength={1}>
      <button type="button" className={btn}>Full strength</button>
    </Magnetic>,
    <Magnetic strength={0.4}>
      <button type="button" className={btn}>Soft, 0.4</button>
    </Magnetic>,
  ),
  "Worst case": box(
    <Magnetic>
      <button type="button" className={btn}>Subscribe to the quarterly engineering newsletter and product updates</button>
    </Magnetic>,
    <Magnetic strength={3}>
      <button type="button" className={btn}>Strength 3 (more than the pointer&apos;s own offset)</button>
    </Magnetic>,
    <Magnetic strength={-1}>
      <button type="button" className={btn}>Negative strength pushes away</button>
    </Magnetic>,
    <Magnetic>
      <div className="grid h-48 w-72 place-items-center rounded-3xl bg-muted">A large block, not a button</div>
    </Magnetic>,
    <Magnetic>
      <a href="#x" className="underline">A plain text link</a>
    </Magnetic>,
    <Magnetic>
      <Magnetic>
        <button type="button" className={btn}>Nested inside another Magnetic</button>
      </Magnetic>
    </Magnetic>,
  ),
  One: box(
    <Magnetic>
      <button type="button" className={btn}>A</button>
    </Magnetic>,
  ),
  Empty: box(
    <Magnetic>{null}</Magnetic>,
    <Magnetic strength={0}>
      <button type="button" className={btn}>Strength 0 (stays still)</button>
    </Magnetic>,
  ),
};
