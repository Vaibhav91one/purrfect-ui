"use client";

import { useEffect, useState } from "react";

/** A counter that steps every `ms / speed` while `playing`; pausing freezes it, so a demo holds its pose. */
export function useTick(playing: boolean | undefined, speed: number, ms: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setN((v) => v + 1), ms / speed);
    return () => clearInterval(id);
  }, [playing, speed, ms]);
  return n;
}
