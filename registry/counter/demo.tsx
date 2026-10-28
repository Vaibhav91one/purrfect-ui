"use client";

import { useState } from "react";
import { Counter } from "./counter";

const VALUES = [100, 2480, 37, 9999, 512];

export default function CounterDemo() {
  const [i, setI] = useState(0);
  return (
    <div className="grid h-64 place-items-center">
      <button type="button" onClick={() => setI((n) => (n + 1) % VALUES.length)} aria-label="Next number">
        <Counter value={VALUES[i]} className="text-8xl font-semibold tracking-tight" />
      </button>
    </div>
  );
}
