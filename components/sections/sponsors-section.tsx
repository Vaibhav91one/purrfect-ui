import { sectionClasses, sectionInnerClasses } from "@/lib/layout-classes";

export function SponsorsSection() {
  return (
    <section id="sponsors" className={sectionClasses}>
      <div className={sectionInnerClasses}>
        <span className="text-sm uppercase tracking-wider text-muted-foreground">Sponsors</span>
      </div>
    </section>
  );
}
