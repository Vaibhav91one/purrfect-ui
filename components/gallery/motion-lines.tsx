// Comic-style motion lines: three short strokes to the left and right of whatever is making a fuss, and three
// splayed above it. They fade in and out in place. Draws over its parent (which must be `relative`) in the text colour.
const SIDE = [
  { x: 54, y1: 86, y2: 114, tilt: 8 },
  { x: 42, y1: 74, y2: 126, tilt: 0 },
  { x: 30, y1: 86, y2: 114, tilt: -8 },
];
const TOP = [
  { x1: 82, y1: 10, x2: 88, y2: 26 },
  { x1: 100, y1: 2, x2: 100, y2: 22 },
  { x1: 118, y1: 10, x2: 112, y2: 26 },
];

export function MotionLines({ active }: { active: boolean }) {
  if (!active) return null;
  const delay = (i: number) => ({ animationDelay: `${i * 0.1}s` });
  const side = (mirror: boolean) =>
    SIDE.map((l, i) => (
      <line key={`${mirror}${i}`} x1={l.x} y1={l.y1} x2={l.x} y2={l.y2} transform={`rotate(${mirror ? -l.tilt : l.tilt} ${l.x} 100)`} className="cat-line" style={delay(i)} />
    ));
  return (
    <svg viewBox="0 0 200 200" aria-hidden className="pointer-events-none absolute -inset-[18%] size-[136%] overflow-visible" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      {side(false)}
      <g transform="translate(218 0) scale(-1 1)">{side(true)}</g>
      {TOP.map((l, i) => (
        <line key={i} {...l} className="cat-line" style={delay(i)} />
      ))}
    </svg>
  );
}
