import { ComponentsSection, FooterSection, HeroSection, Navbar } from "@/components/sections";
import { containerClasses } from "@/lib/layout-classes";
import { SITE_URL } from "@/lib/site";

const ld = { "@context": "https://schema.org", "@type": "WebSite", name: "purrfect ui", url: SITE_URL };

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Navbar />
      <main className={`flex flex-1 flex-col ${containerClasses}`}>
        <HeroSection />
        <ComponentsSection />
        <FooterSection />
      </main>
    </>
  );
}
