import registry from "../registry.json";
import clips from "./clips.json";
import { SITE_URL } from "./site";

/** Slugs that ship as an installable file (listed in registry.json); the rest are gallery previews for now. */
const PUBLISHED = new Set(registry.items.map((i) => i.name));

/** The component running on the site it came from: files in public/previews, written by `pnpm capture`. */
export type Clip = { label: string; href: string; w: number; h: number };
const CLIPS: Record<string, Clip> = clips;

/** An extra control in the dialog, on top of the Loop switch and Speed slider every component gets. */
export type Extra = { key: string; label: string } & ({ kind: "segmented"; options: string[]; default: string } | { kind: "switch"; default: boolean });

export type ComponentItem = {
  slug: string;
  name: string;
  description: string;
  category: string;
  /** natural size of the preview; it is scaled to fit its cell */
  nat: [number, number];
  install: string;
  /** false until it is in registry.json: the install command would 404, so the UI says "coming soon". */
  published: boolean;
  extras?: Extra[];
  /** set once a clip has been captured; no clip, no hover video and no tab */
  clip?: Clip;
  /** a one-shot entrance (not a loop you pause): the dialog offers Replay instead of Pause/Play */
  replay?: boolean;
  /** a scrolling stage: its width scales like any preview, its height stretches to the whole cell */
  fill?: boolean;
};

const REPLAY = new Set(["notch", "hero-reveal", "inertia-gallery", "arrow-link", "flip-text"]);
const FILL = new Set(["scroll-marquee", "photo-wordmark", "line-rise", "sticky-crossfade"]);

const item = (slug: string, name: string, category: string, description: string, nat: [number, number] = [420, 300], extras?: Extra[]): ComponentItem => ({
  slug,
  name,
  category,
  description,
  nat,
  extras,
  install: `npx shadcn@latest add ${SITE_URL}/r/${slug}.json`,
  published: PUBLISHED.has(slug),
  clip: CLIPS[slug],
  replay: REPLAY.has(slug),
  fill: FILL.has(slug),
});

