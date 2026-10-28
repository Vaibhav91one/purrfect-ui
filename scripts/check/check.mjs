// pnpm check <slug|all> [--fast] [--rules] [--install]
// Static quality gate for a registry component (see scripts/check/rules.mjs). Exits 1 on any FAIL.
// Also runs eslint on the component's folder and one project-wide tsc (skip both with --fast).
// A deliberate exception is a comment on the same or previous line: check-ignore: <rule-id> <reason>
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { RULES } from "./rules.mjs";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const target = args.find((a) => !a.startsWith("--")) ?? "all";
const BUDGET_GZIP = 6 * 1024; // bytes; one const to tune

const color = (c, s) => (process.stdout.isTTY ? `\x1b[${c}m${s}\x1b[0m` : s);
const red = (s) => color(31, s);
const yellow = (s) => color(33, s);
const green = (s) => color(32, s);
const dim = (s) => color(2, s);

if (flags.has("--rules")) {
  for (const r of RULES) console.log(`${r.level.padEnd(4)} ${r.id.padEnd(22)} ${r.why}`);
  process.exit(0);
}

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const items = registry.items;
const slugs = target === "all" ? items.map((i) => i.name) : [target];
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");
const compData = read("lib/components-data.ts");
const compDocs = read("lib/component-docs.ts");
const demos = read("components/gallery/demos/demos.tsx");

const sh = (cmd, a) => spawnSync(cmd, a, { encoding: "utf8" });
let fails = 0;
let warns = 0;

// `check-ignore: <id>` on the finding's line or the one above
const ignored = (src, line, id) => {
  const L = src.split("\n");
  return [L[line - 1], L[line - 2]].some((l) => l && new RegExp(`check-ignore:\\s*${id}\\b`).test(l));
};

for (const slug of slugs) {
  const item = items.find((i) => i.name === slug);
  if (!item) {
    console.log(red(`✗ ${slug}: not in registry.json`));
    fails++;
    continue;
  }
  const file = item.files[0].path;
  const src = read(file);
  console.log(`\n${slug} ${dim(file)}`);
  const findings = [];

  for (const rule of RULES) {
    for (const f of rule.run({ src, item, slug })) {
      if (ignored(src, f.line, rule.id)) continue;
      findings.push({ ...f, id: rule.id, level: rule.level, why: rule.why });
    }
  }

  // registry completeness: the five places a component lives
  if (!new RegExp(`item\\(\\s*["']${slug}["']`).test(compData)) findings.push({ line: 0, id: "registry-complete", level: "FAIL", msg: "no item() line in lib/components-data.ts", why: "The gallery needs a card for it." });
  if (!new RegExp(`["']?${slug.replace("-", "\\-")}["']?\\s*:\\s*\\{`).test(compDocs)) findings.push({ line: 0, id: "registry-complete", level: "FAIL", msg: "no DOCS entry in lib/component-docs.ts", why: "The Usage tab and the copied prompt read it." });
  else {
    const block = compDocs.slice(compDocs.search(new RegExp(`["']?${slug.replace("-", "\\-")}["']?\\s*:\\s*\\{`)));
    if (!/Reduced motion/i.test(block.slice(0, 2500))) findings.push({ line: 0, id: "docs-reduced-motion", level: "WARN", msg: "docs behaviors do not mention reduced motion", why: "Document what happens under prefers-reduced-motion." });
  }
  if (!new RegExp(`["']?${slug.replace("-", "\\-")}["']?\\s*:`).test(demos) && !existsSync(`registry/${slug}/demo.tsx`)) findings.push({ line: 0, id: "registry-complete", level: "FAIL", msg: "no demo (DEMOS entry or registry/<slug>/demo.tsx)", why: "The gallery card and dialog need something to show." });

  // size
  const gz = gzipSync(src).length;
  if (gz > BUDGET_GZIP) findings.push({ line: 0, id: "size", level: "WARN", msg: `${(gz / 1024).toFixed(1)} KB gzip (budget ${BUDGET_GZIP / 1024} KB)`, why: "Every component is copied into the user's project; keep it lean." });

  if (!flags.has("--fast")) {
    const r = sh("pnpm", ["exec", "eslint", `registry/${slug}`]);
    if (r.status !== 0) findings.push({ line: 0, id: "eslint", level: "FAIL", msg: (r.stdout || r.stderr).trim().split("\n").slice(0, 6).join(" | "), why: "eslint must be clean." });
  }

  const sortKey = (f) => (f.level === "FAIL" ? 0 : 1);
  findings.sort((a, b) => sortKey(a) - sortKey(b) || a.line - b.line);
  for (const f of findings) {
    const tag = f.level === "FAIL" ? red("FAIL") : yellow("WARN");
    console.log(`  ${tag} ${f.id.padEnd(22)} ${f.line ? `${file}:${f.line}` : ""} ${f.msg}`);
    if (f.level === "FAIL") fails++;
    else warns++;
  }
  if (!findings.length) console.log(`  ${green("PASS")} ${dim(`${(gz / 1024).toFixed(1)} KB gzip`)}`);
  else console.log(dim(`  ${(gz / 1024).toFixed(1)} KB gzip`));
}

if (!flags.has("--fast")) {
  const r = sh("pnpm", ["exec", "tsc", "--noEmit"]);
  if (r.status !== 0) {
    console.log(`\n${red("FAIL")} tsc\n${(r.stdout || r.stderr).trim().split("\n").slice(0, 8).join("\n")}`);
    fails++;
  }
}

if (flags.has("--install") && target !== "all") {
  const r = spawnSync("node", ["scripts/check/install-smoke.mjs", target], { stdio: "inherit" });
  if (r.status !== 0) fails++;
}

console.log(`\n${fails ? red(`${fails} FAIL`) : green("0 FAIL")}, ${warns ? yellow(`${warns} WARN`) : "0 WARN"}  ${dim("(pnpm check --rules lists every rule; silence a deliberate exception with `check-ignore: <rule-id> <reason>`)")}`);
process.exit(fails ? 1 : 0);
