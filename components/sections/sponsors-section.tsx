import { GITHUB_URL } from "@/lib/site";
import { SPONSORS } from "@/lib/home-data";
import { sectionBaseClasses } from "@/lib/layout-classes";

const logo = "flex h-20 flex-col items-center justify-center gap-0.5 rounded-2xl bg-card text-sm";

export function SponsorsSection() {
  return (
    <section id="sponsors" className={`${sectionBaseClasses} scroll-mt-24 px-6 py-20 md:px-8 lg:px-12`}>
      <h2 className="text-4xl font-light tracking-tight md:text-5xl">Backed and supported by the finest</h2>
      <p className="mt-3 text-muted-foreground">Thanks to the people keeping purrfect ui free.</p>
      {Object.entries(SPONSORS).map(([tier, list]) => (
        <div key={tier}>
          <h3 className="mt-9 mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">{tier}</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {list.map((s) => (
              <div key={s.name} className={logo}>
                {s.name}
                {"note" in s && <small className="text-xs text-muted-foreground">{s.note}</small>}
              </div>
            ))}
            {tier === "Platform" && (
              <a href={GITHUB_URL} className={`${logo} border border-dashed border-border bg-transparent text-muted-foreground focus-visible:outline-2 focus-visible:outline-accent`}>
                Your logo here
              </a>
            )}
          </div>
        </div>
      ))}
      <a href={GITHUB_URL} className="mt-9 inline-flex h-12 items-center self-start rounded-full bg-accent px-6 text-[15px] font-medium text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
        Become a sponsor
      </a>
    </section>
  );
}
