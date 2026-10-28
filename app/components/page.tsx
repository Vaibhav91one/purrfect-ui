import { ComponentsExplorer } from "@/components/gallery/components-explorer";
import { FooterSection, Navbar } from "@/components/sections";
import { COMPONENTS } from "@/lib/components-data";
import { containerClasses } from "@/lib/layout-classes";
import { DEFAULT_OG } from "@/lib/site";

const DESCRIPTION = `${COMPONENTS.length} animated React components with live previews, props and source. Install each with the shadcn CLI or copy the file.`;

export const metadata = {
  title: "Components",
  description: DESCRIPTION,
  alternates: { canonical: "/components" },
  openGraph: { title: "Components · purrfect ui", description: DESCRIPTION, url: "/components", type: "website", images: [DEFAULT_OG] },
  twitter: { card: "summary_large_image", title: "Components · purrfect ui", description: DESCRIPTION, images: [DEFAULT_OG.url] },
};

export default function ComponentsPage() {
  return (
    <>
      <Navbar />
      <main className={`flex flex-1 flex-col ${containerClasses}`}>
        <ComponentsExplorer />
        <FooterSection />
      </main>
    </>
  );
}
