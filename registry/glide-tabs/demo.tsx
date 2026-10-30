"use client";

import { GlideTabs } from "./glide-tabs";

export default function TabsDemo() {
  return (
    <div className="grid h-64 place-items-center">
      <GlideTabs tabs={["Preview", "Code", "Docs"]} className="text-lg" />
    </div>
  );
}
