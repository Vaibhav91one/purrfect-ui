"use client";

// Dev-only: promises made on the client. Passed from the server fixture they would hold the RSC stream open until they settle.
import { useState } from "react";
import { LoadPreloader } from "./load-preloader";

/** never resolves: maxWait counts it to 100 anyway */
export function NeverReady() {
  const [never] = useState(() => new Promise<void>(() => {}));
  return <LoadPreloader contained storageKey={false} ready={never} maxWait={3} />;
}

/** rejects: counts as loaded, not stuck */
export function FailsToLoad() {
  const [fails] = useState(() => {
    const p = Promise.reject(new Error("load failed"));
    p.catch(() => {});
    return p;
  });
  return <LoadPreloader contained storageKey={false} ready={fails} />;
}
