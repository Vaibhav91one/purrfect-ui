import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Base = {
  variant?: "solid" | "ghost";
  /** `md` is 46px tall; `lg` is 64px with wider padding. */
  size?: "md" | "lg";
  wide?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  /** Shows the hover state without a pointer (the gallery loops it to show the motion). */
  forceHover?: boolean;
  /** Cuelume cue played on click when `bind()` is running; inert otherwise. */
  cue?: "tap" | "navigate" | "open" | "toggle";
  children: ReactNode;
  className?: string;
};
type Props =
  | (Base & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children">)
  | (Base & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">);

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";
const ROLL_EASE = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"; // the letter roll's own curve
const STEP = 20; // ms between neighbouring letters
const MAX_DELAY = 168; // a long label must not wait seconds for its outer letters
const ROLL_MAX = 24; // width in cells; longer labels are plain text that wraps, instead of a pill wider than its parent
const WIDE = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE6F\uFF00-\uFF60]/; // CJK glyphs are about two letters wide
// joined scripts (Arabic, Indic) change shape with their neighbours, so they cannot be split into letters
const JOINED = /[\u0600-\u06FF\u0750-\u077F\u0900-\u0DFF]/;
const cells = (parts: string[]) => parts.reduce((n, g) => n + (WIDE.test(g) ? 2 : 1), 0);
const graphemes = (s: string) => [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)].map((x) => x.segment);

/**
 * Label whose letters roll up on hover, starting from the middle and spreading out, while a copy rolls in from below.
 * Only for plain-text labels.
 */
function StaggerText({ children }: { children: string }) {
  const chars = graphemes(children);
  const mid = Math.floor((chars.length + 1) / 2); // the centre of the label plus its trailing space, so the wave starts where it does on Armour
  const roll = `transition-[translate,opacity] duration-300 ${ROLL_EASE} [transition-delay:var(--d,0ms)] motion-reduce:transition-none`;
  return (
    <span className="inline-flex leading-none">
      <span className="sr-only">{children}</span>
      {chars.map((c, i) => (
        <span key={i} aria-hidden className="relative inline-block overflow-clip whitespace-pre">
          <span
            style={{ "--d": `${Math.min(Math.abs(i - mid) * STEP, MAX_DELAY)}ms` } as CSSProperties}
            className={`block ${roll} [@media(hover:hover)]:group-hover/btn:-translate-y-full group-data-[hover=true]/btn:-translate-y-full motion-reduce:[@media(hover:hover)]:group-hover/btn:translate-y-0`}
          >
            <span className={`block opacity-85 ${roll} [@media(hover:hover)]:group-hover/btn:opacity-0 group-data-[hover=true]/btn:opacity-0 motion-reduce:[@media(hover:hover)]:group-hover/btn:opacity-85`}>{c}</span>
            <span className={`absolute top-full left-0 opacity-0 ${roll} [@media(hover:hover)]:group-hover/btn:opacity-100 group-data-[hover=true]/btn:opacity-100 motion-reduce:[@media(hover:hover)]:group-hover/btn:opacity-0`}>{c}</span>
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Pill button (46px). Renders an <a> when `href` is set. A string label rolls up letter by letter from the middle on
 * hover; the button lifts 2px (an invisible strip under it keeps the pointer over it, so the lift cannot flicker) and presses down to 97%. Optional `icon` sits before or after the label.
 */
export function Button({ variant = "solid", size = "md", wide, icon, iconPosition = "start", forceHover, cue = "tap", className = "", children, ...rest }: Props) {
  const label = typeof children === "string" ? children : null;
  const roll = label !== null && label.length > 0 && !JOINED.test(label) && cells(graphemes(label)) <= ROLL_MAX;
  const wraps = label !== null && cells(graphemes(label)) > ROLL_MAX;
  const cls = [
    `group/btn relative inline-flex ${size === "lg" ? "min-h-16 min-w-16 px-10" : "min-h-[46px] min-w-[46px] px-[22px]"} max-w-full items-center justify-center gap-2 rounded-full text-base font-medium`,
    wraps ? "py-3 text-center whitespace-normal" : "shrink-0 whitespace-nowrap",
    `transition-[translate,scale,opacity,background-color] duration-200 ${EASE} active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50`,
    "[@media(hover:hover)]:motion-safe:hover:-translate-y-0.5 data-[hover=true]:motion-safe:-translate-y-0.5 before:absolute before:inset-x-0 before:-bottom-[3px] before:h-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
    variant === "solid" ? "bg-foreground text-background [@media(hover:hover)]:hover:bg-foreground/85 data-[hover=true]:bg-foreground/85" : "border border-foreground text-foreground [@media(hover:hover)]:hover:bg-foreground/5 data-[hover=true]:bg-foreground/5",
    wide ? "my-3 w-full" : "",
    className,
  ].join(" ");
  const iconEl = icon ? <span className="inline-flex items-center justify-center">{icon}</span> : null;
  const content = (
    <>
      {iconPosition === "start" && iconEl}
      {roll ? <StaggerText>{children as string}</StaggerText> : children}
      {iconPosition === "end" && iconEl}
    </>
  );
  const attr = { [`data-cuelume-${cue}`]: "", ...(forceHover && { "data-hover": "true" }) };
  if ("href" in rest && rest.href !== undefined)
    return (
      <a {...attr} className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  return (
    <button type="button" {...attr} className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
