import { ProsePage } from "@/components/sections/prose-page";
import { DEFAULT_OG, GITHUB_URL } from "@/lib/site";

const DESCRIPTION = "purrfect ui is a free, open-source shadcn registry of animated React components with sound, built by Vaibhav Tomar from his own projects.";

export const metadata = {
  title: "About",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: "About · purrfect ui", description: DESCRIPTION, url: "/about", type: "website", images: [DEFAULT_OG] },
  twitter: { card: "summary_large_image", title: "About · purrfect ui", description: DESCRIPTION, images: [DEFAULT_OG.url] },
};

export default function AboutPage() {
  return (
    <ProsePage title="About" intro="UI that purrs: React components that wiggle, stretch and snap back, with a sound for every click.">
      <section>
        <h2>What it is</h2>
        <p>
          purrfect ui is a free, open-source <a href="https://ui.shadcn.com/docs/registry">shadcn registry</a> built with Next.js, Tailwind CSS, TypeScript and Motion. Every component is one file you install into your own codebase, so there is no package to keep up with and nothing you can&apos;t restyle.
        </p>
      </section>
      <section>
        <h2>Where the components come from</h2>
        <p>They are pulled out of real projects (Poinu, Mapinly, Bountydesk and my portfolio), then cleaned up, given a sound cue and a reduced-motion fallback, and stress-tested with worst-case data before they ship.</p>
      </section>
      <section>
        <h2>Who builds it</h2>
        <p>
          <a href="https://vaibhavtomar.com">Vaibhav Tomar</a>. Say hi on <a href="https://x.com/VrsatileVaibhav">X</a>, or open an issue or a pull request on <a href={GITHUB_URL}>GitHub</a>. The code is MIT licensed.
        </p>
      </section>
      <section>
        <h2>The cat</h2>
        <p>The mascot is a gradient cat whose head follows your cursor. It sits in the hero and in the notch, where it changes colour every time it ducks out and comes back.</p>
      </section>
    </ProsePage>
  );
}
