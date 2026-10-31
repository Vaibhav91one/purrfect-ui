"use client";

import { Rocket } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { RollButton as Button } from "@/registry/roll-button/roll-button";
import { Counter } from "@/registry/counter/counter";
import { HeroReveal } from "@/registry/hero-reveal/hero-reveal";
import { LayeredMenu } from "@/registry/layered-menu/layered-menu";
import { Magnetic } from "@/registry/magnetic/magnetic";
import { Notch } from "@/registry/notch/notch";
import { PathCarousel } from "@/registry/path-carousel/path-carousel";
import { ParallaxColumns } from "@/registry/parallax-columns/parallax-columns";
import { ScrollReveal } from "@/registry/scroll-reveal/scroll-reveal";
import { GlideTabs as Tabs } from "@/registry/glide-tabs/glide-tabs";
import { StretchSwitch as Toggle } from "@/registry/stretch-switch/stretch-switch";
import { CurtainReveal } from "@/registry/curtain-reveal/curtain-reveal";
import { CursorFollower } from "@/registry/cursor-follower/cursor-follower";
import { ScrollMarquee } from "@/registry/scroll-marquee/scroll-marquee";
import DisplacementDemo from "@/registry/displacement/demo";
import FillButtonDemo from "@/registry/fill-button/demo";
import HoverPreviewDemo from "@/registry/hover-preview/demo";
import PreloaderDemo from "@/registry/preloader/demo";
import LoadPreloaderDemo from "@/registry/load-preloader/demo";
import StarRiseDemo from "@/registry/star-rise/demo";
import MarqueeRowsDemo from "@/registry/marquee-rows/demo";
import PeekCardDemo from "@/registry/peek-card/demo";
import CounterLoaderDemo from "@/registry/counter-loader/demo";
import StickerCoverDemo from "@/registry/sticker-cover/demo";
import InertiaGalleryDemo from "@/registry/inertia-gallery/demo";
import FitTitleDemo from "@/registry/fit-title/demo";
import FanOutCardsDemo from "@/registry/fan-out-cards/demo";
import StatRotatorDemo from "@/registry/stat-rotator/demo";
import ShimmerTextDemo from "@/registry/shimmer-text/demo";
import { PhotoWordmark } from "@/registry/photo-wordmark/photo-wordmark";
import RollLinkDemo from "@/registry/roll-link/demo";
import { useTick } from "./use-tick";

/** What the dialog hands every demo: the Loop switch, the Speed slider and the component's own extras. `playing` undefined = a still card. */
export type DemoProps = { playing?: boolean; speed: number; opts: Record<string, string | boolean> };

const label = "text-sm text-muted-foreground";

function ToggleDemo({ playing, speed }: DemoProps) {
  const n = useTick(playing, speed, 1500);
  const [pick, setPick] = useState<{ at: number; on: boolean } | null>(null); // the person's last click, good until the loop's next step
  const on = pick?.at === n ? pick.on : n % 2 === 0;
  return (
    <div className="flex flex-col items-center gap-3">
      <Toggle label="Notifications" checked={on} onCheckedChange={(v) => setPick({ at: n, on: v })} />
      <span className={label}>Notifications {on ? "on" : "off"}</span>
    </div>
  );
}

const TARGETS = [100, 2480, 37, 9999, 512];
function CounterDemo({ playing, speed }: DemoProps) {
  const n = useTick(playing, speed, 2400);
  const [bump, setBump] = useState(0);
  return (
    <button type="button" onClick={() => setBump((b) => b + 1)} aria-label="Next number">
      <Counter value={TARGETS[(n + bump) % TARGETS.length]} className="text-8xl font-semibold tracking-tight" />
    </button>
  );
}

const TABS = ["Preview", "Code", "Docs"];
function TabsDemo({ playing, speed }: DemoProps) {
  const n = useTick(playing, speed, 1700);
  const [pick, setPick] = useState<{ at: number; tab: string } | null>(null); // a click holds until the loop's next step, then the loop carries on
  const active = pick?.at === n ? pick.tab : TABS[n % TABS.length];
  return <Tabs tabs={TABS} value={active} onValueChange={(tab) => setPick({ at: n, tab })} className="text-lg" />;
}

