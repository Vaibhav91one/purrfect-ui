/** What the dialog's Usage tab shows. Keep each entry in step with its file in `registry/`. */
export type Doc = {
  usage?: string;
  props?: { name: string; type: string; default?: string; description: string }[];
  behaviors: string[];
};

export const DOCS: Record<string, Doc> = {
  "roll-button": {
    usage: `import Link from "next/link";
import { Rocket } from "lucide-react";
import { RollButton } from "@/components/ui/roll-button";

<RollButton icon={<Rocket className="size-4" />}>Ship it</RollButton>
<RollButton variant="ghost" asChild>
  <Link href="/docs">Read the docs</Link>
</RollButton>`,
    props: [
      { name: "variant", type: '"solid" | "ghost"', default: '"solid"', description: "Filled, or an outline." },
      { name: "size", type: '"md" | "lg"', default: '"md"', description: "46px tall, or 64px with wider padding." },
      { name: "href", type: "string", description: "Renders an <a> instead of a <button>." },
      { name: "asChild", type: "boolean", description: "Render your one child (a Next Link, a router link) as the button; its children are the label." },
      { name: "icon", type: "ReactNode", description: "Sits before or after the label." },
      { name: "iconPosition", type: '"start" | "end"', default: '"start"', description: "Which side the icon goes." },
      { name: "wide", type: "boolean", description: "Full width." },
      { name: "className", type: "string", description: "Merged with cn(), so your classes win." },
      { name: "...rest", type: "button / a props", description: "Everything else (onClick, disabled, ref, aria-*, data-*) goes to the element. data-hover=\"true\" shows the hover state without a pointer." },
    ],
    behaviors: [
      "A string label rolls up letter by letter, starting from the middle; the old letter fades out as the new one fades in.",
      "Lifts 2px on hover and presses down to 97%.",
      "Hover motion only runs on devices that can hover.",
      "Long labels, joined scripts (Arabic, Indic) and non-string children skip the roll and wrap as plain text.",
      "Reduced motion: no lift, no roll.",
    ],
  },
  magnetic: {
    usage: `import { Magnetic } from "@/components/ui/magnetic";

<Magnetic strength={0.6}>
  <button className="rounded-full px-6 py-3">Get in touch</button>
</Magnetic>`,
    props: [
      { name: "children", type: "ReactNode", description: "What to pull toward the pointer: a button, a link, an icon." },
      { name: "strength", type: "number", default: "1", description: "How much of the pointer's offset from the centre the content follows. 0 stays still." },
      { name: "className", type: "string", description: "Extra classes on the wrapper (an inline-block span)." },
    ],
    behaviors: [
      "While the mouse is over it, the content follows the pointer; on leave it springs back with a little overshoot.",
      "Mouse only: touch and pen leave it still, so there is no stuck offset on phones.",
      "One spring per axis, only running while it moves; it never re-renders React.",
      "No dependencies.",
      "Reduced motion: it does not move.",
    ],
  },
  notch: {
    usage: `import { Notch } from "@/components/ui/notch";

<div className="relative h-64 overflow-hidden rounded-3xl">
  <Notch>
    <span className="text-2xl font-medium">ARMOUR</span>
  </Notch>
</div>`,
    props: [
      { name: "children", type: "ReactNode", description: "What sits in the tab: a logo, a wordmark, a nav." },
      { name: "color", type: "string", default: '"var(--background, #fff)"', description: "Fill of the tab and of its two shoulders. Any CSS colour." },
      { name: "radius", type: "number", default: "32", description: "Radius of the lower corners and size of the shoulders, in px." },
      { name: "appear", type: "boolean", default: "true", description: "Drop in on mount. false renders it in place from the server HTML: use that when it holds navigation." },
      { name: "delay", type: "number", default: "0", description: "Seconds before the tab drops in." },
      { name: "offset", type: "number", default: "0", description: "Gap in px between the container's top edge and the tab." },
      { name: "className", type: "string", description: "Classes for the positioning wrapper (absolute, full width)." },
      { name: "tabClassName", type: "string", description: "Classes for the tab itself: width and padding." },
    ],
    behaviors: [
      "Hangs from the top edge of the nearest relative container; the shoulders curve into that edge.",
      "Drops in 26px and fades up once on mount.",
      "The tab is at most 200px wide on phones and 500px from md up.",
      "Reduced motion: it fades in without moving.",
    ],
  },
  "hero-reveal": {
    usage: `import { HeroReveal } from "@/components/ui/hero-reveal";

<HeroReveal
  src="/hero.jpg"
  title="Your wealth, finally working."
  description="The AI finance app that tracks your spending."
  action={<a href="#get">Get the app</a>}
/>`,
    props: [
      { name: "src", type: "string", description: "Background photo. It fills the frame with an 8px inset and rounded corners." },
      { name: "alt", type: "string", default: '""', description: "Alt text. Empty marks the photo decorative." },
      { name: "title", type: "ReactNode", description: "The headline." },
      { name: "description", type: "ReactNode", description: "The line under the headline." },
      { name: "action", type: "ReactNode", description: "A button or link, popped in last." },
      { name: "imgProps", type: "img props", description: "srcSet, sizes, width/height for the photo. It is fetched with high priority (it is the LCP)." },
      { name: "appear", type: "boolean", default: "true", description: "Play the entrance. false renders the finished hero straight from the server HTML: best LCP, no motion." },
      { name: "className", type: "string", description: "Classes for the section: height, max width, padding." },
    ],
    behaviors: [
      "When the hero first scrolls into view, the photo frame opens from the middle along the y-axis (0.9s).",
      "The text is white over a darkened photo, so it reads in light and dark themes alike.",
      "The headline and the line under it fade up out of a blur, 0.12s apart.",
      "The action springs in last, at 1.28s.",
      "Plays once. BlurReveal is exported too, for any block.",
      "Reduced motion: the frame and text fade in, nothing moves or blurs, and the action skips the spring.",
    ],
  },
  "layered-menu": {
    usage: `import { LayeredMenu } from "@/components/ui/layered-menu";

<section className="relative h-screen">
  <LayeredMenu
    logo="ARMOUR"
    primary={[{ label: "Experience", href: "#experience" }]}
    secondary={[{ label: "FAQ", href: "#faq" }]}
  />
</section>`,
    props: [
      { name: "primary", type: "MenuLink[]", description: "The big links on the right. A link is { label, href }." },
      { name: "secondary", type: "MenuLink[]", default: "[]", description: "The smaller list on the left." },
      { name: "legal", type: "MenuLink[]", default: "[]", description: "Small print under the secondary list; hidden when the menu is narrower than 48rem." },
      { name: "colors", type: "[string, string, string, string]", default: "Armour's four", description: "Panel colours, back to front. The last one carries the links." },
      { name: "logo", type: "ReactNode", description: "Centred at the top of the open menu." },
      { name: "color", type: "string", default: "#F4F1DE", description: "Burger and Close colour while the menu is shut: set it to suit the page behind." },
      { name: "activeColor", type: "string", default: "#F4F1DE", description: "Their colour while the menu is open, over the panels, and the colour of the links." },
      { name: "contained", type: "boolean", default: "false", description: "Fill the nearest relative parent instead of the screen." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Start open." },
      { name: "open", type: "boolean", description: "Controlled state, with onOpenChange." },
      { name: "delay", type: "number", default: "0", description: "Seconds before the burger lines draw in on first paint." },
      { name: "className", type: "string", description: "Classes for the burger button's position." },
    ],
    behaviors: [
      "Reduced motion: the panels and links fade, nothing slides or blurs.",
      "Four panels drop from the top in turn; the front one carries the links, which fade up out of a blur one after another.",
      "The burger turns into an X and a Close label slides in; both are cream over the panels (`activeColor`) and take `color` while shut. Closing runs the panels back up, front one first.",
      "Escape or picking a link closes it (the Escape is the menu's: a dialog around it stays open). Focus moves into the menu and returns to the burger; Tab stays inside while it is open.",
      "Locks page scroll while open (not when contained), padding for the scrollbar so nothing shifts. The front panel is a dialog; a click on the dimmed strip below it closes it.",
      "The layout follows the width of the frame it fills, not the screen: two columns from 48rem, one below.",
    ],
  },
  "scroll-reveal": {
    usage: `import { ScrollReveal } from "@/components/ui/scroll-reveal";

<ScrollReveal text="Scroll and the words fill in, one after another." />`,
    props: [
      { name: "text", type: "string", description: "The text to reveal." },
      { name: "className", type: "string", default: "text-4xl … lg:text-7xl", description: "Size and weight of the text." },
      { name: "offset", type: "[string, string]", default: '["start 0.8", "start 0.15"]', description: "When the fill starts and ends, as scroll offsets." },
      { name: "container", type: "RefObject<HTMLElement>", description: "Follow a scrolling box instead of the page." },
      { name: "mode", type: '"words" | "chars"', default: '"words"', description: "words fills in word by word; chars grows each letter from half size as it rises and fades in." },
    ],
    behaviors: ["Every word starts faint and turns solid in reading order.", "Finishes when the text is centred on screen.", "One CSS variable carries the progress, so a long paragraph costs one style write per frame.", "chars mode: letters grow, rise and fade in a staggered scrub; words never break mid-word.", "Reduced motion: words mode is solid; chars mode keeps only the fade."],
  },
  "parallax-columns": {
    usage: `import { ParallaxColumns } from "@/components/ui/parallax-columns";

<ParallaxColumns columns={[colA, colB, colC]} speeds={[0.12, 0.22, 0.05]} />`,
    props: [
      { name: "columns", type: "ReactNode[][]", description: "One array of items per column, any number of columns." },
      { name: "speeds", type: "number[]", default: "[0.12, 0.22, 0.05]", description: "Viewport heights each column starts below its place; repeats when there are more columns." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
      { name: "container", type: "RefObject<HTMLElement>", description: "Follow a scrolling box instead of the page." },
    ],
    behaviors: ["Columns rise into line at different rates as the section scrolls in.", "One spring eases the scroll progress; native scrolling is untouched, and resizing or the mobile toolbar never re-renders React.", "Reduced motion: a plain static grid."],
  },
  "path-carousel": {
    usage: `import { PathCarousel } from "@/components/ui/path-carousel";

<div className="h-[360px]">
  <PathCarousel items={cards} onActive={(i) => setCurrent(i)} />
</div>`,
    props: [
      { name: "items", type: "ReactNode[]", description: "What rides the path. Each is sized itemWidth × itemHeight." },
      { name: "active", type: "number", description: "Drive the rotation from outside." },
      { name: "onActive", type: "(index: number) => void", description: "Fires when the centre item changes." },
      { name: "itemWidth", type: "number", default: "300", description: "Item width before scaling, in px." },
      { name: "itemHeight", type: "number", default: "220", description: "Item height before scaling, in px." },
      { name: "label", type: "string", default: '"Carousel"', description: "Accessible name of the carousel." },
      { name: "className", type: "string", description: "Extra classes on the root. It fills its parent, so give the parent a height." },
    ],
    behaviors: ["Scroll over it, swipe, use the arrow keys while focus is in it, or click a neighbour to rotate.", "With 3+ items it loops; with fewer, the wheel goes back to the page at either end.", "A spring moves the rotation and it never overshoots.", "Every listener is on the carousel itself, so the page scrolls and keys work as usual everywhere else.", "Screen readers hear a carousel of slides, \"2 of 5\" as it turns; only the centred slide is a tab stop and focus follows it.", "Reduced motion: jumps instead of gliding."],
  },
  "stretch-switch": {
    usage: `import { StretchSwitch } from "@/components/ui/stretch-switch";

// uncontrolled, submitted with a form while on
<StretchSwitch label="Notifications" name="notifications" defaultChecked />

// controlled, and smaller
const [on, setOn] = useState(false);
<StretchSwitch label="Dark mode" checked={on} onCheckedChange={setOn} className="[--switch-w:3.5rem] [--switch-h:2rem]" />`,
    props: [
      { name: "label", type: "string", description: "The switch's accessible name. There is no visible text inside it, so say what it turns on." },
      { name: "checked", type: "boolean", description: "Controlled value. Leave it out and the switch keeps its own state." },
      { name: "defaultChecked", type: "boolean", default: "false", description: "Starting value when uncontrolled." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the new value on every flip." },
      { name: "name", type: "string", description: "Submitted with a form while on, like a checkbox." },
      { name: "value", type: "string", default: '"on"', description: "The value submitted under name." },
      { name: "disabled", type: "boolean", description: "Dims it and ignores clicks." },
      { name: "className", type: "string", description: "Merged with cn(). Set --switch-w and --switch-h here to resize it." },
    ],
    behaviors: [
      "Reduced motion: the knob jumps and only the colour fades.",
      "One spring moves the knob and its own speed drives the stretch, so the knob stretches as it travels and settles flat.",
      "Flipping it again mid-way carries on from where the knob is, with no restart.",
      "Space and Enter flip it; it is a real button with role switch.",
      "On is bg-primary, off is bg-input, and the knob is coloured as in shadcn's Switch: it follows your shadcn theme.",
      "112px by 64px unless you set --switch-w / --switch-h; it never shrinks inside a flex row.",
    ],
  },
  counter: {
    usage: `import { Counter } from "@/components/ui/counter";

<Counter value={2480} className="text-8xl font-semibold tracking-tight" />
<Counter value={1234567} locale="de-DE" className="text-6xl" />`,
    props: [
      { name: "value", type: "number", description: "The number to show. Change it and each digit column rolls to its new digit." },
      { name: "locale", type: "string", default: '"en-US"', description: "BCP 47 tag for the digit grouping (1,234 or 1.234)." },
      { name: "className", type: "string", description: "Size and weight come from here, e.g. text-8xl font-semibold." },
    ],
    behaviors: [
      "Reduced motion: the digits switch with no roll.",
      "Each digit is a column of 0 to 9 that slides to the new digit in 0.9s.",
      "Columns are keyed from the right, so 99 to 100 grows a column instead of reshuffling.",
      "Digits use tabular figures and a fixed 1ch cell, so the number does not jitter.",
      "Screen readers get the formatted number once, not the 0 to 9 stack.",
    ],
  },
  "glide-tabs": {
    usage: `import { GlideTabs } from "@/components/ui/glide-tabs";

const [tab, setTab] = useState("preview");
<GlideTabs
  tabs={[{ value: "preview", label: "Preview" }, { value: "code", label: "Code" }, { value: "docs", label: "Docs", disabled: true }]}
  value={tab}
  onValueChange={setTab}
  idPrefix="demo"
/>
<div role="tabpanel" id={\`demo-panel-\${tab}\`} aria-labelledby={\`demo-tab-\${tab}\`}>…</div>`,
    props: [
      { name: "tabs", type: "(string | { value, label, disabled? })[]", description: "The tabs, in order. A string is both label and value. Values must be unique." },
      { name: "value", type: "string", description: "Controlled value. Leave it out and the tabs keep their own state." },
      { name: "defaultValue", type: "string", description: "Starting tab when uncontrolled. Defaults to the first." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called when another tab is picked." },
      { name: "label", type: "string", default: '"Tabs"', description: "Accessible name for the tab list." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical stacks the tabs and uses the up and down arrows." },
      { name: "idPrefix", type: "string", description: "Wires your panels: tab ids are ${idPrefix}-tab-${value} and point at ${idPrefix}-panel-${value}." },
      { name: "className", type: "string", description: "Size comes from here, e.g. text-lg. Merged with cn()." },
    ],
    behaviors: [
      "Reduced motion: the pill moves instantly.",
      "A pill glides under the active label on one spring, and picking another tab mid-glide carries on from where it is.",
      "Arrow keys, Home and End move between enabled tabs, with one tab stop (roving tabindex).",
      "It renders the tab bar only: show your own panel for the selected value.",
      "A long list scrolls inside its own rounded bar rather than breaking the page.",
    ],
  },
  displacement: {
    usage: `import { Displacement } from "@/components/ui/displacement";

<Displacement src="/hero.jpg" alt="Mountains at dusk" className="h-96 rounded-3xl" />

// or paint it yourself
<Displacement className="h-64" paint={(ctx, w, h) => { ctx.font = "600 96px sans-serif"; ctx.fillText("Hello", 24, h / 2); }} />`,
    props: [
      { name: "src", type: "string", description: "The image to distort. Same-origin or CORS-enabled, or the plain image shows instead." },
      { name: "alt", type: "string", default: '""', description: "Accessible name. Empty marks it decorative." },
      { name: "paint", type: "(ctx, width, height) => void", description: "Draw the content on a 2D canvas instead, in CSS pixels. Called on mount and every resize." },
      { name: "radius", type: "number", default: "0.22", description: "Size of the bending area, as a share of the shorter side." },
      { name: "strength", type: "number", default: "0.6", description: "How far pixels are dragged with the pointer. 0 turns it off." },
      { name: "aberration", type: "number", default: "0.5", description: "How far the red and blue channels split along the drag, 0 to 1." },
      { name: "grain", type: "number", default: "0.08", description: "Film grain over the moving area, 0 to 1." },
      { name: "className", type: "string", description: "Size it here: it fills its box." },
    ],
    behaviors: [
      "Reduced motion: the plain image, no bending.",
      "A trail point follows the pointer on a spring; the gap between them drags nearby pixels, the colour channels split along the drag and grain shows while it moves.",
      "Draws only while the trail moves and pauses off screen: a still page costs nothing. Props are read live.",
      "WebGL2 with one full-screen triangle and no dependencies. Without WebGL2, or if the context is lost, the plain image or canvas shows.",
    ],
  },
  "hover-preview": {
    usage: `import { HoverPreview } from "@/components/ui/hover-preview";

<HoverPreview
  items={[
    { title: "Mapinly", meta: "Design & development", href: "/work/mapinly", preview: <img src="/mapinly.png" alt="" /> },
    { title: "Bountydesk", meta: "Development", href: "/work/bountydesk", preview: <img src="/bountydesk.png" alt="" />, color: "#D9C8A4" },
  ]}
/>`,
    props: [
      { name: "items", type: "{ title, href, meta?, preview, color? }[]", description: "The rows. preview is what the floating card shows; color is its background." },
      { name: "label", type: "string", default: '"View"', description: "Text on the disc that trails the card. Empty hides the disc." },
      { name: "cardClassName", type: "string", description: "Classes for the floating card: its size (400 x 300px by default)." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    behaviors: [
      "Reduced motion: the card appears in place and jumps with the pointer, no scale and no trail.",
      "Hovering a row floats a card that trails the pointer, with a disc that keeps up faster; another row slides the card to its preview.",
      "Keyboard focus opens the card beside the focused row; touch gets plain links.",
      "Positions are relative to the list (and undo any scale on an ancestor), so it works anywhere on the page.",
      "React re-renders once per row change, not per pointer move. Previews mount on the first open.",
    ],
  },
  "scroll-marquee": {
    usage: `import { ScrollMarquee } from "@/components/ui/scroll-marquee";

<ScrollMarquee speed={80}>
  <p className="pr-12 text-8xl font-medium whitespace-nowrap">Vaibhav Tomar —</p>
</ScrollMarquee>`,
    props: [
      { name: "children", type: "ReactNode", description: "One copy of what scrolls past. Put the gap after it (padding-right) inside." },
      { name: "speed", type: "number", default: "80", description: "Pixels per second." },
      { name: "direction", type: '"left" | "right"', default: '"left"', description: "Which way it runs before the first scroll." },
      { name: "container", type: "RefObject<HTMLElement | null>", default: "the page", description: "Follow a scrolling box instead of the page." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    behaviors: [
      "Reduced motion: it stands still.",
      "Scrolling down runs it left, scrolling up runs it right.",
      "Fixed speed per second whatever the frame rate; as many copies as the width needs, wrapped by exactly one copy.",
      "Only runs while on screen. Screen readers and Tab get the first copy; the repeats are inert.",
    ],
  },
  "roll-link": {
    usage: `import Link from "next/link";
import { RollLink } from "@/components/ui/roll-link";

<RollLink href="#work">Work</RollLink>
<RollLink asChild>
  <Link href="/about">About</Link>
</RollLink>`,
    props: [
      { name: "children", type: "string", description: "The label." },
      { name: "asChild", type: "boolean", description: "Render your one child (a Next Link) as the link; its children are the label." },
      { name: "className", type: "string", description: "Merged with cn(). Size and colour come from here." },
    ],
    behaviors: [
      "Reduced motion: the two faces cross-fade, nothing turns.",
      "On hover or keyboard focus the label tips back on a 3D axis while a copy swings up from below.",
      "CSS only: it renders on the server and ships no JavaScript. Hover only runs on devices that can hover.",
    ],
  },
  "curtain-reveal": {
    usage: `import { CurtainReveal } from "@/components/ui/curtain-reveal";

<main>{/* the page */}</main>
<CurtainReveal className="p-12">
  <h2 className="text-6xl">Let's work together</h2>
</CurtainReveal>`,
    props: [
      { name: "height", type: "string", default: '"100svh"', description: "Height of the revealed panel, any CSS length." },
      { name: "className", type: "string", description: "Classes for the panel (background, padding, colour). bg-foreground text-background by default." },
      { name: "frameClassName", type: "string", description: "Classes for the outer box in the page flow." },
    ],
    behaviors: [
      "Reduced motion: nothing changes, there is no animation; the panel is uncovered by scrolling itself.",
      "As you scroll down the page lifts away and uncovers the panel, which stays put underneath.",
      "A clipped box holds a sticky panel: no JavaScript, no scroll listener, server rendered. Put it last on the page.",
    ],
  },
  preloader: {
    usage: `import { Preloader } from "@/components/ui/preloader";

// in your root layout, once
<Preloader />
<Preloader words={["Hello", "Hola", "Bonjour"]} duration={1.8} onDone={() => console.log("in")} />`,
    props: [
      { name: "words", type: "string[]", default: "Welcome in 10 languages", description: "Shown one after another." },
      { name: "duration", type: "number", default: "2.4", description: "Seconds the words take in total, before the panel lifts." },
      { name: "storageKey", type: "string | false", default: '"preloader-seen"', description: "sessionStorage key that makes it play once per tab; false plays it every load." },
      { name: "onDone", type: "() => void", description: "Called once the page is uncovered (right away when already seen)." },
      { name: "contained", type: "boolean", default: "false", description: "Fill the nearest relative parent and leave page scroll alone: for a card or preview." },
    ],
    behaviors: [
      "Reduced motion: one word, then the panel fades out.",
      "The words swap in turn, then the panel lifts with a curved bottom edge (a transform, not an animated border radius).",
      "Click, tap or Escape skips it. It locks page scroll while it covers the page, padding for the scrollbar.",
      "On a repeat visit an inline script hides it before the first paint; with no JavaScript it uncovers the page by itself.",
    ],
  },
  "cursor-follower": {
    usage: `import { CursorFollower } from "@/components/ui/cursor-follower";

// once, near the root
<CursorFollower />

// anything can grow it while hovered
<a href="/work" data-cursor-scale="4">Work</a>`,
    props: [
      { name: "size", type: "number", default: "20", description: "Diameter of the dot in px." },
      { name: "className", type: "string", description: "Extra classes on the dot." },
    ],
    behaviors: [
      "Reduced motion: it sits exactly on the pointer, no trail and no grow.",
      "Follows the mouse and inverts what is under it (mix-blend-difference).",
      "data-cursor-scale on any element grows it while hovered: no context, no hooks.",
      "One passive pointer listener moves motion values; React never re-renders while it moves. Mouse only, and it hides when the pointer leaves the window.",
    ],
  },
  "fill-button": {
    usage: `import { FillButton } from "@/components/ui/fill-button";

<FillButton>Get in touch</FillButton>
<FillButton href="/work">View work</FillButton>`,
    props: [
      { name: "href", type: "string", description: "Renders an <a> instead of a <button>." },
      { name: "className", type: "string", description: "Merged with cn(). The colours come from foreground and background." },
      { name: "...rest", type: "button / a props", description: "Everything else goes to the element; your pointer and focus handlers run before the sweep." },
    ],
    behaviors: [
      "Reduced motion: the fill fades in and out instead of sweeping.",
      "The fill sweeps in from the left on hover or keyboard focus and out to the right on leave; the label switches colour with it.",
      "One CSS transition and a data attribute: React never re-renders. Touch and pen get the press colour only.",
    ],
  },
  "load-preloader": {
    usage: `import { LoadPreloader } from "@/components/ui/load-preloader";

// in your root layout, once
<LoadPreloader />
<LoadPreloader ready={heroImage.decode()} minDuration={1.5} onDone={() => console.log("in")} />`,
    props: [
      { name: "ready", type: "Promise<unknown> | boolean", default: "fonts + window load", description: "What it waits for: a promise (settled either way counts) or a flag that turns true." },
      { name: "minDuration", type: "number", default: "1.2", description: "Seconds the count takes at the least, so a fast load still reads as intentional." },
      { name: "maxWait", type: "number", default: "7", description: "Seconds it waits at most before it counts to 100 anyway." },
      { name: "storageKey", type: "string | false", default: '"load-preloader-seen"', description: "sessionStorage key that makes it play once per tab; false plays it every load." },
      { name: "onDone", type: "() => void", description: "Called when it reaches 100 and starts to fade, releasing the page (right away when already seen)." },
      { name: "contained", type: "boolean", default: "false", description: "Fill the nearest relative parent and leave page scroll alone: for a card or preview." },
    ],
    behaviors: [
      "The count eases toward the real load but never runs ahead of the minimum-time ramp, so it always looks continuous.",
      "At 100 it holds for 250ms, then fades out over 1s; page scroll unlocks as the fade starts (padded for the scrollbar while locked).",
      "The number is written straight to the text node, so React does not re-render every frame.",
      "On a repeat visit an inline script hides it before the first paint; with no JavaScript it uncovers the page by itself.",
      "Reduced motion: the number jumps with the load instead of counting, with no minimum time, then a 0.3s fade.",
    ],
  },
  "star-rise": {
    usage: `import { StarRise } from "@/components/ui/star-rise";

<section className="relative min-h-svh overflow-hidden">
  <StarRise size={320} onRiseComplete={() => setReady(true)} />
</section>`,
    props: [
      { name: "children", type: "ReactNode", description: "The mark. Defaults to the liquid-metal asterisk; pass any SVG or image to skip the shader." },
      { name: "size", type: "number", default: "320", description: "Width and height in pixels. The shader canvas is this size." },
      { name: "duration", type: "number", default: "3.6", description: "Seconds for the rise and half-turn. The fade takes half of it." },
      { name: "delay", type: "number", default: "0", description: "Seconds before it rises." },
      { name: "turns", type: "number", default: "3", description: "Full turns as the mark scrolls through the viewport. 0 turns it off." },
      { name: "container", type: "RefObject<HTMLElement | null>", description: "Follow a scrolling box instead of the page." },
      { name: "shader", type: "boolean", default: "true", description: "Default asterisk only: false draws the plain SVG in the text colour, no WebGL." },
      { name: "colorBack", type: "string", default: "--background", description: "Default asterisk only: the shader's background. The page background by default; set it when the mark sits on another surface." },
      { name: "colorTint", type: "string", default: "text colour", description: "Default asterisk only: the metal's tint; by default it follows the text colour, so it reads in light and dark themes." },
      { name: "onRiseComplete", type: "() => void", description: "Called once the mark has settled." },
    ],
    behaviors: [
      "Rises a full viewport height while turning from -180° to 0 (3.6s), fading in over the first half.",
      "Starts hidden in the server HTML, so nothing flashes; WebGL loads only on the client, and the plain SVG asterisk is the fallback.",
      "After the rise it keeps turning with its own scroll through the viewport (or container). The shader stops its frame loop while off screen.",
      "Put it inside an overflow-hidden section so the rise does not grow the page.",
      "Reduced motion: it only fades in, does not rise, spin or turn on scroll, and the metal holds still.",
    ],
  },
  "marquee-rows": {
    usage: `import { MarqueeRows } from "@/components/ui/marquee-rows";

<MarqueeRows
  items={[{ label: "We listen" }, { label: "We experiment" }, { label: "We measure" }, { label: "We share", href: "/about" }]}
  speed={120}
/>`,
    props: [
      { name: "items", type: "{ label: ReactNode; href?: string }[]", description: "One row each. With href the row is a link, without it a button." },
      { name: "speed", type: "number", default: "120", description: "Pixels per second the open row's marquee runs at." },
      { name: "separator", type: "ReactNode", default: "spinning asterisk", description: "What sits between the repeats in the band." },
      { name: "indent", type: "boolean", default: "true", description: "Stagger the rows' start (from md up)." },
      { name: "bandClassName", type: "string", default: '"bg-primary text-primary-foreground"', description: "Classes for the band, e.g. bg-foreground text-background." },
      { name: "className", type: "string", description: "Extra classes on the root (text size lives here)." },
    ],
    behaviors: [
      "Opens on mouse hover, keyboard focus, or tap (a tap toggles; on a link the second tap follows it). No stuck hover on touch.",
      "Row height comes from its text; the band covers the row and repeats the label with separators.",
      "Fixed speed per second whatever the frame rate; as many copies as the width needs, wrapped by exactly one copy.",
      "Only the open row's marquee runs, and only while on screen. The band is aria-hidden and inert.",
      "Reduced motion: the band fades in without the slide and its marquee stands still.",
    ],
  },
  "peek-card": {
    usage: `import { PeekCard } from "@/components/ui/peek-card";

<PeekCard index={1} image="/event.jpg" title="Mapping the old town" description="A walk through the lanes." meta="Sat, 12 Oct" href="/events/old-town" />
<PeekCard variant="row" muted image="/past.jpg" title="Last month's meetup" meta={<span>Closed</span>} href="/events/past" />`,
    props: [
      { name: "image", type: "string | ReactNode", description: "An image URL, or any node (gradient, video) that fills the media area." },
      { name: "imgProps", type: "ImgHTMLAttributes", description: "Extra attributes for the <img> when image is a URL (alt, loading, sizes)." },
      { name: "title", type: "ReactNode", description: "The heading; with href it is the link text and the whole card is clickable." },
      { name: "description", type: "ReactNode", description: "Fades in once the panel opens." },
      { name: "meta", type: "ReactNode", description: "Small lines under the description (date, place, status)." },
      { name: "index", type: "number | string", description: "The big number top-left (bottom-left of the image in a row)." },
      { name: "href", type: "string", description: "Makes the whole card a link." },
      { name: "variant", type: '"card" | "row"', default: '"card"', description: "A tall card with a peeking panel, or a wide row with an arrow." },
      { name: "muted", type: "boolean", default: "false", description: "A past or closed item: dimmed, the arrow stays put." },
    ],
    behaviors: [
      "The card fades up once as it scrolls into view.",
      "Hover zooms the image to 1.1 and slides the panel up from 52%; the description and meta fade in after 0.1s and 0.15s. An asterisk spins in the panel.",
      "Row variant: the up-right arrow scales from 0.8 and fades in on hover; muted dims the row and keeps the arrow showing.",
      "Touch shows the panel open and the arrow visible; keyboard focus opens it too. All CSS, no re-render on hover.",
      "Reduced motion: no fade-up travel, no zoom, no spin, and the panel's details fade in place instead of sliding.",
    ],
  },
  "counter-loader": {
    usage: `import { CounterLoader } from "@/components/ui/counter-loader";

// in your root layout, once
<CounterLoader />
<CounterLoader stickers={[<img key="a" src="/a.webp" alt="" />, <img key="b" src="/b.webp" alt="" />]} steps={[0, 42, 100]} onDone={() => console.log("in")} />`,
    props: [
      { name: "stickers", type: "ReactNode[]", default: "4 token-coloured shapes", description: "Popped one by one into a fanned pile while the counter runs; [] for none." },
      { name: "steps", type: "number[]", default: "[0, 27, 64, 100]", description: "The numbers the counter rolls through." },
      { name: "duration", type: "number", default: "1.4", description: "Seconds the counter takes, before the block wipes up." },
      { name: "storageKey", type: "string | false", default: '"counter-loader-seen"', description: "sessionStorage key that makes it play once per tab; false plays it every load." },
      { name: "onDone", type: "() => void", description: "Called once the page is uncovered (right away when already seen)." },
      { name: "contained", type: "boolean", default: "false", description: "Fill the nearest relative parent and leave page scroll alone: for a card or preview." },
    ],
    behaviors: [
      "The counter rolls through the steps while the stickers pop into a fanned pile; they pop back out, a block wipes up, and the loader lifts away (transforms only).",
      "Click, tap or Escape skips it. It locks page scroll while it covers the page, padding for the scrollbar.",
      "On a repeat visit an inline script hides it before the first paint; with no JavaScript it uncovers the page by itself.",
      "Reduced motion: the number jumps from step to step, the stickers appear without the pop, and the loader fades out.",
    ],
  },
  "sticker-cover": {
    usage: `import { StickerCover, type StickerCoverHandle } from "@/components/ui/sticker-cover";

const cover = useRef<StickerCoverHandle>(null);
<StickerCover ref={cover} sticker={<img src="/sticker.webp" alt="" className="size-40" />}>{page}</StickerCover>
<button onClick={() => cover.current?.play(() => setPage("about"))}>About</button>

// Next App Router (in a client layout): resolve once the new route has committed
const router = useRouter();
const path = usePathname();
const done = useRef<() => void>(undefined);
useEffect(() => done.current?.(), [path]);
const go = (href: string) => href !== path && cover.current?.play(() => new Promise<void>((r) => { done.current = r; router.push(href); }));`,
    props: [
      { name: "ref", type: "Ref<StickerCoverHandle>", description: "ref.current.play(change, { instant }) plays the cover; resolves once it has lifted." },
      { name: "sticker", type: "ReactNode", description: "Pops in at the centre once the sheet is up. None: the sheet lifts as soon as the new content has painted." },
      { name: "duration", type: "number", default: "0.5", description: "Seconds the sheet takes to rise; the lift takes 1.2x." },
      { name: "contained", type: "boolean", default: "false", description: "Cover the nearest relative parent (give it overflow-hidden) instead of the screen." },
      { name: "className", type: "string", default: '"bg-foreground"', description: "Classes for the sheet, e.g. its colour (bg-primary)." },
      { name: "pageClassName", type: "string", description: "Classes for the box around children: the page that drifts up and goes inert." },
    ],
    behaviors: [
      "The sheet rises while the page drifts up 7rem, your change runs, two frames paint, the sticker pops, then the sheet lifts.",
      "A play() while the sheet is up runs under the same cover (latest wins); one during the lift covers again afterwards. { instant: true } drops it in place for back/forward.",
      "The sheet is aria-hidden, the page is inert while covered, and focus returns to where it was (or the page box if that element is gone).",
      "No router dependency and no global attributes; React never re-renders while it plays.",
      "Reduced motion: a quick crossfade, no drift and no sticker.",
    ],
  },
  "inertia-gallery": {
    usage: `import { InertiaGallery } from "@/components/ui/inertia-gallery";

<div className="h-[560px]">
  <InertiaGallery items={[{ src: "/a.jpg", alt: "A", title: "A", href: "/work/a" }, { node: <Art />, title: "B" }]} />
</div>`,
    props: [
      { name: "items", type: "{ src?: string; node?: ReactNode; alt?: string; href?: string; title?: ReactNode }[]", description: "Frames. node draws instead of an image; an empty frame shows bg-muted." },
      { name: "layout", type: '"list" | "slider"', description: "Controlled layout. Pair with onLayoutChange." },
      { name: "defaultLayout", type: '"list" | "slider"', default: '"list"', description: "Uncontrolled starting layout." },
      { name: "onLayoutChange", type: "(layout) => void", description: "Fires when the bar's List / Slider buttons ask for a layout." },
      { name: "onActiveChange", type: "(index: number) => void", description: "Fires when the centred item changes." },
      { name: "intro", type: "boolean", default: "false", description: "Play the squares intro the first time it scrolls into view." },
      { name: "friction", type: "number", default: "0.97", description: "Velocity kept per 60fps frame; higher coasts further." },
      { name: "frameWidth", type: "number", default: "240", description: "Largest list frame width in px; slider frames are 2x. Both shrink to fit." },
      { name: "frameHeight", type: "number", default: "320", description: "Largest list frame height in px." },
      { name: "bar", type: "boolean", default: "true", description: "Bottom bar with title, counter and the List / Slider buttons." },
      { name: "label", type: "string", default: '"Gallery"', description: "Accessible name." },
    ],
    behaviors: [
      "Wheel or drag adds velocity; the strip coasts, then settles by intent: a nudge returns, anything more moves at least one frame.",
      "Each image is zoomed past its frame and drifts against the frame's distance from the centre (parallax).",
      "Switching layout moves every frame to its new spot over 1.5s, outer frames first.",
      "Arrow keys move one frame and Home / End jump to the ends while the strip has focus; Enter opens the centred frame's link.",
      "Touch only takes horizontal swipes (touch-action: pan-y), so the page still scrolls on phones.",
      "The frame loop runs only while something moves and pauses off screen.",
      "Reduced motion: no parallax or coasting (jumps to the settled frame), layout switches crossfade, no intro.",
    ],
  },
  "fit-title": {
    usage: `import { FitTitle } from "@/components/ui/fit-title";

<FitTitle>shop</FitTitle>`,
    props: [
      { name: "children", type: "string", description: "The title text." },
      { name: "as", type: '"h1" | "h2" | "p"', default: '"h1"', description: "The element to render." },
      { name: "min", type: "number", default: "28", description: "Smallest font size in px; a title that would fit smaller wraps instead." },
      { name: "max", type: "number", description: "Largest font size in px." },
      { name: "rise", type: "boolean", default: "true", description: "Rise out of a mask the first time it scrolls into view." },
      { name: "className", type: "string", description: "Font family, weight and colour (the size is computed)." },
    ],
    behaviors: [
      "Fills its container's width exactly; very short titles stop at half the width.",
      "Sized in CSS with container units, so the first paint is already right; one measurement corrects it, and resizing needs no JS.",
      "Wraps onto more lines when it would fit smaller than min.",
      "Rises out of a mask the first time it scrolls into view; with JavaScript off it is simply visible.",
      "Reduced motion: no rise, a short fade instead.",
    ],
  },
  "fan-out-cards": {
    usage: `import { FanOutCards } from "@/components/ui/fan-out-cards";

<FanOutCards
  className="h-[480px]"
  center={<img src="/phone.png" alt="" className="h-72 rounded-3xl" />}
  cards={[
    { x: -30, y: -25, rotate: -6, content: <p>Your AAPL position is up 12%</p> },
    { x: 30, y: -25, rotate: 6, content: <p>On track to save $400 this month</p> },
    { x: -32, y: 25, rotate: 5, content: <p>Rebalancing opportunity detected</p> },
  ]}
/>`,
    props: [
      { name: "cards", type: "{ content, x, y, rotate? }[]", description: "x and y are where each card's centre lands, in % of the container from its centre (-50 is the left or top edge); rotate is the tilt in degrees." },
      { name: "center", type: "ReactNode", description: "Something in the middle that the cards fan out from: a phone, a photo, a pill." },
      { name: "stagger", type: "number", default: "0.08", description: "Seconds between one card leaving the stack and the next." },
      { name: "cardClassName", type: "string", description: "Classes for every card box (w-64 by default)." },
    ],
    behaviors: [
      "Plays once, when 30% of the group is in view.",
      "Offsets are container-relative, so the fan scales with its box; give the root a height (480px by default).",
      "Each card springs out from the centre, tilting as it goes, while its opacity and scale ease in.",
      "Reduced motion: the cards are already in place and tilted, and only fade in.",
    ],
  },
  "shimmer-text": {
    usage: `import { ShimmerText } from "@/components/ui/shimmer-text";

<ShimmerText>Thinking…</ShimmerText>
<ShimmerText as="p" duration={2} className="text-sm font-medium">Generating report…</ShimmerText>`,
    props: [
      { name: "as", type: "ElementType", default: '"span"', description: "The element to render (p, h2, div...)." },
      { name: "duration", type: "number", default: "2.8", description: "Seconds for one linear sweep of the band." },
      { name: "className", type: "string", description: "Merged onto the root; set size and weight here." },
    ],
    behaviors: [
      "The base colour is muted-foreground and the band is foreground, both from tokens, so it reads on light and dark backgrounds.",
      "One CSS keyframe moves background-position, with no JavaScript per frame. It pauses while off screen.",
      "The text is a single node, so screen readers read it once.",
      "Reduced motion: it stands still in muted-foreground, fully readable.",
    ],
  },
  "photo-wordmark": {
    usage: `import { PhotoWordmark } from "@/components/ui/photo-wordmark";

<footer className="overflow-hidden">
  <PhotoWordmark text="ARMOUR" src="/field.jpg" className="font-black tracking-tight" />
</footer>`,
    props: [
      { name: "text", type: "string", description: "The word. One line, sized to fill the width." },
      { name: "src", type: "string", description: "The photo inside the letters." },
      { name: "as", type: '"p" | "h1" | "h2" | "span"', default: '"p"', description: "The text element. A p so a footer does not add an h1." },
      { name: "crop", type: "number", default: "0.3", description: "Fraction of the glyph height hidden under the bottom edge, 0 to 0.9." },
      { name: "glow", type: "boolean", default: "true", description: "A blurred copy of the photo behind the word." },
      { name: "container", type: "RefObject<HTMLElement | null>", default: "the page", description: "Follow a scrolling box instead of the page." },
      { name: "className", type: "string", description: "Font family and tracking. Set [--advance:0.9] for a wider face (average glyph width in em, default 0.75)." },
    ],
    behaviors: [
      "Fills its width with no measuring: a cqi font size from the character count and --advance.",
      "Scrolling it into view raises the word a little out of the crop and drifts the photo inside the letters.",
      "The glow copy is aria-hidden, so the word is read once.",
      "Reduced motion: static, at its final crop with the photo still.",
    ],
  },
  "drawer-menu": {
    usage: `import { DrawerMenu } from "@/components/ui/drawer-menu";

<DrawerMenu
  active="#work"
  links={[
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ]}
  footer={<a href="https://github.com/you">GitHub</a>}
/>`,
    props: [
      { name: "links", type: "DrawerLink[]", description: "The links in the panel, top to bottom. A link is { label, href }." },
      { name: "active", type: "string", description: "The href of the current page or section: its dot shows while nothing is hovered or focused." },
      { name: "heading", type: "ReactNode", default: '"Navigation"', description: "The small heading over the links." },
      { name: "footer", type: "ReactNode", description: "Pinned to the bottom of the panel: social links, an email, small print." },
      { name: "contained", type: "boolean", default: "false", description: "Fill the nearest relative parent instead of the screen." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Start open." },
      { name: "open", type: "boolean", description: "Controlled state, with onOpenChange." },
      { name: "className", type: "string", description: "Classes for the round button's position (top-right by default)." },
    ],
    behaviors: [
      "The button's two lines cross into an X; a full-height panel slides in from the right and the links follow it in one after another.",
      "A dot grows beside the hovered or keyboard-focused link, and rests on the `active` one otherwise. Touch never leaves it stuck.",
      "Escape, a click outside, or picking a link closes it. Focus moves into the panel and returns to the button; Tab stays inside while it is open.",
      "The panel inverts the theme (foreground background, background text), so it reads in light and dark.",
      "Reduced motion: the panel and links fade, nothing slides.",
    ],
  },
  "quote-cycle": {
    usage: `import { QuoteCycle } from "@/components/ui/quote-cycle";

<QuoteCycle lines={["Make it simple, but significant.", "Design is thinking made visual."]} />`,
    props: [
      { name: "lines", type: "ReactNode[]", description: "The lines to cycle through, in order: strings or inline content." },
      { name: "index", type: "number", description: "Show this line and stop the timer, so you advance it yourself (a click, a key, a step)." },
      { name: "interval", type: "number", default: "3.5", description: "Seconds from one line arriving to the next." },
      { name: "announce", type: "boolean", default: "false", description: "Read each new line to screen readers (a polite live region)." },
      { name: "className", type: "string", description: "Size, colour and width of the text." },
    ],
    behaviors: [
      "The current line pops up to 1.2x and holds, then shrinks up and away while the next drops in from 1.5x.",
      "Every line shares one grid cell, so the box keeps the height of the tallest line and nothing below moves.",
      "Pauses on hover, on keyboard focus inside it and while off screen.",
      "Hidden lines are inert; the live region stays off unless announce is set.",
      "Reduced motion: the lines cross-fade in place.",
    ],
  },
  "column-hop": {
    usage: `import { ColumnHop } from "@/components/ui/column-hop";

<ColumnHop
  columns={[
    { title: "Triage", items: [<p key="a">Open redirect on /logout</p>] },
    { title: "Reproducing", items: [] },
    { title: "Done", items: [<p key="b">Stored XSS in comments</p>] },
  ]}
  item={<p>Path traversal in upload</p>}
  itemByColumn={[undefined, <p key="r">Path traversal in upload · running</p>]}
  stops={[0, 1]}
  interval={2.6}
/>`,
    props: [
      { name: "columns", type: "{ title: ReactNode; items: ReactNode[] }[]", description: "The columns, left to right, with the cards that stay put." },
      { name: "item", type: "ReactNode", description: "The card that hops." },
      { name: "itemByColumn", type: "ReactNode[]", description: "Per-column versions of the card, by column index, so it wears the state of the column holding it. Falls back to item." },
      { name: "stops", type: "number[]", default: "[0, 1]", description: "Column indices it visits in order, then loops. Fewer than two: it stays put." },
      { name: "interval", type: "number", default: "2.6", description: "Seconds it rests in each column." },
      { name: "itemClassName", type: "string", description: "Classes for every card box." },
    ],
    behaviors: [
      "The card fades and sinks, its row collapses, then the next column's row opens first and the card rises into it, so nothing ever overlaps.",
      "Rows animate grid-template-rows 1fr / 0fr with CSS transitions: no measuring, no dependencies. Column counts follow the card.",
      "The loop pauses off screen and while the tab is hidden. The row it left is inert and hidden from screen readers.",
      "Reduced motion: no sink, rise or collapse; the card fades out and back in quickly.",
    ],
  },
  "line-rise": {
    usage: `import { LineRise } from "@/components/ui/line-rise";

<LineRise as="h2" className="text-6xl tracking-tight" lines={["Maps that", "move with", "the world."]} />

// inside a scrolling box: rise as the block scrolls into view there, drop back as it leaves
const box = useRef<HTMLDivElement>(null);
<div ref={box} className="h-96 overflow-y-auto">
  <LineRise container={box} once={false} lines={["Mapinly brings people together", "across languages and cultures."]} />
</div>`,
    props: [
      { name: "lines", type: "ReactNode[]", description: "One entry per line; each rises out of its own mask." },
      { name: "as", type: '"p" | "h1" | "h2" | "h3" | "div"', default: '"p"', description: "The element to render." },
      { name: "stagger", type: "number", default: "0.075", description: "Seconds between one line and the next." },
      { name: "duration", type: "number", default: "0.75", description: "Seconds each line takes to rise." },
      { name: "amount", type: "number", default: "0.5", description: "How much of the block must be on screen before it plays; lower it for blocks taller than the screen." },
      { name: "once", type: "boolean", default: "true", description: "Play the first time only; false drops the lines back when the block leaves and replays on return." },
      { name: "container", type: "RefObject<Element | null>", description: "Watch a scrolling box instead of the page: the lines rise as the block scrolls into view inside it." },
      { name: "className", type: "string", description: "Size, weight, colour and line height." },
    ],
    behaviors: [
      "Each line slides up from behind its own clipping edge, one after another, once half the block is on screen.",
      "You choose the line breaks, so nothing is measured or re-split on resize; a long line wraps inside its mask.",
      "Only a transform moves inside each mask, so the layout never shifts; with JavaScript off the text is simply visible.",
      "Reduced motion: no rise, each line fades in instead.",
    ],
  },
  "flip-text": {
    usage: `import { FlipText } from "@/components/ui/flip-text";

<FlipText text="© Code By Vaibhav Tomar" className="text-xl uppercase" />`,
    props: [
      { name: "text", type: "string", description: "The text. Split into words and letters on screen; read whole by screen readers." },
      { name: "className", type: "string", description: "Size, weight and colour of the text." },
    ],
    behaviors: [
      "Lines fade in one after another the first time the text scrolls into view; the text is visible without JavaScript.",
      "A letter flips over on the X axis when the pointer crosses it; a tap flips it on touch. A flip that is running finishes before the letter can flip again.",
      "Keyboard focus on the text, or on the link or button around it, flips every letter in a quick wave.",
      "Joined scripts (Arabic, Indic marks, emoji sequences) flip a word at a time so their letters keep their shapes.",
      "Reduced motion: lines still fade in; letters blink their opacity instead of turning.",
    ],
  },
  "spin-mark": {
    usage: `import { SpinMark } from "@/components/ui/spin-mark";

<SpinMark className="size-24 text-primary" />
<SpinMark mode="scroll" turns={3} className="size-8" />`,
    props: [
      { name: "children", type: "ReactNode", description: "The mark: any SVG, image or text. Defaults to an asterisk in the current text colour. It fills the root, so size it with className." },
      { name: "mode", type: '"spin" | "scroll"', default: '"spin"', description: "spin turns forever at a steady speed; scroll turns with the page's scroll position." },
      { name: "duration", type: "number", default: "20", description: "spin only: seconds per full turn." },
      { name: "turns", type: "number", default: "3", description: "scroll only: full turns from the top of the page to the bottom." },
      { name: "container", type: "RefObject<HTMLElement | null>", description: "scroll only: follow a scrolling box instead of the page." },
    ],
    behaviors: [
      "Pops in on a spring (scale 0 to 1, with a fade) the first time it enters the viewport.",
      "spin: a linear CSS animation, paused with animation-play-state while off screen, so it costs no JavaScript per frame.",
      "scroll: rotation follows the scroll progress of the page (or container), 0 to turns x 360 degrees, written straight to transform.",
      "Reduced motion: it fades and scales in without the bounce, and does not turn.",
    ],
  },
  "arrow-link": {
    usage: `import { ArrowLink } from "@/components/ui/arrow-link";

<ArrowLink href="mailto:hello@example.com">Get in touch</ArrowLink>`,
    props: [
      { name: "children", type: "string", description: "The label." },
      { name: "href", type: "string", description: "Where it goes. Every other <a> prop is passed through too." },
      { name: "className", type: "string", description: "Merged with cn(). Size (default text-5xl) and colour come from here." },
    ],
    behaviors: [
      "Rises out of a mask the first time it scrolls into view. Without JavaScript it is simply visible.",
      "On hover or keyboard focus the arrow slides 8px right and the label rolls up, a copy rising from below. The roll is a flat translate inside its own clip, so the hover area stays the link's box.",
      "Hover only runs on devices that can hover, so a tap never leaves it stuck.",
      "Reduced motion: it fades in instead of rising, the arrow stays put and the label faces cross-fade.",
    ],
  },
  "grid-disclosure": {
    usage: `import { GridDisclosure } from "@/components/ui/grid-disclosure";

<GridDisclosure
  items={[
    { title: "What exactly am I approving?", content: "The precise bytes of the outbound comment." },
    { title: "How is scope enforced?", content: "At the capability boundary." },
  ]}
/>`,
    props: [
      { name: "items", type: "{ title: ReactNode; content: ReactNode }[]", description: "The rows, in order. Only one is open at a time." },
      { name: "value", type: "number | null", description: "Controlled open row (index), or null for all closed. Leave it out and the list keeps its own state." },
      { name: "defaultValue", type: "number | null", default: "0", description: "Starting open row when uncontrolled; null starts all closed." },
      { name: "onValueChange", type: "(value: number | null) => void", description: "Called with the newly open row, or null when the open one closes." },
      { name: "icon", type: "ReactNode", description: "Replaces the built-in caret. It still turns half a circle when its row opens." },
      { name: "className", type: "string", description: "Merged onto the <ul> with cn()." },
    ],
    behaviors: [
      "Each panel animates its grid row between 0fr and 1fr, so it opens to whatever its content measures without anyone measuring it.",
      "Opening a row closes the one that was open; clicking the open row closes it.",
      "Rows are real buttons with aria-expanded and aria-controls; closed panels are inert, so Tab never lands inside a hidden answer.",
      "Reduced motion: panels only fade and the caret flips without turning.",
    ],
  },
  "voice-bars": {
    usage: `import { VoiceBars } from "@/components/ui/voice-bars";

<VoiceBars className="text-foreground" />
<VoiceBars bars={20} className="h-5 text-primary" aria-label="Listening" />`,
    props: [
      { name: "bars", type: "number", default: "12", description: "How many bars." },
      { name: "duration", type: "number", default: "1", description: "Seconds for one loop of a bar through its four heights." },
      { name: "stagger", type: "number", default: "0.08", description: "Seconds between one bar starting and the next." },
      { name: "className", type: "string", description: "Merged onto the root; set the height (h-8 by default), gap and colour (text-*) here." },
    ],
    behaviors: [
      "Bars are currentColor, so they follow the text colour and the theme.",
      "Each bar has a fixed sequence of heights (no Math.random), so the server HTML matches the client.",
      "One CSS keyframe scales each bar from its bottom: transform only, no JavaScript per frame. It pauses while off screen.",
      "Decorative and hidden from screen readers, unless you pass aria-label (then it is an img).",
      "Reduced motion: the bars hold still at their first height and only pulse in opacity.",
    ],
  },
  "sticker-pop": {
    usage: `import { StickerPop } from "@/components/ui/sticker-pop";

<StickerPop src="/sticker.webp" rotate={-8} className="size-40" />

// a pile: stagger the pops, then leave in reverse
{stickers.map((src, i) => (
  <StickerPop key={src} src={src} rotate={tilts[i]} delay={0.1 + i * 0.2} out={leaving} outDelay={(stickers.length - 1 - i) * 0.05} />
))}`,
    props: [
      { name: "src", type: "string", description: "The sticker image. Nothing shows until it has loaded." },
      { name: "rotate", type: "number", default: "0", description: "The tilt in degrees the sticker settles into." },
      { name: "delay", type: "number", default: "0", description: "Seconds after load before it pops; stagger a pile with it." },
      { name: "out", type: "boolean", default: "false", description: "Plays the exit: shrink to 0.8, tilt 10deg further and fade." },
      { name: "outDelay", type: "number", default: "0", description: "Seconds before the exit starts; stagger a pile leaving." },
      { name: "alt", type: "string", default: '""', description: "Decorative by default; pass alt text when the sticker carries meaning." },
    ],
    behaviors: [
      "Pops only once the image has loaded (cached images included), so it never flashes an empty box; a broken image stays hidden.",
      "The pop is 0.55s from scale 0.85 and 10deg back to its tilt on an overshooting curve; the exit is a quicker 0.3s ease-out.",
      "Transform and opacity only, animated by motion; the only re-render is the one load.",
      "Reduced motion: a 0.2s fade at the final tilt and size, no scale or swing.",
    ],
  },
  "spring-chips": {
    usage: `import { SpringChips } from "@/components/ui/spring-chips";
import { Mic, Banknote } from "lucide-react";

<SpringChips
  className="grid h-[480px] w-[400px] place-items-center"
  chips={[
    { label: "Talk to your finances.", icon: <Mic className="text-white" />, iconBackground: "linear-gradient(135deg, #fb7185, #f97316)", className: "-left-8 top-36" },
    { label: "Wealth that grows with you.", icon: <Banknote className="text-white" />, iconBackground: "linear-gradient(135deg, #22c55e, #14b8a6)", className: "-right-8 bottom-28" },
  ]}
>
  <img src="/phone.png" alt="" className="h-96 -rotate-6" />
</SpringChips>`,
    props: [
      { name: "chips", type: "{ label, icon?, iconBackground?, className? }[]", description: "Each chip's label, an optional icon in a tile (iconBackground is any CSS background, e.g. a gradient), and position classes for where it sits (\"-left-8 top-36\")." },
      { name: "children", type: "ReactNode", description: "The centrepiece the chips gather around: a phone, a photo." },
      { name: "stagger", type: "number", default: "0.08", description: "Seconds between one chip popping in and the next." },
      { name: "chipClassName", type: "string", description: "Classes for every chip." },
    ],
    behaviors: [
      "Plays once, when 45% of the group is in view.",
      "Each chip springs up from 22px below and 82% scale (stiffness 220, damping 18), one after another.",
      "Chips are absolutely placed, so give the root a size and each chip position classes.",
      "Reduced motion: the chips are already in place and only fade in.",
    ],
  },
  "swap-card": {
    usage: `import { SwapCard } from "@/components/ui/swap-card";

<SwapCard
  image={<img src="/low-tide.jpg" alt="Low tide" className="size-full object-cover" />}
  hoverImage={<img src="/low-tide-detail.jpg" alt="" className="size-full object-cover" />}
  title="Low tide"
  subtitle="Giclée print"
  onClick={() => openProduct("low-tide")}
/>`,
    props: [
      { name: "image", type: "ReactNode", description: "What the card shows at rest, filling a 448:598 frame." },
      { name: "hoverImage", type: "ReactNode", description: "What it crossfades to on hover, keyboard focus or press." },
      { name: "title", type: "ReactNode", description: "The product name under the image." },
      { name: "subtitle", type: "ReactNode", description: "The quieter second line (type, price)." },
      { name: "badge", type: "boolean", default: "true", description: "The wobbly bag badge in the top-right corner." },
      { name: "className", type: "string", description: "Extra classes on the root button; other button props pass through." },
    ],
    behaviors: [
      "Hover crossfades to the second image (400ms) while the first zooms in and the second settles from 108% (900ms).",
      "The badge ring turns 30 degrees and inverts its colours; the title nudges 6px right.",
      "Keyboard focus shows the same state plus a focus ring; on touch the state shows while the finger is down, and hover never sticks after a tap.",
      "Pure CSS: no JavaScript, nothing per frame, identical server HTML.",
      "Reduced motion: the images still crossfade and the badge still inverts, but nothing zooms, turns or moves.",
    ],
  },
  "stroke-replay": {
    usage: `import { StrokeReplay } from "@/components/ui/stroke-replay";

<StrokeReplay className="max-w-[520px]">
  <svg viewBox="0 0 400 500">
    <rect data-static width="400" height="500" fill="#efe6da" />
    <circle cx="200" cy="220" r="90" fill="#d97a93" />
    <ellipse cx="200" cy="240" rx="60" ry="76" fill="#f0c3a3" />
  </svg>
</StrokeReplay>`,
    props: [
      { name: "children", type: "ReactNode", description: "One inline <svg>. Its direct children are the shapes, replayed in order; mark a background or texture layer data-static to keep it always shown." },
      { name: "duration", type: "number", default: "12000", description: "Milliseconds one replay takes, start to finished painting. The readout counts this time." },
      { name: "hold", type: "number", default: "1600", description: "Milliseconds the finished painting holds before the replay loops." },
      { name: "label", type: "ReactNode", default: '"Timelapse"', description: "Badge in the top-left corner; null hides it." },
      { name: "className", type: "string", description: "Size it here; the box keeps a 4:5 aspect ratio." },
    ],
    behaviors: [
      "Each shape scales up from 60% and fades in over 0.7s as the replay reaches it.",
      "It starts the first time 40% of it is on screen, pauses when it leaves, and loops after the hold.",
      "Play/pause button and a range scrubber (arrow keys work); scrubbing or pausing stops autoplay.",
      "Progress is written straight to the DOM, so playback never re-renders React.",
      "Reduced motion: it shows the finished painting and does not autoplay; shapes fade without scaling when you play or scrub.",
    ],
  },
  "sticky-crossfade": {
    usage: `import { StickyCrossfade } from "@/components/ui/sticky-crossfade";

<StickyCrossfade pictures={[<img key="a" src="/a.jpg" alt="" />, <img key="b" src="/b.jpg" alt="" />]}>
  <p data-pic-block>First block: the first picture.</p>
  <p data-pic-block>Second block: the picture changes as this passes the middle of the screen.</p>
</StickyCrossfade>

// inside a scrolling box: switch as blocks pass the middle of that box
const box = useRef<HTMLDivElement>(null);
<div ref={box} className="h-[600px] overflow-y-auto">
  <StickyCrossfade container={box} pictures={pictures}>{blocks}</StickyCrossfade>
</div>`,
    props: [
      { name: "pictures", type: "ReactNode[]", description: "One picture per block, in order; with fewer pictures than blocks they repeat. Each fills the picture box (object-cover)." },
      { name: "children", type: "ReactNode", description: "The text column. Mark each block that should switch the picture with data-pic-block." },
      { name: "pictureClassName", type: "string", description: "Size of the picture box: width, aspect ratio (3/4 by default), radius." },
      { name: "container", type: "RefObject<Element | null>", description: "Watch a scrolling box instead of the page: the picture switches as blocks pass the middle of that box." },
      { name: "className", type: "string", description: "Spacing around the whole two-column layout." },
    ],
    behaviors: [
      "The picture sticks at the vertical middle of the scroll area beside the text.",
      "Each time a data-pic-block's top crosses the middle, the next picture fades in over 800ms while settling from 1.02 to 1 scale.",
      "One IntersectionObserver watches the top half of the scroll root, so nothing runs per scroll event.",
      "Narrower than 48rem (a container query, not the viewport) it stacks and shows the first picture only, in flow.",
      "Reduced motion: a shorter 300ms plain crossfade with no scale.",
    ],
  },
  "announce-strip": {
    usage: `import { AnnounceStrip } from "@/components/ui/announce-strip";

const [open, setOpen] = useState(true);

<header className="sticky top-0 z-50">
  <AnnounceStrip open={open} onDismiss={() => setOpen(false)}>
    <span className="px-4 py-1.5">Built for the Agent Harness Hackathon</span>
  </AnnounceStrip>
  <nav>...</nav>
</header>`,
    props: [
      { name: "children", type: "ReactNode", description: "One copy of the line. It is repeated to fill the width, so put the gap (padding) inside." },
      { name: "duration", type: "number", default: "40", description: "Seconds for one copy of the line to pass." },
      { name: "open", type: "boolean", default: "true", description: "Shown or put away by the parent; closing slides it up and closes its row." },
      { name: "onDismiss", type: "() => void", description: "Adds a close button on the right that calls this." },
      { name: "hideOnScroll", type: "boolean", default: "true", description: "Put the strip away while scrolling down and bring it back on the way up." },
      { name: "container", type: "RefObject<HTMLElement | null>", default: "the page", description: "Follow a scrolling box instead of the page." },
      { name: "className", type: "string", description: "Extra classes on the root (default bg-primary text-primary-foreground)." },
    ],
    behaviors: [
      "Two identical halves of the track move by exactly -50% with the Web Animations API: transform only, seamless, no layout reads per frame.",
      "Copies are added to fill the width (ResizeObserver), so a short line never leaves a gap.",
      "Pauses off screen, under the mouse and while the close button has focus; a tap never leaves it stuck paused.",
      "Scrolling down 48px past the top slides it up and closes its row so the header takes its place; scrolling up 48px brings it back.",
      "Screen readers and Tab get the line once; the repeats are inert, and a closed strip is inert.",
      "Reduced motion: the line stands still and the strip fades instead of sliding while its row closes.",
    ],
  },
};
