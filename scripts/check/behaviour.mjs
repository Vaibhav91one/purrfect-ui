// pnpm check:behaviour [--base http://localhost:3120]
// Interaction contracts on the /dev fixtures (keep `pnpm dev -p 3120` up; needs Chrome): what a component promises in its
// docs (keys, focus, scroll, pointer tracking, lifecycle), checked in a real browser. Static rules can't see these; when a
// component's promise changes, change its check here.
import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const baseAt = args.indexOf("--base");
const base = baseAt >= 0 ? args.splice(baseAt, 2)[1] : "http://localhost:3120";
const b = await chromium.launch({ channel: "chrome", headless: true });

const open = async (q, reduce = false) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: reduce ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  p.errs = [];
  p.on("pageerror", (e) => p.errs.push(e.message));
  p.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && p.errs.push(m.text().slice(0, 200)));
  await p.addInitScript(() => {
    sessionStorage.setItem("purrfect-intro", "1"); // the site's intro would take every interaction
    localStorage.setItem("sound", "off");
  });
  await p.goto(`${base}/dev?${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  return p;
};
const done = async (p, name) => {
  assert.deepEqual(p.errs, [], `${name}: console errors`);
  console.log(`PASS ${name}`);
  await p.context().close();
};
const checks = {
  async "path-carousel"() {
    const p = await open("c=path-carousel&s=Demo");
    const cur = () => p.$eval("[aria-roledescription=carousel]", (r) => [...r.querySelectorAll("[data-cell]")].findIndex((e) => e.getAttribute("aria-current") === "true"));
    const y = () => p.evaluate(() => scrollY);
    await p.mouse.move(640, 100);
    await p.mouse.wheel(0, 300);
    await p.waitForTimeout(400);
    assert.ok((await y()) > 0, "the wheel scrolls the page outside the carousel");
    await p.$eval("[aria-roledescription=carousel]", (r) => r.scrollIntoView({ block: "center" }));
    await p.waitForTimeout(300);
    const c = await p.$eval("[aria-roledescription=carousel]", (r) => { const b = r.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; });
    const y0 = await y();
    await p.mouse.move(...c);
    await p.mouse.wheel(0, 120);
    await p.waitForTimeout(700);
    assert.equal(await y(), y0, "the wheel over it does not scroll the page");
    assert.equal(await cur(), 1, "the wheel over it rotates");
    await p.mouse.move(5, 5);
    await p.keyboard.press("ArrowDown");
    await p.waitForTimeout(400);
    assert.ok((await y()) > y0, "ArrowDown with focus elsewhere scrolls the page");
    assert.equal(await cur(), 1, "and does not rotate");
    await p.focus("[data-cell][aria-current=true]");
    await p.keyboard.press("ArrowRight");
    await p.waitForTimeout(500);
    assert.equal(await cur(), 2, "ArrowRight inside rotates");
    assert.equal(await p.evaluate(() => document.activeElement.getAttribute("aria-current")), "true", "focus follows the centred slide");
    assert.equal(await p.$eval("[aria-live]", (e) => e.textContent), "3 of 5", "the live region announces");
    assert.equal(await p.$$eval("[data-cell]", (els) => els.filter((e) => e.tabIndex === 0).length), 1, "one tab stop");
    await done(p, "path-carousel");
  },
  async "glide-tabs"() {
    const p = await open("c=glide-tabs&s=Worst+case");
    await p.focus('button[role=tab]:has-text("Enabled")');
    await p.keyboard.press("ArrowRight");
    assert.equal(await p.evaluate(() => document.activeElement.textContent), "Last", "skips the disabled tab");
    await p.keyboard.press("ArrowRight");
    assert.equal(await p.evaluate(() => document.activeElement.textContent), "Enabled", "wraps past disabled ones");
    await done(p, "glide-tabs");
  },
  async "layered-menu"() {
    const p = await open("c=layered-menu&s=One");
    const burger = "button[aria-expanded]";
    const expanded = () => p.$eval(burger, (e) => e.getAttribute("aria-expanded"));
    if ((await expanded()) === "false") await p.click(burger);
    await p.waitForTimeout(900);
    assert.equal(await expanded(), "true");
    await p.keyboard.press("Escape");
    await p.waitForTimeout(900);
    assert.equal(await expanded(), "false", "Escape closes it");
    assert.equal(await p.evaluate(() => document.activeElement.getAttribute("aria-expanded")), "false", "focus is back on the burger");
    await done(p, "layered-menu");
  },
  async displacement() {
    let p = await open("c=displacement&s=Demo");
    const gl = () => p.$$eval("canvas", (cs) => cs.filter((_, i) => i % 2 === 1).map((c) => c.style.opacity));
    assert.deepEqual(await gl(), ["1", "1"], "WebGL takes over the image and the painted canvas");
    const c = await p.$eval("[role=img]", (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    await p.mouse.move(c[0] - 100, c[1]);
    await p.mouse.move(c[0] + 100, c[1], { steps: 10 });
    await p.waitForTimeout(300);
    await done(p, "displacement");
    p = await open("c=displacement&s=Demo", true);
    assert.deepEqual(await gl(), ["0", "0"], "reduced motion leaves the plain image");
    await done(p, "displacement / reduced");
  },
  async "hover-preview"() {
    const p = await open("c=hover-preview&s=Demo");
    const card = () => p.$eval("[aria-hidden] > div.overflow-hidden", (e) => ({ o: +getComputedStyle(e).opacity, r: e.getBoundingClientRect(), strip: e.firstElementChild?.style.transform ?? "" }));
    const row = await (await p.$$("li a"))[1].boundingBox();
    const at = [row.x + 300, row.y + row.height / 2];
    await p.mouse.move(...at, { steps: 4 });
    await p.waitForTimeout(900);
    const c = await card();
    assert.ok(c.o > 0.95, "hover opens it");
    assert.equal(c.strip, "translateY(-100%)", "it shows the hovered row's preview");
    assert.ok(Math.abs(c.r.x + c.r.width / 2 - at[0]) < 6 && Math.abs(c.r.y + c.r.height / 2 - at[1]) < 6, "the card settles on the pointer (list coordinates, not page)");
    await p.mouse.move(5, 5, { steps: 3 });
    await p.waitForTimeout(500);
    assert.ok((await card()).o < 0.05, "leaving closes it");
    for (let i = 0; i < 40 && !(await p.evaluate(() => document.activeElement?.closest("li"))); i++) await p.keyboard.press("Tab");
    await p.waitForTimeout(500);
    assert.ok((await card()).o > 0.95, "keyboard focus opens it");
    await done(p, "hover-preview");
  },
  async "scroll-marquee"() {
    const p = await open("c=scroll-marquee&s=Demo");
    const x = () => p.$eval(".w-max", (e) => new DOMMatrix(getComputedStyle(e).transform).m41);
    const drift = async () => { const a = await x(); await p.waitForTimeout(400); return (await x()) - a; };
    await p.mouse.move(640, 400);
    await p.mouse.wheel(0, 60); // small: the fixture's marquee must stay on screen, or it rightly pauses
    await p.waitForTimeout(200);
    assert.ok((await drift()) < -10, "scrolling down runs it left");
    await p.mouse.wheel(0, -60);
    await p.waitForTimeout(200);
    assert.ok((await drift()) > 10, "scrolling up runs it right");
    await done(p, "scroll-marquee");
  },
  async preloader() {
    let p = await open("c=preloader&s=Demo");
    const n = () => p.$$eval("[data-preloader]", (e) => e.length);
    assert.equal(await n(), 1, "it covers on load");
    await p.waitForTimeout(3600);
    assert.equal(await n(), 0, "it lifts and unmounts after the words");
    await done(p, "preloader");
    p = await open("c=preloader&s=Demo");
    await p.keyboard.press("Escape");
    await p.waitForTimeout(1300);
    assert.equal(await n(), 0, "Escape skips it");
    await done(p, "preloader / skip");
  },
  async "fill-button"() {
    const p = await open("c=fill-button&s=Demo");
    const bb = await (await p.$("button")).boundingBox();
    const st = () => p.$eval("button [data-state]", (e) => e.dataset.state);
    await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); // the centre: a pill's corners are outside its hit area
    await p.waitForTimeout(400);
    assert.equal(await st(), "in", "hover sweeps it in");
    await p.mouse.move(bb.x + bb.width + 50, bb.y);
    await p.waitForTimeout(600);
    assert.equal(await st(), "idle", "leave sweeps it out and resets");
    await done(p, "fill-button");
  },
  async "cursor-follower"() {
    const p = await open("c=cursor-follower&s=Demo");
    const dot = () => p.$eval("div.mix-blend-difference", (e) => ({ o: +getComputedStyle(e).opacity, r: e.getBoundingClientRect() }));
    await p.mouse.move(400, 300);
    await p.mouse.move(420, 310, { steps: 3 });
    await p.waitForTimeout(500);
    const d = await dot();
    assert.ok(d.o > 0.95 && Math.abs(d.r.x + d.r.width / 2 - 420) < 3, "it appears on the pointer");
    const zone = await (await p.$("[data-cursor-scale]")).boundingBox();
    await p.mouse.move(zone.x + 40, zone.y + 40, { steps: 3 });
    await p.waitForTimeout(600);
    assert.ok((await dot()).r.width > 50, "data-cursor-scale grows it");
    await done(p, "cursor-follower");
  },
};

let fails = 0;
for (const [name, run] of Object.entries(checks)) {
  try {
    await run();
  } catch (e) {
    fails++;
    console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`);
  }
}
await b.close();
console.log(fails ? `\n${fails} FAIL` : "\n0 FAIL");
process.exit(fails ? 1 : 0);
