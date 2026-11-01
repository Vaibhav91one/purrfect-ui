// One entry per component that exists on the site it was lifted from. `target` is a CSS selector for the component on
// the live page; `interact` is what the cursor does to it once the camera has settled ("hover" or "click"); `site`
// overrides SITE for components lifted from another site.
export const SITE = "https://vaibhavtomar.com";
export const ARMOUR = "https://armour.vaibhavtomar.com";
export const MAPINLY = "https://mapinly.vaibhavtomar.com";
export const POINU = "https://poinu.vercel.app";
// Mapinly asks for a language once per browser; every Mapinly clip marks it answered
const ML = { hasSeenLocaleDialog: "true" };
// Poinu marks its loader and gallery intro seen per tab
const PS = { "poinu-loader": "1", "poinu-gallery": "1" };
export const BOUNTYDESK = "https://bountydesk.vaibhav.quest";
// interact: hover | click (toggle: seconds until a second click) | scroll (target scrolled through the viewport) | load (the
// page's own entrance; start is a page expression that turns true on its first frame; focus + zoom aim the camera).
// zoom overrides the automatic camera push; seconds the length. session: sessionStorage flags preset before the page loads
// (the site's intro marked seen; default the portfolio's seenPreloader); fresh: true sets none, so the intro plays.
// the first frame of Armour's own entrance: its nav is mounted but still at opacity 0, so the notch drop is in the clip
const NAV_MOUNTED = "(() => { const n = document.querySelector('nav[role=navigation]'); return !!n && getComputedStyle(n).opacity === '0'; })()";
// the notch clip starts once the hero has finished opening and the nav is still hidden, so it opens on the real page with no notch and the drop follows
const NOTCH_NEXT = "(() => { const n = document.querySelector('nav[role=navigation]'); const h = document.querySelector('section .origin-center'); return !!n && getComputedStyle(n).opacity === '0' && !!h && (h.style.transform === 'none' || h.style.transform === ''); })()";

