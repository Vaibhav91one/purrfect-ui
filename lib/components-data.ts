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

const REPLAY = new Set(["notch", "hero-reveal"]);
const FILL = new Set(["scroll-marquee"]);

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
  item("scroll-reveal", "Scroll reveal", "Text", "Text that fills in word by word as you scroll it into view."),
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
  item("fill-button", "Fill button", "Input", "An outlined pill whose fill sweeps in from the left and out to the right."),
];

export const CATEGORIES = [...new Set(COMPONENTS.map((c) => c.category))];
export const categorySlug = (category: string) => category.toLowerCase();

export const bySlug = (slug: string | null | undefined) => COMPONENTS.find((c) => c.slug === slug);
