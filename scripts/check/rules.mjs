// The component quality rules, one list. Each rule gets the source of registry/<slug>/<slug>.tsx and returns findings
// [{ line, msg }]; `level` is FAIL (blocks publishing) or WARN (needs a one-line reason).
// A deliberate exception: put `check-ignore: <rule-id> <reason>` in a comment on the same line or the line above.
// Sources: CLAUDE.md motion rules and the animate / review-animations / apple-design / break-ui skills.

const lines = (src) => src.split("\n");
const isComment = (l) => /^\s*(\/\/|\*|\/\*)/.test(l);
const scan = (src, re, msg, test = () => true) =>
  lines(src).flatMap((l, i) => (!isComment(l) && re.test(l) && test(l) ? [{ line: i + 1, msg: typeof msg === "function" ? msg(l.match(re)) : msg }] : []));

// the JSX opening tag that starts at `from`, braces balanced so `=>` inside handlers does not end it early
function openingTag(src, from) {
  let depth = 0;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0 && src[i - 1] !== "=") return src.slice(from, i + 1);
  }
  return src.slice(from);
}

const SHADCN_VARS = /^(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|radius|chart-\d|sidebar[\w-]*|[\w-]*-foreground)$/;

export const RULES = [
  {
    id: "no-transition-all",
    level: "FAIL",
    why: "`all` animates properties nobody meant to animate, off the GPU. Name the exact properties.",
    run: ({ src }) => scan(src, /\btransition-all\b|transition:\s*all\b/, "transition: all"),
  },
  {
    id: "no-scale-zero",
    level: "FAIL",
    why: "Nothing appears from nothing: start from scale 0.9-0.97 plus opacity.",
    run: ({ src }) => scan(src, /(?<![\w-])scale-0(?![\w.])|scale\(0\)|\bscale:\s*0(?![.\d])/, "scale(0) entrance"),
  },
  {
    id: "no-ease-in",
    level: "FAIL",
    why: "ease-in delays the moment the user is watching. Use ease-out / a strong custom curve (cubic-bezier(0.23, 1, 0.32, 1)).",
    run: ({ src }) => scan(src, /(?<![\w-])ease-in(?![-\w])|ease:\s*["']easeIn["']/, "ease-in on UI"),
  },
  {
    id: "gpu-props",
    level: "FAIL",
    why: "Animate transform and opacity. width/height/top/left/margin/padding trigger layout and paint.",
    run: ({ src }) => {
      const L = lines(src);
      const out = scan(src, /transition-\[[^\]]*\b(width|height|top|left|right|bottom|margin|padding|inset)\b/, (m) => `transition on ${m[1]}`);
      L.forEach((l, i) => {
        if (isComment(l) || !/\.animate\(|animate=\{|<motion\./.test(l)) return;
        const win = L.slice(i, i + 5).join("\n");
        const m = win.match(/\b(left|top|width|height|margin\w*|padding\w*)\s*:\s*[`"'\d{]/);
        if (m) out.push({ line: i + 1, msg: `animates ${m[1]}` });
      });
      return out;
    },
  },
  {
    id: "motion-shorthand",
    level: "WARN",
    why: "Motion's x/y/scale shorthands are not hardware accelerated under load; use a full `transform` string.",
    run: ({ src }) => scan(src, /(animate|whileHover|whileTap|initial|exit)=\{\{[^}]*\b(x|y|scale)\s*:/, "x/y/scale shorthand in motion props"),
  },
  {
    id: "duration",
    level: "WARN",
    why: "UI motion stays under 300ms; longer needs a reason (rare/first-time moments only).",
    run: ({ src }) =>
      scan(src, /duration-\[?(\d+)|duration:\s*(\d+(?:\.\d+)?)/, (m) => `duration ${m[1] ?? m[2]}`, (l) => {
        const m = l.match(/duration-\[?(\d+)|duration:\s*(\d+(?:\.\d+)?)/);
        const v = +(m[1] ?? m[2]);
        return m[2] && v < 10 ? v > 0.3 : v > 300; // seconds (motion) vs ms
      }),
  },
  {
    id: "reduced-motion",
    level: "FAIL",
    why: "Honor prefers-reduced-motion: gentler (keep opacity/colour), not nothing.",
    run: ({ src }) => (/transition|animate|motion|keyframes|requestAnimationFrame/.test(src) && !/useReducedMotion|motion-reduce|motion-safe|prefers-reduced-motion/.test(src) ? [{ line: 1, msg: "animates but never checks reduced motion" }] : []),
  },
  {
    id: "reduced-motion-live",
    level: "WARN",
    why: "Reading matchMedia once misses a setting change; subscribe (useReducedMotion or a change listener).",
    run: ({ src }) => (/matchMedia\([^)]*reduce/.test(src) && !/addEventListener\(["']change["']|useReducedMotion/.test(src) ? [{ line: src.split("\n").findIndex((l) => /matchMedia\([^)]*reduce/.test(l)) + 1, msg: "reduced motion read once, not live" }] : []),
  },
  {
    id: "raw-hover",
    level: "WARN",
    why: "Hover motion must be gated by (hover: hover) so touch has no stuck hover. Tailwind 4 `hover:` is already gated.",
    run: ({ src }) => scan(src, /:hover\s*[{,]/, "raw :hover rule (gate it with @media (hover: hover))"),
  },
  {
    id: "installable-imports",
    level: "FAIL",
    why: "A component must install into a project that is not this repo: no site imports, no Cuelume. Only react, declared dependencies and @/lib/utils.",
    run: ({ src }) =>
      scan(src, /from\s+["'](@\/(?!lib\/utils["'])[^"']*|cuelume|\.\.?\/[^"']*)["']/, (m) => `imports ${m[1]}, which does not exist in a fresh project`),
  },
  {
    id: "own-components",
    level: "FAIL",
    why: "Our components are our own: never import a ready-made component from another component library (Rare UI, MUI, Aceternity, Magic UI...). Copying shadcn source as a base and modifying it is fine, and so are animation (gsap, motion), WebGL (three, ogl) and headless primitives. This list is a safety net; the real gate is review.",
    run: ({ src }) =>
      scan(src, /from\s+["']((?:@mui|@chakra-ui|@mantine|@nextui-org|@heroui|@tremor|@fluentui|@blueprintjs|@carbon|@arco-design|@ant-design)[^"']*|(?:antd|primereact|react-bootstrap|reactstrap|semantic-ui-react|rare-ui|rareui|magicui|magic-ui|aceternity-ui|daisyui|flowbite-react|evergreen-ui|grommet|rsuite|baseui)(?:\/[^"']*)?)["']/, (m) => `imports ${m[1]}, a ready-made component from another library`),
  },
  {
    id: "deps-declared",
    level: "FAIL",
    why: "Every external import must be listed in the item's `dependencies` in registry.json, or the shadcn CLI will not install it.",
    run: ({ src, item }) => {
      const declared = new Set(item.dependencies ?? []);
      const out = [];
      lines(src).forEach((l, i) => {
        const m = !isComment(l) && l.match(/from\s+["']((?:@[\w-]+\/)?[\w-]+)(?:\/[^"']*)?["']/);
        if (!m || m[1].startsWith("@/")) return;
        const pkg = m[1];
        if (["react", "react-dom", "next"].includes(pkg) || declared.has(pkg)) return;
        out.push({ line: i + 1, msg: `"${pkg}" not in registry.json dependencies` });
      });
      return out;
    },
  },
  {
    id: "use-client",
    level: "FAIL",
    why: "Hooks and event handlers need 'use client'; a server-safe component should not carry it (smaller client bundle).",
    run: ({ src }) => {
      const client = /^\s*["']use client["']/m.test(src);
      const needs = /\buse(State|Effect|Ref|LayoutEffect|Reducer|Callback|Memo|Context|Id|SyncExternalStore|Transition|ReducedMotion|InView|Scroll|Spring|Transform|MotionValue)\b\s*\(|\son[A-Z]\w+=\{/.test(src.replace(/\bforwardRef\b/, ""));
      if (needs && !client) return [{ line: 1, msg: "uses hooks or handlers but has no 'use client'" }];
      return [];
    },
  },
  {
    id: "use-client-unneeded",
    level: "WARN",
    why: "'use client' with no hooks or handlers ships JS for nothing.",
    run: ({ src }) => (/^\s*["']use client["']/m.test(src) && !/\buse[A-Z]\w*\s*\(|\son[A-Z]\w+=\{|addEventListener/.test(src) ? [{ line: 1, msg: "'use client' but nothing needs it" }] : []),
  },
  {
    id: "ssr-safe",
    level: "FAIL",
    why: "Module scope runs on the server: no window/document/localStorage/matchMedia outside effects and handlers.",
    run: ({ src }) => scan(src, /^(?:const|let|var|export const)\s.*\b(window|document|localStorage|sessionStorage|matchMedia|navigator)\b/, "browser global at module scope"),
  },
  {
    id: "clickable-semantics",
    level: "FAIL",
    why: "A div/span with onClick is invisible to the keyboard and screen readers: use a <button>/<a>, or add role, tabIndex and key handling.",
    run: ({ src }) => {
      const out = [];
      for (const m of src.matchAll(/<(div|span|li)\b/g)) {
        const tag = openingTag(src, m.index);
        if (/\bonClick=/.test(tag) && !/\brole=/.test(tag) && !/\btabIndex=/.test(tag)) out.push({ line: src.slice(0, m.index).split("\n").length, msg: `<${m[1]} onClick> without role/tabIndex` });
      }
      return out;
    },
  },
  {
    id: "site-tokens",
    level: "WARN",
    why: "CSS variables that only exist in this site break in other projects unless they have a fallback: var(--x, fallback).",
    run: ({ src }) => scan(src, /var\(--([\w-]+)\)/, (m) => `var(--${m[1]}) has no fallback`, (l) => {
      const m = l.match(/var\(--([\w-]+)\)/g) ?? [];
      return m.some((v) => !SHADCN_VARS.test(v.slice(6, -1)));
    }),
  },
];

export { openingTag };
