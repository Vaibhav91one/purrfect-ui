// One entry per component that exists on the site it was lifted from. `target` is a CSS selector for the component on
// the live page; `interact` is what the cursor does to it once the camera has settled ("hover" or "click"); `site`
// overrides SITE for components lifted from another site.
export const SITE = "https://vaibhavtomar.com";
export const ARMOUR = "https://armour.vaibhavtomar.com";
// interact: hover | click (toggle: seconds until a second click) | scroll (target scrolled through the viewport) | load (the
// page's own entrance; start is a page expression that turns true on its first frame; focus + zoom aim the camera).
// zoom overrides the automatic camera push; seconds the length.
// the first frame of Armour's own entrance: its nav is mounted but still at opacity 0, so the notch drop is in the clip
const NAV_MOUNTED = "(() => { const n = document.querySelector('nav[role=navigation]'); return !!n && getComputedStyle(n).opacity === '0'; })()";
// the notch clip starts once the hero has finished opening and the nav is still hidden, so it opens on the real page with no notch and the drop follows
const NOTCH_NEXT = "(() => { const n = document.querySelector('nav[role=navigation]'); const h = document.querySelector('section .origin-center'); return !!n && getComputedStyle(n).opacity === '0' && !!h && (h.style.transform === 'none' || h.style.transform === ''); })()";

export const CLIPS = {
  button: { site: ARMOUR, target: 'section button[data-slot="button"]', interact: "hover", label: "armour.vaibhavtomar.com" },
  notch: { site: ARMOUR, interact: "load", start: NOTCH_NEXT, focus: "nav[role=navigation]", push: 1.6, zoom: 2.2, stay: 1.4, label: "armour.vaibhavtomar.com" },
  "hero-reveal": { site: ARMOUR, interact: "load", start: NAV_MOUNTED, seconds: 3.6, label: "armour.vaibhavtomar.com" },
  "layered-menu": { site: ARMOUR, target: 'button[aria-label$=" menu"]', interact: "click", realtime: true, toggle: 2.6, stay: 3.9, zoom: 1, label: "armour.vaibhavtomar.com" },
  "scroll-reveal": { site: ARMOUR, target: 'p[class*="flex-wrap"][class*="leading-[1.1]"]', interact: "scroll", seconds: 4.5, endAt: 0.12, label: "armour.vaibhavtomar.com" },
};
