// pnpm check:budget [--base http://localhost:3000]
// Page-weight gate against a PRODUCTION server (`pnpm build && pnpm start`; needs Chrome). Per route: the gzipped size of every
// JS chunk its HTML references (script tags and the RSC payload), FAIL over the budget. Then /components in a real browser,
// scrolled top to bottom: FAIL on a long task over LONG_TASK_MS (after the first second) or CLS over CLS_MAX.
import { gzipSync } from "node:zlib";
import { chromium } from "playwright-core";

// Budgets in gzipped KB: the 2026-11-01 baseline (388 KB on all three routes) plus ~10% headroom.
// measured after the lazy grid (2026-11-01): 280 KB gzip on each route; budgets are that + 10%. Tighten again when a route gets lighter.
const BUDGET_KB = { "/": 310, "/components": 310, "/components/category/*": 310 };
const LONG_TASK_MS = 200;
const CLS_MAX = 0.05;

const args = process.argv.slice(2);
const baseAt = args.indexOf("--base");
const base = baseAt >= 0 ? args[baseAt + 1] : "http://localhost:3000";
const get = async (path) => {
  const r = await fetch(base + path);
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
};

let fails = 0;
const line = (ok, tag, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${tag.padEnd(42)} ${detail}`);
  if (!ok) fails++;
};

const components = String(await get("/components"));
const category = components.match(/href="(\/components\/category\/[^"]+)"/)?.[1];
if (!category) throw new Error("no category link on /components");
for (const [route, path] of [["/", "/"], ["/components", "/components"], ["/components/category/*", category]]) {
  const html = route === "/components" ? components : String(await get(path));
  const chunks = [...new Set(html.match(/\/_next\/static\/[^"'\\\s]+\.js/g))];
  const kb = (await Promise.all(chunks.map(async (c) => gzipSync(await get(c)).length))).reduce((a, b) => a + b, 0) / 1024;
  line(kb <= BUDGET_KB[route], path, `${chunks.length} chunks, ${kb.toFixed(1)} KB gzip (budget ${BUDGET_KB[route]} KB)`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => {
    localStorage.setItem("sound", "off");
    sessionStorage.setItem("purrfect-intro", "1"); // skip the site's "tap to enter" intro
    const p = (window.__perf = { long: [], cls: 0 });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => e.startTime > 1000 && p.long.push(e.duration))).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (p.cls += e.value))).observe({ type: "layout-shift", buffered: true });
  });
  const page = await ctx.newPage();
  await page.goto(`${base}/components`, { waitUntil: "networkidle" });
  while (await page.evaluate(() => innerHeight + scrollY < document.documentElement.scrollHeight - 2)) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(800);
  const { long, cls } = await page.evaluate(() => window.__perf);
  const worst = long.length ? Math.max(...long) : 0;
  line(worst <= LONG_TASK_MS && cls <= CLS_MAX, "/components scroll", `long tasks ${long.length} (max ${worst.toFixed(0)}ms, budget ${LONG_TASK_MS}), CLS ${cls.toFixed(3)} (budget ${CLS_MAX})`);
} finally {
  await browser.close();
}
console.log(fails ? `\n${fails} FAIL` : "\n0 FAIL");
process.exit(fails ? 1 : 0);
