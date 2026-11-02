import type { CSSProperties, ReactNode, SVGProps } from "react";
import { OUTLINE, PLAYING, SITTING, SLEEPING } from "./cat-shapes";
import { EYES, VARIANTS } from "./cat-variants";

// The cats on the footer wordmark are the site's own cats in new poses: the hero's sitting cat (gradient-cat.tsx), the
// sleeping cat (sleeping-cat.tsx) and the playing cat (playing-cat.tsx), with the same shapes (cat-shapes.ts), the same thin outline in the text colour
// and the same gradient blobs. Each keeps its own viewBox and is pinned to its letter in em by `At`, so it stays put at
// any wordmark size. Motion is CSS; the client `Wordmark` turns the heads (`[data-head]`) and moves the peeking eyes
// (`[data-look]`) toward the pointer. Glyph numbers in em are Geist 600, measured.

/** A zero-size box sitting on the baseline where the next letter starts. */
export function At({ children }: { children: ReactNode }) {
  return <span className="relative inline-block h-0 w-0 align-baseline">{children}</span>;
}

type CatProps = {
  id: string;
  i: number; // settle-in order
  variant: number;
  vb: [number, number]; // the reference cat's viewBox
  at: [number, number, number]; // left, bottom, width in em from the letter's origin on the baseline
  blobs: readonly (readonly [number, number])[];
  blob: [number, number]; // blob radius, blur
  spin: [number, number]; // what the blobs circle around (the reference cat's own centre)
  clip?: number; // hide everything below this y (a cat drawn behind a letter, where the letter has a hole)
  parts: (fill: boolean) => ReactNode;
  cuts?: ReactNode; // black in the mask: the eyes
  mirror?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<SVGProps<SVGSVGElement>, "children">;

function Cat({ id, i, variant, vb: [w, h], at: [left, bottom, width], blobs, blob: [r, blur], spin, clip, parts, cuts, mirror, className = "", children, ...rest }: CatProps) {
  const look = VARIANTS[variant % VARIANTS.length];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
      style={{ "--i": `${i * 140}ms`, left: `${left}em`, bottom: `${bottom}em`, width: `${width}em`, scale: mirror ? "-1 1" : undefined } as CSSProperties}
      className={`wm-cat absolute overflow-visible ${className}`}
      {...rest}
    >
      <defs>
        <mask id={`wm-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h * 1.6}>
          {parts(true)}
          {cuts}
        </mask>
        <filter id={`wmb-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
        {clip && (
          <clipPath id={`wmc-${id}`}>
            <rect x={-w} y={-h} width={3 * w} height={h + clip} />
          </clipPath>
        )}
      </defs>
      <g clipPath={clip ? `url(#wmc-${id})` : undefined}>
      {/* outline: every part again in the text colour, fattened; the gradient covers the inner half */}
        <g className="text-foreground" fill="currentColor" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        {parts(false)}
      </g>
      <g mask={`url(#wm-${id})`}>
        <rect width={w} height={h * 1.6} fill={look.base} />
        <g className="cat-spin" filter={`url(#wmb-${id})`} style={{ transformOrigin: `${spin[0]}px ${spin[1]}px`, transformBox: "view-box" }}>
          {blobs.map(([cx, cy], k) => (
            <circle key={k} cx={cx} cy={cy} r={r} fill={look.blobs[k]} />
          ))}
        </g>
      </g>
      </g>
      {children}
    </svg>
  );
}

const part = (d: string, f: boolean) => <path key={d} d={d} fill={f ? "white" : undefined} strokeWidth={f ? 0 : OUTLINE} />;
const stroke = (d: string, f: boolean, w: number, className: string, origin: string) => (
  <path d={d} fill="none" stroke={f ? "white" : undefined} strokeWidth={w + (f ? 0 : OUTLINE)} strokeLinecap="round" className={className} style={{ transformOrigin: origin }} />
);

/**
 * The sleeping cat, asleep along the tops of "p" and "u": body on the p, chin over the u. Breathes and swishes its
 * tail like the original; pointing at it wakes it the same way (head up, eyes blink, tail wags wider).
 */
export function SleepingOnP() {
  const { BODY, TAIL, HEAD, EYES: DOTS, NECK, TAIL_PIVOT, BLOB_AT } = SLEEPING;
  // body from x 30 at the p's stem (0.08em) to the head's middle (x 205) over the u's left arm (0.695em); belly (y 122) on the letter tops (0.532em)
  const k = 0.615 / 175;
  const parts = (f: boolean) => (
    <>
      <g className="cat-breathe">
        {part(BODY, f)}
        <g className="cat-head" style={{ transformOrigin: NECK, transformBox: "view-box" }}>
          {HEAD.map((d) => part(d, f))}
          {f && DOTS.map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="2.8" fill="black" className="cat-eye-ball" />)}
        </g>
      </g>
      {stroke(TAIL, f, 12, "cat-tail-sleep", TAIL_PIVOT)}
    </>
  );
  return (
    <Cat id="sleep" i={0} variant={3} vb={[260, 140]} at={[0.08 - 30 * k, 0.532 - 18 * k, 260 * k]} blobs={BLOB_AT} blob={[70, 12]} spin={[130, 80]} parts={parts} data-awake="false" className="wm-sleep">
      <g className="fill-muted-foreground font-semibold">
        <text x="236" y="40" fontSize="22" className="wm-z">z</text>
        <text x="252" y="24" fontSize="17" className="wm-z" style={{ animationDelay: "-1.8s" }}>z</text>
      </g>
    </Cat>
  );
}