function ButtonLoop({ playing, speed, opts }: DemoProps) {
  const n = useTick(playing, speed, 1500) % 2;
  return (
    <Button variant={opts.variant === "Ghost" ? "ghost" : "solid"} size={opts.size === "Large" ? "lg" : "md"} data-hover={n === 1 ? "true" : undefined} data-cuelume-tap="" icon={<Rocket className="size-4" />}>
      Ship it
    </Button>
  );
}

const SCENERY = "/demo/scenery.jpg"; // the Armour hero's photo; the live clip shows the rest of the hero
// demo photos in public/demo (Unsplash licence, via picsum.photos): real images instead of flat placeholders
const PHOTOS = ["fjord", "canyon", "cliffs", "storm", "valley", "coast", "city", "jellyfish", "field", "canal", "hiker", "dunes"];
// eslint-disable-next-line @next/next/no-img-element -- demo art; the registry components take plain <img> too
const photo = (i: number, className = "") => <img src={`/demo/${PHOTOS[i % PHOTOS.length]}.jpg`} alt="" className={`size-full object-cover ${className}`} />;
const frame = "relative h-[282px] w-96 overflow-hidden rounded-2xl bg-[#0E7DDA] bg-[url(/demo/valley.jpg)] bg-cover bg-center"; // a photo over Armour's blue (shown while it loads); 1.364 is the clip stage's ratio
const pageFrame = "relative size-full overflow-hidden rounded-[64px] bg-white"; // a full-page demo is drawn at a page's size and scaled down; the card's stage supplies the padding

/** Notch drops in once on mount, so the loop remounts it to replay the drop. */
function NotchLoop({ playing, speed }: DemoProps) {
  const n = useTick(playing, speed, 3200);
  return (
    <div className={frame}>
      <Notch key={n} delay={0.15} color="#fff">
        <span className="text-2xl font-medium text-[#1B1B1B]">ARMOUR</span>
      </Notch>
    </div>
  );
}

/** HeroReveal is a full-page hero, so it is drawn at a full page's size (see `nat`) and the card or dialog scales it down. Only the photo frame opening is shown; the text and action are in the clip. It plays once when it scrolls into view, so the loop remounts it to replay. */
function HeroLoop({ playing, speed }: DemoProps) {
  const n = useTick(playing, speed, 3600);
  return (
    <div className="relative size-full overflow-hidden rounded-[64px]">
      <HeroReveal key={n} className="h-full min-h-0! p-0!" src={SCENERY} title={null} />
    </div>
  );
}

/** The menu fills a full page, so it is drawn at a full page's size (see `nat`), on a white page with some text. The loop opens and shuts it while nobody is around; a click on the burger is the person's and the loop stays out of the way. A still card keeps it closed. */
function MenuLoop({ playing, speed }: DemoProps) {
  const n = useTick(playing, speed, 4200);
  const [pick, setPick] = useState<{ at: number; open: boolean } | null>(null); // the person's last click, good until the loop's next step
  const open = pick?.at === n ? pick.open : n % 2 === 1;
  return (
    <div className={`${pageFrame} !bg-[#F4F1DE]`}>
      <div className="absolute inset-0 grid place-content-center gap-6 px-40 text-center text-neutral-900">
        <p className="text-8xl font-medium tracking-tight">Your wealth,<br />finally working.</p>
        <p className="mx-auto max-w-3xl text-3xl text-neutral-500">The AI finance app that tracks your spending and tells you what to do next.</p>
      </div>
      <LayeredMenu contained delay={0.2} color="#171717" open={open} onOpenChange={(o) => setPick({ at: n, open: o })} logo={<span className="font-medium tracking-tight">ARMOUR</span>} primary={[{ label: "Experience", href: "#a" }, { label: "Technology", href: "#b" }, { label: "Company", href: "#c" }]} secondary={[{ label: "Features", href: "#d" }, { label: "FAQ", href: "#e" }]} />
    </div>
  );
}

const PULL = { Soft: 0.3, Medium: 0.6, Full: 1 } as const;