export const CLIPS = {
  "roll-button": { site: ARMOUR, target: 'section button[data-slot="button"]', interact: "hover", label: "armour.vaibhavtomar.com" },
  notch: { site: ARMOUR, interact: "load", start: NOTCH_NEXT, focus: "nav[role=navigation]", push: 1.6, zoom: 2.2, stay: 1.4, label: "armour.vaibhavtomar.com" },
  "hero-reveal": { site: ARMOUR, interact: "load", start: NAV_MOUNTED, seconds: 3.6, label: "armour.vaibhavtomar.com" },
  "layered-menu": { site: ARMOUR, target: 'button[aria-label$=" menu"]', interact: "click", realtime: true, toggle: 2.6, stay: 3.9, zoom: 1, label: "armour.vaibhavtomar.com" },
  "hover-preview": { target: 'a[class*="border-gray-300"]', interact: "hover", label: "vaibhavtomar.com" },
  "roll-link": { target: 'nav a[style*="perspective"]', interact: "hover", label: "vaibhavtomar.com" },
  "scroll-marquee": { target: 'p[class*="lg:text-[200px]"]', interact: "scroll", label: "vaibhavtomar.com" },
  "curtain-reveal": { target: 'div[style*="clip-path"]', interact: "scroll", label: "vaibhavtomar.com" },
  // fresh: the site's own intro plays (the capture otherwise marks it seen); 5s of words, a 0.3s pause, a 1s lift
  preloader: { interact: "load", fresh: true, start: "!!document.querySelector('.fixed.inset-0.bg-black')", seconds: 6.8, label: "vaibhavtomar.com" },
  "cursor-follower": { target: ".titleAbout", interact: "hover", label: "vaibhavtomar.com" },
  // Mapinly: its own intro plays for these two (fresh); the star rises after the preloader opens its gate
  "load-preloader": { site: MAPINLY, interact: "load", fresh: true, realtime: true, start: "!!document.querySelector('.preloader')", seconds: 3.6, local: ML, label: "mapinly.vaibhavtomar.com" },
  "star-rise": { site: MAPINLY, interact: "load", fresh: true, start: "(() => { const e = document.querySelector('main > section:first-of-type [data-intro]'); if (!e) return false; const t = getComputedStyle(e).transform; return t !== 'none' && new DOMMatrix(t).m42 < innerHeight * 0.98; })()", seconds: 4.2, local: ML, label: "mapinly.vaibhavtomar.com" },
  "marquee-rows": { site: MAPINLY, target: 'div.cursor-pointer[class*="h-[8rem]"]', interact: "hover", session: { "mapinly-intro": "1" }, local: ML, label: "mapinly.vaibhavtomar.com" },
  "peek-card": { site: MAPINLY, target: "[data-slot=carousel-item]:first-child", interact: "hover", session: { "mapinly-intro": "1" }, local: ML, label: "mapinly.vaibhavtomar.com" },
  // Poinu: the intro skipped (session) except for counter-loader, which plays its own; on / it hands off into the gallery,
  // so it is recorded landing on /about, where it wipes and lifts like the component
  "counter-loader": { site: `${POINU}/about`, interact: "load", fresh: true, realtime: true, start: "!!document.querySelector('.ui-ld')", seconds: 3.4, label: "poinu.vercel.app" },
  "sticker-cover": { site: POINU, target: 'nav[aria-label="Primary"] a:not([aria-current])', interact: "click", realtime: true, stay: 2.2, zoom: 1, session: PS, label: "poinu.vercel.app" },
  "inertia-gallery": { site: POINU, target: '[role=group][aria-label="Work view"] button:last-child', interact: "click", realtime: true, stay: 2.4, zoom: 1, session: PS, label: "poinu.vercel.app" },
  "fit-title": { site: `${POINU}/shop`, interact: "load", realtime: true, start: "!!document.querySelector('h1.ui-mk')", seconds: 2.5, session: PS, label: "poinu.vercel.app" },
  // Armour, batch 3
  "fan-out-cards": { site: ARMOUR, target: 'article[class*="min-h-[104px]"]', interact: "scroll", seconds: 4, label: "armour.vaibhavtomar.com" },
  "shimmer-text": { site: ARMOUR, target: ".rounded-full > span.bg-clip-text", interact: "hover", label: "armour.vaibhavtomar.com" },
  "photo-wordmark": { site: ARMOUR, target: "footer h1:not([aria-hidden])", interact: "scroll", label: "armour.vaibhavtomar.com" },
  // batch 4-5 (drawer-menu has no clip: the portfolio shows its burger only at phone width)
  "quote-cycle": { target: "#projects p.animated-text", interact: "hover", stay: 4.5, label: "vaibhavtomar.com" },
  "column-hop": { site: BOUNTYDESK, target: 'div[class*="border-border/50"][class*="bg-card"] > div.grid-cols-3', interact: "hover", realtime: true, stay: 3.6, label: "bountydesk.vaibhav.quest" },
  "line-rise": { site: MAPINLY, target: "main > section:nth-of-type(2)", interact: "scroll", session: { "mapinly-intro": "1" }, local: ML, label: "mapinly.vaibhavtomar.com" },
  "flip-text": { target: 'nav p[class*="leading-relaxed"]', interact: "hover", label: "vaibhavtomar.com" },
  "spin-mark": { site: MAPINLY, target: "footer .origin-center svg", interact: "scroll", session: { "mapinly-intro": "1" }, local: ML, label: "mapinly.vaibhavtomar.com" },
  "arrow-link": { site: `${POINU}/work/31`, target: 'small + a[href^="/work/"]', interact: "hover", realtime: true, stay: 2.2, zoom: 1, session: PS, label: "poinu.vercel.app" },
  "fill-button": { target: '[class*="isolate"][class*="rounded-full"]', interact: "hover", label: "vaibhavtomar.com" },
  "scroll-reveal": { site: ARMOUR, target: 'p[class*="flex-wrap"][class*="leading-[1.1]"]', interact: "scroll", seconds: 4.5, endAt: 0.12, label: "armour.vaibhavtomar.com" },
};
