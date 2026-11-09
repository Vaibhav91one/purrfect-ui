// One X post per component that has a site clip, in COMPONENTS order (lib/components-data.ts).
// `pnpm x:today` posts the first one not yet in ~/.purrfectui-x.json (sticker-pop leads). LAUNCH only runs with --launch.
// A post is its caption, a blank line, then the link (`text(post)`); the clip is attached under it.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// COMPONENTS.length, counted from the source so it stays right as components are added.
const count = readFileSync(new URL("../../lib/components-data.ts", import.meta.url), "utf8").match(/^ {2}item\(/gm).length;

export const LAUNCH = {
  slug: "launch",
  caption: `purrfect ui is out. ${count} animated react components, all free.\ncopy one file or add it with one shadcn command: https://purrfectui.com`,
  clip: join(homedir(), "Movies/purrfectui-launch.mp4"),
};

export const text = (post) => `${post.caption}\n\ncheck it out at purrfectui.com`;

const ALL = [
  { slug: "load-preloader", caption: "a big 0 to 100 count that follows the real loading, then the cover fades away" },
  { slug: "sticker-pop", caption: "made stickers that pop in with a little overshoot and land tilted" },
  { slug: "roll-button", caption: "letters roll up from the middle when you hover this pill" },
  { slug: "notch", caption: "a tab hanging off the top edge, curved shoulders and all" },
  { slug: "hero-reveal", caption: "hero intro. the photo opens up, then the headline blurs in" },
  { slug: "layered-menu", caption: "made a burger menu that drops in as four coloured panels" },
  { slug: "scroll-reveal", caption: "scroll and the text fills in word by word" },
  { slug: "hover-preview", caption: "hover a row and a little preview tags along with your cursor" },
  { slug: "scroll-marquee", caption: "a marquee hooked to your scroll. go back up and it flips" },
  { slug: "roll-link", caption: "links that roll over like a little sign flipping" },
  { slug: "parallax-photo", caption: "the page scrolls over this photo while the picture barely moves" },
  { slug: "curtain-reveal", caption: "you scroll and the page lifts away like a curtain going up" },
  { slug: "preloader", caption: "intro screen: a few words swap in, then it lifts off on a curve" },
  { slug: "cursor-follower", caption: "cursor dot that inverts whatever it passes over" },
  { slug: "star-rise", caption: "rising liquid asterisk" },
  { slug: "marquee-rows", caption: "big type rows. hover one and it turns into a moving colour band" },
  { slug: "peek-card", caption: "been making peek cards, the image zooms and the details slide up" },
  { slug: "inertia-gallery", caption: "push it with the wheel and it coasts, then snaps where you meant" },
  { slug: "fit-title", caption: "one line of type sized to fill the box exactly" },
  { slug: "fan-out-cards", caption: "stacked cards fanning out as they scroll into view" },
  { slug: "shimmer-text", caption: "shimmer label for when something's still running" },
  { slug: "photo-wordmark", caption: "giant wordmark with a photo inside, rising out of its crop" },
  { slug: "quote-cycle", caption: "quotes popping up one at a time, each shrinking away for the next" },
  { slug: "column-hop", caption: "tiny board where a card keeps hopping between columns" },
  { slug: "line-rise", caption: "lines slide up from behind an edge, one after another" },
  { slug: "swap-card", caption: "product card that swaps to a second shot on hover, and the badge wobbles" },
  { slug: "sticky-crossfade", caption: "sticky image beside the text, crossfading as you read down" },
  { slug: "spring-chips", caption: "pill chips springing in around the centre one by one" },
  { slug: "voice-bars", caption: "listening bars for a mic 🎙️" },
  { slug: "announce-strip", caption: "announcement bar, loops with no seam and slides off when you scroll" },
  { slug: "grid-disclosure", caption: "accordion where every panel opens to exactly its own height" },
  { slug: "flip-text", caption: "run your pointer across and the letters flip over" },
  { slug: "spin-mark", caption: "a mark that springs in and then just keeps spinning" },
  { slug: "asterisk-rows", caption: "rows of asterisks drifting both ways while you scroll ✳️" },
  { slug: "arrow-link", caption: "big arrow link. on hover the arrow slides and the label rolls over" },
  { slug: "fill-button", caption: "outline pill that fills in from the left and drains out the right" },
  { slug: "mithai-box", caption: "a little late for diwali, but the mithai box is here\n\nuntie the ribbon, lift the lid, tap a sweet to see its name. seven boxes to pick from" },
];

// Mapinly first, top of its page to the bottom (intro, hero, sections, footer, then the event page); the rest keep COMPONENTS order.
const MAPINLY = ["star-rise", "load-preloader", "line-rise", "marquee-rows", "peek-card", "asterisk-rows", "spin-mark", "parallax-photo"];
export const POSTS = [...MAPINLY.map((slug) => ALL.find((p) => p.slug === slug)), ...ALL.filter((p) => !MAPINLY.includes(p.slug))];
