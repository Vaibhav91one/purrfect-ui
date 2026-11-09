// Prepares today's X post: opens the compose intent with the caption and link, and reveals the clip in Finder.
// You attach the mp4 and press Post. Nothing here talks to X. State: ~/.purrfectui-x.json.
//   node scripts/x/today.mjs [--dry] [--slug <slug>] [--launch] [--list]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { LAUNCH, POSTS, text } from "./posts.mjs";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const STATE = join(homedir(), ".purrfectui-x.json");
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const forced = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;

const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : { posted: [] };
const done = new Set(state.posted.map((p) => p.slug));
const notify = (msg) => execFileSync("osascript", ["-e", `display notification ${JSON.stringify(msg)} with title "purrfect ui"`]);

if (args.includes("--list")) {
  console.log(`posted ${done.size}, remaining ${POSTS.filter((p) => !done.has(p.slug)).length} of ${POSTS.length}`);
  for (const p of state.posted) console.log(`  ${p.date}  ${p.slug}`);
  process.exit(0);
}

const post =
  args.includes("--launch") ? LAUNCH
  : forced ? POSTS.find((p) => p.slug === forced)
  : POSTS.find((p) => !done.has(p.slug));
if (forced && !post) {
  console.error(`no post for "${forced}"`);
  process.exit(1);
}
if (!post) {
  console.log("Every component has been posted.");
  if (!dry) notify("Every component has been posted.");
  process.exit(0);
}

const launch = post === LAUNCH;
const body = launch ? post.caption : text(post);
const url = `https://x.com/intent/post?text=${encodeURIComponent(body)}`;
const clip = post.clip ?? join(ROOT, "public/previews", `${post.slug}.mp4`);
console.log(`${post.slug}\n\n${body}\n\n${url}\n${clip}`);
if (dry) process.exit(0);

execFileSync("open", [url]);
if (existsSync(clip)) execFileSync("open", ["-R", clip]);
else console.warn(`missing clip: ${clip}${launch ? " (run pnpm x:montage)" : ""}`);
const date = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
state.posted.push({ slug: post.slug, date });
writeFileSync(STATE, JSON.stringify(state, null, 2) + "\n");
notify(`Today's post: ${post.slug}. Attach the clip and press Post.`);
