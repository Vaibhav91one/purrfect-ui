// Builds the launch reel (~/Movies/purrfectui-launch.mp4, not committed) from the HyperFrames project in
// scripts/x/launch-reel: copies the site clips it cuts from, renders the cuelume cues, then renders the video.
//   pnpm x:montage
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const REEL = join(ROOT, "scripts/x/launch-reel");
const OUT = join(homedir(), "Movies/purrfectui-launch.mp4");
const run = (cmd, args, cwd = ROOT) => execFileSync("nice", ["-n", "15", cmd, ...args], { cwd, stdio: "inherit" });

// the clips index.html cuts from (assets/clips is gitignored)
mkdirSync(join(REEL, "assets/clips"), { recursive: true });
for (const [, slug] of readFileSync(join(REEL, "index.html"), "utf8").matchAll(/assets\/clips\/([\w-]+)\.mp4/g))
  copyFileSync(join(ROOT, "public/previews", `${slug}.mp4`), join(REEL, "assets/clips", `${slug}.mp4`));

run("node", [join(REEL, "render-cues.mjs")]);
const raw = join(REEL, "renders/reel.mp4");
run("npx", ["--yes", "hyperframes@0.9.9", "render", "--quality", "delivery", "--fps", "60", "--workers", "2", "--skill", "hyperframes", "-o", raw], REEL);
// X wants the moov atom up front and a tagged tv range; the streams are copied untouched
run("ffmpeg", ["-v", "error", "-y", "-i", raw, "-c", "copy", "-color_range", "tv", "-movflags", "+faststart", OUT]);
console.log(OUT);
