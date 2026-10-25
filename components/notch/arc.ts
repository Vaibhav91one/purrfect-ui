export type Size = { w: number; h: number };
export type Point = { x: number; y: number };

const SAMPLES = 400;

/** Visible gap between two chips: how far apart their boxes are on whichever axis separates them (negative = overlap). */
export const gapBetween = (a: Point, sa: Size, b: Point, sb: Size) =>
  Math.max(Math.abs(b.x - a.x) - (sa.w + sb.w) / 2, Math.abs(b.y - a.y) - (sa.h + sb.h) / 2);

/**
 * Centres for chips hung along the lower half of an ellipse (origin = ellipse centre, y down), from the left end at
 * centre height, under it, to the right end. Each chip is placed so its box sits exactly one gap from the previous
 * box, and the gap is solved so the last chip lands on the end of the curve: equal gaps whatever the chip sizes,
 * with the first and last chip on the ends.
 */
export function arcLayout(sizes: Size[], rx: number, ry: number): Point[] {
  const curve = Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const s = (Math.PI * i) / SAMPLES;
    return { x: -rx * Math.cos(s), y: ry * Math.sin(s), d: 0 };
  });
  for (let i = 1; i <= SAMPLES; i++) curve[i].d = curve[i - 1].d + Math.hypot(curve[i].x - curve[i - 1].x, curve[i].y - curve[i - 1].y);
  const total = curve[SAMPLES].d;

  // point at a distance along the curve (clamped to its ends)
  const at = (dist: number): Point => {
    const d = Math.min(total, Math.max(0, dist));
    let lo = 0;
    let hi = SAMPLES;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (curve[mid].d <= d) lo = mid;
      else hi = mid;
    }
    const a = curve[lo];
    const b = curve[hi];
    const k = b.d === a.d ? 0 : (d - a.d) / (b.d - a.d);
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
  };

  // distance along the curve of every chip for a given gap; the first sits on the start
  const walk = (gap: number) => {
    const ds = [0];
    for (let i = 1; i < sizes.length; i++) {
      const prev = at(ds[i - 1]);
      let lo = ds[i - 1];
      let hi = total * 2; // unreachable gap runs off the end, which tells the caller the gap is too big
      for (let k = 0; k < 30; k++) {
        const mid = (lo + hi) / 2;
        if (gapBetween(prev, sizes[i - 1], at(mid), sizes[i]) >= gap) hi = mid;
        else lo = mid;
      }
      ds.push(hi);
    }
    return ds;
  };

  if (sizes.length < 2) return sizes.map(() => ({ x: 0, y: ry }));
  let lo = -total;
  let hi = total;
  for (let i = 0; i < 40; i++) {
    const gap = (lo + hi) / 2;
    if (walk(gap)[sizes.length - 1] < total) lo = gap;
    else hi = gap;
  }
  return walk((lo + hi) / 2).map(at);
}
