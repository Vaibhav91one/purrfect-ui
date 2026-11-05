"use client";

import { useEffect, useState } from "react";

/** A counter that steps every `ms / speed` while `playing`; pausing freezes it, so a demo holds its pose. */
export function useTick(playing: boolean | undefined, speed: number, ms: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!playing) return;
    // the first step comes soon (not after a whole interval), so the loop starts moving as the dialog opens or resumes
    const step = ms / speed;
    let id: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      setN((v) => v + 1);
      id = setInterval(() => setN((v) => v + 1), step);
    }, Math.min(step, 500));
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [playing, speed, ms]);
  return n;
}
