import { MoreCta } from "@/components/gallery/more-cta";
import { CompassTile } from "@/components/gallery/compass-tile";
import { CardLink } from "@/components/gallery/card-link";
import { SheetHost } from "@/components/gallery/use-sheet";
import { COMPONENTS } from "@/lib/components-data";
import { cardBase } from "@/components/gallery/card";
import { sectionBaseClasses } from "@/lib/layout-classes";
import { ParallaxColumns } from "@/registry/parallax-columns/parallax-columns";
import { ScrollReveal } from "@/registry/scroll-reveal/scroll-reveal";

const card = `${cardBase} block`;

export function ComponentsSection() {
  // deal the first cards out to columns, the "view all" tile closing the last one. Three columns from sm up (8 cards, three rows);
  // on a phone two wider ones (7 cards, four rows), where three would be 114px tiles with demos too small to read.
  // Both sets are in the HTML and CSS shows one: the hidden one is never in view, so its demos never mount.
  const deal = (n: number, count: number) => {
    const cols: React.ReactNode[][] = Array.from({ length: n }, () => []);
    COMPONENTS.slice(0, count).forEach((c, i) => cols[i % n].push(<CardLink key={c.slug} item={c} className={card} />));
    cols[n - 1].push(<CompassTile key="all" count={COMPONENTS.length} />);
    return cols;
  };
  return (
    <section id="components" className={`${sectionBaseClasses} scroll-mt-24 px-3 pb-20 md:px-0`}>
      {/* a full screen for the heading; the fill finishes as the text reaches the centre */}
      <div className="grid min-h-svh place-items-center px-6 md:px-8">
        <ScrollReveal text={`${COMPONENTS.length} interactive components, each one a single file you can open, tweak and copy.`} className="mx-auto max-w-5xl text-center text-4xl font-light tracking-tight md:text-6xl" />
      </div>
      <div className="relative -mt-[calc(50svh-10.5rem)]">
        <ParallaxColumns columns={deal(2, 7)} speeds={[0.12, 0.2]} className="sm:hidden" />
        <ParallaxColumns columns={deal(3, 8)} speeds={[0.12, 0.22, 0.05]} className="hidden sm:block" />
        {/* the grid fades into the page; the tokens keep it right in light and dark */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-linear-to-t from-background via-background/60 to-transparent" />
      </div>
      <MoreCta />
      <SheetHost />
    </section>
  );
}
