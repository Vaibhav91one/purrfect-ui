/** What the dialog's Usage tab shows. Keep each entry in step with its file in `registry/`. */
export type Doc = {
  usage?: string;
  props?: { name: string; type: string; default?: string; description: string }[];
  behaviors: string[];
};

export const DOCS: Record<string, Doc> = {
  button: {
    usage: `import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

<Button icon={<Rocket className="size-4" />}>Ship it</Button>
<Button variant="ghost" href="/docs">Read the docs</Button>`,
    props: [
      { name: "variant", type: '"solid" | "ghost"', default: '"solid"', description: "Filled, or an outline." },
      { name: "size", type: '"md" | "lg"', default: '"md"', description: "46px tall, or 64px with wider padding." },
      { name: "href", type: "string", description: "Renders an <a> instead of a <button>." },
      { name: "icon", type: "ReactNode", description: "Sits before or after the label." },
      { name: "iconPosition", type: '"start" | "end"', default: '"start"', description: "Which side the icon goes." },
      { name: "wide", type: "boolean", description: "Full width, with vertical margin." },
      { name: "cue", type: '"tap" | "navigate" | "open" | "toggle"', default: '"tap"', description: "Cuelume sound played on click." },
      { name: "forceHover", type: "boolean", description: "Shows the hover state without a pointer." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    behaviors: [
      "A string label rolls up letter by letter, starting from the middle; the old letter fades out as the new one fades in.",
      "Lifts 2px on hover and presses down to 97%.",
      "Hover motion only runs on devices that can hover.",
      "Plays its sound cue on click when Cuelume is running.",
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
      { name: "color", type: "string", default: '"#fff"', description: "Fill of the tab and of its two shoulders. Any CSS colour." },
      { name: "radius", type: "number", default: "32", description: "Radius of the lower corners and size of the shoulders, in px." },
      { name: "delay", type: "number", default: "1.05", description: "Seconds before the tab drops in." },
      { name: "offset", type: "number", default: "0", description: "Gap in px between the container's top edge and the tab." },
      { name: "className", type: "string", description: "Classes for the positioning wrapper (absolute, full width)." },
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
      { name: "className", type: "string", description: "Classes for the section: height, max width." },
    ],
    behaviors: [
      "When the hero first scrolls into view, the photo frame opens from the middle along the y-axis (0.9s).",
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
      { name: "activeColor", type: "string", default: "#F4F1DE", description: "Their colour while the menu is open, over the panels." },
      { name: "contained", type: "boolean", default: "false", description: "Fill the nearest relative parent instead of the screen." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Start open." },
      { name: "open", type: "boolean", description: "Controlled state, with onOpenChange." },
      { name: "delay", type: "number", default: "1.62", description: "Seconds before the burger lines draw in on first paint." },
      { name: "className", type: "string", description: "Classes for the burger button's position." },
    ],
    behaviors: [
      "Reduced motion: the panels and links fade, nothing slides or blurs.",
      "Four panels drop from the top in turn; the front one carries the links, which fade up out of a blur one after another.",
      "The burger turns into an X and a Close label slides in; both are cream over the panels (`activeColor`) and take `color` while shut. Closing runs the panels back up, front one first.",
      "Escape or picking a link closes it (the Escape is the menu's: a dialog around it stays open). Focus moves into the menu and returns to the burger; Tab stays inside while it is open.",
      "Locks page scroll while open (not when contained). The front panel is a dialog.",
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
    behaviors: ["Every word starts faint and turns solid in reading order.", "Finishes when the text is centred on screen.", "Reduced motion: the whole text is solid."],
  },
  "parallax-columns": {
    usage: `import { ParallaxColumns } from "@/components/ui/parallax-columns";

<ParallaxColumns columns={[colA, colB, colC]} speeds={[0.12, 0.22, 0.05]} />`,
    props: [
      { name: "columns", type: "[ReactNode[], ReactNode[], ReactNode[]]", description: "The items in each of the three columns." },
      { name: "speeds", type: "[number, number, number]", default: "[0.12, 0.22, 0.05]", description: "Viewport heights each column starts below its place." },
      { name: "className", type: "string", description: "Extra classes on the wrapper." },
      { name: "container", type: "RefObject<HTMLElement>", description: "Follow a scrolling box instead of the page." },
    ],
    behaviors: ["Columns rise into line at different rates as the section scrolls in.", "A spring eases each column toward its scroll position; native scrolling is untouched.", "Reduced motion: a plain static grid."],
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
      { name: "className", type: "string", description: "Extra classes on the root. It fills its parent, so give the parent a height." },
    ],
    behaviors: ["Scroll over it, swipe, press the arrow keys or click a neighbour to rotate.", "With 3+ items it loops.", "A spring moves the rotation and it never overshoots.", "Wheel and arrows only count while the pointer is over it or it is mid-screen, so the page still scrolls.", "Tab to an item and press Enter or Space to bring it to the centre.", "Reduced motion: jumps instead of gliding."],
  },
  toggle: {
    usage: `import { Toggle } from "@/components/ui/toggle";

// uncontrolled
<Toggle label="Notifications" defaultChecked />

// controlled
const [on, setOn] = useState(false);
<Toggle label="Dark mode" checked={on} onCheckedChange={setOn} />`,
    props: [
      { name: "label", type: "string", description: "The switch's accessible name. There is no visible text inside it, so say what it turns on." },
      { name: "checked", type: "boolean", description: "Controlled value. Leave it out and the switch keeps its own state." },
      { name: "defaultChecked", type: "boolean", default: "false", description: "Starting value when uncontrolled." },
      { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the new value on every flip." },
      { name: "disabled", type: "boolean", description: "Dims it and ignores clicks." },
      { name: "className", type: "string", description: "Extra classes on the root." },
    ],
    behaviors: [
      "Reduced motion: the knob jumps and only the colour fades.",
      "One spring moves the knob and its own speed drives the stretch, so the knob stretches as it travels and settles flat.",
      "Flipping it again mid-way carries on from where the knob is, with no restart.",
      "Space and Enter flip it; it is a real button with role switch.",
      "Fixed 112px by 64px and never shrinks inside a flex row.",
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
  tabs: {
    usage: `import { Tabs } from "@/components/ui/tabs";

const [tab, setTab] = useState("Preview");
<Tabs tabs={["Preview", "Code", "Docs"]} value={tab} onValueChange={setTab} />
{tab === "Code" ? <Source /> : <Preview />}`,
    props: [
      { name: "tabs", type: "string[]", description: "The tab labels, in order. Each label is also its value, so keep them unique." },
      { name: "value", type: "string", description: "Controlled value. Leave it out and the tabs keep their own state." },
      { name: "defaultValue", type: "string", description: "Starting tab when uncontrolled. Defaults to the first." },
      { name: "onValueChange", type: "(value: string) => void", description: "Called when another tab is picked." },
      { name: "label", type: "string", default: '"Tabs"', description: "Accessible name for the tab list." },
      { name: "className", type: "string", description: "Size comes from here, e.g. text-lg." },
    ],
    behaviors: [
      "Reduced motion: the pill moves instantly.",
      "A pill glides under the active label on one spring, and picking another tab mid-glide carries on from where it is.",
      "Arrow keys, Home and End move between tabs, with one tab stop (roving tabindex).",
      "It renders the tab bar only: show your own panel for the selected value.",
      "A long list scrolls inside its own rounded bar rather than breaking the page.",
    ],
  },
};
