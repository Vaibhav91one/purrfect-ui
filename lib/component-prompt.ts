import type { ComponentItem } from "./components-data";
import { DOCS } from "./component-docs";

/** The "Copy prompt" text: a self-contained brief a user pastes into an AI coding agent to set the component up. */
export function buildPrompt(item: ComponentItem): string {
  const doc = DOCS[item.slug];
  const out = [
    `Add the "${item.name}" component from purrfect ui to this project.`,
    "",
    item.description,
    "",
    "Steps:",
    "1. Check the stack. This needs React 18 or newer, Tailwind CSS 4 and the shadcn CLI setup (a components.json at the project root). If components.json is missing, run `npx shadcn@latest init` first and accept the defaults.",
    "2. Install it (this copies the file into the project and installs its dependencies):",
    `   ${item.install}`,
    "   Do not edit the copied file unless I ask.",
  ];
  let n = 3;
  if (doc?.usage) out.push(`${n++}. Use it like this:`, ...doc.usage.split("\n").map((l) => `   ${l}`));
  if (doc?.props?.length) {
    out.push(`${n++}. Props:`);
    doc.props.forEach((p) => out.push(`   - ${p.name}: ${p.type}${p.default ? ` (default ${p.default})` : ""}. ${p.description}`));
  }
  if (doc?.behaviors.length) {
    out.push(`${n++}. Behaviour to keep:`);
    doc.behaviors.forEach((b) => out.push(`   - ${b}`));
  }
  out.push(
    `${n++}. Sound is optional. Cues play through Cuelume, only if the project mounts it. Leave the component silent unless I ask for sound.`,
    "",
    "When done, tell me which file was added, show one usage example, and flag anything that clashed with my setup (Tailwind version, the `@/` import alias, React version).",
  );
  return out.join("\n");
}
