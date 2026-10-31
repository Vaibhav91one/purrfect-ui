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
    ],
    behaviors: ["Every word starts faint and turns solid in reading order.", "Finishes when the text is centred on screen.", "One CSS variable carries the progress, so a long paragraph costs one style write per frame.", "Reduced motion: the whole text is solid."],
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
  "stat-rotator": {
    usage: `import { StatRotator } from "@/components/ui/stat-rotator";

<StatRotator
  stats={[
    { value: "3.2x", label: "Faster savings growth" },
    { value: "$1.2M", label: "Saved in year one" },
    { value: "98%", label: "Hit their monthly goal" },
  ]}
/>`,
    props: [
      { name: "stats", type: "{ value: string; label: ReactNode; description?: ReactNode }[]", description: 'value holds one number ("3.2x", "$1.2M", "12,400"); the number counts up, the prefix and suffix stay put. A value with no number shows as text.' },
      { name: "interval", type: "number", default: "3.6", description: "Seconds each stat stays up before the next rises in." },
      { name: "className", type: "string", description: "Classes on the root (card plus dots)." },
    ],
    behaviors: [
      "Every interval the card lifts out 38px and the next rises in from below (0.45s).",
      "The number counts up from 0 over 2.2s on odometer digit columns, driven by one motion value (no re-render per frame).",
      "Rotation pauses on mouse hover, while focus is inside, and while the card is off screen.",
      "Pill dots are buttons that jump to a stat; the current one stretches and has aria-current.",
      "Silent to screen readers while it rotates by itself; once a dot is used, each new stat is announced once, never the counting digits.",
      "Reduced motion: cards cross-fade in place and the number shows its final value.",
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
};
