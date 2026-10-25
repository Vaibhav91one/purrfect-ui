import { sectionClasses, sectionInnerClasses } from "@/lib/layout-classes";

export function HeroSection() {
  return (
    <section id="hero" className={sectionClasses}>
      <div className={sectionInnerClasses}>
        <span className="text-sm uppercase tracking-wider text-muted-foreground">Hero</span>
      </div>
    </section>
  );
}