/**
 * The sleeping cat's head, peeking over the top of the "c": the head is drawn behind the letter (only what clears the
 * arc shows), the two front paws grip the edge in front of it. Its eyes follow the pointer.
 */
export function PeekOverC() {
  const { HEAD, EYES: DOTS } = SLEEPING;
  // head centre (x 205) over the c's crown (0.30em), sunk so only the eyes (y 85) and up clear the arc's top (0.546em):
  // its widest part stays behind the letter. Below the arc's inner edge (0.47em) the c has a hole, so the head is clipped
  // there. The paws grip the arc either side of the face, where its top is about 0.525em (y 93).
  const k = 0.0042;
  const chin = 0.428;
  const at: [number, number, number] = [0.3 - 205 * k, chin - 22 * k, 260 * k];
  // pink and violet up in the ears, rose and amber low across the face, so the paws on the edge share the face's colours
  const blobs = [
    [180, 40],
    [232, 40],
    [205, 72],
    [205, 100],
  ] as const;
  const paws = "M170 93 a7.5 5 0 1 0 15 0 a7.5 5 0 1 0 -15 0Z M225 93 a7.5 5 0 1 0 15 0 a7.5 5 0 1 0 -15 0Z";
  return (
    <>
      <Cat
        id="peek"
        i={1}
        variant={2}
        vb={[260, 140]}
        at={at}
        blobs={blobs}
        blob={[44, 10]}
        spin={[205, 72]}
        clip={118 - (0.47 - chin) / k}
        parts={(f) => <g className="wm-peek">{HEAD.map((d) => part(d, f))}</g>}
        cuts={
          <g className="wm-peek">
            <g className="cat-blink">
              {DOTS.map(([cx, cy]) => <circle key={cx} data-look="2.2" cx={cx} cy={cy} r="2.8" fill="black" className="wm-look" />)}
            </g>
          </g>
        }
        className="-z-1"
      />
      <Cat id="peek-paws" i={1} variant={2} vb={[260, 140]} at={at} blobs={blobs} blob={[44, 10]} spin={[205, 72]} parts={(f) => part(paws, f)} />
    </>
  );
}

/**
 * The hero's sitting cat, on the right arm of the second "u" (mirrored, so it faces the i): tail draped down into the
 * u's bowl, and every few seconds a paw reaches out and bats the dot of the "i" (`IDot` flinches on the same clock).
 */
