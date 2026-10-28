"use client";

import { Tabs } from "./tabs";

export default function TabsDemo() {
  return (
    <div className="grid h-64 place-items-center">
      <Tabs tabs={["Preview", "Code", "Docs"]} className="text-lg" />
    </div>
  );
}
