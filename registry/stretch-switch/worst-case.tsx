// Dev-only fixture (not in registry.json, never installed): the realistic worst props for StretchSwitch, shown at /dev?c=stretch-switch.
import type { ReactNode } from "react";
import { StretchSwitch } from "./stretch-switch";

const box = (...kids: ReactNode[]) => (
  <div className="flex flex-col items-start gap-8 p-6">
    {kids.map((k, i) => (
      <div key={i}>{k}</div>
    ))}
  </div>
);

export const states: Record<string, ReactNode> = {
  Demo: box(<StretchSwitch label="Notifications" defaultChecked />, <StretchSwitch label="Notifications" />),
  "Worst case": box(
    <StretchSwitch label="Allow the quarterly engineering newsletter and product updates to be sent to every address on this account" />,
    <StretchSwitch label="Disabled, on" defaultChecked disabled />,
    <StretchSwitch label="Disabled, off" disabled />,
    <StretchSwitch label="Small" defaultChecked className="[--switch-w:3rem] [--switch-h:1.75rem]" />,
    <StretchSwitch label="Large" className="[--switch-w:10rem] [--switch-h:5rem]" />,
    <form key="f"><StretchSwitch label="In a form" name="opt-in" defaultChecked /></form>,
    // disabled + on is left out of the submission, like a disabled checkbox
    <form key="fd"><StretchSwitch label="Disabled in a form" name="locked" defaultChecked disabled /></form>,
    // RTL: the knob starts on the right and must stay inside the track when on
    <div key="rtl" dir="rtl"><StretchSwitch label="RTL" defaultChecked /></div>,
    // a 112px switch in a flex row with a long sibling: it must not shrink into an oval
    <div className="flex w-64 items-center gap-4">
      <StretchSwitch label="Beside a long label" />
      <span>Beside a long label that wraps onto several lines when there is no room left</span>
    </div>,
  ),
};