export function SittingOnU() {
  const { BODY, PAWS, HEAD, NECK, BLOB_AT } = SITTING;
  const look = VARIANTS[4];
  const eye = EYES[look.eye];
  // paws (centre x 100, bottom y 244) on the u's right arm (centre 0.462em, top 0.534em); mirrored, x maps to left + (240 - x) * k
  const k = 0.0024;
  const tail = "M128 226 C152 232 160 248 158 276 C156 302 164 320 182 314"; // the hero's tail, hanging over the arm's inner edge
  const head = (f: boolean) => (
    <g className="wm-watch">
      <g data-head="-1" className="wm-head" style={{ transformOrigin: NECK, transformBox: "view-box" }}>
        {HEAD.map((d) => part(d, f))}
        {f && <path d={eye.d} fill={eye.stroke ? "none" : "black"} stroke={eye.stroke ? "black" : undefined} strokeWidth={eye.stroke} strokeLinecap="round" strokeLinejoin="round" className="cat-blink" />}
      </g>
    </g>
  );
  const parts = (f: boolean) => (
    <>
      {stroke(tail, f, 13, "cat-tail", "128px 226px")}
      {stroke("M76 140 C62 156 50 176 38 190", f, 13, "wm-paw-bat", "76px 140px")}
      {part(BODY, f)}
      {part(PAWS, f)}
      {head(f)}
    </>
  );
  return <Cat id="sit" i={2} variant={4} vb={[240, 250]} at={[0.462 - 140 * k, 0.534 - 6 * k, 240 * k]} blobs={BLOB_AT} blob={[62, 12]} spin={[120, 130]} parts={parts} mirror />;
}

/**
 * The playing cat (`playing-cat.tsx`) in a play-bow across the "rr", facing the "f": back legs standing on the first
 * r's arm, rump up with the reference's tail curving up from it, chest low over the second r, both front legs out
 * along the f's crossbar under the head. Every few seconds the near paw taps the f's stem, twice. The head is the
 * sleeping cat's (same ears, cheeks and two dot eyes), seated on the chest. From the second r's origin: first r's arm
 * top -0.005-0.058em, r stem top 0.07-0.19em, r arm 0.31-0.37em, f crossbar to 0.44em, f stem from 0.439em; all at
 * 0.534em.
 */
export function PlayingOnR() {
  const { TAIL, BLOB_AT } = PLAYING;
  const { HEAD, EYES: DOTS } = SLEEPING;
  // in the playing cat's viewBox (ground y 125 = the letter tops); the f's stem (0.439em) is x 223
  const k = 0.0026;
  const body = "M44 98 C34 76 48 54 76 52 C106 50 138 74 160 96 C170 106 168 120 154 122 C140 124 128 116 116 108 C100 98 82 96 70 102 C60 106 50 106 44 98 Z";
  const head = "translate(-25 -12)"; // the sleeping cat's head, skull now x 151-209, y 46-106, chin over the front legs
  const parts = (f: boolean) => (
    <>
      {stroke(TAIL, f, 10, "play-tail", "38px 90px")}
      {stroke("M52 96 L50 120 M67 98 L68 120", f, 11, "", "0 0")}
      {part(body, f)}
      {stroke("M142 115 L203 122", f, 11, "", "0 0")}
      {/* legs before the head, so a raised paw never fills in the eye cuts */}
      {stroke("M152 113 L219 121", f, 11, "wm-tap", "152px 113px")}
      <g className="play-head" style={{ transformOrigin: "165px 100px", transformBox: "view-box" }}>
        <g transform={head}>
          {HEAD.map((d) => part(d, f))}
          {f && DOTS.map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="2.8" fill="black" />)}
        </g>
      </g>
    </>
  );
  // a hairline along the near leg's underside so the two front legs read as two, not one thick band
  const cuts = <path d="M164 120.5 L200 124.6" className="wm-tap" style={{ transformOrigin: "152px 113px" }} fill="none" stroke="black" strokeWidth="2.2" strokeLinecap="round" />;
  return <Cat id="play" i={1} variant={1} vb={[260, 140]} at={[0.439 - 223 * k, 0.534 - 15 * k, 260 * k]} blobs={BLOB_AT} blob={[70, 12]} spin={[130, 80]} parts={parts} cuts={cuts} />;
}

/** The dot of the "i", as its own element (the letter itself is set as a dotless ı) so the cat can knock it. */
export function IDot() {
  return <span className="wm-dot absolute bg-current" style={{ left: "0.068em", bottom: "0.608em", width: "0.133em", height: "0.111em" }} />;
}
