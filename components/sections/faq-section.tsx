import { sectionClasses, sectionInnerClasses } from "@/lib/layout-classes";

export function FaqSection() {
  return (
    <section id="faq" className={sectionClasses}>
      <div className={sectionInnerClasses}>
        <span className="text-sm uppercase tracking-wider text-muted-foreground">Faq</span>
      </div>
    </section>
  );
}
