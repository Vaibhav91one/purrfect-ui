import { sectionClasses, sectionInnerClasses } from "@/lib/layout-classes";

export function LovedSection() {
  return (
    <section id="loved" className={sectionClasses}>
      <div className={sectionInnerClasses}>
        <span className="text-sm uppercase tracking-wider text-muted-foreground">Loved</span>
      </div>
    </section>
  );
}
