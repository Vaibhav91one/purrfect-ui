// Run: node components/notch/arc.check.mjs   (fails loudly if the spacing maths breaks)
import assert from "node:assert/strict";
import { arcLayout, gapBetween } from "./arc.ts";

const sizes = [156, 90, 120, 74, 140, 40, 40].map((w) => ({ w, h: 40 }));
const rx = 280;
const ry = 76;
const pts = arcLayout(sizes, rx, ry);

// ends land on the ends of the curve: level with the centre, at +/- rx
assert.ok(Math.abs(pts[0].x + rx) < 0.5 && Math.abs(pts[0].y) < 0.5, "first chip on the left end");
assert.ok(Math.abs(pts.at(-1).x - rx) < 0.5 && Math.abs(pts.at(-1).y) < 0.5, "last chip on the right end");

// every visible gap between neighbouring chips is the same
const gaps = pts.slice(1).map((p, i) => gapBetween(pts[i], sizes[i], p, sizes[i + 1]));
const spread = Math.max(...gaps) - Math.min(...gaps);
assert.ok(spread < 1, `gaps uneven: ${gaps.map((g) => g.toFixed(1))}`);
assert.ok(Math.min(...gaps) > 4, "chips overlap or touch");

// equal sizes give a mirror-symmetric layout
const sym = arcLayout(Array(7).fill({ w: 90, h: 40 }), rx, ry);
sym.forEach((p, i) => {
  const m = sym[sym.length - 1 - i];
  assert.ok(Math.abs(p.x + m.x) < 0.5 && Math.abs(p.y - m.y) < 0.5, "mirror symmetric");
});
console.log("arc ok, gaps:", gaps.map((g) => g.toFixed(1)).join(" "));
