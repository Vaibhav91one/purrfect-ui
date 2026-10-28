"use client";

import { useState } from "react";
import { Toggle } from "./toggle";

export default function ToggleDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="grid h-64 place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Toggle label="Notifications" checked={on} onCheckedChange={setOn} />
        <span className="text-sm text-muted-foreground">Notifications {on ? "on" : "off"}</span>
      </div>
    </div>
  );
}
