import { sectionBaseClasses, sectionInnerClasses } from "@/lib/layout-classes";

// The footer is the one section that is not a full screen tall.
export function FooterSection() {
  return (
    <footer id="footer" className={`${sectionBaseClasses} min-h-[60svh]`}>
      <div className={sectionInnerClasses}>
        <span className="text-sm uppercase tracking-wider text-muted-foreground">Footer</span>
      </div>
    </footer>
  );
}