/** Magnetic is pointer-driven, so the loop plays a fake cursor over it: real pointer events at the wrapper, so it runs the component's own code path. */
function MagneticLoop({ playing, speed, opts }: DemoProps) {
  const stage = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const box = stage.current;
    const wrap = box?.querySelector("span");
    const cur = dot.current;
    if (!playing || !box || !wrap || !cur) return;
    let raf = 0;
    let inside = false;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (((now - t0) / 1000) * speed) % 5; // 3.4s over it, 1.6s away
      const r = box.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const over = t < 3.4;
      const x = over ? cx + Math.cos(t * 1.7) * 70 : cx + 150;
      const y = over ? cy + Math.sin(t * 2.3) * 14 : cy - 60;
      cur.style.transform = `translate(${x - r.left}px, ${y - r.top}px)`;
      cur.style.opacity = over ? "1" : "0.35";
      if (over) {
        wrap.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y, pointerType: "mouse" }));
        inside = true;
      } else if (inside) {
        wrap.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
        inside = false;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      wrap.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
    };
  }, [playing, speed]);
  return (
    <div ref={stage} className="relative grid h-48 w-80 place-items-center">
      <Magnetic strength={PULL[opts.strength as keyof typeof PULL] ?? 1}>
        <span className="block rounded-full bg-foreground px-6 py-3 text-background">Get in touch</span>
      </Magnetic>
      {playing && <span ref={dot} aria-hidden className="pointer-events-none absolute top-0 left-0 -mt-1.5 -ml-1.5 size-3 rounded-full bg-accent opacity-0 ring-4 ring-accent/25" />}
    </div>
  );
}

/** A small scrolling box that drives scroll-linked components: it eases up and down on its own while playing, and scrolls by hand when paused. */
function ScrollBox({ playing, speed, children, boxRef, className }: { playing?: boolean; speed: number; children: ReactNode; boxRef: RefObject<HTMLDivElement | null>; className?: string }) {
  useEffect(() => {
    const box = boxRef.current;
    if (!playing || !box) return;
    let raf = 0;
    const t0 = performance.now();
    const from = box.scrollTop;
    const tick = (now: number) => {
      const max = box.scrollHeight - box.clientHeight;
      box.scrollTop = from + (max * (1 - Math.cos(((now - t0) / 6000) * speed * Math.PI * 2))) / 2 - (max * (1 - Math.cos(0))) / 2;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, boxRef]);
  return (
    <div
      ref={boxRef}
      className={cn("relative h-72 w-full max-w-md overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
    >
      {children}
    </div>
  );
}

function RevealLoop({ playing, speed }: DemoProps) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <ScrollBox playing={playing} speed={speed} boxRef={box}>
      <div className="h-56" />
      <ScrollReveal text="Scroll and the words fill in, one after another." className="text-center text-3xl font-light tracking-tight" container={box} offset={["start 0.9", "start 0.3"]} />
      <div className="h-56" />
    </ScrollBox>
  );
}

function ParallaxLoop({ playing, speed }: DemoProps) {
  const box = useRef<HTMLDivElement>(null);
  const tile = (n: number) => <div key={n} className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">{photo(n)}</div>;
  return (
    <ScrollBox playing={playing} speed={speed} boxRef={box}>
      <div className="h-20" />
      <ParallaxColumns container={box} speeds={[0.3, 0.55, 0.15]} columns={[[1, 2, 3].map(tile), [4, 5, 6].map(tile), [7, 8, 9].map(tile)]} />
      <div className="h-20" />
    </ScrollBox>
  );
}

// the box scrolls the marquee into view under a "Scroll" hint, and it flips each time the loop turns back up
function MarqueeLoop({ playing, speed }: DemoProps) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <ScrollBox playing={playing} speed={speed} boxRef={box} className="h-full max-w-none">
      <div className="grid h-full place-items-center text-3xl text-muted-foreground">↓ Scroll</div>
      <div className="flex h-full items-center">
        <ScrollMarquee container={box} className="w-full">
          <p className="pr-16 text-8xl font-medium whitespace-nowrap">Scroll to flip me —</p>
        </ScrollMarquee>
      </div>
    </ScrollBox>
  );
}

// the box scrolls the footer in, so the word rises out of its crop and the photo drifts, then back
function WordmarkLoop({ playing, speed }: DemoProps) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <ScrollBox playing={playing} speed={speed} boxRef={box} className="h-full max-w-none">
      <div className="grid h-full place-items-center text-3xl text-muted-foreground">↓ Scroll</div>
      <div className="h-1/3" />
      <footer className="overflow-hidden rounded-3xl border border-border bg-card px-10 pt-10 text-card-foreground">
        <div className="grid grid-cols-3 gap-8 text-lg">
          <p className="font-medium">Armour</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>Shop</li>
            <li>Journal</li>
          </ul>
          <ul className="space-y-1 text-muted-foreground">
            <li>Instagram</li>
            <li>Contact</li>
          </ul>
        </div>
        <PhotoWordmark text="ARMOUR" src="/demo/field.jpg" container={box} className="mt-12 font-black tracking-tight" />
      </footer>
    </ScrollBox>
  );
}

