"use client";

import { LiquidMetal } from "@paper-design/shaders-react";
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Suspense, useEffect, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

const OUT = [0.33, 1, 0.68, 1] as const; // a long, soft ease-out: the mark decelerates into place

const ASTERISK =
  "M7 .09a1 1 0 0 1 1 1v4.088l3.463-2.204a1 1 0 0 1 1.074 1.688L8.863 7l3.674 2.338a1 1 0 0 1-1.074 1.688L8 8.822v4.087a1 1 0 1 1-2 0V8.822l-3.463 2.204a1 1 0 1 1-1.074-1.688L5.137 7 1.463 4.662a1 1 0 1 1 1.074-1.688L6 5.178V1.091a1 1 0 0 1 1-1";
// the shader reads the shape from an image's alpha, so the asterisk goes in as a data URL (no file to host)
const ASTERISK_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" width="512" height="512"><path fill="black" fill-rule="evenodd" d="${ASTERISK}"/></svg>`,
)}`;

/** The asterisk as a plain SVG in the current text colour: the server render, the no-WebGL fallback and `shader={false}`. */
export function Asterisk({ className, ...rest }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden className={cn("size-full", className)} {...rest}>
      <path fillRule="evenodd" clipRule="evenodd" d={ASTERISK} />
    </svg>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The default mark: a liquid-metal asterisk. WebGL starts only on the client (the server HTML is the plain SVG), the canvas is
 * the element's own size, and the shader stops its frame loop while off screen or under reduced motion.
 */
/**
 * Any CSS colour (oklch, var(--token), a name, shadcn v3's bare HSL channels "0 0% 100%") as rgb the shader can parse: resolved
 * on `el` (so var() works), drawn into a 1px canvas and read back.
 */
function toRgb(css: string, el: HTMLElement) {
  const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!g) return "#ffffff"; // check-ignore: hardcoded-color fallback when there is no 2D canvas
  if (!CSS.supports("color", css)) css = `hsl(${css})`; // bare channels are not a colour on their own
  el.style.color = css;
  const resolved = getComputedStyle(el).color;
  el.style.color = "";
  g.fillStyle = resolved;
  g.fillRect(0, 0, 1, 1);
  const [r, gr, b] = g.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${gr}, ${b})`;
}

function MetalAsterisk({ colorBack, colorTint }: { colorBack?: string; colorTint?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { margin: "100px" });
  const reduce = useReducedMotion();
  const [gl, setGl] = useState(false);
  const [theme, setTheme] = useState<{ text: string; back: string } | null>(null); // null until read: the shader starts with the right colours
  // eslint-disable-next-line react-hooks/set-state-in-effect -- WebGL can only be detected after mount; the server renders the SVG
  useEffect(() => setGl(hasWebGL()), []);
  // unset colours follow the theme (and a switch of it: a class or data attribute on <html>): the metal takes the text colour
  // and sits on the page's --background. The shader's alpha follows its brightness, so a dark metal on a transparent back
  // would vanish on a light page; an opaque back that matches the page keeps it readable in both themes.
  useEffect(() => {
    const read = () => {
      const el = ref.current;
      if (!el) return;
      const bg = colorBack ?? getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
      // caller colours go through toRgb too: the shader only parses hex, comma rgb() and hsl(), anything else turns black
      const next = {
        text: toRgb(colorTint ?? getComputedStyle(el).color, el),
        back: bg ? toRgb(bg, el) : "rgba(0, 0, 0, 0)",
      };
      // only a real change re-renders: the shader re-processes its image on new colours, and other code toggles <html> classes too
      setTheme((t) => (t && t.text === next.text && t.back === next.back ? t : next));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => mo.disconnect();
  }, [colorTint, colorBack]);
  return (
    <div ref={ref} className="size-full">
      {gl && theme ? (
        // the shader pre-processes its image on the CPU (a heavy pass); suspend mode caches it by URL, so every star on the
        // page shares one pass instead of one each. The plain asterisk shows meanwhile.
        <Suspense fallback={<Asterisk />}>
          <LiquidMetal
            suspendWhenProcessingImage
            width="100%"
            height="100%"
            image={ASTERISK_URL}
            colorBack={theme.back}
            colorTint={theme.text}
            repetition={2}
            softness={0.1}
            shiftRed={0.3}
            shiftBlue={0.3}
            distortion={0.07}
            contour={0.4}
            angle={70}
            speed={visible && !reduce ? 1 : 0} // speed 0 stops the shader's rAF entirely
            scale={0.8}
            fit="contain"
          />
        </Suspense>
      ) : (
        <Asterisk />
      )}
    </div>
  );
}

export interface StarRiseProps extends Omit<ComponentProps<"div">, "ref" | "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** The mark that rises. Defaults to the liquid-metal asterisk; pass any SVG or image to skip the shader. */
  children?: ReactNode;
  /** Width and height of the mark in pixels. */
  size?: number;
  /** Seconds for the rise and the spin. The fade takes half of it. */
  duration?: number;
  /** Seconds to wait before rising. */
  delay?: number;
  /** Full turns the mark makes as it scrolls through the viewport, after the rise. 0 turns it off. */
  turns?: number;
  /** Follow a scrolling box instead of the page. */
  container?: RefObject<HTMLElement | null>;
  /** The default asterisk only: `false` draws the plain SVG asterisk in the text colour, no WebGL. */
  shader?: boolean;
  /** The default asterisk only: shader background. The page's `--background` by default; set it when the mark sits on another surface (any CSS colour, `var(--muted)` included). */
  colorBack?: string;
  /** The default asterisk only: the metal's tint. The text colour by default, so it reads on light and dark themes. */
  colorTint?: string;
  /** Called once the mark has settled. */
  onRiseComplete?: () => void;
}

