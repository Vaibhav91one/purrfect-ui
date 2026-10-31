// pnpm check:perf <slug|all> [--base http://localhost:3120]
// Runtime gate on the worst-case fixtures (/dev?c=<slug>, so keep `pnpm dev -p 3120` up; needs Chrome).
// Per state, normal and reduced motion: wait for load to settle, then scroll the page down and back, sweep the mouse over
// it and Tab through it, and measure only that window. FAIL on a long task over the budget, layout shift, or any console
// error / uncaught exception. The budget is loose because dev builds of React are slow; the point is catching a component
// that blocks the main thread on scroll (a non-passive listener, a setState per frame), not timing a production bundle.
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const baseAt = args.indexOf("--base");
const base = baseAt >= 0 ? args.splice(baseAt, 2)[1] : "http://localhost:3120";
const target = args[0] ?? "all";
const slugs = target === "all" ? JSON.parse(readFileSync("registry.json", "utf8")).items.map((i) => i.name) : [target];
const STATES = ["Demo", "Worst case"]; // a missing state falls back to the fixture's first; a failed image load is a fixture state (hero-reveal), not an error
const LONG_TASK_MS = 100;
const CLS_MAX = 0.05;

// collects long tasks and unexpected layout shifts from the moment `__perf.reset()` is called
const OBSERVE = () => {
  localStorage.setItem("sound", "off"); // the site's hover cues start Web Audio on first hover: site chrome, not the component
  sessionStorage.setItem("purrfect-intro", "1"); // skip the site's "tap to enter" intro, or every interaction lands on it instead of the component
  const p = (window.__perf = { long: [], cls: 0, reset() { this.long = []; this.cls = 0; } });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => p.long.push(e.duration))).observe({ type: "longtask", buffered: false });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (p.cls += e.value))).observe({ type: "layout-shift", buffered: false });
};

// scroll the page down and back, page keys, a mouse sweep, Tab through it
const exercise = async (page) => {
  for (let i = 0; i < 24; i++) {
    await page.mouse.wheel(0, 160);
    await page.waitForTimeout(16);
  }
  for (let i = 0; i < 24; i++) {
    await page.mouse.wheel(0, -160);
    await page.waitForTimeout(16);
  }
  await page.keyboard.press("PageDown"); // keys must still scroll the page
  await page.keyboard.press("PageUp");
  for (let i = 0; i <= 20; i++) await page.mouse.move(100 + i * 50, 200 + (i % 5) * 80, { steps: 3 });
  for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
  await page.waitForTimeout(800);
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
let fails = 0;
try {
  // the first page to be exercised pays a one-off ~120ms task whatever the component (dev server and browser warming up): spend it here, unmeasured
  const warm = await browser.newPage();
  await warm.goto(`${base}/dev?c=${slugs[0]}`, { waitUntil: "networkidle" });
  await warm.waitForTimeout(1500);
  await exercise(warm);
  await warm.close();

  for (const slug of slugs) {
    for (const reduce of [false, true]) {
      for (const state of STATES) {
        const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: reduce ? "reduce" : "no-preference" });
        await ctx.addInitScript(OBSERVE);
        const page = await ctx.newPage();
        const errors = [];
        page.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && errors.push(m.text().slice(0, 160)));
        page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 160)));
        await page.goto(`${base}/dev?${new URLSearchParams({ c: slug, s: state })}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(1500); // entrances and hydration are not what is measured
        await page.evaluate(() => window.__perf.reset());

        await exercise(page);

        const { long, cls } = await page.evaluate(() => window.__perf);
        const worst = long.length ? Math.max(...long) : 0;
        const bad = [worst > LONG_TASK_MS && `long task ${worst.toFixed(0)}ms`, cls > CLS_MAX && `CLS ${cls.toFixed(3)}`, errors.length && `console: ${errors[0]}`].filter(Boolean);
        const tag = `${slug} / ${state}${reduce ? " / reduced" : ""}`;
        console.log(`${bad.length ? "FAIL" : "PASS"} ${tag.padEnd(42)} long tasks ${long.length} (max ${worst.toFixed(0)}ms), CLS ${cls.toFixed(3)}${bad.length ? `  <- ${bad.join("; ")}` : ""}`);
        if (bad.length) fails++;
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
}
console.log(fails ? `\n${fails} FAIL` : "\n0 FAIL");
process.exit(fails ? 1 : 0);
