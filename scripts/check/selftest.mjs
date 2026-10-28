// node scripts/check/selftest.mjs: every rule must fire on a snippet that breaks it, and stay quiet on a clean one.
import assert from "node:assert/strict";
import { RULES } from "./rules.mjs";

const item = { dependencies: ["motion"] };
const BAD = {
  "no-transition-all": `<div className="transition-all" />`,
  "no-scale-zero": `<div className="scale-0" />`,
  "no-ease-in": `<div className="ease-in" />`,
  "gpu-props": `el.animate([{ width: "0px" }, { width: "10px" }], {})`,
  "motion-shorthand": `<motion.div animate={{ x: 10 }} />`,
  duration: `<div className="duration-700" />`,
  "reduced-motion": `export const A = () => <div className="transition-opacity" />`,
  "reduced-motion-live": `const r = matchMedia("(prefers-reduced-motion: reduce)").matches;`,
  "raw-hover": `.a:hover { color: red }`,
  "installable-imports": `import { x } from "@/lib/sound";`,
  "own-components": `import { Button } from "@mui/material";`,
  "deps-declared": `import { x } from "lodash";`,
  "use-client": `export const A = () => { const [a] = useState(0); return null };`,
  "use-client-unneeded": `"use client";\nexport const A = () => null;`,
  "ssr-safe": `const w = window.innerWidth;`,
  "clickable-semantics": `<div onClick={() => go()}>x</div>`,
  "site-tokens": `<div style={{ color: "var(--site-pink)" }} />`,
};
const CLEAN = `"use client";
import { useState } from "react";
import { useReducedMotion } from "motion/react";
export function A() {
  const [a, set] = useState(0);
  const reduce = useReducedMotion();
  return <button onClick={() => set(a + 1)} className="transition-[translate,opacity] duration-200 ease-out" style={{ color: "var(--foreground)" }}>{reduce ? "a" : "b"}</button>;
}`;

for (const r of RULES) {
  assert.ok(BAD[r.id], `no bad sample for rule ${r.id}`);
  assert.ok(r.run({ src: BAD[r.id], item }).length > 0, `${r.id} did not fire`);
  assert.equal(r.run({ src: CLEAN, item }).length, 0, `${r.id} fired on clean code: ${JSON.stringify(r.run({ src: CLEAN, item }))}`);
}
console.log(`selftest ok: ${RULES.length} rules fire on bad code and stay quiet on clean code`);
