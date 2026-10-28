// Dev-only fixture (not in registry.json, never installed): the realistic worst props for Toggle, shown at /dev?c=toggle.
import type { ReactNode } from "react";
import { Toggle } from "./toggle";

const box = (...kids: ReactNode[]) => (
  <div className="flex flex-col items-start gap-8 p-6">
    {kids.map((k, i) => (
      <div key={i}>{k}</div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: box(<Toggle label="Notifications" defaultChecked />, <Toggle label="Notifications" />),
  "Worst case": box(
    <Toggle label="Allow the quarterly engineering newsletter and product updates to be sent to every address on this account" />,
    <Toggle label="Disabled, on" defaultChecked disabled />,
    <Toggle label="Disabled, off" disabled />,
    // a 112px switch in a flex row with a long sibling: it must not shrink into an oval
    <div className="flex w-64 items-center gap-4">
      <Toggle label="Beside a long label" />
      <span>Beside a long label that wraps onto several lines when there is no room left</span>
    </div>,
  ),
};
