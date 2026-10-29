import Link from "next/link";
import { ProsePage } from "@/components/sections/prose-page";
import { DEFAULT_OG } from "@/lib/site";

const DESCRIPTION = "New components and changes to purrfect ui, newest first.";

export const metadata = {
  title: "Changelog",
  description: DESCRIPTION,
  alternates: { canonical: "/changelog" },
  openGraph: { title: "Changelog · purrfect ui", description: DESCRIPTION, url: "/changelog", type: "website", images: [DEFAULT_OG] },
  twitter: { card: "summary_large_image", title: "Changelog · purrfect ui", description: DESCRIPTION, images: [DEFAULT_OG.url] },
};

// newest first; add an entry when a component ships
const ENTRIES = [
  { date: "2026-10-29", title: "Docs, changelog and categories", items: ["Install docs, this changelog and an about page.", "A page per category: Input, Navigation, Layout, Display, Text."] },
  {
    date: "2026-10-28",
    title: "purrfectui.com is live",
    items: ["New: Toggle, Counter and Tabs.", "Eleven components installable with the shadcn CLI: Button, Magnetic, Notch, Hero reveal, Layered menu, Toggle, Counter, Tabs, Scroll reveal, Parallax columns, Path carousel.", "A page per component with a live preview, props and source."],
  },
];

const format = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export default function ChangelogPage() {
  return (
    <ProsePage title="Changelog" intro="New components and changes, newest first.">
      {ENTRIES.map((e) => (
        <section key={e.date}>
          <time dateTime={e.date} className="text-sm">
            {format(e.date)}
          </time>
          <h2 className="mt-1">{e.title}</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            {e.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </section>
      ))}
      <p>
        See them all on <Link href="/components">the components page</Link>.
      </p>
    </ProsePage>
  );
}
