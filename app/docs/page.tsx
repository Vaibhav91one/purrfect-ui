import Link from "next/link";
import { ProsePage, Snippet } from "@/components/sections/prose-page";
import { DEFAULT_OG, SITE_URL } from "@/lib/site";

const DESCRIPTION = "Install purrfect ui components with the shadcn CLI, the @purrfectui registry or by copying the source. Sound and reduced motion explained.";

export const metadata = {
  title: "Docs",
  description: DESCRIPTION,
  alternates: { canonical: "/docs" },
  openGraph: { title: "Docs · purrfect ui", description: DESCRIPTION, url: "/docs", type: "website", images: [DEFAULT_OG] },
  twitter: { card: "summary_large_image", title: "Docs · purrfect ui", description: DESCRIPTION, images: [DEFAULT_OG.url] },
};

export default function DocsPage() {
  return (
    <ProsePage title="Docs" intro="Every component is one file that lands in your codebase. No package to depend on: you own the code and restyle anything.">
      <section>
        <h2>Requirements</h2>
        <p>
          A React 19 app with Tailwind CSS 4 and shadcn set up (<code>npx shadcn@latest init</code>). Most components animate with <code>motion</code>; the CLI installs it for you when a component needs it.
        </p>
      </section>
      <section>
        <h2>Install with the shadcn CLI</h2>
        <p>Point the CLI at a component&apos;s registry file:</p>
        <Snippet code={`npx shadcn@latest add ${SITE_URL}/r/roll-button.json`} />
        <p className="mt-4">
          Swap <code>button</code> for any slug from <Link href="/components">the components page</Link>. Each component page has the command ready to copy, for npm, pnpm, yarn and bun.
        </p>
      </section>
      <section>
        <h2>Use the @purrfectui registry</h2>
        <p>
          Add the registry to <code>components.json</code> once:
        </p>
        <Snippet lang="typescript" code={`{\n  "registries": {\n    "@purrfectui": "${SITE_URL}/r/{name}.json"\n  }\n}`} />
        <p className="mt-4">Then install by name:</p>
        <Snippet code="npx shadcn@latest add @purrfectui/button" />
        <p className="mt-4">
          The same names work from the shadcn MCP server in Claude Code, Cursor or VS Code (<code>npx shadcn@latest mcp init --client claude</code>), then ask for <code>add @purrfectui/button</code>.
        </p>
      </section>
      <section>
        <h2>Copy the source</h2>
        <p>Prefer no CLI? Open a component, copy its file from the Code tab and drop it into your project. Install the dependency it imports, usually <code>motion</code>.</p>
      </section>
      <section>
        <h2>Sound</h2>
        <p>
          Components mark their clicks with <code>data-cuelume-*</code> attributes (<code>tap</code>, <code>toggle</code>, <code>open</code>, <code>navigate</code>...). Without a sound engine they stay silent. To hear them, add{" "}
          <a href="https://www.npmjs.com/package/cuelume">Cuelume</a> and bind it once on the client:
        </p>
        <Snippet lang="typescript" code={`import { bind } from "cuelume";\n\nbind(); // call once, in a client component`} />
        <p className="mt-4">Browsers block audio until the first click or key press, so the first cue plays after that.</p>
      </section>
      <section>
        <h2>Reduced motion</h2>
        <p>Every component honors <code>prefers-reduced-motion</code>: movement gets shorter and gentler instead of switching off.</p>
      </section>
    </ProsePage>
  );
}