/**
 * A mark that rises from below the viewport while turning half a turn into place, fading in on the way, then keeps turning
 * as it scrolls through the viewport (or through `container`). The rise starts from the server HTML hidden, so nothing flashes.
 * It travels a full viewport height, so put it inside an `overflow-hidden` section to keep the page from growing while it rises.
 * Reduced motion: it only fades in, and scrolling does not turn it.
 */
export function StarRise({
  children,
  size = 320,
  duration = 3.6,
  delay = 0,
  turns = 3,
  container,
  shader = true,
  colorBack,
  colorTint,
  onRiseComplete,
  className,
  style,
  ...rest
}: StarRiseProps) {
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // the mark's own pass through the viewport: 0 as its top enters at the bottom, 1 as its bottom leaves at the top
  const { scrollYProgress } = useScroll({
    target: root,
    container,
    offset: ["start end", "end start"],
  });
  // relative to where the pass stood at load, so a mark already partway through (a hero) still lands upright after the rise.
  // The progress reads 0 until the first measurement, so the start is that first change, not the initial value.
  const start = useRef<number | null>(null);
  useMotionValueEvent(scrollYProgress, "change", (v) => void (start.current ??= v));
  const rotate = useTransform(scrollYProgress, (v) => (start.current === null ? 0 : (v - start.current) * turns * 360));

  return (
    <div ref={root} className={cn("relative shrink-0", className)} style={{ width: size, height: size, ...style }} {...rest}>
      {/* reduced motion drops the rise and spin in CSS, so the server HTML and the first client render agree */}
      <motion.div
        className="size-full motion-reduce:!transform-none"
        initial={{ transform: "translateY(100vh) rotate(-180deg)" }}
        animate={{ transform: "translateY(0vh) rotate(0deg)" }}
        // check-ignore: duration a one-off entrance, seen once per page load
        transition={{ duration, delay, ease: OUT }}
        onAnimationComplete={reduce ? undefined : onRiseComplete}
      >
        <motion.div
          className="size-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // check-ignore: duration a one-off entrance fade, half the rise so it dissolves in instead of popping
          transition={reduce ? { duration: 0.4, delay } : { duration: duration / 2, delay, ease: OUT }}
          onAnimationComplete={reduce ? onRiseComplete : undefined}
        >
          <motion.div className="size-full origin-center motion-reduce:!transform-none" style={{ rotate }}>
            {children ?? (shader ? <MetalAsterisk colorBack={colorBack} colorTint={colorTint} /> : <Asterisk />)}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
