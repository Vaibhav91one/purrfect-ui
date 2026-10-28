// node scripts/check/install-smoke.mjs <slug> [--base http://localhost:3120]   (or: pnpm check <slug> --install)
// Proves a component installs into a project that is not this repo: scaffolds a throwaway Next app in the OS temp dir,
// `shadcn add`s the component from the running dev server's /r/<slug>.json, imports it, then tsc + next build.
// Hermetic: pnpm cache and store live in the temp dir too. Slow (a few minutes, needs network). Run `pnpm registry:build` first and keep `pnpm dev -p 3120` up.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const baseAt = args.indexOf("--base");
const base = baseAt >= 0 ? args.splice(baseAt, 2)[1] : "http://localhost:3120";
const slug = args[0];
if (!slug) throw new Error("usage: node scripts/check/install-smoke.mjs <slug>");
if (!existsSync(`public/r/${slug}.json`)) throw new Error(`public/r/${slug}.json missing: run pnpm registry:build`);

const dir = mkdtempSync(path.join(tmpdir(), `install-${slug}-`));
const step = (label, cmd, a, cwd = dir) => {
  process.stdout.write(`  ${label} ... `);
  const t = Date.now();
  const r = spawnSync(cmd, a, { cwd, encoding: "utf8", env: { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1", XDG_CACHE_HOME: path.join(dir, ".cache"), npm_config_store_dir: path.join(dir, ".store") } });
  if (r.status !== 0) {
    console.log("FAIL");
    console.log((r.stdout + r.stderr).trim().split("\n").slice(-25).join("\n"));
    throw new Error(`${label} failed (temp project kept at ${dir})`);
  }
  console.log(`ok ${((Date.now() - t) / 1000).toFixed(0)}s`);
  return r.stdout;
};

try {
  console.log(`install smoke: ${slug} from ${base} into ${dir}`);
  step("create-next-app", "pnpm", ["dlx", "create-next-app@latest", "app", "--ts", "--tailwind", "--app", "--no-eslint", "--no-src-dir", "--import-alias", "@/*", "--use-pnpm", "--disable-git", "--yes"]);
  const app = path.join(dir, "app");
  step("shadcn init", "pnpm", ["dlx", "shadcn@latest", "init", "-d", "-y"], app);
  step("shadcn add", "pnpm", ["dlx", "shadcn@latest", "add", `${base}/r/${slug}.json`, "-y", "-o"], app);
  const installed = existsSync(path.join(app, "components/ui")) ? readdirSync(path.join(app, "components/ui")) : [];
  if (!installed.some((f) => f.startsWith(slug))) throw new Error(`components/ui has no ${slug}* file after add: ${installed.join(", ")}`);
  writeFileSync(path.join(app, "app/page.tsx"), `import * as M from "@/components/ui/${slug}";\nexport default function Page() {\n  return <pre>{Object.keys(M).join(",")}</pre>;\n}\n`);
  step("tsc", "pnpm", ["exec", "tsc", "--noEmit"], app);
  step("next build", "pnpm", ["exec", "next", "build"], app);
  console.log(`PASS ${slug} installs and builds in a fresh Next app (installed: ${installed.filter((f) => f.startsWith(slug)).join(", ")})`);
  rmSync(dir, { recursive: true, force: true });
} catch (e) {
  console.error(String(e.message ?? e));
  process.exit(1);
}
