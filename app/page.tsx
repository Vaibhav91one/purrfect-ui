import { ComponentsSection, FaqSection, FooterSection, HeroSection, LovedSection, Navbar, SponsorsSection } from "@/components/sections";
import { containerClasses } from "@/lib/layout-classes";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className={`flex flex-1 flex-col ${containerClasses}`}>
        <HeroSection />
        <ComponentsSection />
        <LovedSection />
        <SponsorsSection />
        <FaqSection />
        <FooterSection />
      </main>
    </>
  );
}
