import { LOVED } from "@/lib/home-data";
import { sectionBaseClasses } from "@/lib/layout-classes";

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2);

export function LovedSection() {
  return (
    <section id="loved" className={`${sectionBaseClasses} scroll-mt-24 px-6 py-20 md:px-8 lg:px-12`}>
      <h2 className="text-4xl font-light tracking-tight md:text-5xl">Loved by the people who ship</h2>
      <p className="mt-3 text-muted-foreground">What builders say about purrfect ui.</p>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LOVED.map((p) => (
          <figure key={p.handle} className="m-0 flex flex-col justify-between gap-6 rounded-3xl bg-card p-6">
            <blockquote className="m-0 text-lg leading-snug [overflow-wrap:anywhere]">{p.quote}</blockquote>
            <figcaption className="flex min-w-0 items-center gap-3">
              {/* initials stand in until real photos are supplied */}
              <span
                aria-hidden
                style={{ background: `linear-gradient(135deg, hsl(${p.hue} 70% 55%), hsl(${p.hue + 50} 70% 38%))` }}
                className="grid size-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
              >
                {initials(p.name)}
              </span>
              <span className="grid min-w-0">
                <b className="text-sm font-medium">{p.name}</b>
                <small className="truncate text-muted-foreground">
                  {p.handle} · {p.role}
                </small>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