// sticky works inside a scrolling box as it does on the page, so this is the real component
function CurtainLoop({ playing, speed }: DemoProps) {
  const box = useRef<HTMLDivElement>(null);
  return (
    <ScrollBox playing={playing} speed={speed} boxRef={box}>
      <section className="grid h-72 place-items-center bg-muted text-3xl">Scroll down</section>
      <CurtainReveal height="18rem" className="grid place-items-center">
        <p className="text-4xl font-medium">Let&apos;s work together</p>
      </CurtainReveal>
    </ScrollBox>
  );
}

const PATH_ITEMS = ["Fjord", "Canyon", "Cliffs", "Coast", "Dunes"].map((name) => (
  <div key={name} className="relative size-full overflow-hidden rounded-[32px] bg-muted">
    {photo(PHOTOS.indexOf(name.toLowerCase()))}
    {/* check-ignore: hardcoded-color white label over a photo, in either theme */}
    <span className="absolute bottom-4 left-5 text-xl font-light text-white drop-shadow">{name}</span>
  </div>
));

function PathLoop({ playing, speed }: DemoProps) {
  const n = useTick(playing, speed, 1800);
  return (
    <div className="h-[300px] w-[560px]">
      <PathCarousel items={PATH_ITEMS} active={playing === undefined ? 0 : n % PATH_ITEMS.length} itemWidth={180} itemHeight={132} />
    </div>
  );
}

/**
 * The follower is position: fixed, and the preview is scaled to fit (a scaled parent traps fixed children), so the real one
 * is portalled out: into the dialog (top layer) or the page. A card is inert, so it shows a still dot instead.
 */
function CursorLoop() {
  const stage = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => {
    const el = stage.current!;
    setHost(el.closest("dialog") ?? (el.closest("[inert]") ? null : document.body));
  }, []);
  return (
    <div ref={stage} className="relative grid h-64 w-96 grid-cols-2 overflow-hidden rounded-2xl text-lg">
      <div className="grid place-items-center bg-muted">Page</div>
      <div className="grid place-items-center bg-foreground text-background">Inverted</div>
      <a href="#grow" onClick={(e) => e.preventDefault()} data-cursor-scale="4" className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-foreground bg-background px-5 py-2 text-sm whitespace-nowrap">
        Hover me: it grows
      </a>
      {host ? createPortal(<CursorFollower />, host) : <span className="absolute top-1/2 left-1/2 size-10 -translate-1/2 rounded-full bg-white mix-blend-difference" />}
    </div>
  );
}

export const DEMOS: Record<string, (p: DemoProps) => ReactNode> = {
  "roll-button": ButtonLoop,
  magnetic: MagneticLoop,
  notch: NotchLoop,
  "hero-reveal": HeroLoop,
  "layered-menu": MenuLoop,
  "stretch-switch": ToggleDemo,
  counter: CounterDemo,
  "glide-tabs": TabsDemo,
  "scroll-reveal": RevealLoop,
  "parallax-columns": ParallaxLoop,
  "path-carousel": PathLoop,
  displacement: DisplacementDemo,
  "hover-preview": HoverPreviewDemo,
  "scroll-marquee": MarqueeLoop,
  "roll-link": RollLinkDemo,
  "curtain-reveal": CurtainLoop,
  preloader: PreloaderDemo,
  "load-preloader": LoadPreloaderDemo,
  "star-rise": StarRiseDemo,
  "marquee-rows": MarqueeRowsDemo,
  "peek-card": PeekCardDemo,
  "counter-loader": CounterLoaderDemo,
  "sticker-cover": StickerCoverDemo,
  "inertia-gallery": InertiaGalleryDemo,
  "fit-title": FitTitleDemo,
  "fan-out-cards": FanOutCardsDemo,
  "stat-rotator": StatRotatorDemo,
  "shimmer-text": ShimmerTextDemo,
  "photo-wordmark": WordmarkLoop,
  "cursor-follower": CursorLoop,
  "fill-button": FillButtonDemo,
};
