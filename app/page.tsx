import { ComponentsSection, FooterSection, HeroSection, Navbar } from "@/components/sections";
import { containerClasses } from "@/lib/layout-classes";
import { GITHUB_URL, SITE_URL } from "@/lib/site";

// one graph so Google ties the site, the repo and the author's profiles together (and stops mixing it up with other "purrfect ui"s)
const author = { "@type": "Person", "@id": `${SITE_URL}/#author`, name: "Vaibhav Tomar", url: "https://github.com/Vaibhav91one", sameAs: ["https://x.com/VrsatileVaibhav", "https://github.com/Vaibhav91one"] };
const ld = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "purrfect ui", alternateName: "purrfectui", url: SITE_URL, description: "React components that wiggle, stretch and snap back, with sound. Install with the shadcn CLI.", publisher: { "@id": author["@id"] }, author: { "@id": author["@id"] } },
    author,
    { "@type": "SoftwareSourceCode", name: "purrfect ui", url: SITE_URL, codeRepository: GITHUB_URL, programmingLanguage: "TypeScript", license: "https://opensource.org/license/mit", author: { "@id": author["@id"] } },
  ],
};

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
