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
  // deal the components out to three columns; the "view all" tile closes the last one
  const cols: [React.ReactNode[], React.ReactNode[], React.ReactNode[]] = [[], [], []];
  COMPONENTS.forEach((c, i) =>
    cols[i % 3].push(
      <CardLink key={c.slug} item={c} className={card} />,
    ),
  );
  cols[2].push(<CompassTile key="all" count={COMPONENTS.length} />);
  return (
    <section id="components" className={`${sectionBaseClasses} scroll-mt-24 px-3 pb-20 md:px-0`}>
      {/* a full screen for the heading; the fill finishes as the text reaches the centre */}
      <div className="grid min-h-svh place-items-center px-6 md:px-8">
        <ScrollReveal text={`${COMPONENTS.length} interactive components. Each one is a single file. Open it, tweak it, copy it.`} className="mx-auto max-w-5xl text-center text-4xl font-light tracking-tight md:text-6xl" />
      </div>
      <div className="relative -mt-[calc(50svh-10.5rem)]">
        <ParallaxColumns columns={cols} speeds={[0.12, 0.22, 0.05]} />
        {/* the grid fades into the page; the tokens keep it right in light and dark */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-linear-to-t from-background via-background/60 to-transparent" />
      </div>
      <MoreCta />
      <SheetHost />
    </section>
  );
}