// The slugs in registry.json are installable; the rest render a preview until they are ported.
export const COMPONENTS: ComponentItem[] = [
  item("roll-button", "Roll button", "Input", "A pill button whose letters roll up from the middle on hover, with a lift and a springy press.", [420, 300], [{ key: "variant", label: "Variant", kind: "segmented", options: ["Solid", "Ghost"], default: "Solid" }, { key: "size", label: "Size", kind: "segmented", options: ["Medium", "Large"], default: "Medium" }]),
  item("magnetic", "Magnetic", "Input", "Pulls what it wraps toward the mouse, then springs back with a little overshoot.", [420, 300], [{ key: "strength", label: "Strength", kind: "segmented", options: ["Soft", "Medium", "Full"], default: "Full" }]),
  item("notch", "Notch", "Navigation", "A tab that hangs from the top edge with curved shoulders, dropping in once on mount."),
  item("hero-reveal", "Hero reveal", "Layout", "A hero whose photo frame opens along the y-axis, then the headline blurs up and the action springs in.", [1440, 1056]),
  item("layered-menu", "Layered menu", "Navigation", "A burger that opens a full-frame menu of four coloured panels dropping in turn.", [1440, 1056]),
  item("stretch-switch", "Stretch switch", "Input", "An on/off switch whose knob stretches as it travels."),
  item("counter", "Counter", "Display", "A number that rolls digit by digit to its target."),
  item("glide-tabs", "Glide tabs", "Navigation", "Tabs with a pill that glides under the active label."),
  item("scroll-reveal", "Scroll reveal", "Text", "Text that fills in word by word, or letter by letter, as you scroll it into view.", [420, 300], [{ key: "mode", label: "Mode", kind: "segmented", options: ["Words", "Letters"], default: "Words" }]),
  item("parallax-columns", "Parallax columns", "Layout", "Columns that scroll at different speeds."),
  item("path-carousel", "Path carousel", "Layout", "Items ride a curved path, the centre one biggest; scroll, swipe or use the arrows to rotate.", [560, 300]),
  item("displacement", "Displacement", "Display", "An image or painted canvas that bends around the pointer like wet glass, with a colour split and grain.", [600, 340]),
  item("hover-preview", "Hover preview", "Navigation", "A list of links where hovering a row floats a preview card that trails the pointer.", [760, 420]),
  item("scroll-marquee", "Scroll marquee", "Text", "A marquee that flips direction with the page scroll.", [1000, 320]),
  item("roll-link", "Roll link", "Navigation", "A link whose label rolls over on a 3D axis on hover or focus."),
  item("curtain-reveal", "Curtain reveal", "Layout", "A panel the page lifts away from as you scroll, like a curtain.", [560, 420]),
  item("preloader", "Preloader", "Display", "A full-screen intro whose words swap in turn before the panel lifts off with a curved edge.", [480, 320]),
  item("cursor-follower", "Cursor follower", "Display", "A dot that follows the mouse and inverts what is under it."),
  item("load-preloader", "Load preloader", "Display", "A full-screen cover with a big 0 to 100 count that tracks real loading, then fades away.", [480, 320]),
  item("star-rise", "Star rise", "Display", "A liquid-metal asterisk that rises into place, then turns as you scroll.", [1000, 560]),
  item("marquee-rows", "Marquee rows", "Text", "Big text rows that swap to a coloured scrolling band on hover, focus or tap.", [1000, 560]),
  item("peek-card", "Peek card", "Display", "A card whose image zooms and info panel slides up on hover, with a wide row variant.", [1000, 760]),
  item("counter-loader", "Counter loader", "Display", "A full-screen intro whose counter rolls to 100 while stickers pile up, then a block wipes up and it lifts away.", [480, 320]),
  item("sticker-cover", "Sticker cover", "Navigation", "A page-transition sheet that rises, swaps the page, pops a sticker and lifts away.", [480, 320]),
  item("inertia-gallery", "Inertia gallery", "Layout", "An endless strip of frames you push with the wheel or a drag; it coasts, snaps by intent and morphs between list and slider.", [900, 560]),
  item("fit-title", "Fit title", "Text", "One line of display type sized to exactly fill its container, rising out of a mask on first view.", [480, 260]),
  item("fan-out-cards", "Fan-out cards", "Layout", "Cards that start stacked in the centre and spring out to their own tilted spots when scrolled into view.", [900, 520]),
  item("shimmer-text", "Shimmer text", "Text", "Text with a light band sweeping across it, for labels that say something is running.", [420, 300]),
  item("photo-wordmark", "Photo wordmark", "Text", "A huge wordmark filled with a photo, cropped at the bottom and rising out of the crop as it scrolls in.", [800, 320]),
  item("drawer-menu", "Drawer menu", "Navigation", "A round burger that crosses into an X and slides a full-height link panel in from the right.", [390, 640]),
  item("quote-cycle", "Quote cycle", "Text", "Lines that pop up, hold, then shrink away as the next one drops in.", [480, 320]),
  item("column-hop", "Column hop", "Layout", "A small board whose card hops between columns on a loop: its row collapses, the next one opens and it rises in.", [800, 560]),
  item("line-rise", "Line rise", "Text", "Lines of text that slide up one after another from behind a clipping edge when the block comes into view.", [1000, 420]),
  item("sticker-pop", "Sticker pop", "Display", "A sticker image that pops in with a springy overshoot into its own tilt once it has loaded, and shrinks, tilts and fades on exit.", [800, 560]),
  item("swap-card", "Swap card", "Display", "A product card whose photo crossfades and zooms to a second one on hover, with a wobbly badge that turns.", [800, 680]),
  item("sticky-crossfade", "Sticky crossfade", "Layout", "A sticky picture beside a column of text that crossfades to the next picture as each block passes the middle of the screen.", [1000, 600]),
  item("stroke-replay", "Stroke replay", "Display", "Replays an SVG painting shape by shape, like a drawing-app timelapse, with play, pause and a scrubber.", [720, 760]),
  item("spring-chips", "Spring chips", "Layout", "Pill labels with icon tiles that spring in around a centrepiece, one after another, when scrolled into view.", [1000, 600]),
  item("voice-bars", "Voice bars", "Text", "Thin bars jumping between heights on a staggered loop, for a mic that is listening.", [600, 640]),
  item("announce-strip", "Announce strip", "Navigation", "A thin announcement strip whose line loops seamlessly; it slides away as you scroll down or dismiss it.", [800, 560]),
  item("grid-disclosure", "Grid disclosure", "Layout", "A one-open-at-a-time list whose panels open to their own height through grid rows, with no measuring.", [880, 680]),
  item("flip-text", "Flip text", "Text", "Text whose lines fade in on scroll and whose letters flip over under the pointer.", [560, 300]),
  item("spin-mark", "Spin mark", "Display", "A mark that pops in with a spring, then spins forever or turns as you scroll.", [448, 320]),
  item("arrow-link", "Arrow link", "Navigation", "A big arrow link that rises from a mask on first view; on hover or focus the arrow slides and the label rolls over.", [480, 180]),
  item("fill-button", "Fill button", "Input", "An outlined pill whose fill sweeps in from the left and out to the right."),
];

export const CATEGORIES = [...new Set(COMPONENTS.map((c) => c.category))];
export const categorySlug = (category: string) => category.toLowerCase();

export const bySlug = (slug: string | null | undefined) => COMPONENTS.find((c) => c.slug === slug);
