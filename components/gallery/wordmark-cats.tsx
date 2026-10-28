import type { ReactNode } from "react";
import { VARIANTS } from "./cat-variants";

// Three small cats that live in the footer wordmark: one on top of the p, one curled in the c, one in the gap between
// t and u. Same trick as the other cats (a fattened outline copy plus a white copy in a gradient mask, two dot eyes cut
// out of it); all motion is CSS (`wm-*` in globals.css), so this stays a server component. Sizes are in em, so a cat
// stays on its letter at any wordmark size.
const OUTLINE = 4;
const BLOBS: [number, number][] = [
  [25, 70],
  [75, 40],
  [50, 90],
  [60, 30],
];

function Cat({ id, variant, className, parts, eyes, i, w = 100, h = 100, extra, ground }: { id: string; i: number; w?: number; h?: number; extra?: ReactNode; ground: [number, number, number]; variant: number; className: string; parts: (fill: boolean) => ReactNode; eyes: ReactNode }) {
  const look = VARIANTS[variant % VARIANTS.length];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ "--i": `${i * 120}ms` } as React.CSSProperties} className={`wm-cat pointer-events-auto absolute overflow-visible ${className}`}>
      <defs>
        <mask id={`wm-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          {parts(true)}
          {eyes}
        </mask>
        <filter id={`wmb-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      {ground[2] > 0 && <ellipse cx={ground[0]} cy={ground[1]} rx={ground[2]} ry={ground[2] / 6} fill="#000" opacity="0.16" />}
      <g className="text-background" fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        {parts(false)}
      </g>
      <g mask={`url(#wm-${id})`}>
        <rect width={w} height={h} fill={look.base} />
        <g className="cat-spin" filter={`url(#wmb-${id})`} style={{ transformOrigin: `${w / 2}px ${h / 2}px`, transformBox: "view-box" }}>
          {BLOBS.map(([cx, cy], i) => (
            <circle key={i} cx={cx * (w / 100)} cy={cy * (h / 100)} r={48 * (w / 100)} fill={look.blobs[i]} />
          ))}
        </g>
      </g>
      <g className="wm-eyes-on pointer-events-none">{eyes}</g>
      {extra}
    </svg>
  );
}

const shape = (d: string, fill: boolean, extra?: object) => <path key={d} d={d} fill={fill ? "white" : undefined} strokeWidth={fill ? 0 : OUTLINE} {...extra} />;
const stroke = (d: string, fill: boolean, w: number, cls?: string) => <path key={d} d={d} fill="none" stroke={fill ? "white" : undefined} strokeWidth={w + (fill ? 0 : OUTLINE)} strokeLinecap="round" className={cls} />;
const dot = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="2.6" fill="black" />;

export function CurledCat({ className }: { className: string }) {
  const parts = (f: boolean) => (
    <g className="wm-breathe">
      {stroke("M18 72 C32 86 66 86 82 72", f, 9, "wm-tail-curl")}
      {shape("M10 68 C10 44 32 36 52 38 C74 40 88 54 84 72 C80 88 18 90 10 68 Z", f)}
      <g className="wm-head-rest">
        {shape("M62 42 L64 24 L74 34 Z", f)}
        {shape("M82 34 L92 24 L92 44 Z", f)}
        {shape("M60 50 C58 38 70 32 80 33 C92 34 98 46 94 56 C90 66 72 68 64 62 C61 59 60 54 60 50 Z", f)}
      </g>
    </g>
  );
  const eyes = (
    <g className="wm-head-rest">
      {dot(72, 50)}
      {dot(86, 50)}
    </g>
  );
  return <Cat id="curl" i={1} ground={[50, 86, 34]} variant={1} className={className} parts={parts} eyes={eyes} />;
}

/** In the gap between t and u: front paws forward, rump up, a slow stretch every few seconds. */
export function StretchCat({ className }: { className: string }) {
  const parts = (f: boolean) => (
    <g className="wm-stretch">
      {stroke("M18 62 C6 56 4 38 14 28", f, 9, "wm-tail")}
      {stroke("M30 78 L26 100", f, 9)}
      {stroke("M44 80 L42 100", f, 9)}
      {stroke("M74 76 L86 98 L98 98", f, 9)}
      {shape("M14 64 C14 48 34 46 52 52 C70 58 80 72 76 84 C72 94 20 90 14 64 Z", f)}
      {shape("M74 66 L78 52 L86 62 Z", f)}
      {shape("M88 60 L98 52 L98 68 Z", f)}
      {shape("M72 74 C70 62 80 58 88 59 C98 60 102 70 98 78 C94 86 78 86 74 80 C73 78 72 76 72 74 Z", f)}
    </g>
  );
  const eyes = (
    <g className="wm-stretch">
      {dot(80, 70)}
      {dot(92, 70)}
    </g>
  );
  return <Cat id="stretch" i={2} ground={[52, 98, 40]} variant={4} className={className} parts={parts} eyes={eyes} />;
}

/** Across the flat tops of u, r, r: fast asleep, tail draped over the end, a little z drifting up. */
export function LoafCat({ className }: { className: string }) {
  const parts = (f: boolean) => (
    <g className="wm-breathe">
      {stroke("M14 62 C0 62 -4 44 8 34", f, 8, "wm-tail-curl")}
      {shape("M10 70 C8 40 40 26 100 26 C150 26 176 36 176 70 Z", f)}
      {shape("M152 36 L154 12 L168 26 Z", f)}
      {shape("M178 26 L192 12 L194 36 Z", f)}
      {shape("M148 52 C148 34 162 28 176 28 C194 28 202 40 198 54 C194 68 180 70 166 70 C154 70 148 62 148 52 Z", f)}
    </g>
  );
  const eyes = (
    <g className="wm-breathe">
      {dot(164, 48)}
      {dot(184, 48)}
    </g>
  );
  const zs = (
    <g className="fill-muted-foreground text-[22px] font-semibold" aria-hidden>
      <text x="150" y="8" className="wm-z">z</text>
      <text x="172" y="-6" className="wm-z" style={{ animationDelay: "-1.6s" }}>z</text>
    </g>
  );
  return <Cat id="loaf" i={0} ground={[100, 70, 0]} variant={3} className={className} parts={parts} eyes={eyes} w={200} h={72} extra={zs} />;
}
