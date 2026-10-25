import { sectionClasses, sectionInnerClasses } from "@/lib/layout-classes";

export function ComponentsSection() {
  return (
    <section id="components" className={sectionClasses}>
      <div className={sectionInnerClasses}>
        <span className="text-sm uppercase tracking-wider text-muted-foreground">Components</span>
      </div>
    </section>
  );
}
